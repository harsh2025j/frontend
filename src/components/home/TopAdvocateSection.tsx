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
            const response = await advocatesService.getTopAdvocates(1, 12, selectedCourt || undefined);
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

    const maxItems = 6;
    const displayAdvocates = advocates.slice(0, maxItems);
    const count = displayAdvocates.length;
    const radius = 250; // Increased radius for more space
    const angleStep = 360 / Math.max(count, 1);

    return (
        <div className="flex-1 min-w-0 h-[500px] flex flex-col overflow-hidden bg-transparent">
            {/* Header */}
            <div className="p-5 border-b border-[#0A2342]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0A2342]">Top Advocates</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ranked by cases created</p>
                </div>

                <div className="relative w-full sm:w-auto z-[30]">
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

            {/* Content Area */}
            <div className="flex-1 relative flex flex-col justify-center items-center overflow-hidden perspective-2500 carousel-scene">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader />
                    </div>
                ) : advocates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-60">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <p className="text-gray-500 font-medium">No advocate data found</p>
                    </div>
                ) : displayAdvocates.length < 3 ? (
                    <div className="flex gap-8 justify-center items-center py-10 w-full px-4">
                        {displayAdvocates.map((advocate) => (
                            <div key={advocate.id} className="w-52 flex-shrink-0">
                                <div className="relative bg-[#0A2342] rounded-3xl overflow-hidden h-80 w-full shadow-2xl border border-[#C8A028]/10 flex flex-col transition-all duration-300 hover:-translate-y-2">
                                    <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg z-20 ${getRankColor(advocate.rank)}`}>
                                        {advocate.rank}
                                    </div>

                                    <Link href={`/profile/${advocate.username || advocate.id}`} className="h-[55%] w-full relative overflow-hidden block">
                                        {advocate.photoUrl ? (
                                            <Image src={advocate.photoUrl} alt={advocate.name} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342] via-transparent to-transparent opacity-70"></div>
                                    </Link>

                                    <div className="flex-1 bg-white p-3.5 flex flex-col justify-between">
                                        <div className="text-center">
                                            <h4 className="text-[13px] font-bold text-[#0A2342] truncate">{advocate.name}</h4>
                                            <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest truncate mt-0.5">{advocate.city || "Professional"}</p>
                                        </div>

                                        <div className="flex flex-col gap-1.5 mt-2">
                                            <Link
                                                href={`/profile/${advocate.username || advocate.id}`}
                                                className="bg-[#0A2342] text-white text-[9px] font-bold uppercase py-2 rounded-xl text-center hover:bg-[#C8A028] transition-all duration-300"
                                            >
                                                Profile
                                            </Link>
                                            <Link
                                                href={`/book-appointment?advocateId=${advocate.id}`}
                                                className="border border-[#0A2342] text-[#0A2342] text-[9px] font-bold uppercase py-2 rounded-xl text-center hover:bg-[#0A2342] hover:text-white transition-all duration-300"
                                            >
                                                Book Appointment
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="carousel-container">
                        <div className="carousel-track">
                            {displayAdvocates.map((advocate, idx) => {
                                const angle = angleStep * idx;
                                return (
                                    <div
                                        key={`${advocate.id}-${idx}`}
                                        className="carousel-item"
                                        style={{
                                            transform: `rotateY(${angle}deg) translateZ(${radius}px)`
                                        }}
                                    >
                                        <div className="relative bg-[#0A2342] rounded-3xl overflow-hidden h-80 w-52 shadow-2xl border border-[#C8A028]/10 flex flex-col transition-all duration-300">
                                            <div className={`absolute top-3 left-3 w-7 h-7 rounded-full flex items-center justify-center font-bold text-[11px] shadow-lg z-20 ${getRankColor(advocate.rank)}`}>
                                                {advocate.rank}
                                            </div>

                                            <Link href={`/profile/${advocate.username || advocate.id}`} className="h-[55%] w-full relative overflow-hidden block">
                                                {advocate.photoUrl ? (
                                                    <Image src={advocate.photoUrl} alt={advocate.name} fill className="object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342] via-transparent to-transparent opacity-70"></div>
                                            </Link>

                                            <div className="flex-1 bg-white p-3.5 flex flex-col justify-between">
                                                <div className="text-center">
                                                    <h4 className="text-[13px] font-bold text-[#0A2342] truncate">{advocate.name}</h4>
                                                    <p className="text-[9px] text-gray-500 font-semibold uppercase tracking-widest truncate mt-0.5">{advocate.city || "Professional"}</p>
                                                </div>

                                                <div className="flex flex-col gap-1.5 mt-2">
                                                    <Link
                                                        href={`/profile/${advocate.username || advocate.id}`}
                                                        className="bg-[#0A2342] text-white text-[9px] font-bold uppercase py-2 rounded-xl text-center hover:bg-[#C8A028] transition-all duration-300"
                                                    >
                                                        Profile
                                                    </Link>
                                                    <Link
                                                        href={`/book-appointment?advocateId=${advocate.id}`}
                                                        className="border border-[#0A2342] text-[#0A2342] text-[9px] font-bold uppercase py-2 rounded-xl text-center hover:bg-[#0A2342] hover:text-white transition-all duration-300"
                                                    >
                                                        Book Appointment
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .perspective-2500 {
                    perspective: 2500px;
                }
                .carousel-container {
                    width: 200px;
                    height: 320px;
                    position: relative;
                    transform-style: preserve-3d;
                    transform: translateY(-20px);
                }
                .carousel-track {
                    width: 100%;
                    height: 100%;
                    position: absolute;
                    transform-style: preserve-3d;
                    transform: translateZ(-450px);
                    animation: rotate-clockwise 45s linear infinite;
                }
                .carousel-scene:hover .carousel-track {
                    animation-play-state: paused;
                }
                /* Also pause when hovering individual items */
                .carousel-item:hover ~ .carousel-track,
                .carousel-track:hover {
                    animation-play-state: paused;
                }
                .carousel-item {
                    position: absolute;
                    width: 200px;
                    height: 320px;
                    left: 0;
                    top: 0;
                    backface-visibility: visible;
                }
                @keyframes rotate-clockwise {
                    from { transform: translateZ(-450px) rotateY(0deg); }
                    to { transform: translateZ(-450px) rotateY(360deg); }
                }
            `}</style>
        </div>
    );
}
