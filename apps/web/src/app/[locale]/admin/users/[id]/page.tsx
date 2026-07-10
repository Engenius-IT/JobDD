
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, Mail, Phone, Briefcase, Calendar, Edit, Save, XCircle, Loader2, ShieldCheck, ShieldOff } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'JOBSEEKER' | 'EMPLOYER' | 'ADMIN';
  createdAt: string;
  emailVerified: boolean;
  // Add other user fields as needed
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserData>>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      setUserData(data);
      setFormData(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching user data.');
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/admin/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user data');
      }

      await fetchUser(); // Re-fetch updated data
      setEditing(false);
      // Optionally show a success message
    } catch (err: any) {
      setError(err.message || 'An error occurred while updating user data.');
      console.error('Error updating user:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!confirm('คุณต้องการยืนยันอีเมลของผู้ใช้นี้หรือไม่?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/admin/users/${id}/verify-email`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify email');
      }

      await fetchUser(); // Re-fetch updated data
      // Optionally show a success message
    } catch (err: any) {
      setError(err.message || 'An error occurred while verifying email.');
      console.error('Error verifying email:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnverifyEmail = async () => {
    if (!confirm('คุณต้องการยกเลิกการยืนยันอีเมลของผู้ใช้นี้หรือไม่?')) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`${API_URL}/admin/users/${id}/unverify-email`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to unverify email');
      }

      await fetchUser(); // Re-fetch updated data
      // Optionally show a success message
    } catch (err: any) {
      setError(err.message || 'An error occurred while unverifying email.');
      console.error('Error unverifying email:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="ml-3 text-gray-600">กำลังโหลดข้อมูลผู้ใช้...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        <p>Error: {error}</p>
        <button onClick={fetchUser} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg">ลองอีกครั้ง</button>
      </div>
    );
  }

  if (!userData) {
    return <div className="p-6 text-center text-gray-600">ไม่พบข้อมูลผู้ใช้</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">รายละเอียดผู้ใช้: {userData.firstName} {userData.lastName}</h1>
          <p className="text-gray-500 mt-1">จัดการข้อมูลและสิทธิ์การเข้าถึงของผู้ใช้</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Edit className="w-4 h-4" /> แก้ไขข้อมูล
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} บันทึก
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setFormData(userData); // Reset form data if cancelled
                setError(null);
              }}
              disabled={submitting}
              className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-400 transition-colors shadow-sm disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> ยกเลิก
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-900">ข้อมูลส่วนตัว</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">ชื่อจริง</label>
            {editing ? (
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            ) : (
              <p className="mt-1 text-gray-900">{userData.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">นามสกุล</label>
            {editing ? (
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            ) : (
              <p className="mt-1 text-gray-900">{userData.lastName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">อีเมล</label>
            <div className="mt-1 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              {editing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="text-gray-900">{userData.email}</p>
              )}
              {userData.emailVerified ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <ShieldCheck className="w-3 h-3 mr-1" /> ยืนยันแล้ว
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <ShieldOff className="w-3 h-3 mr-1" /> ยังไม่ยืนยัน
                </span>
              )}
              {editing && !userData.emailVerified && (
                <button
                  onClick={handleVerifyEmail}
                  disabled={submitting}
                  className="ml-2 px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ยืนยันอีเมล'}
                </button>
              )}
              {editing && userData.emailVerified && (
                <button
                  onClick={handleUnverifyEmail}
                  disabled={submitting}
                  className="ml-2 px-3 py-1 bg-yellow-500 text-white text-xs rounded-md hover:bg-yellow-600 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'ยกเลิกยืนยัน'}
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
            <div className="mt-1 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              {editing ? (
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              ) : (
                <p className="text-gray-900">{userData.phone || '-'}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">บทบาท</label>
            <div className="mt-1 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-gray-500" />
              {editing ? (
                <select
                  name="role"
                  value={formData.role || ''}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="JOBSEEKER">ผู้สมัครงาน</option>
                  <option value="EMPLOYER">ผู้ประกอบการ</option>
                  <option value="ADMIN">แอดมิน</option>
                </select>
              ) : (
                <p className="text-gray-900">{userData.role}</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">วันที่สร้างบัญชี</label>
            <div className="mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <p className="text-gray-900">{new Date(userData.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add more sections for other user-related data like companies, jobs, etc. */}
    </div>
  );
}
