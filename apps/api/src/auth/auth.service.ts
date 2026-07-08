import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import crypto from 'crypto';
import axios from 'axios';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import type { JwtPayload } from './types/jwt-payload.interface';
import { VerificationStatus, NotificationType, UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  private brevoApiKey: string;
  private brevoApiUrl = 'https://api.brevo.com/v3';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {
    this.brevoApiKey = this.config.get<string>('BREVO_API_KEY', '');
  }

  /**
   * Register a new user
   */
  async register(dto: RegisterDto) {
    try {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          firstName: dto.firstName,
          lastName: dto.lastName,
          passwordHash,
          role: dto.role || UserRole.JOBSEEKER,
          phone: dto.phone,
        },
      });

      let companyName: string | undefined = dto.companyName;
      let companySlug: string | undefined;

      if (dto.role === 'EMPLOYER' && dto.companyName) {
        try {
          const company = await this.prisma.company.create({
            data: {
              ownerId: user.id,
              name: dto.companyName,
              industry: dto.industry || undefined,
              slug: this.generateSlug(dto.companyName),
              isVerified: false,
              verificationStatus: VerificationStatus.UNVERIFIED,
            },
          });

          companyName = company.name;
          companySlug = company.slug;
        } catch (error: any) {
          await this.prisma.user.delete({ where: { id: user.id } });
          throw error;
        }
      }

      await this.createRegisterNotification({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName,
      });

      const token = await this.signToken(user.id, user.email ?? '', user.role);

      return {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyName,
          companySlug,
        },
      };
    } catch (error: any) {
      if (error instanceof ConflictException) throw error;
      throw new InternalServerErrorException(`Register Failed: ${error.message}`);
    }
  }

  /**
   * Login
   */
  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
        include: {
          companies: {
            select: {
              name: true,
              slug: true,
              logoUrl: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      if (!user.passwordHash) {
        throw new UnauthorizedException('บัญชีนี้ลงทะเบียนผ่านโซเชียลมีเดีย กรุณาใช้ Social Login');
      }

      const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
      }

      const token = await this.signToken(user.id, user.email ?? '', user.role);

      return {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          companyName: user.companies?.[0]?.name || null,
          companyLogo: user.companies?.[0]?.logoUrl || null,
          companySlug: user.companies?.[0]?.slug || null,
        },
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(`Login Failed: ${error.message}`);
    }
  }

  /**
   * Get user profile
   */
  async getProfile(userPayload: JwtPayload) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userPayload.sub },
        include: {
          companies: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              isVerified: true,
              verificationStatus: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException('ไม่พบข้อมูลผู้ใช้');
      }

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        company: user.companies?.[0] || null,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(`Get Profile Failed: ${error.message}`);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.passwordHash) {
        throw new UnauthorizedException(
          'ไม่พบผู้ใช้หรือบัญชีนี้ไม่ได้ลงทะเบียนด้วยรหัสผ่าน (อาจลงทะเบียนผ่าน Google/Line)',
        );
      }
      const isPasswordValid = await bcrypt.compare(dto.oldPassword, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('รหัสผ่านเดิมไม่ถูกต้อง');
      }
      const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);
      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });
      return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(`Change Password Failed: ${error.message}`);
    }
  }

  /**
   * Get Google OAuth redirect URL
   */
  getGoogleRedirectUrl(redirect?: string): string {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.getApiCallbackUrl('google');
    const params = new URLSearchParams({
      client_id: clientId!,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
    });
    if (redirect) {
      params.append('state', redirect);
    }
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Get API callback URL for OAuth providers
   */
  private getApiCallbackUrl(provider: string): string {
    const apiUrl = this.config.get<string>('API_URL', 'http://localhost:3001');
    return `${apiUrl}/api/v1/auth/${provider}/callback`;
  }

  /**
   * Handle Google OAuth Callback
   */
  async handleGoogleCallback(code: string) {
    try {
      const googleClientId = this.config.get<string>('GOOGLE_CLIENT_ID');
      const googleClientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
      const redirectUri = this.getApiCallbackUrl('google');

      // 1. Exchange code for tokens
      const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }, {
        timeout: 10000,
      });

      const { access_token } = tokenResponse.data;

      // 2. Get user info from Google
      const userResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${access_token}` },
        timeout: 10000,
      });

      const googleUser = userResponse.data;

      // 3. Check if user exists in database
      let user = await this.prisma.user.findFirst({
        where: {
          OR: [
            { googleId: googleUser.sub },
            { email: googleUser.email },
          ],
        },
        include: { companies: true },
      });

      if (!user) {
        // New user - need to register with role selection
        return {
          isNewUser: true,
          user: {
            googleId: googleUser.sub,
            email: googleUser.email,
            firstName: googleUser.given_name || '',
            lastName: googleUser.family_name || '',
            avatarUrl: googleUser.picture,
          },
        };
      }

      // Existing user - update googleId if missing
      if (!user.googleId) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub },
          include: { companies: true },
        });
      }

      // Generate JWT
      const token = await this.signToken(user.id, user.email ?? '', user.role);

      return {
        isNewUser: false,
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          companyName: user.companies?.[0]?.name || null,
          companyLogo: user.companies?.[0]?.logoUrl || null,
          companySlug: user.companies?.[0]?.slug || null,
        },
      };
    } catch (error: any) {
      console.error('Google Auth Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw new InternalServerErrorException('Google Authentication Failed');
    }
  }

  /**
   * Register user from Google OAuth (after role selection)
   */
  async registerGoogleUser(body: { role: UserRole; oauthData: any; companyName?: string }) {
    const { role, oauthData, companyName } = body;
    const { email, googleId, firstName, lastName, avatarUrl } = oauthData;
    try {
      const existing = await this.prisma.user.findFirst({
        where: {
          OR: [
            ...(googleId ? [{ googleId }] : []),
            ...(email ? [{ email }] : []),
          ],
        },
      });
      if (existing) {
        throw new ConflictException('บัญชีอีเมลหรือสิทธิ์การใช้งานนี้ลงทะเบียนไว้แล้ว');
      }

      let user = await this.prisma.user.create({
        data: {
          email: email || null,
          googleId: googleId || null,
          firstName,
          lastName,
          avatarUrl: avatarUrl || null,
          role: role,
        },
        include: { companies: true },
      });

      let finalCompanyName: string | null = null;
      if (role === 'EMPLOYER') {
        finalCompanyName = companyName || `${firstName} Company`;
        await this.prisma.company.create({
          data: {
            ownerId: user.id,
            name: finalCompanyName,
            slug: this.generateSlug(finalCompanyName),
            isVerified: false,
            verificationStatus: VerificationStatus.UNVERIFIED,
          },
        });
        user = await this.prisma.user.findUnique({
          where: { id: user.id },
          include: { companies: true },
        }) as any;
      }

      await this.createRegisterNotification({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyName: user.companies?.[0]?.name || finalCompanyName,
      });

      const token = await this.signToken(user.id, user.email ?? '', user.role);
      return {
        accessToken: token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatarUrl: user.avatarUrl,
          companyName: user.companies?.[0]?.name || null,
          companyLogo: user.companies?.[0]?.logoUrl || null,
          companySlug: user.companies?.[0]?.slug || null,
        },
      };
    } catch (error: any) {
      if (error?.status) throw error;
      throw new InternalServerErrorException(`Google Registration Failed: ${error.message}`);
    }
  }

  /**
   * Forgot password - send reset link via email using Brevo
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      console.log(`[Forgot Password] Request for email: ${dto.email}`);
      
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        console.log(`[Forgot Password] User not found for email: ${dto.email}`);
        return { message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว' };
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: expires,
        },
      });

      const frontendUrl = this.config.get<string>('NEXTAUTH_URL', 'http://localhost:3000');
      const resetUrl = `${frontendUrl}/th/auth/reset-password?token=${token}`;
      const senderEmail = this.config.get<string>('BREVO_SENDER_EMAIL', 'noreply@worksdd.com');

      if (this.brevoApiKey) {
        try {
          const response = await axios.post(
            `${this.brevoApiUrl}/smtp/email`,
            {
              sender: { name: 'WorksDD', email: senderEmail },
              to: [{ email: user.email, name: user.firstName }],
              subject: 'รีเซ็ตรหัสผ่าน WorksDD',
              htmlContent: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #d32f2f;">รีเซ็ตรหัสผ่าน WorksDD</h2>
                  <p>สวัสดีคุณ ${user.firstName},</p>
                  <p>คุณได้รับอีเมลนี้เนื่องจากมีการขอรีเซ็ตรหัสผ่านสำหรับบัญชีของคุณใน WorksDD</p>
                  <p>กรุณาคลิกปุ่มด้านล่างเพื่อเปลี่ยนรหัสผ่านใหม่ (ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง):</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" style="background-color: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 50px; font-weight: bold;">เปลี่ยนรหัสผ่านใหม่</a>
                  </div>
                  <p>หากคุณไม่ได้เป็นผู้ร้องขอ โปรดเพิกเฉยต่ออีเมลนี้</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #777;">หากปุ่มด้านบนใช้งานไม่ได้ คุณสามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ได้:</p>
                  <p style="font-size: 12px; color: #777; word-break: break-all;">${resetUrl}</p>
                </div>
              `,
            },
            {
              headers: { 'api-key': this.brevoApiKey, 'Content-Type': 'application/json' },
              timeout: 10000,
            },
          );
          console.log(`[Forgot Password] Email sent successfully. Response ID: ${response.data?.messageId}`);
        } catch (error: any) {
          console.error(`[Forgot Password] Brevo API Error:`, error.response?.data || error.message);
        }
      }

      return { message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว' };
    } catch (error: any) {
      throw new InternalServerErrorException(`Forgot Password Failed: ${error.message}`);
    }
  }

  /**
   * Reset password using token
   */
  async resetPassword(dto: ResetPasswordDto) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: dto.token,
          resetPasswordExpires: { gt: new Date() },
        },
      });

      if (!user) {
        throw new BadRequestException('Token ไม่ถูกต้องหรือหมดอายุแล้ว');
      }

      const passwordHash = await bcrypt.hash(dto.newPassword, 12);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return { message: 'รีเซ็ตรหัสผ่านใหม่สำเร็จ' };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Reset Password Failed: ${error.message}`);
    }
  }

  private async signToken(userId: string, email: string, role: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };
    return this.jwtService.signAsync(payload);
  }

  private generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '') + '-' + Math.random().toString(36).substring(2, 7);
  }

  private async createRegisterNotification(data: {
    userId: string;
    firstName: string;
    lastName: string;
    role: string;
    companyName?: string;
  }) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: data.userId,
          type: NotificationType.SYSTEM,
          title: 'ยินดีต้อนรับสู่ WorksDD',
          content: `สวัสดีคุณ ${data.firstName} ${data.lastName} ยินดีต้อนรับสู่แพลตฟอร์มของเรา!`,
        },
      });
    } catch (error) {
      console.error('Failed to create register notification:', error);
    }
  }
}
