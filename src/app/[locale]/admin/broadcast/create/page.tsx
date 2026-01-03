"use client";

import React, { useState } from "react";
import { broadcastService, BroadcastPayload } from "@/data/services/broadcast-service/broadcastService";
import toast from "react-hot-toast";
import { Send, Bell, AlertTriangle, Users, Search, Loader, ArrowLeft } from "lucide-react";
import { usersApi } from "@/data/services/users-service/users-service";
import { User } from "@/data/features/users/users.types";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";

export default function CreateBroadcastPage() {
    const router = useRouter();
    const { user: reduxUser } = useProfileActions();
    const user = reduxUser as UserData;

    // --- ALL HOOKS MUST BE DECLARED HERE AT THE TOP ---
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [loading, setLoading] = useState(false);

    // User Selection State
    const [users, setUsers] = useState<User[]>([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
    const [usersFetched, setUsersFetched] = useState(false);

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

    // --- EARLY RETURN LOGIC (MUST BE AFTER ALL HOOKS) ---
    if (!isAuthorized) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader className="animate-spin text-[#0A2342]" size={48} />
            </div>
        );
    }

    // --- HANDLERS ---
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleChannelChange = (channel: string) => {
        const currentChannels = formData.channels;
        if (currentChannels.includes(channel)) {
            setFormData({ ...formData, channels: currentChannels.filter(c => c !== channel) });
        } else {
            setFormData({ ...formData, channels: [...currentChannels, channel] });
        }
    };

    const fetchUsers = async () => {
        if (usersFetched) return;
        setIsLoadingUsers(true);
        try {
            const data = await usersApi.fetchUsers({ isActive: true });
            if (data.success) {
                setUsers(data.data);
                setUsersFetched(true);
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users list");
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleRecipientTypeChange = (sendToAll: boolean) => {
        setFormData({ ...formData, sendToAll });
        if (!sendToAll) {
            fetchUsers();
        }
    };

    const toggleUserSelection = (userId: string) => {
        setSelectedUserIds(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
        u.email.toLowerCase().includes(searchUser.toLowerCase())
    );

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

        if (!formData.sendToAll && selectedUserIds.length === 0) {
            toast.error("Please select at least one user");
            return;
        }
        setShowConfirm(true);
    };

    const confirmSend = async () => {
        setLoading(true);
        setShowConfirm(false);
        try {
            await broadcastService.sendBroadcast({
                ...formData,
                userIds: formData.sendToAll ? [] : selectedUserIds
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
        <div className="p-6 max-w-4xl mx-auto">
            {/* ... Rest of your JSX remains exactly the same ... */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create Broadcast</h1>
                    <p className="text-gray-500">Compose and send a new announcement.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <form onSubmit={handleSendClick} className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter notification title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2342] focus:border-transparent outline-none"
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
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2342] focus:border-transparent outline-none resize-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                        <div className="flex gap-4 mb-4">
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
                                    <span className="text-gray-700 font-medium">All Users</span>
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
                                    <span className="text-gray-700 font-medium">Specific Users</span>
                                </div>
                            </label>
                        </div>

                        {!formData.sendToAll && (
                            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email..."
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#0A2342]"
                                    />
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                    {isLoadingUsers ? (
                                        <div className="flex justify-center py-8 text-gray-400">
                                            <Loader className="w-6 h-6 animate-spin" />
                                        </div>
                                    ) : filteredUsers.length === 0 ? (
                                        <p className="text-center text-sm text-gray-500 py-4">No users found</p>
                                    ) : (
                                        filteredUsers.map(u => (
                                            <label key={u._id} className="flex items-center gap-3 p-3 hover:bg-white rounded-lg cursor-pointer transition-colors border border-transparent hover:border-gray-200">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUserIds.includes(u._id)}
                                                    onChange={() => toggleUserSelection(u._id)}
                                                    className="w-5 h-5 rounded border-gray-300 text-[#0A2342] focus:ring-[#0A2342]"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{u.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{u.email}</p>
                                                </div>
                                            </label>
                                        ))
                                    )}
                                </div>
                                <div className="mt-3 text-sm text-gray-500 text-right font-medium">
                                    {selectedUserIds.length} users selected
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Channels</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels.includes("push")}
                                    onChange={() => handleChannelChange("push")}
                                    className="w-4 h-4 text-[#0A2342] rounded focus:ring-[#0A2342]"
                                />
                                <span className="text-gray-700">Push Notification</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.channels.includes("email")}
                                    onChange={() => handleChannelChange("email")}
                                    className="w-4 h-4 text-[#0A2342] rounded focus:ring-[#0A2342]"
                                />
                                <span className="text-gray-700">Email</span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-800">
                        <AlertTriangle size={20} className="shrink-0" />
                        <p className="leading-relaxed">This message will be sent to <strong>{formData.sendToAll ? "ALL" : selectedUserIds.length}</strong> {formData.sendToAll ? "" : "selected"} registered users.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium border border-gray-300"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition-colors font-medium shadow-md flex items-center gap-2"
                        >
                            <Send size={18} />
                            Preview & Send
                        </button>
                    </div>
                </form>
            </div>

            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Broadcast?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to send this notification to {formData.sendToAll ? "all users" : <strong>{selectedUserIds.length} specific users</strong>}?
                        </p>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left border border-gray-200">
                            <p className="font-bold text-gray-900 text-sm mb-1">{formData.title}</p>
                            <p className="text-gray-600 text-sm line-clamp-2">{formData.body}</p>
                            <div className="mt-2 flex gap-2">
                                {formData.channels.map(c => (
                                    <span key={c} className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                            >
                                No, Cancel
                            </button>
                            <button
                                onClick={confirmSend}
                                disabled={loading}
                                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-md transition-colors flex items-center gap-2"
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