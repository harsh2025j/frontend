"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Share2, Printer } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import SavePostButton from "@/components/ui/SavePostButton";
import { formatDate } from "@/utils/dateUtils";

export default function JudgmentDetailPage() {
    useDocTitle("Judgment | Sajjad Husain Law Associates");
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

    const handlePrint = () => {
        window.print();
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Judgment..." /></div>;
    if (!judgment) return <div className="p-12 text-center text-gray-500 font-medium font-serif">Judgment not found</div>;

    const courtName = judgment.court || judgment.case?.court || "THE HIGH COURT OF JURISDICTION";
    const benchSide = judgment.benchStrength || judgment.bench || judgment.judge?.bench || "Division Bench";
    const displayDate = judgment.judgmentDate ? formatDate(judgment.judgmentDate) : "Date N/A";

    return (
        <div className="min-h-screen bg-gray-100 pb-16 font-serif text-gray-900">
            {/* Action Bar (Hidden when printing) */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20 flex justify-between items-center shadow-sm print:hidden">
                <button
                    onClick={() => router.back()}
                    className="group flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium text-sm font-sans"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </button>
                <div className="flex items-center gap-3 font-sans">
                    <SavePostButton postId={judgment.id || judgment._id} className="bg-gray-50 border border-gray-200" iconSize={18} />
                    <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-md transition text-sm">
                        <Share2 size={16} />
                        Share
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition text-sm font-medium"
                    >
                        <Printer size={16} />
                        Print / Save PDF
                    </button>
                </div>
            </div>

            {/* Document Container */}
            <div className="max-w-4xl mx-auto mt-8 bg-white shadow-lg border border-gray-300 print:shadow-none print:border-none print:mt-0 print:max-w-none px-8 py-12 md:px-16 md:py-16">

                {/* Court Header */}
                <div className="text-center mb-10 border-b-2 border-black pb-8">
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide mb-2 leading-relaxed">
                        IN {courtName}
                    </h1>
                    {judgment.isLandmark && (
                        <div className="inline-block border-2 border-black px-4 py-1 font-bold tracking-widest uppercase text-sm mt-2 mb-4">
                            Landmark Judgment
                        </div>
                    )}
                    <p className="text-lg font-semibold mt-2">
                        {judgment.caseTitle || judgment.case?.title || "Case Title Not Available"}
                    </p>
                    {judgment.case?.caseNumber && (
                        <p className="text-base mt-1">
                            Case No: <span className="font-semibold">{judgment.case.caseNumber}</span>
                        </p>
                    )}
                </div>

                {/* Parties Details */}
                <div className="mb-10 text-lg leading-relaxed space-y-4">
                    {judgment.petitioner && (
                        <div className="flex text-justify">
                            <span className="font-semibold uppercase w-24 shrink-0">Between:</span>
                            <span>{judgment.petitioner} <span className="italic">... Petitioner/Appellant</span></span>
                        </div>
                    )}

                    {(judgment.petitioner && judgment.respondent) && (
                        <div className="text-center font-bold tracking-widest my-2">AND</div>
                    )}

                    {judgment.respondent && (
                        <div className="flex text-justify">
                            <span className="w-24 shrink-0"></span>
                            <span>{judgment.respondent} <span className="italic">... Respondent/Defendant</span></span>
                        </div>
                    )}
                </div>

                {/* Bench & Date Info */}
                <div className="mb-10 text-lg leading-relaxed">
                    <p className="mb-2"><span className="font-semibold uppercase">Coram:</span> {benchSide}</p>
                    <p className="mb-2"><span className="font-semibold uppercase">Date of Judgment:</span> {displayDate}</p>

                    <div className="mt-6 space-y-2 text-base">
                        {judgment.petitionerCounsel && (
                            <p><span className="font-semibold italic">Counsel for Petitioner:</span> {judgment.petitionerCounsel}</p>
                        )}
                        {judgment.respondentCounsel && (
                            <p><span className="font-semibold italic">Counsel for Respondent:</span> {judgment.respondentCounsel}</p>
                        )}
                    </div>
                </div>

                {/* Citations */}
                {judgment.citations && judgment.citations.length > 0 && (
                    <div className="mb-8 border border-gray-300 p-4 bg-gray-50 text-base">
                        <span className="font-bold uppercase mb-2 block border-b border-gray-300 pb-2">Equivalent Citations:</span>
                        <p className="font-mono">{judgment.citations.join(" ; ")}</p>
                    </div>
                )}

                {/* Summary / Ratio Decidendi (if exists as a preamble) */}
                {(judgment.summary || (judgment.keyPoints && judgment.keyPoints.length > 0)) && (
                    <div className="mb-10 bg-gray-50 p-6 border-l-4 border-black">
                        <h3 className="font-bold uppercase tracking-widest text-center mb-4 border-b border-black pb-2 inline-block">Headnote / Summary</h3>

                        {judgment.summary && (
                            <div className="prose prose-stone max-w-none text-justify mb-4" dangerouslySetInnerHTML={{ __html: judgment.summary }} />
                        )}

                        {judgment.keyPoints && judgment.keyPoints.length > 0 && (
                            <div className="mt-4">
                                <span className="font-bold italic block mb-2">Ratio Decidendi:</span>
                                <ul className="list-disc pl-6 space-y-2 text-justify">
                                    {judgment.keyPoints.map((point: string, idx: number) => (
                                        <li key={idx}>{point}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Judgment Full Text */}
                <div className="text-justify font-serif">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-center mb-8 pb-2 border-b border-gray-300 inline-block w-full">
                        J U D G M E N T
                    </h2>

                    <div className="prose prose-lg prose-stone max-w-none leading-loose text-gray-900 marker:text-black">
                        {judgment.fullText ? (
                            <div dangerouslySetInnerHTML={{ __html: judgment.fullText }} />
                        ) : (
                            <p className="italic text-center text-gray-500 py-10">
                                [ Full text of the judgment is pending digitization ]
                            </p>
                        )}
                    </div>

                    {/* Outcome / Conclusion */}
                    {judgment.outcome && (
                        <div className="mt-12 pt-8 border-t-2 border-black text-lg">
                            <span className="font-bold uppercase block mb-2">Conclusion / Order:</span>
                            <p className="italic font-medium">{judgment.outcome}</p>
                        </div>
                    )}

                    {/* End of Document marker */}
                    <div className="mt-16 text-center text-gray-400 tracking-[0.5em] font-bold">
                        ***
                    </div>
                </div>

            </div>
        </div>
    );
}
