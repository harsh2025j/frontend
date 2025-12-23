"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Gavel, Building2, Search } from 'lucide-react';
import toast from "react-hot-toast";
import { performJudgeSearch, JudgeSearchInputs, JudgeSearchType } from "./searchLogic";
import { highCourts } from "@/data/highCourts"; // Assuming this exists based on Stores.tsx usage

export default function JudgesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSearchType = searchParams.get("searchType") as JudgeSearchType | null;

    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<JudgeSearchType>(initialSearchType || "JudgeName");

    const [inputs, setInputs] = useState<JudgeSearchInputs>({
        judgeName: searchParams.get("judgeName") || "",
        courtType: searchParams.get("courtType") || "",
        courtName: searchParams.get("courtName") || "",
        status: searchParams.get("status") || ""
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check for results logic (consistent with other pages pattern)
            // But we mainly want to push params to result page
            const queryParams = new URLSearchParams();
            queryParams.set("searchType", searchType);

            if (searchType === "JudgeName") {
                if (!inputs.judgeName?.trim()) {
                    toast.error("Please enter a judge name");
                    setLoading(false);
                    return;
                }
                queryParams.set("judgeName", inputs.judgeName);
            } else if (searchType === "CourtStatus") {
                if (inputs.courtType) queryParams.set("courtType", inputs.courtType);
                if (inputs.status) queryParams.set("status", inputs.status);
            }

            router.push(`/judges/result?${queryParams.toString()}`);

        } catch (error) {
            toast.error("An error occurred details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2 pt-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#0A2342]">Judges Directory</h1>
                    <p className="text-gray-500">Find judge profiles, judicial analytics and bench history</p>
                </div>

                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col shrink-0 h-fit">
                        <button
                            onClick={() => { setSearchType("JudgeName"); setInputs({ ...inputs, judgeName: "" }); }}
                            className={`p-4 text-left font-medium transition-colors border-l-4 ${searchType === "JudgeName"
                                ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <User size={18} />
                                <span>Judge Name</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setSearchType("CourtStatus"); setInputs({ ...inputs, courtType: "", courtName: "", status: "" }); }}
                            className={`p-4 text-left font-medium transition-colors border-l-4 ${searchType === "CourtStatus"
                                ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Building2 size={18} />
                                <span>Court & Status</span>
                            </div>
                        </button>
                    </div>

                    {/* Form Area */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden p-8">
                        <form onSubmit={handleSearch} className="space-y-6">

                            {searchType === "JudgeName" && (
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Court Type <span className="text-red-500">*</span></label>
                                    <select
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
                                        value={inputs.courtType}
                                        required
                                        onChange={(e) => setInputs({ ...inputs, courtType: e.target.value })}
                                    >
                                        <option value="">All Courts</option>
                                        <option value="Supreme Court">Supreme Court</option>
                                        <option value="High Court">High Court</option>
                                        <option value="District Court">District Court</option>
                                    </select>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Judge Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            placeholder="e.g. Justice A. Kumar"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                            value={inputs.judgeName}
                                            onChange={(e) => setInputs({ ...inputs, judgeName: e.target.value })}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}

                            {searchType === "CourtStatus" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Court Type</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
                                            value={inputs.courtType}
                                            onChange={(e) => setInputs({ ...inputs, courtType: e.target.value })}
                                        >
                                            <option value="">All Courts</option>
                                            <option value="Supreme Court">Supreme Court</option>
                                            <option value="High Court">High Court</option>
                                            <option value="District Court">District Court</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">Status</label>
                                        <select
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
                                            value={inputs.status}
                                            onChange={(e) => setInputs({ ...inputs, status: e.target.value })}
                                        >
                                            <option value="">Any Status</option>
                                            <option value="Sitting">Sitting</option>
                                            <option value="Retired">Retired</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-white font-medium transition-all shadow-md
                                    ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#0A2342] hover:bg-[#153a66] hover:shadow-lg"}`}
                                >
                                    {loading ? "Searching..." : (
                                        <>
                                            <Search size={18} /> Search Judges
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
