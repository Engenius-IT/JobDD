'use client';

import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { useRouter } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

// Use 127.0.0.1 explicitly to avoid localhost resolution issues on some systems
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api/v1';

export default function EmployerRegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '', // Contact Person Name
    phone: '',
    companyName: '',
    industry: '',
  });

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);

  const isFormValid =
    form.companyName.trim() !== '' &&
    form.industry !== '' &&
    form.firstName.trim() !== '' &&
    form.phone.trim() !== '' &&
    form.email.trim() !== '' &&
    form.password.length >= 8 &&
    form.confirmPassword !== '' &&
    termsChecked;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Clear field-specific error when user types initially
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    setError('');

    let formattedValue = value;
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      formattedValue = digits;
      if (digits.length > 6) {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        formattedValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      }
      setForm((prev) => ({ ...prev, phone: formattedValue }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    // Real-time validation
    const newErrors = { ...fieldErrors };
    if (name === 'phone' && value !== '') {
      const digits = value.replace(/\D/g, '');
      if (digits.length !== 10) {
        newErrors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก';
      } else {
        delete newErrors.phone;
      }
    }

    if (name === 'email' && value !== '') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        newErrors.email = 'อีเมลไม่ถูกต้อง (ต้องมี @ และโดเมนอีเมล)';
      } else {
        delete newErrors.email;
      }
    }
    setFieldErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.companyName.trim()) newErrors.companyName = 'กรุณากรอกชื่อบริษัท';
    if (!form.industry) newErrors.industry = 'กรุณาเลือกประเภทธุรกิจ';
    if (!form.firstName.trim()) newErrors.firstName = 'กรุณากรอกชื่อผู้ติดต่อ';

    if (!form.phone.trim()) {
      newErrors.phone = 'กรุณากรอกเบอร์โทรศัพท์';
    } else {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        newErrors.phone = 'เบอร์โทรศัพท์ต้องมี 10 หลัก';
      }
    }

    if (!form.email.trim()) {
      newErrors.email = 'กรุณากรอกอีเมล';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'อีเมลไม่ถูกต้อง (ต้องมี @ และโดเมนอีเมล)';
    }

    // Password rules
    if (!form.password) {
      newErrors.password = 'กรุณากรอกรหัสผ่าน';
    } else if (form.password.length < 8) {
      newErrors.password = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว';
    }

    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'รหัสผ่านไม่ตรงกัน';
    }
    if (!termsChecked) {
      newErrors.terms = 'กรุณายอมรับเงื่อนไขการให้บริการ';
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: '.', // Employer might not need last name if single field, but backend validation might require it
        role: 'EMPLOYER',
        phone: form.phone || undefined,
        companyName: form.companyName,
        industry: form.industry,
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        let msgArray = Array.isArray(data.message) ? data.message : [data.message].filter(Boolean);

        // Fix missing words in error messages
        msgArray = msgArray.map((msg: string) => {
          if (msg.includes('ต้องมีตัวอักษร') && !msg.includes('รหัส')) {
            return msg.replace('ต้องมีตัวอักษร', 'รหัสผ่านต้องมีตัวอักษร');
          }
          return msg;
        });

        const newFieldErrors: Record<string, string> = {};
        const globalErrors: string[] = [];

        msgArray.forEach((msg: string) => {
          const lowerMsg = msg.toLowerCase();
          if (lowerMsg.includes('password') || lowerMsg.includes('รหัสผ่าน')) {
            newFieldErrors.password = msg;
          } else if (lowerMsg.includes('email') || lowerMsg.includes('อีเมล')) {
            newFieldErrors.email = msg;
          } else if (lowerMsg.includes('company') || lowerMsg.includes('บริษัท')) {
            newFieldErrors.companyName = msg;
          } else {
            globalErrors.push(msg);
          }
        });

        if (Object.keys(newFieldErrors).length > 0) {
          setFieldErrors(newFieldErrors);
        }
        if (globalErrors.length > 0) {
          setError(globalErrors.join(', '));
        }
        return;
      }

      if (data.requiresVerification) {
        setSuccess(true);
        return;
      }

      // Auto-login using AuthContext
      login(data.accessToken, data.user);
    } catch {
      setError('ไม่สามารถเชื่อมต่อ API ได้');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-8 drop-shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#202063]">ลงทะเบียนบริษัท</h1>
            <p className="mt-2 text-gray-500 text-sm">ลงประกาศงานและค้นหาคนคุณภาพ</p>
          </div>

          {success && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">สมัครสมาชิกสำเร็จ!</h2>
              <p className="text-gray-600 mb-8">
                เราได้ส่งอีเมลยืนยันไปที่ <span className="font-semibold text-[#202063]">{form.email}</span> แล้ว <br />
                กรุณาตรวจสอบกล่องจดหมายและคลิกลิงก์เพื่อยืนยันตัวตน
              </p>
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full py-3 bg-[#202063] text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all"
                >
                  ไปหน้าเข้าสู่ระบบ
                </Link>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-sm text-gray-500 hover:text-[#202063] transition-colors"
                >
                  กลับไปแก้ไขข้อมูล
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท</label>
                <input
                  type="text"
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-gray-900 ${fieldErrors.companyName
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  placeholder="บริษัท จ๊อบสบาย จำกัด"
                />
                {fieldErrors.companyName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.companyName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทธุรกิจ</label>
                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-gray-900 bg-white ${fieldErrors.industry
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                >
                  <option value="">เลือกประเภทธุรกิจ...</option>
                  <option value="เทคโนโลยีสารสนเทศ (IT)">เทคโนโลยีสารสนเทศ (IT)</option>
                  <option value="การเงินและธนาคาร">การเงินและธนาคาร</option>
                  <option value="อุตสาหกรรมการผลิต">อุตสาหกรรมการผลิต</option>
                  <option value="การค้าปลีกและอีคอมเมิร์ซ">การค้าปลีกและอีคอมเมิร์ซ</option>
                  <option value="สุขภาพและเซรวิจคลินิก">สุขภาพและเซรวิจคลินิก</option>
                  <option value="การศึกษาและฝึกอบรม">การศึกษาและฝึกอบรม</option>
                  <option value="อสังหาริมทรัพย์และก่อสร้าง">อสังหาริมทรัพย์และก่อสร้าง</option>
                  <option value="โลจิสติกส์และการขนส่ง">โลจิสติกส์และการขนส่ง</option>
                  <option value="การตลาดและโฆษณา">การตลาดและโฆษณา</option>
                  <option value="บริการพื้นฐานและคอลเซนเตอร์">บริการพื้นฐานและคอลเซนเตอร์</option>
                  <option value="อาหารและเครื่องดื่ม">อาหารและเครื่องดื่ม</option>
                  <option value="ท่องเที่ยวและโรงแรม">ท่องเที่ยวและโรงแรม</option>
                  <option value="พลังงานและสาธารณูปโภค">พลังงานและสาธารณูปโภค</option>
                  <option value="เกษตรกรรมและอาหาร">เกษตรกรรมและอาหาร</option>
                  <option value="สื่อสารและบันเทิง">สื่อสารและบันเทิง</option>
                  <option value="ประกันภัย">ประกันภัย</option>
                  <option value="อื่น (โปรดระบุ)">อื่น (โปรดระบุ)</option>
                </select>
                {fieldErrors.industry && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.industry}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ชื่อผู้ติดต่อ
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-gray-900 ${fieldErrors.firstName
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  placeholder="ชื่อ-นามสกุล ของผู้ติดต่อ"
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เบอร์โทรศัพท์
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-gray-900 ${fieldErrors.phone
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  placeholder="0xx-xxx-xxxx"
                />
                {fieldErrors.phone && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  อีเมล (สำหรับเข้าสู่ระบบ)
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border outline-none transition-all text-gray-900 ${fieldErrors.email
                    ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                    : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                    }`}
                  placeholder="name@example.com"
                />
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border outline-none transition-all text-gray-900 ${fieldErrors.password
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                        }`}
                      placeholder="8+ ตัวอักษร"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร และมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว</p>
                  {fieldErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ยืนยันรหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      className={`w-full px-4 py-2.5 pr-10 rounded-lg border outline-none transition-all text-gray-900 ${fieldErrors.confirmPassword
                        ? 'border-red-500 focus:ring-2 focus:ring-red-100 focus:border-red-500'
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-100 focus:border-blue-500'
                        }`}
                      placeholder="กรอกอีกครั้ง"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.confirmPassword}</p>
                  )}
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  checked={termsChecked}
                  onChange={(e) => {
                    setTermsChecked(e.target.checked);
                    if (fieldErrors.terms && e.target.checked) {
                      setFieldErrors((prev) => ({ ...prev, terms: '' }));
                    }
                  }}
                  className={`mt-1 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 ${fieldErrors.terms ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                <div className="flex flex-col">
                  <label htmlFor="terms" className="text-sm text-gray-500">
                    ฉันยอมรับ{' '}
                    <Link href="#" className="text-blue-600 hover:underline">
                      เงื่อนไขการให้บริการ
                    </Link>{' '}
                    และ{' '}
                    <Link href="#" className="text-blue-600 hover:underline">
                      นโยบายความเป็นส่วนตัว
                    </Link>{' '}
                    ของ JobDD
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-xs text-red-500 mt-1">{fieldErrors.terms}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={!isFormValid || loading}
                className={`w-full py-3 mt-4 rounded-lg text-white font-semibold transition-all shadow-sm ${isFormValid && !loading
                  ? 'bg-[#020263] hover:bg-[#00003D] hover:shadow-md cursor-pointer'
                  : 'bg-gray-300 cursor-not-allowed'
                  }`}
              >
                {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
              </button>
              <div className="text-center mt-4 pt-4 border-t border-gray-100">
                <Link href="/register" className="text-sm text-gray-500 hover:text-gray-700">
                  ย้อนกลับไปหน้าเลือกประเภทบัญชี
                </Link>
              </div>
              <div className="text-center mt-2">
                <Link href="/employer/login" className="text-sm text-[#202063] hover:underline">
                  มีบัญชีอยู่แล้ว? เข้าสู่ระบบสำหรับผู้ประกอบการ
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
