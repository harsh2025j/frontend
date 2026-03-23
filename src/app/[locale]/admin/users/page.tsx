"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, RefreshCw, CheckCircle, XCircle, Shield, Building2, Scale } from "lucide-react";

// Components & Hooks
import Loader from "@/components/ui/Loader";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

// Thunks & Types
import { fetchUsers, verifyUser } from "@/data/features/users/usersThunks";
import { fetchOffices } from "@/data/features/offices/officesThunks";
import { fetchPracticeAreas } from "@/data/features/practiceAreas/practiceAreasThunks";
import ConfirmationModal from "@/components/ui/ConfirmationModal";
import { User, UserFilter } from "@/data/features/users/users.types";
import { UserData } from "@/data/features/profile/profile.types";
import { useDocTitle } from "@/hooks/useDocTitle";

import Pagination from "@/components/Pagination";


export default function UserManagementPage() {
    useDocTitle("User Management  | Sajjad Husain Law Associates");
    const router = useRouter();
    const dispatch = useAppDispatch();

    // --- Profile ---
    const { user } = useProfileActions();

    // --- Redux Data ---
    const { users, total, page, limit, loading, error } = useAppSelector((state) => state.users);
    const { offices } = useAppSelector((state) => state.offices);
    const { practiceAreas } = useAppSelector((state) => state.practiceAreas);

    // --- Local State for Filters ---
    const [filters, setFilters] = useState<UserFilter>({
        name: "",
        email: "",
        isActive: "",
        isVerified: "",
        officeId: "",
        practiceAreaId: "",
        clearanceLevel: "",
        page: 1,
        limit: 15
    });

    // --- Modal State ---
    const [verifyModalOpen, setVerifyModalOpen] = useState(false);
    const [userToVerify, setUserToVerify] = useState<{ id: string; name: string; currentStatus: boolean } | null>(null);


    // --- Fetch Users ---
    const loadUsers = useCallback(() => {

        // Clean up filters before sending
        const activeFilters: UserFilter = {};
        if (filters.name) activeFilters.name = filters.name;
        if (filters.email) activeFilters.email = filters.email;
        if (filters.isActive !== "") activeFilters.isActive = filters.isActive === "true";
        if (filters.isVerified !== "") activeFilters.isVerified = filters.isVerified === "true";
        if (filters.officeId) activeFilters.officeId = filters.officeId;
        if (filters.practiceAreaId) activeFilters.practiceAreaId = filters.practiceAreaId;
        if (filters.clearanceLevel !== "") activeFilters.clearanceLevel = parseInt(filters.clearanceLevel as string);

        activeFilters.page = filters.page || 1;
        activeFilters.limit = filters.limit || 15;

        dispatch(fetchUsers(activeFilters));
    }, [filters, dispatch]);

    useEffect(() => {
        loadUsers();
    }, [filters.page, dispatch, loadUsers]);

    // For other filters, we only want to load when "Filter" or "Search" is clicked
    // But page changes should trigger instantly.

    useEffect(() => {
        dispatch(fetchOffices());
        dispatch(fetchPracticeAreas());
    }, [dispatch]);

    // --- Handlers ---
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // Reset to page 1 on search
        setFilters(prev => ({ ...prev, page: 1 }));
        loadUsers();
    };

    const handleReset = () => {
        const resetFilters = {
            name: "",
            email: "",
            isActive: "",
            isVerified: "",
            officeId: "",
            practiceAreaId: "",
            clearanceLevel: "",
            page: 1,
            limit: 15
        };
        setFilters(resetFilters);
        // Dispatch directly with reset filters to be immediate
        dispatch(fetchUsers({ page: 1, limit: 15 }));
    };

    const handlePageChange = (newPage: number) => {
        setFilters(prev => ({ ...prev, page: newPage }));
        // The useEffect watching filters.page will trigger loadUsers()
    };

    // --- Verification Handlers ---
    const handleVerifyClick = (user: User) => {
        setUserToVerify({
            id: user._id,
            name: user.name,
            currentStatus: user.isVerified
        });
        setVerifyModalOpen(true);
    };

    const handleConfirmVerify = async () => {
        if (userToVerify) {
            const newStatus = !userToVerify.currentStatus;

            await dispatch(verifyUser({ userId: userToVerify.id, isVerified: newStatus }));
            setVerifyModalOpen(false);
            setUserToVerify(null);
            // Reload to get fresh data
            loadUsers();
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-[#0A2342]">User Management</h1>
                        <p className="text-sm text-gray-500">View and manage all registered users.</p>
                    </div>
                    <button
                        onClick={loadUsers}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                    <form onSubmit={handleSearch} className="space-y-4">
                        {/* Row 1: Basic Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Name Search */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Search by name..."
                                        value={filters.name}
                                        onChange={handleFilterChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Email Search */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        name="email"
                                        placeholder="Search by email..."
                                        value={filters.email}
                                        onChange={handleFilterChange}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Status Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</label>
                                <select
                                    name="isActive"
                                    value={filters.isActive as string}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="true">Active</option>
                                    <option value="false">Inactive</option>
                                </select>
                            </div>

                            {/* Verified Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Verified</label>
                                <select
                                    name="isVerified"
                                    value={filters.isVerified as string}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">All</option>
                                    <option value="true">Verified</option>
                                    <option value="false">Unverified</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Law Firm Access Control Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Office Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Building2 size={14} />
                                    Office
                                </label>
                                <select
                                    name="officeId"
                                    value={filters.officeId as string}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">All Offices</option>
                                    {offices.filter(o => o.isActive).map((office) => (
                                        <option key={office.id} value={office.id}>
                                            {office.name} ({office.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Practice Area Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Scale size={14} />
                                    Practice Area
                                </label>
                                <select
                                    name="practiceAreaId"
                                    value={filters.practiceAreaId as string}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">All Practice Areas</option>
                                    {practiceAreas.filter(pa => pa.isActive).map((area) => (
                                        <option key={area.id} value={area.id}>
                                            {area.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Clearance Level Filter */}
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Shield size={14} />
                                    Clearance Level
                                </label>
                                <select
                                    name="clearanceLevel"
                                    value={filters.clearanceLevel as string}
                                    onChange={handleFilterChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                                >
                                    <option value="">All Levels</option>
                                    <option value="1">Level 1 (Public)</option>
                                    <option value="2">Level 2 (Internal)</option>
                                    <option value="3">Level 3 (Confidential)</option>
                                    <option value="4">Level 4 (Restricted)</option>
                                    <option value="5">Level 5 (Highly Sensitive)</option>
                                </select>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 items-end">
                                <button
                                    type="submit"
                                    className="flex-1 bg-[#0A2342] text-white px-4 py-2 rounded-lg hover:bg-[#0A2342]/90 transition flex items-center justify-center gap-2"
                                >
                                    <Filter size={18} />
                                    Filter
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <Loader size="lg" />
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                                <XCircle size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Failed to load users</h3>
                            <p className="text-gray-500 mt-1 mb-4">{error}</p>
                            <button
                                onClick={loadUsers}
                                className="text-blue-600 hover:text-blue-700 font-medium"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-4">
                                <UsersIcon size={24} />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">No users found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50/50 text-gray-500 border-b border-gray-100">
                                    <tr>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">User</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Office</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Practice Areas</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Clearance</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Roles</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Verified</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {[...users].sort((a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()).map((tableUser: User) => (
                                        <tr key={tableUser._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {tableUser.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{tableUser.name}</p>
                                                        <p className="text-sm text-gray-500">{tableUser.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                {tableUser.office ? (
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={16} className="text-blue-600" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{tableUser.office.name}</p>
                                                            <p className="text-xs text-gray-500">{tableUser.office.code}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {tableUser.practiceAreas && tableUser.practiceAreas.length > 0 ? (
                                                    <TruncatedPracticeAreas items={tableUser.practiceAreas} />
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {tableUser.clearanceLevel ? (
                                                    <div className="flex items-center gap-2">
                                                        <Shield size={16} className={
                                                            tableUser.clearanceLevel === 5 ? "text-red-600" :
                                                                tableUser.clearanceLevel === 4 ? "text-orange-600" :
                                                                    tableUser.clearanceLevel === 3 ? "text-yellow-600" :
                                                                        tableUser.clearanceLevel === 2 ? "text-blue-600" :
                                                                            "text-gray-600"
                                                        } />
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tableUser.clearanceLevel === 5 ? "bg-red-50 text-red-700 border border-red-100" :
                                                            tableUser.clearanceLevel === 4 ? "bg-orange-50 text-orange-700 border border-orange-100" :
                                                                tableUser.clearanceLevel === 3 ? "bg-yellow-50 text-yellow-700 border border-yellow-100" :
                                                                    tableUser.clearanceLevel === 2 ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                                                        "bg-gray-50 text-gray-700 border border-gray-100"
                                                            }`}>
                                                            Level {tableUser.clearanceLevel}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <TruncatedList items={tableUser.roles || []} />
                                            </td>
                                            <td className="py-4 px-6">
                                                {tableUser.isActive ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {user && tableUser._id !== user._id && (
                                                    <button
                                                        onClick={() => handleVerifyClick(tableUser)}
                                                        className="focus:outline-none hover:bg-gray-100 p-1 rounded-full transition-colors"
                                                        title={tableUser.isVerified ? "Click to Unverify" : "Click to Verify"}
                                                    >
                                                        {tableUser.isVerified ? (
                                                            <span className="text-green-600">
                                                                <CheckCircle size={20} />
                                                            </span>
                                                        ) : (
                                                            <span className="text-gray-300">
                                                                <CheckCircle size={20} />
                                                            </span>
                                                        )}
                                                    </button>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => router.push(`/admin/teams/edit/${tableUser._id}`)}
                                                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded flex items-center gap-1 hover:bg-blue-200 transition-colors"
                                                    >
                                                        <span className="text-xs font-medium">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => router.push(`/admin/profile/${tableUser.username}`)}
                                                        className="bg-[#C9A227]/10 text-[#C9A227] px-3 py-1 rounded flex items-center gap-1 hover:bg-[#C9A227]/20 transition-colors"
                                                    >
                                                        <span className="text-xs font-medium">Profile</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )
                    }

                    {/* Footer / Pagination */}
                    {
                        !loading && !error && users.length > 0 && (
                            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
                                <span>Showing {users.length} of {total} users</span>
                                <div className="w-full sm:w-auto">
                                    <Pagination
                                        currentPage={page}
                                        totalPages={Math.ceil(total / limit)}
                                        onPageChange={handlePageChange}
                                    />
                                </div>
                            </div>
                        )
                    }
                </div >

                {/* Verification Confirmation Modal */}
                < ConfirmationModal
                    isOpen={verifyModalOpen}
                    onClose={() => setVerifyModalOpen(false)}
                    onConfirm={handleConfirmVerify}
                    title={userToVerify?.currentStatus ? "Unverify User" : "Verify User"}
                    message={
                        userToVerify?.currentStatus
                            ? `Are you sure you want to unverify ${userToVerify.name}? They will lose verified status privileges.`
                            : `Are you sure you want to verify ${userToVerify?.name}? This will grant them verified status.`
                    }
                    confirmText={userToVerify?.currentStatus ? "Unverify" : "Verify"}
                    variant={userToVerify?.currentStatus ? "warning" : "success"}
                />

            </div >
        </div >
    );
}

// Simple Icon component for empty state
function UsersIcon({ size }: { size: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
    );
}


// Helper component for truncating lists (Roles/Permissions)
function TruncatedList({ items }: { items: { _id?: string; id?: string; name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const containerRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const calculateStyle = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;

        const newStyle: React.CSSProperties = {
            left: rect.left,
            position: 'fixed',
            zIndex: 9999,
        };

        // Flip up if space below is tight (<200px)
        if (spaceBelow < 200) {
            newStyle.bottom = window.innerHeight - rect.top + 4;
            newStyle.maxHeight = rect.top - 20; // prevent overflow top
        } else {
            newStyle.top = rect.bottom + 4;
            newStyle.maxHeight = window.innerHeight - rect.bottom - 20; // prevent overflow bottom
        }

        setStyle(newStyle);
    };

    // Close on click outside or Scroll
    useEffect(() => {
        // Generic click listener for outside clicks
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            window.addEventListener("scroll", () => setIsOpen(false), true);
            document.addEventListener("mousedown", handleClick);
        }

        return () => {
            window.removeEventListener("scroll", () => setIsOpen(false), true);
            document.removeEventListener("mousedown", handleClick);
        };
    }, [isOpen]);

    if (!items || items.length === 0) {
        return <span className="text-gray-400 text-sm">-</span>;
    }

    const displayedItems = items.slice(0, 1);
    const remainingCount = items.length - 1;

    return (
        <div className="relative flex flex-wrap gap-1 items-center" ref={containerRef}>
            {displayedItems.map((item) => (
                <span
                    key={item._id || item.id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap"
                >
                    {item.name}
                </span>
            ))}

            {remainingCount > 0 && (
                <div
                    className="relative"
                    onMouseEnter={() => { calculateStyle(); setIsOpen(true); }}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button
                        ref={buttonRef}
                        onClick={(e) => { e.preventDefault(); calculateStyle(); setIsOpen(!isOpen); }}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors cursor-pointer
                            ${isOpen
                                ? "bg-blue-600 text-white border border-blue-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            }`}
                    >
                        +{remainingCount}
                    </button>

                    {/* Fixed Tooltip (Z-Axis Independent) */}
                    {isOpen && (
                        <div
                            className="fixed bg-white border border-gray-100 rounded-lg shadow-xl p-3 flex flex-col gap-1.5 w-max min-w-[120px] max-w-[200px]"
                            style={style}
                        >
                            {items.slice(1).map((item) => (
                                <span
                                    key={item._id || item.id}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 shadow-sm"
                                >
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper component for truncating practice areas
function TruncatedPracticeAreas({ items }: { items: { _id: string; name: string; slug: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const containerRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const calculateStyle = () => {
        if (!buttonRef.current) return;
        const rect = buttonRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;

        const newStyle: React.CSSProperties = {
            left: rect.left,
            position: 'fixed',
            zIndex: 9999,
        };

        if (spaceBelow < 200) {
            newStyle.bottom = window.innerHeight - rect.top + 4;
            newStyle.maxHeight = rect.top - 20;
        } else {
            newStyle.top = rect.bottom + 4;
            newStyle.maxHeight = window.innerHeight - rect.bottom - 20;
        }

        setStyle(newStyle);
    };

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            window.addEventListener("scroll", () => setIsOpen(false), true);
            document.addEventListener("mousedown", handleClick);
        }

        return () => {
            window.removeEventListener("scroll", () => setIsOpen(false), true);
            document.removeEventListener("mousedown", handleClick);
        };
    }, [isOpen]);

    if (!items || items.length === 0) {
        return <span className="text-gray-400 text-sm">-</span>;
    }

    const displayedItems = items.slice(0, 1);
    const remainingCount = items.length - 1;

    return (
        <div className="relative flex flex-wrap gap-1 items-center" ref={containerRef}>
            {displayedItems.map((item) => (
                <span
                    key={item._id}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 whitespace-nowrap"
                >
                    <Scale size={12} className="mr-1" />
                    {item.name}
                </span>
            ))}

            {remainingCount > 0 && (
                <div
                    className="relative"
                    onMouseEnter={() => { calculateStyle(); setIsOpen(true); }}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button
                        ref={buttonRef}
                        onClick={(e) => { e.preventDefault(); calculateStyle(); setIsOpen(!isOpen); }}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors cursor-pointer
                            ${isOpen
                                ? "bg-purple-600 text-white border border-purple-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            }`}
                    >
                        +{remainingCount}
                    </button>

                    {isOpen && (
                        <div
                            className="fixed bg-white border border-gray-100 rounded-lg shadow-xl p-3 flex flex-col gap-1.5 w-max min-w-[120px] max-w-[200px]"
                            style={style}
                        >
                            {items.slice(1).map((item) => (
                                <span
                                    key={item._id}
                                    className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100 shadow-sm"
                                >
                                    <Scale size={12} className="mr-1" />
                                    {item.name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
