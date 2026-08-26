"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Edit, Trash2, Eye, BookOpen, Loader2 } from "lucide-react";
import { courseApi } from "@/data/services/academy-service/course.service";
import toast from "react-hot-toast";

export default function AcademyCoursesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseApi.fetchCourses();
      setCourses(res.data);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await courseApi.deleteCourse(courseToDelete);
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (error: any) {
      console.error("Failed to delete course", error);
      toast.error(error?.response?.data?.message || "Failed to delete course. Please try again.");
    } finally {
      setIsDeleting(false);
      setCourseToDelete(null);
    }
  };

  const filteredCourses = courses.filter(c =>
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Courses</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your academy courses and curriculum.</p>
        </div>
        <Link href="/admin/academy/courses/create">
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Add New Course
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses by title or ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <select className="border border-gray-200 rounded-xl px-4 py-2 text-sm bg-white focus:outline-none focus:border-blue-500 w-full md:w-auto">
              <option value="all">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <BookOpen size={48} className="mb-3 text-gray-300" />
              <p>No courses found. Start by creating one!</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Category / Level</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Price</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCourses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/50 transition group">
                    <td className="p-4">
                      <Link href={`/admin/academy/courses/${course.id}`} className="block w-full h-full">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition">{course.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{course.id}</p>
                      </Link>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <p className="font-medium">{course.category || "Uncategorized"}</p>
                      <p className="text-xs text-gray-500">{course.level || "Beginner"}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                        {course.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 text-right text-sm text-gray-900 font-bold">₹{course.price}</td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button 
                          onClick={() => setPreviewUrl(`/academy/courses/${course.slug || course.id}`)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="Preview Course"
                        >
                          <Eye size={18} />
                        </button>
                        <Link href={`/admin/academy/courses/${course.id}`}>
                          <button className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition" title="Manage Course">
                            <Edit size={18} />
                          </button>
                        </Link>
                        <button
                          onClick={() => setCourseToDelete(course.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Course"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Course?</h3>
            <p className="text-gray-500 text-sm mb-6">Are you sure you want to delete this course? All associated modules and lessons will also be deleted. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2"
              >
                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                {isDeleting ? "Deleting..." : "Delete Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80">
              <div className="flex items-center gap-2 text-gray-700">
                <Eye size={18} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">Course Preview</h3>
              </div>
              <div className="flex gap-2">
                <a 
                  href={previewUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  Open in New Tab
                </a>
                <button 
                  onClick={() => setPreviewUrl(null)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 bg-white relative">
              {/* Optional: Add a subtle loading pulse behind the iframe */}
              <div className="absolute inset-0 flex justify-center items-center -z-10">
                <Loader2 className="animate-spin text-gray-300" size={32} />
              </div>
              <iframe 
                src={previewUrl} 
                className="w-full h-full border-0 relative z-10 bg-white"
                title="Course Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
