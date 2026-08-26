import { createSlice } from "@reduxjs/toolkit";
import { fetchCoursesAsync, fetchCourseByIdAsync } from "./academyAuthThunks";
import { AcademyState } from "./academyAuth.types";

const initialState: AcademyState = {
  courses: [],
  currentCourse: null,
  loading: false,
  error: null,
};

const academyAuthSlice = createSlice({
  name: "academyAuth",
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
    },
    resetAcademyState: (state) => {
      state.error = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Courses
      .addCase(fetchCoursesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoursesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.courses = action.payload || [];
      })
      .addCase(fetchCoursesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Single Course
      .addCase(fetchCourseByIdAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCourseByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearCurrentCourse, resetAcademyState } = academyAuthSlice.actions;
export default academyAuthSlice.reducer;
