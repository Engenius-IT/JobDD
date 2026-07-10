import { Controller, Get, Patch, Delete, Param, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AdminUsersService } from './admin-users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('admin-users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'ดึงรายการผู้ใช้ทั้งหมด (Admin)' })
  async getAllUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('role') role?: UserRole,
  ) {
    return this.adminUsersService.getAllUsers(Number(page), Number(limit), search, role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'ดึงข้อมูลผู้ใช้รายบุคคล (Admin)' })
  async getUserById(@Param('id') id: string) {
    return this.adminUsersService.getUserById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'อัปเดตข้อมูลผู้ใช้ (Admin)' })
  async updateUser(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    const adminId = req.user.id;
    return this.adminUsersService.updateUser(id, updateData, adminId);
  }

  @Patch(':id/verify-email')
  @ApiOperation({ summary: 'ยืนยันอีเมลผู้ใช้ (Admin)' })
  async verifyEmail(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.id;
    return this.adminUsersService.updateUser(id, { emailVerified: true }, adminId);
  }

  @Patch(':id/unverify-email')
  @ApiOperation({ summary: 'ยกเลิกการยืนยันอีเมลผู้ใช้ (Admin)' })
  async unverifyEmail(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.id;
    return this.adminUsersService.updateUser(id, { emailVerified: false }, adminId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'ลบผู้ใช้ (Admin)' })
  async deleteUser(@Param('id') id: string, @Request() req: any) {
    const adminId = req.user.id;
    return this.adminUsersService.deleteUser(id, adminId);
  }
}
