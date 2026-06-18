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

import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";
import CustomSelect from "@/components/ui/CustomSelect";

const STATUS_OPTIONS = [
    "Fresh", "Registered", "Defective", "Defect Removed", "Pending", "Listed", "Part Heard",
    "Adjourned", "Stayed", "Remanded", "Disposed", "Decreed", "Dismissed", "Allowed",
    "Partially Allowed", "Withdrawn", "Compromised", "Settled", "Abated", "Transferred",
    "Recalled", "Restored", "Null and Void"
].map(s => ({ value: s, label: s }));

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
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, caseId: "", newStatus: "" });
    const [viewCaseId, setViewCaseId] = useState<string | null>(null);
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
            const isAdmin = user?.roles?.some(role => role.name.toLowerCase().includes("admin"));
            const createdBy = !isAdmin ? user?._id : undefined;

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
            <div className={viewCaseId ? "no-print" : ""}>
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
                                    <CasesTableSkeleton />
                                ) : cases && cases.length > 0 ? (
                                    cases.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {c.caseNumber || c.diaryNumber || "N/A"}
                                            </td>
                                            <td className="px-6 py-4 max-w-[200px] text-sm text-gray-600">{c.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap min-w-[160px]">
                                                <CustomSelect
                                                    options={STATUS_OPTIONS}
                                                    value={confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status}
                                                    onChange={(val) => handleStatusChange(c.id, val)}
                                                    buttonClassName={`flex items-center justify-between w-full px-3 py-1.5 text-xs font-semibold border rounded-full capitalize transition-all ${(confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status)?.toLowerCase() === "pending"
                                                        ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                                        : (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status)?.toLowerCase() === "closed" || (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status)?.toLowerCase() === "disposed"
                                                            ? "bg-gray-100 text-gray-800 border-gray-200"
                                                            : (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status)?.toLowerCase() === "filed" || (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status)?.toLowerCase() === "fresh"
                                                                ? "bg-blue-100 text-blue-800 border-blue-200"
                                                                : (confirmModal.isOpen && confirmModal.caseId === c.id ? confirmModal.newStatus : c.status)?.toLowerCase() === "defective"
                                                                    ? "bg-red-100 text-red-800 border-red-200"
                                                                    : "bg-green-100 text-green-800 border-green-200"
                                                        }`}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.court}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-3">
                                                    <button
                                                        onClick={() => setViewCaseId(c.id)}
                                                        className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded transition-colors"
                                                        title="View"
                                                    >
                                                        <Eye size={18} />
                                                    </button>
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

            {/* View Case Modal Overlay */}
            {viewCaseId && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 print:p-0">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm no-print" onClick={() => setViewCaseId(null)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200 print:max-h-none print:h-auto print:rounded-none print:shadow-none print:static">
                        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10 no-print">
                            <h3 className="text-xl font-bold text-gray-900">Case Preview</h3>
                            <button
                                onClick={() => setViewCaseId(null)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto print:overflow-visible">
                            <CaseView caseId={viewCaseId} isModal={true} />
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end no-print">
                            <button
                                onClick={() => setViewCaseId(null)}
                                className="px-6 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#1a3a75] transition-colors font-medium shadow-sm"
                            >
                                Close Preview
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function CasesTableSkeleton() {
    return (
        <>
            {[...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse border-b border-gray-100">
                    <td className="px-6 py-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-48 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 bg-gray-100 rounded-full"></div></td>
                    <td className="px-6 py-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="px-6 py-4">
                        <div className="flex justify-end gap-3">
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                            <div className="h-8 w-8 bg-gray-200 rounded"></div>
                        </div>
                    </td>
                </tr>
            ))}
        </>
    );
}

function AdminCasesSkeleton() {
    return (
        <div className="p-6 space-y-6 animate-pulse w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-40 bg-gray-200 rounded"></div>
                    <div className="h-4 w-56 bg-gray-100 rounded"></div>
                </div>
                <div className="h-10 w-40 bg-gray-200 rounded-lg"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="h-10 w-full max-w-md bg-gray-200 rounded-lg"></div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {[...Array(5)].map((_, i) => (
                                    <th key={i} className="px-6 py-3 text-left"><div className="h-4 w-20 bg-gray-300 rounded"></div></th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <CasesTableSkeleton />
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function AdminCasesPage() {
    return (
        <Suspense fallback={<AdminCasesSkeleton />}>
            <AdminCasesPageContent />
        </Suspense>
    );
}
