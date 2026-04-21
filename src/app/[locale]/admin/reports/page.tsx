"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { reportsService } from "@/data/services/reports-service/reportsService";
import { Link } from "@/i18n/routing";
import { Trash2, Plus, FileText, BarChart, Download } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate, formatDateTime } from "@/utils/dateUtils";
import Pagination from "@/components/Pagination";
import { useRouter, useSearchParams } from "next/navigation";

const LIMIT = 12;

export function AdminReportsPageContent() {
    useDocTitle("Reports | Sajjad Husain Law Associates");
    const router = useRouter();
    const searchParams = useSearchParams();

    // --- Derived from URL ---
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const updateUrl = (updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        router.push(`/admin/reports?${params.toString()}`);
    };

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const response = await reportsService.getAll({ page: currentPage, limit: LIMIT });
            const payload = response.data;
            
            if (payload.success && Array.isArray(payload.data)) {
                setReports(payload.data);
                setTotalPages(payload.meta?.totalPages || Math.ceil((payload.meta?.total || 0) / LIMIT) || 1);
                setTotalItems(payload.meta?.total || 0);
            } else {
                setReports([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (error) {
            toast.error("Failed to fetch reports");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this report?")) return;
        try {
            await reportsService.delete(id);
            toast.success("Report deleted successfully");
            fetchReports();
        } catch (error) {
            console.error("Error deleting report:", error);
            toast.error("Failed to delete report");
        }
    };

    const handleDownload = async (id: string, title: string) => {
        try {
            const blob = await reportsService.downloadReport(id);
            // Create a link element, set the download attribute, and trigger a click
            const url = window.URL.createObjectURL(new Blob([blob.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${title}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading report:", error);
            toast.error("Failed to download report");
        }
    };

    const handleView = async (id: string) => {
        try {
            const blob = await reportsService.downloadReport(id);
            const file = new Blob([blob.data], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL, '_blank');
        } catch (error) {
            console.error("Error viewing report:", error);
            toast.error("Failed to view report");
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Reports..." /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Reports</h1>
                    <p className="text-gray-500 text-sm mt-1">Generate and view legal reports</p>
                </div>
                <Link
                    href="/admin/reports/create"
                    className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus size={18} /> Generate New Report
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Range</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.length > 0 ? (
                                reports.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                                            {r.reportType.replace("_", " ")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(r.startDate)} -{" "}
                                            {formatDate(r.endDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {/* Use createdAt or fallback */}
                                            {formatDateTime(r.createdAt || r.generatedAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleView(r.id)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                                    title="View PDF"
                                                >
                                                    <FileText size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDownload(r.id, r.title)}
                                                    className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                                                    title="Download PDF"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(r.id)}
                                                    className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <BarChart size={48} className="text-gray-300" />
                                            <p>No reports generated yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {reports.length > 0 && totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={(page) => updateUrl({ page })}
                    />
                </div>
            )}
        </div>
    );
}

export default function AdminReportsPage() {
    return (
        <Suspense fallback={<Loader />}>
            <AdminReportsPageContent />
        </Suspense>
    );
}
