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
          <p className="sa-runhead">My courses</p>
          <h1 className="font-serif text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-[color:var(--sa-ink)] sm:text-[1.875rem]">
            Your learning library
          </h1>
          <p className="mt-1.5 text-[13px] text-[color:var(--sa-ink-3)]">
            Everything you&apos;re enrolled in, with progress tracked across lessons.
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
              <div className="aspect-video w-full animate-pulse bg-[color:var(--sa-cream-2)]" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-24 animate-pulse rounded bg-[color:var(--sa-cream-2)]" />
                <div className="h-5 w-full animate-pulse rounded bg-[color:var(--sa-cream-2)]" />
                <div className="h-5 w-2/3 animate-pulse rounded bg-[color:var(--sa-cream-2)]" />
                <div className="h-2 w-full animate-pulse rounded-full bg-[color:var(--sa-cream-2)]" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-[color:var(--sa-cream-2)]" />
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
                className="sa-tile sa-tile-hover sa-col-sm-6 sa-col-lg-4 group !p-0 overflow-hidden flex flex-col"
              >
                <Link
                  href={`/dashboard/learn/${course.slug}`}
                  className="relative block aspect-video w-full overflow-hidden bg-[color:var(--sa-cream-2)]"
                >
                  <img
                    src={
                      course.thumbnailUrl ||
                      'https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop'
                    }
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.68)] via-[rgba(11,18,32,0.08)] to-transparent"
                  />

                  {/* Status badge: solid, high contrast, reads on any thumbnail */}
                  {done ? (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[color:var(--sa-sage-2)] px-2.5 py-[5px] text-[11px] font-semibold text-white shadow-sm">
                      <CheckCircle2 size={12} strokeWidth={2.5} />
                      Completed
                    </span>
                  ) : (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-[5px] text-[11px] font-semibold text-[color:var(--sa-ink)] shadow-sm">
                      <span
                        aria-hidden="true"
                        className="inline-block h-1.5 w-1.5 rounded-full bg-[color:var(--sa-gold)]"
                      />
                      In progress · {progress}%
                    </span>
                  )}

                  {/* Hover play affordance */}
                  <span
                    className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-[color:var(--sa-gold)] text-[#1F1703] shadow-[0_6px_18px_-4px_rgba(183,145,58,0.6)] ring-2 ring-white/80 transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    {done ? (
                      <BookOpen size={16} strokeWidth={2.25} />
                    ) : (
                      <Play size={16} fill="currentColor" className="ml-0.5" />
                    )}
                  </span>
                </Link>

                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="min-w-0">
                    <Link href={`/dashboard/learn/${course.slug}`}>
                      <h3 className="line-clamp-2 font-serif text-[1.0625rem] font-bold leading-snug tracking-[-0.005em] text-[color:var(--sa-ink)] transition-colors hover:text-[color:var(--sa-navy-2)]">
                        {course.title}
                      </h3>
                    </Link>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-[color:var(--sa-ink-4)]">
                      <span className="inline-flex items-center gap-1">
                        <Clock size={11} /> Since {since}
                      </span>
                      {done && (
                        <span className="inline-flex items-center gap-1 text-[color:var(--sa-gold-3)]">
                          <Award size={11} /> Credential earned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div>
                      <div className="mb-1.5 flex items-baseline justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[color:var(--sa-ink-3)]">
                          Progress
                        </span>
                        <span className="font-serif text-[14px] font-bold tabular-nums text-[color:var(--sa-ink)]">
                          {progress}%
                        </span>
                      </div>
                      <div className={`sa-bar ${done ? 'sa-bar-done' : ''}`}>
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </div>

                    <Link href={`/dashboard/learn/${course.slug}`}>
                      <button className="sa-btn sa-btn-primary sa-btn-block">
                        {done ? (
                          <>
                            <BookOpen size={14} /> Review course
                          </>
                        ) : (
                          <>
                            <PlayCircle size={14} /> Resume course
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
    { key: 'all', label: 'All' },
    { key: 'in_progress', label: 'In progress' },
    { key: 'completed', label: 'Completed' },
  ];
  return (
    <div className="inline-flex max-w-full shrink-0 overflow-x-auto rounded-full border border-[rgba(11,18,32,0.08)] bg-[color:var(--sa-cream)] p-1 scrollbar-none">
      {options.map((o) => {
        const active = filter === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 sm:px-4 py-1.5 text-xs sm:text-[12.5px] font-semibold transition-colors cursor-pointer ${
              active
                ? 'bg-white text-[color:var(--sa-ink)] shadow-sm'
                : 'text-[color:var(--sa-ink-3)] hover:text-[color:var(--sa-ink)]'
            }`}
          >
            {o.label}
            <span
              className={`rounded-full px-1.5 text-[10.5px] tabular-nums ${
                active
                  ? 'bg-[color:var(--sa-cream-2)] text-[color:var(--sa-ink-2)]'
                  : 'text-[color:var(--sa-ink-4)]'
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
    <div className="sa-tile sa-tile-pad-lg text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-[color:var(--sa-gold-soft)] text-[color:var(--sa-gold-2)]">
        <BookOpen size={22} />
      </span>
      <h3 className="mt-4 font-serif text-[1.25rem] font-bold text-[color:var(--sa-ink)]">
        {filter === 'completed'
          ? 'No completed courses yet'
          : filter === 'in_progress'
          ? 'No courses in progress'
          : 'No active enrolments'}
      </h3>
      <p className="sa-sub mx-auto mt-2 max-w-md">
        {filter === 'completed'
          ? 'Keep learning to complete your enrolled courses and unlock credentials.'
          : 'Explore the academy to start learning today.'}
      </p>
      <Link href="/courses" className="mt-5 inline-flex">
        <button className="sa-btn sa-btn-gold">
          Browse courses <ArrowRight size={15} />
        </button>
      </Link>
    </div>
  );
}
