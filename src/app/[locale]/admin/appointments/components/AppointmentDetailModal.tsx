"use client";

import { motion } from "framer-motion";
import { X, Calendar, Clock, Download, ExternalLink, FileText, User, Mail, Phone, Plus } from "lucide-react";
import { formatDate } from "@/utils/dateUtils";

interface Appointment {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    practiceArea: string;
    description: string;
    preferredDate: string;
    preferredTimeSlot: string;
    status: string;
    createdAt: string;
    profilePicture?: string;
    finalPrice?: string;
    advocateNote?: string;
    clientDocumentNote?: string;
    clientDocuments?: string[];
    cancellationReason?: string;
}

interface AppointmentDetailModalProps {
    appointment: Appointment;
    onClose: () => void;
}

export default function AppointmentDetailModal({ appointment, onClose }: AppointmentDetailModalProps) {
    const statusColors: Record<string, string> = {
        confirmed: "bg-green-50 text-green-700 border-green-150",
        cancelled: "bg-red-50 text-red-700 border-red-150",
        pending: "bg-blue-50 text-blue-700 border-blue-150",
        proposed: "bg-amber-50 text-amber-700 border-amber-150",
        rescheduled: "bg-amber-50 text-amber-700 border-amber-150",
        awaiting_payment: "bg-indigo-50 text-indigo-700 border-indigo-150"
    };

    const getFilename = (url: string) => {
        try {
            const decoded = decodeURIComponent(url);
            return decoded.substring(decoded.lastIndexOf('/') + 1);
        } catch {
            return "Document";
        }
    };

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-4 bg-[#0A2342]/60 backdrop-blur-md">
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-100 transition-colors z-10 text-gray-500"
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="p-8 border-b border-gray-100">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Appointment Details</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${statusColors[appointment.status] || "bg-gray-50 text-gray-700 border-gray-150"}`}>
                            {appointment.status}
                        </span>
                    </div>
                    <h2 className="text-2xl font-serif text-[#0A2342]">{appointment.practiceArea}</h2>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-8 custom-scrollbar space-y-6">
                    {/* Time & Date */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-gray-55 rounded-2xl border border-gray-100">
                            <Calendar size={18} className="text-[#C9A227]" />
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Date</p>
                                <p className="text-xs font-bold text-[#0A2342] mt-0.5">{formatDate(appointment.preferredDate)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-55 rounded-2xl border border-gray-100">
                            <Clock size={18} className="text-[#C9A227]" />
                            <div>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Time Slot</p>
                                <p className="text-xs font-bold text-[#0A2342] mt-0.5">{appointment.preferredTimeSlot}</p>
                            </div>
                        </div>
                    </div>

                    {/* Consultation Fee (if set) */}
                    {appointment.finalPrice && (
                        <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 flex justify-between items-center">
                            <span className="text-xs font-bold text-[#0A2342]">💰 Consultation Fee</span>
                            <span className="text-sm font-black text-emerald-700 bg-white border border-emerald-100 px-3 py-1 rounded-xl">
                                {/^[0-9]+(\.[0-9]+)?$/.test(appointment.finalPrice.toString().trim()) ? `₹${appointment.finalPrice}` : appointment.finalPrice}
                            </span>
                        </div>
                    )}

                    {/* Client Info Summary */}
                    <div className="p-6 bg-gray-50/30 rounded-2xl border border-gray-100 space-y-4">
                        <h4 className="text-[10px] font-bold text-[#0A2342] uppercase tracking-widest">Client Contact</h4>
                        <div className="grid sm:grid-cols-3 gap-3">
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold min-w-0">
                                <User size={14} className="text-gray-400 shrink-0" />
                                <span className="truncate">{appointment.fullName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold min-w-0">
                                <Mail size={14} className="text-gray-400 shrink-0" />
                                <span className="truncate">{appointment.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 font-semibold min-w-0">
                                <Phone size={14} className="text-gray-400 shrink-0" />
                                <span className="truncate">{appointment.phone || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Consultation Query / Description</h4>
                        <div className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100">
                            <p className="text-xs text-gray-700 leading-relaxed font-semibold">
                                {appointment.description || "No description provided."}
                            </p>
                        </div>
                    </div>

                    {/* Advocate Notes / Cancellation Reasons */}
                    {appointment.advocateNote && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Advocate Notes / Instructions</h4>
                            <div className="bg-blue-50/30 rounded-2xl p-5 border border-blue-100/50">
                                <p className="text-xs text-blue-900 leading-relaxed font-semibold italic">
                                    "{appointment.advocateNote}"
                                </p>
                            </div>
                        </div>
                    )}

                    {appointment.status === 'cancelled' && appointment.cancellationReason && (
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-bold text-red-600 uppercase tracking-widest ml-1">Cancellation / Rejection Reason</h4>
                            <div className="bg-red-50/50 rounded-2xl p-5 border border-red-100">
                                <p className="text-xs text-red-700 leading-relaxed font-bold">
                                    {appointment.cancellationReason}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Client Documents */}
                    {appointment.clientDocuments && appointment.clientDocuments.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Uploaded Supporting Documents</h4>
                            {appointment.clientDocumentNote && (
                                <p className="text-[11px] text-gray-500 italic ml-1">Note: "{appointment.clientDocumentNote}"</p>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {appointment.clientDocuments.map((docUrl, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3.5 bg-white border border-gray-150 rounded-xl shadow-sm hover:border-[#C9A227]/30 transition-all group">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="p-2 bg-gray-50 rounded-lg text-gray-500 shrink-0">
                                                <FileText size={16} className={docUrl.toLowerCase().endsWith('.pdf') ? "text-red-500" : "text-blue-500"} />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold text-gray-800 truncate max-w-[160px]" title={getFilename(docUrl)}>
                                                    {getFilename(docUrl)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <a
                                                href={docUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                                                title="View document"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                            <a
                                                href={docUrl}
                                                download
                                                className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-gray-700 transition-colors"
                                                title="Download document"
                                            >
                                                <Download size={14} />
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-8 py-4 bg-white border border-gray-200 text-gray-600 text-[11px] font-bold tracking-widest uppercase rounded-2xl hover:bg-gray-100 transition-all shadow-sm"
                    >
                        Close
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
