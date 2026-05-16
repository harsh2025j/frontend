"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Loader2, Check, Calendar, Clock, User, Mail, Phone, Briefcase } from "lucide-react";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import { toast } from "react-hot-toast";

interface AdvocateApproachModalProps {
    advocateId: string;
    onClose: () => void;
    onSuccess?: () => void;
    initialData?: {
        fullName: string;
        email: string;
        phone: string;
    };
}

export default function AdvocateApproachModal({ advocateId, onClose, onSuccess, initialData }: AdvocateApproachModalProps) {
    const [formData, setFormData] = useState({
        fullName: initialData?.fullName || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        practiceArea: "",
        description: "",
        preferredDate: "",
        preferredTimeSlot: "10:00",
        advocateId: advocateId,
        status: "proposed" // Advocate initiated, client needs to accept
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.fullName || !formData.email || !formData.practiceArea || !formData.preferredDate || !formData.description) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        try {
            await appointmentsService.createAppointment({
                ...formData,
                isAdvocateInitiated: true
            });
            toast.success("Appointment scheduled and sent to user!");
            onSuccess?.();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to schedule appointment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-[#0A2342]/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-8 border-b border-gray-100">
                    <h2 className="text-2xl font-serif text-[#0A2342]">Schedule with Client</h2>
                    <p className="text-xs text-gray-500 mt-1 font-medium uppercase tracking-widest">Approach a user for a new consultation</p>
                </div>

                <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-8 custom-scrollbar space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <User size={12} /> Client Full Name
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter client name"
                                className="w-full px-5 py-3.5 bg-gray-100 border-2 border-transparent rounded-xl outline-none transition-all text-sm font-semibold text-gray-500 cursor-not-allowed"
                                required
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={12} /> Client Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="client@example.com"
                                className="w-full px-5 py-3.5 bg-gray-100 border-2 border-transparent rounded-xl outline-none transition-all text-sm font-semibold text-gray-500 cursor-not-allowed"
                                required
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={12} /> Client Phone
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+91 0000000000"
                                className="w-full px-5 py-3.5 bg-gray-100 border-2 border-transparent rounded-xl outline-none transition-all text-sm font-semibold text-gray-500 cursor-not-allowed"
                                readOnly
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Briefcase size={12} /> Practice Area
                            </label>
                            <input
                                type="text"
                                name="practiceArea"
                                value={formData.practiceArea}
                                onChange={handleChange}
                                placeholder="Enter practice area (e.g. Criminal Law)"
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] rounded-xl outline-none transition-all text-sm font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={12} /> Proposed Date
                            </label>
                            <input
                                type="date"
                                name="preferredDate"
                                value={formData.preferredDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] rounded-xl outline-none transition-all text-sm font-semibold"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock size={12} /> Time Slot
                            </label>
                            <input
                                type="time"
                                name="preferredTimeSlot"
                                value={formData.preferredTimeSlot}
                                onChange={handleChange}
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] rounded-xl outline-none transition-all text-sm font-semibold"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Appointment Description / Notes</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide details about why you are approaching the user..."
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] rounded-2xl outline-none transition-all text-sm font-semibold min-h-[120px] resize-none"
                            required
                        />
                    </div>
                </form>

                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-4 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold tracking-widest uppercase rounded-2xl hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] py-4 bg-[#0A2342] text-white text-[11px] font-bold tracking-widest uppercase rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        <span>Confirm & Send to User</span>
                    </button>
                </div>
            </motion.div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            `}</style>
        </div>
    );
}
