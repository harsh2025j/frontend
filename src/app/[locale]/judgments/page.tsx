"use client";

import React, { useState } from "react";
import { useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import { Search, FileText, Gavel, Calendar, Home, ChevronRight, Scale, BookOpen, Info, AlertCircle } from 'lucide-react';
import Captcha from "@/components/ui/Captcha";

type SearchType = "caseNumber" | "diaryNumber" | "freeText";

export default function JudgmentsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<SearchType>("caseNumber");
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");

    const [inputs, setInputs] = useState({
        caseType: "",
        caseNumber: "",
        year: "",
        diaryNumber: "",
        diaryYear: "",
        freeText: "",
        fromDate: "",
        toDate: ""
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success("Searching judgments...");
            const queryParams = new URLSearchParams();
            queryParams.set("searchType", searchType);

            if (searchType === "caseNumber") {
                queryParams.set("caseType", inputs.caseType);
                queryParams.set("caseNumber", inputs.caseNumber);
                queryParams.set("year", inputs.year);
            } else if (searchType === "diaryNumber") {
                queryParams.set("diaryNumber", inputs.diaryNumber);
                queryParams.set("year", inputs.diaryYear);
            } else if (searchType === "freeText") {
                queryParams.set("freeText", inputs.freeText);
                queryParams.set("fromDate", inputs.fromDate);
                queryParams.set("toDate", inputs.toDate);
            }

            router.push(`/judgments/result?${queryParams.toString()}`);
        } catch (error) {
            toast.error("Unable to search judgments. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setInputs({
            caseType: "",
            caseNumber: "",
            year: "",
            diaryNumber: "",
            diaryYear: "",
            freeText: "",
            fromDate: "",
            toDate: ""
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
                                Judgments & Legal Precedents Portal
                            </p>
                        </div>
                        <BookOpen className="w-12 h-12 text-[#C9A227]" />
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-500" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Judgments</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title & Info */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-3">
                        Search Judgments
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Search and access court judgments using case number, diary number, or free text search.
                        Select a search method from the left panel and enter the required details.
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
                            <li>Judgments are available from the court's digital archives</li>
                        </ul>
                    </div>
                </div>

                {/* Main Content - Left Sidebar + Right Form */}
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* Left Sidebar - Search Options */}
                    <div className="w-full lg:w-80 flex-shrink-0">
                        <div className="bg-white rounded-xl overflow-hidden border border-gray-200 sticky top-4">
                            <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white p-4">
                                <h3 className="font-bold text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Search Options
                                </h3>
                            </div>

                            {/* Search Methods */}
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
                                    onClick={() => { setSearchType("diaryNumber"); resetForm(); }}
                                    className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "diaryNumber"
                                            ? 'bg-white border-[#C9A227] text-[#0A2342] font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <ChevronRight size={16} className={searchType === "diaryNumber" ? "text-[#C9A227]" : ""} />
                                        <span>Search by Diary Number</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => { setSearchType("freeText"); resetForm(); }}
                                    className={`w-full px-6 py-3 text-left text-sm transition-all border-l-4 ${searchType === "freeText"
                                            ? 'bg-white border-[#C9A227] text-[#0A2342] font-medium'
                                            : 'border-transparent text-gray-600 hover:bg-white/50 hover:border-gray-300'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <ChevronRight size={16} className={searchType === "freeText" ? "text-[#C9A227]" : ""} />
                                        <span>Free Text Search</span>
                                    </div>
                                </button>
                            </div>

                            {/* Quick Info */}
                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-2">
                                    <Info size={16} className="text-[#C9A227]" />
                                    Search Tips
                                </h4>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Use exact case numbers for precise results</li>
                                    <li>• Diary numbers are assigned at filing</li>
                                    <li>• Free text searches keywords in judgments</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex-1">
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            {/* Form Header */}
                            <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a75] border-b border-gray-200 px-6 py-5">
                                <div className="flex items-center gap-3">
                                    {/* <Gavel className="w-6 h-6 text-[#C9A227]" /> */}
                                    <h3 className="text-xl font-bold text-white">
                                        {searchType === "caseNumber" && "Search Judgments by Case Number"}
                                        {searchType === "diaryNumber" && "Search Judgments by Diary Number"}
                                        {searchType === "freeText" && "Free Text Search in Judgments"}
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
                                                    <option value="Civil Appeal">Civil Appeal</option>
                                                    <option value="Criminal Appeal">Criminal Appeal</option>
                                                    <option value="Writ Petition">Writ Petition (Civil)</option>
                                                    <option value="Writ Petition (Criminal)">Writ Petition (Criminal)</option>
                                                    <option value="Special Leave Petition">Special Leave Petition (Civil)</option>
                                                    <option value="Special Leave Petition (Criminal)">Special Leave Petition (Criminal)</option>
                                                    <option value="Transfer Petition">Transfer Petition (Civil)</option>
                                                    <option value="Review Petition">Review Petition</option>
                                                    <option value="Contempt Petition">Contempt Petition</option>
                                                </select>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Select the type of case for which you're searching the judgment
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Case Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Case Number (e.g., 12345)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.caseNumber}
                                                    onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter the numeric case number without year
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Year <span className="text-red-500">*</span>
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

                                    {/* Diary Number Search */}
                                    {searchType === "diaryNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Diary Number <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Diary Number (e.g., 12345)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.diaryNumber}
                                                    onChange={(e) => setInputs({ ...inputs, diaryNumber: e.target.value })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Diary number is assigned when a case is first filed
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Year <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Year (e.g., 2024)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                    value={inputs.diaryYear}
                                                    onChange={(e) => setInputs({ ...inputs, diaryYear: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Free Text Search */}
                                    {searchType === "freeText" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Search Keywords <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    required
                                                    rows={4}
                                                    placeholder="Enter keywords to search in judgments (e.g., fundamental rights, contract breach, etc.)"
                                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all resize-none"
                                                    value={inputs.freeText}
                                                    onChange={(e) => setInputs({ ...inputs, freeText: e.target.value })}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Enter keywords, phrases, or legal terms to search across all judgments
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        From Date (Optional)
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                        value={inputs.fromDate}
                                                        onChange={(e) => setInputs({ ...inputs, fromDate: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                        To Date (Optional)
                                                    </label>
                                                    <input
                                                        type="date"
                                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                                        value={inputs.toDate}
                                                        onChange={(e) => setInputs({ ...inputs, toDate: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Optionally specify a date range to narrow your search results
                                            </p>
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
                                    <p>If you're unable to find a judgment, please ensure:</p>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-amber-700">
                                        <li>The case number or diary number is entered correctly</li>
                                        <li>The judgment has been published and is available online</li>
                                        <li>You're using the correct search method for your query</li>
                                    </ul>
                                    <p className="mt-3 text-amber-900">
                                        For certified copies of judgments, please contact the court registry.
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
                            <strong>Disclaimer:</strong> The judgments provided are for informational purposes only.
                            For official records and certified copies, please contact the court registry.
                        </p>
                        <p className="text-xs text-gray-500">
                            © {new Date().getFullYear()} Sajjad Husain Law Associates. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
