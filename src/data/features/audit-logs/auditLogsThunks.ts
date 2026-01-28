import { createAsyncThunk } from "@reduxjs/toolkit";
import auditLogsApi from "@/data/services/audit-logs-service/auditLogs.service";
import { AuditLogFilter } from "./auditLogs.types";

interface ApiError {
  message?: string;
}

/**
 * Fetch audit logs with filters
 */
export const fetchAuditLogs = createAsyncThunk(
  "auditLogs/fetchLogs",
  async (filter: AuditLogFilter, thunkAPI) => {
    try {
      const result = await auditLogsApi.fetchLogs(filter);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to fetch audit logs"
      );
    }
  }
);

/**
 * Fetch failed access attempts
 */
export const fetchFailedAttempts = createAsyncThunk(
  "auditLogs/fetchFailedAttempts",
  async (filter: Partial<AuditLogFilter>, thunkAPI) => {
    try {
      const result = await auditLogsApi.getFailedAttempts(filter);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to fetch failed attempts"
      );
    }
  }
);

/**
 * Fetch audit statistics
 */
export const fetchAuditStatistics = createAsyncThunk(
  "auditLogs/fetchStatistics",
  async (filter: Partial<AuditLogFilter> | undefined, thunkAPI) => {
    try {
      const result = await auditLogsApi.getStatistics(filter);
      return result;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to fetch statistics"
      );
    }
  }
);

/**
 * Export audit logs to CSV
 */
export const exportAuditLogsToCsv = createAsyncThunk(
  "auditLogs/exportToCsv",
  async (filter: AuditLogFilter, thunkAPI) => {
    try {
      const blob = await auditLogsApi.exportToCsv(filter);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return "Export successful";
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(
        apiError.message || "Failed to export audit logs"
      );
    }
  }
);
