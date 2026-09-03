import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { usersApi } from "@/data/services/users-service/users-service";
import { Enrollment, CoursePayment } from "./enrollments.types";

export const createCoursePaymentOrder = createAsyncThunk<
  any,
  string, // courseId
  { rejectValue: string }
>(
  "enrollments/createCoursePaymentOrder",
  async (courseId, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.ACADEMY.ENROLLMENTS.CREATE_ORDER.replace(":courseId", courseId);
      const response = await axiosInstance.post(endpoint);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create payment order");
    }
  }
);

export const verifyCoursePayment = createAsyncThunk<
  any,
  { courseId: string; razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
  { rejectValue: string }
>(
  "enrollments/verifyCoursePayment",
  async (data, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.ACADEMY.ENROLLMENTS.VERIFY.replace(":courseId", data.courseId);
      const response = await axiosInstance.post(endpoint, {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to verify payment");
    }
  }
);

export const fetchMyEnrollments = createAsyncThunk<
  Enrollment[],
  void,
  { rejectValue: string }
>(
  "enrollments/fetchMyEnrollments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ACADEMY.ENROLLMENTS.MY_COURSES);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch enrollments");
    }
  }
);

export const updateCourseProgress = createAsyncThunk<
  any,
  { courseId: string; itemId: string; completed: boolean },
  { rejectValue: string }
>(
  "enrollments/updateCourseProgress",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const endpoint = API_ENDPOINTS.ACADEMY.ENROLLMENTS.CREATE_ORDER.replace(":courseId", data.courseId).replace("/create-order", "/progress");
      const response = await axiosInstance.post(endpoint, {
        itemId: data.itemId,
        completed: data.completed,
      });
      // We update the Redux state directly in enrollmentsSlice, no need to refetch
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update progress");
    }
  }
);

export const fetchAllEnrollments = createAsyncThunk<
  { data: Enrollment[], total: number, page: number, limit: number, totalPages: number },
  { page?: number; limit?: number; search?: string; status?: string },
  { rejectValue: string }
>(
  "enrollments/fetchAllEnrollments",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ACADEMY.ENROLLMENTS.ALL, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch all enrollments");
    }
  }
);

export const fetchAllCoursePayments = createAsyncThunk<
  { data: CoursePayment[], total: number, page: number, limit: number, totalPages: number },
  { page?: number; limit?: number; search?: string; status?: string },
  { rejectValue: string }
>(
  "enrollments/fetchAllCoursePayments",
  async (params, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ENDPOINTS.ACADEMY.PAYMENTS.ALL, { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch payments");
    }
  }
);

export const fetchStudentsSummary = createAsyncThunk<
  { data: any[], total: number, page: number, limit: number, totalPages: number },
  { page?: number; limit?: number; search?: string; courseId?: string },
  { rejectValue: string }
>(
  "enrollments/fetchStudentsSummary",
  async (params, { rejectWithValue }) => {
    try {
      if (!params.courseId || params.courseId === 'all') {
        // Fetch ALL students from user-service regardless of enrollments
        const usersRes = await usersApi.fetchUsers({ 
          roleName: 'student', 
          page: params.page, 
          limit: params.limit, 
          search: params.search 
        });
        const users = usersRes.data || usersRes;
        const userIds = users.data ? users.data.map((u: any) => u.id || u._id) : [];

        // Fetch their enrollments in batch
        let enrollments: any[] = [];
        if (userIds.length > 0) {
          const encRes = await axiosInstance.get('/academy/enrollments/by-users', { params: { userIds: userIds.join(',') } });
          enrollments = encRes.data || [];
        }

        // Merge users and enrollments
        const mergedData = (users.data || []).map((u: any) => {
          const uId = u.id || u._id;
          const userEnrolls = enrollments.filter((e: any) => e.userId === uId);
          return {
            userId: uId,
            studentName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Unknown Student',
            studentEmail: u.email,
            joinedAt: u.createdAt,
            enrollments: userEnrolls.map((e: any) => ({
              id: e.id,
              courseId: e.courseId,
              courseName: e.course?.title || 'Unknown Course',
              progress: e.progress,
              status: e.status,
              enrolledAt: e.createdAt
            }))
          };
        });

        return {
          data: mergedData,
          total: users.total || 0,
          page: params.page || 1,
          limit: params.limit || 10,
          totalPages: (users as any).totalPages || Math.ceil((users.total || 0) / (params.limit || 10)) || 1
        };
      } else {
        // Fetch only students enrolled in this specific course
        let userIds: string[] | undefined;
        let queryParams: Record<string, any> = { ...params };
        
        if (params.search) {
          const usersRes = await usersApi.fetchUsers({ 
            roleName: 'student', 
            search: params.search,
            limit: 100 // Get up to 100 matching users
          });
          const users = usersRes.data || usersRes;
          userIds = users.data ? users.data.map((u: any) => u.id || u._id) : [];
          
          if (userIds.length === 0) {
            return { data: [], total: 0, page: params.page || 1, limit: params.limit || 10, totalPages: 0 };
          }
          
          queryParams.userIds = userIds.join(',');
          delete queryParams.search; // Backend shouldn't search by string if userIds provided
        }

        const response = await axiosInstance.get('/academy/enrollments/students-summary', { params: queryParams });
        const data = response.data;
        
        // Fetch missing names from user-service
        const merged = await Promise.all((data.data || []).map(async (s: any) => {
          if (!s.studentName || s.studentName === 'Unknown Student') {
            try {
              const userRes = await usersApi.getUserById(s.userId);
              const u: any = userRes.data || userRes;
              s.studentName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Unknown Student';
              s.studentEmail = u.email;
            } catch (e) {
              // Ignore failure to fetch single user
            }
          }
          return s;
        }));
        
        data.data = merged;
        return data;
      }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch students summary");
    }
  }
);
