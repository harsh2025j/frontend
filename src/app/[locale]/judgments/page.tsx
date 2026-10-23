"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import {
    Search,
    FileText,
    Calendar,
    Home,
    ChevronRight,
    Scale,
    Info,
    AlertCircle,
    RotateCcw,
    Lightbulb,
    User
} from "lucide-react";
import Captcha from "@/components/ui/Captcha";
import { useDocTitle } from "@/hooks/useDocTitle";
import CaseTypeSearchableDropdown from "@/components/ui/CaseTypeSearchableDropdown";
import { performJudgmentSearch, JudgmentSearchType } from "./searchLogic";

type SearchType = "caseNumber" | "diaryNumber" | "freeText" | "judgeName";

export default function JudgmentsPage() {
    useDocTitle("Judgments | Sajjad Husain Law Associates");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<SearchType>("caseNumber");
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const formRef = React.useRef<HTMLDivElement>(null);

    const [inputs, setInputs] = useState({
        caseType: "",
        caseNumber: "",
        year: "",
        diaryNumber: "",
        diaryYear: "",
        judgeName: "",
        judgeYear: "",
        freeText: "",
        fromDate: "",
        toDate: ""
    });

    const scrollToForm = () => {
        if (window.innerWidth < 1024 && formRef.current) {
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate CAPTCHA (Strict case-sensitive validation)
        if (!captchaInput.trim() || captchaInput !== captcha) {
            toast.error("Invalid CAPTCHA. Please enter the exact characters including capital and small letters.");
            return;
        }

        setLoading(true);

        try {
            const searchInputs: any = { page: 1 };
            if (searchType === "caseNumber") {
                searchInputs.caseType = inputs.caseType;
                searchInputs.caseNumber = inputs.caseNumber;
                searchInputs.year = inputs.year;
            } else if (searchType === "diaryNumber") {
                searchInputs.diaryNumber = inputs.diaryNumber;
                searchInputs.year = inputs.diaryYear;
            } else if (searchType === "freeText") {
                searchInputs.freeText = inputs.freeText;
                searchInputs.fromDate = inputs.fromDate;
                searchInputs.toDate = inputs.toDate;
            } else if (searchType === "judgeName") {
                searchInputs.judgeName = inputs.judgeName;
                searchInputs.judgeYear = inputs.judgeYear;
            }

            const searchResults = await performJudgmentSearch(searchType as JudgmentSearchType, searchInputs);

            if (!searchResults || !searchResults.data || searchResults.data.length === 0) {
                toast.error("No judgments found matching your criteria.");
                return;
            } else {
                toast.success("Judgments found successfully.");
            }

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
            } else if (searchType === "judgeName") {
                queryParams.set("judgeName", inputs.judgeName);
                if (inputs.judgeYear) {
                    queryParams.set("judgeYear", inputs.judgeYear);
                }
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
            judgeName: "",
            judgeYear: "",
            freeText: "",
            fromDate: "",
            toDate: ""
        });
        setCaptchaInput("");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ─────────────────────────────────────────────────────────────
                HERO BANNER
            ────────────────────────────────────────────────────────────── */}
            <div className="relative bg-[#0B2242] text-white overflow-hidden border-t-2 border-[#C9A227] shadow-sm">
                {/* Thin luxury gold gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3E5AB] to-transparent z-30 opacity-70 pointer-events-none" />

                {/* Right-aligned legal hero background image with smooth gradient fade */}
                <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[65%] md:w-[58%] lg:w-[52%] xl:w-[48%] pointer-events-none overflow-hidden select-none">
                    {/* Multi-stop smooth gradient blend */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B2242] via-[#0B2242]/70 via-20% to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2242]/20 via-transparent to-[#0B2242]/15 z-10" />
                    <Image
                        src="/cases-hero-banner.jpg"
                        alt="Judgments and Legal Precedents - Scales of Justice"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-right"
                        priority
                    />
                </div>

                {/* Left hero brand & title */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-[#C9A227] flex-shrink-0" strokeWidth={1.8} />
                        <div className="h-10 w-[1.5px] bg-[#C9A227]/60 hidden sm:block" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight text-white">
                                Sajjad Husain Law Associates
                            </h1>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-2xl leading-relaxed">
                                Judgments & Legal Precedents Portal
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                BREADCRUMB
            ────────────────────────────────────────────────────────────── */}
            <div className="bg-[#f8fafc] border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
                        <Link href="/" className="hover:text-[#0B2242] transition-colors flex items-center">
                            <Home className="w-3.5 h-3.5 text-slate-400 hover:text-[#0B2242]" />
                        </Link>
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-600 font-normal">Judgments</span>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MAIN CONTAINER
            ────────────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Center Title & Subtitle */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-[#0B2242] mb-2">
                        Search Judgments
                    </h2>
                    <div className="flex justify-center mb-3">
                        <Scale className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                        Search and access court judgments using case number, diary number, or free text search.
                        <br className="hidden sm:inline" /> Select a search method from the left panel and enter the required details.
                    </p>
                </div>

                {/* Important Information Banner */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 sm:p-5 mb-8 flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-slate-700">
                        <p className="font-semibold text-slate-900 mb-1.5">Important Information:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                            <li>All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</li>
                            <li>Enter the CAPTCHA code correctly to proceed with your search.</li>
                            <li>Judgments are available from the court&apos;s digital archives.</li>
                        </ul>
                    </div>
                </div>

                {/* Two-Column Layout */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* LEFT SIDEBAR - Search Options */}
                    <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden lg:sticky lg:top-4">
                            {/* Card Header */}
                            <div className="bg-[#0B2242] text-white px-4 py-3.5 flex items-center gap-2.5">
                                <Search className="w-4 h-4 text-white" />
                                <h3 className="font-bold text-sm tracking-wide text-white">
                                    Search Options
                                </h3>
                            </div>

                            {/* Tabs */}
                            <div className="divide-y divide-slate-100">
                                {[
                                    { id: "caseNumber", label: "Search by Case Number", icon: FileText },
                                    { id: "diaryNumber", label: "Search by Diary Number", icon: FileText },
                                    { id: "freeText", label: "Free Text Search", icon: Search },
                                    { id: "judgeName", label: "Search by Judge Name", icon: User },
                                ].map((tab) => {
                                    const isActive = searchType === tab.id;
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => {
                                                setSearchType(tab.id as SearchType);
                                                resetForm();
                                                scrollToForm();
                                            }}
                                            className={`w-full px-4 py-3.5 text-left text-xs sm:text-sm flex items-center gap-3 transition-colors ${
                                                isActive
                                                    ? "bg-[#FFFDF5] text-slate-900 font-semibold border-l-4 border-[#C9A227]"
                                                    : "bg-white text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                                            }`}
                                        >
                                            <Icon
                                                className={`w-4 h-4 flex-shrink-0 ${
                                                    isActive ? "text-[#C9A227]" : "text-slate-400"
                                                }`}
                                            />
                                            <span>{tab.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Search Tips */}
                            <div className="p-4 bg-slate-50/70 border-t border-slate-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Lightbulb className="w-4 h-4 text-[#C9A227]" />
                                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">Search Tips</h4>
                                </div>
                                <ul className="text-xs text-slate-500 space-y-1.5 leading-relaxed">
                                    <li>• Use exact case number for precise results</li>
                                    <li>• Diary numbers are assigned at filing</li>
                                    <li>• Free text searches keywords in judgments</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT FORM CARD */}
                    <div ref={formRef} className="flex-1 w-full min-w-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-[#0B2242] text-white px-5 sm:px-6 py-4 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#C9A227]" />
                                <h3 className="font-bold text-base sm:text-lg text-white tracking-wide">
                                    {searchType === "caseNumber" && "Search Judgments by Case Number"}
                                    {searchType === "diaryNumber" && "Search Judgments by Diary Number"}
                                    {searchType === "freeText" && "Free Text Search in Judgments"}
                                    {searchType === "judgeName" && "Search Judgments by Judge Name"}
                                </h3>
                            </div>

                            {/* Form Body */}
                            <form onSubmit={handleSearch} className="p-5 sm:p-7 space-y-5">
                                {/* Case Number Search */}
                                {searchType === "caseNumber" && (
                                    <>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Case Type <span className="text-red-500">*</span>
                                            </label>
                                            <CaseTypeSearchableDropdown
                                                required
                                                value={inputs.caseType}
                                                onChange={(value) => setInputs({ ...inputs, caseType: value })}
                                                placeholder="-- Select Case Type --"
                                            />
                                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                                Select the type of case for which you&apos;re searching the judgment
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Case Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Case Number (e.g., 12345)"
                                                className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                value={inputs.caseNumber}
                                                onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                            />
                                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                                Enter the numeric case number without year
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Year <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Year (e.g., 2024)"
                                                className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
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
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Diary Number <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Diary Number (e.g., 12345)"
                                                className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                value={inputs.diaryNumber}
                                                onChange={(e) => setInputs({ ...inputs, diaryNumber: e.target.value })}
                                            />
                                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                                Diary number is assigned when a case is first filed
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Diary Year <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Year (e.g., 2024)"
                                                className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                value={inputs.diaryYear}
                                                onChange={(e) => setInputs({ ...inputs, diaryYear: e.target.value })}
                                                maxLength={4}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Judge Name Search */}
                                {searchType === "judgeName" && (
                                    <>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Judge Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="Enter Judge Name (e.g., D.Y. Chandrachud)"
                                                className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                value={inputs.judgeName}
                                                onChange={(e) => setInputs({ ...inputs, judgeName: e.target.value })}
                                            />
                                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                                Enter any part of the judge&apos;s name
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Year (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="Enter Year (e.g., 2024)"
                                                className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                value={inputs.judgeYear}
                                                onChange={(e) => setInputs({ ...inputs, judgeYear: e.target.value })}
                                                maxLength={4}
                                            />
                                        </div>
                                    </>
                                )}

                                {/* Free Text Search */}
                                {searchType === "freeText" && (
                                    <>
                                        <div>
                                            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                Search Keywords <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                required
                                                rows={4}
                                                minLength={3}
                                                placeholder="Enter keywords to search in judgments (e.g., fundamental rights, contract breach, etc.)"
                                                className="w-full px-4 py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors resize-none"
                                                value={inputs.freeText}
                                                onChange={(e) => setInputs({ ...inputs, freeText: e.target.value })}
                                            />
                                            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
                                                Enter keywords, phrases, or legal terms to search across all judgments
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                    From Date (Optional)
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                    value={inputs.fromDate}
                                                    onChange={(e) => setInputs({ ...inputs, fromDate: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                                                    To Date (Optional)
                                                </label>
                                                <input
                                                    type="date"
                                                    className="w-full px-4 py-2.5 sm:py-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                                    value={inputs.toDate}
                                                    onChange={(e) => setInputs({ ...inputs, toDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* CAPTCHA Component */}
                                <div className="pt-2">
                                    <Captcha
                                        value={captchaInput}
                                        onChange={setCaptchaInput}
                                        onCaptchaChange={setCaptcha}
                                    />
                                </div>

                                {/* Submit & Reset Buttons */}
                                <div className="flex items-center justify-center gap-3 sm:gap-4 pt-4">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 sm:px-10 py-2.5 sm:py-3 bg-[#0B2242] hover:bg-[#12315c] text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                <span>Searching...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Search className="w-4 h-4" />
                                                <span>Search</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="px-8 sm:px-10 py-2.5 sm:py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                                    >
                                        <RotateCcw className="w-4 h-4 text-slate-500" />
                                        <span>Reset</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Need Help? Card */}
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 sm:p-6 mt-8">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <h4 className="font-bold text-slate-900 mb-1.5 text-sm sm:text-base">Need Help?</h4>
                            <p className="mb-2">If you&apos;re unable to find a judgment, please ensure:</p>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 mb-3">
                                <li>The case number and year are entered correctly.</li>
                                <li>The judgment has been published and is available online.</li>
                                <li>You&apos;re using the correct search method for your query.</li>
                            </ul>
                            <p className="text-slate-500 text-xs">
                                For certified copies of judgments, please contact the court registry.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-xs sm:text-sm text-slate-500">
                        <p className="mb-1.5">
                            <strong className="text-slate-700">Disclaimer:</strong> The judgments provided are for informational purposes only.
                            For official records and certified copies, please contact the court registry.
                        </p>
                        <p className="text-slate-400 text-xs">
                            © {new Date().getFullYear()} Sajjad Husain Law Associates. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
