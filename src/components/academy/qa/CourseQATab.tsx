'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare, ThumbsUp, ChevronDown, ChevronUp, Award,
  Search, Send, Loader2, Trash2, CheckCircle2, Radio, BookOpen,
  AlertCircle, Pencil, Check, X, XCircle,
} from 'lucide-react';
import { qaApi } from '@/data/services/academy-service/qa.service';
import type { CourseQuestion, CourseAnswer } from '@/data/features/academy/course/qa.types';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

function getInitials(name?: string | null) {
  if (!name) return 'S';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function relativeTime(date: string) {
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); } catch { return ''; }
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'clarified')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
        <CheckCircle2 size={10} /> Clarified by Instructor
      </span>
    );
  if (status === 'answered_live')
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2 py-0.5">
        <Radio size={10} /> Answered in Live Session
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
      <AlertCircle size={10} /> Pending Clarification
    </span>
  );
}

// ─── Answer Card ─────────────────────────────────────────────────────────────

interface AnswerCardProps {
  answer: CourseAnswer;
}

function AnswerCard({ answer }: AnswerCardProps) {
  return (
    <div className={`flex gap-3 p-4 rounded-xl mt-2 ${answer.isInstructor ? 'bg-gradient-to-r from-[#122340]/5 to-[#C9A227]/5 border border-[#C9A227]/30' : 'bg-gray-50 border border-gray-100'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${answer.isInstructor ? 'bg-[#C9A227] text-[#122340]' : 'bg-[#122340]/10 text-[#122340]'}`}>
        {getInitials(answer.userName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-sm font-bold text-[#122340]">{answer.userName}</span>
          {answer.isInstructor && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C9A227] bg-[#C9A227]/10 border border-[#C9A227]/40 rounded-full px-2 py-0.5">
              <Award size={10} /> Verified Instructor
            </span>
          )}
          {answer.isAccepted && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              <CheckCircle2 size={10} /> Accepted Answer
            </span>
          )}
          <span className="text-[11px] text-gray-400 ml-auto">{relativeTime(answer.createdAt)}</span>
        </div>

        <p className="text-sm text-[#122340]/80 leading-relaxed whitespace-pre-wrap">{answer.content}</p>
      </div>
    </div>
  );
}

// ─── Question Card (with inline question edit + reply) ────────────────────────

interface QuestionCardProps {
  question: CourseQuestion;
  courseId: string;
  currentUser: { id: string; name: string; avatar?: string } | null;
  onUpvoteToggle: (questionId: string, upvoted: boolean, newCount: number) => void;
  onRequestDelete: (questionId: string, title: string) => void;
  onQuestionUpdated: (questionId: string, title: string, content: string) => void;
}

function QuestionCard({ question, courseId, currentUser, onUpvoteToggle, onRequestDelete, onQuestionUpdated }: QuestionCardProps) {
  const hasInstructorAnswer =
    question.instructorAnswered ||
    (question.answers || []).some((answer) => answer.isInstructor);
  const [isExpanded, setIsExpanded] = useState(hasInstructorAnswer);
  const [isUpvoting, setIsUpvoting] = useState(false);
  // Question inline edit
  const [isEditingQ, setIsEditingQ] = useState(false);
  const [editTitle, setEditTitle] = useState(question.title);
  const [editContent, setEditContent] = useState(question.content);
  const [isSavingQ, setIsSavingQ] = useState(false);

  const isAuthor = Boolean(
    currentUser &&
      (currentUser.id === question.userId || (currentUser as any)._id === question.userId)
  );
  const isLockedAfterAnswer =
    question.status === 'clarified' ||
    question.status === 'answered_live' ||
    question.isResolved ||
    question.instructorAnswered ||
    (question.answers || []).some((answer) => answer.isInstructor);
  const showAnswers = isExpanded;

  useEffect(() => {
    if (hasInstructorAnswer) setIsExpanded(true);
  }, [hasInstructorAnswer]);

  // On the learn page (student context), only the author can edit or delete their own doubt.
  // Once an instructor has answered, or the doubt is covered live, the student copy is locked.
  // Admins manage Q&A exclusively from AdminCourseQATab (/admin/academy/courses/:id?tab=qa).
  const canEditQ = currentUser && isAuthor && !isLockedAfterAnswer;
  const canDelete = currentUser && isAuthor && !isLockedAfterAnswer && question.answersCount === 0;
  const isOwnQuestion = isAuthor;

  const handleUpvote = async () => {
    if (!currentUser) {
      toast.error('Please log in to upvote');
      return;
    }
    if (isOwnQuestion) {
      toast.error('You cannot upvote your own doubt');
      return;
    }
    setIsUpvoting(true);
    try {
      const result = await qaApi.toggleUpvote(courseId, question.id);
      onUpvoteToggle(question.id, result.upvoted, result.upvotesCount);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update upvote');
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (!editTitle.trim()) { toast.error('Question summary is required'); return; }
    setIsSavingQ(true);
    try {
      await qaApi.editQuestion(courseId, question.id, { title: editTitle.trim(), content: editContent.trim() || editTitle.trim() });
      onQuestionUpdated(question.id, editTitle.trim(), editContent.trim() || editTitle.trim());
      setIsEditingQ(false);
      toast.success('Question updated!');
    } catch { toast.error('Failed to update question'); }
    finally { setIsSavingQ(false); }
  };

  return (
    <div className="bg-white border border-[#122340]/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4">
        <div className="flex gap-3">
          <div className="w-9 h-9 rounded-full bg-[#122340]/10 flex items-center justify-center text-xs font-bold text-[#122340] shrink-0">
            {getInitials(question.userName)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-[#122340]">{question.userName}</span>
                <span className="text-[11px] text-gray-400">{relativeTime(question.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={question.status} />
                {canEditQ && !isEditingQ && (
                  <button onClick={() => { setIsEditingQ(true); setEditTitle(question.title); setEditContent(question.content); }} className="text-[11px] text-[#122340]/40 hover:text-[#C9A227] transition-colors flex items-center gap-1">
                    <Pencil size={11} /> Edit
                  </button>
                )}
              </div>
            </div>

            {isEditingQ ? (
              <div className="space-y-2 mt-2">
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={255}
                  placeholder="Question summary..."
                  className="w-full text-sm border border-[#C9A227]/40 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#C9A227] text-[#122340]"
                  autoFocus
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Detailed explanation (optional)..."
                  rows={3}
                  className="w-full text-sm border border-[#C9A227]/40 rounded-lg px-3 py-2 bg-white outline-none focus:border-[#C9A227] text-[#122340] resize-none"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingQ(false)} className="text-xs text-[#122340]/50 hover:text-[#122340] px-3 py-1 transition-colors">Cancel</button>
                  <button onClick={handleSaveQuestion} disabled={!editTitle.trim() || isSavingQ} className="bg-[#122340] text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-50">
                    {isSavingQ ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />} Save
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h4 className="font-semibold text-[#122340] text-sm mb-1 leading-snug">{question.title}</h4>
                {question.content && question.content !== question.title && (
                  <p className="text-sm text-[#122340]/70 leading-relaxed line-clamp-2">{question.content}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[#122340]/5 flex-wrap">
          <button
            onClick={handleUpvote}
            disabled={isUpvoting || isOwnQuestion}
            className={`flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${
              isOwnQuestion
                ? 'bg-[#122340]/5 text-[#122340]/40 cursor-not-allowed'
                : question.hasUpvoted
                ? 'bg-[#122340] text-white'
                : 'bg-[#122340]/5 text-[#122340]/70 hover:bg-[#122340]/10'
            }`}
            title={isOwnQuestion ? 'You cannot upvote your own doubt' : undefined}
          >
            {isUpvoting ? <Loader2 size={12} className="animate-spin" /> : <ThumbsUp size={12} className={question.hasUpvoted && !isOwnQuestion ? 'fill-current' : ''} />}
            {isOwnQuestion ? 'Your Doubt' : question.hasUpvoted ? 'I have this doubt too' : '+1 Same doubt'}
            {question.upvotesCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${question.hasUpvoted && !isOwnQuestion ? 'bg-white/20' : 'bg-[#122340]/10'}`}>{question.upvotesCount}</span>
            )}
          </button>

          <button onClick={() => setIsExpanded(!isExpanded)} className="flex items-center gap-1.5 text-xs font-semibold text-[#122340]/60 hover:text-[#122340] transition-colors">
            <MessageSquare size={12} />
            {question.answersCount} {question.answersCount === 1 ? 'Reply' : 'Replies'}
            {question.instructorAnswered && (
              <span className="text-[10px] font-bold text-[#C9A227] flex items-center gap-1 ml-1"><Award size={10} /> Instructor Answered</span>
            )}
            {showAnswers ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {canDelete && (
            <button
              onClick={() => onRequestDelete(question.id, question.title)}
              className="ml-auto text-xs text-red-400 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      </div>

      {/* Expanded answers (Read-only on learn page; replies are provided exclusively by instructors from Admin Course Hub) */}
      {showAnswers && (
        <div className="border-t border-[#122340]/5 bg-gray-50/60 px-4 py-3 space-y-2">
          {question.answers && question.answers.length > 0 ? (
            question.answers.map((ans) => (
              <AnswerCard
                key={ans.id}
                answer={ans}
              />
            ))
          ) : (
            <div className="py-2.5 px-3 bg-amber-50/70 border border-amber-200/60 rounded-lg text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle size={14} className="text-amber-600 shrink-0" />
              <span>Pending instructor clarification. An instructor will answer this doubt soon.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main CourseQATab ─────────────────────────────────────────────────────────

interface CourseQATabProps {
  courseId: string;
  activeItemId?: string | null;
  activeModuleId?: string | null;
  activeItemTitle?: string | null;
  currentUser: { id: string; name: string; avatar?: string } | null;
  isAdmin?: boolean;
}

export default function CourseQATab({ courseId, activeItemId, activeModuleId, activeItemTitle, currentUser }: CourseQATabProps) {
  const [scope, setScope] = useState<'item' | 'course'>('item');
  const [filterBy, setFilterBy] = useState<'all' | 'unanswered' | 'mine'>('all');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // Paginated questions with infinite scroll
  const [questions, setQuestions] = useState<CourseQuestion[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // New question form
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionContent, setQuestionContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Infinite scroll sentinel
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(searchText), 450);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchText]);

  // Reset list when filters change
  useEffect(() => {
    setQuestions([]);
    setPage(1);
    setHasMore(true);
  }, [courseId, scope, activeItemId, filterBy, debouncedSearch]);

  const fetchPage = useCallback(async (pageNum: number, append = false) => {
    if (!courseId) return;
    if (append) setLoadingMore(true);
    else setLoading(true);

    try {
      const params: any = {
        sort: 'upvotes',
        limit: PAGE_SIZE,
        page: pageNum,
        filter: filterBy,
      };
      if (scope === 'item' && activeItemId) params.itemId = activeItemId;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const res = await qaApi.getQuestions(courseId, params);
      const newItems = res.data || [];

      setQuestions((prev) => append ? [...prev, ...newItems] : newItems);
      setTotal(res.total || 0);
      setHasMore(pageNum < (res.totalPages || 1));
    } catch {
      if (!append) setQuestions([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [courseId, scope, activeItemId, filterBy, debouncedSearch]);

  // Initial load / filter reset
  useEffect(() => {
    fetchPage(1, false);
    setPage(1);
  }, [fetchPage]);

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPage(nextPage, true);
        }
      },
      { rootMargin: '100px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page, fetchPage]);

  // ── Mutation handlers ──

  const handleUpvoteToggle = (questionId: string, upvoted: boolean, newCount: number) => {
    setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, hasUpvoted: upvoted, upvotesCount: newCount } : q));
  };

  // Custom Delete Confirmation Modal State
  const [doubtToDelete, setDoubtToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingDoubt, setIsDeletingDoubt] = useState(false);

  const handleRequestDelete = (questionId: string, title: string) => {
    setDoubtToDelete({ id: questionId, title });
  };

  const handleConfirmDelete = async () => {
    if (!doubtToDelete) return;
    setIsDeletingDoubt(true);
    try {
      await qaApi.deleteQuestion(courseId, doubtToDelete.id);
      setQuestions((prev) => prev.filter((q) => q.id !== doubtToDelete.id));
      setTotal((t) => Math.max(0, t - 1));
      toast.success('Doubt deleted successfully');
      setDoubtToDelete(null);
    } catch {
      toast.error('Failed to delete doubt');
    } finally {
      setIsDeletingDoubt(false);
    }
  };

  const handleQuestionUpdated = (questionId: string, title: string, content: string) => {
    setQuestions((prev) => prev.map((q) => q.id === questionId ? { ...q, title, content } : q));
  };

  const handlePostQuestion = async () => {
    if (!questionTitle.trim()) { toast.error('Please enter a question summary'); return; }
    if (!currentUser) { toast.error('Please log in to post a question'); return; }
    setIsPosting(true);
    try {
      const newQ = await qaApi.createQuestion(courseId, {
        title: questionTitle.trim(),
        content: questionContent.trim() || questionTitle.trim(),
        itemId: activeItemId || undefined,
        moduleId: activeModuleId || undefined,
        userName: currentUser?.name || undefined,
        userAvatar: currentUser?.avatar || undefined,
      });
      setQuestions((prev) => [newQ, ...prev]);
      setTotal((t) => t + 1);
      setQuestionTitle('');
      setQuestionContent('');
      setShowForm(false);
      toast.success('Doubt posted!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to post question');
    } finally {
      setIsPosting(false);
    }
  };

  const hasSearch = debouncedSearch.trim().length > 0;

  return (
    <div className="text-[#122340]">

      {/* ── Scope + Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
        <div className="flex bg-[#122340]/5 rounded-full p-1 text-xs font-semibold shrink-0">
          <button onClick={() => setScope('item')} className={`px-3 py-1.5 rounded-full transition-all ${scope === 'item' ? 'bg-[#122340] text-white shadow' : 'text-[#122340]/60 hover:text-[#122340]'}`}>
            📖 This Lesson
          </button>
          <button onClick={() => setScope('course')} className={`px-3 py-1.5 rounded-full transition-all ${scope === 'course' ? 'bg-[#122340] text-white shadow' : 'text-[#122340]/60 hover:text-[#122340]'}`}>
            <BookOpen size={11} className="inline mr-1" />All Course
          </button>
        </div>

        <div className="flex gap-1.5 text-[11px] font-semibold flex-wrap">
          {(['all', 'unanswered', 'mine'] as const).map((f) => (
            <button key={f} onClick={() => setFilterBy(f)} className={`px-2.5 py-1 rounded-full border transition-all capitalize ${filterBy === f ? 'bg-[#C9A227] text-[#122340] border-[#C9A227]' : 'border-[#122340]/15 text-[#122340]/50 hover:border-[#122340]/30'}`}>
              {f === 'unanswered' ? 'Unanswered' : f === 'mine' ? 'My Questions' : 'All'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-white border border-[#122340]/10 rounded-full px-3 py-2 flex-1 max-w-sm ml-auto">
          <Search size={13} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search doubts..."
            className="flex-1 text-sm bg-transparent outline-none text-[#122340] placeholder-gray-400"
          />
          {searchText && (
            <button onClick={() => setSearchText('')} className="text-gray-400 hover:text-gray-600 transition-colors">
              <XCircle size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Context Banner (lesson scope) ── */}
      {scope === 'item' && activeItemTitle && (
        <div className="mb-4 flex items-center gap-2 text-xs font-medium text-[#122340]/50 bg-[#122340]/[0.03] rounded-lg px-3 py-2 border border-[#122340]/5">
          <MessageSquare size={12} />
          <span>Showing doubts for:</span>
          <span className="font-bold text-[#122340]/70">{activeItemTitle}</span>
          <span className="ml-auto">{total} doubt{total !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* ── Fuzzy search hint ── */}
      {hasSearch && !loading && (
        <div className="mb-3 text-xs text-[#122340]/40 flex items-center gap-1.5">
          <Search size={11} />
          <span>Showing results related to <span className="font-semibold text-[#122340]/60">"{debouncedSearch}"</span> — {total} match{total !== 1 ? 'es' : ''}</span>
        </div>
      )}

      {/* ── Post New Doubt ── */}
      {currentUser && (
        <div className="mb-5">
          {!showForm ? (
            <button onClick={() => setShowForm(true)} className="w-full flex items-center gap-3 bg-white border border-[#122340]/10 rounded-xl px-4 py-3.5 text-sm text-gray-400 hover:border-[#C9A227]/40 transition-all text-left group shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#C9A227]/15 flex items-center justify-center text-xs font-bold text-[#122340] shrink-0">{getInitials(currentUser.name)}</div>
              <span className="group-hover:text-[#122340]/70 transition-colors">Ask a new question about this specific item...</span>
            </button>
          ) : (
            <div className="bg-white border border-[#C9A227]/40 rounded-xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C9A227]/15 flex items-center justify-center text-xs font-bold text-[#122340] shrink-0">{getInitials(currentUser.name)}</div>
                  <span className="text-sm font-semibold text-[#122340]">{currentUser.name}</span>
                </div>
                <button onClick={() => { setShowForm(false); setQuestionTitle(''); setQuestionContent(''); }} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={16} /></button>
              </div>
              <input
                type="text"
                value={questionTitle}
                onChange={(e) => setQuestionTitle(e.target.value)}
                placeholder="Doubt in brief (e.g. 'Is 15-day notice mandatory under Section 138?')"
                className="w-full text-sm px-3 py-2.5 border border-[#122340]/10 rounded-lg outline-none focus:border-[#C9A227]/60 bg-gray-50 text-[#122340] placeholder-gray-400 transition-colors"
                maxLength={255}
              />
              <textarea
                value={questionContent}
                onChange={(e) => setQuestionContent(e.target.value)}
                placeholder="Explain in detail... (optional but recommended)"
                rows={3}
                className="w-full text-sm px-3 py-2.5 border border-[#122340]/10 rounded-lg outline-none focus:border-[#C9A227]/60 bg-gray-50 text-[#122340] placeholder-gray-400 resize-none transition-colors"
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => { setShowForm(false); setQuestionTitle(''); setQuestionContent(''); }} className="px-4 py-1.5 text-xs font-semibold text-[#122340]/60 hover:text-[#122340] transition-colors">Cancel</button>
                <button onClick={handlePostQuestion} disabled={!questionTitle.trim() || isPosting} className="bg-[#122340] text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-[#122340]/90 transition-colors">
                  {isPosting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />} Post Doubt
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Questions List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <Loader2 className="animate-spin text-[#122340]/30" size={28} />
          <p className="text-sm text-[#122340]/40">Loading doubts...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-12 text-[#122340]/40">
          <MessageSquare size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-sm">
            {hasSearch ? `No doubts matching "${debouncedSearch}"` : scope === 'item' ? 'No doubts asked for this lesson yet.' : 'No doubts found for this course.'}
          </p>
          <p className="text-xs mt-1">{currentUser ? (hasSearch ? 'Try different keywords or be the first to ask!' : 'Be the first to ask a question!') : 'Log in to ask a question.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              courseId={courseId}
              currentUser={currentUser}
              onUpvoteToggle={handleUpvoteToggle}
              onRequestDelete={handleRequestDelete}
              onQuestionUpdated={handleQuestionUpdated}
            />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-2" />

          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-[#122340]/30" size={22} />
            </div>
          )}

          {!hasMore && questions.length > 0 && (
            <div className="text-center py-4 text-xs text-[#122340]/30">
              ── All {total} doubts loaded ──
            </div>
          )}
        </div>
      )}

      {/* ── Custom Delete Confirmation Modal ── */}
      {doubtToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
              <Trash2 size={22} />
            </div>
            <h3 className="text-base font-bold text-[#122340] mb-1">Delete Doubt?</h3>
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-gray-800">"{doubtToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDoubtToDelete(null)}
                disabled={isDeletingDoubt}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeletingDoubt}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeletingDoubt ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
