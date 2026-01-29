export interface AuditLog {
  id: string;
  userId: string;
  userEmail?: string;
  userName?: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: any;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
  failureReason?: string;
  metadata?: any;
  timestamp: string;
  policyName?: string;
  service?: string;
}

export interface AuditLogFilter {
  userId?: string;
  userEmail?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  success?: boolean | string;
  startDate?: string;
  endDate?: string;
  policyName?: string;
  service?: string;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  totalLogs: number;
  successfulLogs: number;
  failedLogs: number;
  successRate: string;
  topActions: Array<{ action: string; count: string }>;
  topUsers: Array<{ userId: string; userEmail: string; count: string }>;
}

export interface AuditLogsState {
  logs: AuditLog[];
  stats: AuditLogStats | null;
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  error: string | null;
  message: string | null;
}
