"use client";

import React, { useState, useEffect } from "react";
import { Search, Filter, Eye, Play, Pause, RefreshCw, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchAllEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';

export default function AcademyEnrollmentsPage() {
  const dispatch = useAppDispatch();
  const { allEnrollments, isLoading } = useAppSelector(state => state.enrollments);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAllEnrollments({ page: 1, limit: 10, search: searchTerm, status: statusFilter }));
  }, [dispatch, searchTerm, statusFilter]);

  const enrollments = allEnrollments.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollments Management</h1>
          <p className="text-gray-500 text-sm mt-1">Manage student course access, progress, and enrollment validity.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student, email, or enrollment ID..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
             <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1 bg-white">
              <Filter size={16} className="text-gray-400"/>
              <select 
                className="py-1 text-sm bg-transparent focus:outline-none text-gray-700"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Completed">Completed</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Enrollment & Student</th>
                <th className="p-4">Course</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : enrollments.length > 0 ? (
                enrollments.map((enr: any) => (
                  <tr key={enr.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{enr.studentName || 'Student'}</p>
                      <p className="text-xs text-gray-500">{enr.id.substring(0,8)} • {enr.studentEmail || enr.userId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm text-gray-900 font-medium">{enr.course?.title || enr.courseId}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${enr.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                            style={{ width: `${enr.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-700">{enr.progress || 0}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {enr.expiryDate ? new Date(enr.expiryDate).toLocaleDateString() : 'Lifetime'}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        enr.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                        enr.status === 'Active' ? 'bg-blue-100 text-blue-700' : 
                        enr.status === 'Suspended' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {enr.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Details">
                          <Eye size={16} />
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded" title={enr.status === 'Suspended' ? "Activate" : "Suspend"}>
                          {enr.status === 'Suspended' ? <Play size={16} /> : <Pause size={16} />}
                        </button>
                        <button className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded" title="Reset Progress">
                          <RefreshCw size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
