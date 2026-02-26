"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { performCaseSearch, SearchInputs, SearchType } from "../searchLogic";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";

function ResultPageContent() {
    useDocTitle("Cases | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
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

                const results = await performCaseSearch(searchType, inputs);
                setCases(results);
            } catch (error) {
                console.error("Error fetching results:", error);
                setCases([]);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [searchParams]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-12 min-h-screen bg-gray-50/50">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0A2342] mb-4"></div>
                <p className="text-gray-500">Retrieving case records...</p>
            </div>
        );
    }

    return (
        console.log(cases),
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
                            <span className="text-xs font-medium text-gray-500 bg-white border px-2 py-1 rounded-full text-nowrap">{cases.length} records</span>
                        </div>
                        <div className="p-6 bg-gray-50/30">
                            <div className="space-y-6">
                                {cases.map((c) => (
                                    <div key={c.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0A2342] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex justify-between items-start gap-4 mb-3">
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                                    <span className={`px-2.5 py-0.5 inline-flex text-xs font-bold rounded-md capitalize border ${c.status === "pending" ? "bg-yellow-50 text-yellow-800 border-yellow-200" :
                                                            c.status === "closed" ? "bg-gray-50 text-gray-800 border-gray-200" :
                                                                c.status === "filed" ? "bg-blue-50 text-blue-800 border-blue-200" :
                                                                    "bg-green-50 text-green-800 border-green-200"
                                                        }`}>
                                                        {c.status}
                                                    </span>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-50 text-[#0A2342] text-xs font-mono font-bold border border-blue-100">
                                                        {c.caseNumber}
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/cases/${c.id}`}
                                                    className="text-xl font-bold text-[#0A2342] hover:text-[#C9A227] transition-colors leading-tight line-clamp-2"
                                                >
                                                    {c.title || "Untitled Case"}
                                                </Link>

                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"></path></svg>
                                                        <span className="font-medium">{c.court || "Court N/A"}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded border border-gray-100">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                        <span className="text-gray-500 font-medium">Next Hearing:</span>
                                                        <span className="font-semibold text-[#0A2342]">
                                                            {c.nextHearingDate ? formatDate(c.nextHearingDate) : "Not Scheduled"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-gray-100 flex justify-end">
                                            <Link
                                                href={`/cases/${c.id}`}
                                                className="inline-flex items-center gap-2 text-sm font-semibold text-[#0A2342] hover:text-[#C9A227] transition-colors bg-white border border-gray-200 hover:border-[#C9A227] px-4 py-2 rounded-lg"
                                            >
                                                View Case Details
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
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
