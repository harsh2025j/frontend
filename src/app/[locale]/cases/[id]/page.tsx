"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Gavel, Scale, Calendar, FileText, Download, Share2, Layers } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import Loader from "@/components/ui/Loader";

export default function CaseDetailPage({ caseId: propId, isModal = false }: { caseId?: string; isModal?: boolean }) {
    useDocTitle("Case Details | Sajjad Husain Law Associates");
    const params = useParams();
    const router = useRouter();
    const finalCaseId = propId || (params?.id as string);
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (finalCaseId) {
            fetchCaseDetails(finalCaseId);
        }
    }, [finalCaseId]);

    const fetchCaseDetails = async (id: string) => {
        try {
            const response = await casesService.getById(id);
            setCaseData(response.data.data);
        } catch (error) {
            console.error("Error fetching case details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Case Details..." /></div>;
    if (!caseData) return <div className="p-12 text-center text-gray-500 font-medium">Case not found</div>;

    const caseTitle = caseData.title || "Case Title Not Available";
    const statusColor =
        caseData.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
            caseData.status === "closed" ? "bg-gray-100 text-gray-800 border-gray-200" :
                caseData.status === "filed" ? "bg-blue-100 text-blue-800 border-blue-200" :
                    "bg-green-100 text-green-800 border-green-200";

    return (
        <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans text-gray-800">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
                {!isModal ? (
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-600 hover:text-[#0A2342] transition-colors font-medium text-sm"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                ) : (
                    <div />
                )}
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition text-sm">
                        <Share2 size={16} />
                        Share
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition shadow-md text-sm font-medium"
                    >
                        <Download size={16} />
                        Download
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="space-y-8">

                    {/* Header Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A2342]"></div>
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-[#0A2342] leading-tight flex-1">
                                {caseTitle}
                            </h1>
                            <span className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${statusColor}`}>
                                {caseData.status}
                            </span>
                        </div>

                        <div className="mb-6 flex flex-wrap gap-2">
                            <span className="inline-flex items-center px-3 py-1 rounded bg-blue-50 text-[#0A2342] text-sm font-mono font-bold border border-blue-100">
                                {caseData.caseNumber}
                            </span>
                        </div>

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 pb-6 border-t border-b border-gray-100">
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Court</span>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <Gavel size={16} className="text-[#C9A227] shrink-0" />
                                    <span className="line-clamp-2">{caseData.court || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Case Type</span>
                                <div className="flex items-center gap-2 text-gray-800 font-medium capitalize">
                                    <Layers size={16} className="text-[#C9A227] shrink-0" />
                                    <span>{caseData.caseType || "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Filing Date</span>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <Calendar size={16} className="text-[#C9A227] shrink-0" />
                                    <span>{caseData.filingDate ? formatDate(caseData.filingDate) : "N/A"}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Next Hearing</span>
                                <div className="flex items-center gap-2 text-gray-800 font-medium">
                                    <Scale size={16} className="text-[#C9A227] shrink-0" />
                                    <span className={caseData.nextHearingDate ? "text-[#0A2342] font-semibold" : "text-gray-400 italic"}>
                                        {caseData.nextHearingDate ? formatDate(caseData.nextHearingDate) : "Not Scheduled"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parties Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center gap-2">
                            <Scale size={18} className="text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Parties & Counsels</h2>
                        </div>
                        <div className="p-6 sm:p-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 relative">
                                {/* Vertical divider on md screens */}
                                <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-100 -translate-x-1/2"></div>

                                <div>
                                    <h3 className="text-sm font-bold text-[#9A7D1C] mb-4 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                                        Petitioner Side
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Petitioner</span>
                                            <span className="text-base font-medium text-gray-900">{caseData.petitioner || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Advocate</span>
                                            <span className="text-base text-gray-700">{caseData.petitionerAdvocate || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-[#9A7D1C] mb-4 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                                        Respondent Side
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Respondent</span>
                                            <span className="text-base font-medium text-gray-900">{caseData.respondent || "N/A"}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-1">Advocate</span>
                                            <span className="text-base text-gray-700">{caseData.respondentAdvocate || "N/A"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {caseData.description && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-b border-gray-200 flex items-center gap-2">
                                <FileText size={18} className="text-gray-500" />
                                <h2 className="text-lg font-semibold text-gray-800">Case Description</h2>
                            </div>
                            <div className="p-6 sm:p-8">
                                <div className="prose max-w-none text-gray-700 leading-relaxed bg-[#fdfdfd] p-6 border border-gray-100 rounded-lg whitespace-pre-wrap">
                                    {caseData.description}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
