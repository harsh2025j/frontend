"use client";

import React, { useEffect, useState } from "react";
import { displayBoardsService } from "@/data/services/display-boards-service/displayBoardsService";
import { Trash2, Plus, Monitor, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";

export default function AdminDisplayBoardsPage() {
    const [boards, setBoards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [generateData, setGenerateData] = useState({ court: "", date: "" });

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const response = await displayBoardsService.getAll();
            setBoards(response.data.data.data);
        } catch (error) {
            console.error("Error fetching display boards:", error);
            toast.error("Failed to fetch display boards");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this display board?")) return;
        try {
            await displayBoardsService.delete(id);
            toast.success("Display board deleted successfully");
            fetchBoards();
        } catch (error) {
            console.error("Error deleting display board:", error);
            toast.error("Failed to delete display board");
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setGenerating(true);
        try {
            await displayBoardsService.generateCauseList(generateData);
            toast.success("Cause list generated successfully");
            setShowGenerateModal(false);
            fetchBoards();
        } catch (error) {
            console.error("Error generating cause list:", error);
            toast.error("Failed to generate cause list");
        } finally {
            setGenerating(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-[400px]"><Loader size="lg" text="Loading Display Boards..." /></div>;

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Display Boards</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage digital display boards and cause lists</p>
                </div>
                <button
                    onClick={() => setShowGenerateModal(true)}
                    className="bg-[#0A2342] text-white px-4 py-2.5 rounded-lg hover:bg-[#153a66] transition-colors flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus size={18} /> Generate Cause List
                </button>
            </div>

            {boards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board) => (
                        <div key={board.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                        <Monitor size={24} />
                                    </div>
                                    <span
                                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${board.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                            }`}
                                    >
                                        {board.isActive ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <h2 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1" title={board.title}>{board.title}</h2>
                                <p className="text-sm text-gray-500 mb-4">{board.court}</p>

                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4 bg-gray-50 p-2 rounded">
                                    <Calendar size={16} />
                                    <span>{new Date(board.date).toLocaleDateString()}</span>
                                </div>

                                <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-4">
                                    <h3 className="font-semibold mb-2 text-xs text-gray-500 uppercase tracking-wider">Content Preview</h3>
                                    <pre className="text-xs text-gray-600 overflow-hidden h-20 font-mono">
                                        {JSON.stringify(board.content, null, 2)}
                                    </pre>
                                </div>

                                <div className="flex justify-end pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleDelete(board.id)}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-gray-50 rounded-full">
                            <Monitor size={48} className="text-gray-300" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900">No Display Boards</h3>
                            <p className="text-gray-500 mt-1">Generate a cause list to get started.</p>
                        </div>
                    </div>
                </div>
            )}

            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold mb-4 text-gray-900">Generate Cause List</h2>
                        <form onSubmit={handleGenerate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    placeholder="e.g. High Court of Delhi"
                                    value={generateData.court}
                                    onChange={(e) => setGenerateData({ ...generateData, court: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    value={generateData.date}
                                    onChange={(e) => setGenerateData({ ...generateData, date: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                    disabled={generating}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                    disabled={generating}
                                >
                                    {generating ? "Generating..." : "Generate"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
