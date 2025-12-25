"use client";

import React, { useState, useEffect } from "react";
import { Scale, Home, ChevronRight, FileText, Download, Eye, Calendar, Loader2, AlertCircle, RefreshCw, Filter } from 'lucide-react';
import toast from "react-hot-toast";
import { reportsService } from "@/data/services/reports-service/reportsService";

type ReportType = "all" | "case-statistics" | "judgment-analysis" | "custom";

interface Report {
    id: string;
    title: string;
    description: string;
    type: "case-statistics" | "judgment-analysis" | "custom";
    generatedDate: string;
    generatedBy: string;
    fileUrl?: string;
}

export default function ReportsPage() {
    const [activeType, setActiveType] = useState<ReportType>("all");
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch reports data
    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await reportsService.getAll();
            const data = response.data?.data || response.data || [];
            // Ensure we always have an array
            setReports(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error("Error fetching reports:", err);
            setError(err.message || "Failed to load reports data from the server");
            setReports([]);
            toast.error("Unable to load reports. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadReport = async (reportId: string, title: string) => {
        try {
            const response = await reportsService.downloadReport(reportId);
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${title.replace(/\s+/g, '_')}.pdf`;
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
        : reports.filter(r => r.type === activeType);

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
                                Reports & Analytics Portal
                            </p>
                        </div>
                        <FileText className="w-12 h-12 text-[#C9A227]" />
                    </div>
                </div>
            </div>

            {/* Breadcrumb */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center gap-2 text-sm">
                        <Home className="w-4 h-4 text-gray-500" />
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">Reports</span>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Page Title & Info */}
                <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-[#0A2342] mb-3">
                        Reports & Analytics
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Access comprehensive reports, case statistics, and judgment analysis.
                        View and download detailed analytics and reports.
                    </p>
                </div>

                {/* Report Type Filters */}
                <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Filter className="w-5 h-5 text-[#C9A227]" />
                        <h3 className="font-bold text-[#0A2342]">Filter Reports</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => setActiveType("all")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeType === "all"
                                ? 'bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            All Reports
                        </button>
                        <button
                            onClick={() => setActiveType("case-statistics")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeType === "case-statistics"
                                ? 'bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Case Statistics
                        </button>
                        <button
                            onClick={() => setActiveType("judgment-analysis")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeType === "judgment-analysis"
                                ? 'bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Judgment Analysis
                        </button>
                        <button
                            onClick={() => setActiveType("custom")}
                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${activeType === "custom"
                                ? 'bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            Custom Reports
                        </button>
                    </div>
                </div>

                {/* Reports List */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#0A2342] to-[#1a3a75] text-white p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText size={24} />
                                <div>
                                    <h3 className="text-2xl font-bold">Available Reports</h3>
                                    <p className="text-blue-200 text-sm mt-1">
                                        {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''} found
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={fetchReports}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                                title="Refresh"
                            >
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Reports Content */}
                    <div>
                        {loading ? (
                            /* Loading State */
                            <div className="p-12 text-center">
                                <Loader2 className="w-16 h-16 text-[#C9A227] mx-auto mb-4 animate-spin" />
                                <p className="text-gray-600 text-lg font-semibold">Loading reports...</p>
                                <p className="text-gray-500 text-sm mt-2">Please wait while we fetch the data</p>
                            </div>
                        ) : error ? (
                            /* Error State */
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertCircle className="w-8 h-8 text-red-600" />
                                </div>
                                <p className="text-red-600 text-lg font-semibold mb-2">Unable to Load Reports</p>
                                <p className="text-gray-600 text-sm mb-4">{error}</p>
                                <p className="text-gray-500 text-sm mb-6">
                                    The reports data could not be retrieved from the server. Please check your connection and try again.
                                </p>
                                <button
                                    onClick={fetchReports}
                                    className="px-6 py-3 bg-[#0A2342] text-white rounded-lg hover:bg-[#1a3a75] transition-colors font-semibold"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            /* Empty State */
                            <div className="p-12 text-center">
                                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 text-lg font-semibold">No Reports Available</p>
                                <p className="text-gray-500 text-sm mt-2">
                                    {activeType === "all"
                                        ? "There are no reports available at this time. Please check back later."
                                        : `No ${activeType.replace('-', ' ')} reports found. Try selecting a different category.`}
                                </p>
                            </div>
                        ) : (
                            /* Reports List */
                            <div className="divide-y divide-gray-200">
                                {filteredReports.map((report) => (
                                    <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-bold text-gray-900">{report.title}</h4>
                                                    <span className="px-3 py-1 bg-[#C9A227] text-white text-xs font-semibold rounded-full">
                                                        {report.type.replace('-', ' ').toUpperCase()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-600 mb-3">{report.description}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={16} />
                                                        <span>
                                                            {new Date(report.generatedDate).toLocaleDateString('en-US', {
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <span>•</span>
                                                    <span>Generated by: {report.generatedBy}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                                    title="View Report"
                                                >
                                                    <Eye size={20} />
                                                </button>
                                                {report.fileUrl && (
                                                    <button
                                                        onClick={() => handleDownloadReport(report.id, report.title)}
                                                        className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                                                        title="Download Report"
                                                    >
                                                        <Download size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Info */}
            <div className="bg-white border-t border-gray-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="text-center text-sm text-gray-600">
                        <p className="mb-2">
                            <strong>Note:</strong> Reports are generated automatically by the system.
                            For custom reports or specific data requirements, please contact the administrator.
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
