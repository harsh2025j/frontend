"use client";

import React, { useEffect, useState } from "react";
import { appointmentsService, downloadIcsFile } from "@/data/services/appointments-service/appointmentsService";
import { formatDate } from "@/utils/dateUtils";
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Users,
  Plus,
  CheckCircle,
  XCircle,
  CalendarPlus,
  FileText,
  ExternalLink,
  ChevronRight,
  Gavel,
  Briefcase,
  Clock3,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface CaseAppointment {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  practiceArea: string;
  description: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  appointmentType?: string;
  location?: string;
  virtualLink?: string;
  attendees?: string[];
  outcome?: string;
  cancellationReason?: string;
  advocateName?: string;
  profilePicture?: string;
  createdAt: string;
}

interface CaseAppointmentsTabProps {
  caseId: string;
  caseTitle?: string;
  isClientView?: boolean;
}

const APPOINTMENT_TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  'Court Hearing': { icon: <Gavel size={14} />, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
  'Client Meeting': { icon: <Users size={14} />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  'Deposition': { icon: <FileText size={14} />, color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-100' },
  'Mediation Session': { icon: <MessageSquare size={14} />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  'Filing Deadline': { icon: <Clock3 size={14} />, color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
  'Internal Review': { icon: <Briefcase size={14} />, color: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' },
  'Other': { icon: <Calendar size={14} />, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'pending': { label: 'Scheduled', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100' },
  'confirmed': { label: 'Confirmed', color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-100' },
  'completed': { label: 'Completed', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' },
  'cancelled': { label: 'Cancelled', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
  'proposed': { label: 'Proposed', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  'rescheduled': { label: 'Rescheduled', color: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-100' },
};

export default function CaseAppointmentsTab({ caseId, caseTitle, isClientView = false }: CaseAppointmentsTabProps) {
  const [appointments, setAppointments] = useState<CaseAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<CaseAppointment | null>(null);
  const [outcomeText, setOutcomeText] = useState("");
  const [savingOutcome, setSavingOutcome] = useState(false);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await appointmentsService.fetchByCase(caseId);
      const data = response.data?.data || response.data;
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch case appointments", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (caseId) fetchAppointments();
  }, [caseId]);

  const handleSaveOutcome = async (id: string) => {
    if (!outcomeText.trim()) return;
    try {
      setSavingOutcome(true);
      await appointmentsService.updateOutcome(id, outcomeText);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, outcome: outcomeText } : a));
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, outcome: outcomeText } : null);
      }
      setOutcomeText("");
      toast.success("Outcome saved successfully");
    } catch (e) {
      toast.error("Failed to save outcome");
    } finally {
      setSavingOutcome(false);
    }
  };

  const handleAddToCalendar = (apt: CaseAppointment) => {
    downloadIcsFile(apt);
    toast.success("Calendar file downloaded");
  };

  const getTypeConfig = (type?: string) => APPOINTMENT_TYPE_CONFIG[type || 'Other'] || APPOINTMENT_TYPE_CONFIG['Other'];
  const getStatusConfig = (status: string) => STATUS_CONFIG[status] || STATUS_CONFIG['pending'];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0A2342]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <Calendar size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-black text-[#0A2342] uppercase tracking-wider">Case Appointments</h3>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5">
              {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} linked to this case
            </p>
          </div>
        </div>

        {!isClientView && (
          <a
            href={`/en/book-appointment?caseId=${caseId}&caseName=${encodeURIComponent(caseTitle || '')}`}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2342] text-white rounded-xl hover:bg-[#153a66] transition-all shadow-lg shadow-blue-900/10 text-[10px] font-black uppercase tracking-widest"
          >
            <Plus size={14} />
            Schedule Appointment
          </a>
        )}
      </div>

      {/* Empty State */}
      {appointments.length === 0 && (
        <div className="text-center py-20 bg-gray-50/50 rounded-2xl border border-gray-100">
          <Calendar size={40} className="mx-auto text-gray-200 mb-4" />
          <h4 className="text-lg font-semibold text-gray-900">No appointments linked</h4>
          <p className="text-sm text-gray-500 mt-1">
            {isClientView
              ? "No appointments have been scheduled for this case yet."
              : "Schedule an appointment to link it to this case."}
          </p>
        </div>
      )}

      {/* Appointments List */}
      {appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((apt, index) => {
            const typeConfig = getTypeConfig(apt.appointmentType);
            const statusConfig = getStatusConfig(apt.status);
            const isPast = new Date(apt.preferredDate) < new Date();

            return (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => {
                  setSelectedAppointment(apt);
                  setOutcomeText(apt.outcome || "");
                }}
                className={`group relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer ${
                  isPast && apt.status !== 'completed' ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Date Badge */}
                  <div className="flex-shrink-0 w-16 text-center">
                    <div className="bg-gray-50 rounded-xl p-2 border border-gray-100">
                      <span className="block text-[10px] font-bold text-gray-400 uppercase">
                        {new Date(apt.preferredDate).toLocaleDateString('en', { month: 'short' })}
                      </span>
                      <span className="block text-xl font-black text-[#0A2342] leading-tight">
                        {new Date(apt.preferredDate).getDate()}
                      </span>
                      <span className="block text-[9px] font-bold text-gray-400">
                        {new Date(apt.preferredDate).toLocaleDateString('en', { weekday: 'short' })}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold ${typeConfig.bg} ${typeConfig.color} ${typeConfig.border} border`}>
                        {typeConfig.icon}
                        {apt.appointmentType || 'General'}
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        {apt.preferredTimeSlot}
                      </span>
                      {apt.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin size={12} className="text-gray-400" />
                          {apt.location}
                        </span>
                      )}
                      {apt.virtualLink && (
                        <a
                          href={apt.virtualLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700"
                        >
                          <Video size={12} />
                          Virtual Link
                        </a>
                      )}
                      {apt.attendees && apt.attendees.length > 0 && (
                        <span className="flex items-center gap-1.5">
                          <Users size={12} className="text-gray-400" />
                          {apt.attendees.length} attendee{apt.attendees.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Outcome for completed */}
                    {apt.status === 'completed' && apt.outcome && (
                      <div className="mt-2 p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1">Outcome</p>
                        <p className="text-xs text-blue-700 leading-relaxed">{apt.outcome}</p>
                      </div>
                    )}

                    {/* Cancellation reason */}
                    {apt.status === 'cancelled' && apt.cancellationReason && (
                      <div className="mt-2 p-2.5 bg-red-50/50 rounded-lg border border-red-100">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">Cancellation Reason</p>
                        <p className="text-xs text-red-700 leading-relaxed">{apt.cancellationReason}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isClientView && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleAddToCalendar(apt); }}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Add to Calendar"
                      >
                        <CalendarPlus size={16} />
                      </button>
                    )}
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAppointment && (
          <div className="fixed inset-0 z-[100] flex justify-center p-4 pt-24 pb-10 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAppointment(null)}
              className="absolute inset-0 bg-white/40 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl border border-gray-100 overflow-hidden max-h-[80vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-8 pb-5 border-b border-gray-50">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const tc = getTypeConfig(selectedAppointment.appointmentType);
                        return (
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${tc.bg} ${tc.color} ${tc.border} border`}>
                            {tc.icon}
                            {selectedAppointment.appointmentType || 'General'}
                          </span>
                        );
                      })()}
                      {(() => {
                        const sc = getStatusConfig(selectedAppointment.status);
                        return (
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${sc.bg} ${sc.color} ${sc.border}`}>
                            {sc.label}
                          </span>
                        );
                      })()}
                    </div>
                    <h3 className="text-lg font-bold text-[#0A2342]">
                      {selectedAppointment.appointmentType || 'Appointment'} — {formatDate(selectedAppointment.preferredDate)}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedAppointment(null)}
                    className="p-2 rounded-xl hover:bg-gray-50 text-gray-400"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Date</label>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0A2342]">
                      <Calendar size={14} className="text-amber-500" />
                      {formatDate(selectedAppointment.preferredDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Time</label>
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#0A2342]">
                      <Clock size={14} className="text-amber-500" />
                      {selectedAppointment.preferredTimeSlot}
                    </div>
                  </div>
                  {selectedAppointment.location && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Location</label>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#0A2342]">
                        <MapPin size={14} className="text-amber-500" />
                        {selectedAppointment.location}
                      </div>
                    </div>
                  )}
                  {selectedAppointment.virtualLink && (
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Virtual Link</label>
                      <a
                        href={selectedAppointment.virtualLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <Video size={14} />
                        Join Meeting
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>

                {selectedAppointment.attendees && selectedAppointment.attendees.length > 0 && (
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Attendees</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.attendees.map((name, i) => (
                        <span key={i} className="px-3 py-1.5 bg-gray-50 rounded-lg text-xs font-medium text-gray-700 border border-gray-100">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Description</label>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedAppointment.description}</p>
                </div>

                {/* Outcome section for completed appointments */}
                {selectedAppointment.status === 'completed' && (
                  <div className="p-5 bg-blue-50/30 rounded-2xl border border-blue-100">
                    <label className="text-[10px] font-bold text-blue-500 uppercase tracking-widest block mb-2">
                      Outcome / Notes
                    </label>
                    {selectedAppointment.outcome ? (
                      <p className="text-sm text-blue-800 leading-relaxed font-medium">{selectedAppointment.outcome}</p>
                    ) : !isClientView ? (
                      <div className="space-y-3">
                        <textarea
                          value={outcomeText}
                          onChange={(e) => setOutcomeText(e.target.value)}
                          placeholder="Add outcome notes for this appointment..."
                          className="w-full px-4 py-3 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          rows={3}
                        />
                        <button
                          onClick={() => handleSaveOutcome(selectedAppointment.id)}
                          disabled={savingOutcome || !outcomeText.trim()}
                          className="px-5 py-2.5 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                          {savingOutcome ? 'Saving...' : 'Save Outcome'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No outcome recorded yet.</p>
                    )}
                  </div>
                )}

                {/* Cancellation reason */}
                {selectedAppointment.status === 'cancelled' && selectedAppointment.cancellationReason && (
                  <div className="p-5 bg-red-50/30 rounded-2xl border border-red-100">
                    <label className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-2">Cancellation Reason</label>
                    <p className="text-sm text-red-800 leading-relaxed font-medium">{selectedAppointment.cancellationReason}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-50 flex gap-3">
                {isClientView && (
                  <button
                    onClick={() => handleAddToCalendar(selectedAppointment)}
                    className="flex-1 py-3.5 bg-amber-50 text-amber-700 border border-amber-100 font-bold tracking-widest rounded-2xl hover:bg-amber-100 transition-all uppercase text-[10px] flex items-center justify-center gap-2"
                  >
                    <CalendarPlus size={14} />
                    Add to Calendar
                  </button>
                )}
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className={`${isClientView ? 'flex-1' : 'w-full'} py-3.5 bg-gray-50 text-gray-400 font-bold tracking-widest rounded-2xl hover:bg-gray-100 transition-all uppercase text-[10px]`}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
