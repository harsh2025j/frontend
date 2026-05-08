"use client";

import React, { useState, useEffect } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import Loader from "../ui/Loader";
import Image from "next/image";
import { Link } from "@/i18n/routing";

export default function TopJudges() {
    const [judges, setJudges] = useState<any[]>([]);
    const [courts, setCourts] = useState<string[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        fetchCourts();
    }, []);

    useEffect(() => {
        fetchTopJudges();
    }, [selectedCourt]);

    const fetchCourts = async () => {
        try {
            const response = await judgesService.getUniqueCourts();
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
            console.error("Error fetching unique courts for judges:", error);
            setCourts([]);
        }
    };

    const fetchTopJudges = async () => {
        setLoading(true);
        try {
            const response = await judgesService.getTopJudges(1, 12, selectedCourt || undefined);
            const data = response.data;
            if (data && Array.isArray(data.data)) {
                setJudges(data.data);
            } else if (Array.isArray(data)) {
                setJudges(data);
            } else {
                setJudges([]);
            }
        } catch (error) {
            console.error("Error fetching top judges:", error);
            setJudges([]);
        } finally {
            setLoading(false);
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1: return "bg-yellow-500 text-white"; // Gold
            case 2: return "bg-gray-300 text-gray-700"; // Silver
            case 3: return "bg-orange-400 text-white"; // Bronze
            default: return "bg-gray-100 text-gray-600";
        }
    };

    return (
        <div className="flex-1 min-w-0 h-[480px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#0A2342]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0A2342]">Top Judges</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ranked by judgments delivered</p>
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
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-4 p-2 border-b border-gray-50 last:border-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 w-3/4 rounded" />
                                    <div className="h-2 bg-gray-100 w-1/2 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : judges.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-60">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No ranking data found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {judges.map((judge) => (
                            <Link href={`/judges/${judge.id}`} key={judge.id} className="block group">
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-[0_10px_25px_rgba(184,154,62,0.15)] group-hover:-translate-y-[3px] group-hover:border-[#C8A028] transition-all duration-300 ease-in-out overflow-hidden flex h-32 sm:h-36 relative">
                                    {/* Rank Badge Overlay */}
                                    <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg z-20 group-hover:scale-[1.15] transition-transform duration-300 ease-in-out ${getRankColor(judge.rank)}`}>
                                        {judge.rank}
                                    </div>

                                    {/* Left Side: Judge Photo */}
                                    <div className="w-1/3 sm:w-[120px] relative bg-gray-50 flex-shrink-0 overflow-hidden">
                                        {judge.photoUrl ? (
                                            <Image
                                                src={judge.photoUrl}
                                                alt={judge.name}
                                                fill
                                                sizes="(max-width: 768px) 33vw, 120px"
                                                quality={90}
                                                className="object-cover group-hover:scale-[1.06] transition-transform duration-300 ease-in-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 group-hover:scale-[1.06] transition-transform duration-300 ease-in-out">
                                                <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Side: Details & Actions */}
                                    <div className="flex-1 p-3 flex flex-col justify-between bg-white min-w-0">
                                        <div className="space-y-0.5 sm:space-y-1">
                                            <h4 className="text-sm sm:text-base font-bold text-[#0A2342] group-hover:text-[#C8A028] group-hover:tracking-wider transition-all duration-300 ease-in-out line-clamp-1 leading-tight">
                                                {judge.name}
                                            </h4>
                                            <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                {judge.designation}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 mt-2">
                                            {/* Full Profile Button (Pill) */}
                                            <div className="flex-1 bg-white border border-gray-200 group-hover:border-[#C8A028] group-hover:bg-[#C8A028]/5 rounded-full py-1 px-2 sm:px-4 flex items-center justify-center gap-2 shadow-sm transition-all duration-300 ease-in-out">
                                                <span className="text-[9px] sm:text-xs font-bold text-[#0A2342] group-hover:text-[#C8A028] transition-colors duration-300">Full Profile</span>
                                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-[#0A2342] group-hover:text-[#C8A028] transition-all duration-300 group-hover:-rotate-[10deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Floating Judgments Count Badge */}
                                    <div className="absolute top-2 right-2 p-1">
                                        <div className="bg-[#0A2342]/10 group-hover:bg-[#C8A028]/15 text-[#0A2342] group-hover:text-[#C8A028] px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-tighter transition-all duration-300 ease-in-out">
                                            {judge.judgmentCount} Judgments
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #0A234220;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #C8A02840;
                }
            `}</style>
        </div>
    );
}
