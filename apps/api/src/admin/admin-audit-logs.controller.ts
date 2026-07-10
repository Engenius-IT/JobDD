import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminAuditLogsService } from './admin-audit-logs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminAuditLogsController {
  constructor(private readonly auditLogsService: AdminAuditLogsService) {}

  @Get()
  async getLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('search') search?: string,
    @Query('type') type?: string,
  ) {
    return this.auditLogsService.getLogs(
      parseInt(page),
      parseInt(limit),
      search,
      type,
    );
  }
}
