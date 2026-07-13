"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { Scale, Gavel, Home, ChevronRight, Mail, Phone, Award, Calendar, BookOpen, User, Building2, Info, Search, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";
import toast from "react-hot-toast";
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
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse shadow-sm">
        <div className="bg-gray-100 h-48"></div>
        <div className="p-6 space-y-4">
            <div className="space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
            </div>
            <div className="pt-4 border-t border-gray-100 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-2/3"></div>
            </div>
        </div>
    </div>
);

function JudgesPageContent() {
    useDocTitle("Judges | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeCategory, setActiveCategory] = useState<JudgeCategory>((searchParams.get("category") as JudgeCategory) || "chief-justice");
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

    const fetchJudges = useCallback(async (page: number, category: JudgeCategory, term: string, court: string, courtType: string, year: string) => {
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
    }, []);

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

        // Fetch suggestions when typing
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
            case "chief-justice": return "Chief Justice";
            case "senior-judges": return "Senior Judges";
            case "judges": return "Judges";
            case "retired": return "Retired Judges";
        }
    };

    const availableYears: string[] = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() + 1 - i).toString());
    const availableCourts: string[] = ["Supreme Court of India", "Delhi High Court", "Bombay High Court", "Allahabad High Court"]; 
    const availableCourtTypes: string[] = ["High Court", "Supreme Court", "District Court"];

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Top Header Bar */}
            <div className="bg-[#0A2342] text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 py-12 relative">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="p-4 bg-white/10 rounded-xl backdrop-blur-md border border-white/20 shadow-xl">
                                <Scale className="w-12 h-12 text-[#C9A227]" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-2">
                                    Judiciary Portal
                                </h1>
                                <p className="text-blue-200 text-lg font-medium opacity-80">
                                    Sajjad Husain Law Associates
                                </p>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">Global Search</p>
                                <p className="text-[#C9A227] font-bold">{totalRecords} Registered Judges</p>
                            </div>
                            <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] flex items-center justify-center">
                                <Gavel className="w-6 h-6 text-[#C9A227]" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3 text-sm font-medium">
                        <Link href="/" className="text-gray-400 hover:text-[#0A2342] transition-colors">
                            <Home className="w-4 h-4" />
                        </Link>
                        <ChevronRight className="w-4 h-4 text-gray-300" />
                        <span className="text-[#0A2342] font-bold">Judges</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                {/* Advanced Search Panel */}
                <div className="bg-white rounded-xl shadow-lg shadow-gray-200/40 border border-gray-100 p-8 mb-10 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full -mr-32 -mt-32 -z-0"></div>
                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-[#0A2342] mb-6 flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Search size={20} className="text-blue-600" />
                            </div>
                            Advanced Filter Suite
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Member Name</label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search by name..."
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-blue-600/20 focus:ring-4 focus:ring-blue-600/5 outline-none transition-all font-medium"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => debouncedSearchTerm.length >= 3 && searchSuggestions.length > 0 && setIsOpen(true)}
                                    />
                                    
                                    {/* Inline Suggestions Dropdown */}
                                    {isOpen && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Jump to Profile</p>
                                            </div>
                                            <div className="max-h-[300px] overflow-y-auto">
                                                {searchSuggestions.map((j) => (
                                                    <Link 
                                                        key={j.id} 
                                                        href={`/judges/${j.id}`}
                                                        className="flex items-center gap-4 p-4 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 group/item"
                                                    >
                                                        <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                                                            {j.photoUrl ? (
                                                                <Image src={j.photoUrl} alt={j.name} width={40} height={40} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-[#0A2342] truncate group-hover/item:text-blue-600">
                                                                {j.prefix} {j.name}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase truncate">{j.designation} • {j.court}</p>
                                                        </div>
                                                        <ArrowRight size={14} className="text-gray-300 group-hover/item:text-blue-600 group-hover/item:translate-x-1 transition-all" />
                                                    </Link>
                                                ))}
                                            </div>
                                            {suggestionsLoading && (
                                                <div className="p-4 text-center border-t border-gray-50">
                                                    <Loader2 size={16} className="animate-spin text-blue-600 mx-auto" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Specific Court</label>
                                <CourtSearchableDropdown
                                    value={selectedCourt}
                                    onChange={(val) => updateUrl({ court: val })}
                                    placeholder="Select Jurisdictional Court"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Appointed Year</label>
                                <SearchableSelect
                                    options={[
                                        { value: "", label: "Legacy Search (All)" },
                                        ...availableYears.map(year => ({ value: year, label: year }))
                                    ]}
                                    value={selectedYear}
                                    onChange={(val) => updateUrl({ year: val })}
                                    placeholder="Search by Tenure"
                                    className="w-full"
                                />
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchQuery || selectedCourt || selectedYear) && (
                            <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between flex-wrap gap-4">
                                <div className="flex flex-wrap gap-2">
                                    {searchQuery && (
                                        <div className="px-4 py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100 flex items-center gap-2 shadow-sm">
                                            Name: {searchQuery}
                                            <button onClick={() => updateUrl({ q: "" })} className="hover:text-red-500 font-black ml-1 text-base leading-none">×</button>
                                        </div>
                                    )}
                                    {selectedCourt && (
                                        <div className="px-4 py-2 bg-amber-50 text-amber-700 text-xs font-bold rounded-xl border border-amber-100 flex items-center gap-2 shadow-sm">
                                            Court: {selectedCourt}
                                            <button onClick={() => updateUrl({ court: "" })} className="hover:text-red-500 font-black ml-1 text-base leading-none">×</button>
                                        </div>
                                    )}
                                    {selectedYear && (
                                        <div className="px-4 py-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 flex items-center gap-2 shadow-sm">
                                            Year: {selectedYear}
                                            <button onClick={() => updateUrl({ year: "" })} className="hover:text-red-500 font-black ml-1 text-base leading-none">×</button>
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={() => updateUrl({ q: "", court: "", year: "", courtType: "" })}
                                    className="text-xs font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-4 py-2 rounded-xl transition-all"
                                >
                                    Reset Discovery
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Category Navigation */}
                <div className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(["chief-justice", "senior-judges", "judges", "retired"] as JudgeCategory[]).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                className={`relative p-5 rounded-xl transition-all group overflow-hidden ${activeCategory === cat
                                    ? 'bg-[#0A2342] text-white shadow-xl shadow-blue-900/20'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm'
                                    }`}
                            >
                                <div className="relative z-10 flex flex-col items-center gap-3">
                                    <div className={`p-3.5 rounded-lg transition-all duration-300 ${activeCategory === cat ? 'bg-[#C9A227] scale-105' : 'bg-gray-100 group-hover:bg-blue-50'}`}>
                                        {cat === "chief-justice" && <Award size={24} className={activeCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />}
                                        {cat === "senior-judges" && <Gavel size={24} className={activeCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />}
                                        {cat === "judges" && <Scale size={24} className={activeCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />}
                                        {cat === "retired" && <BookOpen size={24} className={activeCategory === cat ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'} />}
                                    </div>
                                    <div className="text-center">
                                        <p className={`text-sm font-black uppercase tracking-widest ${activeCategory === cat ? 'text-blue-100' : 'text-gray-400'}`}>
                                            {getCategoryTitle(cat)}
                                        </p>
                                    </div>
                                </div>
                                {activeCategory === cat && (
                                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#C9A227]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className={`mb-10 transition-all duration-500 ${loading ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
                    {error ? (
                        <div className="bg-red-50 border border-red-100 rounded-3xl p-16 text-center">
                            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Info size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">System Error</h3>
                            <p className="text-gray-600 max-w-md mx-auto mb-8 font-medium">{error}</p>
                            <button
                                onClick={() => fetchJudges(currentPage, activeCategory, searchQuery, selectedCourt, selectedCourtType, selectedYear)}
                                className="px-10 py-4 bg-[#0A2342] text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20"
                            >
                                Force Restart Fetch
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-8 px-2">
                                <h3 className="text-3xl font-black text-[#0A2342] flex items-center gap-3">
                                    <div className="w-2 h-10 bg-[#C9A227] rounded-full"></div>
                                    {getCategoryTitle(activeCategory)}
                                </h3>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227] animate-pulse"></div>
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        {totalRecords} Records Identified
                                    </span>
                                </div>
                            </div>

                            {loading && judges.length === 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {[...Array(6)].map((_, i) => <JudgeSkeleton key={i} />)}
                                </div>
                            ) : judges.length === 0 && !loading ? (
                                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-24 text-center">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                                        <User size={48} className="text-gray-300" />
                                    </div>
                                    <p className="text-xl font-black text-[#0A2342]">No Profiles Detected</p>
                                    <p className="text-gray-500 mt-2 font-medium">Try broadening your search parameters</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {judges.map((judge) => (
                                        <Link 
                                            href={`/judges/${judge.id}`} 
                                            key={judge.id} 
                                            className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-xl hover:shadow-blue-900/5 hover:-translate-y-1 transition-all duration-300"
                                        >
                                            <div className="relative">
                                                {/* Profile Photo Container */}
                                                <div className="bg-gradient-to-br from-[#0A2342] to-[#1a3a75] p-8 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
                                                    <div className="relative z-10 w-36 h-36 mx-auto bg-white p-1 rounded-lg shadow-xl border-2 border-white/20 transform-none group-hover:scale-105 transition-transform duration-500">
                                                        <div className="w-full h-full rounded-md overflow-hidden bg-gray-100">
                                                            {judge.photoUrl ? (
                                                                <Image
                                                                    src={judge.photoUrl}
                                                                    alt={judge.name}
                                                                    width={160}
                                                                    height={160}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                    <User size={64} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Designation Badge */}
                                                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-20">
                                                    <span className="px-6 py-2 bg-[#C9A227] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-xl border-4 border-white whitespace-nowrap">
                                                        {judge.designation}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Judge Info */}
                                            <div className="p-8 pt-12">
                                                <div className="text-center mb-6">
                                                    <h4 className="text-xl font-black text-[#0A2342] mb-2 group-hover:text-blue-600 transition-colors">
                                                        {judge.prefix && <span className="text-blue-600/60 font-medium mr-1">{judge.prefix}</span>}
                                                        {judge.name}
                                                    </h4>
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded text-gray-500 text-[10px] font-bold border border-gray-100">
                                                        <Building2 size={12} className="text-[#C9A227]" />
                                                        {judge.court}
                                                    </div>
                                                </div>

                                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-2 bg-blue-50 rounded-lg">
                                                                <Calendar size={16} className="text-blue-600" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tenure Started</p>
                                                                <p className="text-sm font-bold text-gray-900">{formatDate(judge.appointmentDate)}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1 text-[#C9A227]">
                                                            <Award size={16} />
                                                            <span className="text-xs font-black">PRO</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-purple-50 rounded-lg">
                                                            <ShieldCheck size={16} className="text-purple-600" />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</p>
                                                            <div className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                                                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                                                {judge.isServing ? 'Internal Registry' : 'Retired / Alumni'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-8 flex items-center justify-between">
                                                    <span className="text-xs font-black text-blue-600 group-hover:translate-x-1 transition-transform flex items-center gap-2">
                                                        VIEW FULL PROFILE <ChevronRight size={14} />
                                                    </span>
                                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-[#0A2342] group-hover:text-white transition-all duration-300">
                                                        <ArrowRight size={18} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-12 flex flex-col items-center gap-4">
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                    />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                        Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} records
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>Note:</strong> For official correspondence with judges, please contact the court registry.
                            Direct communication with judges regarding pending cases is not permitted.
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

export default function JudgesPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-[#C9A227] animate-spin" />
            </div>
        }>
            <JudgesPageContent />
        </Suspense>
    );
}
