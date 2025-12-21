"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { Link } from "@/i18n/routing";
import { Trash2, Edit, Plus, Search, Scale } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function AdminJudgesPage() {
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchJudges();
    }, []);

    const fetchJudges = async () => {
        try {
            const response = await judgesService.getAll();
            setJudges(response.data.data.data);
        } catch (error) {
            console.error("Error fetching judges:", error);
            toast.error("Failed to fetch judges");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this judge?")) return;
        try {
            await judgesService.delete(id);
            toast.success("Judge deleted successfully");
            fetchJudges();
        } catch (error) {
            console.error("Error deleting judge:", error);
            toast.error("Failed to delete judge");
        }
    };

    const filteredJudges = judges.filter(j =>
        j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        j.court.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Judges..." /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Manage Judges</h1>
                    <p className="text-gray-500 text-sm mt-1">View and manage judge profiles</p>
                </div>
                <Link
                    href="/admin/judges/create"
                    className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus size={18} /> Add New Judge
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Name or Court..."
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Designation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointed Date</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredJudges.length > 0 ? (
                                filteredJudges.map((j) => (
                                    <tr key={j.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{j.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.designation}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{j.court}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(j.appointmentDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link
                                                    href={`/admin/judges/${j.id}`}
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
                                            <Scale size={48} className="text-gray-300" />
                                            <p>No judges found matching your search.</p>
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
