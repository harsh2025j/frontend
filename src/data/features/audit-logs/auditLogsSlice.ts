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
        state.logs = action.payload.data;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.limit = action.payload.limit;
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
