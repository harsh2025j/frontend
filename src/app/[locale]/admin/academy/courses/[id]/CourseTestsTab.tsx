"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  ExternalLink,
  Loader2,
  Layers
} from "lucide-react";
import apiClient from "@/data/services/apiConfig/apiClient";
import toast from "react-hot-toast";

interface CourseTestsTabProps {
  courseId: string;
  courseTitle?: string;
}

export default function CourseTestsTab({ courseId, courseTitle }: CourseTestsTabProps) {
  const [tests, setTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourseTests();
    }
  }, [courseId]);

  const fetchCourseTests = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/academy/assessments", {
        params: { courseId }
      });
      const data = res.data?.data || res.data || [];
      setTests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load course tests:", err);
      toast.error("Failed to load assessments for this course");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={32} />
        <p className="text-sm text-gray-500 font-medium">Loading course assessments…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Header & Action */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-gray-900">Tests & Final Assessment</h2>
            <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
              {tests.length} {tests.length === 1 ? "Test" : "Tests"}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Tests and final assessments created for <span className="font-semibold text-gray-800">{courseTitle || "this course"}</span>. To modify or edit a test, open it on the Admin Tests page.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <Link
            href={`/admin/academy/tests/create?courseId=${courseId}&returnUrl=${encodeURIComponent(`/admin/academy/courses/${courseId}?tab=tests`)}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Plus size={16} />
            <span>Create Test for this Course</span>
          </Link>
        </div>
      </div>

      {/* Tests Table or Empty State */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {tests.length === 0 ? (
          <div className="p-12 text-center max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <FileCheck2 size={32} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">No Tests Created for this Course Yet</h3>
              <p className="text-sm text-gray-500 mt-1">
                Add an assessment or final exam so enrolled students can evaluate their learning and unlock their course completion certificate.
              </p>
            </div>
            <Link
              href={`/admin/academy/tests/create?courseId=${courseId}&returnUrl=${encodeURIComponent(`/admin/academy/courses/${courseId}?tab=tests`)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition"
            >
              <Plus size={16} />
              Create First Test
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">Test Title</th>
                  <th className="py-4 px-6">Questions</th>
                  <th className="py-4 px-6">Pass %</th>
                  <th className="py-4 px-6">Max Retries</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {tests.map((test) => (
                  <tr key={test.id} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0 mt-0.5">
                          <FileCheck2 size={18} />
                        </div>
                        <div>
                          <Link
                            href={`/admin/academy/tests/${test.id}?returnUrl=${encodeURIComponent(`/admin/academy/courses/${courseId}?tab=tests`)}`}
                            className="font-bold text-gray-900 hover:text-blue-600 transition"
                          >
                            {test.title}
                          </Link>
                          {test.description && (
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-1 max-w-md">
                              {test.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-lg text-xs font-semibold text-gray-700">
                        <Layers size={13} className="text-gray-500" />
                        {test.questions?.length || 0} questions
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-100">
                        {test.passingPercentage || 50}%
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-600 font-medium">
                      {test.maxRetries ?? 50}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href={`/admin/academy/tests/${test.id}?returnUrl=${encodeURIComponent(`/admin/academy/courses/${courseId}?tab=tests`)}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition"
                      >
                        <span>Modify Test/Assessment</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
