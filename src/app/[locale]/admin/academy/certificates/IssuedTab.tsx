"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  Download,
  Eye,
  RefreshCw,
  Ban,
  X,
  GraduationCap,
  Award,
  Plus,
  Loader2,
  Sparkles,
  UserCheck,
  UserPlus,
  Mail,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Filter,
} from "lucide-react";
import { certificateApi, Certificate } from "@/data/services/academy-service/certificate.service";
import { courseApi } from "@/data/services/academy-service/course.service";
import { usersApi } from "@/data/services/users-service/users-service";
import apiClient from "@/data/services/apiConfig/apiClient";
import toast from "react-hot-toast";

export default function IssuedTab() {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loadingCourses, setLoadingCourses] = useState(true);

  const [items, setItems] = useState<Certificate[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [selected, setSelected] = useState<Certificate | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  const [reissueTarget, setReissueTarget] = useState<Certificate | null>(null);
  const [isReissuing, setIsReissuing] = useState(false);

  // Manual Generation State
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [generateMode, setGenerateMode] = useState<"enrolled" | "external">("enrolled");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    courseId: "",
    studentName: "",
    studentEmail: "",
    instructorName: "",
    issueDate: new Date().toISOString().slice(0, 10),
    grade: "",
    enrollmentId: "",
    userId: "",
    sendEmail: true,
  });

  // Enrolled students state for modal picker
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [loadingEnrolledStudents, setLoadingEnrolledStudents] = useState(false);
  const [studentSearchQuery, setStudentSearchQuery] = useState("");
  const [selectedEnrolledStudent, setSelectedEnrolledStudent] = useState<any | null>(null);

  // 1. Fetch available courses
  useEffect(() => {
    (async () => {
      setLoadingCourses(true);
      try {
        const res: any = await courseApi.fetchCourses();
        const list = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourseId(list[0].id);
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
        toast.error("Failed to load course list");
      } finally {
        setLoadingCourses(false);
      }
    })();
  }, []);

  // 2. Load certificates strictly for the selected course
  const load = async () => {
    if (!selectedCourseId) {
      setItems([]);
      setTotal(0);
      return;
    }
    setLoading(true);
    try {
      const res: any = await certificateApi.listCertificates({
        courseId: selectedCourseId,
        q: q || undefined,
        status,
        page,
        limit,
      });
      const payload = res?.data ?? res;
      setItems(payload?.data ?? []);
      setTotal(payload?.total ?? 0);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCourseId) {
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourseId, status, page]);

  const selectedCourse = useMemo(() => {
    return courses.find((c) => c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);

  const doRevoke = async () => {
    if (!revokeTarget || !revokeReason.trim()) return;
    try {
      await certificateApi.revoke(revokeTarget.id, revokeReason.trim());
      toast.success("Certificate revoked");
      setRevokeTarget(null);
      setRevokeReason("");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to revoke");
    }
  };

  const doReissue = async () => {
    if (!reissueTarget) return;
    setIsReissuing(true);
    try {
      await certificateApi.reissue(reissueTarget.id);
      toast.success("Certificate re-issued successfully!");
      setReissueTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to reissue");
    } finally {
      setIsReissuing(false);
    }
  };

  const fetchEnrolledStudents = async (courseId: string) => {
    if (!courseId) return;
    setLoadingEnrolledStudents(true);
    try {
      const res: any = await apiClient.get("/academy/enrollments/students-summary", {
        params: { courseId, limit: 1000 },
      });
      const data = res?.data?.data || res?.data || [];
      const enriched = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (s: any) => {
          if (!s.studentName || s.studentName === "Unknown Student" || !s.studentEmail) {
            try {
              const userRes: any = await usersApi.getUserById(s.userId);
              const u = userRes?.data || userRes;
              if (u) {
                const resolvedName =
                  `${u.firstName || ""}`.trim()
                    ? `${u.firstName || ""} ${u.lastName || ""}`.trim()
                    : u.name;
                if (resolvedName && (!s.studentName || s.studentName === "Unknown Student")) {
                  s.studentName = resolvedName;
                }
                if (u.email && !s.studentEmail) {
                  s.studentEmail = u.email;
                }
              }
            } catch {
              try {
                const pubRes: any = await apiClient.get(`/profile/public/${s.userId}`);
                const pu = pubRes?.data?.data || pubRes?.data;
                if (pu) {
                  if (pu.name && (!s.studentName || s.studentName === "Unknown Student")) {
                    s.studentName = pu.name;
                  }
                  if (pu.email && !s.studentEmail) {
                    s.studentEmail = pu.email;
                  }
                }
              } catch { }
            }
          }
          return s;
        })
      );
      setEnrolledStudents(enriched);
    } catch (e: any) {
      console.error("Failed to load enrolled students:", e);
      setEnrolledStudents([]);
    } finally {
      setLoadingEnrolledStudents(false);
    }
  };

  const resolveCourseInstructorsString = (course: any): string => {
    if (!course || !Array.isArray(course.instructors) || course.instructors.length === 0) {
      return "";
    }
    const names = course.instructors
      .map((i: any) => (typeof i === "string" ? i : i?.name))
      .filter((n: any) => typeof n === "string" && n.trim().length > 0)
      .map((n: string) => n.trim());
    return names.join(", ");
  };

  const handleOpenGenerateModal = () => {
    const defaultCourseId = selectedCourseId || (courses[0]?.id ?? "");
    const curCourse = courses.find((c) => c.id === defaultCourseId);
    setGenerateMode("enrolled");
    setSelectedEnrolledStudent(null);
    setStudentSearchQuery("");
    setGenerateForm({
      courseId: defaultCourseId,
      studentName: "",
      studentEmail: "",
      instructorName: resolveCourseInstructorsString(curCourse),
      issueDate: new Date().toISOString().slice(0, 10),
      grade: "",
      enrollmentId: "",
      userId: "",
      sendEmail: true,
    });
    setGenerateModalOpen(true);
    fetchEnrolledStudents(defaultCourseId);
  };

  const handleModalCourseChange = (courseId: string) => {
    const curCourse = courses.find((c) => c.id === courseId);
    setSelectedEnrolledStudent(null);
    setStudentSearchQuery("");
    setGenerateForm((prev) => ({
      ...prev,
      courseId,
      studentName: "",
      studentEmail: "",
      enrollmentId: "",
      userId: "",
      instructorName: resolveCourseInstructorsString(curCourse),
    }));
    fetchEnrolledStudents(courseId);
  };

  const handleSelectStudent = (student: any) => {
    const enrollment =
      student.enrollments?.find((e: any) => e.courseId === generateForm.courseId) ||
      student.enrollments?.[0];
    setSelectedEnrolledStudent(student);
    setGenerateForm((prev) => ({
      ...prev,
      studentName: student.studentName || "",
      studentEmail: student.studentEmail || "",
      enrollmentId: enrollment?.id || "",
      userId: student.userId,
    }));
  };

  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return enrolledStudents;
    const qLower = studentSearchQuery.toLowerCase();
    return enrolledStudents.filter((s: any) => {
      const name = (s.studentName || "").toLowerCase();
      const email = (s.studentEmail || "").toLowerCase();
      return name.includes(qLower) || email.includes(qLower);
    });
  }, [enrolledStudents, studentSearchQuery]);

  const [existingCertPrompt, setExistingCertPrompt] = useState<{
    open: boolean;
    certificateId?: string;
    studentName?: string;
    studentEmail?: string;
  }>({ open: false });

  const executeIssue = async (updateExisting = false) => {
    setIsGenerating(true);
    try {
      await certificateApi.manualIssue({
        courseId: generateForm.courseId,
        studentName: generateForm.studentName.trim(),
        studentEmail: generateForm.studentEmail.trim() || undefined,
        instructorName: generateForm.instructorName.trim() || undefined,
        issueDate: generateForm.issueDate || undefined,
        grade: generateForm.grade ? generateForm.grade : undefined,
        enrollmentId: generateMode === "enrolled" ? generateForm.enrollmentId : undefined,
        userId: generateMode === "enrolled" ? generateForm.userId : undefined,
        mode: generateMode,
        sendEmail: true,
        updateExisting,
      });

      if (updateExisting) {
        toast.success("Certificate updated and re-issued successfully!");
      } else {
        toast.success("Certificate generated and issued successfully!");
      }

      setExistingCertPrompt({ open: false });
      setGenerateModalOpen(false);
      if (selectedCourseId !== generateForm.courseId) {
        setSelectedCourseId(generateForm.courseId);
      } else {
        load();
      }
    } catch (err: any) {
      console.error("Failed to generate certificate:", err);
      const isConflict = err?.response?.status === 409 || err?.response?.data?.alreadyExists;
      if (isConflict) {
        setExistingCertPrompt({
          open: true,
          certificateId: err?.response?.data?.certificateId,
          studentName: err?.response?.data?.studentName || generateForm.studentName,
          studentEmail: err?.response?.data?.studentEmail || generateForm.studentEmail,
        });
      } else {
        toast.error(err?.response?.data?.message || err?.message || "Failed to generate certificate");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.courseId) {
      toast.error("Please select a course");
      return;
    }

    if (generateMode === "enrolled") {
      if (!selectedEnrolledStudent || !generateForm.enrollmentId) {
        toast.error("Please select a student enrolled in this course");
        return;
      }
    }

    if (!generateForm.studentName.trim()) {
      toast.error("Please enter the student's full name");
      return;
    }

    if (generateMode === "external" && !generateForm.studentEmail.trim()) {
      toast.error("Please enter the candidate's email address to deliver their certificate");
      return;
    }

    const normalizedEmail = generateForm.studentEmail.trim().toLowerCase();
    const existingCertInList = items.find(
      (c) =>
        c.courseId === generateForm.courseId &&
        ((normalizedEmail && c.studentEmail?.toLowerCase() === normalizedEmail) ||
          (generateForm.userId && c.userId === generateForm.userId))
    );

    if (existingCertInList) {
      setExistingCertPrompt({
        open: true,
        certificateId: existingCertInList.certificateId,
        studentName: existingCertInList.studentName,
        studentEmail: existingCertInList.studentEmail || generateForm.studentEmail,
      });
      return;
    }

    await executeIssue(false);
  };

  /* ─────────────────── STATS ─────────────────── */
  const issuedCount = items.filter((c) => c.status === "issued").length;
  const revokedCount = items.filter((c) => c.status === "revoked").length;

  /* ─────────────────── JSX ─────────────────── */
  return (
    <div className="space-y-5">

      {/* ── Toolbar: Course Selector + Action ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
              Viewing Course
            </p>
            {loadingCourses ? (
              <p className="text-sm text-gray-400 flex items-center gap-1.5">
                <Loader2 size={14} className="animate-spin" /> Loading courses…
              </p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-red-500 font-medium">No courses available</p>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setPage(1);
                }}
                className="font-bold text-gray-900 bg-transparent border-none focus:outline-none text-base pr-2 cursor-pointer w-full max-w-xs truncate"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Stats */}
          {selectedCourse && !loading && (
            <div className="hidden md:flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg">
                <ShieldCheck size={13} /> {issuedCount} Issued
              </span>
              {revokedCount > 0 && (
                <span className="flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg">
                  <ShieldAlert size={13} /> {revokedCount} Revoked
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleOpenGenerateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition cursor-pointer whitespace-nowrap"
          >
            <Plus size={15} />
            Issue Certificate
          </button>
        </div>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search by student name, email, or cert ID…"
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2.5">
            <Filter size={15} className="text-gray-400" />
            <select
              value={status}
              onChange={(e) => (setStatus(e.target.value), setPage(1))}
              className="text-sm bg-transparent border-none focus:outline-none text-gray-700 font-medium cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="revoked">Revoked</option>
            </select>
          </div>
          <button
            onClick={() => (setPage(1), load())}
            className="px-4 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition cursor-pointer whitespace-nowrap"
          >
            Search
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center">
            <Loader2 size={28} className="animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Loading certificates…</p>
          </div>
        ) : !selectedCourseId ? (
          <div className="p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <BookOpen size={26} className="text-gray-400" />
            </div>
            <p className="text-gray-600 font-semibold">Select a course to view its certificates</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Award size={28} className="text-blue-500" />
            </div>
            <p className="text-gray-800 font-bold text-base">No certificates yet</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">
              No certificates have been issued for{" "}
              <span className="font-semibold text-gray-600">{selectedCourse?.title}</span>.
            </p>
            <button
              onClick={handleOpenGenerateModal}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <Plus size={15} />
              Issue First Certificate
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/70">
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Cert ID</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Student</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Issue Date</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400">Status</th>
                    <th className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((c) => (
                    <tr key={c.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          {c.certificateId}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                            {(c.studentName || "?").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-tight">{c.studentName}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{c.studentEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {new Date(c.issueDate).toLocaleDateString(undefined, {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-5 py-4">
                        {c.status === "issued" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <ShieldCheck size={12} /> Issued
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full bg-red-50 text-red-600 border border-red-200">
                            <ShieldAlert size={12} /> Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelected(c)}
                            title="Preview"
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <a
                            href={`/api/academy/download?url=${encodeURIComponent(c.pdfUrl)}&filename=${encodeURIComponent(
                              (c.studentName || "Certificate").replace(/[^a-zA-Z0-9_-]/g, "_") +
                              "_" +
                              (c.courseName || "Course").replace(/[^a-zA-Z0-9_-]/g, "_") +
                              ".pdf"
                            )}`}
                            download={`${(c.studentName || "Certificate").replace(/[^a-zA-Z0-9_-]/g, "_")}_${(
                              c.courseName || "Course"
                            ).replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`}
                            title="Download PDF"
                            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                          >
                            <Download size={16} />
                          </a>
                          {c.status === "issued" ? (
                            <button
                              onClick={() => setRevokeTarget(c)}
                              title="Revoke"
                              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                            >
                              <Ban size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setReissueTarget(c)}
                              title="Reissue"
                              className="p-2 rounded-lg text-gray-400 hover:text-green-600 hover:bg-green-50 transition cursor-pointer"
                            >
                              <RefreshCw size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-sm">
              <p className="text-gray-400 text-xs">
                {total} certificate{total !== 1 ? "s" : ""} &middot; page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-100 transition cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-500 disabled:opacity-30 hover:bg-gray-100 transition cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selected && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                  {selected.certificateId}
                </span>
                <p className="text-xs text-gray-500 mt-1.5">
                  {selected.studentName} &middot; {selected.courseName}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <iframe src={selected.pdfUrl} className="flex-1 w-full" title="Certificate PDF" />
          </div>
        </div>
      )}

      {/* ─── Revoke Modal ─── */}
      {revokeTarget && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setRevokeTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Ban size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Revoke Certificate</h3>
                <p className="text-xs font-mono text-gray-400 mt-0.5">{revokeTarget.certificateId}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              The certificate stays in the system but will be marked as{" "}
              <span className="font-semibold text-red-600">REVOKED</span> on the public verification page.
            </p>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400"
              placeholder="e.g. Issued in error, plagiarism, student request…"
            />
            <div className="flex justify-end gap-2.5 mt-5">
              <button
                onClick={() => setRevokeTarget(null)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!revokeReason.trim()}
                onClick={doRevoke}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold disabled:opacity-40 transition shadow-sm cursor-pointer"
              >
                Revoke Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reissue Modal ─── */}
      {reissueTarget && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isReissuing && setReissueTarget(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 border border-green-200 flex items-center justify-center shrink-0">
                <RefreshCw size={22} className={isReissuing ? "animate-spin" : ""} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reissue Certificate</h3>
                <p className="text-xs font-mono text-blue-600 mt-0.5">{reissueTarget.certificateId}</p>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Reissue the certificate for{" "}
              <strong className="text-gray-900">{reissueTarget.studentName}</strong> in{" "}
              <strong className="text-gray-900">{reissueTarget.courseName}</strong>?
            </p>

            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 mb-5 space-y-1">
              <p className="font-bold text-amber-950">What will happen:</p>
              <p>• Status restored from <span className="font-semibold text-red-600">Revoked</span> → <span className="font-semibold text-green-700">Issued</span></p>
              <p>• PDF regenerated with the latest template & course details</p>
              <p>• An updated certificate email will be sent to the student</p>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                disabled={isReissuing}
                onClick={() => setReissueTarget(null)}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition disabled:opacity-40 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isReissuing}
                onClick={doReissue}
                className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isReissuing ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" /> Reissuing…
                  </>
                ) : (
                  <>
                    <RefreshCw size={14} /> Confirm Reissue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Manual Generate Modal ─── */}
      {generateModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => !isGenerating && setGenerateModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Award size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Issue Certificate Manually</h3>
                  <p className="text-xs text-gray-400">Direct certificate generation for a student</p>
                </div>
              </div>
              <button
                disabled={isGenerating}
                onClick={() => setGenerateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mode Selector */}
            <div className="p-4 bg-gray-50/80 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/50 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setGenerateMode("enrolled");
                    if (courses.length > 0 && enrolledStudents.length === 0) {
                      fetchEnrolledStudents(generateForm.courseId || selectedCourseId);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${generateMode === "enrolled"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                    }`}
                >
                  <UserCheck size={15} /> Enrolled Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGenerateMode("external");
                    setSelectedEnrolledStudent(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${generateMode === "external"
                    ? "bg-white text-blue-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-white/60"
                    }`}
                >
                  <UserPlus size={15} /> External / Direct Entry
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Course Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Course <span className="text-red-500">*</span>
                </label>
                <select
                  value={generateForm.courseId}
                  onChange={(e) => handleModalCourseChange(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-white"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enrolled Student Picker */}
              {generateMode === "enrolled" && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Enrolled Student <span className="text-red-500">*</span>
                  </label>

                  {selectedEnrolledStudent ? (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {(generateForm.studentName || "S").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{generateForm.studentName || "—"}</p>
                            <p className="text-xs text-gray-400">{generateForm.studentEmail || "No email"}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnrolledStudent(null);
                            setGenerateForm((p) => ({ ...p, studentName: "", studentEmail: "", enrollmentId: "", userId: "" }));
                          }}
                          className="text-xs text-blue-700 font-semibold hover:underline cursor-pointer"
                        >
                          Change
                        </button>
                      </div>
                      {(() => {
                        const enrollment =
                          selectedEnrolledStudent.enrollments?.find((e: any) => e.courseId === generateForm.courseId) ||
                          selectedEnrolledStudent.enrollments?.[0];
                        const prog = enrollment?.progress ?? 0;
                        const hasCertAlready = items.some(
                          (c) => c.userId === selectedEnrolledStudent.userId && c.status === "issued"
                        );
                        return (
                          <div className="mt-3 pt-3 border-t border-blue-100 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Progress</span>
                              <span className="font-bold text-blue-800">{prog}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Math.max(3, prog))}%` }} />
                            </div>
                            {hasCertAlready ? (
                              <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-xs">
                                <AlertCircle size={13} className="shrink-0 mt-0.5" />
                                <span>Certificate already exists. Generating will update & reissue it.</span>
                              </div>
                            ) : (
                              <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-800 text-xs">
                                <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                                <span>Issuing will mark progress as <strong>100% Completed</strong> and unlock their certificate.</span>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Name on Cert *</label>
                                <input
                                  type="text" required disabled={isGenerating}
                                  value={generateForm.studentName}
                                  onChange={(e) => setGenerateForm({ ...generateForm, studentName: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Email</label>
                                <input
                                  type="email" disabled={isGenerating}
                                  value={generateForm.studentEmail}
                                  onChange={(e) => setGenerateForm({ ...generateForm, studentEmail: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <input
                          type="text" placeholder="Search enrolled student…"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      </div>
                      <div className="border border-gray-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-gray-100 bg-gray-50/40">
                        {loadingEnrolledStudents ? (
                          <div className="p-5 flex items-center justify-center gap-2 text-xs text-gray-400">
                            <Loader2 size={14} className="animate-spin text-blue-500" /> Loading students…
                          </div>
                        ) : filteredStudents.length === 0 ? (
                          <div className="p-5 text-center text-xs text-gray-400">
                            {studentSearchQuery ? `No results for "${studentSearchQuery}"` : "No enrolled students found."}
                          </div>
                        ) : (
                          filteredStudents.map((s: any) => {
                            const enrollment = s.enrollments?.find((e: any) => e.courseId === generateForm.courseId) || s.enrollments?.[0];
                            const prog = enrollment?.progress ?? 0;
                            const hasCert = items.some((c) => c.userId === s.userId && c.status === "issued");
                            return (
                              <button
                                key={s.userId} type="button"
                                onClick={() => handleSelectStudent(s)}
                                className="w-full p-2.5 text-left hover:bg-blue-50/60 transition flex items-center justify-between gap-3 cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                    {(s.studentName || "S").slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate">{s.studentName || "Unnamed"}</p>
                                    <p className="text-[11px] text-gray-400 truncate">{s.studentEmail || "No email"}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {hasCert && (
                                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded font-semibold">
                                      Cert Issued
                                    </span>
                                  )}
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold border ${prog === 100 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                    {prog}%
                                  </span>
                                </div>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* External Entry */}
              {generateMode === "external" && (
                <div className="space-y-3">
                  <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <Sparkles size={15} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">External / Offline Candidate</p>
                      <p className="text-amber-800/80 mt-0.5">A unique certificate ID and QR code will be created for this person.</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text" required disabled={isGenerating}
                      placeholder="e.g. Adv. Rahul Sharma"
                      value={generateForm.studentName}
                      onChange={(e) => setGenerateForm({ ...generateForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      <input
                        type="email" required disabled={isGenerating}
                        placeholder="student@example.com"
                        value={generateForm.studentEmail}
                        onChange={(e) => setGenerateForm({ ...generateForm, studentEmail: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Date + Grade */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Issue Date</label>
                  <input
                    type="date" disabled={isGenerating}
                    value={generateForm.issueDate}
                    onChange={(e) => setGenerateForm({ ...generateForm, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Grade <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text" disabled={isGenerating}
                    placeholder="e.g. A+ or 95%"
                    value={generateForm.grade}
                    onChange={(e) => setGenerateForm({ ...generateForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Instructor Info */}
              {(() => {
                const curCourse = courses.find((c) => c.id === generateForm.courseId);
                const rawInstructors = curCourse?.instructors;
                const instructorNames = Array.isArray(rawInstructors)
                  ? rawInstructors.map((i: any) => (typeof i === "string" ? i : i?.name)).filter((n: any) => typeof n === "string" && n.trim()).map((n: string) => n.trim())
                  : [];
                const displayNames = generateForm.instructorName || (instructorNames.length > 0 ? instructorNames.join(", ") : "Platform Academic Board");
                return (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <GraduationCap size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Instructor on Certificate</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{displayNames}</p>
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-semibold shrink-0 ml-auto">Auto</span>
                  </div>
                );
              })()}

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button" disabled={isGenerating}
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || (generateMode === "enrolled" && !selectedEnrolledStudent)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <><Loader2 size={15} className="animate-spin" /> Generating PDF…</>
                  ) : (
                    <><Sparkles size={15} /> Generate & Issue</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Existing Cert Conflict ─── */}
      {existingCertPrompt.open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center">Certificate Already Exists</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              A certificate was already generated for{" "}
              <strong className="text-gray-800">{existingCertPrompt.studentEmail || generateForm.studentEmail}</strong>.
            </p>
            {existingCertPrompt.certificateId && (
              <p className="text-center mt-1">
                <span className="font-mono text-xs text-gray-400">{existingCertPrompt.certificateId}</span>
              </p>
            )}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-4 text-xs text-amber-900 text-center">
              Do you want to update the existing certificate instead of creating a duplicate?
            </div>
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                disabled={isGenerating}
                onClick={() => setExistingCertPrompt({ open: false })}
                className="py-2.5 px-4 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isGenerating}
                onClick={() => executeIssue(true)}
                className="py-2.5 px-4 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : null}
                Update Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
