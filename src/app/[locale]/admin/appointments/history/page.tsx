"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import {
    Users,
    Search,
    Calendar,
    Clock,
    Mail,
    Phone,
    User as UserIcon,
    ChevronRight,
    Plus,
    History,
    MessageSquare,
    ExternalLink,
    Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";
import Loader from "@/components/ui/Loader";
import AdvocateApproachModal from "../components/AdvocateApproachModal";

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
}

interface ClientGroup {
    email: string;
    fullName: string;
    phone: string;
    profilePicture?: string;
    appointments: Appointment[];
    lastAppointmentDate: string;
}

export default function AdminAppointmentHistory() {
    const { user } = useProfileActions();
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClientEmail, setSelectedClientEmail] = useState<string | null>(null);
    const [showApproachModal, setShowApproachModal] = useState(false);

    const fetchData = async () => {
        if (!user?.id && !user?._id) return;
        try {
            setLoading(true);
            const res = await appointmentsService.fetchByAdvocate(user.id || user._id);
            const data = res.data?.data || res.data;
            if (Array.isArray(data)) {
                setAppointments(data);
            }
        } catch (error) {
            console.error("Failed to fetch history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const clientGroups = useMemo(() => {
        const groups: Record<string, ClientGroup> = {};

        appointments.forEach(apt => {
            if (!groups[apt.email]) {
                groups[apt.email] = {
                    email: apt.email,
                    fullName: apt.fullName,
                    phone: apt.phone,
                    profilePicture: apt.profilePicture,
                    appointments: [],
                    lastAppointmentDate: apt.preferredDate
                };
            }
            groups[apt.email].appointments.push(apt);

            // Update last appointment date if newer
            if (new Date(apt.preferredDate) > new Date(groups[apt.email].lastAppointmentDate)) {
                groups[apt.email].lastAppointmentDate = apt.preferredDate;
            }
        });

        // Sort appointments within each group
        Object.values(groups).forEach(group => {
            group.appointments.sort((a, b) => new Date(b.preferredDate).getTime() - new Date(a.preferredDate).getTime());
        });

        return Object.values(groups).sort((a, b) => new Date(b.lastAppointmentDate).getTime() - new Date(a.lastAppointmentDate).getTime());
    }, [appointments]);

    const filteredGroups = clientGroups.filter(group =>
        group.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedClient = useMemo(() =>
        clientGroups.find(g => g.email === selectedClientEmail),
        [clientGroups, selectedClientEmail]);

    if (loading) return <div className="h-[60vh] flex items-center justify-center"><Loader /></div>;

    return (
        <div className="p-6 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-serif text-[#0A2342] tracking-tight">Appointment History</h1>
                    <p className="text-gray-500 mt-2 font-medium">Manage and track all user-wise consultation records</p>
                </div>
                {/* <button
                    onClick={() => setShowApproachModal(true)}
                    className="flex items-center gap-3 px-8 py-4 bg-[#0A2342] text-white text-[11px] font-bold tracking-widest uppercase rounded-2xl shadow-xl hover:shadow-2xl hover:translate-y-[-2px] transition-all"
                >
                    <Plus size={18} />
                    Approach New User
                </button> */}
            </div>

            <div className="relative min-h-[750px]">
                <AnimatePresence mode="wait">
                    {!selectedClient ? (
                        <motion.div
                            key="client-list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-[750px]"
                        >
                            <div className="p-6 border-b border-gray-100 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">All Clients</span>
                                    <span className="px-2.5 py-1 bg-gray-50 rounded-full text-[10px] font-bold text-gray-400 border border-gray-100">
                                        {clientGroups.length} Total
                                    </span>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-12 pr-6 py-3 bg-gray-50 border-2 border-transparent focus:border-[#C9A227]/30 rounded-2xl outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>

                            <div className="flex-grow overflow-y-auto custom-scrollbar">
                                <div className="divide-y divide-gray-50">
                                    {filteredGroups.map((group) => (
                                        <button
                                            key={group.email}
                                            onClick={() => setSelectedClientEmail(group.email)}
                                            className={`w-full p-6 flex items-center gap-4 transition-all hover:bg-gray-50 text-left relative ${selectedClientEmail === group.email ? "bg-blue-50/50" : ""
                                                }`}
                                        >
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 overflow-hidden shadow-sm shrink-0">
                                                {group.profilePicture ? (
                                                    <img src={group.profilePicture} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    group.fullName.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-grow">
                                                <h4 className="text-sm font-bold text-[#0A2342] truncate">{group.fullName}</h4>
                                                <p className="text-[11px] text-gray-400 font-medium truncate mt-0.5">{group.email}</p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[9px] font-bold text-gray-500">
                                                        {group.appointments.length} Bookings
                                                    </span>
                                                    <span className="text-[9px] text-gray-400 font-medium">
                                                        Last: {formatDate(group.lastAppointmentDate)}
                                                    </span>
                                                </div>
                                            </div>
                                            <ChevronRight size={16} className={`text-gray-300 transition-transform ${selectedClientEmail === group.email ? "translate-x-1 text-blue-500" : ""}`} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="client-detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="bg-white border border-gray-200 rounded-[32px] overflow-hidden shadow-sm flex flex-col h-[750px] relative"
                        >
                            {/* Client Detail Header */}
                            <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gray-50/30">
                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                    <button
                                        onClick={() => setSelectedClientEmail(null)}
                                        className="w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#0A2342] transition-colors shadow-sm"
                                        title="Back to client list"
                                    >
                                        <ChevronRight className="rotate-180" size={20} />
                                    </button>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center text-[#0A2342] font-black text-2xl shadow-sm overflow-hidden">
                                            {selectedClient.profilePicture ? (
                                                <img src={selectedClient.profilePicture} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                selectedClient.fullName.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-[#0A2342]">{selectedClient.fullName}</h3>
                                            <div className="flex flex-wrap items-center gap-4 mt-2">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                    <Mail size={14} className="text-[#C9A227]" />
                                                    {selectedClient.email}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                    <Phone size={14} className="text-[#C9A227]" />
                                                    {selectedClient.phone || "No phone provided"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowApproachModal(true)}
                                    className="px-6 py-3 bg-white border border-gray-200 text-[#0A2342] text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all flex items-center gap-2 shadow-sm"
                                >
                                    <Plus size={14} /> New Appointment
                                </button>
                            </div>

                            {/* History Timeline */}
                            <div className="flex-grow overflow-y-auto p-8 custom-scrollbar bg-white">
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <History size={14} /> Full Timeline
                                    </h4>
                                    <div className="relative border-l-2 border-gray-100 ml-3 pl-8 space-y-10">
                                        {selectedClient.appointments.map((apt, idx) => (
                                            <div key={apt.id} className="relative">
                                                <div className="absolute -left-[41px] top-0 w-5 h-5 rounded-full border-4 border-white bg-[#C9A227] shadow-sm z-10" />
                                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-all">
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-bold text-[#0A2342]">
                                                                <Calendar size={14} className="text-[#C9A227]" />
                                                                {formatDate(apt.preferredDate)}
                                                            </div>
                                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-xs font-bold text-[#0A2342]">
                                                                <Clock size={14} className="text-[#C9A227]" />
                                                                {apt.preferredTimeSlot}
                                                            </div>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${apt.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                                                                apt.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                                            }`}>
                                                            {apt.status}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{apt.practiceArea}</div>
                                                        <p className="text-sm text-gray-600 font-medium italic">"{apt.description}"</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showApproachModal && (
                <AdvocateApproachModal
                    advocateId={user?.id || user?._id || ""}
                    onClose={() => setShowApproachModal(false)}
                    onSuccess={fetchData}
                    initialData={selectedClient ? {
                        fullName: selectedClient.fullName,
                        email: selectedClient.email,
                        phone: selectedClient.phone
                    } : undefined}
                />
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
            `}</style>
        </div>
    );
}
