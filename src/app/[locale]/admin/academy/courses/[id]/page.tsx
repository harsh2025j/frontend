"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, Users, FileCheck, Calendar, Settings, 
  BookOpen, Eye, BarChart3, Loader2, X, CheckCircle,
  MonitorPlay, Infinity
} from "lucide-react";
import { VideoCourseLayout } from "@/app/[locale]/academy/courses/[slug]/page";
import { courseApi } from "@/data/services/academy-service/course.service";
import CurriculumBuilder from "./CurriculumBuilder";
import OverviewTab from "./OverviewTab";
import AssignmentsTab from "./AssignmentsTab";
import StudentsTab from "./StudentsTab";
import toast from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";

export default function CourseUnifiedDashboard() {
  const params = useParams();
  const courseId = params?.id as string;
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<any>(null);
  const [stats, setStats] = useState({
    studentsCount: 0,
    completionRate: "0%",
    revenue: "₹0",
    assignmentsPending: 0,
  });
  
  const [activeTab, setActiveTab] = useState("overview");
  
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const res = await courseApi.fetchCourseById(courseId);
      setCourse(res.data);
      
      try {
        const statsRes = await apiClient.get('/academy/enrollments/students-summary', { params: { courseId, limit: 1000 } });
        const enrollmentsData = statsRes.data?.data || [];
        const totalStudents = statsRes.data?.total || 0;
        
        let totalProgress = 0;
        
        enrollmentsData.forEach((student: any) => {
           let enrollment = student.enrollments.find((e: any) => e.courseId === courseId);
           if (!enrollment && student.enrollments.length > 0) enrollment = student.enrollments[0]; // fallback
           totalProgress += (enrollment?.progress || 0);
        });
        
        const completionRate = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

        let pendingAssignmentsCount = 0;
        try {
          const assignmentsRes = await apiClient.get('/academy/assignments', { params: { courseId } });
          const assignmentsData = assignmentsRes.data || [];
          pendingAssignmentsCount = assignmentsData.filter((a: any) => a.status === 'pending').length;
        } catch (aErr) {
          console.error("Failed to fetch pending assignments count", aErr);
        }
        
        setStats({
          studentsCount: totalStudents,
          completionRate: `${completionRate}%`,
          revenue: `₹${(totalStudents * (res.data.price || 0)).toLocaleString()}`,
          assignmentsPending: pendingAssignmentsCount,
        });
      } catch (statsErr) {
        console.error("Failed to fetch course stats", statsErr);
      }
      
    } catch (error) {
      console.error("Failed to fetch course details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      setIsPublishing(true);
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      await courseApi.updateCourse(courseId, { status: newStatus });
      setCourse({ ...course, status: newStatus });
      setShowPublishModal(false);
      toast.success(`Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
    } catch (error) {
      toast.error("Failed to change publish status");
    } finally {
      setIsPublishing(false);
    }
  };

  // Mock Data for other tabs (until APIs are ready)

  const students = [
    { id: "STU-001", name: "Ravi Kumar", email: "ravi.kumar@example.com", progress: 68, status: "Active" },
    { id: "STU-004", name: "Sneha Reddy", email: "sneha.r@example.com", progress: 0, status: "Pending" },
  ];
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const assignments = [
    { id: "A-001", student: "Ravi Kumar", title: "Find precedent for breach of contract", status: "Pending Review", submittedAt: "2 hours ago" },
    { id: "A-004", student: "Sneha Reddy", title: "Define ratio decidendi", status: "Pending Review", submittedAt: "5 mins ago" },
  ];

  const sessions = [
    { id: "LS-103", title: "Q&A Session", date: "20 Aug 2026", time: "4:00 PM", platform: "YouTube Live", status: "Scheduled" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold text-gray-900">Course Not Found</h2>
        <Link href="/admin/academy/courses" className="text-blue-600 hover:underline mt-2 inline-block">Back to Courses</Link>
      </div>
    );
  }

  // Map backend Course entity to the VideoCourseLayout format for the preview
  const mappedCoursePreview = {
    type: "video",
    title: course.title || "",
    subtitle: course.subtitle || course.description?.substring(0, 100) + "...",
    instructors: course.instructors?.length > 0 ? course.instructors : [
      {
        name: "Sajjad Husain Legal Academy",
        bio: "Expert legal educator.",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
      }
    ],
    price: `₹${course.price}`,
    originalPrice: null,
    image: course.thumbnailUrl || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    tags: course.tags || [course.level, course.category].filter(Boolean),
    schedule: (course.startDate || course.endDate) ? {
      startDate: course.startDate || "TBA",
      endDate: course.endDate || "TBA",
      timings: "Check course modules for details",
      note: "Recordings and assignments are included."
    } : null,
    whoShouldEnrol: course.targetAudience?.length ? course.targetAudience : ["Law Students", "Advocates", "Judiciary Aspirants"],
    whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : ["Comprehensive understanding of the subject", "Practical insights", "Case law analysis"],
    modules: course.modules?.map((m: any) => ({
      title: m.title,
      lectures: m.items?.length || 0,
      duration: "1h 00m", // Fallback duration
      items: m.items?.map((item: any) => ({ title: item.title })) || []
    })) || [],
    features: course.features?.length ? course.features.map((f: string) => ({ icon: <MonitorPlay size={18} />, text: f })) : [
      { icon: <MonitorPlay size={18} />, text: "Learn anywhere" },
      { icon: <Infinity size={18} />, text: "Full lifetime access" },
    ],
    glance: [
      { label: "Teaching Hours", value: course.teachingHours || course.duration || "Self-paced" },
      { label: "Language", value: course.language || "English" },
      { label: "Level", value: course.level || "All Levels" },
    ],
    faqs: course.faqs || []
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 mt-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/academy/courses" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{course?.title}</h1>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                course?.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {course?.status ? course.status.charAt(0).toUpperCase() + course.status.slice(1) : "Draft"}
              </span>
            </div>
            <p className="text-gray-500 text-sm mt-1">Course ID: {course?.id}</p>
          </div>
        </div>
        <div>
          <button 
            onClick={() => setShowPublishModal(true)}
            className={`px-4 py-2 font-medium text-sm rounded-lg shadow-sm transition flex items-center gap-2 ${
              course?.status === 'published' ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {course?.status === 'published' ? 'Unpublish Course' : <><Eye size={16}/> Preview & Publish</>}
          </button>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Tab Navigation */}
        <div className="flex overflow-x-auto border-b border-gray-100 no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'curriculum', label: 'Curriculum', icon: BookOpen },
            { id: 'students', label: 'Students', icon: Users },
            { id: 'assignments', label: 'Assignments', icon: FileCheck },
            { id: 'sessions', label: 'Live Sessions', icon: Calendar },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600 bg-blue-50/30' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Areas */}
        <div className="p-6 md:p-8 min-h-[500px] bg-gray-50/30">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === "overview" && (
            <OverviewTab course={course} setCourse={setCourse} mockStats={stats} />
          )}

          {/* 2. CURRICULUM TAB */}
          {activeTab === "curriculum" && (
            <CurriculumBuilder courseId={courseId} />
          )}

          {/* 3. STUDENTS TAB */}
          {activeTab === "students" && (
            <StudentsTab courseId={courseId} />
          )}

          {/* 4. ASSIGNMENTS TAB */}
          {activeTab === "assignments" && (
            <AssignmentsTab courseId={courseId} />
          )}

          {/* 5. LIVE SESSIONS TAB */}
          {activeTab === "sessions" && (
            <div className="bg-white rounded-xl border border-gray-100">
               <div className="p-8 text-center text-gray-500">Live sessions management will appear here.</div>
            </div>
          )}

          {/* 6. SETTINGS TAB */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl bg-white p-6 rounded-xl border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Course Certificate Rules</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Minimum Course Progress (%)</label>
                  <input type="number" defaultValue="90" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none" />
                </div>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-blue-600" />
                  <div>
                    <p className="text-sm font-bold text-gray-900">Require Final Test Passed</p>
                    <p className="text-xs text-gray-500 mt-0.5">Student must score above 50% to get certificate.</p>
                  </div>
                </label>

                <div className="pt-4 border-t border-gray-100">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PREVIEW & PUBLISH MODAL */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-[90vw] max-w-[90vw] h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {course?.status === 'published' ? 'Unpublish Course' : 'Preview & Publish'}
                </h2>
                <p className="text-sm text-gray-500">
                  {course?.status === 'published' ? 'Remove from public listing' : 'This is how your course landing page will look.'}
                </p>
              </div>
              <button onClick={() => setShowPublishModal(false)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Preview Iframe or Dummy Content) */}
            <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
              {course?.status === 'published' ? (
                 <div className="bg-white p-8 rounded-xl text-center max-w-lg mx-auto mt-12 shadow-sm border border-red-100">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <X size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Unpublish this course?</h3>
                    <p className="text-gray-500 mb-6">It will be removed from the public academy page immediately. Students who already purchased it will still have access.</p>
                 </div>
              ) : (
                <div className="bg-[#fcfcfa] rounded-xl overflow-hidden font-sans border border-gray-200">
                  <div className="p-4 sm:p-8 pointer-events-none">
                    <VideoCourseLayout course={mappedCoursePreview} />
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setShowPublishModal(false)}
                className="px-5 py-2.5 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 rounded-xl border border-gray-200 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleTogglePublish}
                disabled={isPublishing}
                className={`px-6 py-2.5 text-white text-sm font-medium rounded-xl transition flex items-center gap-2 shadow-sm ${
                  course?.status === 'published' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isPublishing ? <Loader2 size={18} className="animate-spin" /> : null}
                {course?.status === 'published' ? 'Yes, Unpublish' : 'Looks Good, Publish Now!'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
