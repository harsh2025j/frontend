"use client";

import React, { useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";

export default function AcademyStudentsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const students = [
    { id: "STU-001", name: "Ravi Kumar", email: "ravi.kumar@example.com", course: "Legal Research Apprenticeship", progress: 68, status: "Active", joinedAt: "12 Aug 2026" },
    { id: "STU-002", name: "Priya Sharma", email: "priya.sh@example.com", course: "Drafting Commercial Contracts", progress: 100, status: "Completed", joinedAt: "05 Jul 2026" },
    { id: "STU-003", name: "Amit Patel", email: "amit.p@example.com", course: "Intellectual Property Rights", progress: 20, status: "Active", joinedAt: "16 Aug 2026" },
    { id: "STU-004", name: "Sneha Reddy", email: "sneha.r@example.com", course: "Legal Research Apprenticeship", progress: 0, status: "Pending", joinedAt: "17 Aug 2026" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students & Enrollments</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor student progress and course enrollments.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2">
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name, email, or ID..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full md:w-auto">
              <option value="all">All Courses</option>
              <option value="research">Legal Research</option>
              <option value="drafting">Drafting</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Student</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Progress</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-gray-900 font-medium">{student.course}</p>
                    <p className="text-xs text-gray-500">Joined: {student.joinedAt}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${student.progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`} 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-gray-700">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      student.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      student.status === 'Active' ? 'bg-blue-100 text-blue-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {student.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="View Profile">
                      <ExternalLink size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
