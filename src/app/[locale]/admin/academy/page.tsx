"use client";

import React from "react";
import { Users, BookOpen, Award, IndianRupee, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import apiClient from "@/data/services/apiConfig/apiClient";
import { courseApi } from "@/data/services/academy-service/course.service";
import { usersApi } from "@/data/services/users-service/users-service";

export default function AcademyAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalStudents: 0,
    activeCourses: 0,
    certificatesIssued: 450, // MOCK
    revenue: "₹00000", // MOCK
  });
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch Courses
      let activeCoursesCount = 0;
      try {
        const coursesRes = await courseApi.fetchCourses();
        const courses = coursesRes.data || [];
        activeCoursesCount = courses.filter((c: any) => c.status === 'published').length;
      } catch (err) {
        console.error(err);
      }

      // Fetch Students/Enrollments
      let totalStudents = 0;
      let recent = [];
      try {
        const enrollRes = await apiClient.get('/academy/enrollments/students-summary', { params: { limit: 4 } });
        totalStudents = enrollRes.data?.total || 0;
        let recentData = enrollRes.data?.data || [];
        
        // Fetch actual names from user-service for recent enrollments
        for (let student of recentData) {
          if (!student.studentName) {
            try {
              const userRes = await usersApi.getUserById(student.userId);
              const u = userRes.data || userRes;
              if (u) {
                 student.studentName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Unknown Student';
              }
            } catch (err) {
              console.error(`Failed to fetch name for user ${student.userId}`, err);
            }
          }
        }
        
        recent = recentData;
      } catch (err) {
        console.error(err);
      }

      setStatsData(prev => ({
        ...prev,
        totalStudents,
        activeCourses: activeCoursesCount
      }));
      setRecentEnrollments(recent);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: "Total Students", value: statsData.totalStudents.toString(), icon: <Users size={24} className="text-blue-600" />, bg: "bg-blue-50" },
    { title: "Active Courses", value: statsData.activeCourses.toString(), icon: <BookOpen size={24} className="text-emerald-600" />, bg: "bg-emerald-50" },
    { title: "Certificates Issued", value: statsData.certificatesIssued.toString(), icon: <Award size={24} className="text-purple-600" />, bg: "bg-purple-50" },
    { title: "Revenue (MTD)", value: statsData.revenue, icon: <IndianRupee size={24} className="text-orange-600" />, bg: "bg-orange-50" },
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
            {recentEnrollments.map((student, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {student.studentName?.charAt(0) || 'S'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{student.studentName || 'Unknown Student'}</p>
                    <p className="text-xs text-gray-500">
                      Enrolled in: {student.enrollments?.[0]?.courseName || 'Multiple Courses'}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                  {student.enrollments?.[0]?.status || 'Active'}
                </span>
              </div>
            ))}
            {recentEnrollments.length === 0 && !loading && (
              <p className="text-sm text-gray-500 text-center py-4">No recent enrollments</p>
            )}
            {loading && (
              <div className="flex justify-center p-4"><Loader2 className="animate-spin text-blue-600" /></div>
            )}
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
