"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { useDebounce } from "@/hooks/useDebounce";
import { Link } from "@/i18n/routing";
import { Trash2, Edit, Plus, Search, FileText } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";

export default function AdminCasesPage() {
    useDocTitle("Cases | Sajjad Husain Law Associates");
    const [cases, setCases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, caseId: "", newStatus: "" });
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
                response = await casesService.searchCases(debouncedSearchTerm, currentPage, 12);
            } else {
                response = await casesService.getAll({ page: currentPage, limit: 12 });
            }
            
            // Handle different data formats
            const responseData = response.data?.data ?? response.data;
            const items = Array.isArray(responseData)
                ? responseData
                : (responseData?.data ?? []);
            setCases(items);

            // /search/cases returns a `meta` object; /cases returns total+limit directly
            const meta = response.data?.meta ?? response.data?.data?.meta;
            if (meta?.totalPages) {
                setTotalPages(meta.totalPages);
            } else {
                // Fallback: calculate from total + limit at the top level
                const total = response.data?.data?.total ?? response.data?.total ?? 0;
                const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
                setTotalPages(total > 0 ? Math.ceil(total / limit) : 1);
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch cases");
        } finally {
            setLoading(false);
        }
    };

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

    const handleStatusChange = (id: string, newStatus: string) => {
        setConfirmModal({ isOpen: true, caseId: id, newStatus });
    };

    const handleConfirmUpdate = async () => {
        const { caseId, newStatus } = confirmModal;
        if (!caseId || !newStatus) return;

        try {
            // Optimistic update
            setCases(cases.map(c => c.id === caseId ? { ...c, status: newStatus } : c));
            setConfirmModal({ isOpen: false, caseId: "", newStatus: "" });

            await casesService.updateStatus(caseId, newStatus);
            toast.success("Status updated successfully");
            fetchData(); // Ensure sync
        } catch (error) {
            // console.error("Error updating status:", error);
            toast.error("Failed to update status");
            fetchData(); // Revert on error
            setConfirmModal({ isOpen: false, caseId: "", newStatus: "" });
        }
    };

    // Removed full page loader to maintain search focus

    return (
        <div className="p-6 space-y-6">
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case Number</th>
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
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.caseNumber}</td>
                                        <td className="px-6 py-4 max-w-[200px] text-sm text-gray-600">{c.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                className={`block w-full px-2 py-1 text-xs font-medium border-gray-300 rounded-full capitalize focus:ring-2 focus:ring-offset-1 focus:outline-none cursor-pointer ${(confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status) === "pending"
                                                    ? "bg-yellow-100 text-yellow-800 border-yellow-200 focus:ring-yellow-500"
                                                    : (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status) === "closed"
                                                        ? "bg-gray-100 text-gray-800 border-gray-200 focus:ring-gray-500"
                                                        : (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status) === "filed"
                                                            ? "bg-blue-100 text-blue-800 border-blue-200 focus:ring-blue-500"
                                                            : "bg-green-100 text-green-800 border-green-200 focus:ring-green-500"
                                                    }`}
                                                value={confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status}
                                                onChange={(e) => handleStatusChange(c.id, e.target.value)}
                                            >
                                                <option value="filed">Filed</option>
                                                <option value="pending">Pending</option>
                                                <option value="hearing">Hearing</option>
                                                <option value="judgment">Judgment</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.court}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
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
                            onPageChange={setCurrentPage}
                        />
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ isOpen: false, caseId: "", newStatus: "" })}
                onConfirm={handleConfirmUpdate}
                title="Update Case Status"
                message={`Are you sure you want to change the status to "${confirmModal.newStatus}"?`}
                confirmText="Yes, Update"
                cancelText="Cancel"
                variant="warning"
            />
        </div>
    );
}
