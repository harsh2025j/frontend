"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  ThumbsUp,
  ChevronDown,
  ChevronUp,
  Award,
  Search,
  Send,
  Loader2,
  CheckCircle2,
  Radio,
  AlertCircle,
  Pencil,
  XCircle,
  Calendar,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { qaApi } from "@/data/services/academy-service/qa.service";
import { courseApi } from "@/data/services/academy-service/course.service";
import type {
  CourseQuestion,
  CourseAnswer,
  CourseQAStats,
  QuestionStatus,
} from "@/data/features/academy/course/qa.types";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { useAppSelector } from "@/data/redux/hooks";

interface AdminCourseQATabProps {
  courseId: string;
  onNavigateToCurriculum: () => void;
}

const PAGE_SIZE = 10;

function getInitials(name?: string | null) {
  if (!name) return "U";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function relativeTime(date: string) {
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch {
    return "";
  }
}

function getDoubtInterestLabel(upvotesCount: number) {
  if (upvotesCount <= 0) return "Asked by this student";
  return `+${upvotesCount} student${upvotesCount === 1 ? "" : "s"} ${
    upvotesCount === 1 ? "has" : "have"
  } the same doubt`;
}

export default function AdminCourseQATab({
  courseId,
  onNavigateToCurriculum,
}: AdminCourseQATabProps) {
  const { user } = useAppSelector((state) => state.auth);
  const currentUserId = (user as any)?.id || user?._id;

  // Stats & Accumulation Alert
  const [stats, setStats] = useState<CourseQAStats | null>(null);
  const [modulesMap, setModulesMap] = useState<Record<string, string>>({});
  const [statsLoading, setStatsLoading] = useState(true);

  // Search & Filters
  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | "all">("all");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Questions List & Infinite Scroll
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Reply / Edit States
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [collapsedAnsweredQIds, setCollapsedAnsweredQIds] = useState<Set<string>>(
    () => new Set()
  );
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [submittingReply, setSubmittingReply] = useState<string | null>(null);
  const [liveAnswerConfirm, setLiveAnswerConfirm] = useState<{
    isOpen: boolean;
    questionId: string | null;
    questionTitle: string;
  }>({
    isOpen: false,
    questionId: null,
    questionTitle: "",
  });

  // Answer editing
  const [editingAnsId, setEditingAnsId] = useState<string | null>(null);
  const [editAnsContent, setEditAnsContent] = useState("");
  const [savingAnsId, setSavingAnsId] = useState<string | null>(null);

  // Search debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchText);
    }, 400);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [searchText]);

  // Load stats and course modules for titles
  const loadStatsAndModules = useCallback(async () => {
    if (!courseId) return;
    setStatsLoading(true);
    try {
      const [statsRes, courseRes] = await Promise.all([
        qaApi.getCourseQAStats(courseId).catch(() => null),
        courseApi.fetchCourseById(courseId).catch(() => null),
      ]);

      if (statsRes) setStats(statsRes);

      if (courseRes?.data?.modules) {
        const map: Record<string, string> = {};
        courseRes.data.modules.forEach((m: any) => {
          map[m.id] = m.title;
        });
        setModulesMap(map);
      }
    } finally {
      setStatsLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadStatsAndModules();
  }, [loadStatsAndModules]);

  // Fetch Questions
  const fetchQuestions = useCallback(
    async (pageNum: number, append = false) => {
      if (!courseId) return;
      if (append) setLoadingMore(true);
      else setLoading(true);

      try {
        const params: any = {
          page: pageNum,
          limit: PAGE_SIZE,
          sort: "upvotes",
        };

        if (statusFilter !== "all") {
          params.status = statusFilter;
        }

        if (selectedModuleId !== "all") {
          params.moduleId = selectedModuleId;
        }

        if (debouncedSearch.trim()) {
          params.search = debouncedSearch.trim();
        }

        const res = await qaApi.getQuestions(courseId, params);
        const fetched = res.data || [];

        setQuestions((prev) => (append ? [...prev, ...fetched] : fetched));
        setTotal(res.total || 0);
        setTotalPages(res.totalPages || 1);
        setHasMore(pageNum < (res.totalPages || 1));
      } catch (err) {
        if (!append) setQuestions([]);
        toast.error("Failed to load questions");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [courseId, statusFilter, selectedModuleId, debouncedSearch]
  );

  // Trigger re-fetch when filters change
  useEffect(() => {
    setQuestions([]);
    setPage(1);
    setHasMore(true);
    fetchQuestions(1, false);
  }, [fetchQuestions]);

  // Infinite scroll observer
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchQuestions(next, true);
        }
      },
      { rootMargin: "120px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchQuestions]);

  // ── Action Handlers ──

  const handlePostReply = async (questionId: string) => {
    const text = (replyTexts[questionId] || "").trim();
    if (!text) return;

    setSubmittingReply(questionId);
    try {
      const newAnswer = await qaApi.createAnswer(courseId, questionId, {
        content: text,
        userName: user?.name || undefined,
        userAvatar: user?.profilePicture || undefined,
      });

      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          const updatedAnswers = [...(q.answers || []), newAnswer];
          return {
            ...q,
            answers: updatedAnswers,
            answersCount: updatedAnswers.length,
            instructorAnswered: true,
            status: "clarified",
            isResolved: true,
          };
        })
      );

      setReplyTexts((prev) => ({ ...prev, [questionId]: "" }));
      setCollapsedAnsweredQIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
      toast.success("Instructor reply published! Marked as Clarified.");
      loadStatsAndModules();
    } catch {
      toast.error("Failed to submit reply");
    } finally {
      setSubmittingReply(null);
    }
  };

  const openMarkAnsweredLiveConfirm = (question: CourseQuestion) => {
    setLiveAnswerConfirm({
      isOpen: true,
      questionId: question.id,
      questionTitle: question.title,
    });
  };

  const closeMarkAnsweredLiveConfirm = () => {
    setLiveAnswerConfirm({
      isOpen: false,
      questionId: null,
      questionTitle: "",
    });
  };

  const toggleReplies = (
    questionId: string,
    isRepliesOpen: boolean,
    hasInstructorAnswer: boolean
  ) => {
    if (isRepliesOpen) {
      if (expandedQId === questionId) {
        setExpandedQId(null);
      }
      if (hasInstructorAnswer) {
        setCollapsedAnsweredQIds((prev) => {
          const next = new Set(prev);
          next.add(questionId);
          return next;
        });
      }
      return;
    }

    setExpandedQId(questionId);
    if (hasInstructorAnswer) {
      setCollapsedAnsweredQIds((prev) => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  };

  const handleMarkAnsweredLive = async () => {
    if (!liveAnswerConfirm.questionId) return;

    try {
      await qaApi.markAnsweredLive(courseId, liveAnswerConfirm.questionId);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === liveAnswerConfirm.questionId
            ? { ...q, status: "answered_live", isResolved: true }
            : q
        )
      );
      toast.success("Question tagged as Answered in Live Session!");
      loadStatsAndModules();
    } catch {
      toast.error("Failed to mark as answered live");
    }
  };

  const handleSaveAnswerEdit = async (questionId: string, answerId: string) => {
    if (!editAnsContent.trim()) return;
    setSavingAnsId(answerId);
    try {
      await qaApi.editAnswer(courseId, questionId, answerId, {
        content: editAnsContent.trim(),
      });
      setQuestions((prev) =>
        prev.map((q) => {
          if (q.id !== questionId) return q;
          return {
            ...q,
            answers: (q.answers || []).map((a) =>
              a.id === answerId ? { ...a, content: editAnsContent.trim() } : a
            ),
          };
        })
      );
      setEditingAnsId(null);
      toast.success("Answer updated successfully");
    } catch {
      toast.error("Failed to update answer");
    } finally {
      setSavingAnsId(null);
    }
  };

  // Check if any chapter has accumulated doubts (5 or more pending doubts)
  const highDoubtChapters = (stats?.chapterBreakdown || []).filter(
    (c) => c.unresolvedCount >= 5
  );

  return (
    <div className="space-y-6">
      {/* ── 1. Doubt Accumulation Alert Banner ── */}
      {highDoubtChapters.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border-2 border-amber-400/40 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {/* <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles size={20} className="animate-pulse" />
              </div> */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-base">
                    High Doubt Concentration Detected
                  </h3>
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                    Action Recommended
                  </span>
                </div>
                <div className="mt-1 text-sm text-gray-700 space-y-1">
                  {highDoubtChapters.map((ch) => {
                    const chapterTitle =
                      modulesMap[ch.moduleId] || `Chapter ID: ${ch.moduleId.slice(0, 8)}...`;
                    return (
                      <p key={ch.moduleId} className="flex items-center gap-1.5">
                        {/* <AlertCircle size={14} className="text-amber-600 shrink-0" /> */}
                        <span>
                          <strong className="text-gray-900">"{chapterTitle}"</strong> has{" "}
                          <span className="font-bold text-amber-700">
                            {ch.unresolvedCount} pending doubts
                          </span>
                          . Students need extra clarity here.
                        </span>
                      </p>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Scheduling a dedicated Live Doubt Clearing Class in this chapter will resolve recurring questions at scale.
                </p>
              </div>
            </div>

            {/* 1-Click Schedule Button -> Redirects to Curriculum Builder */}
            <button
              onClick={onNavigateToCurriculum}
              className="whitespace-nowrap px-4 py-2.5 bg-[#122340] hover:bg-[#1c3560] text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all group shrink-0"
            >
              <Calendar size={16} className="text-[#C9A227]" />
              <span>Schedule Live Doubt Class</span>
              <ArrowRight
                size={14}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      )}

      {/* ── 2. Summary Stats Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Doubts
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-gray-900">
            {statsLoading ? "..." : stats?.totalQuestions || 0}
          </div>
          <span className="text-[11px] text-gray-400">Asked across all lessons</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">
              Pending Doubts
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {statsLoading ? "..." : stats?.pendingCount || 0}
          </div>
          <span className="text-[11px] text-gray-400">Awaiting instructor reply</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
              Clarified
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">
            {statsLoading ? "..." : stats?.clarifiedCount || 0}
          </div>
          <span className="text-[11px] text-gray-400">Resolved by instructor</span>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">
              Live Answered
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Radio size={16} />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-purple-600">
            {statsLoading ? "..." : stats?.answeredLiveCount || 0}
          </div>
          <span className="text-[11px] text-gray-400">Covered in live classes</span>
        </div>
      </div>

      {/* ── 3. Filters & Search Bar ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Fuzzy Search */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search doubts..."
              className="w-full pl-10 pr-9 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
            {searchText && (
              <button
                onClick={() => setSearchText("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XCircle size={15} />
              </button>
            )}
          </div>

          {/* Module Filter Dropdown */}
          {Object.keys(modulesMap).length > 0 && (
            <div className="w-full md:w-64">
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full py-2 px-3 border border-gray-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
              >
                <option value="all">All Chapters / Modules</option>
                {Object.entries(modulesMap).map(([id, title]) => (
                  <option key={id} value={id}>
                    {title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-gray-100 text-xs">
          <span className="text-gray-400 font-medium">Filter by:</span>
          {[
            { id: "all", label: "All Statuses" },
            { id: "pending", label: "Pending Clarification" },
            { id: "clarified", label: "Clarified" },
            { id: "answered_live", label: "Answered in Live Class" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id as any)}
              className={`px-3 py-1 rounded-full font-medium transition ${statusFilter === item.id
                ? "bg-[#122340] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
            >
              {item.label}
            </button>
          ))}
          <span className="ml-auto text-gray-400">
            Showing {questions.length} of {total} results
          </span>
        </div>
      </div>

      {/* ── 4. Questions List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-blue-600" size={32} />
          <p className="text-sm text-gray-500 font-medium">Loading doubts...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <HelpCircle size={40} className="mx-auto mb-3 opacity-30 text-gray-500" />
          <p className="font-semibold text-base text-gray-700">No questions found</p>
          <p className="text-xs text-gray-400 mt-1">
            {debouncedSearch
              ? `No doubts matched "${debouncedSearch}". Try broadening your search.`
              : "No student doubts match the current filters."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => {
            const isExpanded = expandedQId === q.id;
            const chapterTitle = q.moduleId ? modulesMap[q.moduleId] : null;
            const hasInstructorAnswer =
              q.instructorAnswered || (q.answers || []).some((ans) => ans.isInstructor);
            const isRepliesOpen =
              isExpanded ||
              (hasInstructorAnswer && !collapsedAnsweredQIds.has(q.id));

            return (
              <div
                key={q.id}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-gray-300 transition"
              >
                {/* Question Header */}
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#122340]/10 text-[#122340] font-bold text-xs flex items-center justify-center shrink-0">
                      {getInitials(q.userName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-gray-900">
                            {q.userName}
                          </span>
                          {chapterTitle && (
                            <span className="text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                              {chapterTitle}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {relativeTime(q.createdAt)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {q.status === "clarified" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
                              <CheckCircle2 size={11} /> Clarified
                            </span>
                          ) : q.status === "answered_live" ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 rounded-full px-2.5 py-0.5">
                              <Radio size={11} /> Answered in Live Class
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
                              <AlertCircle size={11} /> Pending Clarification
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-gray-900 text-base mb-1">
                          {q.title}
                        </h4>
                        {q.content && q.content !== q.title && (
                          <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {q.content}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Upvote Count */}
                  <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100 flex-wrap">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                      <ThumbsUp size={12} />
                      <span>{getDoubtInterestLabel(q.upvotesCount)}</span>
                    </span>

                    <button
                      onClick={() =>
                        toggleReplies(q.id, isRepliesOpen, hasInstructorAnswer)
                      }
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-blue-600 px-3 py-1.5 rounded-full bg-blue-50/50 hover:bg-blue-50 transition"
                    >
                      <MessageSquare size={12} />
                      <span>
                        {q.answersCount} {q.answersCount === 1 ? "Reply" : "Replies"}
                      </span>
                      {isRepliesOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {/* Mark as Answered in Live Session */}
                    {q.status !== "answered_live" && (
                      <button
                        onClick={() => openMarkAnsweredLiveConfirm(q)}
                        className="flex items-center gap-1 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1.5 rounded-full transition"
                      >
                        <Radio size={12} /> Mark Answered in Live Class
                      </button>
                    )}

                  </div>
                </div>

                {/* Expanded Replies & Instructor Reply Box */}
                {isRepliesOpen && (
                  <div className="bg-gray-50/80 border-t border-gray-100 p-5 space-y-4">
                    {/* Existing Replies */}
                    {q.answers && q.answers.length > 0 ? (
                      <div className="space-y-3">
                        {q.answers.map((ans) => {
                          const isEditingAns = editingAnsId === ans.id;

                          return (
                            <div
                              key={ans.id}
                              className={`p-4 rounded-xl border ${ans.isInstructor
                                ? "bg-amber-50/40 border-amber-200/60"
                                : "bg-white border-gray-200"
                                }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <div
                                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold ${ans.isInstructor
                                      ? "bg-amber-500 text-white"
                                      : "bg-gray-200 text-gray-700"
                                      }`}
                                  >
                                    {getInitials(ans.userName)}
                                  </div>
                                  <span className="text-xs font-bold text-gray-900">
                                    {ans.userName}
                                  </span>
                                  {ans.isInstructor && (
                                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-full px-2 py-0.5 flex items-center gap-1">
                                      <Award size={10} /> Verified Instructor
                                    </span>
                                  )}
                                  <span className="text-[11px] text-gray-400">
                                    {relativeTime(ans.createdAt)}
                                  </span>
                                </div>

                                {!isEditingAns && ans.userId === currentUserId && (
                                  <button
                                    onClick={() => {
                                      setEditingAnsId(ans.id);
                                      setEditAnsContent(ans.content);
                                    }}
                                    className="text-[11px] text-gray-400 hover:text-blue-600 flex items-center gap-1"
                                  >
                                    <Pencil size={11} /> Edit
                                  </button>
                                )}
                              </div>

                              {isEditingAns ? (
                                <div className="mt-2 space-y-2">
                                  <textarea
                                    value={editAnsContent}
                                    onChange={(e) => setEditAnsContent(e.target.value)}
                                    rows={2}
                                    className="w-full text-xs p-2 border border-blue-300 rounded bg-white outline-none"
                                  />
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => setEditingAnsId(null)}
                                      className="text-xs text-gray-500"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSaveAnswerEdit(q.id, ans.id)
                                      }
                                      disabled={
                                        savingAnsId === ans.id ||
                                        !editAnsContent.trim()
                                      }
                                      className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded font-bold"
                                    >
                                      {savingAnsId === ans.id ? "Saving..." : "Save"}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">
                                  {ans.content}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">
                        No answers yet. Post a clarification below to resolve this doubt for all students!
                      </p>
                    )}

                    {/* Official Instructor Reply Box */}
                    {!hasInstructorAnswer && (
                      <div className="bg-white border border-gray-200 rounded-xl p-3.5 space-y-2.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                          <Award size={14} className="text-[#C9A227]" />
                          <span>Reply as {user?.name || "Instructor / Admin"}</span>
                          <span className="text-[10px] text-gray-400 font-normal">
                            (Your answer will be badged & marks doubt as Clarified)
                          </span>
                        </div>
                        <textarea
                          value={replyTexts[q.id] || ""}
                          onChange={(e) =>
                            setReplyTexts((prev) => ({
                              ...prev,
                              [q.id]: e.target.value,
                            }))
                          }
                          placeholder="Write official explanation or legal clarification..."
                          rows={2}
                          className="w-full text-sm p-2.5 border border-gray-200 rounded-lg outline-none focus:border-blue-500 bg-gray-50/50 resize-none"
                        />
                        <div className="flex justify-end">
                          <button
                            onClick={() => handlePostReply(q.id)}
                            disabled={
                              !(replyTexts[q.id] || "").trim() ||
                              submittingReply === q.id
                            }
                            className="bg-[#122340] hover:bg-[#1c3560] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition"
                          >
                            {submittingReply === q.id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Send size={12} />
                            )}
                            <span>Publish Clarification</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-blue-600" size={24} />
            </div>
          )}

          {!hasMore && questions.length > 0 && (
            <div className="text-center py-4 text-xs text-gray-400">
              ── All {total} questions loaded ──
            </div>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={liveAnswerConfirm.isOpen}
        title="Mark Answered in Live Class?"
        message={`This will mark "${liveAnswerConfirm.questionTitle}" as answered in the live class and move it out of pending clarification.`}
        confirmText="Yes, Mark Answered"
        cancelText="Cancel"
        variant="info"
        onConfirm={handleMarkAnsweredLive}
        onClose={closeMarkAnsweredLiveConfirm}
      />
    </div>
  );
}
