"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Calendar,
    Bell,
    FileText,
    Search,
    ChevronRight,
    Home,
    Megaphone,
    Clock,
    AlertCircle,
    Info,
    Phone,
    LayoutTemplate
} from "lucide-react";
import { displayBoardsService } from "@/data/services/display-boards-service/displayBoardsService";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import Pagination from "@/components/Pagination";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

const LIMIT = 12;

type BoardType = "daily-orders" | "cause-list" | "notices" | "announcements";

interface DisplayItem {
    id: string;
    title: string;
    date: string;
    type: string;
    description?: string;
    fileUrl?: string;
    isNew?: boolean;
}

function DisplayBoardsPageContent() {
    useDocTitle("Display Boards | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();

    const activeBoard = (searchParams.get("board") as BoardType) || "daily-orders";
    const selectedDate = searchParams.get("date") || "";
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [displayItems, setDisplayItems] = useState<DisplayItem[]>([]);
    const [error, setError] = useState<string | null>(null);

    const updateUrl = (updates: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        if (updates.board || updates.date) {
            params.set("page", "1");
        }
        router.push(`/display-boards?${params.toString()}`, { scroll: false });
    };

    // Fetch data from API
    useEffect(() => {
        const fetchBoards = async (page: number) => {
            setLoading(true);
            setError(null);
            try {
                // Map frontend board types to backend parameters
                let backendType: string | undefined = undefined;
                if (activeBoard === "daily-orders") backendType = "daily_order";
                else if (activeBoard === "cause-list") backendType = "daily_cause_list";
                else if (activeBoard === "notices") backendType = "notice";
                else if (activeBoard === "announcements") backendType = "announcement";

                const params: any = {
                    page,
                    limit: LIMIT
                };
                if (backendType) params.boardType = backendType;
                if (selectedDate) params.date = selectedDate;

                const response = await displayBoardsService.getAll(params);
                const payload = response.data;

                if (payload.success && Array.isArray(payload.data)) {
                    const mappedItems: DisplayItem[] = payload.data.map((item: any) => ({
                        id: item.id || Math.random().toString(36).substr(2, 9),
                        title: item.title || "Untitled Item",
                        date: item.date || item.createdAt || new Date().toISOString(),
                        type: item.type || "General",
                        description: item.description || "",
                        fileUrl: item.fileUrl || item.pdfUrl || item.url || null,
                        isNew: item.isNew || (new Date(item.date || item.createdAt) > new Date(Date.now() - 86400000))
                    }));

                    setDisplayItems(mappedItems);
                    setTotalPages(payload.meta?.totalPages || 1);
                    setTotalCount(payload.meta?.total ?? mappedItems.length);
                } else {
                    setDisplayItems([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }
            } catch (err: any) {
                console.error("Error fetching display boards:", err);
                setError(err.message || "Failed to load display board data");
                setDisplayItems([]);
                setTotalPages(1);
                setTotalCount(0);
            } finally {
                setLoading(false);
            }
        };

        fetchBoards(currentPage);
    }, [activeBoard, selectedDate, currentPage]);

    const filteredItems = displayItems.filter(
        (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getBoardTitle = (board: BoardType) => {
        switch (board) {
            case "daily-orders":
                return "Daily Orders";
            case "cause-list":
                return "Cause List";
            case "notices":
                return "Notices";
            case "announcements":
                return "Announcements";
        }
    };

    const boardTabs: {
        id: BoardType;
        title: string;
        subtitle: string;
        icon: React.ComponentType<{ className?: string }>;
    }[] = [
        { id: "daily-orders", title: "Daily Orders", subtitle: "Today's orders", icon: FileText },
        { id: "cause-list", title: "Cause List", subtitle: "Cases listed", icon: Calendar },
        { id: "notices", title: "Notices", subtitle: "Official notices", icon: Bell },
        { id: "announcements", title: "Announcements", subtitle: "Important updates", icon: Megaphone }
    ];

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
                        src="/display-boards-hero-banner.jpg"
                        alt="Display Boards & Court Cause Lists - Scales of Justice"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-right"
                        priority
                    />
                </div>

                {/* Left hero brand & title */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
                    <div className="flex items-center gap-4 sm:gap-5">
                        <div className="w-11 h-11 rounded-lg border-2 border-[#C9A227] flex items-center justify-center text-[#C9A227] flex-shrink-0">
                            <LayoutTemplate className="w-6 h-6" strokeWidth={1.8} />
                        </div>
                        <div className="h-10 w-[1.5px] bg-[#C9A227]/60 hidden sm:block" />
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight text-white">
                                Sajjad Husain Law Associates
                            </h1>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-2xl leading-relaxed">
                                Display Boards & Notices Portal
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
                        <span className="text-slate-600 font-normal">Display Boards</span>
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
                        Display Boards
                    </h2>
                    <div className="flex justify-center mb-3">
                        <LayoutTemplate className="w-5 h-5 text-[#C9A227]" />
                    </div>
                    <p className="text-slate-600 text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
                        Access daily orders, cause lists, notices, and important announcements from the court.
                        <br className="hidden sm:inline" /> All information is updated regularly for your convenience.
                    </p>
                </div>

                {/* Quick Information Banner */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 sm:p-5 mb-8 flex items-start gap-3">
                    <Info className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm text-slate-700">
                        <p className="font-semibold text-slate-900 mb-1.5">Quick Information:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-600">
                            <li>Daily orders and cause lists are updated every morning.</li>
                            <li>Notices and announcements are posted as they are issued.</li>
                            <li>Use the search bar to quickly find specific items.</li>
                        </ul>
                    </div>
                </div>

                {/* Board Selection Cards (4 in a row) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {boardTabs.map((tab) => {
                        const isActive = activeBoard === tab.id;
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => updateUrl({ board: tab.id })}
                                className={`p-4 sm:p-5 rounded-xl flex items-center justify-between text-left transition-all ${
                                    isActive
                                        ? "bg-[#0B2242] text-white shadow-md border-2 border-[#C9A227]"
                                        : "bg-white text-slate-800 border border-slate-200/90 shadow-sm hover:border-slate-300 hover:shadow"
                                }`}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div
                                        className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            isActive
                                                ? "bg-[#C9A227]/25 text-[#C9A227] border border-[#C9A227]/40"
                                                : "bg-slate-100 text-slate-600"
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3
                                            className={`font-bold text-sm sm:text-base leading-snug truncate ${
                                                isActive ? "text-white" : "text-slate-900"
                                            }`}
                                        >
                                            {tab.title}
                                        </h3>
                                        <p
                                            className={`text-xs mt-0.5 truncate ${
                                                isActive ? "text-slate-300" : "text-slate-400"
                                            }`}
                                        >
                                            {tab.subtitle}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight
                                    className={`w-4 h-4 flex-shrink-0 ml-2 ${
                                        isActive ? "text-white/80" : "text-slate-300"
                                    }`}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Search and Date Filter Bar */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-4 sm:p-5 mb-6">
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <div className="relative flex-1 w-full">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search in current board..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                            />
                        </div>
                        <div className="relative w-full sm:w-auto min-w-[190px]">
                            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => updateUrl({ date: e.target.value })}
                                className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] transition-colors"
                            />
                        </div>
                    </div>
                </div>

                {/* Available Display Board Items Card */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
                    {/* Header */}
                    <div className="bg-[#0B2242] text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#C9A227]" />
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                                    {getBoardTitle(activeBoard)}
                                </h3>
                                <p className="text-slate-300 text-xs mt-0.5">
                                    {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""} found
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs bg-white/10 text-slate-200 px-3.5 py-1.5 rounded-lg border border-white/10">
                            <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                            <span>Last updated: Today, 02:42 PM</span>
                        </div>
                    </div>

                    {/* Items List Body */}
                    <div className="p-5 sm:p-6 space-y-3.5">
                        {loading ? (
                            <div className="py-12 text-center">
                                <div className="inline-block w-10 h-10 border-3 border-[#C9A227] border-t-transparent rounded-full animate-spin mb-3" />
                                <p className="text-slate-700 font-semibold text-sm">Loading display items...</p>
                                <p className="text-slate-400 text-xs mt-1">Please wait while we fetch the latest records</p>
                            </div>
                        ) : error ? (
                            <div className="py-10 text-center">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h4 className="text-red-700 font-bold text-base mb-1">Unable to Load Display Board</h4>
                                <p className="text-slate-500 text-xs mb-4 max-w-md mx-auto">{error}</p>
                                <button
                                    onClick={() => updateUrl({ page: currentPage })}
                                    className="px-5 py-2 bg-[#0B2242] text-white rounded-lg hover:bg-[#12315c] transition-colors text-xs font-semibold"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredItems.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h4 className="text-slate-800 font-bold text-base">No Items Found</h4>
                                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                                    There are currently no items available for this board. Try selecting a different board or date.
                                </p>
                            </div>
                        ) : (
                            filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => {
                                        if (item.fileUrl) {
                                            window.open(item.fileUrl, "_blank");
                                        }
                                    }}
                                    className="p-4 sm:p-5 border border-slate-200/90 rounded-xl bg-white hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-between gap-4 cursor-pointer group"
                                >
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-11 h-11 rounded-xl bg-blue-50/70 border border-blue-100/80 flex items-center justify-center flex-shrink-0 text-[#1A73E8]">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-[#0B2242] transition-colors">
                                                    {item.title}
                                                </h4>
                                                <span className="bg-[#C9A227] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                                    {item.type || "General"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-0.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span>{formatDate(item.date)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#0B2242] transition-colors flex-shrink-0" />
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(page) => updateUrl({ page })}
                        />
                    </div>
                )}

                {/* Need Help? Card */}
                <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-xl p-5 sm:p-6 mt-8">
                    <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            <h4 className="font-bold text-slate-900 mb-1.5 text-sm sm:text-base">Need Help?</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 mb-3">
                                <li>Daily orders are published after court hours.</li>
                                <li>Cause lists are available one day in advance.</li>
                                <li>For certified copies, please contact the court registry.</li>
                            </ul>
                            <div className="flex items-center gap-2 text-slate-600 pt-1 text-xs">
                                <Phone className="w-3.5 h-3.5 text-[#D97706]" />
                                <span>For technical assistance, contact the IT helpdesk during office hours.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Disclaimer */}
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

export default function DisplayBoardsPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Display Boards...</div>}>
            <DisplayBoardsPageContent />
        </React.Suspense>
    );
}
