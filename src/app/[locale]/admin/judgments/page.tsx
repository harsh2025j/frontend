"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { casesService } from "@/data/services/cases-service/casesService";
import { Link } from "@/i18n/routing";
import { formatDate } from "@/utils/dateUtils";
import { Trash2, Edit, Plus, Search, Gavel } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams, useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";

export default function AdminJudgmentsPage() {
    useDocTitle("Judgments  | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const router = useRouter();

    const [judgments, setJudgments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
    const debouncedSearchTerm = useDebounce(searchTerm, 600);
    const [judgesMap, setJudgesMap] = useState<Record<string, string>>({});
    const [casesMap, setCasesMap] = useState<Record<string, string>>({});

    const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get("page") || "1"));
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const limit = 12;

    useEffect(() => {
        const page = parseInt(searchParams.get("page") || "1");
        const term = searchParams.get("q") || "";
        setCurrentPage(page);

        if (term) {
            handleSearch(term, page);
        } else {
            fetchJudgments(page);
        }
    }, [searchParams]);

    useEffect(() => {
        const currentQ = searchParams.get("q") || "";
        if (debouncedSearchTerm !== currentQ) {
            updateUrl({ q: debouncedSearchTerm, page: 1 });
        }
    }, [debouncedSearchTerm]);

    const updateUrl = (updates: any) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        router.push(`/admin/judgments?${params.toString()}`);
    };

    const handlePageChange = (page: number) => {
        updateUrl({ page });
    };

    const handleSearch = async (query: string, page: number = 1) => {
        setLoading(true);
        try {
            const res = await judgmentsService.search({ q: query, page, limit });
            const data = res.data?.data || res.data || {};
            const results = Array.isArray(data) ? data : (data.data || []);
            const total = data.total || data.meta?.totalItems || (Array.isArray(data) ? data.length : 0);

            setJudgments(results);
            setTotalRecords(total);
            setTotalPages(Math.ceil(total / limit) || 1);
        } catch (error: any) {
            console.error("Error searching judgments:", error);
            toast.error("Failed to search judgments");
        } finally {
            setLoading(false);
        }
    };

    const fetchJudgments = async (page: number = 1) => {
        setLoading(true);
        try {
            const [judgmentsRes, judgesRes, casesRes] = await Promise.all([
                judgmentsService.getAll({ page, limit }),
                judgesService.getAll({ limit: 25 }), // Fetch more to build maps
                casesService.getAll({ limit: 25 })
            ]);

            // Process Judgments
            const data = judgmentsRes.data?.data || judgmentsRes.data || {};
            const results = Array.isArray(data) ? data : (data.data || []);
            const total = data.total || data.meta?.totalItems || (Array.isArray(data) ? data.length : 0);

            setJudgments(results);
            setTotalRecords(total);
            setTotalPages(Math.ceil(total / limit) || 1);

            // Process Judges Map
            const judgesData = judgesRes.data?.data?.data || judgesRes.data?.data || judgesRes.data || [];
            if (Array.isArray(judgesData)) {
                const jMap: Record<string, string> = {};
                judgesData.forEach((j: any) => jMap[j.id || j._id] = j.name || j.fullName || "Unknown Judge");
                setJudgesMap(jMap);
            }

            // Process Cases Map
            const casesData = casesRes.data?.data?.data || casesRes.data?.data || casesRes.data || [];
            if (Array.isArray(casesData)) {
                const cMap: Record<string, string> = {};
                casesData.forEach((c: any) => cMap[c.id || c._id] = c.caseNumber || c.title || "Unknown Case");
                setCasesMap(cMap);
            }

        } catch (error: any) {
            console.error("Error fetching data:", error);
            toast.error(error.message || "Failed to fetch judgments data");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this judgment?")) return;
        try {
            await judgmentsService.delete(id);
            toast.success("Judgment deleted successfully");
            fetchJudgments();
        } catch (error: any) {
            console.error("Error deleting judgment:", error);
            toast.error(error.message || "Failed to delete judgment");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Judgments</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage legal judgments</p>
                </div>
                <Link
                    href="/admin/judgments/create"
                    className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus size={18} /> Add New Judgment
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Case Number or Summary, Parties ..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[200px]">Judgment Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex justify-center items-center min-h-[200px]">
                                            <Loader size="lg" text="Loading Judgments..." />
                                        </div>
                                    </td>
                                </tr>
                            ) : judgments.length > 0 ? (
                                judgments.map((j) => (
                                    <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[200px]">{j.title?.substring(0, 400) + "..." || "No Title"}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {j.case?.caseNumber || (j.caseId && casesMap[j.caseId]) || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {formatDate(j.judgmentDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {j.judge?.name || (j.judgeId && judgesMap[j.judgeId]) || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/admin/judgments/${j.id}`}
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
                                            <Gavel size={48} className="text-gray-300" />
                                            <p>No judgments found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex flex-col items-center gap-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Showing {((currentPage - 1) * limit) + 1} to {Math.min(currentPage * limit, totalRecords)} of {totalRecords} records
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
