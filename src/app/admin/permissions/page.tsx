"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import {
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
} from "@/data/features/permissions/permissionsThunks";
import { Plus, Edit, Trash2, X } from "lucide-react";

export default function PermissionsPage() {
    const dispatch = useAppDispatch();
    const { permissions, loading, error } = useAppSelector((state) => state.permissions);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<any>(null);
    const [formData, setFormData] = useState({ name: "" });

    useEffect(() => {
        dispatch(fetchPermissions());
    }, [dispatch]);

    const handleOpenModal = (perm?: any) => {
        if (perm) {
            setEditingPermission(perm);
            setFormData({ name: perm.name });
        } else {
            setEditingPermission(null);
            setFormData({ name: "" });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingPermission(null);
        setFormData({ name: "" });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPermission) {
            await dispatch(updatePermission({ id: editingPermission._id, ...formData }));
        } else {
            await dispatch(createPermission(formData));
        }
        handleCloseModal();
        dispatch(fetchPermissions());
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this permission?")) {
            await dispatch(deletePermission(id));
            dispatch(fetchPermissions());
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Permissions Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                >
                    <Plus size={18} /> Add Permission
                </button>
            </div>

            {loading && <p>Loading permissions...</p>}
            {error && <p className="text-red-500">{error}</p>}

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-sm">
                        <tr>
                            <th className="px-6 py-3">Permission Name</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {permissions.map((perm) => (
                            <tr key={perm._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{perm.name}</td>
                                <td className="px-6 py-4 text-right flex justify-end gap-3">
                                    <button
                                        onClick={() => handleOpenModal(perm)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(perm._id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {permissions.length === 0 && !loading && (
                            <tr>
                                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                                    No permissions found.
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
                                {editingPermission ? "Edit Permission" : "Add New Permission"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Permission Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
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
                                    {editingPermission ? "Update Permission" : "Create Permission"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
