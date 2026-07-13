"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { Judge } from "@/data/services/judges-service/judges.types";
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
    Briefcase,
    Mail,
    Phone as PhoneIcon,
    Globe,
    CheckCircle2,
    Clock,
    User,
    Search
} from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import Loader from "@/components/ui/Loader";
import { formatDate } from "@/utils/dateUtils";
import Image from "next/image";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export default function JudgeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [judge, setJudge] = useState<Judge | null>(null);
    const [loading, setLoading] = useState(true);

    useDocTitle(`${judge?.name || 'Judicial Profile'} | Sajjad Husain Law Associates`);

    useEffect(() => {
        if (params.id) {
            fetchJudgeDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgeDetails = async (id: string) => {
        try {
            const response = await judgesService.getById(id);
            setJudge(response.data.data || response.data);
        } catch (error) {
            console.error("Error fetching judge details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="text-center space-y-4">
                <Loader size="lg" />
                <p className="text-[#0A2342] font-black uppercase tracking-[0.3em] text-[10px] animate-pulse">Accessing Registry...</p>
            </div>
        </div>
    );

    if (!judge) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
                <User size={40} />
            </div>
            <h1 className="text-2xl font-black text-[#0A2342] mb-2">Profile Not Found</h1>
            <p className="text-gray-500 mb-8">The requested judicial record could not be retrieved.</p>
            <button onClick={() => router.back()} className="px-8 py-3 bg-[#0A2342] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-900 transition-all">
                Return to Search
            </button>
        </div>
    );

    const DetailItem = ({ icon: Icon, label, value, colorClass = "text-blue-500" }: { icon: any, label: string, value: string | React.ReactNode, colorClass?: string }) => (
        <div className="group bg-white/50 backdrop-blur-sm p-4 rounded-xl border border-gray-100 flex items-start gap-4 hover:bg-white hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300">
            <div className={`p-2.5 rounded-lg bg-gray-50 ${colorClass} group-hover:scale-105 transition-transform`}>
                <Icon size={16} />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">{value || "N/A"}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans selection:bg-[#C9A227] selection:text-white">
            {/* Immersive Header Banner */}
            <div className="bg-[#0A2342] h-[350px] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/50 via-transparent to-[#0A2342]"></div>

                {/* Decorative Elements */}
                <div className="absolute top-10 left-10 w-64 h-64 bg-[#C9A227]/10 rounded-full blur-[100px]"></div>
                <div className="absolute top-30 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]"></div>

                <div className="max-w-7xl mx-auto px-6 h-full flex flex-col justify-between py-10 relative z-10">
                    <button
                        onClick={() => router.back()}
                        className="group w-20 h-10 flex items-center justify-center bg-white/10 hover:bg-[#C9A227] text-white rounded-lg transition-all backdrop-blur-md border border-white/20 shadow-xl"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform mr-2" />
                        Back
                    </button>

                    <div className="pb-12">
                        <div className="flex flex-wrap items-center gap-4 mb-4">
                            <span className="px-3 py-1 bg-blue-500/10 text-blue-200 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-blue-400/20 backdrop-blur-sm flex items-center gap-2">
                                <Clock size={11} /> Judicial Registry Item
                            </span>
                            {judge.isVerified && (
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-200 text-[9px] font-black uppercase tracking-[0.2em] rounded border border-emerald-400/20 backdrop-blur-sm flex items-center gap-2">
                                    <ShieldCheck size={11} /> Authenticated Profile
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 -mt-35 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Primary Identity Column */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Profile Hero Card */}
                        <div className="bg-white rounded-xl shadow-lg shadow-gray-200/40 p-8 border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gray-50/50 rounded-full -mr-24 -mt-24 -z-0"></div>

                            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                                <div className="w-52 h-64 rounded-lg bg-gray-100 border-4 border-white shadow-lg flex-shrink-0 overflow-hidden -mt-15 bg-gradient-to-br from-gray-50 to-gray-200 group ">
                                    {judge.photoUrl ? (
                                        <Image
                                            src={judge.photoUrl}
                                            alt={judge.name}
                                            width={208}
                                            height={256}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <User size={70} />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-4 pt-4">
                                    <div>
                                        <h1 className="text-5xl font-black text-[#0A2342] leading-[1.1] mb-2 tracking-tight">
                                            {judge.prefix && <span className="text-[#C9A227] font-medium mr-2">{judge.prefix}</span>}
                                            {judge.name}
                                        </h1>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                                            <p className="text-xl font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <Gavel size={20} className="text-[#C9A227]" />
                                                {judge.designation}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
                                        <div className="px-4 py-2 bg-[#0A2342] text-white text-[9px] font-black uppercase tracking-[0.2em] rounded shadow flex items-center gap-3">
                                            <Building2 size={14} className="text-[#C9A227]" /> {judge.court}
                                        </div>
                                        <div className={`px-4 py-2 ${judge.isServing ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-orange-50 text-orange-700 border-orange-100'} text-[9px] font-black uppercase tracking-[0.2em] rounded border shadow-sm flex items-center gap-2`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${judge.isServing ? 'bg-emerald-500 animate-pulse' : 'bg-orange-500'}`}></div>
                                            {judge.isServing ? 'Active Registry' : 'Retired / Alumni'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-gray-100">
                                <DetailItem icon={Calendar} label="Date of Appointment" value={formatDate(judge.appointmentDate)} colorClass="text-blue-600" />
                                <DetailItem icon={Award} label="Appointment Status" value={judge.appointmentType || "Official"} colorClass="text-[#C9A227]" />
                                <DetailItem icon={Scroll} label="Seniority Designation" value={judge.seniorityNumber ? `#${judge.seniorityNumber}` : "Standard"} colorClass="text-purple-600" />
                            </div>
                        </div>

                        {/* Professional Biography Section */}
                        <div className="bg-white rounded-xl shadow-md shadow-gray-200/40 p-8 border border-gray-100 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1.5 h-8 bg-[#0A2342] rounded-full"></div>
                                <h2 className="text-2xl font-black text-[#0A2342]">Professional Biography</h2>
                            </div>
                            <div
                                className="prose prose-base max-w-none text-gray-600 font-medium leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(judge.biography || "The professional judicial profile for this member is currently being curated for the digital registry. Full details will be available shortly.") }}
                            />
                        </div>

                        {/* Comprehensive Records Tracking */}
                        {(judge.notableJudgments || judge.books || judge.awards) && (
                            <div className="bg-[#0A2342] rounded-xl shadow-xl p-10 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-[#C9A227] rounded-full"></div>
                                        <h2 className="text-2xl font-black">Official Records & Citations</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        {judge.notableJudgments && (
                                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-3 bg-[#C9A227] rounded-2xl">
                                                        <CheckCircle2 size={24} className="text-[#0A2342]" />
                                                    </div>
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-[#C9A227]">Key Judgments</h4>
                                                </div>
                                                <div className="text-sm text-blue-100/80 leading-relaxed italic">{judge.notableJudgments}</div>
                                            </div>
                                        )}
                                        {judge.books && (
                                            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/10 group hover:bg-white/10 transition-all">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-3 bg-blue-500 rounded-2xl">
                                                        <Book size={24} className="text-white" />
                                                    </div>
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-blue-300">Scholarly Works</h4>
                                                </div>
                                                <div className="text-sm text-blue-100/80 leading-relaxed">{judge.books}</div>
                                            </div>
                                        )}
                                        {judge.awards && (
                                            <div className="md:col-span-2 bg-gradient-to-r from-[#C9A227]/20 to-transparent rounded-3xl p-8 border border-[#C9A227]/20">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="p-3 bg-white text-[#0A2342] rounded-2xl shadow-xl">
                                                        <Award size={24} />
                                                    </div>
                                                    <h4 className="text-sm font-black uppercase tracking-widest text-white">Honours & Recognitions</h4>
                                                </div>
                                                <div className="text-sm text-blue-50/80 font-medium">{judge.awards}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Meta Info Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Background & Stats */}
                        <div className="bg-white rounded-xl shadow-md shadow-gray-200/40 p-6 border border-gray-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50/50 rounded-full -mr-12 -mt-12"></div>
                            <h3 className="text-lg font-black text-[#0A2342] mb-6 relative z-10 flex items-center gap-3">
                                <Search size={18} className="text-[#C9A227]" />
                                Judicial Sidebar
                            </h3>

                            <div className="space-y-8 relative z-10">
                                <div className="group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Education
                                    </p>
                                    <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 group-hover:bg-blue-50 transition-colors">
                                        <p className="text-sm font-black text-[#0A2342] leading-snug">{judge.educationalQualifications || "Public data unavailable"}</p>
                                        <GraduationCap size={40} className="absolute bottom-2 right-2 text-blue-600/5" />
                                    </div>
                                </div>

                                <div className="group">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500"></div> Experience
                                    </p>
                                    <div className="p-6 bg-purple-50/50 rounded-2xl border border-purple-100 group-hover:bg-purple-50 transition-colors flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-black text-[#0A2342]">{judge.yearsOfPractice || "0"}+</p>
                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Practice Years</p>
                                        </div>
                                        <Briefcase size={32} className="text-purple-600/10" />
                                    </div>
                                    <p className="text-xs font-bold text-gray-500 mt-3 ml-2 flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-emerald-500" /> {judge.barEnrollment || "Bar Council Authenticated"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></div> Core Specialization
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(judge.specialization && judge.specialization.length > 0) ? judge.specialization.map((s: string) => (
                                            <span key={s} className="px-4 py-2 bg-gray-50 text-gray-700 text-[10px] font-black rounded-xl uppercase tracking-widest border border-gray-100 shadow-sm hover:border-[#C9A227] transition-colors">
                                                {s}
                                            </span>
                                        )) : <span className="text-gray-400 text-xs italic font-medium">Jurisprudential Generalist</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact & Verification Box */}
                        <div className="bg-[#C9A227] rounded-xl p-8 text-[#0A2342] shadow-xl shadow-amber-900/10 relative overflow-hidden group">
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/10 rounded-full group-hover:scale-125 transition-transform duration-700"></div>

                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-5 flex items-center gap-3">
                                <Globe size={16} /> Official Nexus
                            </h4>

                            <div className="space-y-4 mb-8">
                                {judge.officialEmail && (
                                    <a href={`mailto:${judge.officialEmail}`} className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl hover:bg-white/20 transition-all border border-white/10">
                                        <Mail size={20} />
                                        <span className="text-xs font-black truncate">{judge.officialEmail}</span>
                                    </a>
                                )}
                                {judge.officialPhone && (
                                    <div className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <PhoneIcon size={20} />
                                        <span className="text-xs font-black">{judge.officialPhone}</span>
                                    </div>
                                )}
                            </div>

                            {judge.dataSource?.label && (
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Authentication Source</p>
                                    <a
                                        href={judge.dataSource.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center justify-between gap-2 px-6 py-4 bg-[#0A2342] text-white rounded-[1.5rem] hover:shadow-xl transition-all text-sm font-black group/link"
                                    >
                                        <span className="truncate">{judge.dataSource.label}</span>
                                        <ExternalLink size={18} className="group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* Record Footer */}
                        <div className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm text-center">
                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-[0.3em]">
                                Registry Entry Synchronized: {formatDate(judge.updatedAt || judge.createdAt)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
