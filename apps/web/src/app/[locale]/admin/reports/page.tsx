'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Briefcase, 
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function ReportsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('accessToken');
        const response = await fetch(`${API_URL}/admin/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="text-gray-500 font-medium">กำลังโหลดข้อมูลรายงาน...</p>
      </div>
    );
  }

  const s = stats || {
    totalUsers: 0,
    totalCompanies: 0,
    totalJobs: 0,
    totalApplications: 0,
    newUsersThisMonth: 0,
    newCompaniesThisMonth: 0,
    newJobsThisMonth: 0,
    chartData: [],
    categoryStats: []
  };

  const maxCount = Math.max(...(s.chartData?.map((d: any) => d.count) || [0]), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">สถิติและรายงาน</h1>
          <p className="text-gray-500 mt-1">วิเคราะห์ข้อมูลการเติบโตของแพลตฟอร์ม</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" /> 30 วันที่ผ่านมา
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" /> ส่งออกรายงาน
          </button>
        </div>
      </div>

      {/* Growth Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            {s.newUsersThisMonth > 0 && (
              <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> ใหม่
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">ผู้ใช้ใหม่รายเดือน</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{s.newUsersThisMonth.toLocaleString()} คน</p>
          <p className="text-xs text-gray-400 mt-2">จากทั้งหมด {s.totalUsers.toLocaleString()} คน</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
              <Building2 className="w-6 h-6" />
            </div>
            {s.newCompaniesThisMonth > 0 && (
              <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> ใหม่
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">บริษัทใหม่รายเดือน</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{s.newCompaniesThisMonth || 0} บริษัท</p>
          <p className="text-xs text-gray-400 mt-2">จากทั้งหมด {s.totalCompanies.toLocaleString()} บริษัท</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
              <Briefcase className="w-6 h-6" />
            </div>
            {s.newJobsThisMonth > 0 && (
              <span className="flex items-center gap-1 text-green-600 text-xs font-bold bg-green-50 px-2 py-1 rounded-full">
                <ArrowUpRight className="w-3 h-3" /> ใหม่
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 font-medium">งานที่ลงใหม่รายเดือน</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{s.newJobsThisMonth.toLocaleString()} ตำแหน่ง</p>
          <p className="text-xs text-gray-400 mt-2">จากทั้งหมด {s.totalJobs.toLocaleString()} ตำแหน่ง</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" /> แนวโน้มการสมัครงาน (6 เดือนล่าสุด)
          </h3>
          <div className="flex-1 flex items-end justify-between gap-2 pt-10 pb-4 px-4">
            {s.chartData?.map((item: any, idx: number) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="w-full relative flex items-end justify-center h-48">
                  <div 
                    className="w-full bg-blue-500 rounded-t-lg transition-all duration-500 group-hover:bg-blue-600"
                    style={{ height: `${(item.count / maxCount) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.count} ครั้ง
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">{item.name}</span>
              </div>
            ))}
            {(!s.chartData || s.chartData.length === 0) && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                ไม่มีข้อมูลการสมัครงาน
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[400px] flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" /> สถิติการสมัครรายเดือน
          </h3>
          <div className="flex-1 space-y-4 pt-4">
            {s.chartData?.slice(-4).map((item: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-gray-600">
                  <span>เดือน {item.name}</span>
                  <span>{item.count} การสมัคร</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {(!s.chartData || s.chartData.length === 0) && (
              <div className="w-full h-full flex items-center justify-center text-gray-400 italic">
                ไม่มีข้อมูลสถิติ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Stats Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">สถิติแยกตามหมวดหมู่</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">งานทั้งหมด</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">การสมัคร</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">อัตราการสมัคร/งาน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {s.categoryStats?.map((row: any, idx: number) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{row.cat}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.jobs} ตำแหน่ง</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{row.apps} ครั้ง</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-600">{row.rate}</td>
                </tr>
              ))}
              {(!s.categoryStats || s.categoryStats.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    ยังไม่มีข้อมูลสถิติแยกตามหมวดหมู่
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
