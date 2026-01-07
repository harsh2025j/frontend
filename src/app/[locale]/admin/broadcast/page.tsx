"use client";

import React, { useState } from "react";
import { Send, Bell, RefreshCw } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { Loader } from "lucide-react";
import { getBroadcastService, postBroadcastService } from "@/data/services/broadcast-service/broadcastService";
import toast from "react-hot-toast";

export default function BroadcastPage() {
    // Mock History Data (since no endpoint provided yet)
    // Replace with real data fetch if endpoint becomes available
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 15;

    React.useEffect(() => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        if (!token) {
            router.replace("/auth/login");
            return;
        }

        if (user?.roles?.length) {
            const allowedRoles = ["admin", "superadmin"];
            const hasAccess = user.roles.some((r) => allowedRoles.includes(r.name));
            if (!hasAccess) {
                router.replace("/auth/login");
            } else {
                setIsAuthorized(true);
            }
        }
    }, [user, router]);

    const fetchBroadcasts = async () => {
        setLoading(true);
        try {
            const response = await getBroadcastService.getBroadcast();
            console.log(response.data)
            setHistory(response.data);
        } catch (error) {
            toast.error("Failed to fetch broadcast.");
        } finally {
            setLoading(false);
        }
    };


    const handleResend = async (id: string) => {
        // console.log(id)
        if (sendingId) return; // Prevent multiple clicks

        setSendingId(id);
        try {
            await postBroadcastService.resendBroadcast(id);
            toast.success("Broadcast resent successfully");
        } catch (error) {
            toast.error("Failed to resend broadcast");
        } finally {
            setSendingId(null);
        }
    };

    React.useEffect(() => {
        if (isAuthorized) {
            fetchBroadcasts();
        }
    }, [isAuthorized]);

    // Pagination Logic
    const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
    const currentItems = history.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    // Ensure all hooks are called BEFORE this early return
    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-[#0A2342]" size={48} />
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>
                    <p className="text-gray-500">Send announcements to all users via Push or Email.</p>
                </div>
                <Link
                    href="/admin/broadcast/create"
                    className="flex items-center gap-2 bg-[#0A2342] text-white px-4 py-2 rounded-lg hover:bg-[#153a66] transition-colors shadow-md"
                >
                    <Send size={18} />
                    Broadcast Notification
                </Link>
            </div>

            {/* Notifications History List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-800">Recent Broadcasts</h3>
                </div>
                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <Loader className="animate-spin text-[#0A2342]" size={48} />
                    </div>
                ) : (
                    history.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            <Bell size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No broadcast history available yet.</p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-gray-100">
                                {currentItems.map((item: any, idx: any) => (
                                    <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-gray-900">{item.content?.title || 'No Title'}</h4>
                                            <span className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleString()}</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-3">{item.content?.body || 'No Content'}</p>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex gap-2">
                                                {item.channels?.map((c: string) => (
                                                    <span key={c} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize border border-blue-100">
                                                        {c}
                                                    </span>
                                                ))}
                                            </div>
                                            <button
                                                onClick={() => handleResend(item._id || item.id)}
                                                disabled={sendingId === (item._id || item.id)}
                                                className={`flex items-center gap-1.5 text-xs border px-3 py-1.5 rounded-md transition-all 
                                                    ${sendingId === (item._id || item.id)
                                                        ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                        : 'text-gray-500 hover:text-[#0A2342] border-gray-200 hover:border-[#0A2342] bg-white'}`}
                                                title="Resend this broadcast"
                                            >
                                                <RefreshCw size={12} className={sendingId === (item._id || item.id) ? "animate-spin" : ""} />
                                                {sendingId === (item._id || item.id) ? "Resending..." : "Resend"}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="px-6 py-4 border-t border-gray-200 flex justify-center gap-6 items-center bg-gray-50">
                                    <button
                                        onClick={() => handlePageChange(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className={`text-sm font-medium px-4 py-2 rounded-md transition-colors
                                            ${currentPage === 1
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-700 hover:bg-gray-200 bg-white border border-gray-300'}`}
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-600">
                                        Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                                    </span>
                                    <button
                                        onClick={() => handlePageChange(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className={`text-sm font-medium px-4 py-2 rounded-md transition-colors
                                            ${currentPage === totalPages
                                                ? 'text-gray-400 cursor-not-allowed'
                                                : 'text-gray-700 hover:bg-gray-200 bg-white border border-gray-300'}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )
                )}
            </div>
        </div>
    );
}
