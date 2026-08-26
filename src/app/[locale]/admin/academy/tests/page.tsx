"use client";

import React, { useState } from "react";
import { Search, Plus, Edit2, FileBarChart, Play } from "lucide-react";

export default function AcademyTestsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const tests = [
    { id: 1, title: "Final Apprenticeship Assessment", course: "Legal Research Apprenticeship", questions: 50, duration: "60 mins", passMarks: "50%", status: "Published" },
    { id: 2, title: "Module 1 Quiz", course: "Drafting Commercial Contracts", questions: 10, duration: "15 mins", passMarks: "60%", status: "Published" },
    { id: 3, title: "Trademarks Mid-Term", course: "Intellectual Property Rights", questions: 25, duration: "30 mins", passMarks: "50%", status: "Draft" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments & Tests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage quizzes, final exams, and review class performance.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} /> Create New Test
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by test title or course..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Test Title</th>
                <th className="p-4">Course</th>
                <th className="p-4 text-center">Questions</th>
                <th className="p-4 text-center">Settings</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map((test) => (
                <tr key={test.id} className="hover:bg-gray-50/50 transition">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{test.title}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium text-gray-700">{test.course}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block bg-gray-100 text-gray-800 text-xs font-bold px-2 py-1 rounded">{test.questions} Qs</span>
                  </td>
                  <td className="p-4 text-center text-sm text-gray-600">
                    <p>{test.duration}</p>
                    <p className="text-xs text-gray-400">Pass: {test.passMarks}</p>
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      test.status === 'Published' ? 'bg-green-100 text-green-700' : 
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {test.status}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit Questions">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="View Results">
                        <FileBarChart size={16} />
                      </button>
                    </div>
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
