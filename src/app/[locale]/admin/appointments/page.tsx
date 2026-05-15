"use client";

import { useEffect, useState } from "react";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import AppointmentsList from "../../profile/components/AppointmentsList";
import { Calendar, Filter } from "lucide-react";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";

export default function AdminAppointmentsPage() {
    const { user } = useProfileActions();
    const [unreadCount, setUnreadCount] = useState(0);
    const [showCaseLinkedOnly, setShowCaseLinkedOnly] = useState(false);

    const fetchUnread = async () => {
        if (user?.id || user?._id) {
            try {
                const res = await appointmentsService.getUnreadCount(user.id || user._id);
                const count = res.data?.data ?? res.data;
                setUnreadCount(typeof count === 'number' ? count : 0);
            } catch (e) {
                console.error(e);
            }
        }
    };

    useEffect(() => {
        fetchUnread();
    }, [user]);

    if (!user) return null;

    return (
        <div className="p-6 lg:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Calendar size={20} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Appointments</h1>
                    </div>
                    <p className="text-gray-500 text-sm">Manage and track all your client booking requests.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Case-linked filter toggle */}
                    <button
                        onClick={() => setShowCaseLinkedOnly(prev => !prev)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest border transition-all ${showCaseLinkedOnly
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'
                            }`}
                    >
                        <Filter size={14} />
                        Case-Linked Only
                    </button>

                    {unreadCount > 0 && (
                        <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-2">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">{unreadCount} New Requests</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-1">
                <AppointmentsList
                    advocateId={user.id || user._id}
                    onUpdateUnread={fetchUnread}
                    filterCaseLinkedOnly={showCaseLinkedOnly}
                />
            </div>
        </div>
    );
}
