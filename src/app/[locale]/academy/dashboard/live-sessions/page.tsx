"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Video,
  Clock,
  ExternalLink,
  Users,
  Tv,
  Radio,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import { courseApi } from '@/data/services/academy-service/course.service';
import { formatTime12HourIST } from '@/lib/utils';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';

type Platform = 'gmeet' | 'zoom' | 'youtube' | 'jitsi';

export default function LiveSessionsPage() {
  const dispatch = useAppDispatch();
  const { myEnrollments, isLoading: isEnrollmentsLoading } = useAppSelector(
    (state) => state.enrollments,
  );
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await courseApi.fetchLiveSessions();
        const data = res.data?.data || res.data || [];
        setSessions(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Failed to load live sessions:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const enrolledCourseIdentifiers = useMemo(() => {
    const ids = new Set<string>();
    myEnrollments.forEach((e) => {
      const status = (e.status || '').toLowerCase();
      if (status !== 'suspended' && status !== 'expired') {
        if (e.courseId) ids.add(String(e.courseId).toLowerCase());
        if (e.course?.id) ids.add(String(e.course.id).toLowerCase());
        if (e.course?._id) ids.add(String(e.course._id).toLowerCase());
        if (e.course?.slug) ids.add(String(e.course.slug).toLowerCase());
      }
    });
    return ids;
  }, [myEnrollments]);

  const upcomingSessions = useMemo(() => {
    if (enrolledCourseIdentifiers.size === 0) return [];
    return sessions.filter((s) => {
      const status = s.liveData?.status || 'scheduled';
      if (status !== 'live' && status !== 'scheduled') return false;
      const sid = s.courseId ? String(s.courseId).toLowerCase() : null;
      const nid = s.course?.id
        ? String(s.course.id).toLowerCase()
        : s.course?._id
        ? String(s.course._id).toLowerCase()
        : null;
      const slug = s.course?.slug ? String(s.course.slug).toLowerCase() : null;
      return (
        (sid && enrolledCourseIdentifiers.has(sid)) ||
        (nid && enrolledCourseIdentifiers.has(nid)) ||
        (slug && enrolledCourseIdentifiers.has(slug))
      );
    });
  }, [sessions, enrolledCourseIdentifiers]);

  const isDataLoading = loading || (isEnrollmentsLoading && myEnrollments.length === 0);
  const liveNow = upcomingSessions.filter((s) => s.liveData?.status === 'live');
  const scheduled = upcomingSessions.filter(
    (s) => (s.liveData?.status || 'scheduled') === 'scheduled',
  );

  return (
    <div className="sa-rise space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="sa-tile flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
            LIVE CLASSES
          </span>
          <h1 className="font-serif text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-[#08172D] sm:text-[1.875rem]">
            Virtual Sessions &amp; Classrooms
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-600">
            Join live, interactive courtroom and lecture sessions with your legal instructors.
          </p>
        </div>
        {upcomingSessions.length > 0 && (
          <div className="shrink-0 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs">
            <span className="font-serif text-lg font-black text-[#08172D]">
              {upcomingSessions.length}
            </span>{' '}
            upcoming
          </div>
        )}
      </div>

      {isDataLoading ? (
        <div className="sa-bento">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="sa-tile sa-col-sm-6 sa-col-lg-6 h-44 animate-pulse"
            >
              <div className="h-4 w-24 rounded bg-slate-200" />
              <div className="mt-3 h-5 w-3/4 rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : upcomingSessions.length === 0 ? (
        <EmptyState hasEnrolments={myEnrollments.length > 0} />
      ) : (
        <>
          {/* Live now section */}
          {liveNow.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider animate-pulse shadow-sm">
                  <Radio size={13} className="animate-pulse" strokeWidth={2.5} />
                  Happening Now ({liveNow.length})
                </span>
              </div>
              <div className="sa-bento">
                {liveNow.map((s) => (
                  <SessionCard key={s.id} session={s} live />
                ))}
              </div>
            </div>
          )}

          {/* Scheduled section */}
          {scheduled.length > 0 && (
            <div className="space-y-3">
              {liveNow.length > 0 && (
                <div className="flex items-center gap-2 pt-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Scheduled Classes ({scheduled.length})
                  </span>
                </div>
              )}
              <div className="sa-bento">
                {scheduled.map((s) => (
                  <SessionCard key={s.id} session={s} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ─────────────────────── Session card ─────────────────────── */

function SessionCard({ session, live = false }: { session: any; live?: boolean }) {
  const liveData = session.liveData || {};
  const platform: Platform =
    (liveData.platform as Platform) ||
    (session.provider as Platform) ||
    (session.fileUrl?.includes('meet.google.com')
      ? 'gmeet'
      : session.fileUrl?.includes('zoom.us')
      ? 'zoom'
      : session.fileUrl?.includes('youtube')
      ? 'youtube'
      : 'jitsi');

  const meetingUrl =
    liveData.meetingUrl ||
    (platform === 'gmeet' || platform === 'zoom' ? session.fileUrl : '');
  const targetUrl = session.course?.slug
    ? `/dashboard/learn/${session.course.slug}`
    : '/dashboard/courses';

  const d = liveData.scheduledDate ? new Date(liveData.scheduledDate) : null;
  const validDate = d && !isNaN(d.getTime());

  const platformMeta = {
    gmeet: {
      label: 'Google Meet',
      Icon: Video,
      pill: 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold',
    },
    zoom: {
      label: 'Zoom',
      Icon: Video,
      pill: 'bg-blue-50 text-blue-800 border border-blue-300 font-bold',
    },
    youtube: {
      label: 'YouTube Live',
      Icon: Tv,
      pill: 'bg-rose-50 text-rose-800 border border-rose-300 font-bold',
    },
    jitsi: {
      label: 'Classroom',
      Icon: Users,
      pill: 'bg-amber-50 text-amber-800 border border-amber-300 font-bold',
    },
  } as const;
  const pMeta = platformMeta[platform];
  const PIcon = pMeta.Icon;

  return (
    <article
      className={`sa-col-sm-6 sa-col-lg-6 flex flex-col gap-4 rounded-2xl p-5 sm:p-6 transition-all relative overflow-hidden bg-white ${
        live
          ? 'border-2 border-red-500 shadow-xl shadow-red-500/10'
          : 'border-2 border-slate-200/90 hover:border-[#B7913A] shadow-sm hover:shadow-xl'
      }`}
    >
      {live && <div className="absolute top-0 left-0 right-0 h-1 bg-red-600" />}

      <div className="flex items-start justify-between gap-3">
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-sm uppercase tracking-wider animate-pulse">
            <Radio size={13} className="animate-pulse" strokeWidth={2.5} />
            Live Now
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${pMeta.pill}`}
          >
            <PIcon size={13} />
            {pMeta.label}
          </span>
        )}

        {/* Date block */}
        <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#08172D] text-center shadow-xs">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#F59E0B]">
            {validDate ? d!.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
          </span>
          <span className="font-serif text-lg font-black leading-none text-white">
            {validDate ? d!.getDate() : '--'}
          </span>
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 font-serif text-[1.125rem] sm:text-[1.2rem] font-bold leading-snug tracking-tight text-[#08172D] group-hover:text-[#8A6100] transition-colors">
          {session.title}
        </h3>
        <p className="mt-1.5 text-xs font-semibold text-slate-600">
          {session.course?.title || 'Academy Course'}
        </p>
      </div>

      <div className="mt-auto flex flex-col xs:flex-row xs:items-center justify-between gap-3 border-t-2 border-slate-100 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800">
          <Clock size={13} className="text-[#B8860B]" />
          {formatTime12HourIST(liveData.scheduledTime)}
          <span className="text-slate-500 font-semibold">
            · {liveData.durationMinutes || 60} min
          </span>
        </span>

        <div className="flex flex-wrap items-center gap-2 w-full xs:w-auto">
          {(platform === 'gmeet' || platform === 'zoom') && meetingUrl && (
            <a href={meetingUrl} target="_blank" rel="noopener noreferrer" className="flex-1 xs:flex-initial">
              <button className="border-2 border-slate-300 bg-white hover:bg-slate-50 text-[#08172D] font-bold px-3.5 py-2 rounded-xl text-xs inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors w-full">
                <span>Open {platform === 'gmeet' ? 'Meet' : 'Zoom'}</span>
                <ExternalLink size={12} />
              </button>
            </a>
          )}
          <Link href={targetUrl} className="flex-1 xs:flex-initial">
            <button
              className={`px-4 py-2 rounded-xl text-xs font-black inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-sm hover:shadow-md transition-all w-full ${
                live
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-[#08172D] hover:bg-[#040C18] text-white'
              }`}
            >
              <span>{live ? 'Enter Live Class' : 'Classroom'}</span>
              <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────── Empty state ─────────────────────── */

function EmptyState({ hasEnrolments }: { hasEnrolments: boolean }) {
  return (
    <div className="sa-tile text-center p-8 sm:p-14 border-2 border-slate-200">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#FAF0D4] border border-[#E8CD82] text-[#8A6100]">
        <Calendar size={26} strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-serif text-xl sm:text-2xl font-bold text-[#08172D]">
        {hasEnrolments ? 'No upcoming live sessions' : 'No enrolled courses'}
      </h3>
      <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 max-w-md mx-auto leading-relaxed">
        {hasEnrolments
          ? 'None of your enrolled courses have a virtual session scheduled right now. You will see scheduled sessions here as soon as your instructor adds one.'
          : 'Live interactive classes are exclusively available for enrolled students. Browse our academy courses to enrol and unlock live sessions.'}
      </p>
      <Link
        href={hasEnrolments ? '/dashboard/courses' : '/courses'}
        className="mt-6 inline-flex"
      >
        <button className="bg-[#08172D] hover:bg-[#040C18] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer">
          <span>{hasEnrolments ? 'View My Courses' : 'Browse Courses'}</span>
          <ArrowRight size={15} />
        </button>
      </Link>
    </div>
  );
}
