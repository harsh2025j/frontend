"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  Trash2,
  Search,
  Filter,
  Loader2,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { reviewApi } from "@/data/services/academy-service/review.service";
import {
  CourseReview,
  CourseReviewSummary,
} from "@/data/features/academy/course/course.types";

interface ReviewsTabProps {
  courseId: string;
}

export default function ReviewsTab({ courseId }: ReviewsTabProps) {
  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [summary, setSummary] = useState<CourseReviewSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [reviewToDelete, setReviewToDelete] = useState<{ id: string; studentName: string } | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch public course reviews to obtain the aggregate summary
      const pubData = await reviewApi.getCourseReviews(courseId, 1, 1);
      if (pubData.summary) {
        setSummary(pubData.summary);
      }

      // 2. Fetch admin reviews with search/rating filters
      const adminData = await reviewApi.adminGetAllReviews(
        page,
        15,
        courseId,
        starFilter || undefined,
        searchQuery.trim() || undefined,
      );

      setReviews(adminData.reviews || []);
      if (adminData.pagination) {
        setTotalPages(adminData.pagination.totalPages || 1);
        setTotalCount(adminData.pagination.total || 0);
      }
    } catch (err) {
      console.error("Failed to load reviews:", err);
      toast.error("Failed to load course reviews.");
    } finally {
      setLoading(false);
    }
  }, [courseId, page, starFilter, searchQuery]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const confirmDeleteReview = async () => {
    if (!reviewToDelete) return;

    setDeletingId(reviewToDelete.id);
    try {
      await reviewApi.adminDeleteReview(reviewToDelete.id);
      toast.success("Review deleted successfully.");
      setReviewToDelete(null);
      await fetchReviews();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete review.";
      toast.error(typeof msg === "string" ? msg : "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteReview = (reviewId: string, studentName: string) => {
    setReviewToDelete({ id: reviewId, studentName });
  };

  const avg = summary?.averageRating || 0;
  const count = summary?.totalReviews || 0;

  if (loading && !summary) {
    return <ReviewsTabSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* ── METRIC SUMMARY CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Average Rating */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
            <Star size={28} className="text-[#C9A227] fill-[#C9A227]" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Average Rating
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-gray-900">
                {avg > 0 ? avg.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs font-semibold text-gray-400">/ 5.0</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
            <ShieldCheck size={28} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Student Reviews
            </p>
            <p className="text-3xl font-black text-gray-900 mt-1">{count}</p>
          </div>
        </div>

        {/* Card 3: 5-Star Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Rating Distribution
          </p>
          <div className="space-y-1 text-xs">
            {[5, 4, 3, 2, 1].map((s) => {
              const num = summary?.ratingDistribution[s as 1 | 2 | 3 | 4 | 5] || 0;
              const pct = summary?.ratingPercentages[s as 1 | 2 | 3 | 4 | 5] || 0;
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className="w-4 font-bold text-gray-700">{s}★</span>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A227] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-gray-400 text-[11px]">
                    {pct}% ({num})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student name or review..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40 focus:border-[#C9A227] transition-all"
          />
        </div>

        {/* Star Rating Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          <button
            onClick={() => {
              setStarFilter(null);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              starFilter === null
                ? "bg-[#122340] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Stars
          </button>
          {[5, 4, 3, 2, 1].map((star) => (
            <button
              key={star}
              onClick={() => {
                setStarFilter(star);
                setPage(1);
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                starFilter === star
                  ? "bg-[#C9A227] text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span>{star}</span>
              <Star size={12} className="fill-current" />
            </button>
          ))}
        </div>
      </div>

      {/* ── REVIEWS TABLE / LIST ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="divide-y divide-gray-100 animate-pulse">
            {[1, 2, 3, 4, 5].map((row) => (
              <div key={row} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-52">
                  <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-3.5 bg-gray-100 rounded" />
                    <div className="w-32 h-2.5 bg-gray-100 rounded" />
                  </div>
                </div>
                <div className="w-24">
                  <div className="w-20 h-4 bg-gray-100 rounded" />
                </div>
                <div className="flex-1 space-y-1.5 hidden md:block">
                  <div className="w-3/4 h-3 bg-gray-100 rounded" />
                  <div className="w-1/2 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-24 hidden sm:block">
                  <div className="w-16 h-3 bg-gray-100 rounded" />
                </div>
                <div className="w-16 flex justify-end">
                  <div className="w-14 h-6 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            <AlertCircle size={36} className="mx-auto text-gray-300 mb-2" />
            <h4 className="font-bold text-gray-800 text-base">No reviews found</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              {searchQuery || starFilter
                ? "No reviews match your search or star rating filter."
                : "Enrolled students who reach 30% course progress will be able to review this course."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4">Feedback</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {reviews.map((rev) => {
                  const initials =
                    rev.studentName
                      ?.split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "S";

                  const dateStr = new Date(rev.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    },
                  );

                  return (
                    <tr key={rev.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Student */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          {rev.studentAvatar ? (
                            <img
                              src={rev.studentAvatar}
                              alt={rev.studentName}
                              className="w-9 h-9 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#122340] text-white flex items-center justify-center font-bold text-xs shrink-0">
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-gray-900 text-sm leading-tight">
                              {rev.studentName}
                            </p>
                            {rev.studentEmail && (
                              <p className="text-xs text-gray-400">{rev.studentEmail}</p>
                            )}
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 mt-0.5">
                              <ShieldCheck size={11} className="text-emerald-600" />
                              Verified Student
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={14}
                              className={
                                s <= rev.rating
                                  ? "text-[#C9A227] fill-[#C9A227]"
                                  : "text-gray-200 fill-gray-100"
                              }
                            />
                          ))}
                          <span className="text-xs font-bold text-gray-700 ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Feedback Text */}
                      <td className="py-4 px-4 max-w-md">
                        <p className="text-xs text-gray-700 leading-relaxed line-clamp-3">
                          "{rev.reviewText}"
                        </p>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-gray-500">
                        {dateStr}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteReview(rev.id, rev.studentName)}
                          disabled={deletingId === rev.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete / Moderate Review"
                        >
                          {deletingId === rev.id ? (
                            <Loader2 size={13} className="animate-spin text-red-600" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>
              Showing {reviews.length} of {totalCount} reviews
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="font-semibold text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {reviewToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#122340]/40 backdrop-blur-sm transition-opacity"
            onClick={() => !deletingId && setReviewToDelete(null)}
          />

          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-red-50/50 shadow-xs">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#122340] mb-2">Delete Review?</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Are you sure you want to permanently delete the review from <strong className="text-gray-800 font-semibold">{reviewToDelete.studentName}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                type="button"
                onClick={() => setReviewToDelete(null)}
                disabled={Boolean(deletingId)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                disabled={Boolean(deletingId)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Deleting…</span>
                  </>
                ) : (
                  <span>Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewsTabSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* ── METRIC SUMMARY CARDS SKELETON ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Average Rating */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-24 h-3 bg-gray-100 rounded" />
            <div className="w-16 h-7 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Card 2: Total Reviews */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="w-32 h-3 bg-gray-100 rounded" />
            <div className="w-12 h-7 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Card 3: 5-Star Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs space-y-2.5">
          <div className="w-28 h-3 bg-gray-100 rounded mb-3" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-4 h-3 bg-gray-100 rounded" />
              <div className="flex-1 h-2 bg-gray-100 rounded-full" />
              <div className="w-8 h-2 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* ── FILTER & SEARCH BAR SKELETON ── */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-80 h-10 bg-gray-100 rounded-xl" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="w-16 h-8 bg-gray-100 rounded-xl" />
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="w-12 h-8 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>

      {/* ── TABLE SKELETON ── */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between">
          <div className="w-24 h-3 bg-gray-200 rounded" />
          <div className="w-16 h-3 bg-gray-200 rounded" />
          <div className="w-32 h-3 bg-gray-200 rounded" />
          <div className="w-20 h-3 bg-gray-200 rounded" />
          <div className="w-16 h-3 bg-gray-200 rounded" />
        </div>
        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4, 5].map((row) => (
            <div key={row} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-52">
                <div className="w-9 h-9 rounded-full bg-gray-100 shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="w-24 h-3.5 bg-gray-100 rounded" />
                  <div className="w-32 h-2.5 bg-gray-100 rounded" />
                </div>
              </div>
              <div className="w-24">
                <div className="w-20 h-4 bg-gray-100 rounded" />
              </div>
              <div className="flex-1 space-y-1.5 hidden md:block">
                <div className="w-3/4 h-3 bg-gray-100 rounded" />
                <div className="w-1/2 h-3 bg-gray-100 rounded" />
              </div>
              <div className="w-24 hidden sm:block">
                <div className="w-16 h-3 bg-gray-100 rounded" />
              </div>
              <div className="w-16 flex justify-end">
                <div className="w-14 h-6 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
