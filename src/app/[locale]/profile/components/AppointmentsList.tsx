"use client";

import { useEffect, useState, useRef } from "react";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import { Calendar, Clock, Mail, Phone, User, CheckCircle, XCircle, Clock3, MoreVertical, ExternalLink, X, MapPin, Hash, Briefcase, List, LayoutGrid, AlertCircle, UploadCloud, Trash2, FileText, Image } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";
import toast from "react-hot-toast";
import AppointmentCalendar from "./AppointmentCalendar";

interface Appointment {
  id: string;
  fullName: string;
  advocateId?: string;
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
  appointmentType?: string;
  negotiationOpinion?: string;
  advocateNote?: string;
  finalPrice?: string;
  clientDocumentNote?: string;
  clientDocuments?: string[];
  cancellationReason?: string;
}

interface AppointmentsListProps {
  advocateId?: string;
  clientEmail?: string;
  onUpdateUnread?: () => void;
  hideCalendar?: boolean;
  filterType?: 'unconfirmed' | 'upcoming-confirmed' | 'history';
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

  // Advocate action panel states
  const [actionPanel, setActionPanel] = useState<'none' | 'confirm' | 'reschedule' | 'reject'>('none');
  const [confirmData, setConfirmData] = useState({ finalPrice: '', advocateNote: '' });
  const [rescheduleData, setRescheduleData] = useState({ date: '', time: '', finalPrice: '', advocateNote: '' });
  const [rejectReason, setRejectReason] = useState('');
  // Client action panel
  const [paymentAcknowledged, setPaymentAcknowledged] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isConfirming) return;
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const validFiles: File[] = [];
    for (const file of files) {
      const isLarge = file.size > 5 * 1024 * 1024; // 5MB limit
      const isValidFormat = ["application/pdf", "image/png", "image/jpeg", "image/jpg"].includes(file.type);
      if (isLarge) {
        toast.error(`File "${file.name}" is too large. Max size is 5MB.`);
        continue;
      }
      if (!isValidFormat) {
        toast.error(`File "${file.name}" is invalid format. Only PDF, PNG, JPG/JPEG are supported.`);
        continue;
      }
      validFiles.push(file);
    }
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} file(s)`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, idx) => idx !== index));
  };

  useEffect(() => {
    setSelectedFiles([]);
    setPaymentAcknowledged(false);
  }, [selectedAppointment]);

  const renderDocumentUploadArea = () => {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block ml-1">
          Upload Supporting Documents (Optional)
        </label>
        <div className={`border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center transition-colors bg-gray-50/50 relative group ${isConfirming ? 'opacity-60 cursor-not-allowed' : 'hover:border-[#C9A227]/50 cursor-pointer'}`}>
          <input
            type="file"
            multiple
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleFileChange}
            disabled={isConfirming}
            className={`absolute inset-0 w-full h-full opacity-0 ${isConfirming ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          />
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-150 group-hover:scale-105 transition-transform">
              <UploadCloud size={20} className="text-[#C9A227]" />
            </div>
            <p className="text-xs font-bold text-[#0A2342] mt-1">
              Click or drag files here to upload
            </p>
            <p className="text-[10px] text-gray-400 font-medium">
              PDF, PNG, JPG, or JPEG up to 5MB (multiple files allowed)
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {selectedFiles.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#C9A227]/20 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 bg-gray-50 rounded-lg text-gray-500">
                    {file.type === "application/pdf" ? (
                      <FileText size={16} className="text-red-500" />
                    ) : (
                      <Image size={16} className="text-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {file.name}
                    </p>
                    <p className="text-[9px] text-gray-400 font-semibold">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(idx)}
                  disabled={isConfirming}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const [duration, setDuration] = useState<number>(30);
  const [slots, setSlots] = useState<{ slot: string; isBooked: boolean }[]>([]);
  const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

  useEffect(() => {
    const fetchSlots = async () => {
      const targetAdvocateId = advocateId || selectedAppointment?.advocateId;
      if (!targetAdvocateId || !rescheduleData.date) {
        setSlots([]);
        setAvailabilityMessage("");
        return;
      }
      setSlotsLoading(true);
      setAvailabilityMessage("");
      try {
        const response = await appointmentsService.getAvailableSlots(targetAdvocateId, rescheduleData.date, duration);
        const data = response.data?.data || response.data;
        if (data.isPastDate) {
          setAvailabilityMessage("Selected date is in the past. Please select a valid date.");
          setSlots([]);
        } else if (!data.isWorkingDay) {
          const daysStr = data.workingDays?.join(", ") || "Monday to Saturday";
          setAvailabilityMessage(`Advocate is not available on this day. Working days are: ${daysStr}`);
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
  }, [rescheduleData.date, duration, selectedAppointment?.advocateId, advocateId, actionPanel, isRescheduling]);


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

  const handleAdvocateConfirm = async () => {
    if (!selectedAppointment) return;
    if (confirmData.finalPrice) {
      const price = parseFloat(confirmData.finalPrice);
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid, non-negative consultation fee.');
        return;
      }
    }
    try {
      await appointmentsService.confirmWithDetails(selectedAppointment.id, confirmData);
      toast.success('Appointment confirmed — client notified!');
      setActionPanel('none');
      setConfirmData({ finalPrice: '', advocateNote: '' });
      await fetchAppointments();
      onUpdateUnread?.();
    } catch { toast.error('Failed to confirm'); }
  };

  const handleAdvocateReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) {
      toast.error('Date and time required'); return;
    }
    if (rescheduleData.finalPrice) {
      const price = parseFloat(rescheduleData.finalPrice);
      if (isNaN(price) || price < 0) {
        toast.error('Please enter a valid, non-negative consultation fee.');
        return;
      }
    }
    try {
      await appointmentsService.rescheduleWithDetails(selectedAppointment.id, {
        preferredDate: rescheduleData.date,
        preferredTimeSlot: rescheduleData.time,
        finalPrice: rescheduleData.finalPrice,
        advocateNote: rescheduleData.advocateNote,
      });
      toast.success('Reschedule proposal sent to client!');
      setActionPanel('none');
      setRescheduleData({ date: '', time: '', finalPrice: '', advocateNote: '' });
      await fetchAppointments();
    } catch { toast.error('Failed to reschedule'); }
  };

  const handleAdvocateReject = async () => {
    if (!selectedAppointment) return;
    if (!rejectReason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      await appointmentsService.cancelWithReason(selectedAppointment.id, rejectReason);
      toast.success('Appointment rejected — client notified');
      setActionPanel('none'); setRejectReason('');
      await fetchAppointments();
      onUpdateUnread?.();
    } catch { toast.error('Failed to reject'); }
  };

  const handleClientConfirm = async () => {
    if (!selectedAppointment) return;
    if (!paymentAcknowledged) { toast.error('Please acknowledge payment'); return; }
    setIsConfirming(true);
    try {
      const response = await appointmentsService.clientConfirm(selectedAppointment.id, undefined, selectedFiles);
      toast.success('Appointment confirmed! Check your email for details.');
      setPaymentAcknowledged(false); setSelectedFiles([]);
      await fetchAppointments();
      setSelectedAppointment(prev => prev ? { 
        ...prev, 
        status: 'confirmed',
        clientDocuments: response?.data?.clientDocuments || prev.clientDocuments,
        clientDocumentNote: response?.data?.clientDocumentNote || prev.clientDocumentNote
      } : null);
    } catch { 
      toast.error('Failed to confirm'); 
    } finally {
      setIsConfirming(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedAppointment || !rescheduleData.date || !rescheduleData.time) {
      toast.error('Please select both date and time'); return;
    }
    try {
      await appointmentsService.rescheduleWithDetails(selectedAppointment.id, {
        preferredDate: rescheduleData.date,
        preferredTimeSlot: rescheduleData.time,
        finalPrice: rescheduleData.finalPrice,
        advocateNote: rescheduleData.advocateNote,
      });
      toast.success('Reschedule proposal sent to client');
      setIsRescheduling(false);
      setRescheduleData({ date: '', time: '', finalPrice: '', advocateNote: '' });
      await fetchAppointments();
    } catch { toast.error('Failed to reschedule'); }
  };

  const handleClientAccept = async (id: string) => {
    try {
      await appointmentsService.updateStatus(id, 'awaiting_payment');
      await fetchAppointments();
      toast.success('You have accepted the proposal. Please complete payment.');
    } catch { toast.error('Failed'); }
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

                      {selectedAppointment.appointmentType && (
                        <div className="flex items-center gap-3 border-t border-gray-100/50 pt-3">
                          <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                            <Clock size={16} className="text-[#C9A227]" />
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Appointment Type: <span className="text-[#0A2342] normal-case font-semibold">{selectedAppointment.appointmentType}</span></span>
                        </div>
                      )}

                      <div className="space-y-2 border-t border-gray-100/50 pt-3">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Description</label>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                          "{selectedAppointment.description}"
                        </p>
                      </div>

                      {selectedAppointment.negotiationOpinion && (
                        <div className="space-y-2 border-t border-gray-100/50 pt-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Negotiation Expectations / Opinions</label>
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            {selectedAppointment.negotiationOpinion}
                          </p>
                        </div>
                      )}

                      {selectedAppointment.clientDocumentNote && (
                        <div className="space-y-2 border-t border-gray-100/50 pt-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Client Document Note</label>
                          <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            "{selectedAppointment.clientDocumentNote}"
                          </p>
                        </div>
                      )}

                      {selectedAppointment.clientDocuments && selectedAppointment.clientDocuments.length > 0 && (
                        <div className="space-y-2 border-t border-gray-100/50 pt-3">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Uploaded Documents</label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                            {selectedAppointment.clientDocuments.map((docUrl, idx) => {
                              const fileName = docUrl.split("/").pop() || "Document";
                              const fileExt = fileName.split(".").pop()?.toLowerCase() || "";
                              const isPdf = fileExt === "pdf";
                              return (
                                <a
                                  key={idx}
                                  href={docUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-xl hover:bg-gray-50 hover:border-[#C9A227]/30 transition-all group"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-150 text-gray-500">
                                      {isPdf ? (
                                        <FileText size={16} className="text-red-500" />
                                      ) : (
                                        <Image size={16} className="text-blue-500" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-gray-800 truncate max-w-[150px]">
                                        {fileName}
                                      </p>
                                      <span className="text-[8px] font-black uppercase tracking-widest text-[#C9A227]">
                                        View/Download
                                      </span>
                                    </div>
                                  </div>
                                  <ExternalLink size={14} className="text-gray-400 group-hover:text-[#C9A227] transition-colors" />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )}
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
                              onChange={(e) => {
                                setRescheduleData(prev => ({ ...prev, date: e.target.value, time: "" }));
                              }}
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Duration</label>
                            <select
                              value={duration}
                              onChange={(e) => {
                                setDuration(Number(e.target.value));
                                setRescheduleData(prev => ({ ...prev, time: "" }));
                              }}
                              className="w-full px-4 py-2.5 bg-white border border-blue-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                              <option value={30}>30 Mins</option>
                              <option value={60}>1 Hour</option>
                              <option value={120}>2 Hours</option>
                            </select>
                          </div>
                        </div>

                        {availabilityMessage && (
                          <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{availabilityMessage}</span>
                          </div>
                        )}

                        {rescheduleData.date && !availabilityMessage && (
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">Available Time Slots <span className="text-red-500">*</span></label>
                            {slotsLoading ? (
                              <div className="py-4 text-gray-400 text-xs italic flex items-center gap-2">
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400"></div>
                                <span>Retrieving slot availability...</span>
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2 mt-1">
                                {slots.map((s) => {
                                  const isSelected = rescheduleData.time === s.slot;
                                  return (
                                    <button
                                      key={s.slot}
                                      type="button"
                                      disabled={s.isBooked}
                                      onClick={() => {
                                        setRescheduleData(prev => ({ ...prev, time: s.slot }));
                                      }}
                                      className={`py-2 px-3 rounded-lg text-center text-xs font-bold transition-all duration-200 relative group overflow-hidden ${
                                        s.isBooked
                                          ? 'bg-red-50 border border-red-150 text-red-500 opacity-60 cursor-not-allowed'
                                          : isSelected
                                          ? 'bg-emerald-500 text-white border border-emerald-500 shadow-sm shadow-emerald-500/10'
                                          : 'bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                      }`}
                                    >
                                      <span>{s.slot}</span>
                                      {s.isBooked && (
                                        <span className="block text-[7px] font-black uppercase tracking-tighter opacity-80 mt-0.5">Booked</span>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}

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

                  {/* ── ADVOCATE ACTION BAR ── */}
                  {!clientEmail && selectedAppointment.status === 'pending' && (
                    <div className="p-6 border-t border-gray-50 bg-white space-y-3">
                      {actionPanel === 'none' && (
                        <div className="flex gap-2">
                          <button onClick={() => { setActionPanel('confirm'); setConfirmData({ finalPrice: '', advocateNote: '' }); }} className="flex-1 py-3 bg-[#0A2342] text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-[#153a66] transition-all">
                            ✓ Confirm
                          </button>
                          <button onClick={() => { setActionPanel('reschedule'); setRescheduleData({ date: '', time: '', finalPrice: '', advocateNote: '' }); }} className="flex-1 py-3 bg-white text-[#0A2342] border border-gray-200 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all">
                            ↺ Reschedule
                          </button>
                          <button onClick={() => { setActionPanel('reject'); setRejectReason(''); }} className="px-5 py-3 bg-white text-red-600 border border-red-100 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">
                            ✕ Reject
                          </button>
                        </div>
                      )}
                      {actionPanel === 'confirm' && (
                        <div className="space-y-3 p-4 bg-green-50 rounded-2xl border border-green-100">
                          <p className="text-[10px] font-black text-green-700 uppercase tracking-widest">Confirm Appointment</p>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-green-700 uppercase tracking-widest block ml-1">Final Consultation Fee (Flat fee for the booking duration)</label>
                            <input
                              type="number"
                              min="0"
                              value={confirmData.finalPrice}
                              onChange={e => {
                                const val = e.target.value;
                                const cleanVal = val.replace(/[^0-9.]/g, '');
                                setConfirmData(p => ({ ...p, finalPrice: cleanVal }));
                              }}
                              onKeyDown={e => {
                                if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                  e.preventDefault();
                                }
                              }}
                              placeholder="e.g. 1500"
                              className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-green-700 uppercase tracking-widest block ml-1">Note to Client (Documents needed, instructions...)</label>
                            <textarea
                              value={confirmData.advocateNote}
                              onChange={e => setConfirmData(p => ({ ...p, advocateNote: e.target.value }))}
                              placeholder="List any documents needed or instructions for the client..."
                              rows={3}
                              className="w-full px-4 py-2.5 bg-white border border-green-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-400 resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleAdvocateConfirm} className="flex-1 py-2.5 bg-green-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all">Send Confirmation</button>
                            <button onClick={() => setActionPanel('none')} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl text-[10px] uppercase tracking-widest">Cancel</button>
                          </div>
                        </div>
                      )}
                      {actionPanel === 'reschedule' && (
                        <div className="space-y-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                          <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Propose New Schedule</p>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">New Date</label>
                              <input
                                type="date"
                                value={rescheduleData.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setRescheduleData(p => ({ ...p, date: e.target.value, time: "" }))}
                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest">Duration</label>
                              <select
                                value={duration}
                                onChange={(e) => {
                                  setDuration(Number(e.target.value));
                                  setRescheduleData(p => ({ ...p, time: "" }));
                                }}
                                className="w-full px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                              >
                                <option value={30}>30 Mins</option>
                                <option value={60}>1 Hour</option>
                                <option value={120}>2 Hours</option>
                              </select>
                            </div>
                          </div>

                          {availabilityMessage && (
                            <div className="p-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 flex-shrink-0" />
                              <span>{availabilityMessage}</span>
                            </div>
                          )}

                          {rescheduleData.date && !availabilityMessage && (
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-blue-600 uppercase tracking-widest block">Available Time Slots</label>
                              {slotsLoading ? (
                                <div className="py-4 text-gray-400 text-xs italic flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-gray-400"></div>
                                  <span>Retrieving slot availability...</span>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 gap-2 mt-1">
                                  {slots.map((s) => {
                                    const isSelected = rescheduleData.time === s.slot;
                                    return (
                                      <button
                                        key={s.slot}
                                        type="button"
                                        disabled={s.isBooked}
                                        onClick={() => {
                                          setRescheduleData(p => ({ ...p, time: s.slot }));
                                        }}
                                        className={`py-2 px-3 rounded-lg text-center text-xs font-bold transition-all duration-200 relative group overflow-hidden ${
                                          s.isBooked
                                            ? 'bg-red-50 border border-red-150 text-red-500 opacity-60 cursor-not-allowed'
                                            : isSelected
                                            ? 'bg-emerald-500 text-white border border-emerald-500 shadow-sm shadow-emerald-500/10'
                                            : 'bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                        }`}
                                      >
                                        <span>{s.slot}</span>
                                        {s.isBooked && (
                                          <span className="block text-[7px] font-black uppercase tracking-tighter opacity-80 mt-0.5">Booked</span>
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-blue-700 uppercase tracking-widest block ml-1">Final Consultation Fee (Flat fee for the booking duration)</label>
                            <input
                              type="number"
                              min="0"
                              value={rescheduleData.finalPrice}
                              onChange={e => {
                                const val = e.target.value;
                                const cleanVal = val.replace(/[^0-9.]/g, '');
                                setRescheduleData(p => ({ ...p, finalPrice: cleanVal }));
                              }}
                              onKeyDown={e => {
                                if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                                  e.preventDefault();
                                }
                              }}
                              placeholder="e.g. 1500"
                              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-blue-700 uppercase tracking-widest block ml-1">Note to Client (Reason for Reschedule & Documents Needed to Send)</label>
                            <textarea
                              value={rescheduleData.advocateNote}
                              onChange={e => setRescheduleData(p => ({ ...p, advocateNote: e.target.value }))}
                              placeholder="Provide the reason for the reschedule and specify if any documents need to be sent by the client..."
                              rows={2}
                              className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                            />
                          </div>
                          <div className="flex gap-2">
                            <button onClick={handleAdvocateReschedule} disabled={!rescheduleData.date || !rescheduleData.time} className={`flex-1 py-2.5 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest transition-colors ${!rescheduleData.date || !rescheduleData.time ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}>Send Proposal</button>
                            <button onClick={() => setActionPanel('none')} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl text-[10px] uppercase tracking-widest">Cancel</button>
                          </div>
                        </div>
                      )}
                      {actionPanel === 'reject' && (
                        <div className="space-y-3 p-4 bg-red-50 rounded-2xl border border-red-100">
                          <p className="text-[10px] font-black text-red-700 uppercase tracking-widest">Reject Appointment</p>
                          <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason for rejection (required — shown to client)…" rows={3} className="w-full px-4 py-2.5 bg-white border border-red-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-400 resize-none" />
                          <div className="flex gap-2">
                            <button onClick={handleAdvocateReject} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all">Confirm Rejection</button>
                            <button onClick={() => setActionPanel('none')} className="px-4 py-2.5 bg-white border border-gray-200 text-gray-500 font-bold rounded-xl text-[10px] uppercase tracking-widest">Cancel</button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {!clientEmail && selectedAppointment.status !== 'pending' && (
                    <div className="px-6 py-4 border-t border-gray-50 bg-gray-50/50 flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${selectedAppointment.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : selectedAppointment.status === 'awaiting_payment' ? 'bg-amber-50 text-amber-700 border-amber-200' : selectedAppointment.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {selectedAppointment.status === 'awaiting_payment' ? 'Awaiting Client Payment' : selectedAppointment.status}
                      </span>
                    </div>
                  )}

                  {/* ── CLIENT ACTION BAR: proposed → accept/decline ── */}
                  {!!clientEmail && selectedAppointment.status === 'proposed' && (
                    <div className="p-6 border-t border-gray-50 bg-white space-y-4">
                      <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 space-y-1">
                        <p className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Advocate Proposed a New Schedule</p>
                        {selectedAppointment.finalPrice && (
                          <p className="text-sm font-bold text-[#0A2342]">
                             💰 Final Consultation Fee: {/^[0-9]+(\.[0-9]+)?$/.test(selectedAppointment.finalPrice.toString().trim()) ? `₹${selectedAppointment.finalPrice}` : selectedAppointment.finalPrice}
                          </p>
                        )}
                        {selectedAppointment.advocateNote && <p className="text-xs text-gray-600 italic">"{selectedAppointment.advocateNote}"</p>}
                      </div>
                      
                      {renderDocumentUploadArea()}
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={paymentAcknowledged} 
                          onChange={e => setPaymentAcknowledged(e.target.checked)} 
                          disabled={isConfirming}
                          className="w-4 h-4 accent-blue-600 rounded disabled:opacity-50" 
                        />
                        <span className="text-xs font-semibold text-gray-700">I acknowledge the payment amount and will complete payment before the appointment.</span>
                      </label>
                      
                      <div className="flex gap-2">
                        <button 
                          onClick={handleClientConfirm} 
                          disabled={!paymentAcknowledged || isConfirming} 
                          className={`flex-grow py-3.5 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all ${paymentAcknowledged && !isConfirming ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} flex items-center justify-center gap-2`}
                        >
                          {isConfirming ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Confirming...
                            </>
                          ) : (
                            'Accept & Confirm Reschedule'
                          )}
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')} 
                          disabled={isConfirming}
                          className="px-5 py-3.5 bg-white text-red-600 border border-red-100 font-bold rounded-xl text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── CLIENT ACTION BAR: awaiting_payment → confirm payment + docs ── */}
                  {!!clientEmail && selectedAppointment.status === 'awaiting_payment' && (
                    <div className="p-6 border-t border-gray-50 bg-white space-y-4">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 space-y-1">
                        <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">✅ Advocate Accepted Your Request</p>
                        {selectedAppointment.finalPrice && (
                          <p className="text-sm font-bold text-[#0A2342]">
                             💰 Amount Due: {/^[0-9]+(\.[0-9]+)?$/.test(selectedAppointment.finalPrice.toString().trim()) ? `₹${selectedAppointment.finalPrice}` : selectedAppointment.finalPrice}
                          </p>
                        )}
                        {selectedAppointment.advocateNote && <p className="text-xs text-gray-600 italic mt-1">"{selectedAppointment.advocateNote}"</p>}
                      </div>
                      
                      {renderDocumentUploadArea()}
                      
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={paymentAcknowledged} 
                          onChange={e => setPaymentAcknowledged(e.target.checked)} 
                          disabled={isConfirming}
                          className="w-4 h-4 accent-amber-600 rounded disabled:opacity-50" 
                        />
                        <span className="text-xs font-semibold text-gray-700">I acknowledge the payment amount and will complete payment before the appointment.</span>
                      </label>
                      <button 
                        onClick={handleClientConfirm} 
                        disabled={!paymentAcknowledged || isConfirming} 
                        className={`w-full py-3.5 font-bold rounded-xl text-[10px] uppercase tracking-widest transition-all ${paymentAcknowledged && !isConfirming ? 'bg-[#0A2342] text-white hover:bg-[#153a66]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'} flex items-center justify-center gap-2`}
                      >
                        {isConfirming ? (
                          <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Confirming...
                          </>
                        ) : (
                          'Confirm Appointment'
                        )}
                      </button>
                    </div>
                  )}

                  {/* ── Cancellation reason display ── */}
                  {selectedAppointment.status === 'cancelled' && selectedAppointment.cancellationReason && (
                    <div className="mx-6 mb-4 p-4 bg-red-50 rounded-2xl border border-red-100">
                      <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Rejection Reason</p>
                      <p className="text-sm text-red-700">{selectedAppointment.cancellationReason}</p>
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
