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
  faqs?: {q: string, a: string}[];
  modules?: CourseModule[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseState {
  currentCourse: Course | null;
  courses: Course[];
  isLoading: boolean;
  error: string | null;
}
