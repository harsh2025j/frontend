"use client";

import { CheckCircle2, Clock, FileText, UserPlus } from "lucide-react";

const activities = [
    {
        id: 1,
        type: "user",
        title: "New User Registration",
        description: "Sarah Jenkins completed onboarding.",
        time: "10 mins ago",
        icon: <UserPlus size={16} className="text-[#0B2149]" />,
        iconBg: "bg-blue-50/50",
    },
    {
        id: 2,
        type: "article",
        title: "Article Published",
        description: "'The Future of Legal Tech in India' went live.",
        time: "1 hour ago",
        icon: <FileText size={16} className="text-emerald-600" />,
        iconBg: "bg-emerald-50",
    },
    {
        id: 3,
        type: "approval",
        title: "Pending Approval",
        description: "Adv. Kumar submitted a draft for review.",
        time: "2 hours ago",
        icon: <Clock size={16} className="text-amber-500" />,
        iconBg: "bg-amber-50",
    },
    {
        id: 4,
        type: "system",
        title: "System Update",
        description: "Database backup completed successfully.",
        time: "5 hours ago",
        icon: <CheckCircle2 size={16} className="text-purple-600" />,
        iconBg: "bg-purple-50",
    },
];

export default function RecentActivity() {
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100/60 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] flex flex-col h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
                    Recent Activity
                </h3>
                <button className="text-xs font-bold uppercase tracking-wider text-[#1A73E8] hover:text-[#0B2149] transition-colors bg-blue-50/50 hover:bg-blue-50 px-3 py-1.5 rounded-full">
                    View All
                </button>
            </div>

            <div className="flex-1 space-y-0 relative pl-2">
                {activities.map((activity, index) => (
                    <div key={activity.id} className="relative flex gap-5 group pb-8 last:pb-2">
                        {/* Timeline thin connector */}
                        {index !== activities.length - 1 && (
                            <span
                                className="absolute top-8 left-[19px] -ml-px h-full w-[2px] bg-gradient-to-b from-gray-200 to-transparent group-hover:from-blue-200 transition-colors duration-500"
                                aria-hidden="true"
                            />
                        )}

                        {/* Sleek icon wrapper */}
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full ${activity.iconBg} shrink-0 z-10 shadow-sm border border-white group-hover:scale-110 transition-transform duration-300`}>
                            {activity.icon}
                        </div>

                        <div className="flex-1 pt-1.5">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[13px] font-bold text-slate-800 tracking-wide">{activity.title}</p>
                                <div className="flex items-center text-[11px] uppercase tracking-wider text-slate-400 font-semibold bg-slate-50 px-2 py-0.5 rounded-md">
                                    {activity.time}
                                </div>
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 leading-relaxed">{activity.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
