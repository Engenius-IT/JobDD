'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token ไม่ถูกต้องหรือไม่พบ Token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/verify-email?token=${token}`);
        const data = await res.json();

        if (res.ok) {
          setStatus('success');
          setMessage(data.message || 'ยืนยันอีเมลสำเร็จ');
        } else {
          setStatus('error');
          setMessage(data.message || 'การยืนยันอีเมลล้มเหลว');
        }
      } catch (err) {
        setStatus('error');
        setMessage('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8 drop-shadow-2xl text-center">
      {status === 'loading' && (
        <div className="py-12">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">กำลังยืนยันอีเมล...</h1>
          <p className="text-gray-500">โปรดรอสักครู่ ระบบกำลังตรวจสอบข้อมูลของคุณ</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">ยืนยันสำเร็จ!</h1>
          <p className="text-gray-600 mb-8">{message}</p>
          <Link
            href="/login"
            className="block w-full py-3.5 bg-[#202063] text-white font-bold rounded-xl shadow-lg hover:bg-[#1a1a52] transition-all"
          >
            เข้าสู่ระบบเลย
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8">
          <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">เกิดข้อผิดพลาด</h1>
          <p className="text-red-500 mb-8">{message}</p>
          <div className="space-y-3">
            <Link
              href="/register"
              className="block w-full py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all"
            >
              กลับไปหน้าสมัครสมาชิก
            </Link>
            <Link href="/login" className="text-sm text-[#202063] hover:underline">
              หรือลองเข้าสู่ระบบ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <Suspense fallback={
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-500">กำลังโหลด...</p>
          </div>
        }>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </div>
  );
}
