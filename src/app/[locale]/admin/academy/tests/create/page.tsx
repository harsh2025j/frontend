"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Save, FileText, CheckCircle2, GraduationCap } from "lucide-react";
import { Link } from "@/i18n/routing";
import { toast } from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";
import { courseApi } from "@/data/services/academy-service/course.service";

export default function CreateTestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCourseId = searchParams.get("courseId") || "";
  const returnUrl = searchParams.get("returnUrl") || (initialCourseId ? `/admin/academy/courses/${initialCourseId}?tab=tests` : "");

  const [courses, setCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    courseId: initialCourseId,
    title: "",
    description: "",
    marksPerQuestion: 1 as number | "",
    passingPercentage: 50 as number | "",
    maxRetries: 50 as number | "",
  });

  useEffect(() => {
    (async () => {
      setLoadingCourses(true);
      try {
        const res: any = await courseApi.fetchCourses();
        const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        setCourses(list);
        if (list.length > 0) {
          setFormData((prev) => ({
            ...prev,
            courseId: prev.courseId || initialCourseId || list[0].id,
          }));
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, [initialCourseId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: (name === 'title' || name === 'description' || name === 'courseId') 
        ? value 
        : (value === "" ? "" : Number(value))
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.courseId) {
      toast.error("Please select an associated course");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    
    if (formData.marksPerQuestion === "" || formData.marksPerQuestion <= 0) {
      toast.error("Marks per question must be greater than 0");
      return;
    }

    if (formData.passingPercentage === "" || formData.passingPercentage <= 0 || formData.passingPercentage > 100) {
      toast.error("Passing percentage must be between 1 and 100");
      return;
    }

    if (formData.maxRetries === "" || formData.maxRetries < 0) {
      toast.error("Max retries cannot be negative");
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post("/academy/assessments", formData);

      if (res.status === 200 || res.status === 201) {
        const data = res.data?.data || res.data;
        toast.success("Test created successfully!");
        // Redirect to the detail page where they can add questions, forwarding returnUrl
        const nextUrl = returnUrl
          ? `/admin/academy/tests/${data.id}?returnUrl=${encodeURIComponent(returnUrl)}`
          : `/admin/academy/tests/${data.id}`;
        router.push(nextUrl);
      } else {
        toast.error("Failed to create test");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={returnUrl || "/admin/academy/tests"} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 transition">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Assessment</h1>
          <p className="text-sm text-gray-500">Configure the course and settings for your new test.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 space-y-6">
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={16} className="text-blue-600" />
                Associated Course <span className="text-red-500">*</span>
              </label>
              <select
                name="courseId"
                value={formData.courseId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition cursor-pointer font-medium text-gray-800"
              >
                <option value="" disabled>
                  {loadingCourses ? "Loading courses..." : "Select a Course..."}
                </option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">This test will be linked to this specific course.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Test Title <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Final Module Assessment"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief instructions or summary for the students..."
                rows={3}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Marks Per Question</label>
              <input
                type="number"
                name="marksPerQuestion"
                min="1"
                value={formData.marksPerQuestion}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Passing Percentage (%)</label>
              <input
                type="number"
                name="passingPercentage"
                min="1"
                max="100"
                value={formData.passingPercentage}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Max Retries</label>
              <input
                type="number"
                name="maxRetries"
                min="1"
                value={formData.maxRetries}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              />
            </div>
          </div>

        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Save size={18} />
                Save & Continue
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
