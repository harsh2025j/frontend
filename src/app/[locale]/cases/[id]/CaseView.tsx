"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Gavel, Scale, Download } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import Loader from "@/components/ui/Loader";

export default function CaseView({ caseId: propId, isModal = false }: { caseId?: string; isModal?: boolean }) {
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

    const DataRow = ({ label, value, fullWidth = false, isLast = false }: { label: string; value: any; fullWidth?: boolean; isLast?: boolean }) => (
        <div className={`${fullWidth ? "col-span-full" : ""} py-2.5 ${!isLast ? "border-b border-gray-100" : ""} flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1`}>
            <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400 sm:w-1/3 shrink-0">{label}</span>
            <span className="text-sm font-semibold text-[#0A2342] sm:text-right">{value || "—"}</span>
        </div>
    );

    const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mb-10 page-break-inside-avoid">
            <h3 className="text-sm font-black text-amber-700 uppercase tracking-[0.2em] border-b-2 border-amber-100 pb-2 mb-6 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
                {children}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans print:bg-white pb-20">
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 15mm; }
                    body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .no-print { display: none !important; }
                    .document-container { box-shadow: none !important; border: 1px solid #e5e7eb !important; margin: 0 !important; padding: 0 !important; max-width: 100% !important; border-radius: 0 !important; }
                    .page-break-inside-avoid { page-break-inside: avoid; }
                    .bg-\\[\\#0A2342\\] { background-color: #0A2342 !important; color: white !important; -webkit-print-color-adjust: exact; }
                }
            `}} />

            <div className="no-print bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 px-6 py-4 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    {!isModal ? (
                        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#0A2342] font-bold text-sm transition-colors">
                            <ArrowLeft size={18} /> Back to Search
                        </button>
                    ) : <div />}
                    <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2.5 bg-[#0A2342] text-white rounded-xl hover:bg-[#153a66] transition-all shadow-lg shadow-blue-900/20 text-sm font-bold">
                        <Download size={18} /> Download Case Report
                    </button>
                </div>
            </div>

            <div className={`${isModal ? "w-full" : "max-w-5xl mx-auto"} px-4 sm:px-6 md:px-10 py-6 md:py-10 print:p-0 print:max-w-none print:w-full`}>
                <div className="document-container bg-white shadow-2xl shadow-slate-200 border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden print:rounded-none">
                    <div className="bg-[#0A2342] p-10 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4 opacity-70">
                                    <Scale size={16} />
                                    <span className="text-[10px] uppercase tracking-[0.3em] font-black">Official Case Record</span>
                                </div>
                                <h1 className="text-2xl md:text-3xl font-serif font-black leading-tight mb-2">{caseData.court || "In the Honorable Court"}</h1>
                                <p className="text-amber-400 font-serif italic text-lg opacity-90">{caseData.title || "Subject Pending Registration"}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2 shrink-0">
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 bg-white/10 ${caseData.status === "closed" ? "text-red-300" : "text-green-300"}`}>
                                    Status: {caseData.status}
                                </div>
                                <span className="text-[10px] text-white/50">Report Generated: {new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 md:p-14">
                        <Section title="Basic Records">
                            <DataRow label="Case Number" value={caseData.caseNumber} />
                            <DataRow label="Diary Number" value={caseData.diaryNumber} />
                            <DataRow label="CNR Number" value={caseData.cnrNumber} />
                            <DataRow label="Filing Date" value={caseData.filingDate ? formatDate(caseData.filingDate) : null} />
                            <DataRow label="Registration Date" value={caseData.registrationDate ? formatDate(caseData.registrationDate) : null} />
                            <DataRow label="Case Category" value={caseData.category} />
                        </Section>

                        <Section title="Jurisdiction Details">
                            <DataRow label="Court Level" value={caseData.courtLevel} />
                            <DataRow label="Bench Location" value={caseData.benchLocation} />
                            <DataRow label="Bench Type" value={caseData.benchType} />
                            <DataRow label="Court Hall #" value={caseData.courtHallNumber} />
                            <DataRow label="State" value={caseData.state} />
                            <DataRow label="Origin District" value={caseData.districtOfOrigin} />
                        </Section>

                        <div className="mb-12 page-break-inside-avoid">
                            <h3 className="text-sm font-black text-amber-700 uppercase tracking-[0.2em] border-b-2 border-amber-100 pb-2 mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                Parties & Representation
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                                <div className="bg-white p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-black">P</div>
                                        <h4 className="font-black text-[#0A2342] text-xs uppercase tracking-wider">Petitioner Side</h4>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Affiant / Name</label>
                                            <p className="text-sm font-bold text-gray-900 leading-relaxed">{caseData.petitioner || "N/A"}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Advocate on Record</label>
                                            <p className="text-sm text-blue-700 font-semibold">{caseData.petitionerAdvocate || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-8 border-l border-gray-100">
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-black">R</div>
                                        <h4 className="font-black text-[#0A2342] text-xs uppercase tracking-wider">Respondent Side</h4>
                                    </div>
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Affiant / Name</label>
                                            <p className="text-sm font-bold text-gray-900 leading-relaxed">{caseData.respondent || "N/A"}</p>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Advocate on Record</label>
                                            <p className="text-sm text-blue-700 font-semibold">{caseData.respondentAdvocate || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Section title="Legal Framework">
                            <DataRow label="Relevant Acts" value={caseData.acts} fullWidth />
                            <DataRow label="Under Sections" value={caseData.underSections} fullWidth />
                            <DataRow label="Case Origin" value={caseData.caseOriginType} />
                            <DataRow label="Practice Area" value={caseData.practiceArea} />
                        </Section>

                        <Section title="Hearing & Timeline">
                            <DataRow label="First Hearing" value={caseData.firstHearingDate ? formatDate(caseData.firstHearingDate) : null} />
                            <DataRow label="Last Hearing" value={caseData.lastHearingDate ? formatDate(caseData.lastHearingDate) : null} />
                            <DataRow label="Next Hearing" value={caseData.nextHearingDate ? formatDate(caseData.nextHearingDate) : null} />
                            <DataRow label="Purpose" value={caseData.nextHearingPurpose} />
                            <DataRow label="Case Stage" value={caseData.stageOfCase} />
                        </Section>

                        {caseData.firNumber && (
                            <Section title="Criminal Investigation">
                                <DataRow label="FIR Number" value={caseData.firNumber} />
                                <DataRow label="Police Station" value={caseData.policeStation} />
                                <DataRow label="FIR Date" value={caseData.firDate ? formatDate(caseData.firDate) : null} />
                            </Section>
                        )}

                        {caseData.disposalNature && (
                            <Section title="Final Disposition">
                                <DataRow label="Judgment Date" value={caseData.judgmentDate ? formatDate(caseData.judgmentDate) : null} />
                                <DataRow label="Disposal Nature" value={caseData.disposalNature} />
                                <DataRow label="Judgment Summary" value={caseData.judgmentSummary} fullWidth />
                            </Section>
                        )}

                        {caseData.description && (
                            <div className="mt-6 page-break-inside-avoid">
                                <h3 className="text-sm font-black text-amber-700 uppercase tracking-[0.2em] border-b-2 border-amber-100 pb-2 mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                    Brief of the Matter
                                </h3>
                                <div className="bg-slate-50/50 p-8 rounded-2xl border border-gray-100 font-serif text-gray-700 leading-relaxed text-sm whitespace-pre-wrap">
                                    {caseData.description}
                                </div>
                            </div>
                        )}

                        <div className="mt-20 pt-10 border-t border-gray-100 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] font-black">End of Case Record</p>
                            <div className="mt-4 flex justify-around text-[8px] text-gray-300 font-bold">
                                <span>Ref: {caseData.id}</span>
                                <span>Firm: Sajjad Husain Law Associates</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
