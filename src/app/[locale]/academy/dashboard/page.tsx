"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  CheckCircle2,
  Award,
  Clock,
  BookOpen,
  ExternalLink,
  Calendar,
  ArrowRight,
  FileQuestion,
  ClipboardList,
  GraduationCap,
  XCircle,
  UploadCloud,
  Timer,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import { courseApi } from '@/data/services/academy-service/course.service';
import { certificateApi } from '@/data/services/academy-service/certificate.service';
import {
  studentApi,
  formatStudyTime,
  type StudentPerformance,
  type StudentActivityEntry,
} from '@/data/services/academy-service/student.service';
import { useAuth } from '@/data/features/auth/useAuthActions';
import { formatTime12HourIST } from '@/lib/utils';
import {
  ActivityHeatmap,
  CategoryDonut,
  ScoreTrendChart,
  WeeklyActivityChart,
} from './components/DashboardCharts';

/* ─────────────────────────── Skeleton ─────────────────────────── */

function OverviewSkeleton() {
  const skel = 'animate-pulse bg-[color:var(--sa-cream-2)] rounded-xl';
  return (
    <div className="sa-rise space-y-5">
      <div className={`${skel} h-28`} />
      <div className="sa-bento">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${skel} h-28 sa-col-xs-6 sa-col-sm-3 sa-col-lg-3`} />
        ))}
      </div>
      <div className="sa-bento">
        <div className={`${skel} h-64 sa-col-sm-8 sa-col-lg-8`} />
        <div className={`${skel} h-64 sa-col-sm-4 sa-col-lg-4`} />
      </div>
    </div>
  );
}

/* ─────────────────────── Activity glyphs ─────────────────────── */

const ACTIVITY_META: Record<
  StudentActivityEntry['type'],
  { icon: typeof Play; tone: string; dot: string; label: string }
> = {
  enrolled: {
    icon: BookOpen,
    tone: 'text-[color:var(--sa-ink-3)]',
    dot: 'bg-[color:var(--sa-ink-5)]',
    label: 'Enrolled',
  },
  lesson_completed: {
    icon: CheckCircle2,
    tone: 'text-[color:var(--sa-sage-2)]',
    dot: 'bg-[color:var(--sa-sage)]',
    label: 'Lesson completed',
  },
  assessment_passed: {
    icon: GraduationCap,
    tone: 'text-[color:var(--sa-sage-2)]',
    dot: 'bg-[color:var(--sa-sage)]',
    label: 'Assessment passed',
  },
  assessment_attempt: {
    icon: FileQuestion,
    tone: 'text-[color:var(--sa-amber)]',
    dot: 'bg-[color:var(--sa-amber)]',
    label: 'Assessment attempt',
  },
  assignment_submitted: {
    icon: UploadCloud,
    tone: 'text-[color:var(--sa-blue)]',
    dot: 'bg-[color:var(--sa-blue)]',
    label: 'Assignment submitted',
  },
  assignment_verified: {
    icon: CheckCircle2,
    tone: 'text-[color:var(--sa-sage-2)]',
    dot: 'bg-[color:var(--sa-sage)]',
    label: 'Assignment accepted',
  },
  assignment_rejected: {
    icon: XCircle,
    tone: 'text-[color:var(--sa-clay)]',
    dot: 'bg-[color:var(--sa-clay)]',
    label: 'Assignment returned',
  },
  certificate_issued: {
    icon: Award,
    tone: 'text-[color:var(--sa-gold-2)]',
    dot: 'bg-[color:var(--sa-gold)]',
    label: 'Certificate issued',
  },
};

function relativeDay(iso: string): string {
  const then = new Date(iso);
  if (isNaN(then.getTime())) return '';
  const now = new Date();
  if (
    then.getFullYear() === now.getFullYear() &&
    then.getMonth() === now.getMonth() &&
    then.getDate() === now.getDate()
  ) {
    return 'Today';
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    then.getFullYear() === yesterday.getFullYear() &&
    then.getMonth() === yesterday.getMonth() &&
    then.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }
  const diffDays = Math.floor((now.getTime() - then.getTime()) / 86400000);
  if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`;
  return then.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/* ─────────────────────── Mini ring (SVG) ─────────────────────── */

function ProgressRing({
  pct,
  size = 72,
  stroke = 7,
}: {
  pct: number;
  size?: number;
  stroke?: number;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, pct)) / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#F0EADA"
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="url(#sa-ring-grad)"
        strokeWidth={stroke}
        strokeDasharray={`${dash} ${c}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <defs>
        <linearGradient id="sa-ring-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--sa-gold-2)" />
          <stop offset="100%" stopColor="var(--sa-gold-1)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ════════════════════════════ Page ════════════════════════════ */

export default function DashboardOverview() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const { myEnrollments } = useAppSelector((state) => state.enrollments);

  const [perf, setPerf] = useState<StudentPerformance | null>(null);
  const [perfFailed, setPerfFailed] = useState(false);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [fallbackCertCount, setFallbackCertCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAll = async () => {
      await Promise.allSettled([
        dispatch(fetchMyEnrollments()),

        studentApi
          .myPerformance()
          .then((data) => {
            if (isMounted) setPerf(data);
          })
          .catch((err) => {
            console.error('Performance endpoint unavailable, using fallback:', err);
            if (isMounted) setPerfFailed(true);
          }),

        courseApi.fetchLiveSessions().then((res: any) => {
          const data = res.data?.data || res.data || [];
          if (isMounted) setLiveSessions(Array.isArray(data) ? data : []);
        }),
      ]);

      if (isMounted) setIsLoading(false);
    };

    loadAll();
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    if (!perfFailed) return;
    let isMounted = true;
    certificateApi
      .mine()
      .then((res: any) => {
        const list = (res?.data ?? res) || [];
        if (isMounted) setFallbackCertCount(Array.isArray(list) ? list.length : 0);
      })
      .catch(() => {
        if (isMounted) setFallbackCertCount(0);
      });
    return () => {
      isMounted = false;
    };
  }, [perfFailed]);

  /* ── Summary (aggregate or derived fallback) ── */
  const summary = useMemo(() => {
    if (perf) return perf.summary;

    const total = myEnrollments.length;
    const completed = myEnrollments.filter(
      (e) => (e.progress || 0) >= 100 || (e.status || '').toLowerCase() === 'completed'
    ).length;
    const avg = total
      ? Math.round(
          myEnrollments.reduce(
            (s, e) => s + Math.min(100, Math.max(0, e.progress || 0)),
            0
          ) / total
        )
      : 0;

    return {
      coursesEnrolled: total,
      coursesInProgress: total - completed,
      coursesCompleted: completed,
      averageProgressPct: avg,
      itemsCompleted: 0,
      itemsTotal: 0,
      learningMinutes: 0,
      learningMinutesTotal: 0,
      certificatesEarned: fallbackCertCount ?? 0,
      activeDaysLast30: 0,
      lastActiveAt: null,
    };
  }, [perf, myEnrollments, fallbackCertCount]);

  /* ── Live sessions ── */
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

  const enrolledLiveSessions = useMemo(() => {
    if (enrolledCourseIdentifiers.size === 0) return [];
    return liveSessions.filter((s) => {
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
  }, [liveSessions, enrolledCourseIdentifiers]);

  const currentlyLiveSession = enrolledLiveSessions.find(
    (s) => s.liveData?.status === 'live'
  );
  const upcomingSessions = enrolledLiveSessions
    .filter((s) => (s.liveData?.status || 'scheduled') === 'scheduled')
    .slice(0, 3);

  /* ── Resume course ── */
  const resumeCourse = useMemo(() => {
    if (perf) {
      const unfinished = perf.courses.filter((c) => c.progressPct < 100);
      if (unfinished.length > 0) {
        return [...unfinished].sort((a, b) => b.progressPct - a.progressPct)[0];
      }
      return perf.courses[0] || null;
    }
    const unfinished = myEnrollments.filter((e) => (e.progress || 0) < 100);
    const pick =
      (unfinished.length > 0
        ? [...unfinished].sort((a, b) => (b.progress || 0) - (a.progress || 0))[0]
        : myEnrollments[0]) || null;
    if (!pick?.course) return null;

    return {
      enrollmentId: pick.id,
      courseId: pick.courseId,
      title: pick.course.title || 'Course',
      slug: pick.course.slug || null,
      thumbnailUrl: pick.course.thumbnailUrl || null,
      category: pick.course.category || null,
      level: pick.course.level || null,
      status: pick.status,
      enrolledAt: pick.createdAt,
      lastUpdatedAt: pick.createdAt,
      progressPct: Math.min(100, Math.max(0, pick.progress || 0)),
      itemsCompleted: 0,
      itemsTotal: 0,
      minutesCompleted: 0,
      minutesTotal: 0,
      assessmentAttempts: 0,
      bestAssessmentScorePct: null,
      certificateId: null,
    };
  }, [perf, myEnrollments]);

  const otherCourses = useMemo(() => {
    if (!perf) return [];
    return perf.courses.filter((c) => c.enrollmentId !== resumeCourse?.enrollmentId);
  }, [perf, resumeCourse?.enrollmentId]);

  if (isLoading) return <OverviewSkeleton />;

  const firstName = (user?.name || '').trim().split(/\s+/)[0] || null;
  const resumeDone = (resumeCourse?.progressPct || 0) >= 100;
  const hasCourses = summary.coursesEnrolled > 0;
  const paceDelta = perf?.pace ? perf.pace.eventsLast7 - perf.pace.eventsPrior7 : 0;

  return (
    <div className="sa-rise space-y-5 sm:space-y-6">

      {/* ═════════════ 1. Hero band ═════════════ */}
      <div className="sa-bento">
        {/* Welcome */}
        <div className="sa-tile sa-col-lg-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div className="min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2.5">
              DASHBOARD OVERVIEW
            </span>
            <h1 className="font-serif text-[1.75rem] font-bold leading-[1.1] tracking-[-0.015em] text-[#08172D] sm:text-[2rem]">
              {firstName ? `Welcome back, ${firstName}` : 'Welcome back'}
            </h1>
            <p className="mt-2 max-w-prose text-[13.5px] font-medium leading-relaxed text-slate-600">
              {hasCourses
                ? "Here is your learning at a glance: progress, virtual classes, and next milestones."
                : 'Enrol in a course and your real-time progress will be tracked here.'}
            </p>
          </div>
          {summary.lastActiveAt && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs shrink-0 self-start sm:self-auto shadow-2xs">
              <Clock size={13} className="text-[#B8860B]" />
              Last active {relativeDay(summary.lastActiveAt).toLowerCase()}
            </span>
          )}
        </div>

        {/* Streak */}
        <div className="sa-tile sa-tile-dark sa-col-lg-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">Current streak</span>
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-500/20 text-[#F59E0B] border border-amber-500/30">
              <Flame size={17} fill="currentColor" strokeWidth={0} />
            </span>
          </div>
          <div>
            <p className="font-serif font-black text-3xl sm:text-4xl text-white mt-2 inline-flex items-baseline gap-1.5 tabular-nums">
              {perf?.streak?.currentDays ?? 0}
              <span className="text-[0.42em] font-normal text-amber-100/70">
                {(perf?.streak?.currentDays ?? 0) === 1 ? 'day' : 'days'}
              </span>
            </p>
            <div className="mt-3 flex items-center gap-1.5">
              {Array.from({ length: 7 }).map((_, i) => (
                <span
                  key={i}
                  className="h-2 flex-1 rounded-full transition-all"
                  style={{
                    background:
                      i < (perf?.streak?.activeDaysLast7 ?? 0)
                        ? '#F59E0B'
                        : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </div>
            <p className="mt-2.5 text-xs font-semibold text-amber-100">
              {perf?.streak?.activeDaysLast7 ?? 0} of 7 days this week
              {perf?.streak?.longestDays
                ? ` · best ${perf.streak.longestDays}d streak`
                : ''}
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════ Live now ═════════════ */}
      {currentlyLiveSession && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50/90 p-4 sm:p-5 shadow-lg shadow-red-500/10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <div className="min-w-0">
            <p className="mb-1.5 inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-600 text-white font-black text-[11px] uppercase tracking-wider animate-pulse shadow-xs">
                <span className="inline-block h-2 w-2 rounded-full bg-white" />
                Live Now
              </span>
            </p>
            <h2 className="font-serif text-[1.125rem] font-bold leading-snug tracking-tight text-[#08172D]">
              {currentlyLiveSession.title}
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-700">
              {currentlyLiveSession.course?.title || 'Your enrolled course'}
            </p>
          </div>
          <Link
            href={
              currentlyLiveSession.course?.slug
                ? `/dashboard/learn/${currentlyLiveSession.course.slug}`
                : '/dashboard/live-sessions'
            }
            className="shrink-0"
          >
            <button className="bg-red-600 hover:bg-red-700 text-white font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-md inline-flex items-center gap-2 cursor-pointer transition-colors">
              <span>Join Classroom</span>
              <ExternalLink size={14} />
            </button>
          </Link>
        </div>
      )}

      {/* ═════════════ 2. Headline KPIs ═════════════ */}
      <div className="sa-bento">
        {/* Enrolled */}
        <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-slate-800">Enrolled</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
              <BookOpen size={16} strokeWidth={2.2} />
            </div>
          </div>
          <p className="font-serif font-black text-3xl sm:text-4xl text-[#08172D] mt-2 tabular-nums">
            {summary.coursesEnrolled}
          </p>
          <p className="text-xs font-bold text-slate-600 mt-1">
            {summary.coursesEnrolled > 0
              ? `${summary.coursesInProgress} in progress`
              : 'No courses yet'}
          </p>
        </div>

        {/* Completed */}
        <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-slate-800">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={16} strokeWidth={2.2} />
            </div>
          </div>
          <p className="font-serif font-black text-3xl sm:text-4xl text-[#08172D] mt-2 tabular-nums">
            {summary.coursesCompleted}
          </p>
          <p className="text-xs font-bold text-slate-600 mt-1">
            {summary.coursesEnrolled > 0
              ? `of ${summary.coursesEnrolled} ${
                  summary.coursesEnrolled === 1 ? 'course' : 'courses'
                }`
              : 'No courses yet'}
          </p>
        </div>

        {/* Average progress with ring */}
        <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-slate-800">Avg. progress</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
              <Timer size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-2.5 flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3">
            <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16">
              <ProgressRing pct={summary.averageProgressPct} size={56} stroke={6} />
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="font-serif font-black tabular-nums leading-none text-[#08172D] text-sm sm:text-base">
                  {summary.averageProgressPct}%
                </span>
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 leading-snug">
                {summary.coursesEnrolled > 0
                  ? `Across ${summary.coursesEnrolled} ${
                      summary.coursesEnrolled === 1 ? 'course' : 'courses'
                    }`
                  : 'Across every course'}
              </p>
              {summary.itemsTotal > 0 && (
                <p className="mt-1 text-[11px] font-bold text-slate-600">
                  {summary.itemsCompleted}/{summary.itemsTotal} lessons
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Certificates */}
        <Link
          href="/dashboard/certificates"
          className="sa-tile !border-2 !border-[#E8CD82] bg-gradient-to-br from-[#FEFBF2] to-[#FAF3DE] hover:!border-[#8A6100] shadow-sm hover:shadow-xl transition-all block sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="font-black text-xs uppercase tracking-wider text-[#8A6100]">Certificates</span>
            <div className="w-8 h-8 rounded-lg bg-[#FAF0D4] border border-[#E8CD82] text-[#8A6100] flex items-center justify-center">
              <Award size={16} strokeWidth={2.2} />
            </div>
          </div>
          <p className="font-serif font-black text-3xl sm:text-4xl text-[#7A5A00] mt-2 tabular-nums">
            {summary.certificatesEarned}
          </p>
          <p className="text-xs font-bold text-[#8A6100] mt-1 inline-flex items-center gap-1 group-hover:underline">
            View credentials
            <ArrowRight
              size={12}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </p>
        </Link>
      </div>

      {/* ═════════════ 3. Performance ═════════════ */}
      {perf ? (
        <div className="sa-bento">
          <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider text-slate-800">Time studied</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center">
                <Timer size={16} strokeWidth={2.2} />
              </div>
            </div>
            <p className="font-serif font-black text-2xl sm:text-3xl text-[#08172D] mt-2 tabular-nums">
              {formatStudyTime(summary.learningMinutes)}
            </p>
            {summary.learningMinutesTotal > 0 ? (
              <>
                <p className="text-xs font-bold text-slate-600 mt-1">
                  of {formatStudyTime(summary.learningMinutesTotal)} goal
                </p>
                <div className="sa-bar sa-bar-slim mt-3">
                  <span
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          (summary.learningMinutes / summary.learningMinutesTotal) *
                            100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </>
            ) : (
              <p className="text-xs font-bold text-slate-600 mt-1">Based on completed lessons</p>
            )}
          </div>

          <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider text-slate-800">Lessons</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <BookOpen size={16} strokeWidth={2.2} />
              </div>
            </div>
            <p className="font-serif font-black text-2xl sm:text-3xl text-[#08172D] mt-2 tabular-nums">
              {summary.itemsCompleted}
              {summary.itemsTotal > 0 && (
                <span className="text-base font-bold text-slate-500">
                  {' '}
                  / {summary.itemsTotal}
                </span>
              )}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">Across all enrolled courses</p>
          </div>

          <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider text-slate-800">Assessments</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                <GraduationCap size={16} strokeWidth={2.2} />
              </div>
            </div>
            <p className="font-serif font-black text-2xl sm:text-3xl text-[#08172D] mt-2 tabular-nums">
              {perf.assessments.averageScorePct !== null ? (
                <>
                  {perf.assessments.averageScorePct}
                  <span className="text-lg font-bold text-[#B8860B]">
                    %
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-400">
                  Not yet
                </span>
              )}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              {perf.assessments.completedAttempts > 0
                ? `${perf.assessments.completedAttempts} ${
                    perf.assessments.completedAttempts === 1 ? 'attempt' : 'attempts'
                  }${
                    perf.assessments.bestScorePct !== null
                      ? ` · best ${perf.assessments.bestScorePct}%`
                      : ''
                  }`
                : 'No attempts yet'}
            </p>
          </div>

          <div className="sa-tile sa-col-xs-6 sa-col-sm-3 sa-col-lg-3 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-black text-xs uppercase tracking-wider text-slate-800">Assignments</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center">
                <ClipboardList size={16} strokeWidth={2.2} />
              </div>
            </div>
            <p className="font-serif font-black text-2xl sm:text-3xl text-[#08172D] mt-2 tabular-nums">
              {perf.assignments.submitted > 0 ? (
                <>
                  {perf.assignments.verified}
                  <span className="text-base font-bold text-slate-500">
                    {' '}
                    / {perf.assignments.submitted}
                  </span>
                </>
              ) : (
                <span className="text-sm font-bold text-slate-400">
                  Not yet
                </span>
              )}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              {perf.assignments.submitted > 0
                ? `Accepted${
                    perf.assignments.awaitingReview > 0
                      ? ` · ${perf.assignments.awaitingReview} in review`
                      : ''
                  }`
                : 'Nothing submitted yet'}
            </p>
          </div>
        </div>
      ) : (
        <div className="sa-tile flex items-start gap-3 border-l-4 border-amber-500 bg-amber-50/70 p-4 rounded-xl">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0 text-amber-600"
          />
          <p className="text-xs sm:text-[13px] font-semibold leading-relaxed text-amber-900">
            Detailed performance figures are temporarily unavailable. Your course
            progress below is still accurate.
          </p>
        </div>
      )}

      {/* ═════════════ 4. Resume + Score trend ═════════════ */}
      <div className="sa-bento">
        {resumeCourse ? (
          <article className="sa-tile sa-tile-hover sa-col-lg-8 overflow-hidden !p-0 border-2 border-slate-300/90 hover:border-[#B7913A] shadow-md transition-all">
            <div className="flex flex-col gap-0 md:flex-row">
              <Link
                href={`/dashboard/learn/${resumeCourse.slug || ''}`}
                className="group relative block w-full shrink-0 overflow-hidden bg-slate-100 md:w-72 lg:w-80"
              >
                <div className="relative aspect-video md:aspect-auto md:h-full md:min-h-[230px]">
                  {resumeCourse.thumbnailUrl ? (
                    <img
                      src={resumeCourse.thumbnailUrl}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-slate-300">
                      <BookOpen size={36} strokeWidth={1.5} />
                    </div>
                  )}
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#08172D]/85 via-transparent to-transparent"
                  />
                  <span className="absolute bottom-3 left-3 flex items-center gap-2.5 text-white">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-[#B8860B] text-white shadow-xl">
                      <Play size={15} fill="currentColor" className="ml-0.5" />
                    </span>
                    <span className="text-xs font-black uppercase tracking-wider bg-[#08172D]/90 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20">
                      {resumeDone ? 'Review' : 'Resume'}
                    </span>
                  </span>
                </div>
              </Link>

              <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 sm:p-6">
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
                    CONTINUE LEARNING
                  </span>
                  <Link href={`/dashboard/learn/${resumeCourse.slug || ''}`}>
                    <h3 className="font-serif text-[1.2rem] sm:text-[1.35rem] font-bold leading-snug tracking-tight text-[#08172D] hover:text-[#8A6100] transition-colors line-clamp-2">
                      {resumeCourse.title}
                    </h3>
                  </Link>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    {resumeCourse.category && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-[#08172D] border border-slate-300 text-xs font-bold">
                        {resumeCourse.category}
                      </span>
                    )}
                    {resumeCourse.level && (
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-[#08172D] border border-slate-300 text-xs font-bold">
                        {resumeCourse.level}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="mb-2 flex items-baseline justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                      Progress
                    </span>
                    <span className="font-serif text-base sm:text-lg font-black tabular-nums text-[#08172D]">
                      {resumeCourse.progressPct}%
                    </span>
                  </div>
                  <div className={`sa-bar ${resumeDone ? 'sa-bar-done' : ''}`}>
                    <span style={{ width: `${resumeCourse.progressPct}%` }} />
                  </div>

                  {resumeCourse.itemsTotal > 0 && (
                    <p className="mt-2 text-xs font-bold text-slate-700">
                      {resumeCourse.itemsCompleted} of {resumeCourse.itemsTotal}{' '}
                      lessons completed
                      {resumeCourse.bestAssessmentScorePct !== null &&
                        ` · best assessment ${resumeCourse.bestAssessmentScorePct}%`}
                    </p>
                  )}

                  <Link
                    href={`/dashboard/learn/${resumeCourse.slug || ''}`}
                    className="mt-4 inline-flex w-full sm:w-auto"
                  >
                    <button className="bg-[#08172D] hover:bg-[#040C18] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md hover:shadow-lg transition-all inline-flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                      <span>{resumeDone ? 'Review Course' : 'Resume Course'}</span>
                      <ArrowRight size={15} />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="sa-tile sa-col-lg-8 text-center p-8 sm:p-12">
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
              GET STARTED
            </span>
            <h3 className="mt-2 font-serif text-xl sm:text-2xl font-bold text-[#08172D]">
              You have not enrolled in any course yet
            </h3>
            <p className="text-xs sm:text-sm font-medium text-slate-600 mx-auto mt-2 max-w-md leading-relaxed">
              Enrol in your first programme and your lessons, virtual classes, results and certificate
              will appear right here.
            </p>
            <Link href="/courses" className="mt-5 inline-flex">
              <button className="bg-[#08172D] hover:bg-[#040C18] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer">
                <span>Browse Catalogue</span>
                <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        )}

        {/* Score trend */}
        <div className="sa-col-lg-4">
          {perf?.scoreHistory ? (
            <ScoreTrendChart history={perf.scoreHistory} />
          ) : (
            <div className="sa-tile h-full" />
          )}
        </div>
      </div>

      {/* ═════════════ 5. Learning rhythm ═════════════ */}
      {perf && perf.activityByDay && perf.activityByDay.length > 0 && (
        <>
          <div className="sa-bento">
            <div className="sa-col-lg-8">
              <ActivityHeatmap days={perf.activityByDay} />
            </div>
            <div className="sa-col-lg-4">
              {/* Pace tile */}
              <div className="sa-tile h-full">
                <div className="flex items-center justify-between">
                  <span className="sa-label">This week</span>
                  <span
                    className={`sa-pill ${
                      paceDelta > 0
                        ? 'sa-pill-sage'
                        : paceDelta < 0
                        ? 'sa-pill-clay'
                        : ''
                    }`}
                  >
                    {paceDelta > 0 ? '+' : ''}
                    {paceDelta} vs last
                  </span>
                </div>
                <p className="sa-value sa-value-lg mt-3">
                  {perf.pace?.eventsLast7 ?? 0}
                  <span className="text-[0.4em] font-normal text-[color:var(--sa-ink-4)]">
                    {' '}
                    events
                  </span>
                </p>
                <p className="sa-sub mt-1.5">
                  Lessons completed, assessments, submissions and certificates in the
                  last 7 days.
                </p>
                {perf.nextUp && perf.nextUp.itemsRemaining > 0 && (
                  <>
                    <hr className="sa-divider my-4" />
                    <p className="sa-label !text-[10.5px]">Next milestone</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-[color:var(--sa-ink-2)]">
                      <strong className="font-semibold">
                        {perf.nextUp.itemsRemaining}
                      </strong>{' '}
                      {perf.nextUp.itemsRemaining === 1 ? 'lesson' : 'lessons'}{' '}
                      left in{' '}
                      <span className="font-semibold text-[color:var(--sa-ink)]">
                        {perf.nextUp.title}
                      </span>
                    </p>
                    <Link
                      href={`/dashboard/learn/${perf.nextUp.slug || ''}`}
                      className="mt-3 inline-flex"
                    >
                      <button className="sa-btn sa-btn-ghost sa-btn-sm">
                        Continue <ArrowRight size={13} />
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="sa-bento">
            <div className="sa-col-lg-7">
              <WeeklyActivityChart days={perf.activityByDay} />
            </div>
            {perf.categoryBreakdown && perf.categoryBreakdown.length > 0 && (
              <div className="sa-col-lg-5">
                <CategoryDonut breakdown={perf.categoryBreakdown} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ═════════════ 6. Other courses + Activity + Upcoming ═════════════ */}
      <div className="sa-bento">
        {/* Other courses */}
        {otherCourses.length > 0 ? (
          <div className="sa-tile sa-col-lg-8">
            <div className="mb-4 flex items-baseline justify-between gap-3">
              <h2 className="font-serif text-[1.0625rem] font-bold tracking-[-0.005em] text-[color:var(--sa-ink)]">
                Your other courses
              </h2>
              <Link
                href="/dashboard/courses"
                className="inline-flex shrink-0 items-center gap-1 text-[12.5px] font-semibold text-[color:var(--sa-blue)] hover:text-[color:var(--sa-blue-2)]"
              >
                All courses <ArrowRight size={12} />
              </Link>
            </div>
            <ul className="divide-y divide-slate-200">
              {otherCourses.slice(0, 5).map((c) => (
                <li key={c.enrollmentId}>
                  <Link
                    href={`/dashboard/learn/${c.slug || ''}`}
                    className="group flex flex-col gap-3 py-3.5 transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-5 sm:rounded-xl sm:px-3 sm:-mx-3"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[14px] font-bold text-[#08172D] group-hover:text-[#8A6100] transition-colors">
                        {c.title}
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-semibold text-slate-600">
                        {c.itemsTotal > 0 && (
                          <span>
                            {c.itemsCompleted}/{c.itemsTotal} lessons
                          </span>
                        )}
                        {c.minutesCompleted > 0 && (
                          <span>· {formatStudyTime(c.minutesCompleted)}</span>
                        )}
                        {c.bestAssessmentScorePct !== null && (
                          <span>· best {c.bestAssessmentScorePct}%</span>
                        )}
                        {c.certificateId && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF0D4] border border-[#E8CD82] text-[#8A6100] text-[11px] font-black">
                            <Award size={11} /> Certified
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-3 sm:w-56">
                      <span
                        className={`sa-bar sa-bar-slim flex-1 ${
                          c.progressPct >= 100 ? 'sa-bar-done' : ''
                        }`}
                      >
                        <span style={{ width: `${c.progressPct}%` }} />
                      </span>
                      <span className="w-10 text-right text-xs font-black tabular-nums text-[#08172D]">
                        {c.progressPct}%
                      </span>
                      <ArrowRight
                        size={15}
                        className="shrink-0 text-slate-400 group-hover:text-[#08172D] transition-transform group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* Upcoming classes */}
        <div
          className={`sa-tile ${
            otherCourses.length > 0 ? 'sa-col-lg-4' : 'sa-col-lg-6'
          }`}
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[1.125rem] font-bold tracking-tight text-[#08172D]">
              Upcoming classes
            </h2>
            <Link
              href="/dashboard/live-sessions"
              className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#08172D] hover:text-[#8A6100]"
            >
              All classes <ArrowRight size={12} />
            </Link>
          </div>
          {upcomingSessions.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
              <p className="text-sm font-bold text-slate-800">
                Nothing scheduled
              </p>
              <p className="mt-1 text-xs font-semibold text-slate-500 leading-relaxed">
                {hasCourses
                  ? 'A virtual session will appear here once your instructor schedules one.'
                  : 'Live classes appear once you enrol in a course.'}
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {upcomingSessions.map((session) => {
                const d = session.liveData?.scheduledDate
                  ? new Date(session.liveData.scheduledDate)
                  : null;
                const valid = d && !isNaN(d.getTime());
                const targetHref = session.course?.slug
                  ? `/dashboard/learn/${session.course.slug}`
                  : '/dashboard/live-sessions';

                return (
                  <li key={session.id}>
                    <Link
                      href={targetHref}
                      className="group flex gap-3 rounded-xl p-2.5 -mx-2 transition-all hover:bg-slate-50 border border-transparent hover:border-slate-200"
                    >
                      <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#08172D] text-center shadow-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#F59E0B]">
                          {valid
                            ? d!
                                .toLocaleString('en-US', { month: 'short' })
                                .toUpperCase()
                            : 'TBD'}
                        </span>
                        <span className="font-serif text-lg font-black leading-none text-white">
                          {valid ? d!.getDate() : '--'}
                        </span>
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 block text-xs sm:text-[13px] font-bold leading-snug text-[#08172D] group-hover:text-[#8A6100] transition-colors">
                          {session.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Clock size={12} className="text-[#B8860B]" />
                          {formatTime12HourIST(session.liveData?.scheduledTime)}
                          <span className="text-slate-500 font-semibold">
                            · {session.liveData?.durationMinutes || 60} min
                          </span>
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div
          className={`sa-tile ${
            otherCourses.length > 0 ? 'sa-col-lg-12' : 'sa-col-lg-6'
          }`}
        >
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-[1.0625rem] font-bold tracking-[-0.005em] text-[color:var(--sa-ink)]">
              Recent activity
            </h2>
          </div>
          {perf && perf.activity.length > 0 ? (
            <ul className="space-y-1">
              {perf.activity.slice(0, 8).map((entry, i) => {
                const meta = ACTIVITY_META[entry.type] || ACTIVITY_META.enrolled;
                const Icon = meta.icon;
                return (
                  <li
                    key={`${entry.type}-${entry.at}-${i}`}
                    className="flex items-start gap-2.5 sm:gap-3 rounded-xl p-2 sm:p-2.5 -mx-1 sm:-mx-2.5 transition-colors hover:bg-[color:var(--sa-cream)]"
                  >
                    <span className={`mt-0.5 inline-block h-2 w-2 shrink-0 rounded-full ${meta.dot}`} />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 block text-[13px] font-medium text-[color:var(--sa-ink)]">
                        {entry.title}
                      </span>
                      <span className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-[11.5px] text-[color:var(--sa-ink-3)]">
                        <Icon size={11} className={meta.tone} />
                        <span>{meta.label}</span>
                        {entry.detail && <span>· {entry.detail}</span>}
                      </span>
                    </span>
                    <span className="shrink-0 whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.06em] text-[color:var(--sa-ink-4)]">
                      {relativeDay(entry.at)}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="rounded-xl border border-dashed border-[rgba(11,18,32,0.08)] bg-[color:var(--sa-cream)] p-6 text-center">
              <p className="text-[13px] font-semibold text-[color:var(--sa-ink-2)]">
                Nothing recorded yet
              </p>
              <p className="sa-sub mt-1 !text-[12px]">
                Submitted assignments, assessment results and issued certificates
                appear here with the date they happened.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ═════════════ Engagement note ═════════════ */}
      {perf && summary.activeDaysLast30 > 0 && (
        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-[color:var(--sa-ink-3)]">
          <Calendar
            size={13}
            className="mt-0.5 shrink-0 text-[color:var(--sa-gold-2)]"
          />
          <span>
            Active on{' '}
            <strong className="font-semibold text-[color:var(--sa-ink)]">
              {summary.activeDaysLast30}
            </strong>{' '}
            of the last 30 days, counted from recorded enrolments, submissions
            and assessment attempts.
          </span>
        </p>
      )}
    </div>
  );
}
