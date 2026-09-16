"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/routing";
import { Search, Plus, Edit2, FileText, Trash2, GraduationCap } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";
import { courseApi } from "@/data/services/academy-service/course.service";

interface AcademyTestsPageProps {
  initialCourseId?: string;
  isCourseScoped?: boolean;
}

export default function AcademyTestsPage({
  initialCourseId,
  isCourseScoped = false,
}: AcademyTestsPageProps = {}) {
  const [assessments, setAssessments] = useState([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(initialCourseId || "all");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (initialCourseId) {
      setSelectedCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [assessRes, coursesRes]: [any, any] = await Promise.all([
        apiClient.get("/academy/assessments"),
        courseApi.fetchCourses().catch(() => ({ data: [] })),
      ]);

      const assessData = assessRes.data?.data || assessRes.data;
      if (assessRes.status === 200) {
        setAssessments(assessData || []);
      }

      const coursesList = coursesRes?.data?.data || coursesRes?.data || (Array.isArray(coursesRes) ? coursesRes : []);
      setCourses(coursesList);
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while loading data");
    } finally {
      setLoading(false);
    }
  };

  const courseMap = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c) => {
      map[c.id] = c.title;
    });
    return map;
  }, [courses]);

  const handleDelete = async () => {
    if (!assessmentToDelete) return;
    setIsDeleting(true);
    try {
      await apiClient.delete(`/academy/assessments/${assessmentToDelete.id}`);
      toast.success("Assessment deleted successfully");
      setAssessments(assessments.filter((a: any) => a.id !== assessmentToDelete.id));
      setDeleteConfirmOpen(false);
      setAssessmentToDelete(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete assessment");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredAssessments = assessments.filter((a: any) => {
    const matchesSearch = a.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = selectedCourseId === "all" || a.courseId === selectedCourseId;
    return matchesSearch && matchesCourse;
  });

  const selectedCourseName = useMemo(() => {
    if (selectedCourseId === "all") return null;
    return courseMap[selectedCourseId] || "Selected Course";
  }, [selectedCourseId, courseMap]);

  const createTestHref = isCourseScoped && initialCourseId
    ? `/admin/academy/tests/create?courseId=${initialCourseId}&returnUrl=${encodeURIComponent(`/admin/academy/courses/${initialCourseId}?tab=tests`)}`
    : selectedCourseId && selectedCourseId !== "all"
    ? `/admin/academy/tests/create?courseId=${selectedCourseId}`
    : "/admin/academy/tests/create";

  return (
    <div className="space-y-6">
      {!isCourseScoped ? (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assessments & Tests</h1>
            <p className="text-gray-500 text-sm mt-1">Manage course quizzes, final exams, and review class performance.</p>
          </div>
          <Link
            href={createTestHref}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Plus size={18} /> Create New Test
          </Link>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-gray-900">Course Tests & Final Assessment</h2>
              <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                {filteredAssessments.length} {filteredAssessments.length === 1 ? "Test" : "Tests"}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quizzes and assessments configured for <strong className="text-gray-800">{selectedCourseName || "this course"}</strong>. Click edit to modify questions, or create new assessments.
            </p>
          </div>
          <Link
            href={createTestHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm shrink-0"
          >
            <Plus size={16} /> Create Test for this Course
          </Link>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar with Course Dropdown & Search */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-gray-50/50">
          {!isCourseScoped && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
              {/* Filter by Course */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                  <GraduationCap size={15} className="text-blue-600" /> Filter by Course:
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer min-w-[240px] shadow-2xs"
                >
                  <option value="all">All Courses ({assessments.length} tests)</option>
                  {courses.map((c) => {
                    const count = assessments.filter((a: any) => a.courseId === c.id).length;
                    return (
                      <option key={c.id} value={c.id}>
                        {c.title} ({count})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
          )}

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input 
              type="text" 
              placeholder="Search by test title..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition shadow-2xs"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader text="Loading Assessments..." />
          </div>
        ) : filteredAssessments.length === 0 ? (
          <div className="text-center py-16 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 m-4 space-y-3">
            <FileText className="mx-auto h-12 w-12 text-gray-300 mb-1" />
            <h3 className="text-base font-bold text-gray-900">
              {selectedCourseName ? `No tests found for ${selectedCourseName}` : "No assessments found"}
            </h3>
            <p className="text-gray-500 text-xs max-w-sm mx-auto">
              {selectedCourseName
                ? "This course does not have any quizzes or assessments yet. Click below to create the first test."
                : "Get started by creating your first assessment."}
            </p>
            <div className="pt-2">
              <Link
                href={selectedCourseId && selectedCourseId !== "all" ? `/admin/academy/tests/create?courseId=${selectedCourseId}` : "/admin/academy/tests/create"}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm"
              >
                <Plus size={14} /> Create Test for {selectedCourseName || "Course"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Test Title</th>
                  <th className="p-4">Associated Course</th>
                  <th className="p-4 text-center">Settings</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssessments.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-900 text-sm">{test.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs mt-0.5">{test.description || "No description provided."}</p>
                    </td>
                    <td className="p-4">
                      {test.courseId && courseMap[test.courseId] ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200/60 inline-flex items-center gap-1.5 max-w-xs truncate shadow-2xs">
                          <GraduationCap size={13} className="shrink-0 text-blue-600" />
                          <span className="truncate">{courseMap[test.courseId]}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Universal / Not linked</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-xs text-gray-600">
                      <p className="font-semibold text-gray-800">{test.maxRetries} Retries</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Pass: {test.passingPercentage}%</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link 
                          href={`/admin/academy/tests/${test.id}${isCourseScoped && initialCourseId ? `?returnUrl=${encodeURIComponent(`/admin/academy/courses/${initialCourseId}?tab=tests`)}` : ""}`} 
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="Edit Questions"
                        >
                          <Edit2 size={16} />
                        </Link>
                        <button 
                          onClick={() => { setAssessmentToDelete(test); setDeleteConfirmOpen(true); }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Delete Test"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleteConfirmOpen && (
        <div className="fixed inset-0 bg-black/40 z-[9999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Assessment</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-bold text-gray-700">{assessmentToDelete?.title}</span>? This action cannot be undone and will delete all associated questions.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-gray-600 font-semibold hover:bg-gray-100 rounded-lg transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition flex items-center justify-center min-w-[80px]"
                disabled={isDeleting}
              >
                {isDeleting ? "..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
