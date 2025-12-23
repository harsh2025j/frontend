"use client";

import React, { useEffect, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";

import { useSearchParams } from "next/navigation";
import { Search, FileText, User, Gavel, Calendar } from 'lucide-react';
import { performCaseSearch, SearchInputs, SearchType } from "./searchLogic";

export default function CasesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialSearchType = searchParams.get("searchType") as SearchType | null;

    // We only need local state for "no results found" messaging now
    const [loading, setLoading] = useState(false);
    const [noResults, setNoResults] = useState(false);

    // Search Configuration State
    const [searchType, setSearchType] = useState<SearchType>(initialSearchType || "caseNumber");

    // Input State
    const [inputs, setInputs] = useState<SearchInputs>({
        caseNumber: searchParams.get("caseNumber") || "",
        partyName: searchParams.get("partyName") || "",
        partyType: searchParams.get("partyType") || "",
        advocateName: searchParams.get("advocateName") || "",
        court: searchParams.get("court") || "",
        caseType: searchParams.get("caseType") || "",
        year: searchParams.get("year") || ""
    });

    // Initial Fetch (Optional - can be removed if we only want search results)
    useEffect(() => {
        // Only fetch all cases if no specific search intent was passed
        // For now, keeping original behavior but ignoring results display here
        if (!initialSearchType) {
            // fetchCases(); // Context: User wants search flow, initial load might not be needed or logic changed. Keeping it disabled for now to focus on search.
        }
    }, [initialSearchType]);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setNoResults(false);

        try {
            // 1. Check for results using shared logic
            const results = await performCaseSearch(searchType, inputs);

            if (results && results.length > 0) {
                // 2. Results found - Redirect to Result Page
                toast.success("Cases found successfully!");
                const queryParams = new URLSearchParams();
                queryParams.set("searchType", searchType);

                // Add only relevant inputs for the URL
                if (searchType === "caseNumber") {
                    queryParams.set("caseNumber", inputs.caseNumber);
                } else if (searchType === "partyName") {
                    queryParams.set("partyName", inputs.partyName);
                    queryParams.set("partyType", inputs.partyType);
                    queryParams.set("year", inputs.year);
                } else if (searchType === "advocateName") {
                    queryParams.set("advocateName", inputs.advocateName);
                    queryParams.set("partyType", inputs.partyType);
                    queryParams.set("year", inputs.year);
                } else if (searchType === "caseDetails") {
                    queryParams.set("court", inputs.court);
                    queryParams.set("caseType", inputs.caseType);
                    queryParams.set("year", inputs.year);
                }

                router.push(`/cases/result?${queryParams.toString()}`);
            } else {
                // 3. No results - Show message on this page
                toast.error("No records found matching your criteria.");
                setNoResults(true);
            }

        } catch (error) {
            // console.error("Error searching cases:", error);
            toast.error("No records found matching your criteria.");
            setNoResults(true);
        } finally {
            setLoading(false);
        }
    };

    const years = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i);
    const courts = ["Supreme Court", "High Court", "District Court"];
    const caseTypes = ["Civil", "Criminal", "Corporate", "Family", "Tax", "Constitutional", "Labour", "Property"];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2 pt-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-[#0A2342]">Case Status</h1>
                    <p className="text-gray-500">Access live case data, orders, and hearing history</p>
                </div>

                <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-6">

                    {/* Sidebar */}
                    <div className="w-full md:w-64 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col shrink-0 h-fit">
                        <button
                            onClick={() => { setSearchType("caseNumber"); setInputs({ ...inputs, caseNumber: "", partyName: "", advocateName: "" }); setNoResults(false); }}
                            className={`p-4 text-left font-medium transition-colors border-l-4 ${searchType === "caseNumber"
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
                            onClick={() => { setSearchType("partyName"); setInputs({ ...inputs, caseNumber: "", partyName: "", advocateName: "" }); setNoResults(false); }}
                            className={`p-4 text-left font-medium transition-colors border-l-4 ${searchType === "partyName"
                                ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <User size={18} />
                                <span>Party Name</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setSearchType("advocateName"); setInputs({ ...inputs, caseNumber: "", partyName: "", advocateName: "" }); setNoResults(false); }}
                            className={`p-4 text-left font-medium transition-colors border-l-4 ${searchType === "advocateName"
                                ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Gavel size={18} />
                                <span>Advocate Name</span>
                            </div>
                        </button>

                        <button
                            onClick={() => { setSearchType("caseDetails"); setInputs({ ...inputs, caseNumber: "", partyName: "", advocateName: "" }); setNoResults(false); }}
                            className={`p-4 text-left font-medium transition-colors border-l-4 ${searchType === "caseDetails"
                                ? "bg-blue-50 border-[#0A2342] text-[#0A2342]"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <FileText size={18} />
                                <span>Case Details</span>
                            </div>
                        </button>
                    </div>

                    {/* Dynamic Search Form */}
                    <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden">
                        <form onSubmit={handleSearch} className="p-6 md:p-8 space-y-6">

                            {/* Dynamic Inputs Area */}
                            <div className="min-h-[80px] flex items-center">

                                {searchType === "caseNumber" && (
                                    <div className="w-full space-y-2">
                                        <label className="text-sm font-medium text-gray-700 my-2">Enter Case Number <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            <input
                                                type="text"
                                                placeholder="e.g.CSE10000000001"
                                                required
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all mt-1 mb-2"
                                                value={inputs.caseNumber}
                                                onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                                autoFocus
                                            />
                                        </div>
                                        <label className="text-sm font-medium text-gray-700 ">Enter Case Type (Optional) </label>
                                        <input type="text" className="w-full pl-2 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all mt-1 mb-2" placeholder="Enter case type (optional)" />
                                        <label className="text-sm font-medium text-gray-700 ">Enter case year (Optional) </label>
                                        <input type="number" className="w-full pl-2 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all mt-1 mb-2" placeholder="eg. 2026" />

                                    </div>
                                )}

                                {searchType === "partyName" && (
                                    <div className="w-full grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Party Type <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all text-sm"
                                                    value={inputs.partyType}
                                                    onChange={(e) => setInputs({ ...inputs, partyType: e.target.value })}
                                                >
                                                    <option value="">---- select party type ----</option>
                                                    <option value="Petitioner">Petitioner</option>
                                                    <option value="Respondent">Respondent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Party Name <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Party Name"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.partyName}
                                                    onChange={(e) => setInputs({ ...inputs, partyName: e.target.value })}
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Year <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="eg. 2026"
                                                    className="w-full px-4 py-3  border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {searchType === "advocateName" && (
                                    <div className="w-full grid grid-cols-1 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-gray-700">Party Type <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    required
                                                    className="w-full px-4 py-3 bg-gray-100 my-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all text-sm"
                                                    value={inputs.partyType}
                                                    onChange={(e) => setInputs({ ...inputs, partyType: e.target.value })}
                                                >
                                                    <option value="">---- select party type ----</option>
                                                    <option value="Petitioner">Petitioner</option>
                                                    <option value="Respondent">Respondent</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="w-full space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Enter Advocate Name <span className="text-red-500">*</span></label>
                                                <div className="relative">
                                                    <Gavel className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Advocate Name"
                                                        className="w-full pl-10 pr-4 py-3 my-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                        value={inputs.advocateName}
                                                        onChange={(e) => setInputs({ ...inputs, advocateName: e.target.value })}
                                                        autoFocus
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-medium text-gray-700">Year <span className="text-red-500">*</span></label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="eg. 2026"
                                                    className="w-full px-4 py-3 my-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {searchType === "caseDetails" && (
                                    <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Court <span className="text-red-500">*</span> </label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 my-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
                                                value={inputs.court}
                                                onChange={(e) => setInputs({ ...inputs, court: e.target.value })}
                                            >
                                                <option value="">Select Court</option>
                                                {courts.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Case Type <span className="text-red-500">*</span> </label>
                                            <select
                                                required
                                                className="w-full px-4 py-3 border my-1 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
                                                value={inputs.caseType}
                                                onChange={(e) => setInputs({ ...inputs, caseType: e.target.value })}
                                            >
                                                <option value="">Select Type</option>
                                                {caseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-700">Year <span className="text-red-500">*</span> </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="eg. 2026"
                                                className="w-full px-4 py-3 border my-1 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                value={inputs.year}
                                                onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Search Action */}
                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-[#0A2342] text-white px-8 py-3 rounded-lg hover:bg-[#153a66] transition-colors shadow-lg shadow-blue-900/10 font-medium"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>Searching...</>
                                    ) : (
                                        <>
                                            <Search size={18} /> Search Records
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* No Results Message - Only shown when searching and no results found on this page */}
                {/* {noResults && !loading && (
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <div className="text-gray-400 mb-2">
                                <Search size={48} className="mx-auto opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No records found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mt-1">
                                We couldn't find any cases matching your search criteria. Please check the details and try again.
                            </p>
                        </div>
                    </div>
                )} */}
            </div>
        </div>
    );
}
