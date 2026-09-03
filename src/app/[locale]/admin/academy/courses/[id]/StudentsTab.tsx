import React, { useEffect, useState, useCallback, useRef } from "react";
import { Search, Users, ExternalLink } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchStudentsSummary } from "@/data/features/academy/enrollments/enrollmentsThunks";
import Pagination from "@/components/Pagination";
import { toast } from "react-hot-toast";
import Link from "next/link";

const TableSkeleton = () => (
  <>
    {[...Array(5)].map((_, i) => (
      <tr key={i} className="animate-pulse border-b border-gray-100">
        <td className="p-4">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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

export default function StudentsTab({ courseId }: { courseId: string }) {
  const dispatch = useAppDispatch();
  const { studentsSummary, isLoading: loading } = useAppSelector(state => state.enrollments);
  const { data: students, total, limit } = studentsSummary;

  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10
  });

  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const loadStudents = useCallback(async () => {
    const params: any = {
      page: filters.page,
      limit: filters.limit,
      courseId: courseId
    };
    if (filters.search) params.search = filters.search;

    try {
      await dispatch(fetchStudentsSummary(params)).unwrap();
    } catch (e) {
      console.error(e);
      toast.error(typeof e === 'string' ? e : "An error occurred while loading students");
    }
  }, [filters, courseId, dispatch]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: value, page: 1 }));
    }, 500);
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Enrolled Students</h2>
          <p className="text-sm text-gray-500">Monitor progress of students enrolled in this course.</p>
        </div>
        
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by student name or email..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-gray-50 focus:bg-white"
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
              <th className="p-4">Student</th>
              <th className="p-4 w-[25%]">Progress</th>
              <th className="p-4 w-[15%]">Status</th>
              <th className="p-4 text-center w-[10%]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 relative">
            {loading && students.length === 0 ? (
              <TableSkeleton />
            ) : students.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-16 text-center">
                  <Users className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No students found</h3>
                  <p className="text-gray-500 text-sm">No students are currently enrolled in this course.</p>
                </td>
              </tr>
            ) : (
              <>
                {loading && (
                  <div className="absolute inset-0 bg-white/40 z-10 transition-opacity duration-300 pointer-events-none" />
                )}
                
                {students.map((student: any) => {
                  let primaryEnrollment = student.enrollments[0];
                  const matched = student.enrollments.find((e: any) => e.courseId === courseId);
                  if (matched) primaryEnrollment = matched;
                  
                  return (
                    <tr key={student.userId} className="hover:bg-gray-50/50 transition">
                      <td className="p-4">
                        <p className="font-semibold text-gray-900">{student.studentName || 'Unknown Student'}</p>
                        <p className="text-xs text-gray-500">{student.studentEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Enrolled: {new Date(primaryEnrollment?.enrolledAt || student.joinedAt).toLocaleDateString()}
                        </p>
                      </td>
                      
                      <td className="p-4">
                        {primaryEnrollment ? (
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${primaryEnrollment.progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-gray-700 min-w-[3ch]">{primaryEnrollment.progress}%</span>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4">
                        {primaryEnrollment ? (
                          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            primaryEnrollment.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                            primaryEnrollment.status === 'Active' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                            'bg-gray-50 text-gray-700 border-gray-200'
                          }`}>
                            {primaryEnrollment.status}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Link href={`/admin/academy/students/${student.userId}`} className="inline-flex p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <ExternalLink size={18} />
                        </Link>
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
      {!loading && total > 0 && (
        <div className="p-4 border-t border-gray-100">
          <Pagination
            currentPage={filters.page}
            totalPages={Math.ceil(total / (limit || 10)) || 1}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
