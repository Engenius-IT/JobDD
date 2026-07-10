import { Module } from '@nestjs/common';
import { AdminCompaniesController } from './admin-companies.controller';
import { AdminCompaniesService } from './admin-companies.service';
import { AdminJobsController } from './admin-jobs.controller';
import { AdminJobsService } from './admin-jobs.service';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminAuditLogsController } from './admin-audit-logs.controller';
import { AdminAuditLogsService } from './admin-audit-logs.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [PrismaModule, AuthModule, NotificationsModule],
  controllers: [
    AdminCompaniesController,
    AdminJobsController,
    AdminUsersController,
    AdminDashboardController,
    AdminAuditLogsController,
  ],
  providers: [
    AdminCompaniesService,
    AdminJobsService,
    AdminUsersService,
    AdminDashboardService,
    AdminAuditLogsService,
  ],
})
export class AdminModule {}
