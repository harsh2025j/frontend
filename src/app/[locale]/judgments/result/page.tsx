"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { performJudgmentSearch, JudgmentSearchType, JudgmentSearchInputs } from "../searchLogic";

export default function JudgmentResultPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchType, setSearchType] = useState<JudgmentSearchType>("caseNumber");

    useEffect(() => {
        const type = searchParams.get("searchType") as JudgmentSearchType;
        const caseNumber = searchParams.get("caseNumber") || "";
        const judgeName = searchParams.get("judgeName") || "";
        const judgmentDate = searchParams.get("judgmentDate") || "";
        const year = searchParams.get("year") || "";
        const startDate = searchParams.get("startDate") || "";
        const endDate = searchParams.get("endDate") || "";
        const court = searchParams.get("court") || "";

        if (type) {
            setSearchType(type);
            const inputs: JudgmentSearchInputs = {
                caseId: caseNumber, // Mapping caseNumber param to caseId input as per logic
                caseNumber,
                judgeName,
                judgmentDate,
                year,
                startDate,
                endDate,
                court
            };
            executeSearch(type, inputs);
        }
    }, [searchParams]);

    const executeSearch = async (type: JudgmentSearchType, inputs: JudgmentSearchInputs) => {
        setLoading(true);
        try {
            const data = await performJudgmentSearch(type, inputs);
            setResults(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Construct back URL with params
    const getBackUrl = () => {
        const params = new URLSearchParams(searchParams.toString());
        return `/judgments?${params.toString()}`;
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
                                ({results.length} found)
                            </span>
                        </h1>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Searching judgments...</div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            No judgments found matching your criteria.
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 text-gray-700 font-medium text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 text-left w-1/3">Case Details</th>
                                        <th className="px-6 py-4 text-left">Date</th>
                                        <th className="px-6 py-4 text-left">Court & Bench</th>
                                        <th className="px-6 py-4 text-left">Citation</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {results.map((item, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">

                                            {/* Case Details (Title + Summary) */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <Link
                                                        href={`/judgments/${item._id || item.id}`}
                                                        className="font-bold text-[#0A2342] hover:text-[#C9A227] transition-colors line-clamp-2"
                                                    >
                                                        {item.caseTitle || item.case?.title || "Case Title Not Available"}
                                                    </Link>
                                                    <p className="text-gray-500 text-xs line-clamp-2 mt-1 leading-relaxed">
                                                        {item.summary || "No summary available."}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Date */}
                                            <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                                {item.judgmentDate ? new Date(item.judgmentDate).toLocaleDateString() : "-"}
                                            </td>

                                            {/* Court & Bench */}
                                            <td className="px-6 py-4 text-gray-600">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{item.court || item.case?.court || "-"}</span>
                                                    <span className="text-xs text-gray-500">{item.benchStrength || "Bench N/A"}</span>
                                                </div>
                                            </td>

                                            {/* Citation */}
                                            <td className="px-6 py-4">
                                                {item.citations && item.citations.length > 0 ? (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded border border-blue-100 bg-blue-50 text-blue-700 text-xs font-mono">
                                                        {item.citations[0]}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={`/judgments/${item._id || item.id}`}
                                                        title="View"
                                                        className="p-1.5 text-gray-500 hover:text-[#0A2342] hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                                    </Link>
                                                    {/* <button
                                                        title="Save"
                                                        className="p-1.5 text-gray-500 hover:text-[#C9A227] hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                                                    </button>
                                                    <button
                                                        title="PDF"
                                                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="m9 15 3 3 3-3" /></svg>
                                                    </button> */}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
