"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/utils/dateUtils";
import { Trash2, Edit, Plus, Search, Scale } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";

export default function AdminJudgesPage() {
    useDocTitle("Judges  | Sajjad Husain Law Associates");
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 600);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Reset page when search term changes
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        fetchData();
    }, [debouncedSearchTerm, currentPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            let response;
            if (debouncedSearchTerm) {
                response = await judgesService.searchJudges(debouncedSearchTerm, currentPage, 12);
            } else {
                response = await judgesService.getAll({ page: currentPage, limit: 12 });
            }

            // Handle different data formats
            const responseData = response.data?.data ?? response.data;
            const items = Array.isArray(responseData)
                ? responseData
                : (responseData?.data ?? []);
            setJudges(items);

            // Extract pagination metadata
            const meta = response.data?.meta ?? response.data?.data?.meta;
            if (meta?.totalPages) {
                setTotalPages(meta.totalPages);
            } else {
                // Fallback: calculate from total + limit
                const total = response.data?.data?.total ?? response.data?.total ?? 0;
                const limit = response.data?.data?.limit ?? response.data?.limit ?? 10;
                setTotalPages(total > 0 ? Math.ceil(total / limit) : 1);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch judges");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this judge?")) return;
        try {
            await judgesService.delete(id);
            toast.success("Judge deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete judge");
        }
    };

    // Removed full page loader to maintain search focus

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Judges</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage judge profiles</p>
                </div>
                <Link
                    href="/admin/judges/create"
                    className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus size={18} /> Add New Judge
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Name or Court..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointed Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center">
                                            <Loader size="md" text="Loading Judges..." />
                                        </div>
                                    </td>
                                </tr>
                            ) : judges && judges.length > 0 ? (
                                judges.map((j) => (
                                    <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{j.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.designation}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.court}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(j.appointmentDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/admin/judges/${j.id}`}
                                                    className="text-[#0A2342] hover:text-[#C9A227] p-1 hover:bg-[#0A2342]/5 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(j.id)}
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
                                            <Scale size={48} className="text-gray-300" />
                                            <p>No judges found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
