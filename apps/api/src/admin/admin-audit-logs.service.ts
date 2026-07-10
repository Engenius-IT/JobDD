import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminAuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(data: {
    adminId: string;
    action: string;
    type: string;
    target: string;
    targetType: string;
    details?: string;
    status?: string;
    ipAddress?: string;
  }) {
    return this.prisma.auditLog.create({
      data,
    });
  }

  async getLogs(page: number, limit: number, searchTerm?: string, type?: string) {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (searchTerm) {
      where.OR = [
        { admin: { firstName: { contains: searchTerm, mode: 'insensitive' } } },
        { admin: { lastName: { contains: searchTerm, mode: 'insensitive' } } },
        { action: { contains: searchTerm, mode: 'insensitive' } },
        { target: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        include: {
          admin: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.auditLog.count({ where }),
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
}
