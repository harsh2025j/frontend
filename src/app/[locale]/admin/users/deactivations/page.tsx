"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import {
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    UserX,
    Trash2,
    Users,
    Eye,
    ShieldAlert,
    FileText,
    Calendar,
    Mail,
    User as UserIcon,
    X,
    Check,
} from "lucide-react";
import toast from "react-hot-toast";

import Loader from "@/components/ui/Loader";
import Pagination from "@/components/Pagination";
import { useDocTitle } from "@/hooks/useDocTitle";
import { usersApi } from "@/data/services/users-service/users-service";
import { User, DeactivationStats } from "@/data/features/users/users.types";

interface ActionModalState {
    isOpen: boolean;
    type: "approve" | "reject" | null;
    user: User | null;
    adminNote: string;
    submitting: boolean;
}

interface DetailsModalState {
    isOpen: boolean;
    user: User | null;
}

function DeactivationRequestsContent() {
    useDocTitle("Account Deactivation Requests | Sajjad Husain Law Associates");
    const router = useRouter();
    const searchParams = useSearchParams();

    // Data state
    const [requests, setRequests] = useState<User[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [stats, setStats] = useState<DeactivationStats>({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        deactivateCount: 0,
        deleteCount: 0,
    });
    const [loading, setLoading] = useState<boolean>(true);
    const [statsLoading, setStatsLoading] = useState<boolean>(true);

    // Filters from URL
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "pending"; // default to pending for urgency
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    // Local search input
    const [searchInput, setSearchInput] = useState(search);

    // Modals
    const [actionModal, setActionModal] = useState<ActionModalState>({
        isOpen: false,
        type: null,
        user: null,
        adminNote: "",
        submitting: false,
    });

    const [detailsModal, setDetailsModal] = useState<DetailsModalState>({
        isOpen: false,
        user: null,
    });

    // Update URL helper
    const updateUrl = (updates: Record<string, string | number | null | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });

        // Reset page to 1 if filter changed (except page/limit)
        const isFilterChange = Object.keys(updates).some((k) => k !== "page" && k !== "limit");
        if (isFilterChange) {
            params.set("page", "1");
        }

        router.push(`/admin/users/deactivations?${params.toString()}`);
    };

    // Load stats
    const loadStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await usersApi.fetchDeactivationStats();
            if (res && res.data) {
                setStats(res.data);
            }
        } catch (err) {
            console.error("Failed to load deactivation stats:", err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // Load requests
    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const deactivationStatus =
                status === "all" || !status ? "all_requests" : status;

            const res = await usersApi.fetchUsers({
                search: search || undefined,
                deactivationStatus,
                deactivationType: type || undefined,
                page,
                limit,
            });

            if (res && res.data) {
                setRequests(res.data.data || []);
                setTotal(res.data.total || 0);
            }
        } catch (err: any) {
            console.error("Failed to load deactivation requests:", err);
            toast.error(err?.message || "Failed to load deactivation requests");
        } finally {
            setLoading(false);
        }
    }, [search, status, type, page, limit]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    // Handle search form
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateUrl({ search: searchInput.trim() });
    };

    const handleClearSearch = () => {
        setSearchInput("");
        updateUrl({ search: "" });
    };

    // Open action modal
    const openActionModal = (actionType: "approve" | "reject", targetUser: User) => {
        setActionModal({
            isOpen: true,
            type: actionType,
            user: targetUser,
            adminNote: "",
            submitting: false,
        });
    };

    const closeActionModal = () => {
        if (actionModal.submitting) return;
        setActionModal({
            isOpen: false,
            type: null,
            user: null,
            adminNote: "",
            submitting: false,
        });
    };

    // Confirm action (Approve / Reject)
    const handleConfirmAction = async () => {
        if (!actionModal.user || !actionModal.type) return;

        try {
            setActionModal((prev) => ({ ...prev, submitting: true }));

            await usersApi.reviewDeactivationRequest(actionModal.user._id, {
                action: actionModal.type,
                adminNote: actionModal.adminNote.trim() || undefined,
            });

            toast.success(
                actionModal.type === "approve"
                    ? `Request approved: ${actionModal.user.name}'s account has been deactivated.`
                    : `Request rejected: ${actionModal.user.name} can log in normally.`
            );

            closeActionModal();
            loadRequests();
            loadStats();
        } catch (err: any) {
            console.error("Failed to review request:", err);
            toast.error(err?.message || "Failed to process request");
            setActionModal((prev) => ({ ...prev, submitting: false }));
        }
    };

    // Date formatting helper
    const formatDateTime = (dateStr?: string | null) => {
        if (!dateStr) return "N/A";
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0A2342] flex items-center gap-2.5">
                            <ShieldAlert className="text-amber-500" size={26} />
                            Account Deactivation & Data Deletion
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Review and take action on user requests to deactivate accounts or completely erase personal data.
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            loadRequests();
                            loadStats();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-[#0A2342] transition shadow-xs self-start md:self-auto cursor-pointer"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        <span className="text-sm font-medium">Refresh</span>
                    </button>
                </div>

                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {/* Pending Review */}
                    <button
                        type="button"
                        onClick={() => updateUrl({ status: "pending" })}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            status === "pending"
                                ? "bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/40 shadow-xs"
                                : "bg-white border-gray-200 hover:border-amber-200 hover:bg-amber-50/30 shadow-xs"
                        }`}
                    >
                        <div className="flex items-center justify-between text-amber-600 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
                            <Clock size={18} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.pending}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Requires admin approval</p>
                    </button>

                    {/* Approved */}
                    <button
                        type="button"
                        onClick={() => updateUrl({ status: "approved" })}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            status === "approved"
                                ? "bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-400/40 shadow-xs"
                                : "bg-white border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 shadow-xs"
                        }`}
                    >
                        <div className="flex items-center justify-between text-emerald-600 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
                            <CheckCircle size={18} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.approved}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Deactivated / erased</p>
                    </button>

                    {/* Rejected */}
                    <button
                        type="button"
                        onClick={() => updateUrl({ status: "rejected" })}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            status === "rejected"
                                ? "bg-rose-50/80 border-rose-300 ring-2 ring-rose-400/40 shadow-xs"
                                : "bg-white border-gray-200 hover:border-rose-200 hover:bg-rose-50/30 shadow-xs"
                        }`}
                    >
                        <div className="flex items-center justify-between text-rose-600 mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
                            <XCircle size={18} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.rejected}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Request declined</p>
                    </button>

                    {/* Total Requests */}
                    <button
                        type="button"
                        onClick={() => updateUrl({ status: "all" })}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                            status === "all"
                                ? "bg-blue-50/80 border-blue-300 ring-2 ring-blue-400/40 shadow-xs"
                                : "bg-white border-gray-200 hover:border-blue-200 hover:bg-blue-50/30 shadow-xs"
                        }`}
                    >
                        <div className="flex items-center justify-between text-[#0A2342] mb-1.5">
                            <span className="text-xs font-bold uppercase tracking-wider">Total Requests</span>
                            <UserX size={18} />
                        </div>
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {statsLoading ? "..." : stats.total}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {stats.deleteCount} deletion &bull; {stats.deactivateCount} deactivation
                        </p>
                    </button>
                </div>

                {/* Filters & Search Card */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 sm:p-5 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md relative">
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={17} />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2342]/20 focus:border-[#0A2342] transition-all bg-gray-50/50"
                            />
                            {searchInput && (
                                <button
                                    type="button"
                                    onClick={handleClearSearch}
                                    className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                                    title="Clear search"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </form>

                        {/* Status & Type Selectors */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status:</span>
                                <select
                                    value={status}
                                    onChange={(e) => updateUrl({ status: e.target.value })}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A2342]/20 focus:border-[#0A2342] bg-white cursor-pointer"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="approved">Approved</option>
                                    <option value="rejected">Rejected</option>
                                    <option value="all">All Statuses</option>
                                </select>
                            </div>

                            {/* Request Type */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Type:</span>
                                <select
                                    value={type}
                                    onChange={(e) => updateUrl({ type: e.target.value })}
                                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0A2342]/20 focus:border-[#0A2342] bg-white cursor-pointer"
                                >
                                    <option value="">All Types</option>
                                    <option value="deactivate">Deactivate Account</option>
                                    <option value="delete">Delete Complete Data</option>
                                </select>
                            </div>

                            {/* Reset Button */}
                            {(search || status !== "pending" || type) && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchInput("");
                                        router.push("/admin/users/deactivations?status=pending");
                                    }}
                                    className="text-xs font-semibold text-gray-500 hover:text-[#0A2342] px-2 py-1.5 border border-dashed border-gray-300 rounded-lg transition cursor-pointer"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Requests Table / Cards */}
                <div className="bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden mb-6">
                    {loading ? (
                        <div className="p-12 flex justify-center items-center">
                            <Loader />
                        </div>
                    ) : requests.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <UserX size={28} />
                            </div>
                            <h3 className="text-base font-bold text-gray-800">No requests found</h3>
                            <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                                {status === "pending"
                                    ? "There are currently no pending account deactivation or data deletion requests."
                                    : "No deactivation requests matched your current filter criteria."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/75 border-b border-gray-200 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-4 sm:px-6">User</th>
                                        <th className="py-3.5 px-4">Request Type</th>
                                        <th className="py-3.5 px-4">Reason</th>
                                        <th className="py-3.5 px-4">Requested At</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm">
                                    {requests.map((reqUser) => {
                                        const isPending = reqUser.deactivationStatus === "pending";
                                        const isApproved = reqUser.deactivationStatus === "approved";
                                        const isRejected = reqUser.deactivationStatus === "rejected";
                                        const isDelete = reqUser.deactivationType === "delete";

                                        return (
                                            <tr key={reqUser._id} className="hover:bg-gray-50/70 transition-colors">
                                                {/* User Info */}
                                                <td className="py-4 px-4 sm:px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#0A2342] text-[#C9A227] font-bold flex items-center justify-center text-sm shrink-0">
                                                            {reqUser.name?.charAt(0).toUpperCase() || "U"}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-semibold text-gray-900 truncate">
                                                                {reqUser.name}
                                                            </div>
                                                            <a
                                                                href={`mailto:${reqUser.email}?subject=Regarding%20your%20account%20deactivation%20request`}
                                                                className="text-xs text-gray-500 hover:text-[#0A2342] hover:underline truncate flex items-center gap-1 transition"
                                                                title="Email this user"
                                                            >
                                                                <Mail size={12} className="text-gray-400 shrink-0" />
                                                                {reqUser.email}
                                                            </a>
                                                            {reqUser.roles && reqUser.roles.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {reqUser.roles.map((r, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="text-[10px] font-semibold uppercase px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded"
                                                                        >
                                                                            {r.name || r.slug}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Request Type */}
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {isDelete ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                                                            <Trash2 size={13} className="text-rose-600" />
                                                            Delete Data
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <UserX size={13} className="text-amber-600" />
                                                            Deactivate Account
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Reason */}
                                                <td className="py-4 px-4 max-w-xs">
                                                    {reqUser.deactivationReason ? (
                                                        <p className="text-xs text-gray-600 line-clamp-2" title={reqUser.deactivationReason}>
                                                            {reqUser.deactivationReason}
                                                        </p>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No reason provided</span>
                                                    )}
                                                </td>

                                                {/* Requested Date */}
                                                <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-600">
                                                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                                                        <Calendar size={13} className="text-gray-400 shrink-0" />
                                                        {formatDateTime(reqUser.deactivationRequestedAt || reqUser.updatedAt)}
                                                    </div>
                                                    {reqUser.deactivationReviewedAt && (
                                                        <div className="text-[11px] text-gray-400 mt-0.5">
                                                            Reviewed: {formatDateTime(reqUser.deactivationReviewedAt)}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {isPending && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-800">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                            Pending
                                                        </span>
                                                    )}
                                                    {isApproved && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                                                            <CheckCircle size={13} />
                                                            Approved
                                                        </span>
                                                    )}
                                                    {isRejected && (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-100 text-rose-800">
                                                            <XCircle size={13} />
                                                            Rejected
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isPending ? (
                                                            <>
                                                                <button
                                                                    onClick={() => openActionModal("approve", reqUser)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-md text-xs font-semibold hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                                                                    title="Approve Request"
                                                                >
                                                                    <Check size={13} />
                                                                    <span>Approve</span>
                                                                </button>
                                                                <button
                                                                    onClick={() => openActionModal("reject", reqUser)}
                                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-rose-200 text-rose-600 rounded-md text-xs font-semibold hover:bg-rose-50 transition shadow-xs cursor-pointer"
                                                                    title="Reject Request"
                                                                >
                                                                    <X size={13} />
                                                                    <span>Reject</span>
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic mr-2">Reviewed</span>
                                                        )}

                                                        <button
                                                            onClick={() => setDetailsModal({ isOpen: true, user: reqUser })}
                                                            className="p-1.5 text-gray-500 hover:text-[#0A2342] hover:bg-gray-100 rounded-md transition cursor-pointer"
                                                            title="View Details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {total > limit && (
                        <div className="p-4 border-t border-gray-200 flex justify-center">
                            <Pagination
                                currentPage={page}
                                totalPages={Math.ceil(total / limit)}
                                onPageChange={(newPage) => updateUrl({ page: newPage })}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* ACTION MODAL (APPROVE / REJECT) */}
            {actionModal.isOpen && actionModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-gray-100 relative">
                        <button
                            onClick={closeActionModal}
                            disabled={actionModal.submitting}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`w-11 h-11 rounded-full flex items-center justify-center ${
                                    actionModal.type === "approve"
                                        ? "bg-emerald-100 text-emerald-600"
                                        : "bg-rose-100 text-rose-600"
                                }`}
                            >
                                {actionModal.type === "approve" ? (
                                    <CheckCircle size={24} />
                                ) : (
                                    <AlertTriangle size={24} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {actionModal.type === "approve"
                                        ? actionModal.user.deactivationType === "delete"
                                            ? "Approve Data Deletion"
                                            : "Approve Account Deactivation"
                                        : "Reject Request"}
                                </h3>
                                <p className="text-xs text-gray-500">
                                    User: <span className="font-semibold text-gray-700">{actionModal.user.name}</span> ({actionModal.user.email})
                                </p>
                            </div>
                        </div>

                        {/* Description Box */}
                        <div
                            className={`p-3.5 rounded-lg text-xs leading-relaxed mb-4 ${
                                actionModal.type === "approve"
                                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                    : "bg-rose-50 text-rose-800 border border-rose-200"
                            }`}
                        >
                            {actionModal.type === "approve" ? (
                                actionModal.user.deactivationType === "delete" ? (
                                    <>
                                        Approving will mark this account as <strong>approved for data deletion</strong>,
                                        set the account status to <strong>inactive</strong>, and revoke all active login sessions immediately.
                                    </>
                                ) : (
                                    <>
                                        Approving will mark this account as <strong>deactivated</strong>, set its status to
                                        <strong> inactive</strong>, and revoke all active login sessions immediately. The user will not be able to log in.
                                    </>
                                )
                            ) : (
                                <>
                                    Rejecting will mark this request as <strong>rejected</strong> and unblock the user account.
                                    The user will be able to log in normally again.
                                </>
                            )}
                        </div>

                        {/* Optional Admin Note */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
                                Admin Remarks / Reason (Optional)
                            </label>
                            <textarea
                                value={actionModal.adminNote}
                                onChange={(e) =>
                                    setActionModal((prev) => ({ ...prev, adminNote: e.target.value }))
                                }
                                placeholder={
                                    actionModal.type === "approve"
                                        ? "Add any internal remarks or confirmation notes..."
                                        : "Explain why this request is being rejected..."
                                }
                                rows={3}
                                className="w-full p-2.5 border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0A2342]/20 focus:border-[#0A2342] transition-all resize-none"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeActionModal}
                                disabled={actionModal.submitting}
                                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmAction}
                                disabled={actionModal.submitting}
                                className={`px-4 py-2 text-white rounded-lg text-xs font-semibold transition shadow-xs flex items-center gap-1.5 cursor-pointer ${
                                    actionModal.type === "approve"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-rose-600 hover:bg-rose-700"
                                } disabled:opacity-50`}
                            >
                                {actionModal.submitting && <RefreshCw size={13} className="animate-spin" />}
                                <span>
                                    {actionModal.submitting
                                        ? "Processing..."
                                        : actionModal.type === "approve"
                                        ? "Confirm Approval"
                                        : "Confirm Rejection"}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* DETAILS MODAL */}
            {detailsModal.isOpen && detailsModal.user && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 border border-gray-100 relative">
                        <button
                            onClick={() => setDetailsModal({ isOpen: false, user: null })}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
                            <div className="w-12 h-12 rounded-full bg-[#0A2342] text-[#C9A227] font-bold flex items-center justify-center text-base shrink-0">
                                {detailsModal.user.name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{detailsModal.user.name}</h3>
                                <p className="text-xs text-gray-500">{detailsModal.user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-3.5 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <span className="text-gray-400 font-medium">Request Type</span>
                                    <p className="font-semibold text-gray-800 mt-0.5">
                                        {detailsModal.user.deactivationType === "delete"
                                            ? "Complete Data Deletion"
                                            : "Account Deactivation"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium">Current Status</span>
                                    <p className="font-semibold text-gray-800 mt-0.5 capitalize">
                                        {detailsModal.user.deactivationStatus || "None"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium">Account Active</span>
                                    <p className="font-semibold text-gray-800 mt-0.5">
                                        {detailsModal.user.isActive ? "Yes" : "No"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-400 font-medium">Requested On</span>
                                    <p className="font-semibold text-gray-800 mt-0.5">
                                        {formatDateTime(
                                            detailsModal.user.deactivationRequestedAt ||
                                                detailsModal.user.updatedAt
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* User Reason */}
                            <div>
                                <span className="font-semibold text-gray-600 uppercase tracking-wider text-[11px]">
                                    User's Stated Reason
                                </span>
                                <div className="mt-1 p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {detailsModal.user.deactivationReason || (
                                        <span className="text-gray-400 italic">No reason provided by user</span>
                                    )}
                                </div>
                            </div>

                            {/* Review information if reviewed */}
                            {detailsModal.user.deactivationReviewedAt && (
                                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg space-y-1">
                                    <div className="flex items-center justify-between">
                                        <span className="font-semibold text-[#0A2342]">Review Details</span>
                                        <span className="text-[11px] text-gray-500">
                                            {formatDateTime(detailsModal.user.deactivationReviewedAt)}
                                        </span>
                                    </div>
                                    {detailsModal.user.deactivationAdminNote && (
                                        <p className="text-gray-700 mt-1 italic">
                                            &ldquo;{detailsModal.user.deactivationAdminNote}&rdquo;
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                            <a
                                href={`mailto:${detailsModal.user.email}?subject=Regarding%20your%20account%20deactivation%20request`}
                                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                            >
                                <Mail size={13} />
                                <span>Email User</span>
                            </a>

                            <div className="flex items-center gap-2">
                                {detailsModal.user.deactivationStatus === "pending" && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const target = detailsModal.user;
                                                setDetailsModal({ isOpen: false, user: null });
                                                if (target) openActionModal("reject", target);
                                            }}
                                            className="px-3 py-2 border border-rose-200 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-50 transition cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const target = detailsModal.user;
                                                setDetailsModal({ isOpen: false, user: null });
                                                if (target) openActionModal("approve", target);
                                            }}
                                            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                    </>
                                )}
                                <button
                                    type="button"
                                    onClick={() => setDetailsModal({ isOpen: false, user: null })}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 transition cursor-pointer"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function DeactivationRequestsPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
                    <Loader />
                </div>
            }
        >
            <DeactivationRequestsContent />
        </Suspense>
    );
}
