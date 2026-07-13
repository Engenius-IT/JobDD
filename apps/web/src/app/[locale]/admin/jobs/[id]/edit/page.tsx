'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useParams } from 'next/navigation';
import { useRouter, usePathname } from '@/i18n/routing';
import { useAuth } from '@/context/AuthContext';
import { useLocale } from 'next-intl';
import {
  X,
  Plus,
  Briefcase,
  ChevronLeft,
  Bus,
  TrainFront,
  TramFront,
  Plane,
  Train,
  MapPin,
  Save,
  Loader2,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const JOB_TYPES = [
  { value: 'FULL_TIME', label: 'งานประจำ (Full Time)' },
  { value: 'PART_TIME', label: 'งานพาร์ทไทม์ (Part Time)' },
  { value: 'CONTRACT', label: 'งานสัญญาจ้าง (Contract)' },
  { value: 'INTERNSHIP', label: 'ฝึกงาน (Internship)' },
  { value: 'FREELANCE', label: 'ฟรีแลนซ์ (Freelance)' },
];

const WORK_MODELS = [
  { value: 'ONSITE', label: 'ทำงานที่ออฟฟิศ (Onsite)' },
  { value: 'REMOTE', label: 'ทำงานจากที่บ้าน (Remote)' },
  { value: 'HYBRID', label: 'ผสมผสาน (Hybrid)' },
];

const JOB_CATEGORIES = [
  'งานบัญชี',
  'งานธุรการ',
  'งานธนาคาร งานการเงิน',
  'งานพัฒนาชุมชน',
  'งานก่อสร้าง',
  'งานออกแบบ งานสถาปัตยกรรม',
  'งานการศึกษา',
  'งานวิศวกรรม',
  'งานฟาร์ม งานสัตวบาล งานอนุรักษ์',
  'งานราชการ',
  'งานการแพทย์',
  'งานบริการ งานท่องเที่ยว',
  'งานทรัพยากรบุคคล',
  'งานไอที งานเทคโนโลยีสื่อสาร',
  'งานประกันภัย',
  'งานกฎหมาย',
  'งานการผลิต งานขนส่ง',
  'งานการตลาด งานสื่อสาร',
  'งานอสังหาริมทรัพย์',
  'งานสินค้าขายปลีกและอุปโภคบริโภค',
  'งานขาย',
  'งานวิทยาศาสตร์',
  'งานการกีฬา งานสันทนาการ',
];

const TRANSPORT_PRESETS = [
  { value: 'รถเมล์', icon: Bus, label: 'รถเมล์' },
  { value: 'BTS', icon: TrainFront, label: 'BTS' },
  { value: 'MRT', icon: TramFront, label: 'MRT' },
  { value: 'ARL', icon: Plane, label: 'ARL' },
  { value: 'รถไฟ', icon: Train, label: 'รถไฟ' },
];

const ADDITIONAL_QUAL_PRESETS = [
  'ยินดีรับนักศึกษาจบใหม่',
  'ยินดีรับผู้ไม่มีประสบการณ์',
  'สามารถเดินทางต่างจังหวัดได้',
  'สามารถทำงานเป็นกะได้',
];

interface FormState {
  title: string;
  description: string;
  requirements: string;
  benefits: string[];
  otherBenefits: string;
  salaryMin: string;
  salaryMax: string;
  salaryVisible: boolean;
  jobType: string;
  workModel: string;
  locationProvince: string;
  locationDistrict: string;
  companyAddress: string;
  mapUrl?: string;
  requiredSkills: string[];
  positions: number;
  workingDays: string;
  startTime: string;
  endTime: string;
  canOnlineInterview: boolean;
  isQuickApply: boolean;
  welcomeRecentGrads: boolean;
  education: string;
  category: string;
  jobFunction: string;
  qualificationGender: string;
  qualificationAgeMin: string;
  qualificationAgeMax: string;
  qualificationExperience: string;
  additionalQualifications: string[];
  contactName: string;
  contactPhone: string;
  transportation: string[];
  companyImages: string[];
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

export default function AdminEditJobPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const params = useParams();
  const jobId = params.id as string;
  const { user, loading: authLoading } = useAuth();

  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [loadingJob, setLoadingJob] = useState(true);
  const [jobError, setJobError] = useState('');

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    requirements: '',
    benefits: [] as string[],
    otherBenefits: '',
    salaryMin: '',
    salaryMax: '',
    salaryVisible: true,
    jobType: 'FULL_TIME',
    workModel: 'ONSITE',
    locationProvince: '',
    locationDistrict: '',
    companyAddress: '',
    mapUrl: '',
    requiredSkills: [],
    positions: 1,
    workingDays: '5 วัน/สัปดาห์',
    startTime: '',
    endTime: '',
    canOnlineInterview: false,
    isQuickApply: false,
    welcomeRecentGrads: false,
    education: '',
    category: '',
    jobFunction: '',
    qualificationGender: '',
    qualificationAgeMin: '',
    qualificationAgeMax: '',
    qualificationExperience: '',
    additionalQualifications: [],
    contactName: '',
    contactPhone: '',
    transportation: [],
    companyImages: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [transportInput, setTransportInput] = useState('');
  const [additionalQualInput, setAdditionalQualInput] = useState('');

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.push('/');
      return;
    }
  }, [user, authLoading, router]);

  // Fetch job data using admin API
  useEffect(() => {
    if (!user || user.role !== 'ADMIN') return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    fetch(`${API_URL}/admin/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => {
        if (!r.ok) throw new Error('ไม่พบข้อมูลงาน');
        return r.json();
      })
      .then((data) => {
        console.log('Job data', data);
        // Parse benefits
        let parsedBenefits: string[] = [];
        let parsedOtherBenefits = '';

        if (Array.isArray(data.benefits)) {
          parsedBenefits = data.benefits.filter((b: string) => !b.startsWith('สวัสดิการอื่นๆ: '));
          const otherBenefitMatch = data.benefits.find((b: string) =>
            b.startsWith('สวัสดิการอื่นๆ: '),
          );
          if (otherBenefitMatch) {
            parsedOtherBenefits = otherBenefitMatch.replace('สวัสดิการอื่นๆ: ', '').trim();
          }
        }

        setForm({
          title: data.title || '',
          description: data.description || '',
          requirements: data.requirements || '',
          benefits: parsedBenefits,
          otherBenefits: parsedOtherBenefits,
          salaryMin: data.salaryMin ? data.salaryMin.toString() : '',
          salaryMax: data.salaryMax ? data.salaryMax.toString() : '',
          salaryVisible: data.salaryVisible ?? true,
          jobType: data.jobType || 'FULL_TIME',
          workModel: data.workModel || 'ONSITE',
          locationProvince: data.locationProvince || '',
          locationDistrict: data.locationDistrict || '',
          companyAddress: data.companyAddress || '',
          mapUrl: data.mapUrl || '',
          requiredSkills: data.requiredSkills || [],
          positions: data.positions || 1,
          workingDays: data.workingDays || '5 วัน/สัปดาห์',
          startTime: data.startTime || '',
          endTime: data.endTime || '',
          canOnlineInterview: data.canOnlineInterview || false,
          isQuickApply: data.isQuickApply || false,
          welcomeRecentGrads: data.welcomeRecentGrads || false,
          education: data.education || '',
          category: data.category || '',
          jobFunction: data.jobFunction || '',
          qualificationGender: data.qualificationGender || '',
          qualificationAgeMin: data.qualificationAgeMin ? data.qualificationAgeMin.toString() : '',
          qualificationAgeMax: data.qualificationAgeMax ? data.qualificationAgeMax.toString() : '',
          qualificationExperience: data.qualificationExperience
            ? data.qualificationExperience.toString()
            : '',
          additionalQualifications: (() => {
            const quals = Array.isArray(data.additionalQualifications)
              ? [...data.additionalQualifications]
              : [];
            if (data.welcomeRecentGrads && !quals.includes('ยินดีรับนักศึกษาจบใหม่')) {
              quals.unshift('ยินดีรับนักศึกษาจบใหม่');
            }
            return quals;
          })(),
          contactName: data.contactName || '',
          contactPhone: data.contactPhone || '',
          transportation: Array.isArray(data.transportation) ? data.transportation : [],
          companyImages: Array.isArray(data.companyImages) ? data.companyImages : [],
        });
        setCompanyId(data.companyId);
        setCompanyName(data.company?.name || 'บริษัท');
        setJobTitle(data.title || '');
        setLoadingJob(false);
      })
      .catch((err) => {
        setJobError(err.message);
        setLoadingJob(false);
      });
  }, [user, jobId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.requiredSkills.includes(s)) {
      setForm((prev) => ({ ...prev, requiredSkills: [...prev.requiredSkills, s] }));
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string) => {
    setForm((prev) => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter((s) => s !== skill),
    }));
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!companyId) {
      setError('ไม่พบข้อมูลบริษัท');
      return;
    }
    if (form.requiredSkills.length === 0) {
      setError('กรุณาเพิ่มทักษะที่ต้องการอย่างน้อย 1 รายการ');
      return;
    }

    setSaving(true);
    const token = localStorage.getItem('accessToken');

    try {
      const combinedBenefits = [...form.benefits];
      if (form.otherBenefits.trim()) {
        combinedBenefits.push(`สวัสดิการอื่นๆ: ${form.otherBenefits.trim()}`);
      }

      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements,
        benefits: combinedBenefits.length > 0 ? combinedBenefits : undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        salaryVisible: form.salaryVisible,
        jobType: form.jobType,
        workModel: form.workModel,
        locationProvince: form.locationProvince || undefined,
        locationDistrict: form.locationDistrict || undefined,
        companyAddress: form.companyAddress || undefined,
        mapUrl: form.mapUrl || undefined,
        requiredSkills: form.requiredSkills,
        positions: Number(form.positions) || 1,
        workingDays: form.workingDays || undefined,
        startTime:
          form.workingDays === 'บริษัทกำหนดเลือก' ? form.startTime || undefined : undefined,
        endTime: form.workingDays === 'บริษัทกำหนดเลือก' ? form.endTime || undefined : undefined,
        canOnlineInterview: form.canOnlineInterview,
        isQuickApply: form.isQuickApply,
        welcomeRecentGrads: form.additionalQualifications.includes('ยินดีรับนักศึกษาจบใหม่'),
        education: form.education || undefined,
        category: form.category || undefined,
        jobFunction: form.jobFunction || undefined,
        qualificationGender: form.qualificationGender || undefined,
        qualificationAgeMin: form.qualificationAgeMin
          ? Number(form.qualificationAgeMin)
          : undefined,
        qualificationAgeMax: form.qualificationAgeMax
          ? Number(form.qualificationAgeMax)
          : undefined,
        qualificationExperience: form.qualificationExperience
          ? Number(form.qualificationExperience)
          : undefined,
        additionalQualifications:
          form.additionalQualifications.length > 0 ? form.additionalQualifications : undefined,
        contactName: form.contactName || undefined,
        contactPhone: form.contactPhone || undefined,
        transportation: form.transportation.length > 0 ? form.transportation : undefined,
        companyImages: form.companyImages.length > 0 ? form.companyImages : undefined,
      };

      const res = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        throw new Error(msg || 'บันทึกไม่สำเร็จ');
      }

      router.push('/admin/jobs');
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'เกิดข้อผิดพลาด'));
      setSaving(false);
    }
  };

  if (authLoading || loadingJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (jobError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">🏢</div>
            <div className="text-gray-700 font-semibold mb-2">{jobError}</div>
            <button
              onClick={() => router.push('/admin/jobs')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium"
            >
              กลับหน้าจัดการงาน
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">แก้ไขงาน: {jobTitle}</h1>
          <p className="text-gray-500 mt-1">บริษัท: {companyName}</p>
        </div>
        <button
          onClick={() => router.push('/admin/jobs')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-800 rounded-lg text-sm font-bold hover:bg-gray-400 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> ย้อนกลับ
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลพื้นฐาน</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อตำแหน่งงาน *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น Software Developer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ประเภทงาน *</label>
              <select
                name="jobType"
                value={form.jobType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">รูปแบบการทำงาน *</label>
              <select
                name="workModel"
                value={form.workModel}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {WORK_MODELS.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">หมวดหมู่งาน</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- เลือกหมวดหมู่ --</option>
                {JOB_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Description & Requirements */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">รายละเอียด</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คำอธิบายงาน</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="อธิบายรายละเอียดของงาน..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">คุณสมบัติที่ต้องการ</label>
              <textarea
                name="requirements"
                value={form.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ระบุคุณสมบัติที่ต้องการ..."
              />
            </div>
          </div>
        </div>

        {/* Salary */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">เงินเดือน</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                name="salaryVisible"
                checked={form.salaryVisible}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">แสดงเงินเดือน</label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เงินเดือนต่ำสุด</label>
                <input
                  type="number"
                  name="salaryMin"
                  value={form.salaryMin}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">เงินเดือนสูงสุด</label>
                <input
                  type="number"
                  name="salaryMax"
                  value={form.salaryMax}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">สถานที่ทำงาน</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จังหวัด</label>
              <input
                type="text"
                name="locationProvince"
                value={form.locationProvince}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น กรุงเทพมหานคร"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">อำเภอ</label>
              <input
                type="text"
                name="locationDistrict"
                value={form.locationDistrict}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น สีลม"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ที่อยู่บริษัท</label>
              <textarea
                name="companyAddress"
                value={form.companyAddress}
                onChange={handleChange}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="ที่อยู่ที่ตั้งของบริษัท"
              />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">ทักษะที่ต้องการ *</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="พิมพ์ทักษะและกด Enter"
              />
              <button
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> เพิ่ม
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.requiredSkills.map((skill) => (
                <div
                  key={skill}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Positions & Working Days */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">ข้อมูลอื่นๆ</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">จำนวนตำแหน่งที่เปิด</label>
              <input
                type="number"
                name="positions"
                value={form.positions}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">วันทำงาน</label>
              <input
                type="text"
                name="workingDays"
                value={form.workingDays}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="เช่น 5 วัน/สัปดาห์"
              />
            </div>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                name="canOnlineInterview"
                checked={form.canOnlineInterview}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">สามารถสัมภาษณ์ออนไลน์ได้</label>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                name="isQuickApply"
                checked={form.isQuickApply}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <label className="text-sm font-medium text-gray-700">เปิดใช้งาน Quick Apply</label>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
          <button
            onClick={() => router.push('/admin/jobs')}
            className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  );
}
