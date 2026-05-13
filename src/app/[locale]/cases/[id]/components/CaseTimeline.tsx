"use client";

import React, { useMemo } from "react";
import { formatDate } from "@/utils/dateUtils";
import { 
    Calendar, 
    FileText, 
    CheckCircle2, 
    Clock, 
    Gavel, 
    History,
    Dot
} from "lucide-react";
import { motion } from "framer-motion";

interface TimelineEvent {
    id: string;
    date: string | Date;
    title: string;
    description?: string;
    type: 'milestone' | 'hearing' | 'upcoming' | 'past';
    status?: 'completed' | 'pending' | 'warning';
}

interface CaseTimelineProps {
    caseData: any;
}

const EVENT_TYPE_CONFIG = {
    milestone: {
        icon: <FileText size={16} />,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-100"
    },
    hearing: {
        icon: <Gavel size={16} />,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100"
    },
    upcoming: {
        icon: <Clock size={16} />,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-100"
    },
    past: {
        icon: <History size={16} />,
        color: "text-slate-500",
        bg: "bg-slate-50",
        border: "border-slate-200"
    }
};

export default function CaseTimeline({ caseData }: CaseTimelineProps) {
    const timelineEvents = useMemo(() => {
        const events: TimelineEvent[] = [];

        // 1. Filing Milestone
        if (caseData.filingDate) {
            events.push({
                id: "filing",
                date: caseData.filingDate,
                title: "Case Filed",
                description: `Initial filing of the matter in ${caseData.court || 'Court'}`,
                type: 'milestone',
                status: 'completed'
            });
        }

        // 2. Registration Milestone
        if (caseData.registrationDate) {
            events.push({
                id: "registration",
                date: caseData.registrationDate,
                title: "Case Registered",
                description: `Official registration under No. ${caseData.caseNumber || 'N/A'}`,
                type: 'milestone',
                status: 'completed'
            });
        }

        // 3. Hearing History
        if (Array.isArray(caseData.hearingHistory)) {
            caseData.hearingHistory.forEach((h: any, index: number) => {
                events.push({
                    id: `history-${index}`,
                    date: h.date || h.hearingDate,
                    title: h.purpose || "Hearing Held",
                    description: h.proceedings || h.notes || "Case proceedings recorded",
                    type: 'past',
                    status: 'completed'
                });
            });
        }

        // 4. Past Hearings (if not in history)
        if (caseData.firstHearingDate) {
            const alreadyExists = events.some(e => formatDate(e.date) === formatDate(caseData.firstHearingDate));
            if (!alreadyExists) {
                events.push({
                    id: "first-hearing",
                    date: caseData.firstHearingDate,
                    title: "First Hearing",
                    description: "Initial appearance and notice issuance",
                    type: 'hearing',
                    status: 'completed'
                });
            }
        }

        if (caseData.lastHearingDate) {
            const alreadyExists = events.some(e => formatDate(e.date) === formatDate(caseData.lastHearingDate));
            if (!alreadyExists) {
                events.push({
                    id: "last-hearing",
                    date: caseData.lastHearingDate,
                    title: "Previous Hearing",
                    description: caseData.lastOrderSummary || "Case proceedings updated",
                    type: 'past',
                    status: 'completed'
                });
            }
        }

        // 5. Next Hearing (Upcoming)
        if (caseData.nextHearingDate) {
            events.push({
                id: "next-hearing",
                date: caseData.nextHearingDate,
                title: `Next Hearing: ${caseData.nextHearingPurpose || 'Proceedings'}`,
                description: `Scheduled for stage: ${caseData.stageOfCase || 'Pending'}`,
                type: 'upcoming',
                status: 'pending'
            });
        }

        // 6. Judgment
        if (caseData.judgmentDate) {
            events.push({
                id: "judgment",
                date: caseData.judgmentDate,
                title: "Final Judgment",
                description: caseData.disposalNature || "Matter Disposed",
                type: 'milestone',
                status: 'completed'
            });
        }

        // Sort chronologically
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [caseData]);

    if (timelineEvents.length === 0) return null;

    return (
        <div className="mt-10">
            <h3 className="text-sm font-black text-amber-700 uppercase tracking-[0.2em] border-b-2 border-amber-100 pb-2 mb-8 flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Interactive Case Timeline
            </h3>

            <div className="relative pl-4 sm:pl-8 space-y-0">
                {/* Vertical Line */}
                <div className="absolute left-[23px] sm:left-[39px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-100 via-amber-100 to-emerald-100 rounded-full" />

                {timelineEvents.map((event, index) => {
                    const config = EVENT_TYPE_CONFIG[event.type] || EVENT_TYPE_CONFIG.past;
                    const isUpcoming = event.type === 'upcoming';

                    return (
                        <motion.div 
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="relative pb-10 group"
                        >
                            {/* Timeline Node */}
                            <div className={`absolute left-0 sm:left-4 z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-4 border-white shadow-xl transition-all duration-300 group-hover:scale-110 ${config.bg} ${config.color} ${config.border}`}>
                                {config.icon}
                                {event.status === 'completed' && (
                                    <div className="absolute -top-1 -right-1 bg-white rounded-full">
                                        <CheckCircle2 size={12} className="text-emerald-500" />
                                    </div>
                                )}
                            </div>

                            {/* Content Card */}
                            <div className="ml-16 sm:ml-20">
                                <div className={`p-5 rounded-2xl border transition-all duration-300 ${isUpcoming ? 'bg-white border-emerald-200 shadow-lg shadow-emerald-900/5' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                                                {event.type}
                                            </span>
                                            <h4 className={`text-sm font-bold ${isUpcoming ? 'text-emerald-900' : 'text-[#0A2342]'}`}>
                                                {event.title}
                                            </h4>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <Calendar size={12} />
                                            <span className="text-[10px] font-bold uppercase tracking-tight">
                                                {formatDate(event.date)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {event.description && (
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                            {event.description}
                                        </p>
                                    )}

                                    {isUpcoming && (
                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="flex -space-x-2">
                                                {[1, 2].map((i) => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-emerald-100 flex items-center justify-center text-[8px] font-bold text-emerald-600">
                                                        JD
                                                    </div>
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Advocates Assigned</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="mt-6 flex items-center justify-center gap-8 text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                <div className="flex items-center gap-1.5"><Dot className="text-blue-400" /> Milestone</div>
                <div className="flex items-center gap-1.5"><Dot className="text-amber-400" /> Hearing</div>
                <div className="flex items-center gap-1.5"><Dot className="text-emerald-400" /> Upcoming</div>
            </div>
        </div>
    );
}
