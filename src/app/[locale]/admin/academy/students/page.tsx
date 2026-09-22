"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter, Link } from "@/i18n/routing";
import { Search, Download, RefreshCw, Users, CheckCircle } from "lucide-react";
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
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </td>
        <td className="p-4">
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </td>
        <td className="p-4">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
        </td>
        <td className="p-4">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
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

  const { studentsSummary, isLoading: loading } = useAppSelector((state) => state.enrollments);
  const { data: students, total, platformCount = 0, externalCount = 0 } = studentsSummary;

  const { courses } = useAppSelector((state) => state.course);

  // URL-driven state
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    courseId: searchParams.get("courseId") || "all",
    source: searchParams.get("source") || "all",
    page: parseInt(searchParams.get("page") || "1"),
    limit: parseInt(searchParams.get("limit") || "10"),
  });

  // Local state for debounced input
  const [localSearch, setLocalSearch] = useState(searchParams.get("search") || "");

  // Debounce ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load available courses for dropdown
  useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const updateUrl = useCallback(
    (updates: Record<string, string | number | boolean | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined && value !== "all") {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      // Reset page to 1 if search, courseId, or source changed
      const isFilterChange = Object.keys(updates).some(
        (k) => k === "search" || k === "courseId" || k === "source"
      );
      if (isFilterChange) {
        params.set("page", "1");
      }

      router.push(`/admin/academy/students?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Sync local filters with URL
  useEffect(() => {
    setLocalSearch(searchParams.get("search") || "");
    setFilters({
      search: searchParams.get("search") || "",
      courseId: searchParams.get("courseId") || "all",
      source: searchParams.get("source") || "all",
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "10"),
    });
  }, [searchParams]);

  const loadStudents = useCallback(async () => {
    const params: any = {
      page: filters.page,
      limit: filters.limit,
    };
    if (filters.search) params.search = filters.search;
    if (filters.courseId !== "all") params.courseId = filters.courseId;
    if (filters.source !== "all") params.source = filters.source;

    try {
      await dispatch(fetchStudentsSummary(params)).unwrap();
    } catch (e) {
      console.error(e);
      toast.error(typeof e === "string" ? e : "An error occurred while loading students");
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
    }, 500);
  };

  const handleCourseFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ courseId: e.target.value });
  };

  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateUrl({ source: e.target.value });
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
          <p className="text-gray-500 text-sm mt-1">
            Monitor course students and certification recipients.
          </p>
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
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
              value={localSearch}
              onChange={handleSearchChange}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Type Filter Dropdown */}
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
              value={filters.source}
              onChange={handleTypeFilterChange}
            >
              <option value="all">All Student Types</option>
              <option value="platform">Enrolled Students</option>
              <option value="external_certificate">Certification Only</option>
            </select>

            {/* Course Filter Dropdown */}
            <select
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full sm:w-auto"
              value={filters.courseId}
              onChange={handleCourseFilterChange}
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Quick Filter Tabs */}
        <div className="px-6 py-2.5 bg-gray-50/70 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* <button
              onClick={() => updateUrl({ source: "all" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.source === "all"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              All Students ({total})
            </button>
            <button
              onClick={() => updateUrl({ source: "platform" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.source === "platform"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60"
              }`}
            >
              Enrolled ({platformCount})
            </button>
            <button
              onClick={() => updateUrl({ source: "external_certificate" })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filters.source === "external_certificate"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-purple-700 bg-purple-50/70 hover:bg-purple-100/70 border border-purple-200/60"
              }`}
            >
              Certification Only ({externalCount})
            </button> */}
          </div>

          <div className="text-xs text-gray-500 font-medium">
            Showing {students.length} of {total} total
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4 w-[24%]">User</th>
                <th className="p-4 w-[20%]">Type</th>
                <th className="p-4 w-[30%]">Courses</th>
                <th className="p-4 w-[13%]">Progress</th>
                <th className="p-4 w-[13%]">Status</th>
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
                    <p className="text-gray-500 text-sm">
                      Try adjusting your filters or search term.
                    </p>
                  </td>
                </tr>
              ) : (
                <>
                  {/* Keep displaying existing items while loading to prevent jitter */}
                  {loading && (
                    <div className="absolute inset-0 bg-white/40 z-10 transition-opacity duration-300 pointer-events-none" />
                  )}

                  {students.map((student: any) => {
                    const hasPlatform = student.enrollments?.some(
                      (e: any) => e.source === "platform" || (!e.source && !!e.razorpayOrderId)
                    );
                    const hasExternal = student.enrollments?.some(
                      (e: any) => e.source === "external_certificate"
                    );
                    const isHybrid = hasPlatform && hasExternal;

                    // Context-aware primary enrollment selection
                    let primaryEnrollment = student.enrollments?.[0];
                    if (filters.courseId !== "all") {
                      const matched = student.enrollments?.find(
                        (e: any) => e.courseId === filters.courseId
                      );
                      if (matched) primaryEnrollment = matched;
                    } else if (filters.source === "external_certificate") {
                      const matchedExt = student.enrollments?.find(
                        (e: any) => e.source === "external_certificate"
                      );
                      if (matchedExt) primaryEnrollment = matchedExt;
                    } else if (filters.source === "platform") {
                      const matchedPlat = student.enrollments?.find(
                        (e: any) => e.source !== "external_certificate"
                      );
                      if (matchedPlat) primaryEnrollment = matchedPlat;
                    }

                    const isPrimaryExternal = primaryEnrollment?.source === "external_certificate";
                    const otherCoursesCount = (student.enrollments?.length || 0) - 1;
                    const certId =
                      primaryEnrollment?.certificateId ||
                      student.certificateId ||
                      student.enrollments?.find((e: any) => e.certificateId)?.certificateId;

                    return (
                      <tr key={student.userId} className="hover:bg-gray-50/50 transition">
                        {/* User column */}
                        <td className="p-4">
                          <p className="font-semibold text-gray-900">
                            {student.studentName || "Unknown Student"}
                          </p>
                          <p className="text-xs text-gray-500">{student.studentEmail}</p>
                        </td>

                        {/* Type column */}
                        <td className="p-4">
                          {filters.courseId !== "all" ? (
                            isPrimaryExternal ? (
                              <span className="text-sm font-medium text-purple-700">
                                Certification Only
                              </span>
                            ) : (
                              <span className="text-sm font-medium text-gray-800">
                                Enrolled
                              </span>
                            )
                          ) : isHybrid && filters.source === "all" ? (
                            <span
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200"
                              title="Enrolled in platform courses and holds external certifications"
                            >
                              Enrolled & Certified
                            </span>
                          ) : isPrimaryExternal || (!hasPlatform && hasExternal) ? (
                            <span className="text-sm font-medium text-purple-700">
                              Certification Only
                            </span>
                          ) : (
                            <span className="text-sm font-medium text-gray-800">
                              Enrolled
                            </span>
                          )}
                        </td>

                        {/* Courses column */}
                        <td className="p-4 group relative">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p
                                className="text-sm text-gray-900 font-medium truncate max-w-[220px]"
                                title={primaryEnrollment?.courseName}
                              >
                                {primaryEnrollment?.courseName || "No Course"}
                              </p>
                              {otherCoursesCount > 0 && (
                                <span
                                  className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded cursor-help"
                                  title={`${otherCoursesCount} other course${otherCoursesCount === 1 ? "" : "s"
                                    }`}
                                >
                                  +{otherCoursesCount}
                                </span>
                              )}
                            </div>

                            {/* Hover tooltip for other courses */}
                            {otherCoursesCount > 0 && (
                              <div className="absolute left-4 top-full mt-1 w-80 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 p-4">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-2">
                                  All Registered Courses ({student.enrollments?.length})
                                </p>
                                <div className="space-y-3.5 max-h-56 overflow-y-auto pr-2 custom-scrollbar">
                                  {student.enrollments.map((enr: any) => {
                                    const isEnrExternal = enr.source === "external_certificate";
                                    return (
                                      <div key={enr.id} className="text-sm">
                                        <div className="flex items-center justify-between mb-1">
                                          <p
                                            className="font-semibold text-gray-900 truncate max-w-[180px]"
                                            title={enr.courseName}
                                          >
                                            {enr.courseName}
                                          </p>
                                          {isEnrExternal ? (
                                            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                                              Cert Only
                                            </span>
                                          ) : (
                                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                                              Enrolled
                                            </span>
                                          )}
                                        </div>
                                        {isEnrExternal ? (
                                          <div className="text-xs">
                                            <span className="font-medium text-emerald-600">Certificate Issued</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-between">
                                            <div className="w-full bg-gray-100 h-1.5 rounded-full mr-3">
                                              <div
                                                className={`h-1.5 rounded-full ${enr.progress === 100
                                                  ? "bg-emerald-500"
                                                  : "bg-blue-600"
                                                  }`}
                                                style={{ width: `${enr.progress}%` }}
                                              ></div>
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">
                                              {enr.progress}%
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Progress column */}
                        <td className="p-4">
                          {isPrimaryExternal ? (
                            <span className="text-sm text-gray-400 font-medium">—</span>
                          ) : (
                            <span className="text-sm font-semibold text-gray-800">
                              {primaryEnrollment ? `${primaryEnrollment.progress}%` : "0%"}
                            </span>
                          )}
                        </td>

                        {/* Status column */}
                        <td className="p-4">
                          {isPrimaryExternal ? (
                            <span className="text-sm font-semibold text-emerald-600">
                              Certified
                            </span>
                          ) : (
                            <span
                              className={`text-sm font-semibold ${primaryEnrollment?.status === "Completed"
                                ? "text-emerald-600"
                                : primaryEnrollment?.status === "Active"
                                  ? "text-blue-600"
                                  : "text-gray-700"
                                }`}
                            >
                              {primaryEnrollment?.status || "Active"}
                            </span>
                          )}
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
