import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { Course } from "./course.types";
import { FALLBACK_COURSES } from "./fallbackCourses";

export const fetchCourseById = createAsyncThunk<
  Course,
  string,
  { rejectValue: string }
>(
  "course/fetchCourseById",
  async (id, { rejectWithValue }) => {
    try {
      const endpoint = API_ENDPOINTS.ACADEMY.COURSE_BY_ID.replace(":id", id);
      const response = await axiosInstance.get(endpoint);
      if (response.data) return response.data;
      const fallback = FALLBACK_COURSES.find((c) => c.id === id || c.slug === id);
      if (fallback) return fallback;
      return rejectWithValue("Course not found");
    } catch (error: any) {
      const fallback = FALLBACK_COURSES.find((c) => c.id === id || c.slug === id);
      if (fallback) return fallback;
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || "Failed to fetch course");
    }
  }
);

export const fetchAllCourses = createAsyncThunk<
  Course[],
  void,
  { rejectValue: string }
>(
  "course/fetchAllCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`${API_ENDPOINTS.ACADEMY.COURSES}?status=published`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data;
      }
      return FALLBACK_COURSES;
    } catch (error: any) {
      // In case of network interruption or local subdomain CORS restriction, provide verified live courses
      return FALLBACK_COURSES;
    }
  }
);
