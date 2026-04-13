"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useParams, useRouter } from "next/navigation";
import { 
    ArrowLeft, 
    Gavel, 
    Calendar, 
    MapPin, 
    Award, 
    Book, 
    Scroll, 
    GraduationCap, 
    ShieldCheck, 
    ExternalLink,
    Building2,
    Briefcase
} from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import Loader from "@/components/ui/Loader";
import { formatDate } from "@/utils/dateUtils";

export default function JudgeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [judge, setJudge] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useDocTitle(`${judge?.name || 'Judge Profile'} | Sajjad Husain Law Associates`);

    useEffect(() => {
        if (params.id) {
            fetchJudgeDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgeDetails = async (id: string) => {
        try {
            const response = await judgesService.getById(id);
            setJudge(response.data.data);
        } catch (error) {
            console.error("Error fetching judge details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader size="lg" text="Elite Profile Loading..." /></div>;
    if (!judge) return <div className="min-h-screen flex items-center justify-center">Judge not found</div>;

    const infoGridItem = (icon: any, label: string, value: string | React.ReactNode, colorClass = "text-blue-600") => (
        <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className={`p-2.5 rounded-xl bg-gray-50 ${colorClass}`}>
                {React.createElement(icon, { size: 20 })}
            </div>
            <div>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">{label}</p>
                <div className="text-sm font-bold text-gray-900 leading-tight">{value}</div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Banner */}
            <div className="bg-[#0A2342] h-64 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-transparent"></div>
                <div className="max-w-6xl mx-auto px-6 h-full flex flex-col justify-between py-8 relative">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center bg-white/10 hover:bg-white/20 text-white rounded-full transition-all backdrop-blur-md border border-white/20"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    
                    <div className="pt-2">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-blue-500/20 text-blue-100 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-400/30 backdrop-blur-sm">
                                Judicial Profile
                            </span>
                            {judge.isVerified && (
                                <span className="flex items-center gap-1.5 bg-green-500/20 text-green-200 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-green-400/30 backdrop-blur-sm">
                                    <ShieldCheck size={12} /> Verified Data
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-24">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 p-8 border border-white">
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                <div className="w-44 h-44 rounded-2xl bg-gray-100 border-4 border-white shadow-xl flex-shrink-0 overflow-hidden -mt-20 md:-mt-16 bg-gradient-to-br from-gray-50 to-gray-200">
                                    {judge.photoUrl ? (
                                        <img src={judge.photoUrl} alt={judge.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <Gavel size={64} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <h1 className="text-4xl font-black text-[#0A2342] leading-tight">
                                        <span className="text-blue-600 mr-2">{judge.prefix}</span>
                                        {judge.name}
                                    </h1>
                                    <p className="text-xl font-bold text-gray-600 flex items-center justify-center md:justify-start gap-2">
                                        <Building2 size={20} className="text-blue-500" />
                                        {judge.designation}
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                                        <div className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 shadow-sm flex items-center gap-2">
                                            <MapPin size={14} /> {judge.court}
                                        </div>
                                        {judge.isServing ? (
                                            <div className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg border border-green-100 shadow-sm flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Serving
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-bold rounded-lg border border-orange-100 shadow-sm">
                                                Retired
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
                                {infoGridItem(Calendar, "Appointment Date", formatDate(judge.appointmentDate), "text-blue-600")}
                                {infoGridItem(Gavel, "Appointment Type", judge.appointmentType || "Direct", "text-indigo-600")}
                                {infoGridItem(Book, "Seniority No.", judge.seniorityNumber || "N/A", "text-purple-600")}
                            </div>
                        </div>

                        {/* Biography / Content */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                            <h2 className="text-2xl font-extrabold text-[#0A2342] flex items-center gap-3">
                                <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                                Detailed Biography
                            </h2>
                            <div 
                                className="prose prose-blue max-w-none text-gray-700 leading-relaxed font-medium"
                                dangerouslySetInnerHTML={{ __html: judge.biography || "Professional judicial profile content is being updated." }}
                            />
                        </div>

                        {/* Records & Notable Work */}
                        {(judge.notableJudgments || judge.books || judge.awards) && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-8">
                                <h2 className="text-2xl font-extrabold text-[#0A2342] flex items-center gap-3">
                                    <div className="w-1.5 h-8 bg-purple-600 rounded-full"></div>
                                    Notable Records
                                </h2>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {judge.notableJudgments && (
                                        <div className="space-y-3">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-800 uppercase text-xs tracking-widest px-3 py-1 bg-gray-50 rounded-lg w-fit">
                                                <Scroll size={14} className="text-gray-400" /> Key Judgments
                                            </h4>
                                            <div className="text-sm text-gray-600 whitespace-pre-wrap pl-1">{judge.notableJudgments}</div>
                                        </div>
                                    )}
                                    {judge.books && (
                                        <div className="space-y-3">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-800 uppercase text-xs tracking-widest px-3 py-1 bg-gray-50 rounded-lg w-fit">
                                                <Book size={14} className="text-gray-400" /> Publications
                                            </h4>
                                            <div className="text-sm text-gray-600 whitespace-pre-wrap pl-1">{judge.books}</div>
                                        </div>
                                    )}
                                    {judge.awards && (
                                        <div className="md:col-span-2 space-y-3 pt-4 border-t border-gray-50">
                                            <h4 className="flex items-center gap-2 font-bold text-gray-800 uppercase text-xs tracking-widest px-3 py-1 bg-gray-50 rounded-lg w-fit">
                                                <Award size={14} className="text-gray-400" /> Awards & Honours
                                            </h4>
                                            <div className="text-sm text-gray-600 whitespace-pre-wrap pl-1">{judge.awards}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-6">
                            <h3 className="text-lg font-extrabold text-gray-900 border-b border-gray-50 pb-4">Background Info</h3>
                            
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                                        <GraduationCap size={14} /> Education
                                    </p>
                                    <p className="text-sm font-bold text-gray-700 leading-snug">{judge.educationalQualifications || "Data unavailable"}</p>
                                </div>
                                
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                                        <Briefcase size={14} /> Professional Experience
                                    </p>
                                    <p className="text-sm font-bold text-gray-700">{judge.yearsOfPractice || "0"}+ Years in Practice</p>
                                    <p className="text-xs text-gray-500 mt-1">{judge.barEnrollment}</p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-2 flex items-center gap-2 tracking-widest">
                                        Specialization Area
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {judge.specialization?.length > 0 ? judge.specialization.map((s: string) => (
                                            <span key={s} className="px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase">
                                                {s}
                                            </span>
                                        )) : <span className="text-gray-400 text-xs italic">General Practice</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {judge.dataSource?.label && (
                            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl shadow-blue-200">
                                <p className="text-xs font-bold text-blue-200 uppercase tracking-widest mb-3">Official Verification</p>
                                <p className="text-sm font-medium mb-4">Confirmed from Official High Court Digital Gazette and Records.</p>
                                <a 
                                    href={judge.dataSource.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center justify-between gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl transition-all text-xs font-bold"
                                >
                                    Source: {judge.dataSource.label}
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        )}

                        <div className="p-6 bg-gray-100/50 rounded-2xl border border-dashed border-gray-200">
                            <p className="text-[10px] text-gray-400 font-bold uppercase text-center tracking-tighter">
                                Last Record Update: {formatDate(judge.updatedAt || judge.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
