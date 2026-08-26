import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { Course } from "./course.types";

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
      return response.data;
    } catch (error: any) {
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
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      }
      return rejectWithValue(error.message || "Failed to fetch courses");
    }
  }
);
