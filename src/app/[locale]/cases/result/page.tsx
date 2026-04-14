"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { Link } from "@/i18n/routing";
import { useSearchParams, useRouter } from "next/navigation";
import { performCaseSearch, SearchInputs, SearchType } from "../searchLogic";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import Pagination from "@/components/Pagination";

function ResultPageContent() {
    useDocTitle("Cases | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const limit = 10;

    const fetchResults = useCallback(async (page: number) => {
        setLoading(true);
        try {
            // Reconstruct inputs from search params
            const searchType = (searchParams.get("searchType") as SearchType) || "caseNumber";

            const inputs: SearchInputs = {
                filingNumber: searchParams.get("filingNumber") || "",
                crimeNumber: searchParams.get("crimeNumber") || "",
                caseNumber: searchParams.get("caseNumber") || "",
                partyName: searchParams.get("partyName") || "",
                partyType: searchParams.get("partyType") || "",
                advocateName: searchParams.get("advocateName") || "",
                court: searchParams.get("court") || "",
                caseType: searchParams.get("caseType") || "",
                year: searchParams.get("year") || ""
            };

            const { results, total, totalPages: totalP } = await performCaseSearch(searchType, inputs, page, limit);
            setCases(results);
            setTotalRecords(total);
            setTotalPages(totalP);
        } catch (error) {
            console.error("Error fetching results:", error);
            setCases([]);
            setTotalRecords(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        const pageFromQuery = parseInt(searchParams.get("page") || "1");
        setCurrentPage(pageFromQuery);
        fetchResults(pageFromQuery);
    }, [searchParams, fetchResults]);

    const handlePageChange = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", page.toString());
        router.push(`/cases/result?${params.toString()}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 min-h-screen bg-gray-50/50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A2342] mb-4"></div>
                <p className="text-gray-500">Retrieving case records...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header / Back Button */}
                <div className="flex items-center justify-between pt-4">
                    <Link
                        href={`/cases?${searchParams.toString()}`}
                        className="flex items-center gap-2 text-[#0A2342] hover:text-[#C9A227] font-medium transition-colors"
                    >
                        ← Back to Search
                    </Link>
                    <h1 className="text-2xl font-bold text-[#0A2342]">Search Results</h1>
                </div>

                {cases.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mt-1">
                            We couldn't find any cases matching your criteria. Please go back and try again.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                            <h2 className="font-semibold text-gray-800">Cases Found</h2>
                            <span className="text-xs font-medium text-gray-500 bg-white border px-2 py-1 rounded-full text-nowrap">{totalRecords} records</span>
                        </div>
                        <div className="p-6 bg-gray-50/30">
                            <div className="space-y-6">
                                {cases.map((c) => (
                                    <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A2342] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase border ${c.status === "pending" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                                                        c.status === "closed" ? "bg-gray-50 text-gray-700 border-gray-200" :
                                                            c.status === "filed" ? "bg-blue-50 text-blue-700 border-blue-200" :
                                                                "bg-green-50 text-green-700 border-green-200"
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                    {c.caseNumber && (
                                                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded border border-slate-200">
                                                            CASE: {c.caseNumber}
                                                        </span>
                                                    )}
                                                    {c.diaryNumber && (
                                                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded border border-amber-200">
                                                            DIARY: {c.diaryNumber}
                                                        </span>
                                                    )}
                                                </div>

                                                <Link
                                                    href={`/cases/${c.id}`}
                                                    className="text-lg font-bold text-[#0A2342] hover:text-[#C9A227] transition-colors leading-tight block mb-4"
                                                >
                                                    {c.title || "Untitled Case"}
                                                </Link>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                                    <div className="flex items-center gap-2 text-gray-500">
                                                        <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                                        <span className="truncate">{c.court || "Court Not Specified"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-4 h-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                        <span className="text-gray-500">Next Hearing:</span>
                                                        <span className="font-bold text-[#0A2342]">
                                                            {c.nextHearingDate ? formatDate(c.nextHearingDate) : "—"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Component */}
                            <div className="mt-8 border-t border-gray-100 pt-6">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={handlePageChange}
                                />
                                <div className="text-center mt-4 text-xs text-gray-400">
                                    Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} records
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading...</div>}>
            <ResultPageContent />
        </Suspense>
    );
}
