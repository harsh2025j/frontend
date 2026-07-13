"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Landmark, Scale, Info, FileText, Calendar, Link as LinkIcon, History, User, Gavel, Printer } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import SavePostButton from "@/components/ui/SavePostButton";
import { formatDate } from "@/utils/dateUtils";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

export default function JudgmentView({ judgmentId: propId, isModal = false }: { judgmentId?: string; isModal?: boolean }) {
    useDocTitle("Legal Record | Sajjad Husain Law Associates");
    const params = useParams();
    const router = useRouter();
    const finalJudgmentId = propId || (params?.id as string);
    const [judgment, setJudgment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (finalJudgmentId) {
            fetchJudgmentDetails(finalJudgmentId);
        }
    }, [finalJudgmentId]);

    const fetchJudgmentDetails = async (id: string) => {
        try {
            const response = await judgmentsService.getById(id);
            const data = response.data.data;
            setJudgment(data);

            const searchParams = new URLSearchParams(window.location.search);
            if (searchParams.get("print") === "true") {
                setTimeout(() => {
                    window.print();
                }, 800);
            }
        } catch (error) {
            console.error("Error fetching judgment details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Retrieving Judicial Record..." /></div>;
    if (!judgment) return <div className="p-12 text-center text-gray-500 font-medium font-serif">Judgment not found</div>;

    const courtName = judgment.court || judgment.case?.court || "THE HIGH COURT OF JURISDICTION";
    const displayDate = judgment.judgmentDate ? formatDate(judgment.judgmentDate) : "Date N/A";

    const leadJudgesList = judgment.leadJudges && judgment.leadJudges.length > 0
        ? judgment.leadJudges.map((j: any) => j.name).join(", ")
        : null;
    const coramJudgesList = judgment.coram && judgment.coram.length > 0
        ? judgment.coram.map((j: any) => j.name).join(", ")
        : null;

    const coramText = leadJudgesList
        ? (coramJudgesList ? `${leadJudgesList} ; ${coramJudgesList}` : leadJudgesList)
        : (judgment.scrapedJudgeNames || judgment.benchStrength || judgment.bench || "Hon'ble Judges");

    return (
        <div className="min-h-screen bg-gray-100 pb-16 font-serif text-gray-900 leading-relaxed">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A4; margin: 20mm 15mm 20mm 15mm; }
                    body { background: white !important; color: #000 !important; }
                    header, footer, nav, .no-print, .print-hidden, .bg-white.border-b, button { display: none !important; }
                    .max-w-5xl { max-width: none !important; width: 100% !important; margin: 0 !important; box-shadow: none !important; border: none !important; padding: 0 !important; }
                    .document-container { box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; }
                    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .bg-gray-50, .bg-gray-100, .bg-amber-50, .bg-amber-50\/40 { background-color: transparent !important; }
                    .text-gray-500, .text-gray-400 { color: #555 !important; }
                    .border-gray-200, .border-gray-300 { border-color: #eee !important; }
                    .citation-box { background: transparent !important; border: none !important; border-bottom: 1px solid #ccc !important; padding: 2px 0 !important; }
                }
                .judgment-body p { margin-bottom: 1.5rem; text-align: justify; text-indent: 1.5rem; }
            `}} />

            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm print-hidden">
                {!isModal ? (
                    <button
                        onClick={() => router.back()}
                        className="group flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium text-sm font-sans"
                    >
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Back to List
                    </button>
                ) : <div />}
                <div className="flex items-center gap-3 font-sans">
                    <SavePostButton postId={judgment.id} className="bg-gray-50 border border-gray-200" iconSize={18} />
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition text-sm font-medium shadow-sm">
                        <Printer size={16} />
                        Print Record
                    </button>
                </div>
            </div>

            <div className="max-w-5xl mx-auto mt-8 bg-white shadow-2xl border border-gray-300 print:shadow-none print:border-none print:mt-0 px-10 py-12 md:px-20 md:py-20 relative overflow-hidden">
                <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none select-none">
                    <Landmark size={240} className="text-black" />
                </div>

                {(judgment.neutralCitationHC || judgment.neutralCitationSC) && (
                    <div className="text-right mb-4 font-sans text-xs font-bold text-gray-500 uppercase tracking-widest flex flex-col items-end gap-1">
                        {judgment.neutralCitationSC && <div className="citation-box px-2 py-1">SC Citation: {judgment.neutralCitationSC}</div>}
                        {judgment.neutralCitationHC && <div className="citation-box px-2 py-1">HC Citation: {judgment.neutralCitationHC}</div>}
                    </div>
                )}

                <div className="text-center mb-12 border-b-4 border-double border-black pb-8">
                    <h1 className="text-3xl md:text-3xl font-bold uppercase tracking-[0.2em] mb-4 leading-tight">
                        IN {courtName}
                    </h1>

                    <div className="space-y-1 font-sans text-sm font-bold uppercase tracking-wider text-gray-700">
                        <p>{judgment.judgmentType || "Judgment"}</p>
                        {(judgment.case?.caseNumber || judgment.scrapedCaseNumber) && <p className="text-lg">Case No: {judgment.case?.caseNumber || judgment.scrapedCaseNumber}</p>}
                    </div>

                    {judgment.isLandmark && (
                        <div className="inline-block bg-amber-50 text-amber-900 border border-amber-200 px-4 py-1.5 font-bold tracking-[0.1em] uppercase text-xs mt-6 rounded-md shadow-inner">
                            Latest Landmark Decision
                        </div>
                    )}
                </div>

                <div className="mb-12 text-xl leading-relaxed">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 font-bold text-justify">
                            <span className="text-sm font-sans font-normal text-gray-500 block mb-1">Between:</span>
                            <span className="uppercase">{judgment.petitioner || judgment.case?.petitioner || "Petitioner"}</span>
                            {judgment.petitionerPartyType && <span className="text-sm italic ml-2">({judgment.petitionerPartyType})</span>}
                            <span className="block mt-1 font-normal italic text-base">... Petitioner/Appellant</span>
                        </div>
                    </div>

                    <div className="text-center font-bold tracking-[0.5em] my-8 text-gray-400">VERSUS</div>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 font-bold text-justify">
                            <span className="uppercase">{judgment.respondent || judgment.case?.respondent || "Respondent"}</span>
                            {judgment.respondentPartyType && <span className="text-sm italic ml-2">({judgment.respondentPartyType})</span>}
                            <span className="block mt-1 font-normal italic text-base">... Respondent/Defendant</span>
                        </div>
                    </div>
                </div>

                <div className="mb-12 border-l-4 border-gray-200 pl-6 py-4 bg-gray-50/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                        <div>
                            <span className="text-xs font-sans font-bold uppercase text-gray-400 block mb-1">Presiding Bench / Coram:</span>
                            <p className="text-lg font-bold leading-snug">{coramText}</p>
                            {judgment.judgeRole && <p className="text-sm font-sans font-medium text-gray-500 mt-1 italic">Role: {judgment.judgeRole}</p>}
                        </div>
                        <div>
                            <span className="text-xs font-sans font-bold uppercase text-gray-400 block mb-1">Date of Judgment:</span>
                            <p className="text-lg font-bold">{displayDate}</p>
                            {judgment.isReserved && (
                                <div className="mt-1 flex items-center gap-2 text-sm font-sans font-medium text-amber-700">
                                    <Scale size={14} />
                                    <span>Reserved On: {judgment.reservedDateFrom ? formatDate(judgment.reservedDateFrom) : "N/A"} ({judgment.reservedDuration || "Duration N/A"})</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-12 grid grid-cols-1 md:grid-cols-1 gap-6">
                    <div className="bg-gray-50 border border-gray-100 p-8 rounded-2xl relative">
                        <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-white p-2 rounded-full border border-gray-100 shadow-sm text-gray-400">
                            <FileText size={24} />
                        </div>

                        <div className="space-y-6">
                            {judgment.legalPhrases && judgment.legalPhrases.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Legal Principles / Subject:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {judgment.legalPhrases.map((p: string, i: number) => (
                                            <span key={i} className="text-sm font-bold bg-[#0A2342] text-white px-3 py-1 rounded-sm shadow-sm">{p}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {judgment.relevantSections && judgment.relevantSections.length > 0 && (
                                <div>
                                    <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Relevant Sections / Acts:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {judgment.relevantSections.map((s: string, i: number) => (
                                            <span key={i} className="text-sm font-bold border-b-2 border-amber-400 text-amber-900 pb-0.5">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(judgment.reporterCitation || (judgment.citations && judgment.citations.length > 0)) && (
                                <div>
                                    <span className="text-[10px] font-sans font-black uppercase tracking-[0.2em] text-gray-400 block mb-2">Equivalent Citations:</span>
                                    <p className="font-mono text-sm font-bold bg-white p-2 rounded border border-gray-100 text-blue-800">
                                        {[judgment.reporterCitation, ...(judgment.citations || [])].filter(Boolean).join(" ; ")}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {(judgment.summary || (judgment.keyPoints && judgment.keyPoints.length > 0) || judgment.caseNotes) && (
                    <div className="mb-12 space-y-8">
                        {judgment.caseNotes && (
                            <div className="text-justify border-t-2 border-dashed border-gray-100 pt-6">
                                <h3 className="font-sans font-black text-sm uppercase tracking-widest text-[#0A2342] mb-4">Editorial Headnote</h3>
                                <div className="text-base leading-relaxed text-gray-700 italic" dangerouslySetInnerHTML={{ __html: sanitizeHtml(judgment.caseNotes) }} />
                            </div>
                        )}

                        <div className="bg-amber-50/40 p-10 border-l-[12px] border-[#0A2342] rounded-r-3xl">
                            <h3 className="font-sans font-black text-sm uppercase tracking-widest text-[#0A2342] mb-6">Brief Summary</h3>
                            <div className="text-lg text-justify font-medium leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: sanitizeHtml(judgment.summary) }} />

                            {judgment.keyPoints && judgment.keyPoints.length > 0 && (
                                <div className="space-y-4">
                                    <span className="font-sans font-black text-[10px] uppercase text-gray-400 block mb-2">Ratio Decidendi / Principal Observations:</span>
                                    <ul className="space-y-4">
                                        {judgment.keyPoints.map((point: string, idx: number) => (
                                            <li key={idx} className="flex gap-4 group">
                                                <span className="w-8 h-8 rounded-full bg-white border border-[#0A2342]/10 flex items-center justify-center text-xs font-bold text-[#0A2342] shrink-0 group-hover:bg-[#0A2342] group-hover:text-white transition-colors">{idx + 1}</span>
                                                <p className="text-base font-bold text-gray-800 self-center">{point}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-12 border-y-2 border-double border-gray-200 py-10 px-4 group">
                    <h3 className="text-center font-sans font-black text-xs uppercase tracking-[0.3em] text-gray-400 mb-8 group-hover:text-[#0A2342] transition-colors">Appearances</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-sm">
                        <div className="space-y-4">
                            <div>
                                <span className="font-sans font-bold text-[10px] uppercase text-gray-400 block mb-1">For Petitioner / Appellant:</span>
                                <p className="font-bold underline decoration-dotted decoration-gray-300 underline-offset-4">{judgment.counselDetails?.petitionerCounsel || judgment.petitionerCounsel || "Not Recorded"}</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <span className="font-sans font-bold text-[10px] uppercase text-gray-400 block mb-1">For Respondent / State:</span>
                                <p className="font-bold underline decoration-dotted decoration-gray-300 underline-offset-4">{judgment.counselDetails?.respondentCounsel || judgment.respondentCounsel || "Not Recorded"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-justify pt-10">
                    <div className="text-center mb-16">
                        <h2 className="text-2xl font-bold uppercase tracking-[0.5em] inline-block border-b-2 border-black pb-2 px-12">
                            JUDGMENT
                        </h2>
                    </div>

                    <div className="judgment-body text-xl md:text-xl lg:text-xl leading-[2] text-gray-900 marker:text-black font-merriweather">
                        {judgment.fullText ? (
                            <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(judgment.fullText) }} />
                        ) : (
                            <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                                <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                                <p className="italic text-gray-400 font-sans text-sm font-bold uppercase tracking-widest">
                                    Full digitized text of this judgment is currently unavailable
                                </p>
                            </div>
                        )}
                    </div>

                    {judgment.outcome && (
                        <div className="mt-20 pt-12 border-t-8 border-double border-gray-200 text-2xl group">
                            <span className="font-sans font-black text-xs uppercase tracking-[0.2em] text-amber-600 block mb-6">Direction / Final Order:</span>
                            <div className="italic font-bold bg-[#0A2342]/5 p-8 rounded-2xl border border-[#0A2342]/10 transition-all hover:bg-[#0A2342]/10">
                                <p className="relative z-10">"{judgment.outcome}"</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-24 text-center text-gray-300 tracking-[1em] font-sans font-black text-xs">
                        DOCUMENT ENDS
                    </div>
                </div>
            </div>

            <div className="print-hidden max-w-5xl mx-auto mt-8 mb-20 px-10 md:px-20 py-12 bg-white rounded-3xl border border-gray-200 shadow-xl ">
                <div className="flex items-center gap-3 mb-10">
                    <div className="p-2 bg-amber-50 rounded-lg">
                        <Info size={24} className="text-[#C9A227]" />
                    </div>
                    <h2 className="text-xl font-bold font-sans uppercase tracking-widest text-[#0A2342]">Record Metadata & Administrative Info</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-sm font-sans">
                    <MetadataItem icon={<Landmark size={14} />} label="Court Level" value={judgment.case?.courtLevel || "Not Specified"} />
                    <MetadataItem icon={<Gavel size={14} />} label="Filing Mode" value={judgment.implementationDelivery || "Standard"} />
                    <MetadataItem icon={<Scale size={14} />} label="Bench Type" value={judgment.benchStrength || "Division"} />
                    <MetadataItem icon={<Calendar size={14} />} label="Next List Date" value={judgment.nextListDate ? formatDate(judgment.nextListDate) : "No Date Set"} />
                    <MetadataItem icon={<History size={14} />} label="Case History" value={judgment.historyLink} isLink />
                    <MetadataItem icon={<LinkIcon size={14} />} label="Ref. Portal" value={judgment.citationManagementSite} isLink />
                    <MetadataItem icon={<User size={14} />} label="Article Creator" value={judgment.articleCreator} />
                    <MetadataItem icon={<Calendar size={14} />} label="Complied By" value={judgment.natureOfCompliance} />
                </div>

                {judgment.additionalNotes && (
                    <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
                        <span className="text-[10px] font-sans font-black uppercase text-gray-400 block mb-2">Administrative Notes:</span>
                        <p className="text-sm font-medium text-gray-600 leading-relaxed font-sans">{judgment.additionalNotes}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function MetadataItem({ icon, label, value, isLink = false }: { icon: React.ReactNode, label: string, value?: string, isLink?: boolean }) {
    if (!value) return null;
    return (
        <div className="flex flex-col gap-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-2">
                {icon}
                {label}
            </span>
            {isLink ? (
                <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-bold break-all transition-colors underline decoration-blue-200 underline-offset-4">
                    View Reference <ArrowLeft className="inline-block rotate-180" size={12} />
                </a>
            ) : (
                <span className="font-bold text-gray-800 break-words">{value}</span>
            )}
        </div>
    );
}
