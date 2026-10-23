"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Scale,
    Home,
    ChevronRight,
    FileText,
    Download,
    Eye,
    Calendar,
    Loader2,
    AlertCircle,
    RefreshCw,
    Filter,
    User,
    BarChart3,
    Info
} from "lucide-react";
import toast from "react-hot-toast";
import { reportsService } from "@/data/services/reports-service/reportsService";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import Pagination from "@/components/Pagination";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";

const LIMIT = 12;

type ReportType = "all" | "case-statistics" | "judgment-analysis" | "custom";

interface Report {
    id: string;
    title: string;
    description: string;
    type: "case-statistics" | "judgment-analysis" | "custom";
    badgeText: string;
    generatedDate: string;
    generatedBy: string;
    fileUrl?: string;
}

function ReportsPageContent() {
    useDocTitle("Reports & Analytics | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();

    const activeType = (searchParams.get("type") as ReportType) || "all";
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [refreshKey, setRefreshKey] = useState(0);

    const updateUrl = (updates: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        if (updates.type) {
            params.set("page", "1");
        }
        router.push(`/reports?${params.toString()}`, { scroll: false });
    };

    // Fetch reports data with backend enum mapping
    useEffect(() => {
        const fetchReports = async (page: number) => {
            setLoading(true);
            setError(null);
            try {
                // Map frontend kebab-case to backend snake_case enum to prevent 500 errors
                const backendReportType =
                    activeType === "case-statistics"
                        ? "case_statistics"
                        : activeType === "judgment-analysis"
                        ? "judgment_analysis"
                        : activeType === "custom"
                        ? "custom"
                        : undefined;

                const params = {
                    page,
                    limit: LIMIT,
                    reportType: backendReportType
                };
                const response = await reportsService.getAll(params);
                const payload = response.data;

                if (payload.success && Array.isArray(payload.data)) {
                    const mappedReports: Report[] = payload.data.map((item: any) => {
                        const rawType = (item.reportType || item.type || "").toLowerCase();
                        let normalizedType: "case-statistics" | "judgment-analysis" | "custom" = "custom";
                        if (
                            rawType.includes("judgment") ||
                            rawType.includes("analysis") ||
                            (item.title && item.title.toLowerCase().includes("judgment"))
                        ) {
                            normalizedType = "judgment-analysis";
                        } else if (
                            rawType.includes("case") ||
                            rawType.includes("statistic") ||
                            (item.title && item.title.toLowerCase().includes("case"))
                        ) {
                            normalizedType = "case-statistics";
                        }

                        return {
                            id: item.id || Math.random().toString(36).substr(2, 9),
                            title: item.title || "Untitled Report",
                            description: item.description || "No description available",
                            type: normalizedType,
                            badgeText: "CUSTOM",
                            generatedDate: item.generatedDate || item.createdAt || item.date || new Date().toISOString(),
                            generatedBy: item.generatedBy || item.createdBy || item.author || "current-user-id",
                            fileUrl: item.pdfUrl || item.fileUrl || item.url || null
                        };
                    });

                    setReports(mappedReports);
                    setTotalPages(payload.meta?.totalPages || 1);
                    setTotalCount(payload.meta?.total ?? mappedReports.length);
                } else {
                    setReports([]);
                    setTotalPages(1);
                    setTotalCount(0);
                }
            } catch (err: any) {
                console.error("Error fetching reports:", err);
                setError(err.message || "Failed to load reports data from the server");
                setReports([]);
                setTotalPages(1);
                setTotalCount(0);
                toast.error("Unable to load reports. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports(currentPage);
    }, [currentPage, activeType, refreshKey]);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
        toast.success("Refreshing reports...");
    };

    const handleViewReport = async (reportId: string, title: string) => {
        try {
            const response = await reportsService.downloadReport(reportId);
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            window.open(url, "_blank");
        } catch (err: any) {
            console.error("Error viewing report:", err);
            handleDownloadReport(reportId, title);
        }
    };

    const handleDownloadReport = async (reportId: string, title: string) => {
        try {
            const response = await reportsService.downloadReport(reportId);
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${title.replace(/\s+/g, "_")}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            toast.success("Report downloaded successfully!");
        } catch (err: any) {
            console.error("Error downloading report:", err);
            toast.error("Failed to download report");
        }
    };

    const filteredReports = activeType === "all"
        ? reports
        : reports.filter((r) => r.type === activeType);

    const getReportIcon = (type: string) => {
        switch (type) {
            case "judgment-analysis":
                return <BarChart3 className="w-5 h-5 text-[#1A73E8]" />;
            case "case-statistics":
                return <FileText className="w-5 h-5 text-[#059669]" />;
            default:
                return <Scale className="w-5 h-5 text-[#7C3AED]" />;
        }
    };

    const getReportBadgeStyle = (type: string) => {
        switch (type) {
            case "judgment-analysis":
                return "bg-[#EBF5FF] border border-blue-100";
            case "case-statistics":
                return "bg-[#ECFDF5] border border-emerald-100";
            default:
                return "bg-[#F5F3FF] border border-purple-100";
        }
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
                        src="/reports-hero-banner.jpg"
                        alt="Reports and Analytics - Scales of Justice and Legal Documents"
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-right"
                        priority
                    />
                </div>

                {/* Left hero content */}
                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
                    <div className="flex items-start gap-4 sm:gap-5">
                        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-[#C9A227] flex-shrink-0 mt-1" strokeWidth={1.8} />
                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif tracking-tight text-white">
                                Reports & Analytics
                            </h1>
                            <p className="text-slate-300 text-xs sm:text-sm mt-1 sm:mt-1.5 max-w-2xl leading-relaxed">
                                Access comprehensive reports, case statistics, and judgment analysis.
                                <br className="hidden sm:inline" /> View and download detailed analytics and reports.
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
                        <span className="text-slate-600 font-normal">Reports</span>
                    </div>
                </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                MAIN CONTENT AREA
            ────────────────────────────────────────────────────────────── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
                {/* Filter Reports Card */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm p-5 sm:p-6 mb-6">
                    <div className="flex items-center gap-2 mb-3.5">
                        <Filter className="w-4 h-4 text-[#C9A227]" />
                        <h2 className="font-bold text-sm sm:text-base text-slate-900">Filter Reports</h2>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {[
                            { id: "all", label: "All Reports" },
                            { id: "case-statistics", label: "Case Statistics" },
                            { id: "judgment-analysis", label: "Judgment Analysis" },
                            { id: "custom", label: "Custom Reports" },
                        ].map((tab) => {
                            const isActive = activeType === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => updateUrl({ type: tab.id })}
                                    className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                                        isActive
                                            ? "bg-[#0B2242] text-white shadow-sm"
                                            : "bg-slate-100/90 text-slate-700 hover:bg-slate-200/70 border border-slate-200/60"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Available Reports Card */}
                <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
                    {/* Header */}
                    <div className="bg-[#0B2242] text-white px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-[#C9A227]" />
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                                    Available Reports
                                </h3>
                                <p className="text-slate-300 text-xs mt-0.5">
                                    {totalCount || filteredReports.length} report{totalCount !== 1 ? "s" : ""} found
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                            title="Refresh reports list"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Reports List Body */}
                    <div className="p-5 sm:p-6 space-y-4">
                        {loading ? (
                            <div className="py-12 text-center">
                                <Loader2 className="w-12 h-12 text-[#C9A227] mx-auto mb-3 animate-spin" />
                                <p className="text-slate-700 font-semibold text-base">Loading reports...</p>
                                <p className="text-slate-400 text-xs mt-1">Please wait while we fetch the latest data</p>
                            </div>
                        ) : error ? (
                            <div className="py-10 text-center">
                                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3 border border-red-100">
                                    <AlertCircle className="w-6 h-6" />
                                </div>
                                <h4 className="text-red-700 font-bold text-base mb-1">Unable to Load Reports</h4>
                                <p className="text-slate-500 text-xs mb-4 max-w-md mx-auto">{error}</p>
                                <button
                                    onClick={() => updateUrl({ page: currentPage })}
                                    className="px-5 py-2 bg-[#0B2242] text-white rounded-lg hover:bg-[#12315c] transition-colors text-xs font-semibold"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="py-12 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <h4 className="text-slate-800 font-bold text-base">No Reports Available</h4>
                                <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                                    {activeType === "all"
                                        ? "There are no reports available at this time. Please check back later."
                                        : `No ${activeType.replace("-", " ")} reports found. Try selecting a different filter.`}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3.5">
                                {filteredReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="p-4 sm:p-5 border border-slate-200/90 rounded-xl bg-white hover:border-slate-300 hover:shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {/* Icon Badge */}
                                            <div
                                                className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${getReportBadgeStyle(
                                                    report.type
                                                )}`}
                                            >
                                                {getReportIcon(report.type)}
                                            </div>

                                            {/* Details */}
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                                                        {report.title}
                                                    </h4>
                                                    <span className="bg-[#C9A227] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                                        {report.badgeText || "CUSTOM"}
                                                    </span>
                                                </div>
                                                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">
                                                    {report.description}
                                                </p>
                                                <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>{formatDate(report.generatedDate)}</span>
                                                    </div>
                                                    <span className="text-slate-300">-</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <User className="w-3.5 h-3.5 text-slate-400" />
                                                        <span>Generated by: {report.generatedBy}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                                            <button
                                                onClick={() => handleViewReport(report.id, report.title)}
                                                className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557b0] text-white rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                                                title="View Report"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>View</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Note Box */}
                        <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-start gap-3 mt-4">
                            <Info className="w-5 h-5 text-[#1A73E8] flex-shrink-0 mt-0.5" />
                            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                                <span className="font-semibold text-slate-900">Note: </span>
                                Reports are generated automatically by the system. For custom reports or specific data requirements, please contact the administrator.
                            </div>
                        </div>
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
            </div>

            {/* ─────────────────────────────────────────────────────────────
                FOOTER DISCLAIMER
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

export default function ReportsPage() {
    return (
        <React.Suspense fallback={<div className="flex justify-center items-center min-h-screen">Loading Reports...</div>}>
            <ReportsPageContent />
        </React.Suspense>
    );
}
