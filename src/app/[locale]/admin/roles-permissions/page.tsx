"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { useDocTitle } from "@/hooks/useDocTitle";

import {
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
} from "@/data/features/roles/rolesThunks";
import {
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
} from "@/data/features/permissions/permissionsThunks";
import { Plus, Edit, Trash2, X, Shield, Key, AlertTriangle, RefreshCw } from "lucide-react";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { formatDate, formatDateTime } from "@/utils/dateUtils";

import Loader from "@/components/ui/Loader";
import { useRouter } from "next/navigation";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { resetRolesState } from "@/data/features/roles/rolesSlice";
import { resetPermissionsState } from "@/data/features/permissions/permissionsSlice";

import { useSearchParams } from "next/navigation";

const RolesPermissionsPageContent = () => {
    useDocTitle("Roles & Permissions Management | Sajjad Husain Law Associates");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useProfileActions();


    const dispatch = useAppDispatch();
    const { roles, loading: rolesLoading, error: rolesError } = useAppSelector(
        (state) => state.roles
    );

    const {
        permissions,
        loading: permsLoading,
        error: permsError,
    } = useAppSelector((state) => state.permissions);

    const [activeTab, setActiveTab] = useState<"roles" | "permissions">((searchParams.get("tab") as any) || "roles");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Role Form State
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleFormData, setRoleFormData] = useState({ name: "", description: "" });

    // Permission Form State
    const [editingPermission, setEditingPermission] = useState<any>(null);
    const [permFormData, setPermFormData] = useState({ name: "", description: "" });

    // Delete Modal State
    const [deleteTarget, setDeleteTarget] = useState<{ id: string; type: "role" | "permission" } | null>(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
    }, [dispatch]);

    useEffect(() => {
        const tab = searchParams.get("tab") || "roles";
        setActiveTab(tab as any);
    }, [searchParams]);

    const handleTabChange = (tab: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`/admin/roles-permissions?${params.toString()}`);
    };

    // --- Role Handlers ---
    const handleOpenRoleModal = (role?: any) => {
        if (role) {
            setEditingRole(role);
            setRoleFormData({
                name: role.name,
                description: role.description || "",
            });
        } else {
            setEditingRole(null);
            setRoleFormData({ name: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const handleRoleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            if (editingRole) {
                await dispatch(updateRole({ id: editingRole.id, ...roleFormData }));
            } else {
                await dispatch(createRole(roleFormData));
            }
            setIsModalOpen(false);
            dispatch(resetRolesState());
        } catch (error) {
            console.error("Failed to save role:", error);
        } finally {
            dispatch(fetchRoles());
            setIsActionLoading(false);
        }
    };

    const handleRoleDelete = (id: string) => {
        if (!id) return;
        setDeleteTarget({ id, type: "role" });
    };

    // console.log("testing")

    // --- Permission Handlers ---
    const handleOpenPermModal = (perm?: any) => {
        if (perm) {
            setEditingPermission(perm);
            setPermFormData({
                name: perm.name,
                description: perm.description || "",
            });
        } else {
            setEditingPermission(null);
            setPermFormData({ name: "", description: "" });
        }
        setIsModalOpen(true);
    };

    const handlePermSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsActionLoading(true);
        try {
            if (editingPermission) {
                await dispatch(updatePermission({ id: editingPermission._id, ...permFormData }));
            } else {
                await dispatch(createPermission(permFormData));
            }
            setIsModalOpen(false);
            dispatch(resetPermissionsState());
        } catch (error) {
            console.error("Failed to save permission:", error);
        } finally {
            dispatch(fetchPermissions());
            setIsActionLoading(false);
        }
    };

    const handlePermDelete = (id: string) => {
        setDeleteTarget({ id, type: "permission" });
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        setIsActionLoading(true);
        try {
            if (deleteTarget.type === "role") {
                await dispatch(deleteRole(deleteTarget.id));
                dispatch(fetchRoles());
            } else {
                await dispatch(deletePermission(deleteTarget.id));
                dispatch(fetchPermissions());
            }
            setDeleteTarget(null);
        } catch (error) {
            console.error("Failed to delete:", error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setEditingPermission(null);
    };


    return (
        <div className="p-6 min-h-screen bg-gray-50">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-[#0A2342] mb-2">Create Roles & Permissions</h1>
                <p className="text-gray-600">Manage user roles and their access levels.</p>

            </div>


            {/* Tabs */}
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
                <button
                    onClick={() => handleTabChange("roles")}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === "roles"
                        ? "border-b-2 border-orange-500 text-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Shield size={18} /> Roles
                    </div>
                </button>
                <button
                    onClick={() => handleTabChange("permissions")}
                    className={`pb-2 px-4 font-medium transition-colors ${activeTab === "permissions"
                        ? "border-b-2 border-orange-500 text-orange-600"
                        : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Key size={18} /> Permissions
                    </div>
                </button>
            </div>

            {/* Content */}
            {activeTab === "roles" && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => handleOpenRoleModal()}
                            className="bg-[#0A2342] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#153a66] transition shadow-sm"
                        >
                            <Plus size={18} /> Create Role
                        </button>
                    </div>

                    {rolesError && <p className="text-red-500">{rolesError}</p>}

                    {/* Mobile Card View for Roles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden mb-6">
                        {rolesLoading && (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader size="lg" text="Loading roles..." />
                            </div>
                        )}
                        {Array.isArray(roles) && roles.map((role) => (
                            <div key={role.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role Name</span>
                                    <h3 className="text-lg font-bold text-[#0A2342]">{role.name}</h3>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-900 min-w-[80px]">Description:</span>
                                        <span className="line-clamp-2">{role.description || "--"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-900 min-w-[80px]">Created By:</span>
                                        <span>{role.createdBy?.name || role.createdBy?.email || "System"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-900 min-w-[80px]">Created At:</span>
                                        <span>
                                            {role.createdAt
                                                ? formatDateTime(role.createdAt)
                                                : role.id
                                                    ? formatDateTime(new Date(parseInt(role.id.substring(0, 8), 16) * 1000))
                                                    : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-2">
                                    <button
                                        onClick={() => handleOpenRoleModal(role)}
                                        className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleRoleDelete(role.id)}
                                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Role</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Description</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Created By</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Created At</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {rolesLoading && (
                                    <tr>
                                        <td colSpan={5} className="py-12">
                                            <div className="flex justify-center">
                                                <Loader size="lg" text="Loading roles..." />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {Array.isArray(roles) && roles.map((role) => (
                                    <tr
                                        key={role.id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        {/* Role Name */}
                                        <td className="px-4 py-4 font-bold text-gray-800">
                                            {role.name}
                                        </td>

                                        {/* Description */}
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {role.description || "--"}
                                            </p>
                                        </td>

                                        {/* Created By */}
                                        <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                                            {role.createdBy?.name ||
                                                role.createdBy?.email ||
                                                "System"}
                                        </td>

                                        {/* Created At */}
                                        <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                                            {role.createdAt
                                                ? formatDateTime(role.createdAt)
                                                : role.id
                                                    ? formatDateTime(new Date(parseInt(role.id.substring(0, 8), 16) * 1000))
                                                    : "N/A"}

                                            {/* {role.createdAt
                                                ? new Date(role.createdAt).toLocaleDateString()
                                                : "N/A"} */}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleOpenRoleModal(role)}
                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handleRoleDelete(role.id)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}

            {activeTab === "permissions" && (
                <div>
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => handleOpenPermModal()}
                            className="bg-[#0A2342] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#153a66] transition shadow-sm"
                        >
                            <Plus size={18} /> Create Permission
                        </button>
                    </div>

                    {permsError && <p className="text-red-500">{permsError}</p>}

                    {/* Mobile Card View for Permissions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden mb-6">
                        {permsLoading && (
                            <div className="col-span-full flex justify-center py-12">
                                <Loader size="lg" text="Loading permissions..." />
                            </div>
                        )}
                        {Array.isArray(permissions) && permissions.map((perm) => (
                            <div key={perm._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="border-b border-gray-100 pb-3">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Permission Name</span>
                                    <h3 className="text-lg font-bold text-[#0A2342]">{perm.name}</h3>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-900 min-w-[80px]">Description:</span>
                                        <span className="line-clamp-2">{perm.description || "--"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-900 min-w-[80px]">Created By:</span>
                                        <span>{perm.createdBy?.name || perm.createdBy?.email || "System"}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="font-medium text-gray-900 min-w-[80px]">Created At:</span>
                                        <span>
                                            {perm.createdAt
                                                ? formatDateTime(perm.createdAt)
                                                : perm._id
                                                    ? formatDateTime(new Date(parseInt(perm._id.substring(0, 8), 16) * 1000))
                                                    : "N/A"}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-2">
                                    <button
                                        onClick={() => handleOpenPermModal(perm)}
                                        className="flex-1 bg-blue-50 text-blue-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handlePermDelete(perm._id)}
                                        className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden lg:block overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                        <table className="w-full text-left">
                            <thead className="bg-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Permission</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Description</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Created By</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Created At</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {permsLoading && (
                                    <tr>
                                        <td colSpan={5} className="py-12">
                                            <div className="flex justify-center">
                                                <Loader size="lg" text="Loading permissions..." />
                                            </div>
                                        </td>
                                    </tr>
                                )}
                                {Array.isArray(permissions) && permissions.map((perm) => (
                                    <tr
                                        key={perm._id}
                                        className="border-b hover:bg-gray-50 transition"
                                    >
                                        {/* Permission Name */}
                                        <td className="px-4 py-4 font-bold text-gray-800">
                                            {perm.name}
                                        </td>

                                        {/* Description */}
                                        <td className="px-4 py-4">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {perm.description || "--"}
                                            </p>
                                        </td>

                                        {/* Created By */}
                                        <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                                            {perm.createdBy?.name ||
                                                perm.createdBy?.email ||
                                                "System"}
                                        </td>

                                        {/* Created At */}
                                        <td className="px-4 py-4 text-sm text-gray-700 font-medium">
                                            {perm.createdAt
                                                ? formatDateTime(perm.createdAt)
                                                : perm._id
                                                    ? formatDateTime(new Date(parseInt(perm._id.substring(0, 8), 16) * 1000))
                                                    : "N/A"}
                                        </td>

                                        {/* Actions */}
                                        <td className="px-4 py-4">
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleOpenPermModal(perm)}
                                                    className="text-gray-400 hover:text-blue-600 transition"
                                                >
                                                    <Edit size={18} />
                                                </button>

                                                <button
                                                    onClick={() => handlePermDelete(perm._id)}
                                                    className="text-gray-400 hover:text-red-600 transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            )}

            {/* Unified Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl transform transition-all">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeTab === "roles"
                                    ? editingRole
                                        ? "Edit Role"
                                        : "Create Role"
                                    : editingPermission
                                        ? "Edit Permission"
                                        : "Create Permission"}
                            </h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-400 hover:text-gray-600 transition"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            {activeTab === "roles" ? (
                                <form onSubmit={handleRoleSubmit}>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Role Name
                                        </label>
                                        <input
                                            type="text"
                                            value={roleFormData.name}
                                            onChange={(e) =>
                                                setRoleFormData({ ...roleFormData, name: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                                            placeholder="e.g. Editor"
                                            required
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={roleFormData.description}
                                            onChange={(e) =>
                                                setRoleFormData({ ...roleFormData, description: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition min-h-[80px]"
                                            placeholder="Brief description of the role..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isActionLoading}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-sm shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isActionLoading && <Loader size="sm" />}
                                            {editingRole ? "Save Changes" : "Create Role"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handlePermSubmit}>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Permission Name
                                        </label>
                                        <input
                                            type="text"
                                            value={permFormData.name}
                                            onChange={(e) =>
                                                setPermFormData({ ...permFormData, name: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
                                            placeholder="e.g. create:posts"
                                            required
                                        />
                                    </div>
                                    <div className="mb-5">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={permFormData.description}
                                            onChange={(e) =>
                                                setPermFormData({ ...permFormData, description: e.target.value })
                                            }
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition min-h-[80px]"
                                            placeholder="Brief description of the permission..."
                                        />
                                    </div>
                                    <div className="flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={closeModal}
                                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isActionLoading}
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-sm shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            {isActionLoading && <Loader size="sm" />}
                                            {editingPermission ? "Save Changes" : "Create Permission"}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl transform transition-all p-6">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Delete</h3>
                            <p className="text-gray-600">
                                Are you sure you want to delete this {deleteTarget.type}? This action cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteTarget(null)}
                                disabled={isActionLoading}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={isActionLoading}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isActionLoading ? (
                                    <>
                                        <Loader size="sm" /> Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Modal */}
            {(rolesError === MESSAGES.SERVER_CONNECTION_ERROR || permsError === MESSAGES.SERVER_CONNECTION_ERROR) && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all p-8 text-center">
                        <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
                        <p className="text-gray-600 mb-6">
                            {MESSAGES.SERVER_CONNECTION_ERROR}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 mx-auto hover:bg-red-700 transition shadow-lg shadow-red-600/30 w-full"
                        >
                            <RefreshCw size={20} />
                            Refresh Page
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function RolesPermissionsPage() {
    return (
        <React.Suspense fallback={<Loader />}>
            <RolesPermissionsPageContent />
        </React.Suspense>
    );
}
