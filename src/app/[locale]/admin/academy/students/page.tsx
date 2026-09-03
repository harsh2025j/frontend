"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { Search, Download, ExternalLink, RefreshCw, Users, FileText, ChevronRight } from "lucide-react";
import apiClient from "@/data/services/apiConfig/apiClient";
import { toast } from "react-hot-toast";
import Pagination from "@/components/Pagination";
import { useDocTitle } from "@/hooks/useDocTitle";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchStudentsSummary } from "@/data/features/academy/enrollments/enrollmentsThunks";
import { fetchAllCourses } from "@/data/features/academy/course/courseThunks";

// Simple Skeleton for table rows
const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-gray-100">
        <td className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </td>
        <td className="p-4">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="p-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-8"></div>
          </div>
        </td>
        <td className="p-4">
          <div className="h-6 bg-gray-200 rounded-full w-20"></div>
        </td>
        <td className="p-4 text-center">
          <div className="h-8 bg-gray-200 rounded w-8 mx-auto"></div>
        </td>
      </tr>
    ))}
  </>
);

export default function AcademyStudentsPage() {
  useDocTitle("Students & Enrollments | Academy");
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const { studentsSummary, isLoading: loading } = useAppSelector(state => state.enrollments);
  const { data: students, total } = studentsSummary;

  const { courses } = useAppSelector(state => state.course);
  
  // URL-driven state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    courseId: searchParams.get("courseId") || "all",
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10")
  });
  
  // Local state for debounced input
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  // Debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load available courses for dropdown
  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const updateUrl = useCallback((updates: Record<string, string | number | boolean | null | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== "" && value !== null && value !== undefined && value !== "all") {
        params.set(key, value.toString());
      } else {
        params.delete(key);
      }
    });

    // Reset page to 1 if search or courseId changed
    const isFilterChange = Object.keys(updates).some(k => k === 'search' || k === 'courseId');
    if (isFilterChange) {
      params.set('page', '1');
    }

    router.push(`/admin/academy/students?${params.toString()}`);
  }, [router, searchParams]);

  // Sync local filters with URL
  useEffect(() => {
    setLocalSearch(searchParams.get("search") || "");
    setFilters({
      search: searchParams.get("search") || "",
      courseId: searchParams.get("courseId") || "all",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10")
    });
  }, [searchParams]);

  const loadStudents = useCallback(async () => {
    const params: any = {
      page: filters.page,
      limit: filters.limit
    };
    if (filters.search) params.search = filters.search;
    if (filters.courseId !== "all") params.courseId = filters.courseId;

    try {
      await dispatch(fetchStudentsSummary(params)).unwrap();
    } catch (e) {
      console.error(e);
      toast.error(typeof e === 'string' ? e : "An error occurred while loading students");
    }
  }, [filters, dispatch]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalSearch(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      updateUrl({ search: value });
    }, 600);
  };

  const handleCourseFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ courseId: e.target.value });
  };

  const handlePageChange = (newPage: number) => {
    updateUrl({ page: newPage });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students & Enrollments</h1>
          <p className="text-gray-500 text-sm mt-1">Monitor student progress and course enrollments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadStudents}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition shadow-sm"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition flex items-center gap-2 shadow-sm">
            <Download size={18} /> <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name or email..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select 
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full md:w-auto"
              value={filters.courseId}
              onChange={handleCourseFilterChange}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Student</th>
                <th className="p-4 w-[35%]">Enrolled Course(s)</th>
                <th className="p-4 w-[20%]">Progress</th>
                <th className="p-4 w-[15%]">Status</th>
                <th className="p-4 text-center w-[10%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 relative">
              {loading && students.length === 0 ? (
                <TableSkeleton />
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No students found</h3>
                    <p className="text-gray-500 text-sm">Try adjusting your filters or search term.</p>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Keep displaying existing items while loading to prevent jitter, but show a slight opacity reduction */}
                  {loading && (
                    <div className="absolute inset-0 bg-white/40 z-10 transition-opacity duration-300 pointer-events-none" />
                  )}
                  
                  {students.map((student: any) => {
                    // Determine which enrollment to show primarily
                    let primaryEnrollment = student.enrollments[0];
                    if (filters.courseId !== "all") {
                      const matched = student.enrollments.find((e: any) => e.courseId === filters.courseId);
                      if (matched) primaryEnrollment = matched;
                    }
                    
                    const otherCoursesCount = student.enrollments.length - 1;

                    return (
                      <tr key={student.userId} className="hover:bg-gray-50/50 transition">
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">{student.studentName || 'Unknown Student'}</p>
                          <p className="text-xs text-gray-500">{student.studentEmail}</p>
                        </td>
                        <td className="p-4 group relative">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm text-gray-900 font-medium truncate max-w-[200px]" title={primaryEnrollment?.courseName}>
                              {primaryEnrollment?.courseName || 'No Course'}
                            </p>
                            {otherCoursesCount > 0 && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded cursor-help">
                                +{otherCoursesCount}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Joined: {new Date(primaryEnrollment?.enrolledAt || student.joinedAt).toLocaleDateString()}
                          </p>

                          {/* Hover tooltip for other courses */}
                          {otherCoursesCount > 0 && (
                            <div className="absolute left-4 top-full mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-4">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">All Enrollments</p>
                              <div className="space-y-4 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                {student.enrollments.map((enr: any) => (
                                  <div key={enr.id} className="text-sm">
                                    <p className="font-semibold text-gray-900 truncate mb-1" title={enr.courseName}>{enr.courseName}</p>
                                    <div className="flex items-center justify-between">
                                      <div className="w-full bg-gray-100 h-1.5 rounded-full mr-3">
                                        <div className={`h-1.5 rounded-full ${enr.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${enr.progress}%` }}></div>
                                      </div>
                                      <span className="text-xs font-bold text-gray-700">{enr.progress}%</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {primaryEnrollment && (
                            <div className="flex items-center gap-3">
                              <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${primaryEnrollment.progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
                                  style={{ width: `${primaryEnrollment.progress}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-bold text-gray-700">{primaryEnrollment.progress}%</span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          {primaryEnrollment && (
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                              primaryEnrollment.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              primaryEnrollment.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}>
                              {primaryEnrollment.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          <button className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition" title="View Profile">
                            <ExternalLink size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="border-t border-gray-100 p-4">
            <Pagination 
              currentPage={filters.page}
              totalPages={Math.ceil(total / filters.limit)}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
