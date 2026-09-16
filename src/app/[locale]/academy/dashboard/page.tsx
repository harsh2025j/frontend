"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, PlayCircle, CheckCircle2, Award, Clock, Flame, TrendingUp, CalendarDays, Loader2, Radio, ExternalLink, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import { courseApi } from '@/data/services/academy-service/course.service';
import { certificateApi } from '@/data/services/academy-service/certificate.service';
import { formatTime12HourIST } from '@/lib/utils';

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { myEnrollments, isLoading } = useAppSelector(state => state.enrollments);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [certificatesCount, setCertificatesCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await certificateApi.mine();
        const list = (res?.data ?? res) || [];
        setCertificatesCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setCertificatesCount(0);
      }
    })();
  }, []);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const res = await courseApi.fetchLiveSessions();
        const data = res.data?.data || res.data || [];
        setLiveSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Error fetching live sessions for dashboard", e);
      }
    };
    fetchSessions();
  }, []);

  // Filter only sessions belonging to courses the student is actually enrolled in
  const enrolledCourseIds = new Set(myEnrollments.map((e) => e.courseId || e.course?.id));
  const enrolledLiveSessions = liveSessions.filter((s) => enrolledCourseIds.has(s.courseId));

  const currentlyLiveSession = enrolledLiveSessions.find((s) => s.liveData?.status === 'live');
  const upcomingSessions = enrolledLiveSessions.filter((s) => {
    const st = s.liveData?.status || 'scheduled';
    return st === 'scheduled';
  }).slice(0, 3);

  const formatMonthDay = (dateStr?: string) => {
    if (!dateStr) return { month: 'TBD', day: '--' };
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: 'TBD', day: '--' };
      return {
        month: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        day: d.getDate().toString()
      };
    } catch {
      return { month: 'TBD', day: '--' };
    }
  };

  const activeCoursesCount = myEnrollments.length;
  const recentEnrollment = myEnrollments[0]; // Assuming sorted by latest

  if (isLoading && myEnrollments.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 size={32} className="animate-spin text-[#C9A227]" /></div>;
  }
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">Overview</h1>
          <p className="text-[#122340]/60">Track your progress and pick up right where you left off.</p>
        </div>
        <div className="bg-white px-5 py-2.5 rounded-full border border-[#122340]/10 shadow-sm flex items-center gap-3 text-sm font-semibold text-[#122340]">
          <CalendarDays size={18} className="text-[#C9A227]" />
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      {/* Urgent Live Now Banner (Appears whenever any instructor starts a class) */}
      {currentlyLiveSession && (
        <div className="bg-gradient-to-r from-red-600 via-red-500 to-rose-600 text-white rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 animate-pulse border border-red-400">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Radio size={24} className="text-white animate-ping" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
                <span className="w-2 h-2 rounded-full bg-white animate-ping"></span> Live Class In Progress
              </div>
              <h3 className="font-black text-xl text-white">{currentlyLiveSession.title}</h3>
              <p className="text-xs text-white/80 mt-0.5">{currentlyLiveSession.course?.title || "Your Enrolled Course"}</p>
            </div>
          </div>
          <Link
            href={
              currentlyLiveSession.course?.slug
                ? `/academy/dashboard/learn/${currentlyLiveSession.course.slug}`
                : '/academy/dashboard/live-sessions'
            }
          >
            <button className="bg-white text-red-600 hover:bg-white/95 px-7 py-3 rounded-xl font-extrabold shadow-lg hover:shadow-xl transition-all text-sm flex items-center gap-2 cursor-pointer shrink-0">
              Join Live Classroom <ExternalLink size={16} />
            </button>
          </Link>
        </div>
      )}

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
              <PlayCircle size={24} />
            </div>
            <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">+2 this week</span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-[#122340]/40 uppercase mb-1">Active Courses</p>
            <p className="text-4xl font-black text-[#122340]">{activeCoursesCount}</p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -z-10 group-hover:bg-orange-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center text-orange-500 shadow-inner">
              <Flame size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-[#122340]/40 uppercase mb-1">Current Streak</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-[#122340]">5</p>
              <p className="text-[#122340]/60 font-semibold">Days</p>
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-bl-full -z-10 group-hover:bg-purple-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-purple-600 shadow-inner">
              <TrendingUp size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-[#122340]/40 uppercase mb-1">Learning Hours</p>
            <div className="flex items-baseline gap-2">
              <p className="text-4xl font-black text-[#122340]">42</p>
              <p className="text-[#122340]/60 font-semibold">Hours</p>
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-gradient-to-br from-[#122340] to-[#0a1628] rounded-2xl p-6 shadow-xl border border-[#122340]/10 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10 group-hover:bg-white/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227] shadow-inner border border-[#C9A227]/30">
              <Award size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-blue-200/50 uppercase mb-1">Certificates Earned</p>
            <Link href="/academy/dashboard/certificates" className="inline-block hover:opacity-80 transition">
              <p className="text-4xl font-black text-white">{certificatesCount}</p>
            </Link>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Main Resume Block */}
        <div className="xl:col-span-2">
          <h2 className="text-lg font-extrabold text-[#122340] mb-6 flex items-center gap-3">
            <span className="w-1.5 h-6 bg-gradient-to-b from-[#C9A227] to-yellow-600 rounded-full shadow-sm"></span>
            Continue Learning
          </h2>
          
          {recentEnrollment ? (
            <div className="bg-white rounded-3xl p-4 border border-[#122340]/5 shadow-[0_8px_40px_rgb(0,0,0,0.06)] relative overflow-hidden flex flex-col md:flex-row items-center gap-8 group">
              {/* Image section */}
              <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden relative shrink-0">
                <img src={recentEnrollment.course?.thumbnailUrl || "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop"} alt="Course" className="w-full h-full object-cover transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#122340]/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center shadow-lg">
                    <Play size={14} fill="currentColor" className="ml-0.5 text-[#0a1628]" />
                  </div>
                  <span className="text-xs font-bold tracking-wide">Video Lesson</span>
                </div>
              </div>
              
              {/* Content section */}
              <div className="flex-1 w-full pr-4 pb-4 md:pb-0">
                <div className="inline-block bg-[#122340]/5 text-[#122340] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-3 border border-[#122340]/10">
                  {recentEnrollment.course?.category || "Course"}
                </div>
                <h3 className="font-extrabold text-[#122340] text-xl md:text-2xl mb-2 leading-tight">
                  {recentEnrollment.course?.title || "Untitled Course"}
                </h3>
                <p className="text-sm font-medium text-[#122340]/50 mb-6 flex items-center gap-2">
                  <Clock size={16} className="text-[#C9A227]" /> Status: {recentEnrollment.status}
                </p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm font-bold text-[#122340]">
                    <span>Overall Progress</span>
                    <span className="text-[#C9A227]">{recentEnrollment.progress || 0}%</span>
                  </div>
                  <div className="w-full bg-[#f0f2f5] rounded-full h-2.5 overflow-hidden shadow-inner">
                    <div className="bg-gradient-to-r from-[#C9A227] to-yellow-500 h-full rounded-full relative" style={{ width: `${recentEnrollment.progress || 0}%` }}>
                      <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-[shimmer_2s_infinite]"></div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-4">
                  <Link href={`/dashboard/learn/${recentEnrollment.course?.slug || ''}`}>
                    <button className="bg-[#122340] text-white px-8 py-3.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgb(18,35,64,0.39)] hover:shadow-[0_6px_20px_rgba(18,35,64,0.23)] hover:-translate-y-0.5 transition-all duration-200 text-sm">
                      Resume Course
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-[#122340]/5 shadow-sm text-center">
              <p className="text-[#122340]/60 mb-4">You have not enrolled in any courses yet.</p>
              <Link href="/courses">
                <button className="bg-[#C9A227] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#b39022] transition-colors">
                  Browse Courses
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">
          
          {/* Upcoming Live Classes Widget */}
          <div className="bg-white rounded-3xl p-6 border border-[#122340]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-lg font-bold text-[#122340] mb-6 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
              Upcoming Live Sessions
            </h3>
            <div className="space-y-4">
              {upcomingSessions.length === 0 ? (
                <div className="text-center py-8 text-[#122340]/40 text-xs font-semibold">
                  <Calendar size={28} className="mx-auto mb-2 opacity-30 text-[#122340]" />
                  No upcoming live sessions right now.
                </div>
              ) : (
                upcomingSessions.map((session) => {
                  const dateInfo = formatMonthDay(session.liveData?.scheduledDate);
                  const targetHref = session.course?.slug
                    ? `/academy/dashboard/learn/${session.course.slug}`
                    : '/academy/dashboard/live-sessions';

                  return (
                    <Link
                      key={session.id}
                      href={targetHref}
                      className="flex gap-4 p-3.5 rounded-2xl bg-[#f8f9fa] border border-[#122340]/5 hover:border-[#C9A227]/40 hover:bg-white transition-all group cursor-pointer block shadow-sm"
                    >
                      <div className="w-12 h-12 rounded-xl bg-[#122340]/5 flex flex-col items-center justify-center shrink-0 border border-[#122340]/10">
                        <span className="text-[10px] font-extrabold text-[#C9A227] uppercase">{dateInfo.month}</span>
                        <span className="text-base font-black text-[#122340] leading-none">{dateInfo.day}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-[#122340] text-sm mb-1 group-hover:text-[#C9A227] transition-colors truncate">
                          {session.title}
                        </h4>
                        <p className="text-xs font-semibold text-[#122340]/50 flex items-center gap-1.5">
                          <Clock size={12} className="text-[#C9A227]" />
                          {formatTime12HourIST(session.liveData?.scheduledTime)} ({session.liveData?.durationMinutes || 60}m)
                        </p>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
            <Link href="/academy/dashboard/live-sessions" className="block mt-6">
              <button className="w-full py-3 rounded-xl font-bold text-[#122340] bg-[#f0f2f5] hover:bg-[#C9A227] hover:text-white transition-colors text-xs uppercase tracking-widest cursor-pointer shadow-sm">
                View All Live Classes
              </button>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
