'use client';

import { useState, useEffect } from 'react';
import { useRouter, Link } from '@/i18n/routing';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CompanyLogo } from '@/components/CompanyLogo';
import { useLocale } from 'next-intl';
import { useTranslator } from '@/hooks/useTranslator';
import { Translate } from '@/components/Translate';
import { CheckCircle2, Bookmark, ExternalLink, Trash2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

const PROVINCE_EN_MAP: Record<string, string> = {
  'กรุงเทพมหานคร': 'Bangkok', 'กระบี่': 'Krabi', 'กาญจนบุรี': 'Kanchanaburi',
  'กาฬสินธุ์': 'Kalasin', 'กำแพงเพชร': 'Kamphaeng Phet', 'ขอนแก่น': 'Khon Kaen',
  'จันทบุรี': 'Chanthaburi', 'ฉะเชิงเทรา': 'Chachoengsao', 'ชลบุรี': 'Chonburi',
  'ชัยนาท': 'Chainat', 'ชัยภูมิ': 'Chaiyaphum', 'ชุมพร': 'Chumphon',
  'เชียงราย': 'Chiang Rai', 'เชียงใหม่': 'Chiang Mai', 'ตรัง': 'Trang',
  'ตราด': 'Trat', 'ตาก': 'Tak', 'นครนายก': 'Nakhon Nayok',
  'นครปฐม': 'Nakhon Pathom', 'นครพนม': 'Nakhon Phanom', 'นครราชสีมา': 'Nakhon Ratchasima',
  'นครศรีธรรมราช': 'Nakhon Si Thammarat', 'นครสวรรค์': 'Nakhon Sawan', 'นนทบุรี': 'Nonthaburi',
  'นราธิวาส': 'Narathiwat', 'น่าน': 'Nan', 'บึงกาฬ': 'Bueng Kan',
  'บุรีรัมย์': 'Buri Ram', 'ปทุมธานี': 'Pathum Thani', 'ประจวบคีรีขันธ์': 'Prachuap Khiri Khan',
  'ปราจีนบุรี': 'Prachin Buri', 'ปัตตานี': 'Pattani', 'พระนครศรีอยุธยา': 'Phra Nakhon Si Ayutthaya',
  'พะเยา': 'Phayao', 'พังงา': 'Phang Nga', 'พัทลุง': 'Phatthalung',
  'พิจิตร': 'Phichit', 'พิษณุโลก': 'Phitsanulok', 'เพชรบุรี': 'Phetchaburi',
  'เพชรบูรณ์': 'Phetchabun', 'แพร่': 'Phrae', 'ภูเก็ต': 'Phuket',
  'มหาสารคาม': 'Maha Sarakham', 'มุกดาหาร': 'Mukdahan', 'แม่ฮ่องสอน': 'Mae Hong Son',
  'ยโสธร': 'Yasothon', 'ยะลา': 'Yala', 'ร้อยเอ็ด': 'Roi Et',
  'ระนอง': 'Ranong', 'ระยอง': 'Rayong', 'ราชบุรี': 'Ratchaburi',
  'ลพบุรี': 'Lopburi', 'ลำปาง': 'Lampang', 'ลำพูน': 'Lamphun', 'เลย': 'Loei',
  'ศรีสะเกษ': 'Si Sa Ket', 'สกลนคร': 'Sakon Nakhon', 'สงขลา': 'Songkhla',
  'สตูล': 'Satun', 'สมุทรปราการ': 'Samut Prakan',
  'สมุทรสงคราม': 'Samut Songkhram', 'สมุทรสาคร': 'Samut Sakhon', 'สระแก้ว': 'Sa Kaeo',
  'สระบุรี': 'Saraburi', 'สิงห์บุรี': 'Sing Buri', 'สุโขทัย': 'Sukhothai',
  'สุพรรณบุรี': 'Suphan Buri', 'สุราษฎร์ธานี': 'Surat Thani', 'สุรินทร์': 'Surin',
  'หนองคาย': 'Nong Khai', 'หนองบัวลำภู': 'Nong Bua Lamphu', 'อ่างทอง': 'Ang Thong',
  'อำนาจเจริญ': 'Amnat Charoen', 'อุดรธานี': 'Udon Thani', 'อุตรดิตถ์': 'Uttaradit',
  'อุทัยธานี': 'Uthai Thani', 'อุบลราชธานี': 'Ubon Ratchathani'
};

// ─── Types ──────────────────────────────
interface Job {
  id: string;
  title: string;
  slug: string;
  description?: string;
  requirements?: string;
  benefits?: string | string[];
  jobType: string;
  workModel: string;
  locationProvince?: string;
  locationDistrict?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryVisible: boolean;
  requiredSkills: string[];
  createdAt: string;
  status: string;
  company: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    isVerified?: boolean;
    verificationStatus?: 'UNVERIFIED' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED';
  };
}

// ─── Translations Dictionary ────────────────
const translations = {
  th: {
    title: 'งานที่บันทึกไว้',
    loading: 'กำลังโหลด...',
    savedCount: (count: number) => `บันทึกไว้ ${count} รายการ`,
    searchPlaceholder: 'ค้นหาในรายการที่บันทึก...',
    emptyNoSaved: 'ยังไม่มีงานที่บันทึกไว้',
    emptyNoMatch: 'ไม่พบงานที่ตรงกับคำค้นหา',
    emptyDescNoSaved: 'กดปุ่ม "บันทึกงาน" ที่งานที่คุณสนใจเพื่อเก็บไว้ดูภายหลัง',
    emptyDescNoMatch: 'ลองเปลี่ยนคำค้นหา',
    btnFindJob: 'ค้นหางาน',
    btnApply: 'สมัครงานนี้',
    btnFullPage: 'ดูเต็มหน้า',
    btnUnsave: 'ยกเลิกการบันทึก',
    selectJobTip: 'เลือกงานเพื่อดูรายละเอียด',
    detailTitle: 'รายละเอียดงาน',
    sectionDetail: 'รายละเอียดงาน',
    sectionRequirements: 'คุณสมบัติที่ต้องการ',
    sectionSkills: 'ทักษะที่ต้องการ',
    sectionBenefits: 'สวัสดิการ',
    salaryStructure: 'ตามโครงสร้างบริษัท',
    salaryRange: (min: string, max: string) => `${min} – ${max} บาท`,
    salaryFrom: (min: string) => `${min}+ บาท`,
    salaryTo: (max: string) => `ถึง ${max} บาท`,
    posted: 'โพสต์',
    timeJustNow: 'เพิ่งโพสต์',
    timeMinutesAgo: (m: number) => `${m} นาทีที่แล้ว`,
    timeHoursAgo: (h: number) => `${h} ชม. ที่แล้ว`,
    timeDaysAgo: (d: number) => `${d} วันที่แล้ว`,
    jobTypes: {
      FULL_TIME: 'งานประจำ',
      PART_TIME: 'พาร์ทไทม์',
      CONTRACT: 'สัญญาจ้าง',
      INTERNSHIP: 'ฝึกงาน',
      FREELANCE: 'ฟรีแลนซ์',
    },
    workModels: {
      ONSITE: 'ออฟฟิศ',
      REMOTE: 'Remote',
      HYBRID: 'Hybrid',
    }
  },
  en: {
    title: 'Saved Jobs',
    loading: 'Loading...',
    savedCount: (count: number) => `${count} saved ${count === 1 ? 'item' : 'items'}`,
    searchPlaceholder: 'Search saved jobs...',
    emptyNoSaved: 'No saved jobs yet',
    emptyNoMatch: 'No jobs match your search',
    emptyDescNoSaved: 'Click the "Save Job" button on jobs you are interested in to view them later.',
    emptyDescNoMatch: 'Try changing your search keywords.',
    btnFindJob: 'Find Jobs',
    btnApply: 'Apply Now',
    btnFullPage: 'View Full Page',
    btnUnsave: 'Unsave',
    selectJobTip: 'Select a job to view details',
    detailTitle: 'Job Details',
    sectionDetail: 'Job Description',
    sectionRequirements: 'Requirements',
    sectionSkills: 'Required Skills',
    sectionBenefits: 'Benefits',
    salaryStructure: 'Negotiable',
    salaryRange: (min: string, max: string) => `THB ${min} – ${max}`,
    salaryFrom: (min: string) => `THB ${min}+`,
    salaryTo: (max: string) => `Up to THB ${max}`,
    posted: 'Posted',
    timeJustNow: 'Just now',
    timeMinutesAgo: (m: number) => `${m}m ago`,
    timeHoursAgo: (h: number) => `${h}h ago`,
    timeDaysAgo: (d: number) => `${d}d ago`,
    jobTypes: {
      FULL_TIME: 'Full-time',
      PART_TIME: 'Part-time',
      CONTRACT: 'Contract',
      INTERNSHIP: 'Internship',
      FREELANCE: 'Freelance',
    },
    workModels: {
      ONSITE: 'On-site',
      REMOTE: 'Remote',
      HYBRID: 'Hybrid',
    }
  }
};

// ─── Helpers ────────────────
function timeAgo(dateStr: string, t: any) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return t.timeJustNow;
  if (mins < 60) return t.timeMinutesAgo(mins);
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return t.timeHoursAgo(hrs);
  return t.timeDaysAgo(Math.floor(hrs / 24));
}

function salaryText(job: Job, t: any) {
  if (!job.salaryVisible || (!job.salaryMin && !job.salaryMax)) return t.salaryStructure;
  if (job.salaryMin && job.salaryMax)
    return t.salaryRange(job.salaryMin.toLocaleString(), job.salaryMax.toLocaleString());
  if (job.salaryMin) return t.salaryFrom(job.salaryMin.toLocaleString());
  return t.salaryTo(job.salaryMax!.toLocaleString());
}

function isVerifiedCompany(company: Job['company']) {
  return company.isVerified || company.verificationStatus === 'VERIFIED';
}

function TextBlock({ text }: { text: string }) {
  const { translatedText } = useTranslator({ text });
  const content = translatedText || text;
  const isHtml = content.trimStart().startsWith('<');
  if (isHtml) {
    return (
      <div
        className="text-gray-600 text-sm leading-relaxed prose prose-sm max-w-none break-words whitespace-pre-wrap [word-break:break-word]
          [&_*]:max-w-full [&_*]:break-words
          prose-headings:text-gray-800 prose-headings:font-semibold
          prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
          prose-ul:pl-5 prose-ol:pl-5 prose-li:my-0.5
          prose-strong:text-gray-800 prose-em:text-gray-600
          prose-hr:border-gray-200"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  }
  return (
    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words [word-break:break-word]">
      {content}
    </p>
  );
}

const CompanyAvatar = CompanyLogo;

// ─── Main Component ─────────────────────
export default function SavedJobsPage() {
  const router = useRouter();
  const rawLocale = useLocale();
  const locale = (rawLocale === 'en' ? 'en' : 'th') as 'th' | 'en';
  const t = translations[locale] || translations.th;

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load slugs from localStorage then fetch each job
  useEffect(() => {
    const slugs = JSON.parse(localStorage.getItem('savedJobs') || '[]') as string[];
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all(
      slugs.map((slug) =>
        fetch(`${API_URL}/jobs/${slug}`)
          .then((r) => (r.ok ? r.json() : null))
          .catch(() => null),
      ),
    )
      .then((results) => {
        const valid = results.filter(Boolean) as Job[];
        setJobs(valid);
        if (valid.length > 0) setSelectedJob(valid[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Remove a job from saved list
  const handleUnsave = (slug: string) => {
    const slugs = JSON.parse(localStorage.getItem('savedJobs') || '[]') as string[];
    const updated = slugs.filter((s) => s !== slug);
    localStorage.setItem('savedJobs', JSON.stringify(updated));

    setJobs((prev) => prev.filter((j) => j.slug !== slug));

    setSelectedJob((prev) => {
      if (prev?.slug === slug) {
        const remaining = jobs.filter((j) => j.slug !== slug);
        return remaining[0] || null;
      }
      return prev;
    });
  };

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return job.title.toLowerCase().includes(q) || job.company.name.toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fb]">
      <Navbar />

      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <Bookmark className="w-6 h-6 text-[#E00016] fill-[#E00016]" />
            <div>
              <h1 className="text-2xl font-bold text-[#020263]">{t.title}</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {loading ? t.loading : t.savedCount(jobs.length)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-[1400px] mx-auto px-6 py-6 w-full">
        <div className="flex gap-6 items-start">
          {/* ═══ LEFT: JOB LIST ═══ */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Search */}
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-700 focus:outline-none focus:border-[#020263] focus:ring-2 focus:ring-[#020263]/10 transition-all"
              />
            </div>

            {/* Loading Skeleton */}
            {loading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-2xl p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 bg-gray-200 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-2/3" />
                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                        <div className="flex gap-2">
                          <div className="h-6 bg-gray-100 rounded-full w-20" />
                          <div className="h-6 bg-gray-100 rounded-full w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && filteredJobs.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
                <Bookmark className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-bold text-lg">
                  {jobs.length === 0 ? t.emptyNoSaved : t.emptyNoMatch}
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  {jobs.length === 0 ? t.emptyDescNoSaved : t.emptyDescNoMatch}
                </p>
                {jobs.length === 0 && (
                  <button
                    onClick={() => router.push('/jobs')}
                    className="mt-5 px-6 py-2.5 bg-[#E00016] text-white rounded-xl font-semibold text-sm hover:bg-[#A80010] transition-colors cursor-pointer"
                  >
                    {t.btnFindJob}
                  </button>
                )}
              </div>
            )}

            {/* Job Cards */}
            <div className="flex-1 min-w-0">
              {!loading && filteredJobs.length > 0 && (
                <div className="space-y-3">
                  {filteredJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-left bg-white border-2 rounded-2xl p-5 transition-all hover:drop-shadow-md cursor-pointer group ${selectedJob?.id === job.id
                        ? 'border-[#020263] ring-2 ring-[#020263]/10'
                        : 'border-gray-200 hover:border-[#020263]/40'
                        }`}
                    >
                      <div className="flex gap-4 items-start">
                        <CompanyAvatar company={job.company} size="md" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-bold text-[#020263] text-base leading-snug line-clamp-1 group-hover:text-blue-600 transition-colors">
                                <Translate text={job.title} />
                              </h3>
                              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                                {isVerifiedCompany(job.company) && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                )}
                                <p className="text-sm text-gray-500 truncate">{job.company.name}</p>
                              </div>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUnsave(job.slug);
                              }}
                              title={t.btnUnsave}
                              className="shrink-0 p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {job.locationProvince && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                📍 {locale === 'en' ? (PROVINCE_EN_MAP[job.locationProvince] || job.locationProvince) : job.locationProvince}
                                {job.locationDistrict ? ` · ${job.locationDistrict}` : ''}
                              </span>
                            )}
                            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                              {t.jobTypes[job.jobType as keyof typeof t.jobTypes] || job.jobType}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                              {t.workModels[job.workModel as keyof typeof t.workModels] || job.workModel}
                            </span>
                            {job.salaryVisible && (job.salaryMin || job.salaryMax) && (
                              <span className="text-xs text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full font-medium">
                                💰 {salaryText(job, t)}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-gray-400 mt-2">
                            {t.posted} {timeAgo(job.createdAt, t)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ═══ RIGHT: JOB DETAIL (สลับโหมดเฉพาะความกว้างหน้าจอไม่เกิน 700px เท่านั้น) ═══ */}
          {selectedJob && (
            <div className="max-[700px]:fixed max-[700px]:inset-0 max-[700px]:z-50 max-[700px]:bg-black/40 max-[700px]:backdrop-blur-xs max-[700px]:flex max-[700px]:items-end max-[700px]:justify-center max-[700px]:p-0 max-[700px]:touch-none max-[700px]:overscroll-none min-[701px]:static min-[701px]:bg-transparent min-[701px]:backdrop-blur-none min-[701px]:z-auto min-[701px]:block w-full min-[701px]:w-[420px] xl:w-[480px] shrink-0 transition-opacity">
              {/* พื้นหลังข้างหลังกดปิดได้เมื่ออยู่บนจอเล็กกว่าหรือเท่ากับ 700px */}
              <div className="absolute inset-0 min-[701px]:hidden" onClick={() => setSelectedJob(null)} />

              <div className="bg-white max-[700px]:rounded-t-3xl min-[701px]:rounded-2xl border border-gray-200 min-[701px]:sticky min-[701px]:top-6 overflow-hidden w-full max-[700px]:max-h-[85vh] flex flex-col relative z-10 max-[700px]:shadow-xl min-[701px]:shadow-none max-[700px]:animate-slide-up max-[700px]:overscroll-contain">

                {/* ปุ่มปิดสำหรับหน้าจอมือถือที่กว้างไม่เกิน 700px */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 min-[701px]:hidden bg-gray-50">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.detailTitle}</span>
                  <button
                    onClick={() => setSelectedJob(null)}
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Header */}
                <div className="p-5 sm:p-6 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <CompanyAvatar company={selectedJob.company} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-base sm:text-lg text-[#020263] leading-snug line-clamp-2">
                        <Translate text={selectedJob.title} />
                      </h2>
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        {isVerifiedCompany(selectedJob.company) && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        )}
                        <p className="text-sm text-gray-500 truncate">{selectedJob.company.name}</p>
                      </div>
                      {/* Badges */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-0.5 rounded-full font-medium">
                          {t.jobTypes[selectedJob.jobType as keyof typeof t.jobTypes] || selectedJob.jobType}
                        </span>
                        <span className="text-xs bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-0.5 rounded-full font-medium">
                          {t.workModels[selectedJob.workModel as keyof typeof t.workModels] || selectedJob.workModel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location + Salary */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 text-sm text-gray-600">
                    {selectedJob.locationProvince && (
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        {locale === 'en'
                          ? PROVINCE_EN_MAP[selectedJob.locationProvince] || selectedJob.locationProvince
                          : selectedJob.locationProvince}
                        {selectedJob.locationDistrict ? ` · ${selectedJob.locationDistrict}` : ''}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 text-orange-500 font-medium">
                      💰 {salaryText(selectedJob, t)}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 mt-5">
                    <div className="flex gap-2 flex-1">
                      <Link
                        href={`/jobs/${selectedJob.slug}`}
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#E00016] hover:bg-[#A80010] text-white font-bold rounded-xl transition-colors text-sm cursor-pointer"
                      >
                        {t.btnApply}
                      </Link>

                      <Link
                        href={`/jobs/${selectedJob.slug}`}
                        target="_blank"
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-3 border-2 border-[#020263] text-[#020263] hover:bg-[#020263] hover:text-white font-bold rounded-xl transition-colors text-sm text-center cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        <span>{t.btnFullPage}</span>
                      </Link>
                    </div>

                    <button
                      onClick={() => handleUnsave(selectedJob.slug)}
                      title={t.btnUnsave}
                      className="w-full sm:w-auto flex justify-center items-center p-3 border border-gray-200 rounded-xl text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4 fill-[#E00016] stroke-[#E00016]" />
                    </button>
                  </div>
                </div>

                {/* Detail Body */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 min-[701px]:max-h-[calc(100vh-320px)] break-words">
                  {selectedJob.description && (
                    <div>
                      <h3 className="font-bold text-[#020263] text-sm mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#E00016] rounded-full inline-block" />
                        {t.sectionDetail}
                      </h3>
                      <TextBlock text={selectedJob.description} />
                    </div>
                  )}

                  {selectedJob.requirements && (
                    <div>
                      <h3 className="font-bold text-[#020263] text-sm mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#E00016] rounded-full inline-block" />
                        {t.sectionRequirements}
                      </h3>
                      <TextBlock text={selectedJob.requirements} />
                    </div>
                  )}

                  {selectedJob.benefits && (
                    <div>
                      <h3 className="font-bold text-[#020263] text-sm mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#E00016] rounded-full inline-block" />
                        {t.sectionBenefits}
                      </h3>
                      {Array.isArray(selectedJob.benefits) ? (
                        <ul className="list-disc list-inside text-gray-600 text-sm leading-relaxed space-y-1">
                          {selectedJob.benefits.map((b: string, i: number) => (
                            <li key={i}><Translate text={b} /></li>
                          ))}
                        </ul>
                      ) : (
                        <TextBlock text={selectedJob.benefits as string} />
                      )}
                    </div>
                  )}

                  {selectedJob.requiredSkills && selectedJob.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="font-bold text-[#020263] text-sm mb-2 flex items-center gap-2">
                        <span className="w-1 h-4 bg-[#E00016] rounded-full inline-full" />
                        {t.sectionSkills}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedJob.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="text-xs text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1 rounded-full break-all"
                          >
                            <Translate text={skill} />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}