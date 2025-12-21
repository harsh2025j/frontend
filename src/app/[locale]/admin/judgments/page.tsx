"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { Link } from "@/i18n/routing";
import { Trash2, Edit, Plus, Search, Gavel } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function AdminJudgmentsPage() {
    const [judgments, setJudgments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchJudgments();
    }, []);

    const fetchJudgments = async () => {
        try {
            const response = await judgmentsService.getAll();
            setJudgments(response.data.data.data);
        } catch (error) {
            console.error("Error fetching judgments:", error);
            toast.error("Failed to fetch judgments");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this judgment?")) return;
        try {
            await judgmentsService.delete(id);
            toast.success("Judgment deleted successfully");
            fetchJudgments();
        } catch (error) {
            console.error("Error deleting judgment:", error);
            toast.error("Failed to delete judgment");
        }
    };

    const filteredJudgments = judgments.filter(j =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.caseId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Judgments..." /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Judgments</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage legal judgments</p>
                </div>
                <Link
                    href="/admin/judgments/create"
                    className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus size={18} /> Add New Judgment
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Title or Case ID..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Case ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judge</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredJudgments.length > 0 ? (
                                filteredJudgments.map((j) => (
                                    <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{j.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.caseId}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(j.judgmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.judgeName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/admin/judgments/${j.id}`}
                                                    className="text-[#0A2342] hover:text-[#C9A227] p-1 hover:bg-[#0A2342]/5 rounded transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(j.id)}
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
                                            <Gavel size={48} className="text-gray-300" />
                                            <p>No judgments found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
