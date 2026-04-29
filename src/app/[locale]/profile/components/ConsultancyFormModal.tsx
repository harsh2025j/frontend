"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Send, Loader2, Check } from "lucide-react";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { toast } from "react-hot-toast";

interface ConsultancyFormModalProps {
    advocateId: string;
    advocateName: string;
    onClose: () => void;
}

export default function ConsultancyFormModal({ advocateId, advocateName, onClose }: ConsultancyFormModalProps) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) {
            toast.error("Please fill all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await profileApi.requestConsultancy({
                advocateId,
                subject,
                message
            });

            if (res.data.success) {
                setSuccess(true);
                toast.success("Request sent successfully!");
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                toast.error(res.data.message || "Failed to send request");
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-[#0A2342]/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white dark:bg-[#0A2342] rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl relative"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="p-8 md:p-10">
                    <h2 className="text-3xl font-serif text-[#0A2342] dark:text-white mb-2">Request Consultancy</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-medium">
                        Send a consultation request to <span className="text-[#C9A227] font-bold">{advocateName}</span>.
                    </p>

                    {success ? (
                        <div className="py-12 text-center">
                            <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-serif text-[#0A2342] dark:text-white mb-2">Request Sent!</h3>
                            <p className="text-sm text-gray-500">The advocate will receive your message via email.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                                <input
                                    type="text"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    placeholder="e.g., Property Dispute Consultation"
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-[#C9A227] rounded-2xl outline-none transition-all text-sm font-semibold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Describe your legal requirement briefly..."
                                    className="w-full px-6 py-4 bg-gray-50 dark:bg-black/20 border-2 border-transparent focus:border-[#C9A227] rounded-2xl outline-none transition-all text-sm font-semibold min-h-[150px] resize-none"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-5 bg-[#0A2342] dark:bg-[#C9A227] text-white text-[11px] font-bold tracking-widest uppercase rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        <span>Sending Request...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Send Request</span>
                                        <Send size={18} />
                                    </>
                                )}
                            </button>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
