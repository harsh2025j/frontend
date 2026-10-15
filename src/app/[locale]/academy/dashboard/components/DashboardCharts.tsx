"use client";

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flame, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type {
  StudentActivityDay,
  StudentCategoryBreakdown,
  StudentScorePoint,
} from "@/data/services/academy-service/student.service";

/* ─────────────────────────── Shared bits ─────────────────────────── */

const COLORS = {
  ink: "var(--sa-ink)",
  ink3: "var(--sa-ink-3)",
  ink4: "var(--sa-ink-4)",
  ink5: "var(--sa-ink-5)",
  line: "var(--sa-line)",
  gold: "var(--sa-gold)",
  gold2: "var(--sa-gold-2)",
  blue: "var(--sa-blue)",
  sage: "var(--sa-sage)",
  clay: "var(--sa-clay)",
  cream: "var(--sa-cream)",
  cream2: "var(--sa-cream-2)",
  paper: "var(--sa-paper)",
};

// Pie slice palette; cycled over categories/levels.
const SLICES = [
  "#C9A227", // gold
  "#1A4FA3", // blue
  "#13705F", // sage
  "#A8402A", // clay
  "#7E6413", // gold-3
  "#143E82", // blue-2
  "#0E5547", // sage-2
  "#64718A", // ink-3
];

/* ──────────────────── 1. Streak + pace banner ──────────────────── */

export function StreakBanner({
  streak,
  pace,
}: {
  streak: { currentDays: number; longestDays: number; activeDaysLast7: number };
  pace: { eventsLast7: number; eventsPrior7: number };
}) {
  const delta = pace.eventsLast7 - pace.eventsPrior7;
  const trendIcon =
    delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus;
  const trendTone =
    delta > 0
      ? "text-[color:var(--sa-sage)]"
      : delta < 0
      ? "text-[color:var(--sa-clay)]"
      : "text-[color:var(--sa-ink-4)]";
  const TrendIcon = trendIcon;

  const paceLabel =
    pace.eventsPrior7 === 0
      ? pace.eventsLast7 > 0
        ? "Starting fresh"
        : "No activity"
      : `${delta > 0 ? "+" : ""}${delta} vs prior week`;

  return (
    <div className="grid gap-px border-y border-[color:var(--sa-ink)] bg-[color:var(--sa-line)] sm:grid-cols-3">
      <div className="flex items-start gap-3 bg-[color:var(--sa-paper)] p-4 sm:p-5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[color:var(--sa-gold-soft-2)] text-[color:var(--sa-gold-2)]">
          <Flame size={18} fill="currentColor" strokeWidth={0} />
        </span>
        <div className="min-w-0">
          <p className="ac-ledger-label !flex-none">Current streak</p>
          <p className="ac-ledger-value mt-1 !text-[1.5rem]">
            {streak.currentDays}
            <span className="ml-1 text-[0.45em] font-normal text-[color:var(--sa-ink-4)]">
              {streak.currentDays === 1 ? "day" : "days"}
            </span>
          </p>
          <p className="mt-1 text-[11.5px] text-[color:var(--sa-ink-3)]">
            Longest {streak.longestDays} {streak.longestDays === 1 ? "day" : "days"}
          </p>
        </div>
      </div>

      <div className="bg-[color:var(--sa-paper)] p-4 sm:p-5">
        <p className="ac-ledger-label !flex-none">Active this week</p>
        <p className="ac-ledger-value mt-1 !text-[1.5rem]">
          {streak.activeDaysLast7}
          <span className="text-[0.45em] font-normal text-[color:var(--sa-ink-4)]">
            {" "}
            / 7
          </span>
        </p>
        <div className="mt-3 flex items-center gap-1">
          {Array.from({ length: 7 }).map((_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full"
              style={{
                background:
                  i < streak.activeDaysLast7
                    ? "var(--sa-gold)"
                    : "var(--sa-line)",
              }}
            />
          ))}
        </div>
      </div>

      <div className="bg-[color:var(--sa-paper)] p-4 sm:p-5">
        <p className="ac-ledger-label !flex-none">This week's events</p>
        <p className="ac-ledger-value mt-1 !text-[1.5rem]">{pace.eventsLast7}</p>
        <p
          className={`mt-1 inline-flex items-center gap-1 text-[11.5px] font-medium ${trendTone}`}
        >
          <TrendIcon size={12} />
          {paceLabel}
        </p>
      </div>
    </div>
  );
}

/* ──────────────────── 2. 90-day activity heatmap ──────────────────── */

function heatmapTone(events: number): string {
  if (events <= 0) return "var(--sa-cream-2)";
  if (events === 1) return "rgba(201, 162, 39, 0.28)";
  if (events === 2) return "rgba(201, 162, 39, 0.55)";
  if (events === 3) return "rgba(201, 162, 39, 0.8)";
  return "var(--sa-gold)";
}

export function ActivityHeatmap({ days }: { days: StudentActivityDay[] }) {
  // Lay out as weeks (columns) of 7 days. Last column = this week.
  const weeks = useMemo(() => {
    const out: StudentActivityDay[][] = [];
    const chunk = 7;
    // The server returns days chronologically. Pad the start so weeks align
    // to a Sunday grid.
    if (days.length === 0) return out;

    const first = new Date(days[0].date);
    const padStart = first.getUTCDay(); // 0..6, Sunday = 0
    const padded: (StudentActivityDay | null)[] = Array(padStart).fill(null);
    padded.push(...days);
    while (padded.length % chunk !== 0) padded.push(null);

    for (let i = 0; i < padded.length; i += chunk) {
      out.push(padded.slice(i, i + chunk) as StudentActivityDay[]);
    }
    return out;
  }, [days]);

  const totalEvents = days.reduce((s, d) => s + d.events, 0);
  const activeDays = days.filter((d) => d.events > 0).length;

  return (
    <div className="sa-tile h-full">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="sa-label">Activity · last 90 days</p>
          <p className="mt-1.5 text-[12.5px] text-[color:var(--sa-ink-3)]">
            {totalEvents} events over {activeDays} active{" "}
            {activeDays === 1 ? "day" : "days"}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.08em] text-[color:var(--sa-ink-4)]">
          <span>Less</span>
          {[0, 1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className="h-3 w-3 rounded-[3px]"
              style={{ background: heatmapTone(n) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="sa-scroll-x pb-1">
        <div
          className="flex min-w-fit gap-[4px]"
          role="img"
          aria-label={`Learning activity across the last 90 days: ${totalEvents} events on ${activeDays} days`}
        >
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[4px]">
              {week.map((d, di) =>
                d ? (
                  <span
                    key={d.date}
                    title={`${d.date} · ${d.events} event${
                      d.events === 1 ? "" : "s"
                    }`}
                    className="sa-heat-cell"
                    style={{ background: heatmapTone(d.events) }}
                  />
                ) : (
                  <span
                    key={`pad-${wi}-${di}`}
                    aria-hidden="true"
                    className="h-[12px] w-[12px] rounded-[3px]"
                  />
                ),
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ──────────────────── 3. Weekly events bar chart ──────────────────── */

export function WeeklyActivityChart({ days }: { days: StudentActivityDay[] }) {
  const weeks = useMemo(() => {
    // Last 8 weeks of 7 days each, from the right.
    const slice = days.slice(-56);
    const out: {
      label: string;
      events: number;
      attempts: number;
      submissions: number;
      enrollments: number;
      certificates: number;
    }[] = [];
    for (let i = 0; i < slice.length; i += 7) {
      const chunk = slice.slice(i, i + 7);
      if (chunk.length === 0) continue;
      const end = new Date(chunk[chunk.length - 1].date);
      const label = end.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      });
      out.push({
        label,
        events: chunk.reduce((s, d) => s + d.events, 0),
        attempts: chunk.reduce((s, d) => s + d.attempts, 0),
        submissions: chunk.reduce((s, d) => s + d.submissions, 0),
        enrollments: chunk.reduce((s, d) => s + d.enrollments, 0),
        certificates: chunk.reduce((s, d) => s + d.certificates, 0),
      });
    }
    return out;
  }, [days]);

  const hasData = weeks.some((w) => w.events > 0);

  return (
    <div className="sa-tile h-full">
      <p className="sa-label">Weekly events · last 8 weeks</p>
      <p className="mb-4 mt-1.5 text-[12.5px] text-[color:var(--sa-ink-3)]">
        Submissions, assessments, enrolments and certificates per week
      </p>

      {hasData ? (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeks}
              margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--sa-line)"
                strokeDasharray="2 4"
              />
              <XAxis
                dataKey="label"
                stroke="var(--sa-ink-4)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "var(--sa-line)" }}
              />
              <YAxis
                stroke="var(--sa-ink-4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                cursor={{ fill: "var(--sa-cream)" }}
                contentStyle={{
                  background: "var(--sa-paper)",
                  border: "1px solid var(--sa-line)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
                labelStyle={{ color: "var(--sa-ink-3)", fontSize: 11 }}
              />
              <Bar
                dataKey="submissions"
                stackId="e"
                fill={COLORS.blue}
                name="Submissions"
              />
              <Bar
                dataKey="attempts"
                stackId="e"
                fill={COLORS.sage}
                name="Assessments"
              />
              <Bar
                dataKey="enrollments"
                stackId="e"
                fill={COLORS.gold}
                name="Enrolments"
              />
              <Bar
                dataKey="certificates"
                stackId="e"
                fill={COLORS.clay}
                name="Certificates"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <EmptyChart text="Weekly activity will appear once you start learning." />
      )}
    </div>
  );
}

/* ──────────────────── 4. Score history line ──────────────────── */

export function ScoreTrendChart({ history }: { history: StudentScorePoint[] }) {
  const data = useMemo(
    () =>
      history.map((p, i) => ({
        n: i + 1,
        score: p.scorePct,
        title: p.title,
        courseTitle: p.courseTitle,
        at: new Date(p.at).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
        }),
      })),
    [history],
  );

  return (
    <div className="sa-tile h-full">
      <p className="sa-label">Assessment score trend</p>
      <p className="mb-4 mt-1.5 text-[12.5px] text-[color:var(--sa-ink-3)]">
        Score on each completed attempt, in order
      </p>

      {data.length >= 2 ? (
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 12, left: -16, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                stroke="var(--sa-line)"
                strokeDasharray="2 4"
              />
              <XAxis
                dataKey="at"
                stroke="var(--sa-ink-4)"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "var(--sa-line)" }}
              />
              <YAxis
                stroke="var(--sa-ink-4)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                cursor={{ stroke: "var(--sa-line)", strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--sa-paper)",
                  border: "1px solid var(--sa-line)",
                  borderRadius: 4,
                  fontSize: 12,
                }}
                formatter={(value: any) => [`${value}%`, "Score"]}
                labelFormatter={(_label, items: any) => {
                  const p = items?.[0]?.payload;
                  if (!p) return _label;
                  return `${p.title}${p.courseTitle ? ` · ${p.courseTitle}` : ""} · ${p.at}`;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={COLORS.blue}
                strokeWidth={2}
                dot={{
                  r: 3,
                  fill: COLORS.gold,
                  stroke: COLORS.gold2,
                  strokeWidth: 1,
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : data.length === 1 ? (
        <div className="flex h-56 flex-col items-center justify-center text-center">
          <p className="font-serif text-[2rem] font-bold tabular-nums text-[color:var(--sa-ink)]">
            {data[0].score}%
          </p>
          <p className="mt-2 text-[12.5px] text-[color:var(--sa-ink-3)]">
            {data[0].title}
          </p>
          <p className="mt-1 text-[11.5px] text-[color:var(--sa-ink-4)]">
            Trend appears after a second attempt
          </p>
        </div>
      ) : (
        <EmptyChart text="Scores appear after your first assessment." />
      )}
    </div>
  );
}

/* ──────────────────── 5. Category donut ──────────────────── */

export function CategoryDonut({
  breakdown,
}: {
  breakdown: StudentCategoryBreakdown[];
}) {
  const data = useMemo(
    () =>
      breakdown
        .filter((b) => b.courses > 0)
        .map((b) => ({
          name: b.category,
          value: b.courses,
          completed: b.completed,
          avg: b.avgProgressPct,
        })),
    [breakdown],
  );

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="sa-tile h-full">
      <p className="sa-label">Course mix</p>
      <p className="mb-4 mt-1.5 text-[12.5px] text-[color:var(--sa-ink-3)]">
        Enrolments by category
      </p>

      {total > 0 ? (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative h-44 w-full shrink-0 sm:w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="60%"
                  outerRadius="92%"
                  stroke="var(--sa-paper)"
                  strokeWidth={2}
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={SLICES[i % SLICES.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--sa-paper)",
                    border: "1px solid var(--sa-line)",
                    borderRadius: 4,
                    fontSize: 12,
                  }}
                  formatter={(value: any, _name: any, item: any) => [
                    `${value} ${value === 1 ? "course" : "courses"} · avg ${item.payload.avg}%`,
                    item.payload.name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="font-serif text-[1.5rem] font-bold leading-none tabular-nums text-[color:var(--sa-ink)]">
                  {total}
                </p>
                <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-[color:var(--sa-ink-4)]">
                  {total === 1 ? "course" : "courses"}
                </p>
              </div>
            </div>
          </div>

          <ul className="min-w-0 flex-1 space-y-2">
            {data.map((d, i) => {
              const pct = Math.round((d.value / total) * 100);
              return (
                <li
                  key={d.name}
                  className="flex items-center gap-2.5 text-[12.5px]"
                >
                  <span
                    aria-hidden="true"
                    className="h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: SLICES[i % SLICES.length] }}
                  />
                  <span className="min-w-0 flex-1 truncate font-medium text-[color:var(--sa-ink)]">
                    {d.name}
                  </span>
                  <span className="ac-nums shrink-0 tabular-nums text-[color:var(--sa-ink-3)]">
                    {d.value} · {pct}%
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyChart text="Enrol in courses to see your mix." />
      )}
    </div>
  );
}

/* ──────────────────── Shared empty state ──────────────────── */

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-44 items-center justify-center rounded-xl border border-dashed border-[rgba(11,18,32,0.08)] bg-[color:var(--sa-cream)] px-6 text-center">
      <p className="text-[12.5px] text-[color:var(--sa-ink-3)]">{text}</p>
    </div>
  );
}
