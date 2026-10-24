"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Play,
  PlayCircle,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Clock,
  Award,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';

type Filter = 'all' | 'in_progress' | 'completed';

export default function MyCoursesPage() {
  const dispatch = useAppDispatch();
  const { myEnrollments, isLoading } = useAppSelector((state) => state.enrollments);
  const [filter, setFilter] = React.useState<Filter>('all');

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const totalCount = myEnrollments.length;
  const inProgressCount = myEnrollments.filter((e) => (e.progress || 0) < 100).length;
  const completedCount = myEnrollments.filter((e) => (e.progress || 0) >= 100).length;

  const filtered = myEnrollments.filter((e) => {
    const done = (e.progress || 0) >= 100;
    if (filter === 'in_progress') return !done;
    if (filter === 'completed') return done;
    return true;
  });

  return (
    <div className="sa-rise space-y-5 sm:space-y-6">
      {/* ─── Header ─── */}
      <div className="sa-tile flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
            MY COURSES
          </span>
          <h1 className="font-serif text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-[#08172D] sm:text-[1.875rem]">
            Enrolled Learning Library
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-600">
            Everything you are enrolled in, with real-time syllabus tracking across all lessons.
          </p>
        </div>

        <FilterTabs
          filter={filter}
          onChange={setFilter}
          counts={{ all: totalCount, in_progress: inProgressCount, completed: completedCount }}
        />
      </div>

      {/* ─── Content ─── */}
      {isLoading && myEnrollments.length === 0 ? (
        <div className="sa-bento">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="sa-tile sa-col-sm-6 sa-col-lg-4 !p-0 overflow-hidden"
            >
              <div className="aspect-video w-full animate-pulse bg-slate-200" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-2 w-full animate-pulse rounded-full bg-slate-200" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState filter={filter} />
      ) : (
        <div className="sa-bento">
          {filtered.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            const progress = Math.min(100, Math.max(0, enrollment.progress || 0));
            const done = progress >= 100;
            const since = new Date(enrollment.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            });

            return (
              <article
                key={course.slug}
                className="sa-col-sm-6 sa-col-lg-4 group !p-0 overflow-hidden flex flex-col rounded-2xl border-2 border-slate-200/90 hover:border-[#B7913A] bg-white shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <Link
                  href={`/dashboard/learn/${course.slug}`}
                  className="relative block aspect-video w-full overflow-hidden bg-slate-100"
                >
                  <img
                    src={
                      course.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop'
                    }
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[#08172D]/80 via-transparent to-transparent"
                  />

                  {/* Status badge: solid, high contrast */}
                  {done ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-md">
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                      Completed
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#08172D]/95 backdrop-blur-md px-3 py-1 text-xs font-black text-white border border-white/20 shadow-md">
                      <span
                        aria-hidden="true"
                        className="inline-block h-2 w-2 rounded-full bg-[#F59E0B]"
                      />
                      In progress · {progress}%
                    </span>
                  )}

                  {/* Play affordance */}
                  <span
                    className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-[#B8860B] text-white shadow-xl"
                    aria-hidden="true"
                  >
                    {done ? (
                      <BookOpen size={16} strokeWidth={2.25} />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
                  <div className="min-w-0">
                    <Link href={`/dashboard/learn/${course.slug}`}>
                      <h3 className="line-clamp-2 font-serif text-[1.125rem] sm:text-[1.2rem] font-bold leading-snug tracking-tight text-[#08172D] group-hover:text-[#8A6100] transition-colors">
                        {course.title}
                      </h3>
                    </Link>
                    <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold text-slate-700">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={12} className="text-[#B8860B]" /> Since {since}
                      </span>
                      {done && (
                        <span className="inline-flex items-center gap-1 text-[#8A6100]">
                          <Award size={12} /> Credential earned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto space-y-3 pt-2">
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">
                          Progress
                        </span>
                        <span className="font-serif text-base font-black tabular-nums text-[#08172D]">
                          {progress}%
                        </span>
                      </div>
                      <div className={`sa-bar ${done ? 'sa-bar-done' : ''}`}>
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <Link href={`/dashboard/learn/${course.slug}`}>
                      <button className="w-full bg-[#08172D] hover:bg-[#040C18] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer">
                        {done ? (
                          <>
                            <BookOpen size={14} /> Review Course
                          </>
                        ) : (
                          <>
                            <PlayCircle size={15} /> Resume Course
                          </>
                        )}
                        <ArrowRight size={14} />
                      </button>
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Filter tabs ─────────────────────── */

function FilterTabs({
  filter,
  onChange,
  counts,
}: {
  filter: Filter;
  onChange: (f: Filter) => void;
  counts: Record<Filter, number>;
}) {
  const options: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All Courses' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];
  return (
    <div className="inline-flex max-w-full shrink-0 overflow-x-auto rounded-2xl border-2 border-slate-200 bg-white p-1.5 shadow-2xs scrollbar-none gap-1">
      {options.map((o) => {
        const active = filter === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 sm:px-4 py-2 text-xs sm:text-[13px] font-bold transition-all cursor-pointer ${
              active
                ? 'bg-[#08172D] text-white shadow-sm'
                : 'text-slate-700 hover:text-[#08172D] hover:bg-slate-100'
            }`}
          >
            <span>{o.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-black tabular-nums ${
                active
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {counts[o.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ─────────────────────── Empty state ─────────────────────── */

function EmptyState({ filter }: { filter: Filter }) {
  return (
    <div className="sa-tile text-center p-8 sm:p-14 border-2 border-slate-200">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#FAF0D4] border border-[#E8CD82] text-[#8A6100]">
        <BookOpen size={26} strokeWidth={2} />
      </span>
      <h3 className="mt-4 font-serif text-xl sm:text-2xl font-bold text-[#08172D]">
        {filter === 'completed'
          ? 'No completed courses yet'
          : filter === 'in_progress'
          ? 'No courses currently in progress'
          : 'No active enrolments found'}
      </h3>
      <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600 max-w-md mx-auto leading-relaxed">
        {filter === 'completed'
          ? 'Keep studying your active courses to complete lessons, pass assessments, and unlock accredited certificates.'
          : 'Explore our catalog of practical law programmes, litigation masterclasses, and drafting workshops.'}
      </p>
      <Link href="/courses" className="mt-6 inline-flex">
        <button className="bg-[#08172D] hover:bg-[#040C18] text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all inline-flex items-center gap-2 cursor-pointer">
          <span>Browse All Courses</span>
          <ArrowRight size={15} />
        </button>
      </Link>
    </div>
  );
}
