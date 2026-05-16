"use client";

import { useProfileActions } from "@/data/features/profile/useProfileActions";
import AppointmentsList from "../../../profile/components/AppointmentsList";
import { CheckCircle } from "lucide-react";

export default function ConfirmedAppointmentsPage() {
    const { user } = useProfileActions();

    if (!user) return null;

    return (
        <div className="p-6 lg:p-10 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle size={20} />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Confirmed Appointments</h1>
                    </div>
                    <p className="text-gray-500 text-sm">View all your upcoming confirmed meetings and schedules.</p>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-1">
                <AppointmentsList
                    advocateId={user.id || user._id}
                    filterType="upcoming-confirmed"
                    hideCalendar={true}
                />
            </div>
        </div>
    );
}
