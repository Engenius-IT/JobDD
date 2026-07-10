'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FileText, CheckCircle2, XCircle, Search, Clock, ExternalLink } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface PendingCompany {
    id: string;
    name: string;
    industry?: string;
    verificationDocs: string[];
    createdAt: string;
    owner?: {
        email: string;
        firstName: string;
        lastName: string;
        phone?: string;
    };
}

interface PendingCompaniesResponse {
    data?: PendingCompany[];
}

export default function AdminVerifyCompaniesPage() {
    const { user } = useAuth();
    const [companies, setCompanies] = useState<PendingCompany[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCompany, setSelectedCompany] = useState<PendingCompany | null>(null);

    // Modal states
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchPending = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('accessToken');
            if (!token) return;

            const res = await fetch(`${API_URL}/admin/companies/pending`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const data: PendingCompaniesResponse = await res.json();
                setCompanies(Array.isArray(data.data) ? data.data : []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'ADMIN') {
            fetchPending();
        }
    }, [user]);

    const handleAction = async (companyId: string, status: 'VERIFIED' | 'REJECTED', reason?: string) => {
        if (!confirm(`ยืนยันการ${status === 'VERIFIED' ? 'อนุมัติ' : 'ปฏิเสธ'}บริษัทนี้?`)) return;

        setSubmitting(true);
        try {
            const token = localStorage.getItem('accessToken');
            const payload: { status: 'VERIFIED' | 'REJECTED'; rejectionReason?: string } = { status };
            if (reason) payload.rejectionReason = reason;

            const res = await fetch(`${API_URL}/admin/companies/${companyId}/verify`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setCompanies(prev => prev.filter(c => c.id !== companyId));
                setSelectedCompany(null);
                setShowRejectModal(false);
                setRejectionReason('');
                // Optional: Show success toast
            } else {
                alert('เกิดข้อผิดพลาดในการทำรายการ');
            }
        } catch {
            alert('ไม่สามารถทำรายการได้ในขณะนี้');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-6 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">ตรวจสอบเอกสารบริษัท</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        มี {companies.length} บริษัทยื่นคำร้องขอเผยแพร่ประกาศงาน
                    </p>
                </div>

                {/* Quick Search placeholder (Optional) */}
                <div className="relative max-w-xs w-full hidden md:block">
                    <input
                        type="text"
                        placeholder="ค้นหาชื่อบริษัท..."
                        disabled
                        className="w-full h-10 pl-10 pr-4 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* List View */}
                <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-200px)]">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700 text-sm flex justify-between items-center">
                        <span>รายการรอดำเนินการ</span>
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">{companies.length}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {companies.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-sm">
                                <CheckCircle2 className="w-10 h-10 mx-auto text-green-200 mb-2" />
                                <p>ดำเนินการครบหมดแล้ว</p>
                            </div>
                        ) : (
                            companies.map(c => (
                                <button
                                    key={c.id}
                                    onClick={() => setSelectedCompany(c)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border ${selectedCompany?.id === c.id
                                        ? 'border-blue-500 bg-blue-50 shadow-sm'
                                        : 'border-transparent hover:bg-gray-50 hover:border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="font-bold text-gray-900 text-sm truncate pr-2">{c.name}</div>
                                        <span className="text-[10px] text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full whitespace-nowrap font-medium shrink-0 flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            รอตรวจสอบ
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 truncate">{c.industry || 'ไม่ระบุอุตสาหกรรม'}</div>
                                    <div className="text-[11px] text-gray-400 mt-2 flex items-center gap-1 opacity-80">
                                        <FileText className="w-3.5 h-3.5" />
                                        แนบ {c.verificationDocs?.length || 0} ไฟล์
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="xl:col-span-2">
                    {selectedCompany ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">{selectedCompany.name}</h2>
                                        <p className="text-sm text-gray-500 mt-1">อุตสาหกรรม: {selectedCompany.industry || '-'}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-8 border border-gray-100 text-sm">
                                    <div>
                                        <span className="text-gray-400 block text-xs mb-1">ข้อมูลผู้ติดต่อ</span>
                                        <div className="font-medium text-gray-800">
                                            {selectedCompany.owner?.firstName} {selectedCompany.owner?.lastName}
                                        </div>
                                        <div className="text-gray-500 mt-0.5">{selectedCompany.owner?.email}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-400 block text-xs mb-1">วันที่ส่งคำร้อง</span>
                                        <div className="font-medium text-gray-800">
                                            {new Date(selectedCompany.createdAt).toLocaleDateString('th-TH', {
                                                year: 'numeric', month: 'long', day: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })} น.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" />
                                    เอกสารที่แนบมา ({selectedCompany.verificationDocs?.length || 0})
                                </h3>

                                {selectedCompany.verificationDocs && Array.isArray(selectedCompany.verificationDocs) && selectedCompany.verificationDocs.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedCompany.verificationDocs.map((doc, i) => {
                                            const docUrl = typeof doc === 'string' ? doc : (doc as any)?.url || '';
                                            if (!docUrl) return null;
                                            
                                            const isImage = docUrl.match(/\.(jpeg|jpg|gif|png|webp)$/i) != null;
                                            const isPdf = docUrl.match(/\.pdf$/i) != null;
                                            
                                            return (
                                                <div key={i} className="group border border-gray-200 rounded-xl overflow-hidden bg-gray-50 flex flex-col hover:border-blue-300 hover:shadow-md transition-all">
                                                    {isImage ? (
                                                        <div className="h-48 w-full bg-gray-200 relative">
                                                            <img src={docUrl} alt={`Document ${i + 1}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <a href={docUrl} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
                                                                    <ExternalLink className="w-4 h-4" /> ดูรูปเต็ม
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-48 flex flex-col items-center justify-center bg-gray-100 relative text-gray-400">
                                                            {isPdf ? (
                                                                <div className="text-center">
                                                                    <FileText className="w-12 h-12 mb-2 text-red-400" />
                                                                    <span className="text-sm font-medium text-gray-600">เอกสาร PDF</span>
                                                                </div>
                                                            ) : (
                                                                <div className="text-center">
                                                                    <FileText className="w-12 h-12 mb-2" />
                                                                    <span className="text-sm font-medium">ไฟล์เอกสาร</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <a href={docUrl} target="_blank" rel="noreferrer" className="bg-white text-gray-900 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-lg">
                                                                    <ExternalLink className="w-4 h-4" /> เปิดดูเอกสาร
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <div className="p-3 bg-white border-t border-gray-100 flex justify-between items-center">
                                                        <span className="text-xs font-medium text-gray-600 truncate">
                                                            {isPdf ? 'เอกสาร PDF' : isImage ? 'รูปภาพเอกสาร' : 'เอกสารชุดที่'} {i + 1}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                        <p className="text-gray-500 text-sm">ไม่มีไฟล์แนบส่งมา</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions Bottom Bar */}
                            <div className="p-6 bg-gray-50 border-t border-gray-200 flex gap-3 justify-end items-center rounded-b-2xl">
                                <button
                                    onClick={() => setShowRejectModal(true)}
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl border-2 border-red-200 text-red-600 font-bold text-sm bg-white hover:bg-red-50 hover:border-red-300 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" />
                                    ไม่อนุมัติ (ระบุเหตุผล)
                                </button>
                                <button
                                    onClick={() => handleAction(selectedCompany.id, 'VERIFIED')}
                                    disabled={submitting}
                                    className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 shadow-md"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    อนุมัติบริษัทนี้
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white border border-gray-200 border-dashed rounded-2xl text-center p-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="w-8 h-8 text-blue-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">เลือกบริษัทเพื่อตรวจสอบ</h3>
                            <p className="text-gray-400 text-sm max-w-sm">
                                คลิกที่รายชื่อบริษัทด้านซ้ายมือเพื่อดูข้อมูล เอกสารที่แนบมา และดำเนินการอนุมัติหรือปฏิเสธ
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Reject Modal */}
            {showRejectModal && selectedCompany && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowRejectModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        <div className="px-6 py-5 border-b border-gray-100 bg-red-50/50">
                            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-500" />
                                ไม่อนุมัติบริษัท: {selectedCompany.name}
                            </h3>
                        </div>
                        <div className="p-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                ระบุเหตุผลที่ไม่ผ่านการตรวจสอบ
                            </label>
                            <textarea
                                value={rejectionReason}
                                onChange={e => setRejectionReason(e.target.value)}
                                placeholder="เช่น เอกสารไม่ชัดเจน แจ้งให้อัปโหลดใหม่..."
                                rows={4}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-red-500 focus:bg-white transition-colors resize-none"
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                เหตุผลนี้จะถูกส่งกลับไปให้ผู้ใช้งานเห็นเพื่อทำการแก้ไขต่อไป
                            </p>
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="flex-1 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={() => {
                                    if (!rejectionReason.trim()) return alert('กรุณาระบุเหตุผล');
                                    handleAction(selectedCompany.id, 'REJECTED', rejectionReason);
                                }}
                                disabled={submitting || !rejectionReason.trim()}
                                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                ยืนยันการปฏิเสธ
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
