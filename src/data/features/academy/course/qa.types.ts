export type QuestionStatus = 'pending' | 'clarified' | 'answered_live';

export interface CourseAnswer {
  id: string;
  questionId: string;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userRole?: string;
  content: string;
  isInstructor: boolean;
  isAccepted: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseQuestion {
  id: string;
  courseId: string;
  itemId?: string | null;
  moduleId?: string | null;
  userId: string;
  userName: string;
  userAvatar?: string | null;
  userRole?: string;
  title: string;
  content: string;
  upvotesCount: number;
  status: QuestionStatus;
  isResolved: boolean;
  liveSessionId?: string | null;
  answers: CourseAnswer[];
  answersCount: number;
  hasUpvoted: boolean;
  instructorAnswered: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseQAPaginatedResponse {
  data: CourseQuestion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CourseQAStats {
  totalQuestions: number;
  pendingCount: number;
  clarifiedCount: number;
  answeredLiveCount: number;
  chapterBreakdown: {
    moduleId: string;
    unresolvedCount: number;
  }[];
}
