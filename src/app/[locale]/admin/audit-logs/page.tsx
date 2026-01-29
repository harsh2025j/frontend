"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import {
  fetchAuditLogs,
  fetchAuditStatistics,
  exportAuditLogsToCsv,
} from "@/data/features/audit-logs/auditLogsThunks";
import {
  clearAuditLogsMessage,
  clearAuditLogsError,
} from "@/data/features/audit-logs/auditLogsSlice";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import {
  Shield,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Calendar,
  Activity,
  TrendingUp,
  Users,
  Filter
} from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";

export default function AuditLogsPage() {
  useDocTitle("Audit Logs | Sajjad Husain Law Associates");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { logs, stats, total, page, limit, loading, error, message } = useAppSelector(
    (state) => state.auditLogs
  );

  // Filter state
  const [filters, setFilters] = useState({
    userEmail: "",
    action: "",
    resource: "",
    success: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 50,
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchAuditLogs(filters));
    dispatch(fetchAuditStatistics());
  }, []);

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(clearAuditLogsMessage());
    }
    if (error) {
      toast.error(error);
      dispatch(clearAuditLogsError());
    }
  }, [message, error]);

  const handleSearch = () => {
    dispatch(fetchAuditLogs({ ...filters, page: 1 }));
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      userEmail: "",
      action: "",
      resource: "",
      success: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 50,
    };
    setFilters(clearedFilters);
    dispatch(fetchAuditLogs(clearedFilters));
  };

  const handleExport = () => {
    dispatch(exportAuditLogsToCsv(filters));
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ ...filters, page: newPage });
    dispatch(fetchAuditLogs({ ...filters, page: newPage }));
  };

  const getActionBadgeColor = (action: string) => {
    switch (action.toLowerCase()) {
      case "create":
        return "bg-green-100 text-green-700 border-green-200";
      case "read":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "update":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "delete":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getResourceBadgeColor = (resource: string) => {
    switch (resource.toLowerCase()) {
      case "matter":
      case "case":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "user":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "document":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "role":
      case "permission":
        return "bg-orange-100 text-orange-700 border-orange-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={28} className="text-[#0A2342]" />
            Audit Logs
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Monitor all system activities and security events
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors flex items-center gap-2"
          >
            <Filter size={18} />
            <span className="hidden sm:inline">Filters</span>
          </button>
          <button
            onClick={handleExport}
            disabled={loading}
            className="px-4 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Events</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLogs}</p>
              </div>
              <Activity size={32} className="text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.successRate}</p>
              </div>
              <TrendingUp size={32} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Successful</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.successfulLogs}</p>
              </div>
              <CheckCircle2 size={32} className="text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.failedLogs}</p>
              </div>
              <AlertTriangle size={32} className="text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filters Section */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Filter Logs</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
              <input
                type="text"
                value={filters.userEmail}
                onChange={(e) => setFilters({ ...filters, userEmail: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="read">Read</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
              <select
                value={filters.resource}
                onChange={(e) => setFilters({ ...filters, resource: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
              >
                <option value="">All Resources</option>
                <option value="matter">Matter</option>
                <option value="user">User</option>
                <option value="document">Document</option>
                <option value="role">Role</option>
                <option value="permission">Permission</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.success}
                onChange={(e) => setFilters({ ...filters, success: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none bg-white"
              >
                <option value="">All</option>
                <option value="true">Success</option>
                <option value="false">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors flex items-center gap-2"
            >
              <Search size={18} />
              Search
            </button>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading && logs.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <Loader size="lg" text="Loading audit logs..." />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Shield size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No audit logs found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Timestamp</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Action</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Resource</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(logs) && logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{log.userName || "Unknown"}</p>
                          <p className="text-xs text-gray-500">{log.userEmail || log.userId}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(log.action)}`}>
                          {log.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getResourceBadgeColor(log.resource)}`}>
                            {log.resource.toUpperCase()}
                          </span>
                          {log.resourceId && (
                            <p className="text-xs text-gray-500 mt-1">ID: {log.resourceId.substring(0, 8)}...</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {log.success ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle2 size={16} />
                            Success
                          </span>
                        ) : (
                          <div>
                            <span className="inline-flex items-center gap-1 text-red-600 text-sm">
                              <XCircle size={16} />
                              Failed
                            </span>
                            {log.failureReason && (
                              <p className="text-xs text-red-500 mt-1">{log.failureReason}</p>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-700">
                        {log.ipAddress || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {Array.isArray(logs) && logs.map((log) => (
                <div key={log.id} className="p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-900">{log.userName || "Unknown User"}</p>
                      <p className="text-xs text-gray-500">{log.userEmail || log.userId}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                    {log.success ? (
                      <CheckCircle2 size={20} className="text-green-600" />
                    ) : (
                      <XCircle size={20} className="text-red-600" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getActionBadgeColor(log.action)}`}>
                      {log.action.toUpperCase()}
                    </span>
                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium border ${getResourceBadgeColor(log.resource)}`}>
                      {log.resource.toUpperCase()}
                    </span>
                  </div>
                  {!log.success && log.failureReason && (
                    <p className="text-xs text-red-500">{log.failureReason}</p>
                  )}
                  <p className="text-xs text-gray-500">IP: {log.ipAddress || "N/A"}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} logs
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
