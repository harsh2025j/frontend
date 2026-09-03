"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { Search, Plus, Edit2, FileBarChart, FileText, Trash2 } from "lucide-react";
import Loader from "@/components/ui/Loader";
import { toast } from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";

export default function AcademyTestsPage() {
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assessmentToDelete, setAssessmentToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await apiClient.get("/academy/assessments");
      const data = res.data?.data || res.data;
      if (res.status === 200) {
        setAssessments(data);
      } else {
        toast.error("Failed to load assessments");
      }
    } catch (e) {
      console.error(e);
      toast.error("An error occurred while loading assessments");
    } finally {
      setLoading(false);
    }
  };

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

  const filteredAssessments = assessments.filter((a: any) => 
    a.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments & Tests</h1>
          <p className="text-gray-500 text-sm mt-1">Manage quizzes, final exams, and review class performance.</p>
        </div>
        <Link href="/admin/academy/tests/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2">
          <Plus size={18} /> Create New Test
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by test title..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
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
           <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-200 m-4">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">No assessments found</h3>
            <p className="text-gray-500 text-sm">Get started by creating a new test.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="p-4">Test Title</th>
                  <th className="p-4 text-center">Settings</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssessments.map((test: any) => (
                  <tr key={test.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{test.title}</p>
                      <p className="text-xs text-gray-500 truncate max-w-xs">{test.description}</p>
                    </td>
                    <td className="p-4 text-center text-sm text-gray-600">
                      <p>{test.maxRetries} Retries</p>
                      <p className="text-xs text-gray-400">Pass: {test.passingPercentage}%</p>
                    </td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                        Active
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/admin/academy/tests/${test.id}`} className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded" title="Edit Questions">
                          <Edit2 size={16} />
                        </Link>
                        <button className="p-1.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="View Results">
                          <FileBarChart size={16} />
                        </button>
                        <button 
                          onClick={() => { setAssessmentToDelete(test); setDeleteConfirmOpen(true); }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded" title="Delete Test"
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
