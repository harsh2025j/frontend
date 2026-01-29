import { createSlice } from "@reduxjs/toolkit";
import { AuditLogsState } from "./auditLogs.types";
import {
  fetchAuditLogs,
  fetchFailedAttempts,
  fetchAuditStatistics,
  exportAuditLogsToCsv,
} from "./auditLogsThunks";

const initialState: AuditLogsState = {
  logs: [],
  stats: null,
  total: 0,
  page: 1,
  limit: 50,
  loading: false,
  error: null,
  message: null,
};

const auditLogsSlice = createSlice({
  name: "auditLogs",
  initialState,
  reducers: {
    clearAuditLogsMessage: (state) => {
      state.message = null;
      state.error = null;
    },
    clearAuditLogsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Audit Logs
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        // Handle nested structure: action.payload.data.data or action.payload.data
        const payloadData = (action.payload as any)?.data;
        const data = Array.isArray(payloadData?.data) ? payloadData.data : (Array.isArray(payloadData) ? payloadData : []);
        state.logs = data;
        state.total = payloadData?.total || (Array.isArray(payloadData) ? 0 : data.length) || 0;
        state.page = payloadData?.page || 1;
        state.limit = payloadData?.limit || 50;
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Failed Attempts
    builder
      .addCase(fetchFailedAttempts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFailedAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = action.payload;
        state.total = action.payload.length;
      })
      .addCase(fetchFailedAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Statistics
    builder
      .addCase(fetchAuditStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditStatistics.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAuditStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Export to CSV
    builder
      .addCase(exportAuditLogsToCsv.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(exportAuditLogsToCsv.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload;
      })
      .addCase(exportAuditLogsToCsv.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAuditLogsMessage, clearAuditLogsError } = auditLogsSlice.actions;
export default auditLogsSlice.reducer;
