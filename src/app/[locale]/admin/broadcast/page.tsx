"use client";

import React, { useState } from "react";
import Button from "@/components/ui/Button";
import { broadcastService, BroadcastPayload } from "@/data/services/broadcast-service/broadcastService";
import toast from "react-hot-toast";
import { Send, Bell, X, AlertTriangle } from "lucide-react";

export default function BroadcastPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState<BroadcastPayload>({
        title: "",
        body: "",
        sendToAll: true,
        channels: ["push"] // Default to push, can add email
    });

    const [showConfirm, setShowConfirm] = useState(false);

    // Mock History Data (since no endpoint provided yet)
    // Replace with real data fetch if endpoint becomes available
    const [history, setHistory] = useState<any[]>([]);

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
        setShowConfirm(true);
    };

    const confirmSend = async () => {
        setLoading(true);
        setShowConfirm(false);
        try {
            await broadcastService.sendBroadcast(formData);
            toast.success("Broadcast sent successfully!");
            setIsFormOpen(false);
            // Add to local history for immediate feedback
            setHistory([{ ...formData, timestamp: new Date().toISOString(), status: 'Sent' }, ...history]);
            setFormData({ title: "", body: "", sendToAll: true, channels: ["push"] });
        } catch (error) {
            console.error("Broadcast failed", error);
            toast.error("Failed to send broadcast.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Broadcast Notifications</h1>
                    <p className="text-gray-500">Send announcements to all users via Push or Email.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-[#0A2342] text-white px-4 py-2 rounded-lg hover:bg-[#153a66] transition-colors shadow-md"
                >
                    <Send size={18} />
                    Broadcast Notification
                </button>
            </div>

            {/* Broadcast Form Modal/Section */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Bell size={20} className="text-[#0A2342]" />
                                New Broadcast
                            </h2>
                            <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSendClick} className="p-6 space-y-4">
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
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A2342] focus:border-transparent outline-none resize-none"
                                    required
                                />
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

                            <div className="bg-blue-50 p-3 rounded-lg flex gap-3 text-sm text-blue-800">
                                <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                                <p>This message will be sent to <strong>ALL</strong> registered users. This action cannot be undone.</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsFormOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] transition-colors font-medium shadow-md"
                                >
                                    Send Broadcast
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full animate-in fade-in zoom-in duration-200 text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Broadcast?</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to send this notification to all users?
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
