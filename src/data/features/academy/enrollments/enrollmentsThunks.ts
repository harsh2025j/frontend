import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
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
