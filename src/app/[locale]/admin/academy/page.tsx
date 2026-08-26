"use client";

import React from "react";
import { Users, BookOpen, Award, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function AcademyAdminDashboard() {
  const stats = [
    { title: "Total Students", value: "1,248", icon: <Users size={24} className="text-blue-600" />, bg: "bg-blue-50" },
    { title: "Active Courses", value: "12", icon: <BookOpen size={24} className="text-emerald-600" />, bg: "bg-emerald-50" },
    { title: "Certificates Issued", value: "450", icon: <Award size={24} className="text-purple-600" />, bg: "bg-purple-50" },
    { title: "Revenue (MTD)", value: "₹45,000", icon: <IndianRupee size={24} className="text-orange-600" />, bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Academy Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Overview of your academy's performance and recent activities.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/academy/courses/create">
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Create New Course
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${stat.bg}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Enrollments</h3>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-bold">
                    S{i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Student Name {i + 1}</p>
                    <p className="text-xs text-gray-500">Enrolled in: Legal Research Course</p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">Active</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Live Sessions</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Practical Drafting Session {i + 1}</p>
                  <p className="text-xs text-gray-500 mt-1">Today at 6:00 PM • Google Meet</p>
                </div>
                <button className="text-blue-600 text-xs font-medium hover:underline">Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
