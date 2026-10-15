import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

/* ════════════════════════════════════════════════════════════
   Student performance record.

   Served by GET /academy/students/me/performance, which aggregates the
   signed-in student's enrolments, curriculum item durations, assessment
   attempts, assignment submissions and certificates into one response.

   Every number here is derived from stored rows. Fields that cannot be
   derived come back as null rather than as a placeholder — so the UI must
   handle null and say "not yet" instead of printing a zero that looks like
   a real measurement.
   ════════════════════════════════════════════════════════════ */

export type StudentActivityType =
  | "enrolled"
  | "lesson_completed"
  | "assessment_passed"
  | "assessment_attempt"
  | "assignment_submitted"
  | "assignment_verified"
  | "assignment_rejected"
  | "certificate_issued";

export interface StudentActivityEntry {
  type: StudentActivityType;
  at: string;
  title: string;
  detail: string | null;
  courseId: string | null;
  courseTitle: string | null;
  scorePct: number | null;
}

export interface StudentCoursePerformance {
  enrollmentId: string;
  courseId: string;
  title: string;
  slug: string | null;
  thumbnailUrl: string | null;
  category: string | null;
  level: string | null;
  status: string;
  enrolledAt: string;
  lastUpdatedAt: string;
  progressPct: number;
  itemsCompleted: number;
  itemsTotal: number;
  minutesCompleted: number;
  minutesTotal: number;
  assessmentAttempts: number;
  bestAssessmentScorePct: number | null;
  certificateId: string | null;
}

export interface StudentActivityDay {
  date: string; // YYYY-MM-DD
  events: number;
  enrollments: number;
  lessons?: number;
  attempts: number;
  submissions: number;
  certificates: number;
}

export interface StudentScorePoint {
  at: string;
  scorePct: number;
  title: string;
  courseTitle: string | null;
  passed: boolean;
}

export interface StudentCategoryBreakdown {
  category: string;
  courses: number;
  completed: number;
  avgProgressPct: number;
}

export interface StudentLevelBreakdown {
  level: string;
  courses: number;
  completed: number;
  avgProgressPct: number;
}

export interface StudentPerformance {
  summary: {
    coursesEnrolled: number;
    coursesInProgress: number;
    coursesCompleted: number;
    averageProgressPct: number;
    itemsCompleted: number;
    itemsTotal: number;
    /** Minutes of completed lesson content, summed from item durations. */
    learningMinutes: number;
    learningMinutesTotal: number;
    certificatesEarned: number;
    /** Distinct days with a recorded event in the last 30 days. */
    activeDaysLast30: number;
    lastActiveAt: string | null;
  };
  assessments: {
    attempts: number;
    completedAttempts: number;
    uniqueAssessments: number;
    assessmentsPassed: number;
    averageScorePct: number | null;
    bestScorePct: number | null;
  };
  assignments: {
    submitted: number;
    verified: number;
    rejected: number;
    awaitingReview: number;
    averageMarks: number | null;
  };
  courses: StudentCoursePerformance[];
  activity: StudentActivityEntry[];
  nextUp: {
    courseId: string;
    slug: string | null;
    title: string;
    progressPct: number;
    itemsRemaining: number;
  } | null;
  /** Last 90 days bucketed by day. Older entries first; today last. */
  activityByDay?: StudentActivityDay[];
  /** Completed assessment attempts, chronologically ascending. */
  scoreHistory?: StudentScorePoint[];
  categoryBreakdown?: StudentCategoryBreakdown[];
  levelBreakdown?: StudentLevelBreakdown[];
  streak?: {
    currentDays: number;
    longestDays: number;
    activeDaysLast7: number;
  };
  pace?: {
    eventsLast7: number;
    eventsPrior7: number;
  };
  generatedAt: string;
}

export const studentApi = {
  /** The signed-in student's own performance record. */
  async myPerformance(): Promise<StudentPerformance> {
    const res = await apiClient.get(API_ENDPOINTS.ACADEMY.STUDENTS.MY_PERFORMANCE);
    // The gateway wraps handler output in { success, message, data }; older
    // deployments return the payload directly, so accept both.
    return (res.data?.data ?? res.data) as StudentPerformance;
  },
};

/** "3h 20m", "45m", or "0m" when nothing has been completed yet. */
export function formatStudyTime(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
