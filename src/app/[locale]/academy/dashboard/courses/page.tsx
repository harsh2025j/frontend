"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { PlayCircle, CheckCircle, BarChart2, Loader2, BookOpen } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';

export default function MyCoursesPage() {
  const dispatch = useAppDispatch();
  const { myEnrollments, isLoading } = useAppSelector(state => state.enrollments);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
  }, [dispatch]);

  const activeCoursesCount = myEnrollments.length;
  const inProgressCourses = myEnrollments.filter(e => e.progress !== 100).length;
  const completedCourses = myEnrollments.filter(e => e.progress === 100).length;

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">My Courses</h1>
          <p className="text-[#122340]/60">Your active enrollments and learning history.</p>
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-[#122340]/10 shadow-sm overflow-x-auto max-w-full">
          <button className="px-5 py-2 whitespace-nowrap rounded-lg bg-[#122340]/5 text-[#122340] font-bold text-sm">All Courses ({activeCoursesCount})</button>
          <button className="px-5 py-2 whitespace-nowrap rounded-lg text-[#122340]/50 hover:text-[#122340] font-semibold text-sm transition-colors">In Progress ({inProgressCourses})</button>
          <button className="px-5 py-2 whitespace-nowrap rounded-lg text-[#122340]/50 hover:text-[#122340] font-semibold text-sm transition-colors">Completed ({completedCourses})</button>
        </div>
      </div>

      {/* Content */}
      {isLoading && myEnrollments.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 size={32} className="animate-spin text-[#C9A227]" />
        </div>
      ) : myEnrollments.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-[#122340]/5 shadow-sm text-center">
          <div className="w-16 h-16 bg-[#122340]/5 rounded-full flex items-center justify-center mx-auto mb-4 text-[#C9A227]">
            <BookOpen size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#122340] mb-2">No Active Enrollments</h3>
          <p className="text-[#122340]/60 mb-6 max-w-md mx-auto">You have not enrolled in any courses yet. Explore our academy to start learning today.</p>
          <Link href="/academy/courses">
            <button className="bg-[#C9A227] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#b39022] transition-colors shadow-md">
              Browse Courses
            </button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {myEnrollments.map((enrollment) => {
            const course = enrollment.course;
            if (!course) return null;
            
            const progress = enrollment.progress || 0;
            const isCompleted = progress === 100;
            const category = course.category || "Course";
            
            return (
              <div key={course.slug} className="group relative bg-white rounded-3xl overflow-hidden border border-[#122340]/5 flex flex-col h-full hover:border-[#C9A227] hover:shadow-[0_20px_60px_rgba(18,35,64,0.12)] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
                
                {/* Image Section */}
                <div className="h-56 relative overflow-hidden bg-[#122340]/5">
                  <img 
                    src={course.thumbnailUrl || "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop"} 
                    alt={course.title} 
                    className="w-full h-full object-cover transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100"></div>
                  
                  {/* Progress Ring Overlay */}
                  <div className="absolute bottom-5 right-5 flex items-center justify-center">
                    <div className="relative w-14 h-14 bg-black/20 backdrop-blur-sm rounded-full shadow-lg">
                      <svg className="w-full h-full transform -rotate-90 p-1" viewBox="0 0 36 36">
                        <path className="text-white/10" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                        <path className={isCompleted ? "text-green-400" : "text-[#C9A227]"} strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-white drop-shadow-md">
                        {progress}%
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Content Section */}
                <div className="p-6 md:p-7 flex flex-col flex-grow bg-white">
                  
                  {/* Course Title */}
                  <h3 className="font-extrabold text-[#122340] text-xl leading-tight line-clamp-2 mb-5 group-hover:text-[#C9A227] transition-colors duration-300">
                    {course.title}
                  </h3>

                  <div className="flex items-center justify-end gap-4 mb-8 text-sm">
                    <span className="text-[11px] font-semibold text-[#122340]/40 uppercase tracking-wider">
                      Since {new Date(enrollment.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  
                  <div className="mt-auto">
                    {isCompleted ? (
                      <Link href={`/dashboard/certificates`}>
                        <button className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold hover:bg-green-600 transition-all text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(34,197,94,0.39)] hover:shadow-[0_6px_20px_rgba(34,197,94,0.23)] hover:-translate-y-0.5">
                          <CheckCircle size={18} /> View Certificate
                        </button>
                      </Link>
                    ) : (
                      <Link href={`/dashboard/learn/${course.slug}`}>
                        <button className="w-full bg-[#122340] text-white py-3.5 rounded-xl font-bold hover:bg-[#0a1628] transition-all text-sm flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(18,35,64,0.39)] hover:shadow-[0_6px_20px_rgba(18,35,64,0.23)] hover:-translate-y-0.5 relative overflow-hidden group/btn">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/btn:animate-[shimmer_1.5s_infinite]"></div>
                          <PlayCircle size={18} className="text-[#C9A227]" /> Resume Course
                        </button>
                      </Link>
                    )}
                  </div>
                </div>
                
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

