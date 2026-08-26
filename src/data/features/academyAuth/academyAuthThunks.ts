import { createAsyncThunk } from "@reduxjs/toolkit";
import { courseApi } from "@/data/services/academy-service/course.service";

export const fetchCoursesAsync = createAsyncThunk(
  "academyAuth/fetchCourses",
  async (_, { rejectWithValue }) => {
    try {
      const response = await courseApi.fetchCourses();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch courses");
    }
  }
);

export const fetchCourseByIdAsync = createAsyncThunk(
  "academyAuth/fetchCourseById",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await courseApi.fetchCourseById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch course details");
    }
  }
);
