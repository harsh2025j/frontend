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
          <p className="sa-runhead">Live classes</p>
          <h1 className="font-serif text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-[color:var(--sa-ink)] sm:text-[1.875rem]">
            Virtual sessions
          </h1>
          <p className="mt-1.5 text-[13px] text-[color:var(--sa-ink-3)]">
            Join live, interactive classroom sessions with your instructors.
          </p>
        </div>
        {upcomingSessions.length > 0 && (
          <div className="shrink-0 rounded-full border border-[rgba(11,18,32,0.08)] bg-[color:var(--sa-cream)] px-4 py-2 text-[12px] font-semibold text-[color:var(--sa-ink-2)]">
            <span className="font-serif text-[18px] font-bold text-[color:var(--sa-ink)]">
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
              <div className="h-4 w-24 rounded bg-[color:var(--sa-cream-2)]" />
              <div className="mt-3 h-5 w-3/4 rounded bg-[color:var(--sa-cream-2)]" />
              <div className="mt-2 h-4 w-1/2 rounded bg-[color:var(--sa-cream-2)]" />
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
              <p className="sa-runhead flex items-center gap-2">
                <span className="relative inline-flex h-2 w-2">
                  <span className="absolute inset-0 animate-ping rounded-full bg-[color:var(--sa-live)] opacity-70" />
                  <span className="relative inline-block h-2 w-2 rounded-full bg-[color:var(--sa-live)]" />
                </span>
                Happening now
              </p>
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
              {liveNow.length > 0 && <p className="sa-runhead">Scheduled</p>}
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
      pill: 'bg-[color:var(--sa-sage-soft)] text-[color:var(--sa-sage-2)]',
    },
    zoom: {
      label: 'Zoom',
      Icon: Video,
      pill: 'bg-[color:var(--sa-blue-soft)] text-[color:var(--sa-blue-2)]',
    },
    youtube: {
      label: 'YouTube Live',
      Icon: Tv,
      pill: 'bg-[color:var(--sa-clay-soft)] text-[color:var(--sa-clay-2)]',
    },
    jitsi: {
      label: 'Classroom',
      Icon: Users,
      pill: 'bg-[color:var(--sa-gold-soft)] text-[color:var(--sa-gold-3)]',
    },
  } as const;
  const pMeta = platformMeta[platform];
  const PIcon = pMeta.Icon;

  return (
    <article
      className={`sa-tile sa-col-sm-6 sa-col-lg-6 flex flex-col gap-4 ${
        live ? '!border-[color:var(--sa-clay-line)]' : 'sa-tile-hover'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {live ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[color:var(--sa-clay)] px-2.5 py-[5px] text-[11px] font-semibold text-white shadow-sm">
            <Radio size={12} className="animate-pulse" strokeWidth={2.5} />
            Live now
          </span>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-[5px] text-[11px] font-semibold ${pMeta.pill}`}
          >
            <PIcon size={12} />
            {pMeta.label}
          </span>
        )}

        {/* Date block */}
        <span className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl border border-[rgba(11,18,32,0.08)] bg-[color:var(--sa-cream)] text-center">
          <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[color:var(--sa-gold-2)]">
            {validDate ? d!.toLocaleString('en-US', { month: 'short' }).toUpperCase() : 'TBD'}
          </span>
          <span className="font-serif text-[16px] font-bold leading-none text-[color:var(--sa-ink)]">
            {validDate ? d!.getDate() : '--'}
          </span>
        </span>
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-2 font-serif text-[1.0625rem] font-bold leading-snug tracking-[-0.005em] text-[color:var(--sa-ink)]">
          {session.title}
        </h3>
        <p className="mt-1.5 text-[12.5px] text-[color:var(--sa-ink-3)]">
          {session.course?.title || 'Academy course'}
        </p>
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(11,18,32,0.07)] pt-4">
        <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[color:var(--sa-ink-2)]">
          <Clock size={13} className="text-[color:var(--sa-gold-2)]" />
          {formatTime12HourIST(liveData.scheduledTime)}
          <span className="text-[color:var(--sa-ink-4)]">
            · {liveData.durationMinutes || 60} min
          </span>
        </span>

        <div className="flex items-center gap-2">
          {(platform === 'gmeet' || platform === 'zoom') && meetingUrl && (
            <a href={meetingUrl} target="_blank" rel="noopener noreferrer">
              <button className="sa-btn sa-btn-ghost sa-btn-sm">
                Open {platform === 'gmeet' ? 'Meet' : 'Zoom'}
                <ExternalLink size={12} />
              </button>
            </a>
          )}
          <Link href={targetUrl}>
            <button
              className={`sa-btn sa-btn-sm ${
                live ? 'sa-btn-live' : 'sa-btn-primary'
              }`}
            >
              {live ? 'Enter class' : 'Classroom'}
              <ArrowRight size={12} />
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
    <div className="sa-tile sa-tile-pad-lg text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--sa-gold-soft)] text-[color:var(--sa-gold-2)]">
        <Calendar size={22} />
      </span>
      <h3 className="mt-4 font-serif text-[1.25rem] font-bold text-[color:var(--sa-ink)]">
        {hasEnrolments ? 'No upcoming sessions' : 'No enrolled courses'}
      </h3>
      <p className="sa-sub mx-auto mt-2 max-w-md">
        {hasEnrolments
          ? 'None of your enrolled courses have a live session scheduled right now. You will see one here as soon as your instructor adds it.'
          : 'Live interactive sessions are only available for the courses you have enrolled in. Enrol to unlock them.'}
      </p>
      <Link
        href={hasEnrolments ? '/dashboard/courses' : '/courses'}
        className="mt-5 inline-flex"
      >
        <button className="sa-btn sa-btn-gold">
          {hasEnrolments ? 'View my courses' : 'Browse courses'}
          <ArrowRight size={15} />
        </button>
      </Link>
    </div>
  );
}
