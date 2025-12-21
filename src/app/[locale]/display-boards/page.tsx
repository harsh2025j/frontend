"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { displayBoardsService } from "@/data/services/display-boards-service/displayBoardsService";

export default function DisplayBoardsPage() {
    const [boards, setBoards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBoards();
    }, []);

    const fetchBoards = async () => {
        try {
            const response = await displayBoardsService.getAll();
            setBoards(response.data.data.data);
        } catch (error) {
            console.error("Error fetching display boards:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Display Boards</h1>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {boards.map((board) => (
                        <div key={board.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold">{board.title}</h2>
                                    <p className="text-sm text-gray-500">{board.court}</p>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-semibold rounded ${board.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                                        }`}
                                >
                                    {board.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <p className="text-gray-600 mb-4">Date: {new Date(board.date).toLocaleDateString()}</p>
                            <div className="bg-gray-50 p-4 rounded">
                                <h3 className="font-semibold mb-2">Content Preview</h3>
                                <pre className="text-xs overflow-auto max-h-32">
                                    {JSON.stringify(board.content, null, 2)}
                                </pre>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
