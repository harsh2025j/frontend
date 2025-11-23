"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import {
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
} from "@/data/features/roles/rolesThunks";
import { fetchPermissions } from "@/data/features/permissions/permissionsThunks";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function RolesPage() {
    const dispatch = useAppDispatch();
    const { roles, loading, error } = useAppSelector((state) => state.roles);
    const { permissions } = useAppSelector((state) => state.permissions);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "", permissions: [] as string[] });

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchPermissions());
    }, [dispatch]);

    const handleOpenModal = (role?: any) => {
        if (role) {
            setEditingRole(role);
            setFormData({
                name: role.name,
                permissions: role.permissions || [],
            });
        } else {
            setEditingRole(null);
            setFormData({ name: "", permissions: [] });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingRole(null);
        setFormData({ name: "", permissions: [] });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRole) {
            await dispatch(updateRole({ id: editingRole._id, ...formData }));
        } else {
            await dispatch(createRole(formData));
        }
        handleCloseModal();
        dispatch(fetchRoles());
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this role?")) {
            await dispatch(deleteRole(id));
            dispatch(fetchRoles());
        }
    };

    const togglePermission = (permId: string) => {
        setFormData((prev) => {
            const newPerms = prev.permissions.includes(permId)
                ? prev.permissions.filter((id) => id !== permId)
                : [...prev.permissions, permId];
            return { ...prev, permissions: newPerms };
        });
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Roles Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Role
                </button>
            </div>

            {loading && <p>Loading roles...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-sm">
                        <tr>
                            <th className="px-6 py-3">Role Name</th>
                            <th className="px-6 py-3">Permissions Count</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {roles.map((role) => (
                            <tr key={role._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{role.name}</td>
                                <td className="px-6 py-4 text-gray-500">
                                    {role.permissions?.length || 0}
                                </td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    <button
                                        onClick={() => handleOpenModal(role)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {roles.length === 0 && !loading && (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                                    No roles found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingRole ? "Edit Role" : "Add New Role"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permissions
                                </label>
                                <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2 space-y-2">
                                    {permissions.map((perm) => (
                                        <div key={perm._id} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={perm._id}
                                                checked={formData.permissions.includes(perm._id)}
                                                onChange={() => togglePermission(perm._id)}
                                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                            />
                                            <label htmlFor={perm._id} className="ml-2 text-sm text-gray-700">
                                                {perm.name}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    {editingRole ? "Update Role" : "Create Role"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
