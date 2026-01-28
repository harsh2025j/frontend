import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";
import { AuditLog, AuditLogFilter, AuditLogStats } from "@/data/features/audit-logs/auditLogs.types";

const auditLogsApi = {
  /**
   * Fetch all audit logs with filters
   */
  fetchLogs: async (filter: AuditLogFilter): Promise<{ data: AuditLog[]; total: number; page: number; limit: number }> => {
    const params = new URLSearchParams();

    if (filter.userId) params.append("userId", filter.userId);
    if (filter.userEmail) params.append("userEmail", filter.userEmail);
    if (filter.action) params.append("action", filter.action);
    if (filter.resource) params.append("resource", filter.resource);
    if (filter.resourceId) params.append("resourceId", filter.resourceId);
    if (filter.success !== undefined) params.append("success", String(filter.success));
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);
    if (filter.policyName) params.append("policyName", filter.policyName);
    if (filter.service) params.append("service", filter.service);
    if (filter.page) params.append("page", String(filter.page));
    if (filter.limit) params.append("limit", String(filter.limit));

    const response = await apiClient.get(`${API_ENDPOINTS.AUDIT_LOGS.BASE}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get failed access attempts
   */
  getFailedAttempts: async (filter: Partial<AuditLogFilter>): Promise<AuditLog[]> => {
    const params = new URLSearchParams();

    if (filter.userId) params.append("userId", filter.userId);
    if (filter.resource) params.append("resource", filter.resource);
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);
    if (filter.limit) params.append("limit", String(filter.limit));

    const response = await apiClient.get(`${API_ENDPOINTS.AUDIT_LOGS.FAILED_ATTEMPTS}?${params.toString()}`);
    return response.data;
  },

  /**
   * Get audit statistics
   */
  getStatistics: async (filter?: Partial<AuditLogFilter>): Promise<AuditLogStats> => {
    const params = new URLSearchParams();

    if (filter?.startDate) params.append("startDate", filter.startDate);
    if (filter?.endDate) params.append("endDate", filter.endDate);

    const response = await apiClient.get(`${API_ENDPOINTS.AUDIT_LOGS.STATISTICS}?${params.toString()}`);
    return response.data;
  },

  /**
   * Export audit logs to CSV
   */
  exportToCsv: async (filter: AuditLogFilter): Promise<Blob> => {
    const params = new URLSearchParams();

    if (filter.userId) params.append("userId", filter.userId);
    if (filter.userEmail) params.append("userEmail", filter.userEmail);
    if (filter.action) params.append("action", filter.action);
    if (filter.resource) params.append("resource", filter.resource);
    if (filter.success !== undefined) params.append("success", String(filter.success));
    if (filter.startDate) params.append("startDate", filter.startDate);
    if (filter.endDate) params.append("endDate", filter.endDate);

    const response = await apiClient.get(`${API_ENDPOINTS.AUDIT_LOGS.EXPORT}?${params.toString()}`, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export default auditLogsApi;
