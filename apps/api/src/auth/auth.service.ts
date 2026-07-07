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
import { VerificationStatus, NotificationType } from '@prisma/client';

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
   * Register a new user (แบบปกติ กรอกฟอร์ม)
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
          verificationStatus: VerificationStatus.UNVERIFIED,
        },
      });

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
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

      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const token = this.jwtService.sign(payload, {
        expiresIn: '7d',
      });

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token,
      };
    } catch (error: any) {
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(`Login Failed: ${error.message}`);
    }
  }

  /**
   * Change password
   */
  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new UnauthorizedException('ผู้ใช้ไม่พบ');
      }

      if (!user.passwordHash) {
        throw new BadRequestException('บัญชีนี้ลงทะเบียนผ่านโซเชียลมีเดีย ไม่สามารถเปลี่ยนรหัสผ่านได้');
      }

      const isPasswordValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);

      if (!isPasswordValid) {
        throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
      }

      if (dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException('รหัสผ่านใหม่ไม่ตรงกัน');
      }

      const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash: newPasswordHash,
        },
      });

      return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException(`Change Password Failed: ${error.message}`);
    }
  }

  /**
   * Forgot password - send reset link via email
   */
  async forgotPassword(dto: ForgotPasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (!user) {
        // Return success even if user not found for security
        return { message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว' };
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date();
      expires.setHours(expires.getHours() + 1); // Token expires in 1 hour

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: expires,
        },
      });

      const frontendUrl = this.config.get<string>('NEXTAUTH_URL', 'http://localhost:3000');
      const resetUrl = `${frontendUrl}/th/auth/reset-password?token=${token}`;

      console.log(`[${new Date().toISOString()}] Attempting to send reset password email to: ${user.email}`);
      console.log(`[${new Date().toISOString()}] Brevo API Key configured: ${!!this.brevoApiKey}`);

      if (this.brevoApiKey) {
        try {
          console.log(`[${new Date().toISOString()}] Starting Brevo email send process...`);

          const response = await axios.post(
            `${this.brevoApiUrl}/smtp/email`,
            {
              sender: {
                name: 'WorksDD',
                email: 'noreply@worksdd.com',
              },
              to: [
                {
                  email: user.email,
                  name: user.firstName,
                },
              ],
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
              headers: {
                'api-key': this.brevoApiKey,
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            },
          );
          console.log(`[${new Date().toISOString()}] Email sent successfully! Message ID: ${response.data.messageId}`);
        } catch (error: any) {
          console.error(`[${new Date().toISOString()}] Email send failed with error:`, error.message);
          console.error(`[${new Date().toISOString()}] Error response:`, error.response?.data);
          console.error(`[${new Date().toISOString()}] Full error:`, error);
        }
      } else {
        console.warn(`[${new Date().toISOString()}] BREVO_API_KEY is not configured. Email not sent.`);
        console.log(`[${new Date().toISOString()}] Reset URL for manual testing: ${resetUrl}`);
      }

      return { message: 'หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว' };
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] Forgot Password Error:`, error);
      if (error instanceof BadRequestException) throw error;
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
          resetPasswordExpires: {
            gt: new Date(),
          },
        },
      });

      if (!user) {
        throw new BadRequestException('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว');
      }

      if (dto.password !== dto.confirmPassword) {
        throw new BadRequestException('รหัสผ่านใหม่ไม่ตรงกัน');
      }

      if (dto.password.length < 6) {
        throw new BadRequestException('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      }

      const passwordHash = await bcrypt.hash(dto.password, 12);

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });

      return { message: 'รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบได้แล้ว' };
    } catch (error: any) {
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException(`Reset Password Failed: ${error.message}`);
    }
  }
}
