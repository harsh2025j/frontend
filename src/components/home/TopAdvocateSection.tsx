"use client";

import React, { useState, useEffect } from "react";
import { advocatesService } from "@/data/services/advocates-service/advocatesService";
import Loader from "../ui/Loader";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function TopAdvocateSection() {
    const [advocates, setAdvocates] = useState<any[]>([]);
    const [courts, setCourts] = useState<string[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchCourts();
    }, []);

    useEffect(() => {
        fetchTopAdvocates();
    }, [selectedCourt]);

    const fetchCourts = async () => {
        try {
            const response = await advocatesService.getUniqueCourts();
            const data = response.data;

            // Extreme resilience: traverse through potential wrappers
            let courtsArray: string[] = [];

            if (data && data.success && data.data && Array.isArray(data.data.data)) {
                // Case: { success: true, data: { data: [...] } }
                courtsArray = data.data.data;
            } else if (data && data.success && Array.isArray(data.data)) {
                // Case: { success: true, data: [...] }
                courtsArray = data.data;
            } else if (data && Array.isArray(data.data)) {
                // Case: { data: [...] }
                courtsArray = data.data;
            } else if (Array.isArray(data)) {
                // Case: [...]
                courtsArray = data;
            }

            setCourts(courtsArray);
        } catch (error) {
            console.error("Error fetching unique courts for advocates:", error);
            setCourts([]);
        }
    };

    const fetchTopAdvocates = async () => {
        setLoading(true);
        try {
            const response = await advocatesService.getTopAdvocates(1, 5, selectedCourt || undefined);
            const data = response.data;
            if (data && Array.isArray(data.data)) {
                setAdvocates(data.data);
            } else if (Array.isArray(data)) {
                setAdvocates(data);
            } else {
                setAdvocates([]);
            }
        } catch (error) {
            console.error("Error fetching top advocates:", error);
            setAdvocates([]);
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "bg-yellow-500 text-white";
            case 2: return "bg-gray-300 text-gray-700";
            case 3: return "bg-orange-400 text-white";
            default: return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="flex-1 bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden min-h-[450px] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0A2342]">Top Advocates</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ranked by cases created</p>
                </div>

                <div className="relative w-full sm:w-auto z-[20]">
                    <div className="relative group">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full sm:w-56 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 flex items-center justify-between hover:border-[#C9A227] transition-all focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20"
                        >
                            <span className="truncate">{selectedCourt || "All Courts"}</span>
                            <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-0"
                                    onClick={() => setIsDropdownOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-2 w-full sm:w-64 bg-white border border-gray-100 rounded-xl shadow-2xl z-10 py-2 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button
                                        onClick={() => {
                                            setSelectedCourt("");
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${!selectedCourt ? 'text-[#C9A227] font-semibold bg-[#C9A227]/5' : 'text-gray-700'}`}
                                    >
                                        All Courts
                                        {!selectedCourt && (
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                    {Array.isArray(courts) && courts.map((court) => (
                                        <button
                                            key={court}
                                            onClick={() => {
                                                setSelectedCourt(court);
                                                setIsDropdownOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between transition-colors ${selectedCourt === court ? 'text-[#C9A227] font-semibold bg-[#C9A227]/5' : 'text-gray-700'}`}
                                        >
                                            <span className="truncate">{court}</span>
                                            {selectedCourt === court && (
                                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-5 overflow-y-auto">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-2 border-b border-gray-50 last:border-0">
                                {/* Rank */}
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

                                {/* Info */}
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 w-3/4 rounded" />
                                    <div className="h-2 bg-gray-100 w-1/2 rounded" />
                                </div>

                                {/* Score */}
                                <div className="text-right space-y-1">
                                    <div className="h-4 bg-gray-200 w-8 ml-auto rounded" />
                                    <div className="h-2 bg-gray-100 w-10 ml-auto rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : advocates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-60">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No advocate data found</p>
                        <p className="text-xs text-gray-400 mt-1">Try selecting a different court</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {advocates.map((advocate) => (
                            <Link href={`/profile/${advocate.username}`} key={advocate.id} className="flex items-center gap-4 group hover:bg-gray-50 p-2 rounded-lg transition-colors border-b border-gray-50 last:border-0 cursor-pointer">
                                {/* Rank */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${getRankColor(advocate.rank)}`}>
                                    {advocate.rank}
                                </div>

                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 border-2 border-white shadow-sm relative">
                                    {advocate.photoUrl ? (
                                        <Image
                                            src={advocate.photoUrl}
                                            alt={advocate.name}
                                            fill
                                            sizes="100px"
                                            quality={90}
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-[#0A2342] truncate group-hover:text-[#C9A227] transition-colors">{advocate.name}</h4>
                                    <p className="text-[10px] text-gray-500 truncate">{advocate.designation} • {advocate.city}</p>
                                </div>

                                {/* Score */}
                                <div className="text-right">
                                    <p className="text-lg font-bold text-[#0A2342]">{advocate.caseCount}</p>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Cases</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

