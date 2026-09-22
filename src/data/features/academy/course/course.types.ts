export interface CourseModuleItem {
  id: string;
  title: string;
  description?: string;
  type: string; // 'video', 'pdf', 'quiz', etc.
  duration?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description?: string;
  items?: CourseModuleItem[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  status: string;
  thumbnailUrl: string;
  subtitle: string;
  slug: string;
  language: string;
  level: string;
  category: string;
  tags?: string[];
  duration?: string;
  teachingHours?: string;
  timings?: string;
  scheduleNote?: string;
  startDate?: string;
  endDate?: string;
  instructorId?: string;
  instructorName?: string;
  instructorBio?: string;
  instructorImage?: string;
  instructors?: { name: string; bio: string; image: string }[];
  targetAudience?: string[];
  whatYouWillLearn?: string[];
  features?: string[];
  inclusions?: string[];
  hasCertificate?: boolean;
  hasLifetimeAccess?: boolean;
  finalAssessmentUnlockPct?: number;
  certificateRules?: {
    requireCourseComplete?: boolean;
    requireFinalAssessmentPass?: boolean;
    minProgressPct?: number;
    finalAssessmentId?: string;
    minAssessmentScorePct?: number;
  };
  faqs?: {q: string, a: string}[];
  modules?: CourseModule[];
  averageRating?: number;
  totalReviews?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseState {
  currentCourse: Course | null;
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}

export interface CourseReview {
  id: string;
  courseId: string;
  userId: string;
  studentName: string;
  studentEmail?: string;
  studentAvatar?: string;
  rating: number; // 1 - 5
  reviewText: string;
  isVerified: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  course?: {
    id: string;
    title: string;
    slug?: string;
  };
}

export interface CourseReviewSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  ratingPercentages: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export interface CourseReviewsResponse {
  reviews: CourseReview[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary: CourseReviewSummary;
}

export interface MyReviewEligibility {
  isEnrolled: boolean;
  canReview: boolean;
  hasReviewed: boolean;
  progress: number;
  reason?: string;
  review?: CourseReview | null;
}
