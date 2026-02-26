"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { performJudgmentSearch, JudgmentSearchType, JudgmentSearchInputs } from "../searchLogic";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";

export default function JudgmentResultPage() {
    useDocTitle("Judgments | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();

    const [resultsData, setResultsData] = useState<{ data: any[], total: number, page: number, limit: number }>({ data: [], total: 0, page: 1, limit: 10 });
    const [loading, setLoading] = useState(true);
    const [searchType, setSearchType] = useState<JudgmentSearchType>("caseNumber");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const type = searchParams.get("searchType") as JudgmentSearchType;
        const caseNumber = searchParams.get("caseNumber") || "";
        const caseType = searchParams.get("caseType") || "";
        const diaryNumber = searchParams.get("diaryNumber") || "";
        const freeText = searchParams.get("freeText") || "";
        const year = searchParams.get("year") || "";
        const fromDate = searchParams.get("fromDate") || "";
        const toDate = searchParams.get("toDate") || "";
        const judgeName = searchParams.get("judgeName") || "";
        const judgeYear = searchParams.get("judgeYear") || "";
        const pageQuery = searchParams.get("page") || "1";

        const pageNum = parseInt(pageQuery, 10);
        setCurrentPage(!isNaN(pageNum) && pageNum > 0 ? pageNum : 1);

        if (type) {
            setSearchType(type);
            const inputs: JudgmentSearchInputs = {
                caseNumber,
                caseType,
                year,
                diaryNumber,
                freeText,
                fromDate,
                toDate,
                judgeName,
                judgeYear,
                page: !isNaN(pageNum) && pageNum > 0 ? pageNum : 1
            };
            executeSearch(type, inputs);
        }
    }, [searchParams]);

    const executeSearch = async (type: JudgmentSearchType, inputs: JudgmentSearchInputs) => {
        setLoading(true);
        try {
            const resultData = await performJudgmentSearch(type, inputs);
            setResultsData(resultData);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Construct back URL with params
    const getBackUrl = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("page");
        return `/judgments?${params.toString()}`;
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`/judgments/result?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Link
                    href={getBackUrl()}
                    className="inline-flex items-center text-gray-600 hover:text-[#0A2342] mb-6 transition-colors"
                >
                    <ArrowLeft size={20} className="mr-2" />
                    Back to Search
                </Link>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                        <h1 className="text-xl font-semibold text-gray-800">
                            Search Results
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({resultsData.total} found)
                            </span>
                        </h1>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Searching judgments...</div>
                    ) : resultsData.data.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No judgments found matching your criteria.
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex flex-col gap-6">
                                {resultsData.data.map((item, idx) => (
                                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A2342] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    {item.isLandmark && (
                                                        <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                                                            Landmark
                                                        </span>
                                                    )}
                                                    {item.citations && item.citations.length > 0 && (
                                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-mono font-medium border border-blue-100">
                                                            {item.citations[0]}
                                                        </span>
                                                    )}
                                                    <span className="text-xs text-gray-600 font-medium bg-gray-100 px-2.5 py-0.5 rounded border border-gray-200 flex items-center gap-1">
                                                        <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                        {item.judgmentDate ? formatDate(item.judgmentDate) : "Date N/A"}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/judgments/${item._id || item.id}`}
                                                    className="text-xl font-bold text-[#0A2342] hover:text-[#C9A227] transition-colors leading-tight"
                                                >
                                                    {item.caseTitle || item.case?.title || "Case Title Not Available"}
                                                </Link>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                                                        <span className="font-medium">{item.court || item.case?.court || item.judge?.court || "Court N/A"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                                        <span>{item.benchStrength || item.judge?.bench || item.bench || "Bench N/A"}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 bg-[#F8F9FA] rounded-r-lg p-4 border-l-4 border-[#C9A227]">
                                            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                                                {item.summary ? (
                                                    <span dangerouslySetInnerHTML={{ __html: item.summary }} />
                                                ) : (
                                                    <span className="italic text-gray-500">No excerpt available for this judgment.</span>
                                                )}
                                            </p>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                                            <Link
                                                href={`/judgments/${item._id || item.id}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2342] hover:text-[#C9A227] transition-colors bg-white border border-gray-200 hover:border-[#C9A227] px-4 py-2 rounded-lg"
                                            >
                                                Read Full Judgment
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {resultsData.total > resultsData.limit && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="text-sm text-gray-500">
                                        Showing <span className="font-medium">{(currentPage - 1) * resultsData.limit + 1}</span> to <span className="font-medium">{Math.min(currentPage * resultsData.limit, resultsData.total)}</span> of <span className="font-medium">{resultsData.total}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0A2342] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-[#C9A227] outline-none"
                                        >
                                            Previous
                                        </button>
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage * resultsData.limit >= resultsData.total}
                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#0A2342] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-[#C9A227] outline-none"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
