"use client";

import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/routing";
import React, { useState, useCallback, Suspense } from "react";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { getBroadcastService, postBroadcastService } from "@/data/services/broadcast-service/broadcastService";
import toast from "react-hot-toast";
import { useDocTitle } from "@/hooks/useDocTitle";
import Pagination from "@/components/Pagination";
import Loader from "@/components/ui/Loader";
import { Send, Bell, RefreshCw } from "lucide-react";

const LIMIT = 16;

export function BroadcastPageContent() {
    useDocTitle("Broadcast | Sajjad Husain Law Associates");
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useProfileActions();

    // --- Derived from URL ---
    const currentPage = parseInt(searchParams.get("page") || "1");

    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendingId, setSendingId] = useState<string | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);

    const updateUrl = (updates: Record<string, string | number | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
                params.set(key, value.toString());
            } else {
                params.delete(key);
            }
        });
        router.push(`/admin/broadcast?${params.toString()}`);
    };

    const fetchBroadcasts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getBroadcastService.getBroadcast(currentPage, LIMIT);
            const payload = response.data;
            setHistory(payload.data ?? []);
            setTotalPages(payload.meta?.total_pages ?? 1);
            setTotalItems(payload.meta?.total_items ?? 0);
        } catch {
            toast.error("Failed to fetch broadcasts.");
        } finally {
            setLoading(false);
        }
    }, [currentPage]);


    React.useEffect(() => {
        fetchBroadcasts();
    }, [fetchBroadcasts]);

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
                    <BroadcastHistorySkeleton />
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
                                onPageChange={(page) => updateUrl({ page })}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

function BroadcastHistorySkeleton() {
    return (
        <div className="divide-y divide-gray-100">
            {[...Array(5)].map((_, i) => (
                <div key={i} className="p-4 md:p-6 animate-pulse">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-2 gap-2">
                        <div className="h-5 w-48 bg-gray-200 rounded"></div>
                        <div className="h-4 w-32 bg-gray-100 rounded"></div>
                    </div>
                    <div className="space-y-2 mb-3">
                        <div className="h-4 w-full bg-gray-100 rounded"></div>
                        <div className="h-4 w-3/4 bg-gray-100 rounded"></div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between mt-3 gap-3">
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-blue-100 rounded-full"></div>
                            <div className="h-5 w-16 bg-blue-100 rounded-full"></div>
                        </div>
                        <div className="h-8 w-20 bg-gray-200 rounded-md"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AdminBroadcastSkeleton() {
    return (
        <div className="md:p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>
                <div className="h-10 w-full md:w-48 bg-gray-200 rounded-lg"></div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </div>
                <BroadcastHistorySkeleton />
            </div>
        </div>
    );
}

export default function BroadcastPage() {
    return (
        <Suspense fallback={<AdminBroadcastSkeleton />}>
            <BroadcastPageContent />
        </Suspense>
    );
}
