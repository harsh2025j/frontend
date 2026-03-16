"use client";

import React, { useState, useCallback } from "react";
import { BroadcastPayload, postBroadcastService } from "@/data/services/broadcast-service/broadcastService";
import toast from "react-hot-toast";
import { Send, Bell, AlertTriangle, Users, Loader, ArrowLeft } from "lucide-react";
import { usersApi } from "@/data/services/users-service/users-service";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { useDocTitle } from "@/hooks/useDocTitle";
import InfiniteSearchableMultiSelect, { SearchableOption } from "@/components/ui/InfiniteSearchableMultiSelect";

export default function CreateBroadcastPage() {
    useDocTitle("Create Broadcast | Sajjad Husain Law Associates");
    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<BroadcastPayload>({
        title: "",
        body: "",
        sendToAll: true,
        channels: ["push"],
        userIds: []
    });

    const [showConfirm, setShowConfirm] = useState(false);

    // --- EFFECTS ---
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

    const handleUserSearch = useCallback(async (query: string, page: number) => {
        try {
            const data = await usersApi.fetchUsers({ 
                isActive: true, // Only fetch active users for broadcast
                name: query, 
                page,
                limit: 15
            });
            
            if (data.success && data.data) {
                const options: SearchableOption[] = data.data.data.map((u: any) => ({
                    value: u._id,
                    label: u.name,
                    subLabel: u.email
                }));
                const totalPages = Math.ceil(data.data.total / 15);
                return { options, totalPages };
            }
            return { options: [], totalPages: 0 };
        } catch (error) {
            toast.error("Failed to load users");
            return { options: [], totalPages: 0 };
        }
    }, []);

    const handleUserSelectionChange = (userIds: string[]) => {
        setFormData((prev) => ({ ...prev, userIds }));
    };

    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-[#0A2342]" size={48} />
            </div>
        );
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleChannelChange = (channel: string) => {
        setFormData((prev) => {
            const currentChannels = prev.channels;
            if (currentChannels.includes(channel)) {
                return { ...prev, channels: currentChannels.filter(c => c !== channel) };
            } else {
                return { ...prev, channels: [...currentChannels, channel] };
            }
        });
    };

    const handleRecipientTypeChange = (sendToAll: boolean) => {
        setFormData((prev) => ({ ...prev, sendToAll }));
    };

    const handleSendClick = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title || !formData.body) {
            toast.error("Please fill in all fields");
            return;
        }

        if (formData.channels.length === 0) {
            toast.error("Please select at least one channel");
            return;
        }

        if (!formData.sendToAll && (!formData.userIds || formData.userIds.length === 0)) {
            toast.error("Please select at least one user");
            return;
        }
        setShowConfirm(true);
    };

    const confirmSend = async () => {
        setLoading(true);
        setShowConfirm(false);
        try {
            await postBroadcastService.sendBroadcast({
                ...formData,
                userIds: formData.sendToAll ? [] : (formData.userIds || [])
            });
            toast.success("Broadcast sent successfully!");
            router.push("/admin/broadcast");
        } catch (error) {
            console.error("Broadcast failed", error);
            toast.error("Failed to send broadcast.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="md:p-6 max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6 md:mb-8">
                <div className="flex items-center gap-4 w-full">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                    >
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Create Broadcast</h1>
                        <p className="text-gray-500 text-sm md:text-base">Compose and send a new announcement.</p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSendClick} className="p-4 md:p-6 space-y-4 md:space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter notification title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2342] focus:border-transparent outline-none text-sm md:text-base"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message Body</label>
                        <textarea
                            name="body"
                            value={formData.body}
                            onChange={handleInputChange}
                            placeholder="Type your message here..."
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2342] focus:border-transparent outline-none resize-none text-sm md:text-base"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 mb-4">
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    checked={formData.sendToAll}
                                    onChange={() => handleRecipientTypeChange(true)}
                                    className="w-4 h-4 text-[#0A2342] focus:ring-[#0A2342]"
                                />
                                <div className="flex items-center gap-2">
                                    <Bell size={18} className="text-gray-500" />
                                    <span className="text-gray-700 font-medium text-sm md:text-base">All Users</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer p-3 border rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto">
                                <input
                                    type="radio"
                                    name="recipientType"
                                    checked={!formData.sendToAll}
                                    onChange={() => handleRecipientTypeChange(false)}
                                    className="w-4 h-4 text-[#0A2342] focus:ring-[#0A2342]"
                                />
                                <div className="flex items-center gap-2">
                                    <Users size={18} className="text-gray-500" />
                                    <span className="text-gray-700 font-medium text-sm md:text-base">Specific Users</span>
                                </div>
                            </label>
                        </div>

                        {!formData.sendToAll && (
                            <div className="space-y-2">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Select Target Personnel
                                </label>
                                <InfiniteSearchableMultiSelect 
                                    selectedValues={formData.userIds || []}
                                    onChange={handleUserSelectionChange}
                                    onSearch={handleUserSearch}
                                    placeholder="Search and select users..."
                                />
                                <div className="flex justify-between items-center px-1">
                                    <p className="text-[11px] text-gray-400">
                                        Search by name or email. Scroll down for more results.
                                    </p>
                                    <p className="text-xs font-bold text-[#0A2342]">
                                        {formData.userIds?.length || 0} users selected
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                        <div className="flex flex-wrap gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels.includes("push")}
                                    onChange={() => handleChannelChange("push")}
                                    className="w-4 h-4 text-[#0A2342] rounded focus:ring-[#0A2342]"
                                />
                                <span className="text-gray-700 text-sm md:text-base">Push Notification</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels.includes("email")}
                                    onChange={() => handleChannelChange("email")}
                                    className="w-4 h-4 text-[#0A2342] rounded focus:ring-[#0A2342]"
                                />
                                <span className="text-gray-700 text-sm md:text-base">Email</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                        <AlertTriangle size={20} className="shrink-0 mt-0.5" />
                        <p className="leading-relaxed">This message will be sent to <strong>{formData.sendToAll ? "ALL" : formData.userIds?.length || 0}</strong> {formData.sendToAll ? "" : "selected"} registered users.</p>
                    </div>

                    <div className="flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="w-full md:w-auto px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300 text-center"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="w-full md:w-auto px-6 py-2.5 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition-colors font-medium shadow-md flex items-center justify-center gap-2"
                        >
                            <Send size={18} />
                            Preview & Send
                        </button>
                    </div>
                </form>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 md:p-8 max-w-md w-full animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Broadcast?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to send this notification to {formData.sendToAll ? "all users" : <strong>{formData.userIds?.length || 0} specific users</strong>}?
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-200 overflow-hidden">
                            <p className="font-bold text-gray-900 text-sm mb-1 truncate">{formData.title}</p>
                            <p className="text-gray-600 text-sm line-clamp-3">{formData.body}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.channels.map(c => (
                                    <span key={c} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full sm:w-auto px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={confirmSend}
                                disabled={loading}
                                className="w-full sm:w-auto px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? "Sending..." : "Yes, Send Now"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}