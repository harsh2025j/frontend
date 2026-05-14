"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useAppSelector } from "@/data/redux/hooks";
import { casesService } from "@/data/services/cases-service/casesService";
import { useDebounce } from "@/hooks/useDebounce";
import { useSearchParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Trash2, Edit, Plus, Search, FileText, Eye, X } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import CaseView from "@/app/[locale]/cases/[id]/CaseView";

import Pagination from "@/components/Pagination";
import { useDocTitle } from "@/hooks/useDocTitle";



export function AdminCasesPageContent() {
    useDocTitle("Cases | Sajjad Husain Law Associates");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAppSelector((state) => state.auth);

    // --- Derived from URL ---
    const currentPage = parseInt(searchParams.get("page") || "1");
    const urlSearch = searchParams.get("q") || "";

    // --- Local State for Input ---
    const [searchTerm, setSearchTerm] = useState(urlSearch);
    const debouncedSearchTerm = useDebounce(searchTerm, 600);

    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    const updateUrl = (updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        router.push(`/admin/cases?${params.toString()}`);
    };

    // Sync debounced search to URL
    useEffect(() => {
        if (debouncedSearchTerm !== urlSearch) {
            updateUrl({ q: debouncedSearchTerm, page: 1 });
        }
    }, [debouncedSearchTerm]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Check if user is restricted
            const isAdmin = user?.roles?.some(role => {
                const roleName = typeof role === 'string' ? role : (role.name || role.slug || '');
                return roleName.toLowerCase().includes("admin");
            });
            const createdBy = !isAdmin ? (user?.id || user?._id) : undefined;

            let response;
            if (urlSearch) {
                response = await casesService.searchCases(urlSearch, currentPage, 12, createdBy);
            } else {
                response = await casesService.getAll({ page: currentPage, limit: 12, createdBy });
            }

            // Handle different data formats
            const responseData = response.data?.data ?? response.data;
            const items = Array.isArray(responseData)
                ? responseData
                : (responseData?.data ?? []);
            setCases(items);

            const meta = response.data?.meta ?? response.data?.data?.meta;
            if (meta?.totalPages) {
                setTotalPages(meta.totalPages);
            } else {
                const total = response.data?.data?.total ?? response.data?.total ?? 0;
                const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
                setTotalPages(total > 0 ? Math.ceil(total / limit) : 1);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch cases");
        } finally {
            setLoading(false);
        }
    }, [currentPage, urlSearch, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this case?")) return;
        try {
            await casesService.delete(id);
            toast.success("Case deleted successfully");
            fetchData();
        } catch (error: any) {
            // console.error("Error deleting case:", error);
            toast.error(error.message || "Failed to delete case");
        }
    };



    // Removed full page loader to maintain search focus

    return (
        <div className="p-6 space-y-6">
            <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Cases</h1>
                        <p className="text-gray-500 text-sm mt-1">View and manage all legal cases</p>
                    </div>
                    <Link
                        href="/admin/cases/create"
                        className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                    >
                        <Plus size={18} /> Add New Case
                    </Link>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                        <div className="relative max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Case Number or Title..."
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case / Diary Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider max-w-[200px]">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex justify-center items-center">
                                                <Loader size="md" text="Loading Cases..." />
                                            </div>
                                        </td>
                                    </tr>
                                ) : cases && cases.length > 0 ? (
                                    cases.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {c.caseNumber || c.diaryNumber || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px] text-sm text-gray-600">{c.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold border rounded-full capitalize ${(c.status)?.toLowerCase() === "pending"
                                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                    : (c.status)?.toLowerCase() === "closed" || (c.status)?.toLowerCase() === "disposed"
                                                        ? "bg-gray-100 text-gray-800 border-gray-200"
                                                        : (c.status)?.toLowerCase() === "filed" || (c.status)?.toLowerCase() === "fresh"
                                                            ? "bg-blue-100 text-blue-800 border-blue-200"
                                                            : (c.status)?.toLowerCase() === "defective"
                                                                ? "bg-red-100 text-red-800 border-red-200"
                                                                : "bg-green-100 text-green-800 border-green-200"
                                                    }`}>
                                                    {c.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.court}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-3">
                                                    <Link
                                                        href={`/admin/cases/${c.id}/view`}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link
                                                        href={`/admin/cases/${c.id}`}
                                                        className="text-[#0A2342] hover:text-[#C9A227] p-1 hover:bg-[#0A2342]/5 rounded transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(c.id)}
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
                                                <FileText size={48} className="text-gray-300" />
                                                <p>No cases found matching your search.</p>
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
                                onPageChange={(page) => updateUrl({ page })}
                            />
                        </div>
                    )}
                </div>
            </div>



        </div>
    );
}

export default function AdminCasesPage() {
    return (
        <Suspense fallback={<Loader />}>
            <AdminCasesPageContent />
        </Suspense>
    );
}
