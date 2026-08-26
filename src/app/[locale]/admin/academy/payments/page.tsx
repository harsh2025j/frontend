"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, Filter, FileText, Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchAllCoursePayments } from '@/data/features/academy/enrollments/enrollmentsThunks';

export default function AcademyPaymentsPage() {
  const dispatch = useAppDispatch();
  const { allPayments, isLoading } = useAppSelector(state => state.enrollments);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAllCoursePayments({ page: 1, limit: 10, search: searchTerm, status: statusFilter }));
  }, [dispatch, searchTerm, statusFilter]);

  const payments = allPayments.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payments & Revenue</h1>
          <p className="text-gray-500 text-sm mt-1">Track course purchases, refunds, and verify payment statuses.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
          <Download size={18} /> Export Report
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by Transaction ID or student name..." 
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
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Student & Course</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Method & Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto text-blue-500" />
                  </td>
                </tr>
              ) : payments.length > 0 ? (
                payments.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900">{txn.razorpayOrderId || txn.id.substring(0,8)}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-gray-900">{txn.userId}</p>
                      <p className="text-xs text-gray-500">Course ID: {txn.referenceId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-bold text-gray-900">₹{txn.amount}</p>
                    </td>
                    <td className="p-4 text-sm">
                      <p className="text-gray-900">{new Date(txn.createdAt).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-500">Razorpay</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        txn.status === 'paid' ? 'bg-green-100 text-green-700' : 
                        txn.status === 'failed' ? 'bg-red-100 text-red-700' : 
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" title="Download Invoice" disabled={txn.status !== 'paid'}>
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">
                    No payments found.
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
