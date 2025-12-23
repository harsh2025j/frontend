"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Search, Calendar, Gavel, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { performJudgmentSearch, JudgmentSearchInputs, JudgmentSearchType } from "./searchLogic";

export default function JudgmentsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- State --
    const [activeTab, setActiveTab] = useState<JudgmentSearchType>("caseNumber");
    const [inputs, setInputs] = useState<JudgmentSearchInputs>({
        caseId: "",
        caseNumber: "",
        judgeName: "",
        judgmentDate: ""
    });
    const [loading, setLoading] = useState(false);

    // -- Init from URL --
    useEffect(() => {
        const type = searchParams.get("searchType") as JudgmentSearchType;
        if (type) setActiveTab(type);

        setInputs({
            caseId: searchParams.get("caseNumber") || "", // Using caseNumber param for caseId input logic
            caseNumber: searchParams.get("caseNumber") || "",
            judgeName: searchParams.get("judgeName") || "",
            judgmentDate: searchParams.get("judgmentDate") || "",
        });
    }, [searchParams]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if we have results before redirecting (optional optimization, similar to Cases)
            // Or just redirect to result page which handles loading.
            // User asked for "like cases", which *does* check before redirecting now.

            const results = await performJudgmentSearch(activeTab, inputs);

            if (!results || results.length === 0) {
                toast.error("No judgments found matching your criteria.");
                setLoading(false);
                return;
            }

            toast.success("Judgments found!");

            // Build Query Params
            const params = new URLSearchParams();
            params.set("searchType", activeTab);

            if (activeTab === "caseNumber") params.set("caseNumber", inputs.caseNumber);
            if (activeTab === "Judge") params.set("judgeName", inputs.judgeName);
            if (activeTab === "JudgementDate") params.set("judgmentDate", inputs.judgmentDate);

            router.push(`/judgments/result?${params.toString()}`);

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while searching.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Judgments</h1>
                <p className="text-gray-600">Find judgments by case number, judge, or date</p>
            </div>

            <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">

                {/* Tabs */}
                {/* <div className="flex border-b border-gray-200">
                    <button
                        onClick={() => setActiveTab("caseNumber")}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2
                        ${activeTab === "caseNumber" ? "text-[#C9A227] border-b-2 border-[#C9A227] bg-yellow-50/50" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <FileText size={18} />
                        Case Number
                    </button>
                    <button
                        onClick={() => setActiveTab("Judge")}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2
                        ${activeTab === "Judge" ? "text-[#C9A227] border-b-2 border-[#C9A227] bg-yellow-50/50" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Gavel size={18} />
                        By Judge
                    </button>
                    <button
                        onClick={() => setActiveTab("JudgementDate")}
                        className={`flex-1 py-4 text-sm font-medium text-center transition-colors flex items-center justify-center gap-2
                        ${activeTab === "JudgementDate" ? "text-[#C9A227] border-b-2 border-[#C9A227] bg-yellow-50/50" : "text-gray-500 hover:text-gray-700"}`}
                    >
                        <Calendar size={18} />
                        By Date
                    </button>
                </div> */}

                {/* Form Area */}
                <div className="p-8">
                    <form onSubmit={handleSearch} className="space-y-6">

                        {activeTab === "caseNumber" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Case ID / Number <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter Case ID/Number"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                        value={inputs.caseNumber}
                                        onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Enter the exact Case ID to search directly.</p>
                            </div>
                        )}

                        {activeTab === "Judge" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judge Name <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Enter Judge Name"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                        value={inputs.judgeName}
                                        onChange={(e) => setInputs({ ...inputs, judgeName: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === "JudgementDate" && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Judgment Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="date"
                                        required
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                        value={inputs.judgmentDate}
                                        onChange={(e) => setInputs({ ...inputs, judgmentDate: e.target.value })}
                                        autoFocus
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all shadow-md
                            ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0A2342] hover:bg-[#153a66] hover:shadow-lg"}`}
                        >
                            {loading ? "Searching..." : "Search Judgments"}
                        </button>

                    </form>
                </div>

            </div>
        </div>
    );
}
