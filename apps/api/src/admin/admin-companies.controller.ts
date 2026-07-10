import { Controller, Get, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminCompaniesService } from './admin-companies.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin-companies')
@Controller('admin/companies')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminCompaniesController {
  constructor(private readonly adminCompaniesService: AdminCompaniesService) {}

  @Get('pending')
  @ApiOperation({ summary: 'ดึงรายชื่อบริษัทที่รอการตรวจสอบ (Admin)' })
  async getPendingCompanies(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.adminCompaniesService.getPendingCompanies(Number(page), Number(limit));
  }

  @Patch(':id/verify')
  @ApiOperation({ summary: 'อนุมัติ/ไม่อนุมัติ บริษัท (Admin)' })
  async verifyCompany(
    @Param('id') id: string,
    @Body() dto: { status: 'VERIFIED' | 'REJECTED'; rejectionReason?: string },
    @Request() req: any,
  ) {
    const adminId = req.user.id;
    return this.adminCompaniesService.verifyCompany(id, dto.status, adminId, dto.rejectionReason);
  }
}
