import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminAuditLogsService } from './admin-audit-logs.service';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AdminAuditLogsService,
  ) {}

  async getAllUsers(page: number, limit: number, searchTerm?: string, role?: UserRole) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (searchTerm) {
      where.OR = [
        { email: { contains: searchTerm, mode: 'insensitive' } },
        { firstName: { contains: searchTerm, mode: 'insensitive' } },
        { lastName: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    if (role) {
      where.role = role;
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          _count: {
            select: {
              applications: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async deleteUser(id: string, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('ไม่พบข้อมูลผู้ใช้');

    const deleted = await this.prisma.user.delete({ where: { id } });

    // บันทึก Audit Log
    try {
      await this.auditLogsService.createLog({
        adminId: adminId,
        action: 'ลบผู้ใช้',
        type: 'delete',
        target: user.email,
        targetType: 'user',
        details: `ลบผู้ใช้ ID: ${id} (${user.firstName} ${user.lastName})`,
      });
    } catch (err) {
      console.error('Failed to create audit log:', err);
    }

    return deleted;
  }
}
