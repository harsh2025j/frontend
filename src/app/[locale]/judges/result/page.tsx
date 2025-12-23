"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { performJudgeSearch, JudgeSearchInputs, JudgeSearchType } from "../searchLogic";
import { ArrowLeft } from "lucide-react";

export default function JudgesResultPage() {
    const searchParams = useSearchParams();
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        executeSearch();
    }, [searchParams]);

    const executeSearch = async () => {
        setLoading(true);
        setError(false);
        try {
            const searchType = searchParams.get("searchType") as JudgeSearchType;
            const Inputs: JudgeSearchInputs = {
                judgeName: searchParams.get("judgeName") || "",
                courtType: searchParams.get("courtType") || "",
                status: searchParams.get("status") || "",
            };

            // If no search type but we are on result page, maybe standard fetch?
            // For now assume searchType is always present if redirected here.

            // If just navigating to /judges/result without params, maybe fetch all?
            // Let's defer to performJudgeSearch handling or fallback
            // But performJudgeSearch expects a type.

            const typeToUse = searchType || "CourtStatus"; // Fallback to broad search if missing

            const results = await performJudgeSearch(typeToUse, Inputs);
            setJudges(results);
        } catch (err) {
            console.error("Search failed", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto">

                {/* Header / Back */}
                <div className="mb-6 flex items-center justify-between">
                    <Link href="/judges" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Search
                    </Link>
                    <h1 className="text-2xl font-bold text-[#0A2342]">Search Results</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="text-gray-500">Loading results...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 text-red-500">
                        An error occurred while fetching results. Please try again.
                    </div>
                ) : judges.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                        <p className="text-gray-500 text-lg">No judges found matching your criteria.</p>
                        <Link href="/judges" className="inline-block mt-4 text-blue-600 hover:underline">
                            Try a different search
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {judges.map((judge: any) => (
                            <div key={judge.id || judge._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
                                <div className="flex items-center mb-4">
                                    <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center text-xl font-bold text-[#0A2342]">
                                        {judge.name ? judge.name.charAt(0) : "J"}
                                    </div>
                                    <div className="ml-4">
                                        <h2 className="text-lg font-bold text-gray-900 line-clamp-1" title={judge.name}>{judge.name}</h2>
                                        <p className="text-sm text-gray-500">{judge.designation || judge.status || "Judge"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>
                                        <span className="font-semibold text-gray-800">Court:</span> {judge.court || judge.court_details?.court_name || "-"}
                                    </p>
                                    {(judge.specialization || judge.expertise) && (
                                        <p>
                                            <span className="font-semibold text-gray-800">Expertise:</span>{" "}
                                            {Array.isArray(judge.specialization) ? judge.specialization.join(", ") :
                                                Array.isArray(judge.expertise) ? judge.expertise.join(", ") : "-"}
                                        </p>
                                    )}
                                </div>
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/judges/${judge.id || judge._id}`} // Assuming ID field
                                        className="block w-full text-center py-2 px-4 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition-colors font-medium text-sm"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
