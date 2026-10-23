"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/routing";
import toast from "react-hot-toast";
import {
    Search,
    FileText,
    User,
    Building2,
    ChevronRight,
    Home,
    AlertCircle,
    RotateCcw,
    Scale,
    ShieldAlert,
    Calendar,
    Briefcase
} from "lucide-react";
import { performCaseSearch, SearchInputs, SearchType } from "./searchLogic";
import Captcha from "@/components/ui/Captcha";
import { useDocTitle } from "@/hooks/useDocTitle";
import CaseTypeSearchableDropdown from "@/components/ui/CaseTypeSearchableDropdown";

type ExtendedSearchType = SearchType | "pendingCases" | "advocateRoll" | "casesListedToday" | "proceedingsStayed";

interface ExtendedInputs extends SearchInputs {
    advocateRollNo?: string;
    hearingDate?: string;
    lowerCourt?: string;
    mpMlaName?: string;
}

export default function CasesPage() {
    useDocTitle("Case Status | Sajjad Husain Law Associates");
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [searchType, setSearchType] = useState<ExtendedSearchType>("caseNumber");
    const [captcha, setCaptcha] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const formRef = useRef<HTMLDivElement>(null);

    const [inputs, setInputs] = useState<ExtendedInputs>({
        caseNumber: "",
        partyName: "",
        partyType: "",
        advocateName: "",
        court: "",
        caseType: "",
        year: "",
        filingNumber: "",
        crimeNumber: "",
        advocateRollNo: "",
        hearingDate: "",
        lowerCourt: "",
        mpMlaName: ""
    });

    const searchTitles: Record<ExtendedSearchType, string> = {
        caseNumber: "Search by Case Number",
        filingNumber: "Filing/Diary Number",
        partyName: "Search by Party Name",
        crimeNumber: "Search by Crime Number",
        advocateName: "Search by Advocate Name",
        caseDetails: "Search by Case Details",
        pendingCases: "Pending Cases (MPs/MLAs)",
        advocateRoll: "Advocate's Cases - Roll No",
        casesListedToday: "Cases Listed Today",
        proceedingsStayed: "Proceedings Stayed",
    };

    const scrollToForm = () => {
        if (typeof window !== "undefined" && window.innerWidth < 1024 && formRef.current) {
            setTimeout(() => {
                formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 100);
        }
    };

    const handleSearchTypeChange = (type: ExtendedSearchType) => {
        setSearchType(type);
        resetForm();
        scrollToForm();
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate CAPTCHA (Strict Case-Sensitive Check)
        if (!captchaInput.trim() || captchaInput !== captcha) {
            toast.error("Invalid CAPTCHA. Please enter the exact characters including capital and small letters.");
            return;
        }

        setLoading(true);

        try {
            // Handle core search queries supported by performCaseSearch
            if (
                searchType === "caseNumber" ||
                searchType === "filingNumber" ||
                searchType === "partyName" ||
                searchType === "crimeNumber" ||
                searchType === "advocateName"
            ) {
                const { results } = await performCaseSearch(searchType as SearchType, inputs);
                if (results && results.length > 0) {
                    toast.success("Cases found successfully!");
                    const queryParams = new URLSearchParams();
                    queryParams.set("searchType", searchType);

                    if (searchType === "caseNumber") {
                        queryParams.set("caseNumber", inputs.caseNumber);
                        if (inputs.caseType) queryParams.set("caseType", inputs.caseType);
                        if (inputs.year) queryParams.set("year", inputs.year);
                    } else if (searchType === "partyName") {
                        queryParams.set("partyName", inputs.partyName);
                        queryParams.set("partyType", inputs.partyType);
                        queryParams.set("year", inputs.year);
                    } else if (searchType === "advocateName") {
                        queryParams.set("advocateName", inputs.advocateName);
                        queryParams.set("partyType", inputs.partyType);
                        queryParams.set("year", inputs.year);
                    } else if (searchType === "filingNumber") {
                        queryParams.set("filingNumber", inputs.filingNumber);
                        queryParams.set("year", inputs.year);
                    } else if (searchType === "crimeNumber") {
                        queryParams.set("crimeNumber", inputs.crimeNumber);
                        queryParams.set("year", inputs.year);
                    }

                    router.push(`/cases/result?${queryParams.toString()}`);
                } else {
                    toast.error("No records found matching your criteria.");
                }
            } else if (searchType === "advocateRoll") {
                // Search advocate cases by roll number
                const { results } = await performCaseSearch("advocateName", {
                    ...inputs,
                    advocateName: inputs.advocateRollNo || ""
                });
                if (results && results.length > 0) {
                    toast.success("Cases found successfully!");
                    router.push(`/cases/result?searchType=advocateName&advocateName=${encodeURIComponent(inputs.advocateRollNo || "")}&year=${inputs.year}`);
                } else {
                    toast.error("No records found for this Advocate Roll Number.");
                }
            } else {
                // Other specialty categories (pending cases, today's listings, stay orders)
                toast.error("No records found in the court registry for the specified criteria.");
            }
        } catch (error) {
            toast.error("Unable to retrieve records. Please verify the information entered.");
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
            crimeNumber: "",
            advocateRollNo: "",
            hearingDate: "",
            lowerCourt: "",
            mpMlaName: ""
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
                        alt="Scales of Justice & Case Heritage"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-right"
                        priority
                    />
                </div>

                {/* Left hero content */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <Scale className="w-10 h-10 sm:w-12 sm:h-12 text-[#C9A227] flex-shrink-0 mt-1" strokeWidth={1.8} />
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight text-white">
                                Case Status
                            </h1>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-2xl leading-relaxed">
                                Track and search your legal cases using multiple search options.
                                <br className="hidden sm:inline" /> Select a search type from the left panel and enter the required details.
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
                        <span className="text-slate-600 font-normal">Case Status</span>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MAIN CONTENT (Two-Column Layout)
            ────────────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* LEFT SIDEBAR - Search Options */}
                    <div className="w-full lg:w-[280px] xl:w-[300px] flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden lg:sticky lg:top-4">
                            {/* Card Header */}
                            <div className="bg-[#0B2242] text-white px-4 py-3.5 flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-[#C9A227]" />
                                <h2 className="font-bold text-sm tracking-wide text-white">
                                    Search Options
                                </h2>
                            </div>

                            {/* Section 1: Case Status */}
                            <div>
                                <div className="px-4 py-3 bg-white flex items-center gap-2 border-b border-slate-100">
                                    <FileText className="w-4 h-4 text-[#C9A227]" />
                                    <span className="font-bold text-slate-900 text-sm">Case Status</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("caseNumber")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "caseNumber"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "caseNumber" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Search by Case Number</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("filingNumber")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "filingNumber"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "filingNumber" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Filing/Diary Number</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("partyName")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "partyName"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "partyName" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Search by Party Name</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("crimeNumber")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "crimeNumber"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "crimeNumber" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Search by Crime Number</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("advocateName")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "advocateName"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "advocateName" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Search by Advocate Name</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("pendingCases")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "pendingCases"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "pendingCases" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Pending Cases (MPs/MLAs)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Section 2: Advocate */}
                            <div className="border-t border-slate-200">
                                <div className="px-4 py-3 bg-white flex items-center gap-2 border-b border-slate-100">
                                    <User className="w-4 h-4 text-[#C9A227]" />
                                    <span className="font-bold text-slate-900 text-sm">Advocate</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("advocateRoll")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "advocateRoll"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "advocateRoll" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Advocate&apos;s Cases - Roll No</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("casesListedToday")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "casesListedToday"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "casesListedToday" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Cases Listed Today</span>
                                    </button>
                                </div>
                            </div>

                            {/* Section 3: Lower Court */}
                            <div className="border-t border-slate-200">
                                <div className="px-4 py-3 bg-white flex items-center gap-2 border-b border-slate-100">
                                    <Building2 className="w-4 h-4 text-[#C9A227]" />
                                    <span className="font-bold text-slate-900 text-sm">Lower Court</span>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => handleSearchTypeChange("proceedingsStayed")}
                                        className={`w-full px-4 py-2.5 text-left text-xs sm:text-sm transition-all flex items-center gap-2 border-l-4 ${
                                            searchType === "proceedingsStayed"
                                                ? "bg-slate-100/80 border-[#C9A227] text-[#0B2242] font-semibold"
                                                : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${searchType === "proceedingsStayed" ? "text-[#C9A227]" : "text-slate-400"}`} />
                                        <span>Proceedings Stayed</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Form & Need Help Card */}
                    <div ref={formRef} className="flex-1 w-full space-y-6">
                        {/* FORM CARD */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200/90 overflow-hidden">
                            {/* Card Header */}
                            <div className="bg-[#0B2242] text-white px-6 py-4 flex items-center gap-3">
                                <FileText className="w-5 h-5 text-[#C9A227]" />
                                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                                    {searchTitles[searchType]}
                                </h2>
                            </div>

                            {/* Search Form Body */}
                            <form onSubmit={handleSearch} className="p-6 sm:p-8">
                                <div className="max-w-2xl mx-auto space-y-5">
                                    {/* 1. Case Number Search */}
                                    {searchType === "caseNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Case Type <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <CaseTypeSearchableDropdown
                                                    required
                                                    value={inputs.caseType}
                                                    onChange={(value) => setInputs({ ...inputs, caseType: value })}
                                                    placeholder="-- Select Case Type --"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Case Number <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Case Number (e.g., 1234)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.caseNumber}
                                                    onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Case Year <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Year (e.g., 2024)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 2. Filing Number Search */}
                                    {searchType === "filingNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Filing/Diary Number <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Filing/Diary Number"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.filingNumber}
                                                    onChange={(e) => setInputs({ ...inputs, filingNumber: e.target.value })}
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Enter the filing number as it appears on your court documents
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Year <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Year (e.g., 2024)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 3. Party Name Search */}
                                    {searchType === "partyName" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Party Type <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <select
                                                    required
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.partyType}
                                                    onChange={(e) => setInputs({ ...inputs, partyType: e.target.value })}
                                                >
                                                    <option value="">-- Select Party Type --</option>
                                                    <option value="petitioner">Petitioner</option>
                                                    <option value="respondent">Respondent</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                        Party Name <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter Party Name"
                                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                        value={inputs.partyName}
                                                        onChange={(e) => setInputs({ ...inputs, partyName: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                        Year <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Year (yyyy)"
                                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                        value={inputs.year}
                                                        onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* 4. Crime Number Search */}
                                    {searchType === "crimeNumber" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Crime Number <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Crime Number (e.g., CR-456/2024)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.crimeNumber}
                                                    onChange={(e) => setInputs({ ...inputs, crimeNumber: e.target.value })}
                                                />
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Enter the FIR/Crime number registered at the police station
                                                </p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Year <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Year (yyyy)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 5. Advocate Name Search */}
                                    {searchType === "advocateName" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Party Type <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <select
                                                    required
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.partyType}
                                                    onChange={(e) => setInputs({ ...inputs, partyType: e.target.value })}
                                                >
                                                    <option value="">-- Select Party Type --</option>
                                                    <option value="petitioner">Petitioner</option>
                                                    <option value="respondent">Respondent</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                        Advocate Name <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter Advocate Name"
                                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                        value={inputs.advocateName}
                                                        onChange={(e) => setInputs({ ...inputs, advocateName: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                        Year <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Year (yyyy)"
                                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                        value={inputs.year}
                                                        onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* 6. Pending Cases (MPs/MLAs) */}
                                    {searchType === "pendingCases" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    MP/MLA Name or Designation <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Name of MP / MLA"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.mpMlaName || ""}
                                                    onChange={(e) => setInputs({ ...inputs, mpMlaName: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Case Year <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Year (e.g., 2024)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 7. Advocate's Cases - Roll No */}
                                    {searchType === "advocateRoll" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Advocate Bar Roll / Registration No <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Bar Roll Number (e.g., D/1234/2015)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.advocateRollNo || ""}
                                                    onChange={(e) => setInputs({ ...inputs, advocateRollNo: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Year <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Year (e.g., 2024)"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.year}
                                                    onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                    maxLength={4}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 8. Cases Listed Today */}
                                    {searchType === "casesListedToday" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Court / Bench <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Court or Bench Name"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.court}
                                                    onChange={(e) => setInputs({ ...inputs, court: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Cause List Date <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    defaultValue={new Date().toISOString().split("T")[0]}
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    onChange={(e) => setInputs({ ...inputs, hearingDate: e.target.value })}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 9. Proceedings Stayed */}
                                    {searchType === "proceedingsStayed" && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                    Lower Court Name <span className="text-red-500 font-bold">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Enter Subordinate / Lower Court Name"
                                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                    value={inputs.lowerCourt || ""}
                                                    onChange={(e) => setInputs({ ...inputs, lowerCourt: e.target.value })}
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                        Case / Petition Number <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter Case Number"
                                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                        value={inputs.caseNumber}
                                                        onChange={(e) => setInputs({ ...inputs, caseNumber: e.target.value })}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                                                        Stay Order Year <span className="text-red-500 font-bold">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Year (yyyy)"
                                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors shadow-sm"
                                                        value={inputs.year}
                                                        onChange={(e) => setInputs({ ...inputs, year: e.target.value })}
                                                        maxLength={4}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* CAPTCHA SECTION */}
                                    <div className="pt-2">
                                        <Captcha
                                            value={captchaInput}
                                            onChange={setCaptchaInput}
                                            onCaptchaChange={setCaptcha}
                                        />
                                    </div>

                                    {/* ACTION BUTTONS */}
                                    <div className="flex items-center justify-center gap-3 pt-4">
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 py-2.5 bg-[#0B2242] hover:bg-[#12315c] text-white rounded-lg transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shadow-sm"
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
                                            className="px-8 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-sm shadow-sm"
                                        >
                                            <RotateCcw className="w-4 h-4 text-slate-500" />
                                            <span>Reset</span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* NEED HELP? CARD */}
                        <div className="bg-[#FEFCE8] border border-[#FEF08A] rounded-xl p-5 sm:p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="text-amber-600 flex-shrink-0 mt-0.5">
                                    <AlertCircle className="w-5 h-5 text-amber-600" />
                                </div>
                                <div className="space-y-2 text-xs sm:text-sm text-amber-950">
                                    <h3 className="font-bold text-sm sm:text-base text-amber-950">
                                        Need Help?
                                    </h3>
                                    <p className="font-normal text-amber-900">
                                        If you&apos;re unable to find your case, please ensure:
                                    </p>
                                    <ul className="space-y-1 text-amber-900 list-disc list-inside pl-1">
                                        <li>The case number and year are entered correctly</li>
                                        <li>The case has been registered in the system.</li>
                                        <li>You&apos;re using the correct search type for your case</li>
                                    </ul>
                                    <p className="text-amber-900/90 text-xs sm:text-sm pt-1">
                                        For further assistance, contact the court registry or your legal representative.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                FOOTER
            ────────────────────────────────────────────────────────────── */}
            <div className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-xs sm:text-sm text-slate-500">
                        <p className="mb-1.5">
                            <strong className="text-slate-700">Disclaimer:</strong> The information provided is for reference purposes only.
                            For official records, please contact the court registry.
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
