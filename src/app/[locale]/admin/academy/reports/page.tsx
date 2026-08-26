"use client";

import React, { useState } from "react";
import { Download, Users, BookOpen, IndianRupee, PieChart } from "lucide-react";

export default function AcademyReportsPage() {
  const [dateRange, setDateRange] = useState("last_30");

  const reports = [
    { title: "Student Performance Report", description: "Detailed progress, assignment scores, and test results for all enrolled students.", icon: <Users size={24} className="text-blue-600" />, bg: "bg-blue-50" },
    { title: "Revenue & Sales Report", description: "Breakdown of course sales, refunds, coupons used, and net revenue.", icon: <IndianRupee size={24} className="text-emerald-600" />, bg: "bg-emerald-50" },
    { title: "Course Engagement Analytics", description: "Metrics on video watch time, lesson completion rates, and drop-off points.", icon: <PieChart size={24} className="text-purple-600" />, bg: "bg-purple-50" },
    { title: "Certifications Issued", description: "Log of all auto-generated and manually approved certificates with validation status.", icon: <BookOpen size={24} className="text-orange-600" />, bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-500 text-sm mt-1">Download detailed CSV reports to analyze academy performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Time Period:</span>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="last_7">Last 7 Days</option>
            <option value="last_30">Last 30 Days</option>
            <option value="this_month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="this_year">This Year</option>
            <option value="all_time">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {reports.map((report, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-full">
            <div className="flex items-start gap-4 mb-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${report.bg}`}>
                {report.icon}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{report.title}</h3>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">{report.description}</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium py-2.5 rounded-lg transition border border-gray-200">
              <Download size={18} /> Generate & Download CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
