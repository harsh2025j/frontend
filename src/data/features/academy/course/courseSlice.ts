import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CourseState, Course } from "./course.types";
import { fetchCourseById, fetchAllCourses } from "./courseThunks";

const initialState: CourseState = {
  currentCourse: null,
  courses: [],
  isLoading: false,
  error: null,
};

const courseSlice = createSlice({
  name: "course",
  initialState,
  reducers: {
    clearCurrentCourse: (state) => {
      state.currentCourse = null;
      state.error = null;
    },
    updateCourseItemData: (
      state,
      action: PayloadAction<{ itemId: string; liveData?: any; [key: string]: any }>
    ) => {
      if (!state.currentCourse?.modules) return;
      const { itemId, liveData, ...rest } = action.payload;
      state.currentCourse.modules.forEach((mod: any) => {
        if (mod.items) {
          const found = mod.items.find((it: any) => it.id === itemId);
          if (found) {
            if (liveData) found.liveData = { ...found.liveData, ...liveData };
            Object.assign(found, rest);
          }
        }
        if (mod.submodules) {
          mod.submodules.forEach((sub: any) => {
            if (sub.items) {
              const found = sub.items.find((it: any) => it.id === itemId);
              if (found) {
                if (liveData) found.liveData = { ...found.liveData, ...liveData };
                Object.assign(found, rest);
              }
            }
          });
        }
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCourseById
      .addCase(fetchCourseById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
        state.isLoading = false;
        state.currentCourse = action.payload;
      })
      .addCase(fetchCourseById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch course";
      })
      // fetchAllCourses
      .addCase(fetchAllCourses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCourses.fulfilled, (state, action: PayloadAction<Course[]>) => {
        state.isLoading = false;
        state.courses = action.payload;
      })
      .addCase(fetchAllCourses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch courses";
      });
  },
});

export const { clearCurrentCourse, updateCourseItemData } = courseSlice.actions;
export default courseSlice.reducer;
