"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  isToday,
  parseISO,
  startOfDay,
  setHours,
  setMinutes
} from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Search, 
  ChevronDown, 
  Menu,
  Settings,
  HelpCircle,
  MoreVertical,
  Calendar as CalendarIcon,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Appointment {
  id: string;
  fullName: string;
  advocateName?: string;
  email: string;
  phone: string;
  description: string;
  preferredDate: string;
  preferredTimeSlot: string;
  status: string;
  practiceArea: string;
  isRead: boolean;
  createdAt: string;
  profilePicture?: string;
  advocateProfilePicture?: string;
  caseId?: string | null;
}

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  isClientMode?: boolean;
}

export default function AppointmentCalendar({ appointments, onSelectAppointment, isClientMode }: AppointmentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'Day' | 'Week' | 'Month'>('Day');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Time slots for Day view (6 AM to 10 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let i = 0; i <= 24; i++) {
      slots.push(i);
    }
    return slots;
  }, []);

  const appointmentsForCurrentDay = useMemo(() => {
    return appointments.filter(apt => isSameDay(parseISO(apt.preferredDate), currentDate));
  }, [appointments, currentDate]);

  const nextDate = () => {
    if (view === 'Day') setCurrentDate(addDays(currentDate, 1));
    else if (view === 'Month') setCurrentDate(addMonths(currentDate, 1));
  };

  const prevDate = () => {
    if (view === 'Day') setCurrentDate(subDays(currentDate, 1));
    else if (view === 'Month') setCurrentDate(subMonths(currentDate, 1));
  };

  const subDays = (date: Date, days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() - days);
    return d;
  };

  // Mini calendar logic
  const miniCalendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // Helper to parse time string like "10:00 AM"
  const parseTimePosition = (timeStr: string) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    let [_, hours, minutes, ampm] = match;
    let h = parseInt(hours);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    return h + parseInt(minutes) / 60;
  };

  return (
    <div className="flex h-full w-full max-w-full bg-white text-gray-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="flex-shrink-0 border-r border-gray-200 overflow-hidden"
          >
            <div className="p-4 space-y-6">
              {/* Create Button */}
              <button className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow text-sm font-medium text-gray-700">
                <Plus size={24} className="text-blue-600" />
                <span>Create</span>
                <ChevronDown size={14} className="ml-2 text-gray-400" />
              </button>

              {/* Mini Calendar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-gray-700">{format(currentDate, "MMMM yyyy")}</span>
                  <div className="flex gap-1">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={16} /></button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={16} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center">
                  {["S", "M", "T", "W", "T", "F", "S"].map(d => (
                    <span key={d} className="text-[10px] font-medium text-gray-500 py-1">{d}</span>
                  ))}
                  {miniCalendarDays.map(day => (
                    <button
                      key={day.toISOString()}
                      onClick={() => setCurrentDate(day)}
                      className={`text-[10px] py-2 rounded-full flex items-center justify-center transition-colors ${
                        isSameDay(day, currentDate) ? 'bg-blue-600 text-white' : 
                        isToday(day) ? 'text-blue-600 font-bold hover:bg-blue-50' :
                        !isSameMonth(day, currentDate) ? 'text-gray-300' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {format(day, "d")}
                    </button>
                  ))}
                </div>
              </div>


            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-grow flex flex-col min-w-0 w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-2 sm:px-4 sticky top-0 bg-white z-20 flex-shrink-0">
          <div className="flex items-center gap-1 sm:gap-3 overflow-x-auto no-scrollbar">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-600 flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <div className="hidden lg:flex items-center gap-2 mr-2 sm:mr-4 flex-shrink-0">
              <CalendarIcon size={24} className="text-blue-600" />
              <span className="text-xl text-gray-700">Calendar</span>
            </div>
            
            <button 
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors flex-shrink-0"
            >
              Today
            </button>
            
            <div className="flex items-center flex-shrink-0">
              <button onClick={prevDate} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ChevronLeft size={20} /></button>
              <button onClick={nextDate} className="p-1 sm:p-1.5 hover:bg-gray-100 rounded-full text-gray-600"><ChevronRight size={20} /></button>
            </div>
            
            <h2 className="text-lg sm:text-xl font-normal text-gray-700 ml-1 sm:ml-3 whitespace-nowrap flex-shrink-0">
              {format(currentDate, view === 'Month' ? "MMMM yyyy" : "MMMM d, yyyy")}
            </h2>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
            <div className="relative group">
              <button className="flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 hover:bg-gray-100 rounded-md border border-gray-300 text-sm font-medium text-gray-700">
                <span>{view}</span>
                <ChevronDown size={14} />
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-30">
                {['Day', 'Week', 'Month'].map(v => (
                  <button 
                    key={v} 
                    onClick={() => setView(v as any)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-md last:rounded-b-md"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div className="hidden md:flex items-center">
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-600"><Settings size={20} /></button>
              <button className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full text-gray-600"><HelpCircle size={20} /></button>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-grow overflow-y-auto custom-scrollbar relative">
          {view === 'Day' ? (
            <div className="flex h-full min-h-[1440px]">
              {/* Time Labels */}
              <div className="w-16 flex-shrink-0 flex flex-col bg-white">
                {timeSlots.map(hour => (
                  <div key={hour} className="h-16 relative">
                    <span className="absolute -top-2 right-2 text-[10px] text-gray-500 uppercase">
                      {hour === 0 ? '' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Grid Lines & Events */}
              <div className="flex-grow relative border-l border-gray-200">
                {/* Horizontal Lines */}
                {timeSlots.map(hour => (
                  <div key={hour} className="h-16 border-b border-gray-100 last:border-0" />
                ))}

                {/* Current Time Indicator */}
                {isToday(currentDate) && (
                  <div 
                    className="absolute left-0 right-0 z-10 flex items-center"
                    style={{ top: `${(new Date().getHours() + new Date().getMinutes() / 60) * 64}px` }}
                  >
                    <div className="w-3 h-3 rounded-full bg-red-500 -ml-1.5" />
                    <div className="flex-grow h-px bg-red-500" />
                  </div>
                )}

                {/* All-Day Events Area Placeholder */}
                <div className="sticky top-0 h-10 bg-white border-b border-gray-200 z-10 flex items-center px-4">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">All Day</div>
                </div>

                {/* Appointments Blocks */}
                <div className="absolute inset-0 pt-10 px-2 pointer-events-none">
                  {appointmentsForCurrentDay.map(apt => {
                    // Extract start time and duration (assuming 1 hour for now if not specified)
                    const [startStr, endStr] = apt.preferredTimeSlot.split(' - ');
                    const startPos = parseTimePosition(startStr || apt.preferredTimeSlot);
                    let duration = 1; // Default 1 hour
                    if (endStr) {
                      duration = parseTimePosition(endStr) - startPos;
                    }
                    if (duration <= 0) duration = 1;

                    return (
                      <div
                        key={apt.id}
                        onClick={() => onSelectAppointment(apt)}
                        className={`absolute left-4 right-4 rounded-md p-2 border shadow-sm cursor-pointer pointer-events-auto transition-all hover:shadow-md hover:scale-[1.01] group ${
                          apt.status === 'confirmed' ? 'bg-green-600 border-green-700 text-white' :
                          apt.status === 'proposed' ? 'bg-blue-600 border-blue-700 text-white' :
                          apt.status === 'cancelled' ? 'bg-red-50 border-red-200 text-red-700' :
                          'bg-orange-50 border-orange-200 text-orange-700'
                        }`}
                        style={{ 
                          top: `${startPos * 64 + 40}px`, 
                          height: `${duration * 64 - 2}px`,
                          zIndex: 5
                        }}
                      >
                        <div className="flex flex-col h-full overflow-hidden">
                          <p className="text-xs font-bold truncate">
                            {isClientMode ? (apt.advocateName || "Consultation") : apt.fullName}
                          </p>
                          <p className={`text-[10px] opacity-90 truncate ${apt.status === 'cancelled' ? 'text-red-500' : 'text-white/80'}`}>
                            {apt.preferredTimeSlot} • {apt.practiceArea}
                          </p>
                          {duration > 0.7 && (
                             <div className="mt-1 flex items-center gap-1.5">
                               <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                                 <MoreVertical size={8} />
                               </div>
                               <span className="text-[9px] opacity-70">View Details</span>
                             </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
               {/* Simplified Month View for toggle */}
               <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/30">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                    <div key={day} className="py-2 text-center">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-grow">
                   {miniCalendarDays.map(day => (
                     <div 
                      key={day.toISOString()}
                      className={`min-h-[120px] border-b border-r border-gray-100 p-2 flex flex-col gap-1 ${
                        !isSameMonth(day, currentDate) ? 'bg-gray-50/50' : 'bg-white'
                      }`}
                     >
                        <span className={`text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                          isToday(day) ? 'bg-blue-600 text-white' : 'text-gray-700'
                        }`}>
                          {format(day, "d")}
                        </span>
                        <div className="space-y-1">
                          {appointments.filter(a => isSameDay(parseISO(a.preferredDate), day)).slice(0, 3).map(a => (
                            <div key={a.id} className="text-[9px] truncate px-1 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">
                              {a.preferredTimeSlot} {a.fullName}
                            </div>
                          ))}
                        </div>
                     </div>
                   ))}
                </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #dadce0;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #bdc1c6;
        }
      `}</style>
    </div>
  );
}
