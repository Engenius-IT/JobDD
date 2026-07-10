'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Download, User, Building2, Briefcase, Settings, CheckCircle2, XCircle, Edit3, Trash2, Calendar, Loader2 } from 'lucide-react';

interface ActivityLog {
  id: string;
  admin: {
    firstName: string;
    lastName: string;
    email: string;
  };
  action: string;
  type: 'approve' | 'reject' | 'create' | 'update' | 'delete' | 'settings';
  target: string;
  targetType: 'company' | 'job' | 'user' | 'system';
  createdAt: string;
  status: 'success' | 'failed';
  details?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    fetchLogs();
  }, [page, searchTerm, filterType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const typeParam = filterType !== 'all' ? `&type=${filterType}` : '';
      const searchParam = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
      
      const response = await fetch(
        `${API_URL}/admin/audit-logs?page=${page}&limit=${limit}${searchParam}${typeParam}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch logs');

      const data = await response.json();
      setLogs(data.data);
      setTotal(data.meta.total);
    } catch (err) {
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'approve':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'reject':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'create':
        return <Edit3 className="w-4 h-4 text-blue-600" />;
      case 'update':
        return <Edit3 className="w-4 h-4 text-yellow-600" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-red-600" />;
      case 'settings':
        return <Settings className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  const getTargetIcon = (targetType: string) => {
    switch (targetType) {
      case 'company':
        return <Building2 className="w-4 h-4 text-gray-400" />;
      case 'job':
        return <Briefcase className="w-4 h-4 text-gray-400" />;
      case 'user':
        return <User className="w-4 h-4 text-gray-400" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'success' 
      ? 'bg-green-50 text-green-700' 
      : 'bg-red-50 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">บันทึกกิจกรรม</h1>
          <p className="text-gray-500 mt-1">ติดตามกิจกรรมของแอดมินในระบบ</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
          <Download className="w-4 h-4" /> ส่งออกรายงาน
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อแอดมิน หรือกิจกรรม..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">ทุกประเภท</option>
              <option value="approve">อนุมัติ</option>
              <option value="reject">ปฏิเสธ</option>
              <option value="create">สร้างใหม่</option>
              <option value="update">แก้ไข</option>
              <option value="delete">ลบ</option>
              <option value="settings">ตั้งค่า</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Logs Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เวลา</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">แอดมิน</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">กิจกรรม</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">เป้าหมาย</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">สถานะ</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {log.admin.firstName} {log.admin.lastName}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getActionIcon(log.type)}
                      <span className="text-gray-700">{log.action}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      {getTargetIcon(log.targetType)}
                      <span className="text-gray-700 truncate max-w-xs">{log.target}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(log.status)}`}>
                      {log.status === 'success' ? 'สำเร็จ' : 'ล้มเหลว'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {log.details ? (
                      <span className="truncate max-w-xs" title={log.details}>{log.details}</span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-gray-500">ไม่พบบันทึกกิจกรรมที่ค้นหา</p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-xs text-gray-500 uppercase font-bold">ทั้งหมด</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-xs text-green-600 uppercase font-bold">สำเร็จ</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{logs.filter(l => l.status === 'success').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-xs text-blue-600 uppercase font-bold">อนุมัติ</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{logs.filter(l => l.type === 'approve').length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <p className="text-xs text-red-600 uppercase font-bold">ปฏิเสธ</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{logs.filter(l => l.type === 'reject').length}</p>
        </div>
      </div>
    </div>
  );
}
