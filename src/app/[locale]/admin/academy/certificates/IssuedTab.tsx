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

  const doReissue = async (c: Certificate) => {
    try {
      await certificateApi.reissue(c.id);
      toast.success("Reissue triggered");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to reissue");
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
              } catch {}
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
        sendEmail: generateForm.sendEmail !== false,
        updateExisting,
      });

      if (updateExisting) {
        toast.success("Certificate updated and re-issued successfully!");
      } else if (generateForm.sendEmail && generateForm.studentEmail) {
        toast.success("Certificate issued & sent to student's email!");
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

    // Check if certificate already exists in current course certificate list
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

  return (
    <div className="space-y-4">
      {/* Course Selector Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <GraduationCap size={22} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filter by Course
            </label>
            {loadingCourses ? (
              <p className="text-sm text-gray-400">Loading courses…</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-red-500">No courses available.</p>
            ) : (
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setPage(1);
                }}
                className="mt-0.5 font-semibold text-gray-900 bg-transparent border-b border-gray-300 hover:border-blue-500 focus:border-blue-600 focus:outline-none py-1 pr-6 cursor-pointer text-base"
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

        <div className="flex items-center gap-3 self-start md:self-auto">
          {selectedCourse && (
            <div className="hidden sm:flex items-center gap-2 bg-blue-50/60 border border-blue-100 text-blue-800 px-3.5 py-1.5 rounded-lg text-xs font-medium">
              <span>Course:</span>
              <span className="font-bold truncate max-w-xs">{selectedCourse.title}</span>
              <span className="bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded-full font-semibold">
                {total} {total === 1 ? "cert" : "certs"}
              </span>
            </div>
          )}

          <button
            onClick={handleOpenGenerateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition"
          >
            <Award size={16} />
            <span>+ Generate Certificate</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search student, email, certificate ID…"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={status}
              onChange={(e) => (setStatus(e.target.value), setPage(1))}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white"
            >
              <option value="all">All statuses</option>
              <option value="issued">Issued</option>
              <option value="revoked">Revoked</option>
            </select>
            <button
              onClick={() => (setPage(1), load())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shrink-0"
            >
              Search
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                <th className="p-4">Certificate ID</th>
                <th className="p-4">Student</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Loading certificates for this course…
                  </td>
                </tr>
              ) : !selectedCourseId ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400 text-sm">
                    Please select a course to view issued certificates.
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                        <Award size={24} />
                      </div>
                      <p className="text-gray-700 font-medium">
                        No certificates issued yet for{" "}
                        <span className="font-semibold text-gray-900">
                          {selectedCourse?.title || "this course"}
                        </span>.
                      </p>
                      <p className="text-xs text-gray-400">
                        Certificates are issued automatically upon course completion, or you can issue one manually below.
                      </p>
                      <button
                        onClick={handleOpenGenerateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm cursor-pointer"
                      >
                        <Plus size={14} />
                        Generate Certificate for this Course
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition">
                    <td className="p-4">
                      <p className="font-mono font-bold text-blue-600 text-sm">{c.certificateId}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-semibold text-gray-900">{c.studentName}</p>
                      <p className="text-xs text-gray-500">{c.studentEmail}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(c.issueDate).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full flex w-max items-center gap-1 ${
                        c.status === "issued" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {c.status === "issued" ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                        {c.status === "issued" ? "Issued" : "Revoked"}
                      </span>
                    </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setSelected(c)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>
                      <a
                        href={`/api/academy/download?url=${encodeURIComponent(c.pdfUrl)}&filename=${encodeURIComponent((c.studentName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_') + '_' + (c.courseName || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_') + '.pdf')}`}
                        download={`${(c.studentName || 'Certificate').replace(/[^a-zA-Z0-9_-]/g, '_')}_${(c.courseName || 'Course').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`}
                        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </a>
                      {c.status === "issued" ? (
                        <button
                          onClick={() => setRevokeTarget(c)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Revoke"
                        >
                          <Ban size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => doReissue(c)}
                          className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="Reissue"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500 bg-gray-50/50">
        <div>{total} certificate{total === 1 ? "" : "s"}</div>
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-3 py-1.5 border border-gray-200 rounded-md disabled:opacity-40"
          >
            Prev
          </button>
          <span>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 border border-gray-200 rounded-md disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <p className="font-mono font-bold text-blue-600">{selected.certificateId}</p>
                <p className="text-xs text-gray-500 mt-0.5">{selected.studentName} · {selected.courseName}</p>
              </div>
              <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <iframe src={selected.pdfUrl} className="flex-1 w-full" title="Certificate PDF" />
          </div>
        </div>
      )}

      {/* Revoke modal */}
      {revokeTarget && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={() => setRevokeTarget(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Revoke Certificate</h3>
            <p className="text-sm text-gray-500 mb-4">
              Revoking <span className="font-mono font-bold">{revokeTarget.certificateId}</span> keeps it in the system but marks it as REVOKED on the public verify page.
            </p>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason</label>
            <textarea
              value={revokeReason}
              onChange={(e) => setRevokeReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Issued in error / plagiarism / student request"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setRevokeTarget(null)}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                disabled={!revokeReason.trim()}
                onClick={doRevoke}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold disabled:opacity-40"
              >
                Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Generate Certificate Modal */}
      {generateModalOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => !isGenerating && setGenerateModalOpen(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-xs">
                  <Award size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Issue Certificate Manually</h3>
                  <p className="text-xs text-gray-500">Emergency & direct certificate generation for students</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setGenerateModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Segmented Mode Selector */}
            <div className="p-4 bg-gray-50/80 border-b border-gray-100">
              <div className="grid grid-cols-2 gap-2 p-1 bg-gray-200/60 rounded-xl">
                <button
                  type="button"
                  onClick={() => {
                    setGenerateMode("enrolled");
                    if (courses.length > 0 && enrolledStudents.length === 0) {
                      fetchEnrolledStudents(generateForm.courseId || selectedCourseId);
                    }
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    generateMode === "enrolled"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <UserCheck size={16} />
                  <span>Enrolled Course Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setGenerateMode("external");
                    setSelectedEnrolledStudent(null);
                  }}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                    generateMode === "external"
                      ? "bg-white text-blue-700 shadow-sm"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <UserPlus size={16} />
                  <span>External / Direct Entry</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Course Selector (Common to both, pre-selected to currently viewed course) */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Target Course <span className="text-red-500">*</span>
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
                <p className="text-[11px] text-gray-400 mt-1">
                  The certificate template assigned to this course will be rendered automatically.
                </p>
              </div>

              {/* Pathway 1: Enrolled Course Student */}
              {generateMode === "enrolled" && (
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Select Enrolled Student <span className="text-red-500">*</span>
                  </label>

                  {selectedEnrolledStudent ? (
                    <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl relative">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                            {(generateForm.studentName || selectedEnrolledStudent.studentName || "S").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">
                              {generateForm.studentName || selectedEnrolledStudent.studentName || "Unnamed Student"}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {generateForm.studentEmail || selectedEnrolledStudent.studentEmail || "No email on record"}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEnrolledStudent(null);
                            setGenerateForm((prev) => ({
                              ...prev,
                              studentName: "",
                              studentEmail: "",
                              enrollmentId: "",
                              userId: "",
                            }));
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-100 rounded-lg transition cursor-pointer"
                        >
                          Change Student
                        </button>
                      </div>

                      {/* Course progress info */}
                      {(() => {
                        const enrollment =
                          selectedEnrolledStudent.enrollments?.find(
                            (e: any) => e.courseId === generateForm.courseId
                          ) || selectedEnrolledStudent.enrollments?.[0];
                        const prog = enrollment?.progress ?? 0;
                        const hasCertAlready = items.some(
                          (c) => c.userId === selectedEnrolledStudent.userId && c.status === "issued"
                        );

                        return (
                          <div className="mt-3 pt-3 border-t border-blue-100 text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-gray-600 font-medium">Current Progress:</span>
                              <span className="font-bold text-blue-900">{prog}% Completed</span>
                            </div>
                            <div className="w-full h-1.5 bg-blue-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(5, prog))}%` }}
                              />
                            </div>

                            {hasCertAlready ? (
                              <div className="mt-2.5 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-800 text-[11px]">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <span>
                                  A certificate already exists for this student in this course. Generating will
                                  update and reissue their certificate.
                                </span>
                              </div>
                            ) : (
                              <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2 text-emerald-800 text-[11px]">
                                <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                                <span>
                                  Issuing will mark progress as <strong>100% Completed</strong> and immediately
                                  unlock their verifiable certificate in their Student Dashboard and Learn page.
                                </span>
                              </div>
                            )}

                            {/* Editable student name & email on certificate */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-blue-100">
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                  Student Name on Certificate <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  required
                                  disabled={isGenerating}
                                  placeholder="e.g. Adv. Rahul Sharma"
                                  value={generateForm.studentName}
                                  onChange={(e) =>
                                    setGenerateForm({ ...generateForm, studentName: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                                  Student Email Address
                                </label>
                                <input
                                  type="email"
                                  disabled={isGenerating}
                                  placeholder="student@example.com"
                                  value={generateForm.studentEmail}
                                  onChange={(e) =>
                                    setGenerateForm({ ...generateForm, studentEmail: e.target.value })
                                  }
                                  className="w-full px-3 py-2 border border-gray-200 bg-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                                />
                              </div>
                            </div>

                            <div className="mt-2.5 p-2.5 bg-white rounded-lg border border-blue-100 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Mail size={15} className="text-blue-600 shrink-0" />
                                <span className="text-xs font-medium text-gray-700">
                                  Email certificate PDF & verification link upon generation
                                </span>
                              </div>
                              <input
                                type="checkbox"
                                checked={generateForm.sendEmail}
                                onChange={(e) =>
                                  setGenerateForm({ ...generateForm, sendEmail: e.target.checked })
                                }
                                className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative">
                        <Search
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <input
                          type="text"
                          placeholder="Search enrolled student by name or email…"
                          value={studentSearchQuery}
                          onChange={(e) => setStudentSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      </div>

                      <div className="border border-gray-200 rounded-xl max-h-52 overflow-y-auto divide-y divide-gray-100 bg-gray-50/40">
                        {loadingEnrolledStudents ? (
                          <div className="p-6 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span>Loading enrolled students…</span>
                          </div>
                        ) : filteredStudents.length === 0 ? (
                          <div className="p-6 text-center text-xs text-gray-400">
                            {studentSearchQuery
                              ? `No students found matching "${studentSearchQuery}"`
                              : "No students currently enrolled in this course."}
                          </div>
                        ) : (
                          filteredStudents.map((s: any) => {
                            const enrollment =
                              s.enrollments?.find((e: any) => e.courseId === generateForm.courseId) ||
                              s.enrollments?.[0];
                            const prog = enrollment?.progress ?? 0;
                            const hasCert = items.some(
                              (c) => c.userId === s.userId && c.status === "issued"
                            );

                            return (
                              <button
                                key={s.userId}
                                type="button"
                                onClick={() => handleSelectStudent(s)}
                                className="w-full p-2.5 text-left hover:bg-blue-50/50 transition flex items-center justify-between gap-3 group cursor-pointer"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                                    {(s.studentName || "S").slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-700">
                                      {s.studentName || "Unnamed Student"}
                                    </p>
                                    <p className="text-[11px] text-gray-400 truncate">
                                      {s.studentEmail || "No email"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  {hasCert && (
                                    <span className="text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-semibold">
                                      Cert Issued
                                    </span>
                                  )}
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                      prog === 100
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border border-blue-200"
                                    }`}
                                  >
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

              {/* Pathway 2: External / Direct Entry */}
              {generateMode === "external" && (
                <div className="space-y-4 pt-1">
                  <div className="p-3 bg-amber-50/60 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <Sparkles size={16} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Direct Entry Mode (External Candidate)</p>
                      <p className="text-[11px] text-amber-800/80 mt-0.5">
                        Issue a verified credential for an offline or external student not registered on the
                        platform. A unique certificate ID and QR verification will be created.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Student Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      disabled={isGenerating}
                      placeholder="e.g. Adv. Rahul Sharma / Sajjad Husain"
                      value={generateForm.studentName}
                      onChange={(e) => setGenerateForm({ ...generateForm, studentName: e.target.value })}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Student Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      />
                      <input
                        type="email"
                        required
                        disabled={isGenerating}
                        placeholder="student@example.com"
                        value={generateForm.studentEmail}
                        onChange={(e) => setGenerateForm({ ...generateForm, studentEmail: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      The certificate PDF and verification link will be automatically sent to this email address.
                    </p>
                    {(() => {
                      const emailInput = generateForm.studentEmail.trim().toLowerCase();
                      const existingCert = emailInput
                        ? items.find(
                            (c) =>
                              c.courseId === generateForm.courseId &&
                              c.studentEmail?.toLowerCase() === emailInput
                          )
                        : null;
                      if (!existingCert) return null;
                      return (
                        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2 text-amber-900 text-xs">
                          <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600" />
                          <div>
                            <p className="font-bold">Certificate already generated for this email</p>
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              Certificate <strong>{existingCert.certificateId}</strong> was already issued to{" "}
                              <strong>{existingCert.studentName}</strong> for this course. Submitting will prompt to update the existing certificate.
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-blue-600" />
                      <span className="text-xs font-semibold text-gray-800">
                        Email certificate PDF & link upon generation
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={generateForm.sendEmail}
                      onChange={(e) => setGenerateForm({ ...generateForm, sendEmail: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}

              {/* Shared Date & Grade */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    disabled={isGenerating}
                    value={generateForm.issueDate}
                    onChange={(e) => setGenerateForm({ ...generateForm, issueDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Grade / Score <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    disabled={isGenerating}
                    placeholder="e.g. 95% or A+"
                    value={generateForm.grade}
                    onChange={(e) => setGenerateForm({ ...generateForm, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Automated Course Instructor(s) Section */}
              {(() => {
                const curCourse = courses.find((c) => c.id === generateForm.courseId);
                const rawInstructors = curCourse?.instructors;
                const instructorNames = Array.isArray(rawInstructors)
                  ? rawInstructors
                      .map((i: any) => (typeof i === "string" ? i : i?.name))
                      .filter((n: any) => typeof n === "string" && n.trim().length > 0)
                      .map((n: string) => n.trim())
                  : [];
                const isMultiple = instructorNames.length > 1;
                const displayNames =
                  generateForm.instructorName ||
                  (instructorNames.length > 0
                    ? instructorNames.join(", ")
                    : "Platform Academic Board");
                const label = isMultiple ? "Instructors" : "Instructor";

                return (
                  <div className="p-3.5 bg-slate-50/90 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                          <GraduationCap size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            {label} on Certificate
                          </p>
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {displayNames}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-semibold shrink-0">
                        {isMultiple
                          ? `${instructorNames.length} Instructors (Auto)`
                          : instructorNames.length === 1
                          ? "Auto from Course"
                          : "Auto Default"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 pl-10.5">
                      {isMultiple
                        ? `Automatically printing all ${instructorNames.length} instructors (${instructorNames.join(", ")}) onto the certificate.`
                        : instructorNames.length === 1
                        ? `Automatically assigned based on course curriculum instructor.`
                        : `No specific instructor assigned in course; using official academy signatory.`}
                    </p>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => setGenerateModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || (generateMode === "enrolled" && !selectedEnrolledStudent)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Generating PDF…</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      <span>Generate & Issue Certificate</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Confirmation Modal when Certificate Already Exists */}
      {existingCertPrompt.open && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4 shadow-xs">
              <AlertCircle size={26} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 text-center">Certificate Already Generated</h3>
            <p className="text-sm text-gray-600 text-center mt-2 leading-relaxed">
              A certificate has already been generated for{" "}
              <strong className="text-gray-900">{existingCertPrompt.studentEmail || generateForm.studentEmail}</strong> in this course.
              {existingCertPrompt.certificateId && (
                <span className="block text-xs font-mono text-gray-500 mt-1">
                  Existing Certificate ID: {existingCertPrompt.certificateId}
                </span>
              )}
            </p>
            <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mt-3 text-center">
              Do you want to update the existing certificate instead of creating a duplicate?
            </p>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setExistingCertPrompt({ open: false })}
                className="w-full py-2.5 px-4 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => executeIssue(true)}
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : null}
                Yes, Update Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
