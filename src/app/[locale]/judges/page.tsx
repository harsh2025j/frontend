
"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import {
    Scale,
    Gavel,
    Home,
    ChevronRight,
    Award,
    Calendar,
    BookOpen,
    User,
    Building2,
    Info,
    Search,
    Loader2,
    ArrowRight,
    ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/routing";
import Pagination from "@/components/Pagination";
import CourtSearchableDropdown from "@/components/ui/CourtSearchableDropdown";
import SearchableSelect from "@/components/ui/SearchableSelect";

import { Judge, JudgeCategory } from "@/data/services/judges-service/judges.types";

const JudgeSkeleton = () => (
    <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden animate-pulse shadow-sm">
        <div className="bg-slate-200 h-24"></div>
        <div className="p-5 pt-8 space-y-4">
            <div className="space-y-2">
                <div className="h-5 bg-slate-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-slate-100 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="pt-4 border-t border-slate-100 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-2/3"></div>
            </div>
        </div>
    </div>
);

function JudgesPageContent() {
    useDocTitle("Judiciary Portal | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeCategory, setActiveCategory] = useState<JudgeCategory>(
        (searchParams.get("category") as JudgeCategory) || "chief-justice"
    );
    const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
    const debouncedSearchTerm = useDebounce(searchQuery, 600);
    const [selectedCourt, setSelectedCourt] = useState(searchParams.get("court") || "");
    const [selectedYear, setSelectedYear] = useState(searchParams.get("year") || "");
    const [selectedCourtType, setSelectedCourtType] = useState(searchParams.get("courtType") || "");

    const [judges, setJudges] = useState<Judge[]>([]);
    const [searchSuggestions, setSearchSuggestions] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 12;

    const fetchJudges = useCallback(
        async (
            page: number,
            category: JudgeCategory,
            term: string,
            court: string,
            courtType: string,
            year: string
        ) => {
            setLoading(true);
            setError(null);
            try {
                let response;
                const params: any = {
                    page,
                    limit,
                    category
                };

                if (court) params.court = court;
                if (courtType) params.courtType = courtType;
                if (year) params.year = year;

                if (term) {
                    response = await judgesService.searchJudges(term, page, limit, category, courtType, year, court);
                } else {
                    response = await judgesService.getAll(params);
                }

                const rawResponse = response.data?.data || response.data || {};
                const rawData = rawResponse.data || [];
                const total = rawResponse.total || 0;

                const mappedData = Array.isArray(rawData) ? rawData : [];

                setJudges(mappedData);
                setTotalRecords(total);
                setTotalPages(Math.ceil(total / limit) || 1);
            } catch (err: any) {
                console.error("Error fetching judges:", err);
                setError(err.message || "Failed to load judges data from the server");
                setJudges([]);
                setTotalRecords(0);
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        const category = (searchParams.get("category") as JudgeCategory) || "chief-justice";
        const page = parseInt(searchParams.get("page") || "1");
        const term = searchParams.get("q") || "";
        const court = searchParams.get("court") || "";
        const courtType = searchParams.get("courtType") || "";
        const year = searchParams.get("year") || "";

        setActiveCategory(category);
        setCurrentPage(page);

        if (term !== debouncedSearchTerm) {
            setSearchQuery(term);
        }

        setSelectedCourt(court);
        setSelectedCourtType(courtType);
        setSelectedYear(year);

        fetchJudges(page, category, term, court, courtType, year);
    }, [searchParams, fetchJudges]);

    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        if (debouncedSearchTerm !== currentQ) {
            updateUrl({ q: debouncedSearchTerm });
        }

        if (debouncedSearchTerm.length >= 3) {
            fetchSuggestions(debouncedSearchTerm);
        } else {
            setSearchSuggestions([]);
            setIsOpen(false);
        }
    }, [debouncedSearchTerm]);

    const fetchSuggestions = async (term: string) => {
        setSuggestionsLoading(true);
        try {
            const response = await judgesService.searchJudges(term, 1, 5, activeCategory);
            const data = response.data?.data?.data || response.data?.data || [];
            setSearchSuggestions(Array.isArray(data) ? data : []);
            setIsOpen(data.length > 0);
        } catch (err) {
            console.error("Suggestions error:", err);
            setSearchSuggestions([]);
        } finally {
            setSuggestionsLoading(false);
        }
    };

    const updateUrl = (updates: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        if (updates.category || updates.q || updates.court || updates.courtType || updates.year) {
            params.set("page", "1");
        }

        router.push(`/judges?${params.toString()}`, { scroll: false });
    };

    const handleCategoryChange = (category: JudgeCategory) => {
        updateUrl({ category });
    };

    const handlePageChange = (page: number) => {
        updateUrl({ page });
    };

    const getCategoryTitle = (category: JudgeCategory) => {
        switch (category) {
            case "chief-justice":
                return "Chief Justice";
            case "senior-judges":
                return "Senior Judges";
            case "judges":
                return "Judges";
            case "retired":
                return "Retired Judges";
        }
    };

    const availableYears: string[] = Array.from(
        { length: 100 },
        (_, i) => (new Date().getFullYear() + 1 - i).toString()
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* ─────────────────────────────────────────────────────────────
                HERO BANNER
            ────────────────────────────────────────────────────────────── */}
            <div className="relative bg-[#0B2242] text-white overflow-hidden border-t-2 border-[#C9A227] shadow-sm">
                {/* Thin luxury gold gradient accent line */}
                <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F3E5AB] to-transparent z-30 opacity-70 pointer-events-none" />

                {/* Right-aligned courthouse pillars & scales image with smooth gradient fade */}
                <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[65%] md:w-[58%] lg:w-[52%] xl:w-[48%] pointer-events-none overflow-hidden select-none">
                    {/* Multi-stop smooth gradient blend */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B2242] via-[#0B2242]/70 via-20% to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0B2242]/20 via-transparent to-[#0B2242]/15 z-10" />
                    <Image
                        src="/judges-hero-banner.jpg"
                        alt="Judiciary Portal - Neoclassical Courthouse with Scales of Justice"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-right"
                        priority
                    />
                </div>

                {/* Left hero content */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-12 h-12 rounded-xl border border-[#C9A227] flex items-center justify-center text-[#C9A227] flex-shrink-0 bg-white/5">
                            <Scale className="w-6 h-6 text-[#C9A227]" strokeWidth={2} />
                        </div>
                        <div className="h-10 w-[1.5px] bg-[#C9A227]/60 hidden sm:block" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight text-white">
                                Judiciary Portal
                            </h1>
                            <p className="text-slate-200 text-xs sm:text-sm font-medium mt-0.5">
                                Sajjad Husain Law Associates
                            </p>
                            <p className="text-slate-300 text-xs mt-1.5 opacity-90 hidden sm:block">
                                Find Judges | Explore Courts | Access Legal Information
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
                        <span className="text-slate-600 font-normal">Judges</span>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MAIN CONTAINER
            ────────────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Advanced Filter Suite Card */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center text-[#1A73E8]">
                            <Search className="w-4 h-4" />
                        </div>
                        <h2 className="font-bold text-sm sm:text-base text-slate-900">
                            Advanced Filter Suite
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 pl-9">
                        Quickly find judges using multiple filters such as name, court, and year.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Member Name */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Search by Name
                            </label>
                            <div className="relative">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => debouncedSearchTerm.length >= 3 && searchSuggestions.length > 0 && setIsOpen(true)}
                                />

                                {/* Suggestions Dropdown */}
                                {isOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                                        <div className="p-2 border-b border-slate-100 bg-slate-50">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">Jump to Profile</p>
                                        </div>
                                        <div className="max-h-[260px] overflow-y-auto divide-y divide-slate-100">
                                            {searchSuggestions.map((j) => (
                                                <Link
                                                    key={j.id}
                                                    href={`/judges/${j.id}`}
                                                    className="flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative border border-slate-200">
                                                        {j.photoUrl ? (
                                                            <Image src={j.photoUrl} alt={j.name} fill className="object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400"><User size={16} /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold text-slate-900 truncate">{j.name}</p>
                                                        <p className="text-[10px] text-slate-500 truncate">{j.designation || j.court}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        {suggestionsLoading && (
                                            <div className="p-3 text-center border-t border-slate-100">
                                                <Loader2 size={14} className="animate-spin text-[#1A73E8] mx-auto" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Court */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Select a Court
                            </label>
                            <CourtSearchableDropdown
                                value={selectedCourt}
                                onChange={(val) => updateUrl({ court: val })}
                                placeholder="Select Jurisdiction / Court"
                                className="w-full text-xs sm:text-sm"
                            />
                        </div>

                        {/* Year */}
                        <div>
                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                Appointed Year
                            </label>
                            <SearchableSelect
                                options={[
                                    { value: "", label: "Legacy Search (All)" },
                                    ...availableYears.map((year) => ({ value: year, label: year }))
                                ]}
                                value={selectedYear}
                                onChange={(val) => updateUrl({ year: val })}
                                placeholder="All Years"
                                className="w-full text-xs sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Active Filters Reset */}
                    {(searchQuery || selectedCourt || selectedYear) && (
                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                            <div className="flex flex-wrap gap-2 text-xs">
                                {searchQuery && (
                                    <span className="px-2.5 py-1 bg-blue-50 text-[#1A73E8] font-medium rounded-md border border-blue-100 flex items-center gap-1.5">
                                        Name: {searchQuery}
                                        <button onClick={() => updateUrl({ q: "" })} className="hover:text-red-600 font-bold ml-1">×</button>
                                    </span>
                                )}
                                {selectedCourt && (
                                    <span className="px-2.5 py-1 bg-amber-50 text-amber-800 font-medium rounded-md border border-amber-200 flex items-center gap-1.5">
                                        Court: {selectedCourt}
                                        <button onClick={() => updateUrl({ court: "" })} className="hover:text-red-600 font-bold ml-1">×</button>
                                    </span>
                                )}
                                {selectedYear && (
                                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 font-medium rounded-md border border-emerald-200 flex items-center gap-1.5">
                                        Year: {selectedYear}
                                        <button onClick={() => updateUrl({ year: "" })} className="hover:text-red-600 font-bold ml-1">×</button>
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => updateUrl({ q: "", court: "", year: "", courtType: "" })}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Category Selection Tabs (4 in a row) */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { id: "chief-justice", label: "CHIEF JUSTICE", icon: Award },
                        { id: "senior-judges", label: "SENIOR JUDGES", icon: Gavel },
                        { id: "judges", label: "JUDGES", icon: Scale },
                        { id: "retired", label: "RETIRED JUDGES", icon: BookOpen },
                    ].map((tab) => {
                        const isActive = activeCategory === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleCategoryChange(tab.id as JudgeCategory)}
                                className={`p-4 sm:p-5 rounded-xl flex flex-col items-center justify-center gap-2.5 text-center transition-all ${isActive
                                        ? "bg-[#0B2242] text-white shadow-md border-b-4 border-[#C9A227]"
                                        : "bg-white text-slate-700 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow"
                                    }`}
                            >
                                <div
                                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${isActive
                                            ? "bg-[#C9A227] text-white"
                                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span
                                    className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isActive ? "text-white" : "text-slate-800"
                                        }`}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Section Header: Title + Records Count Badge */}
                <div className="flex items-center justify-between mb-6 px-1">
                    <div className="flex items-center gap-2.5">
                        <div className="w-1.5 h-6 bg-[#C9A227] rounded-full" />
                        <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#0B2242]">
                            {getCategoryTitle(activeCategory)}
                        </h3>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-full text-xs font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                        <span>{totalRecords} RECORDS IDENTIFIED</span>
                    </div>
                </div>

                {/* Judges Cards Grid */}
                {loading && judges.length === 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <JudgeSkeleton key={i} />
                        ))}
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-12 text-center">
                        <Info className="w-12 h-12 text-red-600 mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-slate-900 mb-1">Unable to Load Profiles</h4>
                        <p className="text-slate-500 text-xs mb-4 max-w-md mx-auto">{error}</p>
                        <button
                            onClick={() => fetchJudges(currentPage, activeCategory, searchQuery, selectedCourt, selectedCourtType, selectedYear)}
                            className="px-5 py-2 bg-[#0B2242] text-white rounded-lg text-xs font-semibold hover:bg-[#12315c] transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : judges.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-16 text-center">
                        <User className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-lg font-bold text-slate-900">No Judge Profiles Found</h4>
                        <p className="text-slate-400 text-xs mt-1">Try broadening your search or select a different court</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {judges.map((judge) => (
                            <div
                                key={judge.id}
                                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden group"
                            >
                                <div>
                                    {/* Top Navy Header Banner */}
                                    <div className="h-20 bg-[#0B2242] relative flex items-center justify-center" />

                                    {/* Profile Avatar overlapping */}
                                    <div className="w-20 h-20 rounded-2xl border-4 border-white shadow-md overflow-hidden bg-slate-100 mx-auto -mt-10 relative z-10 flex-shrink-0">
                                        {judge.photoUrl ? (
                                            <Image
                                                src={judge.photoUrl}
                                                alt={judge.name}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
                                                <User className="w-9 h-9" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Designation Pill */}
                                    <div className="text-center mt-2.5 mb-1.5 px-3">
                                        <span className="inline-block bg-[#C9A227] text-white text-[10px] font-bold px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                                            {judge.designation || getCategoryTitle(activeCategory).toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Judge Name */}
                                    <h4 className="font-serif font-bold text-base text-slate-900 text-center px-4 leading-snug line-clamp-1 group-hover:text-[#0B2242] transition-colors">
                                        {judge.name}
                                    </h4>

                                    {/* Court Pill */}
                                    <div className="flex justify-center mt-1 mb-3">
                                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                                            <Building2 className="w-3 h-3 text-slate-400" />
                                            <span className="truncate max-w-[180px]">{judge.court || "Supreme Court"}</span>
                                        </span>
                                    </div>

                                    {/* Meta Details Box */}
                                    <div className="mx-4 mb-3 p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-2">
                                        <div className="flex items-center justify-between text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-[#1A73E8]" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">TENURE STARTED</span>
                                            </div>
                                            <span className="font-bold text-slate-800 text-xs">
                                                {formatDate(judge.appointmentDate || judge.createdAt)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-slate-500">
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">STATUS</span>
                                            </div>
                                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-xs">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                <span>{(judge as any).position || judge.designation || (judge.isServing ? "Internal Registry" : "Retired")}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Button */}
                                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between mt-auto">
                                    <Link
                                        href={`/judges/${judge.id}`}
                                        className="text-xs font-bold text-[#1A73E8] hover:text-[#1255ab] flex items-center gap-1 transition-colors"
                                    >
                                        <span>VIEW FULL PROFILE</span>
                                        <ArrowRight className="w-3 h-3" />
                                    </Link>
                                    <Link
                                        href={`/judges/${judge.id}`}
                                        className="w-7 h-7 rounded-full bg-blue-50 hover:bg-blue-100 text-[#1A73E8] flex items-center justify-center transition-colors"
                                        title="View profile"
                                    >
                                        <ArrowRight className="w-3.5 h-3.5" />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}

                {/* Bottom Note Banner */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-start gap-3 mt-8">
                    <Info className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-900">Note: </span>
                        For official correspondence with judges, please contact the court registry. Direct communication with judges regarding pending cases is not permitted.
                    </div>
                </div>
            </div>

            {/* Footer Disclaimer */}
            <div className="bg-white border-t border-slate-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="text-center text-xs sm:text-sm text-slate-500">
                        <p className="mb-1.5">
                            <strong className="text-slate-700">Disclaimer:</strong> The information provided is for reference purposes only.
                            For official judicial records, please contact the respective court registry.
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

export default function JudgesPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-[#C9A227] animate-spin" />
                </div>
            }
        >
            <JudgesPageContent />
        </Suspense>
    );
}
