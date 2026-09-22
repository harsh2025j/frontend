import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { usersApi } from "@/data/services/users-service/users-service";
import { Enrollment, CoursePayment } from "./enrollments.types";

export const createCoursePaymentOrder = createAsyncThunk<
  any,
  string | { courseId: string; couponCode?: string },
  { rejectValue: string }
>(
  "enrollments/createCoursePaymentOrder",
  async (arg, { rejectWithValue }) => {
    try {
      const courseId = typeof arg === "string" ? arg : arg.courseId;
      const couponCode = typeof arg === "object" ? arg.couponCode : undefined;
      const endpoint = API_ENDPOINTS.ACADEMY.ENROLLMENTS.CREATE_ORDER.replace(":courseId", courseId);
      const response = await axiosInstance.post(endpoint, { couponCode });
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
  { data: any[]; total: number; page: number; limit: number; totalPages: number; platformCount?: number; externalCount?: number },
  { page?: number; limit?: number; search?: string; courseId?: string; source?: string },
  { rejectValue: string }
>(
  "enrollments/fetchStudentsSummary",
  async (params, { rejectWithValue }) => {
    try {
      const queryParams: Record<string, any> = {
        page: params.page || 1,
        limit: params.limit || 10,
      };
      if (params.search) queryParams.search = params.search;
      if (params.courseId && params.courseId !== "all") queryParams.courseId = params.courseId;
      if (params.source && params.source !== "all") queryParams.source = params.source;

      const response = await axiosInstance.get("/academy/enrollments/students-summary", { params: queryParams });
      const data = response.data;

      // Fetch missing names from user-service if any
      const merged = await Promise.all(
        (data.data || []).map(async (s: any) => {
          if (!s.studentName || s.studentName === "Unknown Student") {
            try {
              const userRes = await usersApi.getUserById(s.userId);
              const u: any = userRes.data || userRes;
              s.studentName = `${u.firstName || "" } ${u.lastName || ""}`.trim() || u.name || "Unknown Student";
              s.studentEmail = u.email;
            } catch (e) {
              // Ignore failure to fetch single user
            }
          }
          return s;
        })
      );

      data.data = merged;
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch students summary");
    }
  }
);
