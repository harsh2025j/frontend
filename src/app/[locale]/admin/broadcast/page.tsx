
"use client";

import React, { useState } from "react";
import { Send, Bell } from "lucide-react";
import { Link } from "@/i18n/routing";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { Loader } from "lucide-react";

export default function BroadcastPage() {
    // Mock History Data (since no endpoint provided yet)
    // Replace with real data fetch if endpoint becomes available
    const [history, setHistory] = useState<any[]>([]);

    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);

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

                {history.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No broadcast history available yet.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {history.map((item, idx) => (
                            <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-bold text-gray-900">{item.title}</h4>
                                    <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                                <p className="text-gray-600 text-sm mb-3">{item.body}</p>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${item.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {item.status || 'Sent'}
                                    </span>
                                    {item.channels?.map((c: string) => (
                                        <span key={c} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full capitalize border border-blue-100">
                                            {c}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
