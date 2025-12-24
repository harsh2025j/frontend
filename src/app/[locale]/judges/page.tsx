"use client";

import React, { useState, useEffect } from "react";
import { Scale, Gavel, Home, ChevronRight, Mail, Phone, Award, Calendar, BookOpen, User, Building2, Info, Search, Loader2 } from 'lucide-react';
import Image from "next/image";
import toast from "react-hot-toast";
import { judgesService } from "@/data/services/judges-service/judgesService";

type JudgeCategory = "chief-justice" | "senior-judges" | "judges" | "retired";

interface Judge {
    id: string;
    name: string;
    designation: string;
    category: JudgeCategory;
    courtType?: string;
    appointmentDate: string;
    retirementDate?: string;
    education: string[];
    specialization: string[];
    courtNumber?: string;
    email?: string;
    phone?: string;
    imageUrl?: string;
    bio?: string;
}

export default function JudgesPage() {
    const [activeCategory, setActiveCategory] = useState<JudgeCategory>("chief-justice");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCourt, setSelectedCourt] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedCourtType, setSelectedCourtType] = useState("");
    const [judges, setJudges] = useState<Judge[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch judges data
    useEffect(() => {
        const fetchJudges = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await judgesService.getActive();
                const data = response.data?.data || response.data || [];
                setJudges(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error("Error fetching judges:", err);
                setError(err.message || "Failed to load judges data from the server");
                setJudges([]);
                toast.error("Unable to load judges data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchJudges();
    }, []);

    // Get unique courts, years, and court types for filters
    const availableCourts = Array.from(new Set(judges.filter(j => j.courtNumber).map(j => j.courtNumber))).sort();
    const availableYears = Array.from(new Set(judges.map(j => new Date(j.appointmentDate).getFullYear()))).sort((a, b) => b - a);
    const availableCourtTypes = Array.from(new Set(judges.filter(j => j.courtType).map(j => j.courtType!))).sort();

    const filteredJudges = judges.filter(judge => {
        // Category filter
        if (judge.category !== activeCategory) return false;

        // Name/Specialization search
        if (searchQuery && !(
            judge.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            judge.specialization.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        )) return false;

        // Court filter
        if (selectedCourt && judge.courtNumber !== selectedCourt) return false;

        // Year filter
        if (selectedYear && new Date(judge.appointmentDate).getFullYear().toString() !== selectedYear) return false;

        // Court Type filter
        if (selectedCourtType && judge.courtType !== selectedCourtType) return false;

        return true;
    });

    const getCategoryTitle = (category: JudgeCategory) => {
        switch (category) {
            case "chief-justice": return "Chief Justice";
            case "senior-judges": return "Senior Judges";
            case "judges": return "Judges";
            case "retired": return "Retired Judges";
        }
    };

    const getCategoryCount = (category: JudgeCategory) => {
        return judges.filter(j => j.category === category).length;
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
                                Judiciary & Judges Information Portal
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
                        <span className="text-gray-600">Judges</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title & Info */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-3">
                        Our Esteemed Judiciary
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Meet the distinguished judges who uphold justice and serve the court with integrity,
                        wisdom, and dedication to the rule of law.
                    </p>
                </div>

                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                        <p className="font-semibold mb-1">About Our Judiciary:</p>
                        <p className="text-blue-700">
                            Our court is presided over by highly qualified and experienced judges who bring
                            expertise in various fields of law. Each judge is committed to delivering fair
                            and impartial justice.
                        </p>
                    </div>
                </div>

                {/* Category Tabs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <button
                        onClick={() => setActiveCategory("chief-justice")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeCategory === "chief-justice"
                            ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeCategory === "chief-justice" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <Award size={24} className={activeCategory === "chief-justice" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Chief Justice</h3>
                                <p className={`text-sm mt-1 ${activeCategory === "chief-justice" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {getCategoryCount("chief-justice")} member
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveCategory("senior-judges")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeCategory === "senior-judges"
                            ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeCategory === "senior-judges" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <Gavel size={24} className={activeCategory === "senior-judges" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Senior Judges</h3>
                                <p className={`text-sm mt-1 ${activeCategory === "senior-judges" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {getCategoryCount("senior-judges")} members
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveCategory("judges")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeCategory === "judges"
                            ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeCategory === "judges" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <Scale size={24} className={activeCategory === "judges" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Judges</h3>
                                <p className={`text-sm mt-1 ${activeCategory === "judges" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {getCategoryCount("judges")} members
                                </p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveCategory("retired")}
                        className={`p-6 rounded-xl border-2 transition-all ${activeCategory === "retired"
                            ? 'bg-gradient-to-br from-[#0A2342] to-[#1a3a75] text-white border-[#C9A227]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#C9A227] hover:shadow-md'
                            }`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            <div className={`p-3 rounded-full ${activeCategory === "retired" ? 'bg-[#C9A227]' : 'bg-gray-100'
                                }`}>
                                <BookOpen size={24} className={activeCategory === "retired" ? 'text-white' : 'text-gray-600'} />
                            </div>
                            <div className="text-center">
                                <h3 className="font-bold text-lg">Retired</h3>
                                <p className={`text-sm mt-1 ${activeCategory === "retired" ? 'text-blue-200' : 'text-gray-500'}`}>
                                    {getCategoryCount("retired")} members
                                </p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Advanced Search Panel */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-bold text-[#0A2342] mb-4 flex items-center gap-2">
                        <Search size={20} className="text-[#C9A227]" />
                        Advanced Search & Filters
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Court Type Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Court Type
                            </label>
                            <div className="relative">
                                <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all appearance-none bg-white"
                                    value={selectedCourtType}
                                    onChange={(e) => setSelectedCourtType(e.target.value)}
                                >
                                    <option value="">All Court Types</option>
                                    {availableCourtTypes.map((courtType) => (
                                        <option key={courtType} value={courtType}>
                                            {courtType}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Name Search */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Search by Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Enter judge name..."
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Court Number Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Filter by Court
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all appearance-none bg-white"
                                    value={selectedCourt}
                                    onChange={(e) => setSelectedCourt(e.target.value)}
                                >
                                    <option value="">All Courts</option>
                                    {availableCourts.map((court) => (
                                        <option key={court} value={court}>
                                            {court}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Appointment Year Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Appointment Year
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                                <select
                                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all appearance-none bg-white"
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                >
                                    <option value="">All Years</option>
                                    {availableYears.map((year) => (
                                        <option key={year} value={year.toString()}>
                                            {year}
                                        </option>
                                    ))}
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    </div>

                    {/* Active Filters Display & Clear Button */}
                    {(searchQuery || selectedCourt || selectedYear || selectedCourtType) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between flex-wrap gap-3">
                            <div className="flex flex-wrap gap-2">
                                {selectedCourtType && (
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full flex items-center gap-2">
                                        Court Type: {selectedCourtType}
                                        <button onClick={() => setSelectedCourtType("")} className="hover:text-amber-900">×</button>
                                    </span>
                                )}
                                {searchQuery && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full flex items-center gap-2">
                                        Name: "{searchQuery}"
                                        <button onClick={() => setSearchQuery("")} className="hover:text-blue-900">×</button>
                                    </span>
                                )}
                                {selectedCourt && (
                                    <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full flex items-center gap-2">
                                        Court: {selectedCourt}
                                        <button onClick={() => setSelectedCourt("")} className="hover:text-green-900">×</button>
                                    </span>
                                )}
                                {selectedYear && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full flex items-center gap-2">
                                        Year: {selectedYear}
                                        <button onClick={() => setSelectedYear("")} className="hover:text-purple-900">×</button>
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => {
                                    setSearchQuery("");
                                    setSelectedCourt("");
                                    setSelectedYear("");
                                    setSelectedCourtType("");
                                }}
                                className="px-4 py-2 text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Judges Grid */}
                <div className="mb-6">
                    {/* Loading State */}
                    {loading ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12">
                            <div className="text-center">
                                <Loader2 className="w-16 h-16 text-[#C9A227] mx-auto mb-4 animate-spin" />
                                <p className="text-gray-600 text-lg font-semibold">Loading judges data...</p>
                                <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the information</p>
                            </div>
                        </div>
                    ) : error ? (
                        /* Error State */
                        <div className="bg-white rounded-xl border border-red-200 p-12">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Info className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="text-red-600 text-lg font-semibold mb-2">Unable to Load Judges Data</p>
                                <p className="text-gray-600 text-sm mb-4">{error}</p>
                                <p className="text-gray-500 text-sm mb-6">
                                    The judges data could not be retrieved from the server. Please check your connection and try again.
                                </p>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="px-6 py-3 bg-[#0A2342] text-white rounded-lg hover:bg-[#1a3a75] transition-colors font-semibold"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-2xl font-bold text-[#0A2342]">
                                    {getCategoryTitle(activeCategory)}
                                </h3>
                                <span className="text-sm text-gray-600">
                                    {filteredJudges.length} judge{filteredJudges.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {filteredJudges.length === 0 ? (
                                <div className="bg-white rounded-xl border border-gray-200 p-12">
                                    <div className="text-center">
                                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 text-lg font-semibold">No Judges Found</p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            {(searchQuery || selectedCourt || selectedYear || selectedCourtType)
                                                ? "No judges match your current filters. Try adjusting your search criteria."
                                                : `No ${getCategoryTitle(activeCategory).toLowerCase()} available at this time.`}
                                        </p>
                                        {(searchQuery || selectedCourt || selectedYear || selectedCourtType) && (
                                            <button
                                                onClick={() => {
                                                    setSearchQuery("");
                                                    setSelectedCourt("");
                                                    setSelectedYear("");
                                                    setSelectedCourtType("");
                                                }}
                                                className="mt-4 px-6 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#1a3a75] transition-colors font-semibold"
                                            >
                                                Clear All Filters
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredJudges.map((judge) => (
                                        <div key={judge.id} className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-[#C9A227] transition-all hover:shadow-lg">
                                            {/* Judge Photo */}
                                            <div className="bg-gradient-to-br from-[#0A2342] to-[#1a3a75] p-8">
                                                <div className="w-32 h-32 mx-auto bg-white rounded-full flex items-center justify-center border-4 border-[#C9A227]">
                                                    {judge.imageUrl ? (
                                                        <Image
                                                            src={judge.imageUrl}
                                                            alt={judge.name}
                                                            width={128}
                                                            height={128}
                                                            className="rounded-full"
                                                        />
                                                    ) : (
                                                        <User size={64} className="text-gray-400" />
                                                    )}
                                                </div>
                                            </div>

                                            {/* Judge Info */}
                                            <div className="p-6">
                                                <div className="text-center mb-4">
                                                    <h4 className="text-xl font-bold text-[#0A2342] mb-1">
                                                        {judge.name}
                                                    </h4>
                                                    <p className="text-[#C9A227] font-semibold">
                                                        {judge.designation}
                                                    </p>
                                                    {judge.courtNumber && (
                                                        <p className="text-sm text-gray-600 mt-1 flex items-center justify-center gap-1">
                                                            <Building2 size={14} />
                                                            {judge.courtNumber}
                                                        </p>
                                                    )}
                                                </div>

                                                {judge.bio && (
                                                    <p className="text-sm text-gray-600 mb-4 text-center">
                                                        {judge.bio}
                                                    </p>
                                                )}

                                                {/* Appointment Info */}
                                                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                                                    <div className="flex items-center gap-2 text-sm">
                                                        <Calendar size={16} className="text-[#C9A227]" />
                                                        <span className="text-gray-600">Appointed:</span>
                                                        <span className="font-semibold text-gray-900">
                                                            {new Date(judge.appointmentDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </span>
                                                    </div>
                                                    {judge.retirementDate && (
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <Calendar size={16} className="text-gray-400" />
                                                            <span className="text-gray-600">Retires:</span>
                                                            <span className="font-semibold text-gray-900">
                                                                {new Date(judge.retirementDate).toLocaleDateString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Education */}
                                                <div className="mb-4">
                                                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                        <BookOpen size={16} className="text-[#C9A227]" />
                                                        Education
                                                    </h5>
                                                    <ul className="text-sm text-gray-600 space-y-1">
                                                        {judge.education.map((edu, index) => (
                                                            <li key={index} className="pl-4 border-l-2 border-gray-200">
                                                                {edu}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Specialization */}
                                                <div className="mb-4">
                                                    <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                        <Award size={16} className="text-[#C9A227]" />
                                                        Specialization
                                                    </h5>
                                                    <div className="flex flex-wrap gap-2">
                                                        {judge.specialization.map((spec, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200"
                                                            >
                                                                {spec}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Contact Info */}
                                                {(judge.email || judge.phone) && (
                                                    <div className="pt-4 border-t border-gray-200 space-y-2">
                                                        {judge.email && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Mail size={16} className="text-[#C9A227]" />
                                                                <a href={`mailto:${judge.email}`} className="hover:text-[#C9A227] transition-colors">
                                                                    {judge.email}
                                                                </a>
                                                            </div>
                                                        )}
                                                        {judge.phone && (
                                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                <Phone size={16} className="text-[#C9A227]" />
                                                                <span>{judge.phone}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
                            © 2024 Sajjad Husain Law Associates. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
