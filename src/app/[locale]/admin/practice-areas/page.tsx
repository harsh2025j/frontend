"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { useDocTitle } from "@/hooks/useDocTitle";
import {
    fetchPracticeAreas,
    createPracticeArea,
    updatePracticeArea,
    deletePracticeArea,
} from "@/data/features/practiceAreas/practiceAreasThunks";
import { resetPracticeAreasState } from "@/data/features/practiceAreas/practiceAreasSlice";
import { Plus, Edit, Trash2, X, Scale, RefreshCw } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

export default function PracticeAreasManagementPage() {
    useDocTitle("Practice Areas Management | Sajjad Husain Law Associates");
    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            router.replace("/auth/login");
            return;
        }

        if (user?.roles && user.roles.length > 0) {
            const userRoles = user.roles.map((r) => r.name);
            const allowedRoles = ["admin", "superadmin"];
            const hasAccess = userRoles.some((role) => allowedRoles.includes(role));

            if (!hasAccess) {
                router.replace("/auth/login");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, router]);

    const dispatch = useAppDispatch();
    const { practiceAreas, loading, error, message } = useAppSelector((state) => state.practiceAreas);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPracticeArea, setEditingPracticeArea] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        isActive: true,
    });

    const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

    useEffect(() => {
        dispatch(fetchPracticeAreas());
    }, [dispatch]);

    useEffect(() => {
        if (message) {
            setTimeout(() => {
                dispatch(resetPracticeAreasState());
                dispatch(fetchPracticeAreas());
            }, 2000);
        }
    }, [message, dispatch]);

    const handleOpenModal = (practiceArea?: any) => {
        if (practiceArea) {
            setEditingPracticeArea(practiceArea);
            setFormData({
                name: practiceArea.name,
                description: practiceArea.description || "",
                isActive: practiceArea.isActive,
            });
        } else {
            setEditingPracticeArea(null);
            setFormData({
                name: "",
                description: "",
                isActive: true,
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            if (editingPracticeArea) {
                await dispatch(updatePracticeArea({ id: editingPracticeArea.id, ...formData }));
            } else {
                await dispatch(createPracticeArea(formData));
            }
            setIsModalOpen(false);
            setFormData({
                name: "",
                description: "",
                isActive: true,
            });
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsActionLoading(true);
        try {
            await dispatch(deletePracticeArea(deleteTarget));
            setDeleteTarget(null);
        } catch (err) {
            console.error(err);
        } finally {
            setIsActionLoading(false);
        }
    };

    const filteredPracticeAreas = practiceAreas.filter((area) => {
        const matchesSearch =
            area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            area.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter =
            filterActive === "all" ||
            (filterActive === "active" && area.isActive) ||
            (filterActive === "inactive" && !area.isActive);

        return matchesSearch && matchesFilter;
    });

    if (!isAuthorized) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div className="flex items-center gap-3 mb-4 md:mb-0">
                    <div className="p-3 bg-blue-100 rounded-lg">
                        <Scale className="w-6 h-6 text-[#0B2149]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Practice Areas Management</h1>
                        <p className="text-sm text-gray-600">Manage legal practice areas and specializations</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0B2149] text-white rounded-lg hover:bg-[#1a3a75] transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add Practice Area
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Search by name or description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterActive("all")}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filterActive === "all"
                                    ? "bg-[#0B2149] text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilterActive("active")}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filterActive === "active"
                                    ? "bg-green-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilterActive("inactive")}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                filterActive === "inactive"
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            Inactive
                        </button>
                    </div>
                    <button
                        onClick={() => dispatch(fetchPracticeAreas())}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {message && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                    {message}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center py-12">
                    <Loader />
                </div>
            )}

            {/* Practice Areas Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPracticeAreas.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                            <Scale className="w-16 h-16 mb-4 text-gray-300" />
                            <p>No practice areas found</p>
                        </div>
                    ) : (
                        filteredPracticeAreas.map((area) => (
                            <div
                                key={area.id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Scale className="w-5 h-5 text-[#0B2149]" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{area.name}</h3>
                                            <p className="text-xs text-gray-500">{area.slug}</p>
                                        </div>
                                    </div>
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            area.isActive
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {area.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                {area.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{area.description}</p>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="text-xs text-gray-500">
                                        {area.createdAt && `Created ${formatDate(area.createdAt)}`}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenModal(area)}
                                            className="p-2 text-[#0B2149] hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(area.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {editingPracticeArea ? "Edit Practice Area" : "Add New Practice Area"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Practice Area Name *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                                        placeholder="Intellectual Property"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-transparent"
                                        placeholder="Patents, trademarks, copyrights, and IP litigation"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={(e) =>
                                                setFormData({ ...formData, isActive: e.target.checked })
                                            }
                                            className="w-4 h-4 text-[#0B2149] border-gray-300 rounded focus:ring-blue-500/20"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Active</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isActionLoading}
                                    className="px-4 py-2 bg-[#0B2149] text-white rounded-lg hover:bg-[#1a3a75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                                    {editingPracticeArea ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this practice area? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isActionLoading}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isActionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
