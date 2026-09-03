export interface Enrollment {
  id: string;
  userId: string;
  studentName?: string;
  studentEmail?: string;
  courseId: string;
  status: string;
  progress: number;
  expiryDate?: string;
  createdAt: string;
  completedItemIds?: string[];
  course?: any; // You can import Course from course.types.ts if available
}

export interface CoursePayment {
  id: string;
  userId: string;
  referenceId: string; // courseId
  amount: number;
  status: string;
  razorpayOrderId?: string;
  createdAt: string;
}

export interface EnrollmentsState {
  myEnrollments: Enrollment[];
  allEnrollments: { data: Enrollment[], total: number, page: number, limit: number, totalPages: number };
  studentsSummary: { data: any[], total: number, page: number, limit: number, totalPages: number };
  allPayments: { data: CoursePayment[], total: number, page: number, limit: number, totalPages: number };
  isLoading: boolean;
  error: string | null;
  paymentOrder: any | null; // For holding Razorpay order details temporarily
}
