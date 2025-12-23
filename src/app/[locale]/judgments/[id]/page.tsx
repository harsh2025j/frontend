"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { useParams, useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { ArrowLeft } from "lucide-react";

export default function JudgmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [judgment, setJudgment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchJudgmentDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgmentDetails = async (id: string) => {
        try {
            const response = await judgmentsService.getById(id);
            setJudgment(response.data.data);
        } catch (error) {
            console.error("Error fetching judgment details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Judgment..." /></div>; if (!judgment) return <div>Judgment not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-600 hover:text-[#0A2342] transition-colors font-medium mb-4"
            >
                <ArrowLeft size={18} />
                Back
            </button>
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Judgment Details</h1>
                        <p className="text-gray-500">
                            Date: {new Date(judgment.judgmentDate).toLocaleDateString()}
                        </p>
                    </div>
                    {judgment.isLandmark && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Landmark Judgment
                        </span>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Summary</h2>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded">{judgment.summary}</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Outcome</h2>
                    <p className="text-lg font-medium text-blue-800">{judgment.outcome}</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Full Text</h2>
                    <div className="prose max-w-none bg-white border p-6 rounded">
                        {judgment.fullText}
                    </div>
                </div>

                {judgment.citations && judgment.citations.length > 0 && (
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold mb-2">Citations</h2>
                        <ul className="list-disc list-inside text-gray-700">
                            {judgment.citations.map((citation: string, index: number) => (
                                <li key={index}>{citation}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}









// "use client";

// import React, { useEffect, useState } from "react";
// import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
// import { useParams, useRouter } from "next/navigation";
// import { ArrowLeft, Download, Tag, Gavel, BookOpen, Scale, FileText, Share2 } from "lucide-react";
// import { Link } from "@/i18n/routing";

// export default function JudgmentDetailPage() {
//     const params = useParams();
//     const router = useRouter();
//     const [judgment, setJudgment] = useState<any>(null);
//     const [loading, setLoading] = useState(true);
//     const [relatedJudgments, setRelatedJudgments] = useState<any[]>([]);

//     useEffect(() => {
//         if (params.id) {
//             fetchJudgmentDetails(params.id as string);
//         }
//     }, [params.id]);

//     const fetchJudgmentDetails = async (id: string) => {
//         try {
//             const response = await judgmentsService.getById(id);
//             const data = response.data.data;
//             setJudgment(data);

//             // Fetch related judgments (Same Judge)
//             if (data.judgeId) {
//                 try {
//                     const relatedRes = await judgmentsService.getByJudge(data.judgeId);
//                     const related = (relatedRes.data.data.data || relatedRes.data.data || [])
//                         .filter((j: any) => j._id !== id && j.id !== id)
//                         .slice(0, 5);
//                     setRelatedJudgments(related);
//                 } catch (err) {
//                     console.warn("Failed to fetch related judgments", err);
//                 }
//             }
//         } catch (error) {
//             console.error("Error fetching judgment details:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     const handlePrint = () => {
//         window.print();
//     };

//  if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Judgment..." /></div>; if (!judgment) return <div>Judgment not found</div>;
//     if (!judgment) return <div className="p-12 text-center text-gray-500 font-medium">Judgment not found</div>;

//     // Use available data or fallbacks
//     const caseTitle = judgment.caseTitle || judgment.case?.title || "Case Title Not Available";
//     const courtName = judgment.court || judgment.case?.court || "Court Not Available";
//     const benchSide = judgment.benchStrength || "Division Bench"; // Mock default
//     const ratio = judgment.ratioDecidendi || "Ratio Decidendi not explicitly available for this judgment.";
//     const acts = judgment.acts || ["Indian Penal Code", "Criminal Procedure Code"]; // Mock default
//     const displayDate = judgment.judgmentDate ? new Date(judgment.judgmentDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Date N/A";

//     return (
//         <div className="min-h-screen bg-[#F8F9FA] pb-12 font-sans text-gray-800">

//             {/* Top Navigation Bar */}
//             <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm">
//                 <button
//                     onClick={() => router.back()}
//                     className="group flex items-center gap-2 text-gray-600 hover:text-[#0A2342] transition-colors font-medium text-sm"
//                 >
//                     <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
//                     Back to Results
//                 </button>
//                 <div className="flex items-center gap-3">
//                     <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition text-sm">
//                         <Share2 size={16} />
//                         Share
//                     </button>
//                     <button
//                         onClick={handlePrint}
//                         className="flex items-center gap-2 px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition shadow-md text-sm font-medium"
//                     >
//                         <Download size={16} />
//                         Download PDF
//                     </button>
//                 </div>
//             </div>

//             <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-8">

//                 {/* LEFT CONTENT: Main Judgment Data (3 Cols) */}
//                 <div className="lg:col-span-3 space-y-8">

//                     {/* Header Section */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 relative overflow-hidden">
//                         <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A2342]"></div>
//                         <div className="flex flex-col gap-5">
//                             <div className="flex justify-between items-start gap-4">
//                                 <h1 className="text-3xl font-bold text-[#0A2342] leading-tight tracking-tight">
//                                     {caseTitle}
//                                 </h1>
//                                 {judgment.isLandmark && (
//                                     <span className="shrink-0 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 uppercase tracking-wide">
//                                         Landmark
//                                     </span>
//                                 )}
//                             </div>

//                             {/* Metadata Grid */}
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-2 border-t border-b border-gray-100 mt-2">
//                                 <div className="flex flex-col gap-1">
//                                     <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Court</span>
//                                     <div className="flex items-center gap-2 text-gray-800 font-medium">
//                                         <Gavel size={16} className="text-[#C9A227]" />
//                                         {courtName}
//                                     </div>
//                                 </div>
//                                 <div className="flex flex-col gap-1">
//                                     <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Date</span>
//                                     <div className="flex items-center gap-2 text-gray-800 font-medium">
//                                         <BookOpen size={16} className="text-[#C9A227]" />
//                                         {displayDate}
//                                     </div>
//                                 </div>
//                                 <div className="flex flex-col gap-1">
//                                     <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider">Bench</span>
//                                     <div className="flex items-center gap-2 text-gray-800 font-medium">
//                                         <Scale size={16} className="text-[#C9A227]" />
//                                         {benchSide}
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Citations */}
//                             {judgment.citations && judgment.citations.length > 0 && (
//                                 <div>
//                                     <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider block mb-2">Citations</span>
//                                     <div className="flex flex-wrap gap-2">
//                                         {judgment.citations.map((cit: string, idx: number) => (
//                                             <span key={idx} className="bg-blue-50 text-blue-800 px-2.5 py-1 rounded-md text-sm font-mono border border-blue-100">
//                                                 {cit}
//                                             </span>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Summary Section */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                         <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center gap-2">
//                             <FileText size={18} className="text-gray-500" />
//                             <h2 className="text-lg font-semibold text-gray-800">Case Summary</h2>
//                         </div>
//                         <div className="p-8">
//                             <div className="prose prose-stone max-w-none text-gray-600 mb-8 leading-relaxed">
//                                 {judgment.summary}
//                             </div>

//                             {/* Ratio Decidendi Highlight Box */}
//                             <div className="bg-[#FFFDF5] border-l-4 border-[#C9A227] p-6 rounded-r-lg shadow-sm">
//                                 <h3 className="text-sm font-bold text-[#9A7D1C] mb-2 uppercase tracking-wide flex items-center gap-2">
//                                     <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
//                                     Ratio Decidendi
//                                 </h3>
//                                 <p className="text-gray-900 italic font-medium leading-relaxed text-lg">
//                                     "{ratio}"
//                                 </p>
//                             </div>
//                         </div>
//                     </div>

//                     {/* Acts & Sections */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                         <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center gap-2">
//                             <Tag size={18} className="text-gray-500" />
//                             <h2 className="text-lg font-semibold text-gray-800">Acts & Sections</h2>
//                         </div>
//                         <div className="p-8">
//                             {acts.length > 0 ? (
//                                 <div className="flex flex-wrap gap-3">
//                                     {acts.map((act: string, idx: number) => (
//                                         <Link
//                                             href="#"
//                                             key={idx}
//                                             className="group flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm hover:border-[#C9A227] hover:text-[#0A2342] hover:shadow-md transition-all"
//                                         >
//                                             <span className="font-semibold text-[#0A2342] group-hover:text-[#C9A227] transition-colors">§</span>
//                                             <span className="font-medium">{act}</span>
//                                         </Link>
//                                     ))}
//                                 </div>
//                             ) : (
//                                 <p className="text-gray-500 text-sm italic">No specific acts cited.</p>
//                             )}
//                         </div>
//                     </div>

//                     {/* Full Judgment Text */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                         <div className="bg-gray-50 px-8 py-4 border-b border-gray-200 flex items-center justify-between">
//                             <h2 className="text-lg font-semibold text-gray-800">Full Judgment Text</h2>
//                         </div>
//                         <div className="p-8 bg-[#fdfdfd]">
//                             <div className="prose max-w-none text-gray-900 leading-8 font-serif">
//                                 {judgment.fullText ? (
//                                     <div dangerouslySetInnerHTML={{ __html: judgment.fullText }} />
//                                 ) : (
//                                     <p className="text-gray-500 italic p-4 text-center">Full text content is pending digitization.</p>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* RIGHT SIDEBAR: Related Content (1 Col) */}
//                 <div className="lg:col-span-1 space-y-6">

//                     {/* Related Judgments (Same Judge) */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
//                         <div className="px-5 py-4 border-b bg-[#0A2342] text-white">
//                             <h3 className="font-semibold text-sm uppercase tracking-wide">Same Judge Rulings</h3>
//                         </div>
//                         <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto custom-scrollbar">
//                             {relatedJudgments.length > 0 ? (
//                                 relatedJudgments.map((rel) => (
//                                     <Link
//                                         href={`/judgments/${rel.id || rel._id}`}
//                                         key={rel.id || rel._id}
//                                         className="block px-5 py-4 hover:bg-gray-50 transition group"
//                                     >
//                                         <h4 className="text-sm font-semibold text-gray-800 group-hover:text-[#C9A227] line-clamp-2 mb-1 leading-snug">
//                                             {rel.caseTitle || rel.case?.title || "Untitled Judgment"}
//                                         </h4>
//                                         <div className="flex items-center gap-2 text-xs text-gray-500">
//                                             <CalendarIcon />
//                                             {new Date(rel.judgmentDate).toLocaleDateString()}
//                                         </div>
//                                     </Link>
//                                 ))
//                             ) : (
//                                 <div className="px-5 py-8 text-center">
//                                     <p className="text-sm text-gray-500 mb-2">No other rulings found for this judge.</p>
//                                 </div>
//                             )}
//                         </div>
//                     </div>

//                     {/* Same Act Placeholder */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
//                         <div className="px-5 py-4 border-b bg-gray-50">
//                             <h3 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">Related References</h3>
//                         </div>
//                         <div className="p-5">
//                             <p className="text-xs text-gray-500 mb-3 leading-relaxed">
//                                 See other judgments referencing the same acts:
//                             </p>
//                             <div className="flex flex-wrap gap-2">
//                                 <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">IPC Section 302</span>
//                                 <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">CrPC Section 41</span>
//                             </div>
//                         </div>
//                     </div>

//                 </div>

//             </div>
//         </div>
//     );
// }

// // Helper Components
// function CalendarIcon() {
//     return (
//         <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></svg>
//     )
// }
