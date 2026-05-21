"use client";

import { useState, useEffect } from "react";
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
        preferredTimeSlot: "",
        appointmentType: "Case Discussion",
        advocateNote: "",
        advocateId: advocateId,
        status: "proposed" // Advocate initiated, client needs to accept
    });

    const [duration, setDuration] = useState<number>(30);
    const [slots, setSlots] = useState<{ slot: string; isBooked: boolean }[]>([]);
    const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
    const [availabilityMessage, setAvailabilityMessage] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Synchronize initialData when it updates (e.g. loads asynchronously)
    useEffect(() => {
        if (initialData) {
            setFormData(prev => ({
                ...prev,
                fullName: initialData.fullName || prev.fullName,
                email: initialData.email || prev.email,
                phone: initialData.phone || prev.phone,
            }));
        }
    }, [initialData]);

    // Synchronize advocateId when it updates
    useEffect(() => {
        if (advocateId) {
            setFormData(prev => ({ ...prev, advocateId }));
        }
    }, [advocateId]);

    useEffect(() => {
        const fetchSlots = async () => {
            if (!advocateId || !formData.preferredDate) {
                setSlots([]);
                setAvailabilityMessage("");
                return;
            }
            setSlotsLoading(true);
            setAvailabilityMessage("");
            try {
                const response = await appointmentsService.getAvailableSlots(advocateId, formData.preferredDate, duration);
                const data = response.data?.data || response.data;
                if (data.isPastDate) {
                    setAvailabilityMessage("Selected date is in the past. Please select a valid date.");
                    setSlots([]);
                } else if (!data.isWorkingDay) {
                    const daysStr = data.workingDays?.join(", ") || "Monday to Saturday";
                    setAvailabilityMessage(`You are not available on this day. Working days are: ${daysStr}`);
                    setSlots([]);
                } else {
                    setSlots(data.slots || []);
                    if (data.slots && data.slots.length === 0) {
                        setAvailabilityMessage("No available time slots for this date and duration.");
                    }
                }
            } catch (error) {
                console.error("Failed to load slots:", error);
                setAvailabilityMessage("Failed to load slot availability.");
                setSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [advocateId, formData.preferredDate, duration]);

    // Clear preferredTimeSlot on date change
    useEffect(() => {
        setFormData(prev => ({ ...prev, preferredTimeSlot: "" }));
        setErrors(prev => ({ ...prev, preferredTimeSlot: "" }));
    }, [formData.preferredDate]);

    const [loading, setLoading] = useState(false);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        if (!formData.fullName) newErrors.fullName = "Client name is required";
        if (!formData.email) newErrors.email = "Client email is required";
        if (!formData.phone) newErrors.phone = "Client phone is required";
        if (!formData.practiceArea) newErrors.practiceArea = "Practice area is required";
        if (!formData.preferredDate) newErrors.preferredDate = "Proposed date is required";
        if (!formData.preferredTimeSlot) newErrors.preferredTimeSlot = "Proposed time slot is required";
        if (!formData.appointmentType) newErrors.appointmentType = "Appointment type is required";
        if (!formData.description) newErrors.description = "Appointment description is required";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields, including proposed date and time slot");
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
                                <User size={12} /> Client Full Name <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Enter client name"
                                className={`w-full px-5 py-3.5 border-2 rounded-xl outline-none transition-all text-sm font-semibold ${
                                    errors.fullName
                                        ? "border-red-500 bg-red-50/10 focus:border-red-500 text-gray-500"
                                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-transparent"
                                }`}
                                required
                                readOnly
                            />
                            {errors.fullName && (
                                <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.fullName}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Mail size={12} /> Client Email <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="client@example.com"
                                className={`w-full px-5 py-3.5 border-2 rounded-xl outline-none transition-all text-sm font-semibold ${
                                    errors.email
                                        ? "border-red-500 bg-red-50/10 focus:border-red-500 text-gray-500"
                                        : "bg-gray-100 text-gray-500 cursor-not-allowed border-transparent"
                                }`}
                                required
                                readOnly
                            />
                            {errors.email && (
                                <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.email}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Phone size={12} /> Client Phone <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Enter client phone number"
                                className={`w-full px-5 py-3.5 border-2 rounded-xl outline-none transition-all text-sm font-semibold ${
                                    initialData?.phone
                                        ? "bg-gray-100 text-gray-500 cursor-not-allowed border-transparent"
                                        : errors.phone
                                            ? "border-red-500 bg-red-50/10 focus:border-red-500 text-gray-900"
                                            : "border-transparent bg-gray-55 focus:border-[#C9A227] text-gray-900"
                                }`}
                                readOnly={!!initialData?.phone}
                                required
                            />
                            {errors.phone && (
                                <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.phone}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Briefcase size={12} /> Practice Area <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                                type="text"
                                name="practiceArea"
                                value={formData.practiceArea}
                                onChange={handleChange}
                                placeholder="Enter practice area (e.g. Criminal Law)"
                                className={`w-full px-5 py-3.5 border-2 rounded-xl outline-none transition-all text-sm font-semibold ${
                                    errors.practiceArea
                                        ? "border-red-500 bg-red-50/10 focus:border-red-500"
                                        : "border-transparent bg-gray-55 focus:border-[#C9A227]"
                                }`}
                                required
                            />
                            {errors.practiceArea && (
                                <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.practiceArea}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-50">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Calendar size={12} /> Proposed Date <span className="text-red-500 font-bold">*</span>
                            </label>
                            <input
                                type="date"
                                name="preferredDate"
                                value={formData.preferredDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                className={`w-full px-5 py-3.5 border-2 rounded-xl outline-none transition-all text-sm font-semibold ${
                                    errors.preferredDate
                                        ? "border-red-500 bg-red-50/10 focus:border-red-500"
                                        : "border-transparent bg-gray-55 focus:border-[#C9A227]"
                                }`}
                                required
                            />
                            {errors.preferredDate && (
                                <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.preferredDate}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock size={12} /> Appointment Duration
                            </label>
                            <div className="flex gap-2">
                                {[
                                    { label: "30 Mins", value: 30 },
                                    { label: "1 Hour", value: 60 },
                                    { label: "2 Hours", value: 120 }
                                ].map((item) => (
                                    <button
                                        key={item.value}
                                        type="button"
                                        onClick={() => {
                                            setDuration(item.value);
                                            setFormData(prev => ({ ...prev, preferredTimeSlot: "" }));
                                        }}
                                        className={`flex-1 py-3 px-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-300 ${duration === item.value ? 'bg-[#0A2342] text-white border-[#0A2342] shadow-md shadow-[#0A2342]/10' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {availabilityMessage && (
                        <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                            <span>{availabilityMessage}</span>
                        </div>
                    )}

                    {formData.preferredDate && !availabilityMessage && (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Clock size={12} /> Available Time Slots <span className="text-red-500 font-bold">*</span>
                            </label>
                            {slotsLoading ? (
                                <div className="py-6 text-gray-400 text-xs italic flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0A2342]"></div>
                                    <span>Retrieving slot availability...</span>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                                        {slots.map((s) => {
                                            const isSelected = formData.preferredTimeSlot === s.slot;
                                            return (
                                                <button
                                                    key={s.slot}
                                                    type="button"
                                                    disabled={s.isBooked}
                                                    onClick={() => {
                                                        setFormData(prev => ({ ...prev, preferredTimeSlot: s.slot }));
                                                        if (errors.preferredTimeSlot) {
                                                            setErrors(prev => ({ ...prev, preferredTimeSlot: "" }));
                                                        }
                                                    }}
                                                    className={`py-3 px-4 rounded-xl text-center text-xs font-bold transition-all duration-300 relative group overflow-hidden ${s.isBooked
                                                            ? 'bg-red-50 border border-red-150 text-red-500 opacity-60 cursor-not-allowed'
                                                            : isSelected
                                                                ? 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-md shadow-emerald-500/20'
                                                                : 'bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200'
                                                        }`}
                                                >
                                                    <span>{s.slot}</span>
                                                    {s.isBooked && (
                                                        <span className="block text-[8px] font-black uppercase tracking-tighter opacity-80 mt-0.5">Booked</span>
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {errors.preferredTimeSlot && (
                                        <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.preferredTimeSlot}</p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="space-y-2 relative">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                            <Clock size={12} /> Type of Appointment <span className="text-red-500 font-bold">*</span>
                        </label>
                        <input
                            type="text"
                            name="appointmentType"
                            value={formData.appointmentType}
                            onChange={handleChange}
                            onFocus={() => setShowTypeSuggestions(true)}
                            onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                            placeholder="e.g. Case Discussion, Legal Query, Document Review"
                            className={`w-full px-5 py-3.5 border-2 rounded-xl outline-none transition-all text-sm font-semibold ${
                                errors.appointmentType
                                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                                    : "border-transparent bg-gray-55 focus:border-[#C9A227]"
                            }`}
                            required
                        />
                        {errors.appointmentType && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.appointmentType}</p>
                        )}
                        {showTypeSuggestions && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-2 max-h-60 overflow-y-auto">
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider px-3 py-1">Suggestions (Click to select or type your own)</p>
                                {[
                                    "Case Discussion",
                                    "Legal Query / Consultation",
                                    "Document Review",
                                    "Court Representation",
                                    "Contract Drafting",
                                    "Fee Negotiation",
                                    "Other"
                                ].map((suggestion) => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onMouseDown={() => {
                                            setFormData(prev => ({ ...prev, appointmentType: suggestion }));
                                            setErrors(prev => ({ ...prev, appointmentType: "" }));
                                            setShowTypeSuggestions(false);
                                        }}
                                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#C9A227] rounded-lg transition-colors font-medium"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Appointment Description / Notes <span className="text-red-500 font-bold">*</span></label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Provide details about why you are approaching the user..."
                            className={`w-full px-6 py-4 border-2 rounded-2xl outline-none transition-all text-sm font-semibold min-h-[120px] resize-none ${
                                errors.description
                                    ? "border-red-500 bg-red-50/10 focus:border-red-500"
                                    : "border-transparent bg-gray-55 focus:border-[#C9A227]"
                            }`}
                            required
                        />
                        {errors.description && (
                            <p className="text-[11px] text-red-500 font-semibold mt-1 ml-1">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Document Instructions & Payment Notes (Optional)</label>
                        <textarea
                            name="advocateNote"
                            value={formData.advocateNote}
                            onChange={handleChange}
                            placeholder="List documents the client needs to carry/upload, or outline any payment references for the consultation..."
                            className="w-full px-6 py-4 bg-gray-55 border-2 border-transparent focus:border-[#C9A227] rounded-2xl outline-none transition-all text-sm font-semibold min-h-[90px] resize-none"
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
