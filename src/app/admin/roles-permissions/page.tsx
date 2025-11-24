"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
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

import Loader from "@/components/ui/Loader";

export default function RolesPermissionsPage() {
    const dispatch = useAppDispatch();
    const { roles, loading: rolesLoading, error: rolesError } = useAppSelector(
        (state) => state.roles
    );
    const {
        permissions,
        loading: permsLoading,
        error: permsError,
    } = useAppSelector((state) => state.permissions);

    const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Role Form State
    const [editingRole, setEditingRole] = useState<any>(null);
    const [roleFormData, setRoleFormData] = useState({ name: "", description: "" });

    // Permission Form State
    const [editingPermission, setEditingPermission] = useState<any>(null);
    const [permFormData, setPermFormData] = useState({ name: "", description: "" });

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
    }, [dispatch]);

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
        if (editingRole) {
            await dispatch(updateRole({ id: editingRole.id, ...roleFormData }));
        } else {
            await dispatch(createRole(roleFormData));
        }
        setIsModalOpen(false);
        dispatch(fetchRoles());
    };

    const handleRoleDelete = async (id: string) => {
        if (!id) return;
        if (confirm("Are you sure you want to delete this role?")) {
            await dispatch(deleteRole(id));
            dispatch(fetchRoles());
        }
    };

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
        if (editingPermission) {
            await dispatch(updatePermission({ id: editingPermission._id, ...permFormData }));
        } else {
            await dispatch(createPermission(permFormData));
        }
        setIsModalOpen(false);
        dispatch(fetchPermissions());
    };

    const handlePermDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this permission?")) {
            await dispatch(deletePermission(id));
            dispatch(fetchPermissions());
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
                    onClick={() => setActiveTab("roles")}
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
                    onClick={() => setActiveTab("permissions")}
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

                    {rolesLoading && (
                        <div className="flex justify-center py-12">
                            <Loader size="lg" text="Loading roles..." />
                        </div>
                    )}
                    {rolesError && <p className="text-red-500">{rolesError}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role) => (
                            <div
                                key={role.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenRoleModal(role)}
                                            className="text-gray-400 hover:text-blue-600 transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleRoleDelete(role.id)}
                                            className="text-gray-400 hover:text-red-600 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {role.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">{role.description}</p>
                                    )}
                                    <div className="pt-3 mt-3 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Created by:</span>
                                            <span className="font-medium text-gray-700">
                                                {role.createdBy?.name || role.createdBy?.email || "System"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Created at:</span>
                                            <span className="font-medium text-gray-700">
                                                {role.createdAt
                                                    ? new Date(role.createdAt).toLocaleDateString()
                                                    : role.id
                                                        ? new Date(parseInt(role.id.substring(0, 8), 16) * 1000).toLocaleDateString()
                                                        : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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

                    {permsLoading && (
                        <div className="flex justify-center py-12">
                            <Loader size="lg" text="Loading permissions..." />
                        </div>
                    )}
                    {permsError && <p className="text-red-500">{permsError}</p>}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {permissions.map((perm) => (
                            <div
                                key={perm._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">{perm.name}</h3>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOpenPermModal(perm)}
                                            className="text-gray-400 hover:text-blue-600 transition"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handlePermDelete(perm._id)}
                                            className="text-gray-400 hover:text-red-600 transition"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    {perm.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2">{perm.description}</p>
                                    )}
                                    <div className="pt-3 mt-3 border-t border-gray-100 flex flex-col gap-1 text-xs text-gray-500">
                                        <div className="flex justify-between">
                                            <span>Created by:</span>
                                            <span className="font-medium text-gray-700">
                                                {perm.createdBy?.name || perm.createdBy?.email || "System"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Created at:</span>
                                            <span className="font-medium text-gray-700">
                                                {perm.createdAt
                                                    ? new Date(perm.createdAt).toLocaleDateString()
                                                    : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-sm shadow-orange-500/30"
                                        >
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
                                            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium shadow-sm shadow-orange-500/30"
                                        >
                                            {editingPermission ? "Save Changes" : "Create Permission"}
                                        </button>
                                    </div>
                                </form>
                            )}
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
}
