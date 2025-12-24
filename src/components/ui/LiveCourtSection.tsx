"use client";
import React, { useMemo } from "react";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { getArticlesBySlugs } from "@/components/home/Stores";

// CaseCard Component (merged inline)
interface CaseCardProps {
    title: string;
    court: string;
    advocate: string;
}

const CaseCard: React.FC<CaseCardProps> = ({ title, court, advocate }) => {
    return (
        <div className="w-full border border-black rounded-md p-3 flex justify-between items-start gap-4">
            <div className="flex-1">
                <h2 className="text-md font-semibold leading-snug">{title}</h2>

                <div className="grid grid-cols-2 mt-4 text-[12px] leading-relaxed">
                    <div className="text-gray-900">{court}</div>
                    <div className="text-gray-900">{advocate}</div>
                </div>
            </div>

            <div className="relative flex items-center justify-center w-4 h-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
        </div>
    );
};

// Main LiveCourtSection Component
export default function LiveCourtSection() {
    const { articles, loading } = useArticleListActions();

    // Fetch articles tagged with "live-court" category
    const liveCourtData = useMemo(
        () => getArticlesBySlugs(articles, ["live-court"]),
        [articles]
    );

    return (
        <div className="flex justify-center px-4 mb-6 md:mb-10">
            <div className="container">
                <div className="flex flex-col">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0A2342] mb-6">Live Court</h2>

                    {/* Loading State */}
                    {loading ? (
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[550px] p-6">
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="animate-pulse">
                                        <div className="h-24 bg-gray-200 rounded-lg"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : liveCourtData.length === 0 ? (
                        /* No Data - Show Message Only */
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[550px]">
                            <div className="flex flex-col items-center justify-center text-center py-8 flex-1">
                                <svg className="w-20 h-20 text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                                </svg>
                                <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3">
                                    No Live Court Cases
                                </h3>
                                <p className="text-sm md:text-base text-gray-600 max-w-md">
                                    There are no live court cases available at the moment. We will update this section as soon as new cases are available.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* Data Available - Show from Backend */
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col min-h-[550px]">
                            <div className="overflow-y-auto p-5 md:p-6 max-h-[550px]">
                                <div className="space-y-4">
                                    {liveCourtData.slice(0, 4).map((caseData) => (
                                        <div
                                            key={caseData.id}
                                            className="w-full border border-gray-300 rounded-md p-3 flex justify-between items-start gap-4 hover:border-[#C9A227] transition-colors"
                                        >
                                            <div className="flex-1">
                                                <h2 className="text-sm md:text-md font-semibold leading-snug mb-2">{caseData.title}</h2>
                                                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                                                    <span className="px-2 py-1 bg-gray-100 rounded">{caseData.location || "Supreme Court"}</span>
                                                    {caseData.advocateName && (
                                                        <span className="px-2 py-1 bg-gray-100 rounded">{caseData.advocateName}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="relative flex items-center justify-center w-4 h-4 flex-shrink-0">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
