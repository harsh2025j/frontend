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

    return (
        <div className="flex-1 min-w-0 h-[480px] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-[#0A2342]/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-[#0A2342]">Top Advocates</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Ranked by cases created</p>
                </div>
                
                {/* Optional: Add court filtering back if needed, for now keeping simple */}
            </div>

            {/* Content Area */}
            <div className="flex-1 relative flex flex-col justify-center overflow-hidden">
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
                ) : (
                    <div className="w-full py-4 overflow-hidden bg-transparent">
                        <div className="flex relative overflow-hidden group/marquee">
                            <div className={`flex ${advocates.length >= 3 ? 'animate-marquee group-hover/marquee:[animation-play-state:paused]' : 'justify-start'} gap-4 px-4`}>
                                {(advocates.length >= 3 ? [...advocates, ...advocates, ...advocates, ...advocates] : advocates).map((advocate, idx) => (
                                    <div 
                                        key={`${advocate.id}-${idx}`} 
                                        className="flex-shrink-0 w-48 group/card block"
                                    >
                                        <div className="relative bg-[#0A2342] rounded-2xl overflow-hidden h-80 shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl border border-transparent hover:border-[#C8A028]">
                                            <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shadow-lg z-20 ${getRankColor(advocate.rank)}`}>
                                                {advocate.rank}
                                            </div>
                                            
                                            <Link href={`/profile/${advocate.username || advocate.id}`} className="h-[60%] w-full relative overflow-hidden block">
                                                {advocate.photoUrl ? (
                                                    <Image src={advocate.photoUrl} alt={advocate.name} fill className="object-cover group-hover/card:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-600">
                                                        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342] via-transparent to-transparent opacity-60"></div>
                                            </Link>

                                            <div className="absolute bottom-2 left-2 right-2 bg-white rounded-xl p-2.5 shadow-xl">
                                                <Link href={`/profile/${advocate.username || advocate.id}`} className="text-center block mb-2">
                                                    <h4 className="text-xs font-bold text-[#0A2342] truncate group-hover/card:text-[#C8A028] transition-colors">{advocate.name}</h4>
                                                    <p className="text-[8px] text-gray-400 uppercase tracking-tighter truncate">{advocate.city}</p>
                                                </Link>
                                                
                                                <div className="flex flex-col gap-1.5">
                                                    <Link 
                                                        href={`/profile/${advocate.username || advocate.id}`} 
                                                        className="bg-[#0A2342] text-white text-[7px] font-bold uppercase py-1.5 rounded-full text-center hover:bg-[#C8A028] transition-colors"
                                                    >
                                                        View Profile
                                                    </Link>
                                                    <Link 
                                                        href={`/book-appointment?advocateId=${advocate.id}`} 
                                                        className="border border-[#0A2342] text-[#0A2342] text-[7px] font-bold uppercase py-1.5 rounded-full text-center hover:bg-[#0A2342] hover:text-white transition-colors"
                                                    >
                                                        Book Appointment
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
}
