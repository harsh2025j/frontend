"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, RefreshCw, CheckCircle, XCircle, Shield } from "lucide-react";

// Components & Hooks
import Loader from "@/components/ui/Loader";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

// Thunks & Types
import { fetchUsers } from "@/data/features/users/usersThunks";
import { User, UserFilter } from "@/data/features/users/users.types";
import { UserData } from "@/data/features/profile/profile.types";

export default function UserManagementPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // --- Auth & Profile ---
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

    // --- Redux Data ---
    const { users, loading, error } = useAppSelector((state) => state.users);

    // --- Local State for Filters ---
    const [filters, setFilters] = useState<UserFilter>({
        name: "",
        email: "",
        isActive: "",
        isVerified: "",
    });

    // --- Authorization Check ---
    useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
            router.replace("/auth/login");
            return;
        }

        if (user) {
            if (user.roles?.length) {
                const allowedRoles = ["admin", "superadmin"];
                const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
                if (!hasAccess) router.replace("/auth/login");
                else setIsAuthorized(true);
            } else {
                // User exists but has no roles -> Redirect or Deny
                router.replace("/auth/login");
            }
        }
    }, [user, router]);

    // --- Fetch Users ---
    const loadUsers = () => {
        if (isAuthorized) {
            // Clean up filters before sending
            const activeFilters: UserFilter = {};
            if (filters.name) activeFilters.name = filters.name;
            if (filters.email) activeFilters.email = filters.email;
            if (filters.isActive !== "") activeFilters.isActive = filters.isActive === "true";
            if (filters.isVerified !== "") activeFilters.isVerified = filters.isVerified === "true";

            dispatch(fetchUsers(activeFilters));
        }
    };

    useEffect(() => {
        loadUsers();
    }, [dispatch, isAuthorized]); // Initial load

    // --- Handlers ---
    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value }));
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadUsers();
    };

    const handleReset = () => {
        setFilters({
            name: "",
            email: "",
            isActive: "",
            isVerified: "",
        });
        // We need to trigger a fetch with empty filters, but state update is async.
        // So we dispatch directly with empty object or use a timeout/effect.
        // Simplest here is to dispatch immediately with empty filters.
        dispatch(fetchUsers({}));
    };

    if (!isAuthorized) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
                <Loader size="lg" text="Checking Permissions..." />
            </div>
        );
    }

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
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">

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

                        {/* Actions */}
                        <div className="flex gap-2">
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
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Roles</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Permissions</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Status</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Verified</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Created By</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Joined</th>
                                        <th className="py-4 px-6 text-xs font-semibold uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">

                                    {[...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((user: User) => (
                                        <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{user.name}</p>
                                                        <p className="text-sm text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <TruncatedList items={user.roles} />
                                            </td>
                                            <td className="py-4 px-6">
                                                <TruncatedList items={user.permissions} />
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.isActive ? (
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
                                                {user.isVerified ? (
                                                    <span className="text-green-600" title="Verified">
                                                        <CheckCircle size={20} />
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-300" title="Not Verified">
                                                        <CheckCircle size={20} />
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                {user.createdBy ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-xs font-medium">
                                                            {user.createdBy.name?.charAt(0) || "?"}
                                                        </div>
                                                        <span className="text-sm text-gray-600">{user.createdBy.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-sm italic">Self / System</span>
                                                )}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"> Edit</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Footer / Pagination (Placeholder for now) */}
                    {!loading && !error && users.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm text-gray-500">
                            <span>Showing {users.length} users</span>
                            {/* Add pagination controls here if API supports it */}
                        </div>
                    )}
                </div>

            </div>
        </div>
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
function TruncatedListOld({ items }: { items: { _id?: string; id?: string; name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    onMouseEnter={() => setIsOpen(true)}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button
                        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors cursor-pointer
                            ${isOpen
                                ? "bg-blue-600 text-white border border-blue-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            }`}
                    >
                        +{remainingCount}
                    </button>

                    {/* Attached Tooltip (Absolute) */}
                    {isOpen && (
                        <div className="absolute left-0 top-full mt-1 z-[9999] bg-white border border-gray-100 rounded-lg shadow-xl p-3 flex flex-col gap-1.5 w-max min-w-[120px] max-w-[200px]">
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

// Helper component for truncating lists (Roles/Permissions)
function TruncatedListDeprecated({ items }: { items: { _id?: string; id?: string; name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [positionClass, setPositionClass] = useState("top-full mt-1"); // Default: drop down
    const containerRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    const updatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Check space below: full viewport height - button bottom
            const spaceBelow = window.innerHeight - rect.bottom;

            // If less than 200px below, flip up
            if (spaceBelow < 200) {
                setPositionClass("bottom-full mb-1");
            } else {
                setPositionClass("top-full mt-1");
            }
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
                    onMouseEnter={() => { updatePosition(); setIsOpen(true); }}
                    onMouseLeave={() => setIsOpen(false)}
                >
                    <button
                        ref={buttonRef}
                        onClick={(e) => { e.preventDefault(); updatePosition(); setIsOpen(!isOpen); }}
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium transition-colors cursor-pointer
                            ${isOpen
                                ? "bg-blue-600 text-white border border-blue-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                            }`}
                    >
                        +{remainingCount}
                    </button>

                    {/* Attached Tooltip (Absolute) */}
                    {isOpen && (
                        <div className={`absolute left-0 z-[9999] bg-white border border-gray-100 rounded-lg shadow-xl p-3 flex flex-col gap-1.5 w-max min-w-[120px] max-w-[200px] ${positionClass}`}>
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
