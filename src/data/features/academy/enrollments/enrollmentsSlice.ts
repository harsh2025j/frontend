import { createSlice } from "@reduxjs/toolkit";
import { EnrollmentsState } from "./enrollments.types";
import {
  createCoursePaymentOrder,
  verifyCoursePayment,
  fetchMyEnrollments,
  fetchAllEnrollments,
  fetchAllCoursePayments,
} from "./enrollmentsThunks";

const initialState: EnrollmentsState = {
  myEnrollments: [],
  allEnrollments: { data: [], total: 0, page: 1, limit: 10, totalPages: 1 },
  allPayments: { data: [], total: 0, page: 1, limit: 10, totalPages: 1 },
  isLoading: false,
  error: null,
  paymentOrder: null,
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    clearPaymentOrder: (state) => {
      state.paymentOrder = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createCoursePaymentOrder
      .addCase(createCoursePaymentOrder.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCoursePaymentOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentOrder = action.payload;
      })
      .addCase(createCoursePaymentOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to create order";
      })
      
      // verifyCoursePayment
      .addCase(verifyCoursePayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyCoursePayment.fulfilled, (state) => {
        state.isLoading = false;
        state.paymentOrder = null;
      })
      .addCase(verifyCoursePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to verify payment";
      })

      // fetchMyEnrollments
      .addCase(fetchMyEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMyEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myEnrollments = action.payload;
      })
      .addCase(fetchMyEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch enrollments";
      })

      // fetchAllEnrollments
      .addCase(fetchAllEnrollments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEnrollments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allEnrollments = action.payload;
      })
      .addCase(fetchAllEnrollments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch enrollments";
      })

      // fetchAllCoursePayments
      .addCase(fetchAllCoursePayments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCoursePayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allPayments = action.payload;
      })
      .addCase(fetchAllCoursePayments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || "Failed to fetch payments";
      });
  },
});

export const { clearPaymentOrder, clearError } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
