"use client";

import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { Search, Calendar, Gavel, FileText, ArrowLeft } from "lucide-react";
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
        caseType: "",
        court: "",
        judgeName: "",
        judgmentDate: "",
        year: "",
        startDate: "",
        endDate: ""
    });
    const [loading, setLoading] = useState(false);

    const caseTypes = ["Civil", "Criminal", "Corporate", "Family", "Tax", "Constitutional", "Labour", "Property"];
    const courts = ["Supreme Court", "High Court", "District Court"];

    // -- Init from URL --
    useEffect(() => {
        const type = searchParams.get("searchType") as JudgmentSearchType;
        if (type) setActiveTab(type);

        setInputs({
            caseId: searchParams.get("caseNumber") || "",
            caseNumber: searchParams.get("caseNumber") || "",
            caseType: searchParams.get("caseType") || "",
            court: searchParams.get("court") || "",
            judgeName: searchParams.get("judgeName") || "",
            judgmentDate: searchParams.get("judgmentDate") || "",
            year: searchParams.get("year") || "",
            startDate: searchParams.get("startDate") || "",
            endDate: searchParams.get("endDate") || "",
        });
    }, [searchParams]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if we have results before redirecting (optional optimization, similar to Cases)
            // Or just redirect to result page which handles loading.
            // User asked for "like cases", which *does* check before redirecting now.

            if (activeTab === "JudgementDate") {
                if (inputs.startDate && inputs.endDate) {
                    const start = new Date(inputs.startDate);
                    const end = new Date(inputs.endDate);
                    if (end <= start) {
                        toast.error("End Date must be greater than Start Date.");
                        setLoading(false);
                        return;
                    }
                }
            }

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

            if (activeTab === "caseNumber") {
                params.set("caseNumber", inputs.caseNumber);
                if (inputs.caseType) params.set("caseType", inputs.caseType);
            }
            if (activeTab === "Judge") {
                params.set("judgeName", inputs.judgeName);
                if (inputs.court) params.set("court", inputs.court);
                if (inputs.year) params.set("year", inputs.year);
            }
            if (activeTab === "JudgementDate") {
                if (inputs.court) params.set("court", inputs.court);
                if (inputs.startDate) params.set("startDate", inputs.startDate);
                if (inputs.endDate) params.set("endDate", inputs.endDate);
            }

            router.push(`/judgments/result?${params.toString()}`);

        } catch (error) {
            console.error(error);
            toast.error("An error occurred while searching.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4 relative">
            {/* <button
                onClick={() => router.back()}
                className="absolute top-10 left-10 flex items-center gap-2 text-gray-600 hover:text-[#0A2342] transition-colors font-medium mb-4"
            >
                <ArrowLeft size={18} />
                Back
            </button> */}

            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Judgments</h1>
                <p className="text-gray-600">Find judgments by case number, judge, or date</p>
            </div>

            <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6">

                {/* Sidebar */}
                <div className="w-full md:w-64 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col shrink-0 h-fit">
                    <button
                        onClick={() => setActiveTab("caseNumber")}
                        className={`p-4 text-left font-medium transition-colors border-l-4 ${activeTab === "caseNumber"
                            ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <FileText size={18} />
                            <span>Case Number</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("Judge")}
                        className={`p-4 text-left font-medium transition-colors border-l-4 ${activeTab === "Judge"
                            ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Gavel size={18} />
                            <span>Judge</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("JudgementDate")}
                        className={`p-4 text-left font-medium transition-colors border-l-4 ${activeTab === "JudgementDate"
                            ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={18} />
                            <span>Judgment Date</span>
                        </div>
                    </button>
                </div>

                {/* Form Area */}
                <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden p-8">
                    <form onSubmit={handleSearch} className="space-y-6">

                        {activeTab === "caseNumber" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Case Type
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <select
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all appearance-none bg-white text-gray-700"
                                            value={inputs.caseType}
                                            onChange={(e) => setInputs({ ...inputs, caseType: e.target.value })}
                                        >
                                            <option value="">All Case Types</option>
                                            {caseTypes.map((type) => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

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
                            </div>
                        )}

                        {activeTab === "Judge" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Court <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <select
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all appearance-none bg-white text-gray-700"
                                            value={inputs.court}
                                            onChange={(e) => setInputs({ ...inputs, court: e.target.value })}
                                        >
                                            <option value="">Select Court</option>
                                            {courts.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

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

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Year <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="number"
                                            required
                                            placeholder="Enter Year (e.g. 2026)"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                            value={inputs.year || ""}
                                            onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                            min="1900"
                                            max="2100"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "JudgementDate" && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Court <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <select
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all appearance-none bg-white text-gray-700"
                                            value={inputs.court}
                                            onChange={(e) => setInputs({ ...inputs, court: e.target.value })}
                                        >
                                            <option value="">Select Court</option>
                                            {courts.map((c) => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                value={inputs.startDate || ""}
                                                onChange={(e) => setInputs({ ...inputs, startDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                            <input
                                                type="date"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                value={inputs.endDate || ""}
                                                onChange={(e) => setInputs({ ...inputs, endDate: e.target.value })}
                                            />
                                        </div>
                                    </div>
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
