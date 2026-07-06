'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
        return;
      }

      setSuccess(true);
      setEmail('');
    } catch (err) {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
      console.error('Forgot password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex justify-center items-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">ลืมรหัสผ่าน</h1>
            <p className="text-gray-600">
              กรุณากรอกอีเมลของคุณ เราจะส่งลิงก์เพื่อรีเซ็ตรหัสผ่านให้คุณ
            </p>
          </div>

          {success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-green-600 text-5xl mb-4">✓</div>
              <h2 className="text-xl font-semibold text-green-800 mb-2">
                ตรวจสอบอีเมลของคุณ
              </h2>
              <p className="text-green-700 mb-6">
                เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว
                กรุณาตรวจสอบกล่องขาเข้า (หรือโฟลเดอร์ Spam)
              </p>
              <p className="text-sm text-gray-600 mb-6">
                ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง
              </p>
              <Link
                href="/th/login"
                className="inline-block bg-blue-800 text-white font-medium py-3 px-6 rounded-full hover:bg-blue-900 transition-colors"
              >
                กลับไปหน้า Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  อีเมล
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-full border border-gray-300 text-gray-600 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-white font-medium py-3 px-4 rounded-full hover:bg-blue-900 transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? '...' : 'ส่งลิงก์รีเซ็ต'}
              </button>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  จำรหัสผ่านได้แล้ว?{' '}
                  <Link href="/th/login" className="text-blue-800 font-medium hover:underline">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
