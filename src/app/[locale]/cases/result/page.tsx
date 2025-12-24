"use client";

import React, { useEffect, useState, Suspense } from "react";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { performCaseSearch, SearchInputs, SearchType } from "../searchLogic";

function ResultPageContent() {
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
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Hearing</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {cases.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#0A2342]">{c.caseNumber}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-0.5 inline-flex text-xs font-medium rounded-full capitalize ${c.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                                    c.status === "closed" ? "bg-gray-100 text-gray-800" :
                                                        c.status === "filed" ? "bg-blue-100 text-blue-800" :
                                                            "bg-green-100 text-green-800"
                                                    }`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.court}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {c.nextHearingDate ? new Date(c.nextHearingDate).toLocaleDateString() : <span className="text-gray-400 italic">-</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link
                                                    href={`/cases/${c.id}`}
                                                    className="text-[#0A2342] hover:text-[#C9A227] font-semibold transition-colors"
                                                >
                                                    View Details →
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
