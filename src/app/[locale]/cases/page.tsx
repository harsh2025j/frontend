"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { Search, FileText, User, Gavel, Calendar, Home, ChevronRight, Scale, Building2, FileCheck, Info, AlertCircle } from 'lucide-react';
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/20 to-gray-100">
            {/* Top Header Bar */}
            <div className="bg-gradient-to-r from-[#0A2342] via-[#1a3a75] to-[#0A2342] text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <Scale className="w-12 h-12 text-[#C9A227]" />
                        <div className="text-center">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                Sajjad Husain Law Associates
                            </h1>
                            <p className="text-blue-200 mt-2 text-sm md:text-base">
                                Case Status & Information Portal
                            </p>
                        </div>
                        <Gavel className="w-12 h-12 text-[#C9A227]" />
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-500" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Case Status</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title & Info */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-3">
                        Search Case Status
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Search and track your legal cases using multiple search options.
                        Select a search type from the left panel and enter the required details.
                    </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">Important Information:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>All fields marked with <span className="text-red-500">*</span> are mandatory</li>
                            <li>Enter the CAPTCHA code correctly to proceed with your search</li>
                            <li>For best results, ensure all information is accurate and complete</li>
                        </ul>
                    </div>
                </div>

                {/* Main Content - Left Sidebar + Right Form */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Tabs */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 sticky top-4">
                            <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white p-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Search Options
                                </h3>
                            </div>

                            {/* Case Status Section - Always Expanded */}
                            <div className="border-b border-gray-200">
                                <div className="w-full p-4 bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white">
                                    <div className="flex items-center gap-3">
                                        <Search size={20} className="text-[#C9A227]" />
                                        <span className="font-semibold">Case Status</span>
                                    </div>
                                </div>

                                {/* Sub-tabs for Case Status */}
                                <div className="bg-gray-50">
                                    <button
                                        onClick={() => { setSearchType("caseNumber"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "caseNumber"
                                            ? 'bg-white border-[#C9A227] text-[#0A2342] font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} className={searchType === "caseNumber" ? "text-[#C9A227]" : ""} />
                                            <span>Search by Case Number</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchType("filingNumber"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "filingNumber"
                                            ? 'bg-white border-[#C9A227] text-[#0A2342] font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} className={searchType === "filingNumber" ? "text-[#C9A227]" : ""} />
                                            <span>Filing/Token/Diary Number</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchType("partyName"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "partyName"
                                            ? 'bg-white border-[#C9A227] text-[#0A2342] font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} className={searchType === "partyName" ? "text-[#C9A227]" : ""} />
                                            <span>Search by Party Name</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => { setSearchType("crimeNumber"); resetForm(); }}
                                        className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "crimeNumber"
                                            ? 'bg-white border-[#C9A227] text-[#0A2342] font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} className={searchType === "crimeNumber" ? "text-[#C9A227]" : ""} />
                                            <span>Search by Crime Number</span>
                                        </div>
                                    </button>

                                    <button
                                        className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300"
                                    >
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Pending Cases (MPs/MLAs)</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Advocate Section - Always Expanded */}
                            <div className="border-b border-gray-200">
                                <div className="w-full p-4 bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white">
                                    <div className="flex items-center gap-3">
                                        <User size={20} className="text-[#C9A227]" />
                                        <span className="font-semibold">Advocate</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50">
                                    <button className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Advocate's Cases - Roll No</span>
                                        </div>
                                    </button>
                                    <button className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Cases Listed Today</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* Lower Court Section - Always Expanded */}
                            <div>
                                <div className="w-full p-4 bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white">
                                    <div className="flex items-center gap-3">
                                        <Building2 size={20} className="text-[#C9A227]" />
                                        <span className="font-semibold">Lower Court</span>
                                    </div>
                                </div>

                                <div className="bg-gray-50">
                                    <button className="w-full px-6 py-3 text-left text-sm transition-all border-l-4 border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300">
                                        <div className="flex items-center gap-2">
                                            <ChevronRight size={16} />
                                            <span>Proceedings Stayed</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a75] border-b border-gray-200 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    <FileCheck className="w-6 h-6 text-[#C9A227]" />
                                    <h3 className="text-xl font-bold text-white">
                                        {searchType === "caseNumber" && "Search by Case Number"}
                                        {searchType === "filingNumber" && "Search by Filing/Token/Diary Number"}
                                        {searchType === "partyName" && "Search by Party Name"}
                                        {searchType === "crimeNumber" && "Search by Crime Number"}
                                    </h3>
                                </div>
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
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.caseType}
                                                    onChange={(e) => setInputs({ ...inputs, caseType: e.target.value })}
                                                >
                                                    <option value="">-- Select Case Type --</option>
                                                    <option value="Civil">Civil Case</option>
                                                    <option value="Criminal">Criminal Case</option>
                                                    <option value="Writ">Writ Petition</option>
                                                    <option value="Appeal">Appeal</option>
                                                    <option value="Revision">Revision</option>
                                                    <option value="Execution">Execution</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Case Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Case Number (e.g., 123/2024)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
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
                                                    placeholder="Enter Year (e.g., 2024)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
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
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.filingNumber}
                                                    onChange={(e) => setInputs({ ...inputs, filingNumber: e.target.value })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter the filing number as it appears on your documents
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Year <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Year (yyyy)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
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
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.partyType}
                                                    onChange={(e) => setInputs({ ...inputs, partyType: e.target.value })}
                                                >
                                                    <option value="">-- Select Party Type --</option>
                                                    <option value="Petitioner">Petitioner</option>
                                                    <option value="Respondent">Respondent</option>
                                                    <option value="Appellant">Appellant</option>
                                                    <option value="Defendant">Defendant</option>
                                                    <option value="Plaintiff">Plaintiff</option>
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
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
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
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                        value={inputs.year}
                                                        onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                        maxLength={4}
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
                                                    placeholder="Enter Crime Number (e.g., CR-456/2024)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.crimeNumber}
                                                    onChange={(e) => setInputs({ ...inputs, crimeNumber: e.target.value })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter the FIR/Crime number registered at the police station
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Year <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Year (yyyy)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* CAPTCHA Component */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <Captcha
                                            value={captchaInput}
                                            onChange={setCaptchaInput}
                                            onCaptchaChange={setCaptcha}
                                        />
                                    </div>

                                    {/* Submit Buttons */}
                                    <div className="flex justify-center gap-4 pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-10 py-3 bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {loading ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <Search size={20} />
                                                    Search
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-10 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold hover:border-gray-400"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Help Section */}
                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-2">Need Help?</p>
                                    <p>If you're unable to find your case, please ensure:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-amber-700">
                                        <li>The case number and year are entered correctly</li>
                                        <li>The case has been registered in the system</li>
                                        <li>You're using the correct search type for your case</li>
                                    </ul>
                                    <p className="mt-3 text-amber-900">
                                        For further assistance, contact the court registry or your legal representative.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>Disclaimer:</strong> The information provided is for reference purposes only.
                            For official records, please contact the court registry.
                        </p>
                        <p className="text-xs text-gray-500">
                            © 2024 Sajjad Husain Law Associates. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
