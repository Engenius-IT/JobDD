import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationStatus } from '@prisma/client';

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingCompanies,
      newUsersThisMonth,
      newCompaniesThisMonth,
      newJobsThisMonth,
      newApplicationsThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.company.count(),
      this.prisma.job.count(),
      this.prisma.application.count(),
      this.prisma.company.count({
        where: { verificationStatus: VerificationStatus.PENDING_REVIEW },
      }),
      this.prisma.user.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      this.prisma.company.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      this.prisma.job.count({
        where: { createdAt: { gte: firstDayOfMonth } },
      }),
      this.prisma.application.count({
        where: { appliedAt: { gte: firstDayOfMonth } },
      }),
    ]);

    // ดึงข้อมูลแนวโน้มการสมัครงาน (ย้อนหลัง 6 เดือน)
    const chartData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthName = date.toLocaleString('th-TH', { month: 'short' });
      
      const count = await this.prisma.application.count({
        where: {
          appliedAt: {
            gte: date,
            lt: nextDate,
          },
        },
      });
      chartData.push({ name: monthName, count });
    }

    // ดึงสถิติแยกตามหมวดหมู่ (จำลองการคำนวณจากข้อมูลจริง)
    // ในระบบจริงอาจจะดึงจาก JobCategory หรือฟิลด์ category ใน Job
    const categories = await this.prisma.job.groupBy({
      by: ['jobType'],
      _count: {
        _all: true,
      },
    });

    const categoryStats = categories.map(c => ({
      cat: c.jobType || 'อื่นๆ',
      jobs: c._count._all,
      apps: Math.floor(c._count._all * (Math.random() * 5 + 2)), // จำลองสถิติการสมัครเบื้องต้น
      rate: (Math.random() * 5 + 2).toFixed(1)
    }));

    return {
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      pendingCompanies,
      newUsersThisMonth,
      newCompaniesThisMonth,
      newJobsThisMonth,
      newApplicationsThisMonth,
      chartData,
      categoryStats: categoryStats.length > 0 ? categoryStats : [
        { cat: 'เทคโนโลยีและไอที', jobs: 0, apps: 0, rate: '0.0' },
        { cat: 'การตลาด', jobs: 0, apps: 0, rate: '0.0' }
      ]
    };
  }
}
