"use client";

import React, { useState, useEffect, useRef } from "react";
import { advocatesService } from "@/data/services/advocates-service/advocatesService";
import Loader from "../ui/Loader";
import Image from "next/image";
import { Link } from "@/i18n/routing";

const RANK_LABELS = ["I", "II", "III"];

const getRankStyle = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-br from-[#C9A227] to-[#b39022] text-white border-[#C9A227] shadow-sm shadow-[#C9A227]/20";
    if (rank === 2) return "bg-gradient-to-br from-slate-200 to-slate-400 text-white border-slate-300 shadow-sm shadow-slate-200";
    if (rank === 3) return "bg-gradient-to-br from-orange-300 to-orange-500 text-white border-orange-400 shadow-sm shadow-orange-200";
    return "bg-stone-100 text-stone-500 border-stone-200";
};

export default function TopAdvocateSection() {
    const [advocates, setAdvocates] = useState<any[]>([]);
    const [courts, setCourts] = useState<string[]>([]);
    const [selectedCourt, setSelectedCourt] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
        fetchCourts();
    }, []);

    useEffect(() => {
        fetchTopAdvocates();
    }, [selectedCourt]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const fetchCourts = async () => {
        try {
            const response = await advocatesService.getUniqueCourts();
            const data = response.data;
            let arr: string[] = [];
            if (data?.success && Array.isArray(data?.data?.data)) arr = data.data.data;
            else if (data?.success && Array.isArray(data?.data)) arr = data.data;
            else if (Array.isArray(data?.data)) arr = data.data;
            else if (Array.isArray(data)) arr = data;
            setCourts(arr);
        } catch {
            setCourts([]);
        }
    };

    const fetchTopAdvocates = async () => {
        setLoading(true);
        try {
            const response = await advocatesService.getTopAdvocates(1, 5, selectedCourt || undefined);
            const data = response.data;
            if (data && Array.isArray(data.data)) setAdvocates(data.data);
            else if (Array.isArray(data)) setAdvocates(data);
            else setAdvocates([]);
        } catch {
            setAdvocates([]);
        } finally {
            setLoading(false);
        }
    };

    const displayAdvocates = advocates.slice(0, 5);

    return (
        <div className="flex flex-col h-full min-h-[480px] bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 px-6 py-5 border-b border-stone-100 flex-wrap">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#C9A227] font-serif">
                        Leaderboard
                    </span>
                    <h2 className="m-0 text-[22px] font-bold text-[#0A2342] font-serif tracking-tight leading-tight">
                        Top Advocates
                    </h2>
                </div>

                {/* Court filter */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center justify-between gap-2 px-4 py-2 min-w-[148px] bg-stone-50 border border-stone-200 rounded-lg text-[13px] text-[#0A2342] font-medium hover:border-[#C9A227] hover:bg-[#C9A227]/5 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/20"
                    >
                        <span className="truncate max-w-[160px]">{selectedCourt || "All Courts"}</span>
                        <svg
                            className={`w-3.5 h-3.5 text-stone-400 flex-shrink-0 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
                            fill="none" viewBox="0 0 16 16" stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6l4 4 4-4" />
                        </svg>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-64 bg-white border border-stone-100 rounded-xl shadow-xl shadow-stone-200/60 py-1.5 max-h-56 overflow-y-auto">
                            <button
                                onClick={() => { setSelectedCourt(""); setIsDropdownOpen(false); }}
                                className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left transition-colors ${!selectedCourt
                                        ? "text-[#C9A227] font-semibold bg-[#C9A227]/10"
                                        : "text-stone-700 hover:bg-stone-50"
                                    }`}
                            >
                                All Courts
                                {!selectedCourt && (
                                    <svg className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                                    </svg>
                                )}
                            </button>

                            {courts.length > 0 && <div className="h-px bg-stone-100 my-1 mx-3" />}

                            {courts.map((court) => (
                                <button
                                    key={court}
                                    onClick={() => { setSelectedCourt(court); setIsDropdownOpen(false); }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-[13px] text-left gap-2 transition-colors ${selectedCourt === court
                                            ? "text-[#C9A227] font-semibold bg-[#C9A227]/10"
                                            : "text-stone-700 hover:bg-stone-50"
                                        }`}
                                >
                                    <span className="truncate">{court}</span>
                                    {selectedCourt === court && (
                                        <svg className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0" fill="currentColor" viewBox="0 0 16 16">
                                            <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.75.75 0 0 1 1.06-1.06L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0z" />
                                        </svg>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 min-h-0">
                {loading ? (
                    <div className="flex items-center justify-center h-full min-h-[200px]">
                        <Loader />
                    </div>
                ) : displayAdvocates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 min-h-[200px] opacity-60">
                        <svg className="w-12 h-12 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                            <circle cx="24" cy="18" r="8" strokeWidth="1.5" />
                            <path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <p className="text-sm text-stone-400 font-medium m-0">No advocates found</p>
                        {selectedCourt && (
                            <button
                                onClick={() => setSelectedCourt("")}
                                className="text-xs text-[#C9A227] underline underline-offset-2 hover:text-[#b39022] transition-colors"
                            >
                                Clear filter
                            </button>
                        )}
                    </div>
                ) : (
                    <ul className="flex flex-col gap-2 list-none m-0 p-0">
                        {displayAdvocates.map((advocate, idx) => {
                            const rankNum = idx + 1;
                            const isActive = activeIdx === idx;

                            return (
                                <li
                                    key={advocate.id}
                                    className={`
                                        flex items-center gap-3 px-3.5 py-3 rounded-xl border
                                        transition-all duration-200 cursor-default select-none
                                        ${isActive
                                            ? "border-[#C9A227] bg-white shadow-md shadow-[#C9A227]/10 -translate-y-px"
                                            : "border-stone-100 bg-stone-50/70 hover:border-stone-200 hover:bg-white"
                                        }
                                        ${mounted ? "opacity-0" : "opacity-0"}
                                    `}
                                    style={{
                                        animation: mounted ? `slideUp 0.32s ease forwards ${idx * 55}ms` : undefined,
                                    }}
                                    onMouseEnter={() => setActiveIdx(idx)}
                                    onMouseLeave={() => setActiveIdx(null)}
                                >
                                    {/* Rank badge */}
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border font-serif ${getRankStyle(rankNum)}`}>
                                        {rankNum <= 3 ? RANK_LABELS[rankNum - 1] : rankNum}
                                    </div>

                                    {/* Avatar */}
                                    <Link
                                        href={`/profile/${advocate.username || advocate.id}`}
                                        className={`flex-shrink-0 relative w-11 h-11 rounded-full overflow-hidden border-2 transition-all duration-200 block ${isActive ? "border-[#C9A227]" : "border-stone-200"
                                            }`}
                                    >
                                        {advocate.photoUrl ? (
                                            <Image
                                                src={advocate.photoUrl}
                                                alt={advocate.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-200 text-stone-400">
                                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                                </svg>
                                            </div>
                                        )}
                                    </Link>

                                    {/* Name + meta */}
                                    <div className="flex-1 min-w-0">
                                        <p className="m-0 text-[13.5px] font-bold text-[#0A2342] truncate font-serif leading-tight">
                                            {advocate.name}
                                        </p>
                                        <p className="m-0 mt-0.5 text-[11px] text-stone-400 truncate tracking-wide">
                                            {advocate.city || "Legal Professional"}
                                        </p>
                                        {advocate.caseCount !== undefined && (
                                            <p className="m-0 mt-0.5 text-[10px] text-stone-400">
                                                <span className="text-[#C9A227] font-bold font-serif">{advocate.caseCount}</span>
                                                {" "}
                                                <span className="uppercase tracking-widest text-[9px]">cases</span>
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <Link
                                            href={`/profile/${advocate.username || advocate.id}`}
                                            className="px-4 py-2 rounded-lg bg-[#0A2342] text-white text-[12px] font-bold tracking-wide font-serif hover:bg-[#C9A227] transition-colors duration-200 whitespace-nowrap"
                                        >
                                            Profile
                                        </Link>
                                        <Link
                                            href={`/book-appointment?advocateId=${advocate.id}`}
                                            className="hidden sm:flex px-4 py-2 rounded-lg border border-stone-200 text-[#0A2342] text-[12px] font-bold tracking-wide font-serif hover:border-[#0A2342] hover:bg-stone-50 transition-all duration-200 whitespace-nowrap"
                                        >
                                            Book Appointment
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <style jsx global>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}