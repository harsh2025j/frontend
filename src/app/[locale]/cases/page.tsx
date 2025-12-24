"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { Search, FileText, User, Gavel, Calendar, Home, ChevronRight, Scale, Building2, FileCheck } from 'lucide-react';
import { performCaseSearch, SearchInputs, SearchType } from "./searchLogic";
import Captcha from "@/components/ui/Captcha";

export default function CasesPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<SearchType>("caseNumber");
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");

    const [inputs, setInputs] = useState<SearchInputs>({
        caseNumber: "",
        partyName: "",
        partyType: "",
        advocateName: "",
        court: "",
        caseType: "",
        year: "",
        filingNumber: "",
        crimeNumber: ""
    });

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate CAPTCHA
        if (captchaInput.toLowerCase() !== captcha.toLowerCase()) {
            toast.error("Invalid CAPTCHA. Please try again.");
            return;
        }

        setLoading(true);

        try {
            const results = await performCaseSearch(searchType, inputs);

            if (results && results.length > 0) {
                toast.success("Cases found successfully!");
                const queryParams = new URLSearchParams();
                queryParams.set("searchType", searchType);

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
                toast.error("No records found matching your criteria.");
            }
        } catch (error) {
            toast.error("No records found matching your criteria.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setInputs({
            caseNumber: "",
            partyName: "",
            partyType: "",
            advocateName: "",
            court: "",
            caseType: "",
            year: "",
            filingNumber: "",
            crimeNumber: ""
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#FF6B35] to-[#FF8C61] text-white py-6 shadow-xl">
                <div className="max-w-7xl mx-auto px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-center">Sajjad Husain Law Associates</h1>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-[#0A2342] mb-2">Case Status</h2>
                    <p className="text-gray-600">Search and track your legal cases</p>
                </div>

                {/* Main Content - Left Sidebar + Right Form */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Tabs */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                            {/* Case Status Section - Always Expanded */}
                            <div className="border-b border-gray-200">
                                <div className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <ChevronRight size={20} className="text-white" />
                                        <span className="font-semibold">Case Status</span>
                                    </div>
                                </div>

                                {/* Sub-tabs for Case Status */}
                                <div className="bg-gray-50">
                                    <button
                                        onClick={() => { setSearchType("caseNumber"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "caseNumber"
                                            ? 'bg-white border-orange-500 text-orange-600 font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Search by Case Number</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchType("filingNumber"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "filingNumber"
                                            ? 'bg-white border-orange-500 text-orange-600 font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Search by Filing/Token/Diary Number</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchType("partyName"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "partyName"
                                            ? 'bg-white border-orange-500 text-orange-600 font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Search by Party Name</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchType("crimeNumber"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "crimeNumber"
                                            ? 'bg-white border-orange-500 text-orange-600 font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Search by Crime Number</span>
                                        </div>
                                    </button>

                                    <button
                                        className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Pending Cases Relating to MPs/MLAs</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Advocate Section - Always Expanded */}
                            <div className="border-b border-gray-200">
                                <div className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <ChevronRight size={20} className="text-white" />
                                        <span className="font-semibold">Advocate</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50">
                                    <button className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Advocate's Case(s) - Roll No Wise</span>
                                        </div>
                                    </button>
                                    <button className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Advocate's Case(s) Listed Today</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Lower Court Section - Always Expanded */}
                            <div>
                                <div className="w-full p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                                    <div className="flex items-center gap-3">
                                        <ChevronRight size={20} className="text-white" />
                                        <span className="font-semibold">Lower Court</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50">
                                    <button className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Lower Court Proceeding Stayed</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 px-6 py-4">
                                <h3 className="text-xl font-bold text-blue-700">
                                    Case Status: {searchType === "caseNumber" && "Search by Case Number"}
                                    {searchType === "filingNumber" && "Search by Filing/Token/Diary Number"}
                                    {searchType === "partyName" && "Search by Party Name"}
                                    {searchType === "crimeNumber" && "Search by Crime Number"}
                                </h3>
                            </div>

                            {/* Search Form */}
                            <form onSubmit={handleSearch} className="p-8">
                                <div className="max-w-2xl mx-auto space-y-6">
                                    {/* Case Number Search */}
                                    {searchType === "caseNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Case Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    required
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.caseType}
                                                    onChange={(e) => setInputs({ ...inputs, caseType: e.target.value })}
                                                >
                                                    <option value="">select case type</option>
                                                    <option value="Civil">Civil</option>
                                                    <option value="Criminal">Criminal</option>
                                                    <option value="Writ">Writ Petition</option>
                                                    <option value="Appeal">Appeal</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Case No. <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Case Number"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.caseNumber}
                                                    onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Case Year <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Case Year"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Filing Number Search */}
                                    {searchType === "filingNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Filing/Token/Diary Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Filing/Token/Diary Number"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.filingNumber}
                                                    onChange={(e) => setInputs({ ...inputs, filingNumber: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Year <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Year (yyyy)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Party Name Search */}
                                    {searchType === "partyName" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Party Type <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    required
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.partyType}
                                                    onChange={(e) => setInputs({ ...inputs, partyType: e.target.value })}
                                                >
                                                    <option value="">---- select party type ----</option>
                                                    <option value="Petitioner">Petitioner</option>
                                                    <option value="Respondent">Respondent</option>
                                                    <option value="Appellant">Appellant</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Party Name <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter Party Name"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        value={inputs.partyName}
                                                        onChange={(e) => setInputs({ ...inputs, partyName: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        Year <span className="text-red-500">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Year (yyyy)"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                        value={inputs.year}
                                                        onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Crime Number Search */}
                                    {searchType === "crimeNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Crime Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Crime Number"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.crimeNumber}
                                                    onChange={(e) => setInputs({ ...inputs, crimeNumber: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Year <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Year (yyyy)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* CAPTCHA Component */}
                                    <Captcha
                                        value={captchaInput}
                                        onChange={setCaptchaInput}
                                        onCaptchaChange={setCaptcha}
                                    />

                                    {/* Submit Buttons */}
                                    <div className="flex justify-center gap-4 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {loading ? "Searching..." : "Go"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        >
                                            Back
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
