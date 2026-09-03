"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Play, PlayCircle, CheckCircle2, Award, Clock, Flame, TrendingUp, CalendarDays, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { myEnrollments, isLoading } = useAppSelector(state => state.enrollments);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

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
            <p className="text-4xl font-black text-white">1</p>
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
              {[
                { title: "BNS Definitions Discussion", time: "Today, 6:00 PM", tag: "Live Class" },
                { title: "Doubt Clearing: Arrest Rules", time: "Tomorrow, 5:00 PM", tag: "Q&A" }
              ].map((session, i) => (
                <Link key={i} href="/dashboard/learn/criminal-law-package" className="flex gap-4 p-4 rounded-xl bg-[#f8f9fa] border border-[#122340]/5 hover:border-[#C9A227]/30 transition-colors group cursor-pointer block">
                  <div className="w-12 h-12 rounded-lg bg-[#122340]/5 flex flex-col items-center justify-center shrink-0 border border-[#122340]/10">
                    <span className="text-[10px] font-bold text-[#122340]/50 uppercase">Oct</span>
                    <span className="text-lg font-extrabold text-[#122340] leading-none">1{4+i}</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#122340] text-sm mb-1 group-hover:text-[#C9A227] transition-colors">{session.title}</h4>
                    <p className="text-xs font-semibold text-[#122340]/50 flex items-center gap-2">
                      <Clock size={12} /> {session.time}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <button className="w-full mt-6 py-3 rounded-xl font-bold text-[#122340] bg-[#f0f2f5] hover:bg-[#122340]/5 transition-colors text-xs uppercase tracking-widest">
              View Calendar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
