'use client';

import { useEffect, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

/* --- Shared Types --- */
type JobItem = {
    id: string;
    titleKey: string;
    count: number;
    href: string;
    icon: React.ReactNode;
};

type HomeCategoryApiSection = {
    id: string;
    items: { id: string; title: string; count: number; href: string }[];
};

/* --- Employer-specific Icons (ใช้ไอคอนเดิมที่คุณมี แต่เปลี่ยนสีให้ดูเป็น Professional) --- */
const SalesIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="8" y="20" width="32" height="22" rx="3" fill="#FED7AA" />
        <rect x="12" y="6" width="24" height="16" rx="2" fill="#FB923C" />
        <path d="M20 28h8v14h-8z" fill="#FDBA74" />
        <circle cx="24" cy="14" r="4" fill="#FFF7ED" />
        <path
            d="M6 20l18-14 18 14"
            stroke="#EA580C"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const FoodIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <ellipse cx="24" cy="36" rx="18" ry="6" fill="#FED7AA" />
        <path d="M6 30c0-10 8-20 18-20s18 10 18 20" fill="#FB923C" />
        <path d="M6 30h36" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="16" cy="24" r="2" fill="#FFF7ED" />
        <circle cx="24" cy="22" r="2" fill="#FFF7ED" />
        <circle cx="32" cy="24" r="2" fill="#FFF7ED" />
        <rect x="22" y="8" width="4" height="4" rx="2" fill="#FFF7ED" />
    </svg>
);

const ServiceIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="18" r="10" fill="#FB923C" />
        <circle cx="24" cy="18" r="6" fill="#FFF7ED" />
        <path d="M14 34c0-5.523 4.477-10 10-10s10 4.477 10 10" fill="#FED7AA" />
        <path
            d="M8 40c0-8.837 7.163-16 16-16s16 7.163 16 16"
            stroke="#EA580C"
            strokeWidth="2.5"
            fill="none"
        />
        <path
            d="M20 16l4 4 4-4"
            stroke="#EA580C"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

const StoreIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="18" width="36" height="24" rx="2" fill="#FED7AA" />
        <path d="M4 18h40l-4-12H8L4 18z" fill="#FB923C" />
        <rect x="18" y="28" width="12" height="14" rx="1" fill="#FFF7ED" />
        <rect x="10" y="24" width="6" height="6" rx="1" fill="#FDBA74" />
        <rect x="32" y="24" width="6" height="6" rx="1" fill="#FDBA74" />
        <circle cx="12" cy="18" r="3" fill="#FFF7ED" opacity="0.6" />
        <circle cx="24" cy="18" r="3" fill="#FFF7ED" opacity="0.6" />
        <circle cx="36" cy="18" r="3" fill="#FFF7ED" opacity="0.6" />
    </svg>
);

const MarketingIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="10" width="28" height="28" rx="4" fill="#BFDBFE" />
        <path
            d="M14 30l6-8 5 5 9-13"
            stroke="#2563EB"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        <circle cx="36" cy="14" r="8" fill="#3B82F6" />
        <path
            d="M33 14l2 2 4-4"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        <rect x="10" y="34" width="4" height="6" rx="1" fill="#93C5FD" />
        <rect x="18" y="30" width="4" height="10" rx="1" fill="#60A5FA" />
        <rect x="26" y="26" width="4" height="14" rx="1" fill="#3B82F6" />
    </svg>
);

const TechIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="4" y="8" width="40" height="26" rx="3" fill="#BFDBFE" />
        <rect x="8" y="12" width="32" height="18" rx="1" fill="#1E40AF" />
        <path
            d="M16 20l-4 4 4 4"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        <path
            d="M32 20l4 4-4 4"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
        <path d="M22 28l4-12" stroke="#93C5FD" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="16" y="36" width="16" height="3" rx="1.5" fill="#93C5FD" />
        <rect x="12" y="39" width="24" height="2" rx="1" fill="#BFDBFE" />
    </svg>
);

const AccountingIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="6" y="6" width="36" height="36" rx="4" fill="#BFDBFE" />
        <rect x="10" y="10" width="28" height="28" rx="2" fill="#EFF6FF" />
        <path d="M18 18h12M18 24h12M18 30h8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" />
        <circle cx="13" cy="18" r="2" fill="#3B82F6" />
        <circle cx="13" cy="24" r="2" fill="#60A5FA" />
        <circle cx="13" cy="30" r="2" fill="#93C5FD" />
        <path d="M34 28l-3 6h6l-3-6z" fill="#2563EB" />
        <rect x="32" y="32" width="4" height="6" rx="0.5" fill="#1E40AF" />
    </svg>
);

const DocumentIcon = () => (
    <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
        <rect x="10" y="4" width="24" height="32" rx="3" fill="#BFDBFE" />
        <rect x="14" y="8" width="16" height="24" rx="1" fill="#EFF6FF" />
        <path d="M18 14h8M18 19h8M18 24h5" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" />
        <rect x="16" y="32" width="20" height="12" rx="2" fill="#3B82F6" />
        <path d="M22 38h8M22 41h5" stroke="#BFDBFE" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="36" cy="14" r="6" fill="#60A5FA" />
        <path
            d="M34 14l2 2 3-3"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
        />
    </svg>
);

/* --- ข้อมูลสายงานเบื้องต้น (เปลี่ยน URL เป็น /resumes) --- */
const storefrontResumes: JobItem[] = [
    {
        id: 'sales',
        titleKey: 'sales',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('งานขาย')}`,
        icon: <SalesIcon />
    },
    {
        id: 'food',
        titleKey: 'food',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('อาหารและเครื่องดื่ม')}`,
        icon: <FoodIcon />
    },
    {
        id: 'service',
        titleKey: 'service',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('บริการลูกค้า')}`,
        icon: <ServiceIcon />
    },
    {
        id: 'retail',
        titleKey: 'retail',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('ค้าปลีก')}`,
        icon: <StoreIcon />
    },
];

const officeResumes: JobItem[] = [
    {
        id: 'marketing',
        titleKey: 'marketing',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('การตลาด')}`,
        icon: <MarketingIcon />
    },
    {
        id: 'tech',
        titleKey: 'tech',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('เทคโนโลยีสารสนเทศ')}`,
        icon: <TechIcon />
    },
    {
        id: 'accounting',
        titleKey: 'accounting',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('บัญชี')}`,
        icon: <AccountingIcon />
    },
    {
        id: 'admin',
        titleKey: 'admin',
        count: 0,
        href: `/resumes?query=${encodeURIComponent('ธุรการ')}`,
        icon: <DocumentIcon />
    },
];

/* --- Helper: เปลี่ยนหน่วยนับ --- */
function formatResumeCount(count: number, locale: string) {
    return new Intl.NumberFormat(locale === 'th' ? 'th-TH' : 'en-US').format(count);
}

function SectionHeader({
    title,
    icon,
    gradient,
}: {
    title: string;
    icon: React.ReactNode;
    gradient: string;
}) {
    return (
        <div
            className={`relative flex items-center gap-3 px-6 py-3.5 rounded-xl mb-5 overflow-hidden ${gradient}`}
        >
            {/* Decorative circles */}
            <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
            <div className="absolute -right-8 -bottom-6 w-20 h-20 rounded-full bg-white/5" />
            <div className="relative z-10">{icon}</div>
            <h3 className="relative z-10 text-xl sm:text-[1.35rem] font-bold text-white tracking-wide">
                {title}
            </h3>
        </div>
    );
}



/* --- Employer Job Card Component --- */
function EmployerJobCard({
    job,
    accentColor,
    hoverBorderColor,
    countColor,
}: {
    job: JobItem;
    accentColor: string;
    hoverBorderColor: string;
    countColor: string;
}) {
    const t = useTranslations('JobCategories');
    const locale = useLocale();
    const displayTitle = t(job.titleKey as any);

    return (
        <Link
            href={job.href}
            className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-white border-2 border-gray-100 ${hoverBorderColor} hover:shadow-xl transition-all duration-300 min-h-[150px] overflow-hidden hover:-translate-y-1`}>

            {/* Top accent line */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-2xl`} />

            <div className="flex items-start justify-between gap-3">
                <h4 className="font-bold text-gray-800 text-[1.1rem] leading-snug z-10">
                    {displayTitle}
                </h4>
                <div className="shrink-0 group-hover:scale-110 transition-transform duration-300">
                    {job.icon}
                </div>
            </div>

            <div className="flex items-baseline gap-1.5 mt-4 z-10">
                <span className={`text-[1.8rem] sm:text-[2.1rem] font-black leading-none tracking-tight ${countColor}`}>
                    {formatResumeCount(job.count, locale)}
                </span>
                <span className="text-sm font-semibold text-gray-400">เรซูเม่</span>
            </div>
            {/* Hover glow */}
            <div
                className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full ${accentColor} opacity-0 group-hover:opacity-[0.07] blur-2xl transition-opacity duration-500`}
            />
        </Link>
    );
}

export function EmployerJobCategories() {
    const [storefrontSection, setStorefrontSection] = useState<JobItem[]>(storefrontResumes);
    const [officeSection, setOfficeSection] = useState<JobItem[]>(officeResumes);
    const t = useTranslations('JobCategories');

    interface ApiItem {
        id: string;
        title: string;
        count: number;
        href: string;
    }

    const mergeForEmployer = (fallbackJobs: JobItem[], apiSection?: HomeCategoryApiSection): JobItem[] => {
        if (!apiSection?.items?.length) return fallbackJobs;

        const apiItemsById = new Map(apiSection.items.map(item => [item.id, item]));

        return fallbackJobs.map((job) => {
            const apiItem = apiItemsById.get(job.id);

            return {
                ...job,
                count: apiItem ? apiItem.count : 0,
                href: job.href
            };
        });
    };

    useEffect(() => {
        let active = true;

        fetch(`${API_URL}/resumes/homepage-categories`)
            .then((res) => {
                if (!res.ok) throw new Error('Network response was not ok');
                return res.json();
            })
            .then((data) => {
                if (!active) return;

                const sections = Array.isArray(data?.sections) ? data.sections : [];

                const sfData = sections.find((s: any) => s.id === 'storefront');
                const ofData = sections.find((s: any) => s.id === 'office');

                if (sfData) {
                    setStorefrontSection(prev => mergeForEmployer(prev, sfData));
                }
                if (ofData) {
                    setOfficeSection(prev => mergeForEmployer(prev, ofData));
                }
            })
            .catch((err) => {
                console.error("Fetch error:", err);
                if (!active) return;
                setStorefrontSection(storefrontResumes);
                setOfficeSection(officeResumes);
            });

        return () => { active = false; };
    }, []);

    return (
        <section className="py-12 bg-white font-sans">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-bold text-[#020263]">{t('title')}</h2>
                    <p className="text-gray-500 mt-2">{t('subtitle')}</p>
                </div>



                <div className="mb-10">
                    <SectionHeader
                        title="กลุ่มงานบริการและหน้าร้าน"
                        gradient="bg-gradient-to-r from-[#020263] via-[#1a1a8a] to-[#E71F29]"
                        icon={
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                                <path d="M3 21V8l9-5 9 5v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {storefrontSection.map((job) => (
                            <EmployerJobCard
                                key={job.id}
                                job={job}
                                accentColor="bg-gradient-to-r from-[#E71F29] to-[#F97316]"
                                hoverBorderColor="hover:border-[#E71F29]/40"
                                countColor="text-[#E71F29]"

                            />
                        ))}
                    </div>
                </div>


                <div className="mb-6">
                    <SectionHeader
                        title="กลุ่มงานออฟฟิศและวิชาชีพ"
                        gradient="bg-gradient-to-r from-[#020263] via-[#1a1a8a] to-[#3B82F6]"
                        icon={
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" className="text-white">
                                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="2" />
                                <path d="M9 22v-4h6v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <circle cx="8.5" cy="7" r="1" fill="currentColor" />
                                <circle cx="12" cy="7" r="1" fill="currentColor" />
                                <circle cx="15.5" cy="7" r="1" fill="currentColor" />
                            </svg>
                        }
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {officeSection.map((job) => (
                            <EmployerJobCard
                                key={job.id}
                                job={job}
                                accentColor="bg-gradient-to-r from-[#3B82F6] to-[#6366F1]"
                                hoverBorderColor="hover:border-[#3B82F6]/40"
                                countColor="text-[#3B82F6]"
                            />
                        ))}
                    </div>
                </div>


                {/* Footer Action */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/resumes"
                        className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl bg-[#020263] text-white font-bold text-sm hover:bg-[#0a0a7a] hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                    >
                        <LayoutGrid className="w-4.5 h-4.5 stroke-[2.5] group-hover:rotate-90 transition-transform duration-300" />
                        {t('viewAllButton')}
                    </Link>
                </div>
            </div>
        </section>
    );
}