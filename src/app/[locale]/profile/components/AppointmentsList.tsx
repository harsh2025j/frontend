"use client";

import { useEffect, useState, useRef } from "react";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import { Calendar, Clock, Mail, Phone, User, CheckCircle, XCircle, Clock3, MoreVertical, ExternalLink, X, MapPin, Hash, Briefcase, List, LayoutGrid } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import AppointmentCalendar from "./AppointmentCalendar";

interface Appointment {
  id: string;
  fullName: string;
  advocateName?: string;
  advocateEmail?: string;
  advocatePhone?: string;
  email: string;
  phone: string;
  practiceArea: string;
  description: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  isRead: boolean;
  createdAt: string;
  profilePicture?: string;
  advocateProfilePicture?: string;
  isAdvocateInitiated?: boolean;
}

interface AppointmentsListProps {
  advocateId?: string;
  clientEmail?: string;
  onUpdateUnread?: () => void;
  hideCalendar?: boolean;
  filterType?: 'unconfirmed' | 'upcoming-confirmed';
}

export default function AppointmentsList({ advocateId, clientEmail, onUpdateUnread, hideCalendar, filterType }: AppointmentsListProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const detailPanelRef = useRef<HTMLDivElement>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const scrollToDetailOnMobile = () => {
    if (window.innerWidth < 1024 && detailPanelRef.current) {
      setTimeout(() => {
        detailPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  const fetchAppointments = async (isLoadMore = false) => {
    try {
      if (isLoadMore) setIsLoadingMore(true);
      else setLoading(true);

      let response;
      const currentPage = isLoadMore ? page + 1 : 1;
      const limit = 10;

      if (clientEmail) {
        response = await appointmentsService.fetchByClient(clientEmail);
      } else if (advocateId) {
        // Pass filterType directly to backend (backend now handles 'unconfirmed' group)
        response = await appointmentsService.fetchByAdvocate(advocateId, currentPage, limit, debouncedSearch, filterType);
      } else {
        return;
      }

      const rawData = response.data?.data || response.data;
      const meta = response.data?.meta;

      let newData = Array.isArray(rawData) ? rawData : (rawData?.data || []);
      
      // Secondary filter for upcoming-confirmed (date check) if not already done by backend
      if (filterType === 'upcoming-confirmed' && Array.isArray(newData)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        newData = newData.filter(a => new Date(a.preferredDate) >= today);
      }

      if (isLoadMore) {
        setAppointments(prev => [...prev, ...newData]);
        setPage(currentPage);
      } else {
        setAppointments(newData);
        setPage(1);
        if (newData.length > 0 && !selectedAppointment) {
            setSelectedAppointment(newData[0]);
        }
      }

      setHasMore(meta ? meta.hasMore : newData.length === limit);
    } catch (error) {
      console.error("Failed to fetch appointments", error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchAppointments(false);
  }, [advocateId, clientEmail, debouncedSearch, filterType]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !loading && viewMode === 'list') {
          fetchAppointments(true);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, loading, viewMode]);


  const handleMarkAsRead = async (id: string) => {
    try {
      await appointmentsService.markRead(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
      onUpdateUnread?.();
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '' });

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await appointmentsService.updateStatus(id, status);
      await fetchAppointments();
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, status } : null);
      }
      toast.success(`Appointment ${status}`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("Failed to update status");
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment) return;
    if (!rescheduleData.date || !rescheduleData.time) {
      toast.error("Please select both date and time");
      return;
    }
    try {
      const response = await appointmentsService.update(selectedAppointment.id, {
        preferredDate: rescheduleData.date,
        preferredTimeSlot: rescheduleData.time,
        status: 'proposed'
      });
      const updated = response.data;
      await fetchAppointments();
      setSelectedAppointment(updated);
      setIsRescheduling(false);
      toast.success("Reschedule proposal sent to client");
    } catch (error) {
      console.error("Failed to reschedule", error);
      toast.error("Failed to reschedule");
    }
  };

  const handleClientAccept = async (id: string) => {
    try {
      await appointmentsService.updateStatus(id, 'confirmed');
      await fetchAppointments();
      if (selectedAppointment?.id === id) {
        setSelectedAppointment(prev => prev ? { ...prev, status: 'confirmed' } : null);
      }
      toast.success("Appointment confirmed!");
    } catch (error) {
      console.error("Failed to confirm appointment", error);
      toast.error("Failed to confirm appointment");
    }
  };


  return (
    <div className="space-y-6">
      {/* Search and View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {viewMode === 'list' && (
          <div className="relative flex-grow max-w-md">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <List size={16} />
            </div>
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-white border-2 border-gray-100 focus:border-[#C9A227]/30 rounded-2xl outline-none transition-all text-sm font-medium shadow-sm"
            />
          </div>
        )}
        
        {!hideCalendar && (
          <div className="flex items-center gap-2 bg-gray-100/50 p-1 rounded-xl border border-gray-100">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white text-[#0A2342] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <List size={14} /> List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'calendar' ? 'bg-white text-[#0A2342] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <LayoutGrid size={14} /> Calendar
            </button>
          </div>
        )}
      </div>

      {viewMode === 'calendar' && !hideCalendar ? (
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[800px]">
          {loading ? (
            <div className="flex-grow flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C9A227]"></div>
            </div>
          ) : (
            <AppointmentCalendar
              appointments={appointments}
              onSelectAppointment={(apt) => {
                setSelectedAppointment(apt);
                if (!apt.isRead) handleMarkAsRead(apt.id);
              }}
              isClientMode={!!clientEmail}
            />
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Scrollable List */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col max-h-[420px] lg:max-h-none lg:h-0 lg:min-h-full">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                {clientEmail ? "My Booking History" : "Upcoming Requests"}
              </span>
              <span className="px-2 py-0.5 bg-gray-50 rounded-full text-[9px] font-bold text-gray-400 border border-gray-100">
                {appointments.length} Total
              </span>
            </div>
            
            <div className="overflow-y-auto custom-scrollbar flex-grow min-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                   <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]"></div>
                </div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-20 px-6">
                   <Calendar size={32} className="mx-auto text-gray-200 mb-3" />
                   <h3 className="text-sm font-bold text-gray-900">No results found</h3>
                   <p className="text-[10px] text-gray-500 mt-1">Try adjusting your search or filters.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {appointments.map((appointment) => (
                    <div
                      key={appointment.id}
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        if (!appointment.isRead) handleMarkAsRead(appointment.id);
                        scrollToDetailOnMobile();
                      }}
                      className={`p-5 transition-all hover:bg-gray-50 cursor-pointer group relative ${selectedAppointment?.id === appointment.id ? "bg-blue-50/60" : ""
                        } ${!appointment.isRead ? "bg-blue-50/20" : ""}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-sm border border-gray-200 overflow-hidden shadow-sm">
                            {clientEmail ? (
                              appointment.advocateProfilePicture ? (
                                <img src={appointment.advocateProfilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (appointment.advocateName || "A").charAt(0).toUpperCase()
                              )
                            ) : (
                              appointment.profilePicture ? (
                                <img src={appointment.profilePicture} alt="" className="w-full h-full object-cover" />
                              ) : (
                                (appointment.fullName || "C").charAt(0).toUpperCase()
                              )
                            )}
                          </div>
                          {!appointment.isRead && (
                            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-blue-600 rounded-full border-2 border-white" />
                          )}
                        </div>
                        <div className="min-w-0 flex-grow">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className={`text-sm font-bold truncate ${selectedAppointment?.id === appointment.id ? "text-[#0A2342]" : "text-gray-900"}`}>
                              {clientEmail ? (appointment.advocateName || "Advocate") : appointment.fullName}
                            </h4>
                            <span className="text-[9px] font-bold text-gray-400 whitespace-nowrap">
                              {formatDate(appointment.preferredDate)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter border ${appointment.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                              appointment.status === 'proposed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                appointment.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                  'bg-orange-50 text-orange-700 border-orange-100'
                              }`}>
                              {appointment.status}
                            </span>
                            <span className="text-[9px] font-medium text-blue-600 truncate">
                              {appointment.practiceArea}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                
                {/* Infinite Scroll Sentinel */}
                <div ref={observerTarget} className="p-4 flex justify-center">
                  {isLoadingMore && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#C9A227]"></div>
                  )}
                  {!hasMore && appointments.length > 0 && (
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">End of list</p>
                  )}
                </div>
              </div>
            )}
            </div>
          </div>

          {/* Right Column: Detailed View */}
          <div ref={detailPanelRef} className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col relative">
            <AnimatePresence mode="wait">
              {selectedAppointment ? (
                <motion.div
                  key={selectedAppointment.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col h-full"
                >
                  {/* Elegant Header */}
                  <div className="p-8 pb-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200/50 flex items-center justify-center text-[#0A2342] font-black text-2xl shadow-sm overflow-hidden">
                        {clientEmail ? (
                          selectedAppointment.advocateProfilePicture ? (
                            <img src={selectedAppointment.advocateProfilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (selectedAppointment.advocateName || "A").charAt(0).toUpperCase()
                          )
                        ) : (
                          selectedAppointment.profilePicture ? (
                            <img src={selectedAppointment.profilePicture} alt="" className="w-full h-full object-cover" />
                          ) : (
                            (selectedAppointment.fullName || "C").charAt(0).toUpperCase()
                          )
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-[#0A2342] tracking-tight">
                          {clientEmail ? (selectedAppointment.advocateName || "Advocate") : selectedAppointment.fullName}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedAppointment.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' :
                            selectedAppointment.status === 'proposed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              selectedAppointment.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-orange-50 text-orange-700 border-orange-100'
                            }`}>
                            {selectedAppointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Scrollable Details */}
                  <div className="flex-grow overflow-y-auto p-8 space-y-8 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          {clientEmail ? "Client Details (Me)" : "Client Details"}
                        </label>
                        <p className="text-sm font-semibold text-[#0A2342]">{selectedAppointment.fullName}</p>
                        <p className="text-xs text-gray-500 font-medium">{selectedAppointment.email}</p>
                        <p className="text-xs text-gray-500 font-medium">{selectedAppointment.phone}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">
                          {clientEmail ? "Advocate Details" : "Contact Number"}
                        </label>
                        {clientEmail ? (
                          <>
                            <p className="text-sm font-semibold text-[#0A2342]">{selectedAppointment.advocateName || "Advocate"}</p>
                            <p className="text-xs text-gray-500 font-medium">{selectedAppointment.advocateEmail}</p>
                            <p className="text-xs text-gray-500 font-medium">{selectedAppointment.advocatePhone}</p>
                          </>
                        ) : (
                          <p className="text-sm font-semibold text-[#0A2342]">{selectedAppointment.phone}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Appointment Date</label>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0A2342]">
                          <Calendar size={14} className="text-[#C9A227]" />
                          {formatDate(selectedAppointment.preferredDate)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Time Slot</label>
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#0A2342]">
                          <Clock size={14} className="text-[#C9A227]" />
                          {selectedAppointment.preferredTimeSlot}
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                          <Briefcase size={16} className="text-[#C9A227]" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case Category: <span className="text-[#0A2342]">{selectedAppointment.practiceArea}</span></span>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Description</label>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                          "{selectedAppointment.description}"
                        </p>
                      </div>
                    </div>

                    {isRescheduling && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-4"
                      >
                        <h4 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest">Suggest New Schedule</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">New Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              value={rescheduleData.date}
                              min={new Date().toISOString().split('T')[0]}
                              className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">New Time <span className="text-red-500">*</span></label>
                            <input
                              type="time"
                              value={rescheduleData.time}
                              className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                              onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                              required
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleReschedule}
                            disabled={!rescheduleData.date || !rescheduleData.time}
                            className={`flex-1 py-2.5 text-[10px] text-white font-bold uppercase tracking-widest rounded-xl transition-colors ${!rescheduleData.date || !rescheduleData.time
                              ? "bg-blue-300 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                              }`}
                          >
                            Send Proposal
                          </button>
                          <button
                            onClick={() => setIsRescheduling(false)}
                            className="px-4 py-2.5 bg-white text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-xl border border-gray-200"
                          >
                            Cancel
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Fixed Bottom Action Bar */}
                  {!clientEmail && (
                    <div className="p-8 border-t border-gray-50 bg-white flex gap-3">
                      {selectedAppointment.status === 'pending' && !isRescheduling && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(selectedAppointment.id, 'confirmed')}
                            className="flex-1 py-3.5 bg-[#0A2342] text-white font-bold tracking-widest rounded-xl hover:bg-[#153a66] transition-all uppercase text-[10px]"
                          >
                            Confirm Appointment
                          </button>
                          <button
                            onClick={() => { setIsRescheduling(true); setRescheduleData({ date: '', time: '' }); }}
                            className="flex-1 py-3.5 bg-white text-[#0A2342] border border-gray-200 font-bold tracking-widest rounded-xl hover:bg-gray-50 transition-all uppercase text-[10px]"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                            className="px-6 py-3.5 bg-white text-red-600 border border-red-50 font-bold tracking-widest rounded-xl hover:bg-red-50 transition-all uppercase text-[10px]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(selectedAppointment.status !== 'pending' || isRescheduling) && (
                        <div className="w-full flex items-center justify-between text-gray-400">
                          <span className="text-[10px] font-bold uppercase tracking-widest">Status: {selectedAppointment.status}</span>
                          {!(selectedAppointment.isAdvocateInitiated && selectedAppointment.status === 'proposed') && (
                            <button
                              onClick={() => handleUpdateStatus(selectedAppointment.id, 'pending')}
                              className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-widest"
                            >
                              Reset to Pending
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {!!clientEmail && selectedAppointment.status === 'proposed' && (
                    <div className="p-8 border-t border-gray-50 bg-white flex gap-3">
                      <button
                        onClick={() => handleClientAccept(selectedAppointment.id)}
                        className="flex-1 py-3.5 bg-green-600 text-white font-bold tracking-widest rounded-xl hover:bg-green-700 transition-all uppercase text-[10px]"
                      >
                        Accept Proposal
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                        className="flex-1 py-3.5 bg-white text-red-600 border border-red-100 font-bold tracking-widest rounded-xl hover:bg-red-50 transition-all uppercase text-[10px]"
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                    <User size={32} className="text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0A2342]">Select an Appointment</h3>
                  <p className="text-sm text-gray-400 mt-2 max-w-xs">Choose an appointment from the list on the left to view full details and manage the booking.</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
}
