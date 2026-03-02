"use client";

import React, { useState } from "react";
import { Send, Bell, RefreshCw, Loader } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { getBroadcastService, postBroadcastService } from "@/data/services/broadcast-service/broadcastService";
import toast from "react-hot-toast";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";

const LIMIT = 16;

export default function BroadcastPage() {
    useDocTitle("Broadcast | Sajjad Husain Law Associates");

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

    React.useEffect(() => {
        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) { router.replace("/auth/login"); return; }
        if (user?.roles?.length) {
            const hasAccess = user.roles.some((r) => ["admin", "superadmin"].includes(r.name));
            if (!hasAccess) router.replace("/auth/login");
            else setIsAuthorized(true);
        }
    }, [user, router]);

    const fetchBroadcasts = async (page: number) => {
        setLoading(true);
        try {
            const response = await getBroadcastService.getBroadcast(page, LIMIT);
            const payload = response.data;
            setHistory(payload.data ?? []);
            setTotalPages(payload.meta?.total_pages ?? 1);
            setTotalItems(payload.meta?.total_items ?? 0);
        } catch {
            toast.error("Failed to fetch broadcasts.");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        if (isAuthorized) fetchBroadcasts(currentPage);
    }, [isAuthorized, currentPage]);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };

    const handleResend = async (id: string) => {
        if (sendingId) return;
        setSendingId(id);
        try {
            await postBroadcastService.resendBroadcast(id);
            toast.success("Broadcast resent successfully");
        } catch {
            toast.error("Failed to resend broadcast");
        } finally {
            setSendingId(null);
        }
    };

    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-[#0A2342]" size={48} />
            </div>
        );
    }

    return (
        <div className="md:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>
                    <p className="text-gray-500 text-sm md:text-base">Send announcements to all users via Push or Email.</p>
                </div>
                <Link
                    href="/admin/broadcast/create"
                    className="w-full md:w-auto flex items-center justify-center gap-2 bg-[#0A2342] text-white px-4 py-2 rounded-lg hover:bg-[#153a66] transition-colors shadow-md"
                >
                    <Send size={18} />
                    Broadcast Notification
                </Link>
            </div>

            {/* Broadcast History */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">Recent Broadcasts</h3>
                    {totalItems > 0 && (
                        <span className="text-xs text-gray-500">{totalItems} total</span>
                    )}
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">
                        <Loader className="animate-spin text-[#0A2342] mx-auto" size={48} />
                    </div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No broadcast history available yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="divide-y divide-gray-100">
                            {history.map((item: any) => (
                                <div key={item._id || item.id} className="p-4 md:p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.content?.title || "No Title"}</h4>
                                        <span className="text-xs text-gray-400 whitespace-nowrap">
                                            {new Date(item.createdAt).toLocaleDateString("en-GB")}{" "}
                                            {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.content?.body || "No Content"}</p>
                                    <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                                        <div className="flex gap-2 flex-wrap">
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
                                                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                                    : "text-gray-500 hover:text-[#0A2342] border-gray-200 hover:border-[#0A2342] bg-white"}`}
                                            title="Resend this broadcast"
                                        >
                                            <RefreshCw size={12} className={sendingId === (item._id || item.id) ? "animate-spin" : ""} />
                                            {sendingId === (item._id || item.id) ? "Resending..." : "Resend"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
