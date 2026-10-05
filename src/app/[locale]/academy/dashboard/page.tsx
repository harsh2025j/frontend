"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, PlayCircle, CheckCircle2, Award, Clock, Flame, TrendingUp, CalendarDays, Loader2, Radio, ExternalLink, Calendar } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import { courseApi } from '@/data/services/academy-service/course.service';
import { certificateApi } from '@/data/services/academy-service/certificate.service';
import { formatTime12HourIST } from '@/lib/utils';

function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Row Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <div className="h-9 w-40 bg-slate-200 rounded-xl animate-pulse mb-2.5" />
          <div className="h-4 w-72 bg-slate-200/60 rounded-lg animate-pulse" />
        </div>
        <div className="bg-white px-5 py-2.5 rounded-full border border-[#122340]/10 shadow-sm flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-[#C9A227]/40 animate-pulse" />
          <div className="h-4 w-44 bg-slate-200/80 rounded animate-pulse" />
        </div>
      </div>

      {/* Stats Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat 1 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 animate-pulse" />
            <div className="w-20 h-5 rounded-full bg-green-50 animate-pulse" />
          </div>
          <div className="h-3.5 w-24 bg-slate-200/70 rounded animate-pulse mb-2.5" />
          <div className="h-9 w-16 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Stat 2 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 animate-pulse" />
          </div>
          <div className="h-3.5 w-24 bg-slate-200/70 rounded animate-pulse mb-2.5" />
          <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Stat 3 */}
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 animate-pulse" />
          </div>
          <div className="h-3.5 w-24 bg-slate-200/70 rounded animate-pulse mb-2.5" />
          <div className="h-9 w-20 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        {/* Stat 4 - Dark Navy */}
        <div className="bg-gradient-to-br from-[#122340] to-[#0a1628] rounded-2xl p-6 shadow-xl border border-[#122340]/10">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/20 border border-[#C9A227]/30 animate-pulse" />
          </div>
          <div className="h-3.5 w-28 bg-white/20 rounded animate-pulse mb-2.5" />
          <div className="h-9 w-14 bg-white/30 rounded-lg animate-pulse" />
        </div>
      </div>

      {/* Main 2-Column Grid Skeletons */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Continue Learning Skeleton */}
        <div className="xl:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-1.5 h-5 bg-[#C9A227] rounded-full" />
            <div className="h-5 w-40 bg-slate-200 rounded animate-pulse" />
          </div>

          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#122340]/8 shadow-[0_4px_24px_-4px_rgba(18,35,64,0.06)] flex flex-col md:flex-row gap-6 lg:gap-7">
            {/* Thumbnail skeleton */}
            <div className="w-full md:w-72 lg:w-80 aspect-video md:aspect-auto h-48 rounded-xl bg-slate-200/80 animate-pulse shrink-0 relative flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-300/80 animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="flex-1 flex flex-col justify-between py-1">
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="h-5 w-24 bg-slate-200/70 rounded-md animate-pulse" />
                  <div className="h-5 w-24 bg-slate-200/50 rounded-full animate-pulse" />
                </div>
                <div className="h-6 w-5/6 bg-slate-200 rounded-lg animate-pulse mb-2" />
                <div className="h-4 w-1/2 bg-slate-200/60 rounded animate-pulse mb-5" />
              </div>

              <div className="space-y-4 pt-3 border-t border-[#122340]/8">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3.5 w-28 bg-slate-200/60 rounded animate-pulse" />
                    <div className="h-3.5 w-10 bg-slate-200/80 rounded animate-pulse" />
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-slate-200 h-full w-1/3 rounded-full animate-pulse" />
                  </div>
                </div>
                <div className="h-11 w-40 bg-slate-200 rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Live Sessions Skeleton */}
        <div>
          <div className="bg-white rounded-xl p-6 border border-[#122340]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-3.5 rounded-2xl bg-[#f8f9fa] border border-[#122340]/5">
                  <div className="w-12 h-12 rounded-xl bg-slate-200/70 shrink-0 animate-pulse" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-slate-200/60 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-11 w-full rounded-xl bg-[#f0f2f5] animate-pulse mt-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { myEnrollments, isLoading } = useAppSelector(state => state.enrollments);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [certificatesCount, setCertificatesCount] = useState<number>(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAll = async () => {
      try {
        await Promise.allSettled([
          dispatch(fetchMyEnrollments()),
          certificateApi.mine().then((res: any) => {
            const list = (res?.data ?? res) || [];
            if (isMounted) setCertificatesCount(Array.isArray(list) ? list.length : 0);
          }),
          courseApi.fetchLiveSessions().then((res: any) => {
            const data = res.data?.data || res.data || [];
            if (isMounted) setLiveSessions(Array.isArray(data) ? data : []);
          }),
        ]);
      } catch (e) {
        console.error("Dashboard overview data loading error:", e);
      } finally {
        if (isMounted) {
          setIsInitialLoading(false);
        }
      }
    };

    loadAll();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Filter only sessions belonging to courses the student is actually enrolled in
  const enrolledCourseIdentifiers = new Set<string>();
  myEnrollments.forEach((e) => {
    const status = (e.status || '').toLowerCase();
    if (status !== 'suspended' && status !== 'expired') {
      if (e.courseId) enrolledCourseIdentifiers.add(String(e.courseId).toLowerCase());
      if (e.course?.id) enrolledCourseIdentifiers.add(String(e.course.id).toLowerCase());
      if (e.course?._id) enrolledCourseIdentifiers.add(String(e.course._id).toLowerCase());
      if (e.course?.slug) enrolledCourseIdentifiers.add(String(e.course.slug).toLowerCase());
    }
  });

  const enrolledLiveSessions = liveSessions.filter((s) => {
    if (enrolledCourseIdentifiers.size === 0) return false;
    const sessionCourseId = s.courseId ? String(s.courseId).toLowerCase() : null;
    const nestedCourseId = s.course?.id ? String(s.course.id).toLowerCase() : (s.course?._id ? String(s.course._id).toLowerCase() : null);
    const sessionCourseSlug = s.course?.slug ? String(s.course.slug).toLowerCase() : null;

    return (
      (sessionCourseId && enrolledCourseIdentifiers.has(sessionCourseId)) ||
      (nestedCourseId && enrolledCourseIdentifiers.has(nestedCourseId)) ||
      (sessionCourseSlug && enrolledCourseIdentifiers.has(sessionCourseSlug))
    );
  });

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

  if (isInitialLoading || (isLoading && myEnrollments.length === 0)) {
    return <DashboardOverviewSkeleton />;
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
                ? `/dashboard/learn/${currentlyLiveSession.course.slug}`
                : '/dashboard/live-sessions'
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
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden group  transition-transform duration-300">
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
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden group transition-transform duration-300">
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
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/5 relative overflow-hidden group transition-transform duration-300">
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
        <div className="bg-gradient-to-br from-[#122340] to-[#0a1628] rounded-2xl p-6 shadow-xl border border-[#122340]/10 relative overflow-hidden group transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full -z-10 group-hover:bg-white/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#C9A227]/20 flex items-center justify-center text-[#C9A227] shadow-inner border border-[#C9A227]/30">
              <Award size={24} />
            </div>
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-blue-200/50 uppercase mb-1">Certificates Earned</p>
            <Link href="/dashboard/certificates" className="inline-block hover:opacity-80 transition">
              <p className="text-4xl font-black text-white">{certificatesCount}</p>
            </Link>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Main Resume Block */}
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold text-[#122340] flex items-center gap-2.5">
              <span className="w-1.5 h-5 bg-[#C9A227] rounded-full shadow-xs"></span>
              Continue Learning
            </h2>
          </div>

          {recentEnrollment ? (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#122340]/8 shadow-[0_4px_24px_-4px_rgba(18,35,64,0.06)] hover:shadow-[0_8px_32px_-4px_rgba(18,35,64,0.1)] transition-all duration-300 relative overflow-hidden flex flex-col md:flex-row items-stretch gap-6 lg:gap-7 group">
              {/* Thumbnail Section */}
              <div className="w-full md:w-72 lg:w-80 aspect-video md:aspect-auto rounded-xl overflow-hidden relative shrink-0 bg-slate-900 border border-black/5 shadow-xs">
                <img
                  src={recentEnrollment.course?.thumbnailUrl || "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop"}
                  alt={recentEnrollment.course?.title || "Course"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* High-contrast gradient vignette so text/buttons are 100% readable even over light certificate images */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />

                {/* Bottom Overlay Info Pill */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 text-white">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227] flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <Play size={13} fill="currentColor" className="ml-0.5 text-[#0a1628]" />
                  </div>
                  <span className="text-xs font-bold tracking-wide text-white drop-shadow-md">Video Lesson</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="flex-1 w-full flex flex-col justify-between py-0.5 min-w-0">
                <div>
                  {/* Category & Status Row */}
                  <div className="flex items-center justify-between gap-3 mb-2.5 flex-wrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-[#122340]/5 text-[#122340] text-[11px] font-bold uppercase tracking-wider border border-[#122340]/10">
                      {recentEnrollment.course?.category || "Course"}
                    </span>
                    {recentEnrollment.status === 'completed' || recentEnrollment.progress === 100 ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200/70">
                        <CheckCircle2 size={13} className="text-emerald-600" /> Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200/70">
                        <Clock size={13} className="text-amber-600" /> In Progress
                      </span>
                    )}
                  </div>

                  {/* Course Title */}
                  <h3 className="font-extrabold text-[#122340] text-xl lg:text-2xl mb-1 leading-snug group-hover:text-[#C9A227] transition-colors line-clamp-2">
                    {recentEnrollment.course?.title || "Untitled Course"}
                  </h3>

                  {/* Instructor/Subtitle */}
                  <p className="text-xs text-[#122340]/55 font-medium mb-5">
                    {recentEnrollment.course?.instructor || "Legal Academy Faculty"}
                  </p>
                </div>

                {/* Progress & CTA Area */}
                <div className="space-y-4 pt-3 border-t border-[#122340]/8">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-[#122340]">
                      <span className="text-[#122340]/70 font-semibold">Course Completion</span>
                      <span className="text-[#C9A227] font-mono text-sm font-extrabold">{recentEnrollment.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-[#f0f2f5] rounded-full h-2.5 overflow-hidden shadow-inner border border-slate-200/50">
                      <div
                        className="bg-gradient-to-r from-[#C9A227] to-amber-500 h-full rounded-full relative transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, recentEnrollment.progress || 0))}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center gap-3">
                    <Link href={`/dashboard/learn/${recentEnrollment.course?.slug || ''}`}>
                      <button className="bg-[#122340] hover:bg-[#1c3763] text-white px-7 py-3 rounded-xl font-bold transition-all duration-200 text-xs sm:text-sm flex items-center gap-2 shadow-[0_4px_14px_rgba(18,35,64,0.22)] hover:shadow-[0_6px_20px_rgba(18,35,64,0.3)] hover:-translate-y-0.5 cursor-pointer">
                        <span>{recentEnrollment.status === 'completed' || recentEnrollment.progress === 100 ? 'Review Course' : 'Resume Course'}</span>
                        <span className="text-[#C9A227] font-bold">&rarr;</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-[#122340]/8 shadow-sm text-center">
              <p className="text-[#122340]/60 mb-4 font-medium">You have not enrolled in any courses yet.</p>
              <Link href="/courses">
                <button className="bg-[#C9A227] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#b39022] transition-colors shadow-sm cursor-pointer">
                  Browse Courses &rarr;
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-8">

          {/* Upcoming Live Classes Widget */}
          <div className="bg-white rounded-xl p-6 border border-[#122340]/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
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
                    ? `/dashboard/learn/${session.course.slug}`
                    : '/dashboard/live-sessions';

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
            <Link href="/dashboard/live-sessions" className="block mt-6">
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
