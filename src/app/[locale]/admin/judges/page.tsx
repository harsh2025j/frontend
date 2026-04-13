"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/utils/dateUtils";
import { Trash2, Edit, Plus, Search, Scale, ShieldCheck, Clock } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";

export default function AdminJudgesPage() {
    useDocTitle("Manage Judges | Sajjad Husain Law Associates");
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 600);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

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

            const responseData = response.data?.data ?? response.data;
            const items = Array.isArray(responseData)
                ? responseData
                : (responseData?.data ?? []);
            setJudges(items);

            const meta = response.data?.meta ?? response.data?.data?.meta;
            if (meta?.totalPages) {
                setTotalPages(meta.totalPages);
            } else {
                const total = response.data?.data?.total ?? response.data?.total ?? 0;
                const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
                setTotalPages(total > 0 ? Math.ceil(total / limit) : 1);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch judges");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this judge profile?")) return;
        try {
            await judgesService.delete(id);
            toast.success("Judge deleted successfully");
            fetchData();
        } catch (error: any) {
            toast.error(error.message || "Failed to delete judge");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A2342]">Manage Judicial Profiles</h1>
                    <p className="text-gray-500 text-sm mt-1">Review, edit and publish judge information</p>
                </div>
                <Link
                    href="/admin/judges/create"
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 font-bold"
                >
                    <Plus size={18} /> Add New Judge
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-5 border-b border-gray-50 bg-gray-50/30">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, court or designation..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Judge</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Court & Position</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-500 uppercase tracking-wider">Last Sync</th>
                                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <Loader size="md" text="Refreshing profiles..." />
                                    </td>
                                </tr>
                            ) : judges && judges.length > 0 ? (
                                judges.map((j) => (
                                    <tr key={j.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0 overflow-hidden">
                                                    {j.photoUrl ? (
                                                        <img src={j.photoUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Scale size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-1">
                                                        {j.prefix} {j.name}
                                                        {j.isVerified && <ShieldCheck size={14} className="text-blue-500" />}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400 uppercase font-semibold">
                                                        {j.isServing ? (
                                                            <span className="text-green-600">Serving</span>
                                                        ) : (
                                                            <span className="text-orange-600">Retired</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">{j.designation}</div>
                                            <div className="text-xs text-gray-500">{j.court}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase transition-colors ${
                                                j.status === 'published' 
                                                ? "bg-green-100 text-green-700 border border-green-200" 
                                                : "bg-gray-100 text-gray-600 border border-gray-200"
                                            }`}>
                                                {j.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} className="text-gray-400" />
                                                {formatDate(j.updatedAt || j.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/judges/${j.id}`}
                                                    className="bg-white p-2 border border-gray-200 rounded-lg text-gray-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all"
                                                    title="Edit Details"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(j.id)}
                                                    className="bg-white p-2 border border-gray-200 rounded-lg text-red-400 hover:text-red-600 hover:border-red-200 shadow-sm transition-all"
                                                    title="Remove Profile"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="p-4 bg-gray-50 rounded-full">
                                                <Scale size={40} className="text-gray-200" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">No judges found</p>
                                                <p className="text-sm">Try adjusting your search filters or add a new judge profile.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-5 border-t border-gray-50 bg-gray-50/20">
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
