"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  StarHalf,
  ShieldCheck,
  Edit3,
  Trash2,
  Lock,
  MessageSquarePlus,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/data/features/auth/useAuthActions";
import {
  reviewApi,
} from "@/data/services/academy-service/review.service";
import {
  CourseReview,
  CourseReviewSummary,
  MyReviewEligibility,
} from "@/data/features/academy/course/course.types";
import ReviewModal from "./ReviewModal";

interface CourseReviewsSectionProps {
  courseId: string;
  courseTitle: string;
  initialAverageRating?: number;
  initialTotalReviews?: number;
  onSummaryChange?: (summary: CourseReviewSummary) => void;
}

function StarRating({
  rating,
  size = 18,
  showNumber = false,
}: {
  rating: number;
  size?: number;
  showNumber?: boolean;
}) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.4 && rating % 1 <= 0.8;

  return (
    <div className="flex items-center gap-1 text-[#C9A227]">
      {[1, 2, 3, 4, 5].map((star) => {
        if (star <= fullStars) {
          return (
            <Star
              key={star}
              size={size}
              className="fill-[#C9A227] text-[#C9A227]"
            />
          );
        }
        if (star === fullStars + 1 && hasHalfStar) {
          return (
            <StarHalf
              key={star}
              size={size}
              className="fill-[#C9A227] text-[#C9A227]"
            />
          );
        }
        return <Star key={star} size={size} className="text-slate-300" />;
      })}
      {showNumber && (
        <span className="font-bold text-sm text-[#122340] ml-1">
          {rating > 0 ? rating.toFixed(1) : "0.0"}
        </span>
      )}
    </div>
  );
}

export default function CourseReviewsSection({
  courseId,
  courseTitle,
  initialAverageRating = 0,
  initialTotalReviews = 0,
  onSummaryChange,
}: CourseReviewsSectionProps) {
  const { user } = useAuth();

  const [reviews, setReviews] = useState<CourseReview[]>([]);
  const [summary, setSummary] = useState<CourseReviewSummary>({
    averageRating: Number(initialAverageRating) || 0,
    totalReviews: Number(initialTotalReviews) || 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    ratingPercentages: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });

  const [eligibility, setEligibility] = useState<MyReviewEligibility | null>(null);
  const [starFilter, setStarFilter] = useState<number | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  // Fetch paginated reviews and summary
  const fetchReviews = useCallback(
    async (currentPage = 1, currentFilter = starFilter) => {
      setLoading(true);
      try {
        const data = await reviewApi.getCourseReviews(
          courseId,
          currentPage,
          6,
          currentFilter || undefined,
        );
        setReviews(data.reviews || []);
        if (data.summary) {
          setSummary(data.summary);
          onSummaryChange?.(data.summary);
        }
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setPage(data.pagination.page || 1);
        }
      } catch (err) {
        console.error("Failed to load course reviews:", err);
      } finally {
        setLoading(false);
      }
    },
    [courseId, starFilter],
  );

  // Fetch logged in user's review eligibility
  const checkEligibility = useCallback(async () => {
    if (!user) {
      setEligibility(null);
      return;
    }
    try {
      const data = await reviewApi.getMyReviewEligibility(courseId);
      setEligibility(data);
    } catch {
      setEligibility(null);
    }
  }, [courseId, user]);

  useEffect(() => {
    fetchReviews(1, starFilter);
  }, [fetchReviews, starFilter]);

  useEffect(() => {
    checkEligibility();
  }, [checkEligibility]);

  const handleFilterByStar = (star: number) => {
    if (starFilter === star) {
      setStarFilter(null);
    } else {
      setStarFilter(star);
    }
    setPage(1);
  };

  const confirmDeleteReview = async () => {
    if (!eligibility?.review) return;

    setIsDeleting(true);
    try {
      await reviewApi.deleteReview(courseId, eligibility.review.id);
      toast.success("Your review was deleted.");
      setShowDeleteModal(false);
      await Promise.all([fetchReviews(1, starFilter), checkEligibility()]);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to delete review.";
      toast.error(typeof msg === "string" ? msg : "Delete failed.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteReview = () => {
    setShowDeleteModal(true);
  };

  const handleReviewSuccess = async () => {
    await Promise.all([fetchReviews(1, starFilter), checkEligibility()]);
  };

  const avgScore = summary.averageRating || 0;
  const totalCount = summary.totalReviews || 0;

  return (
    <section id="reviews-section" className="py-10 border-t border-slate-200 scroll-mt-20">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-[#C9A227] mb-1">
            <Star size={18} className="fill-[#C9A227]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Student Feedback & Ratings
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#122340]">
            Course Reviews
          </h2>
        </div>

        {/* Action Button (Write Review or Edit) */}
        {user && eligibility?.canReview && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-[#C9A227] hover:bg-[#b08d20] text-[#0a1628] font-bold text-sm py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <MessageSquarePlus size={18} />
            Write a Review
          </button>
        )}
      </div>

      {/* Ratings Summary Card (Left: Overall Score, Right: 5-to-1 Star Bars) */}
      <div className="bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left: Overall Big Score */}
          <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-4 border-b md:border-b-0 md:border-r border-slate-200">
            <span className="text-5xl sm:text-6xl font-serif font-black text-[#122340] tracking-tight">
              {avgScore > 0 ? avgScore.toFixed(1) : "0.0"}
            </span>
            <div className="mt-2 mb-1.5">
              <StarRating rating={avgScore} size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-600">
              Course Rating ·{" "}
              <strong className="text-[#122340]">
                {totalCount} {totalCount === 1 ? "Review" : "Reviews"}
              </strong>
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
              <ShieldCheck size={14} className="text-emerald-600" />
              100% Verified Student Reviews
            </div>
          </div>

          {/* Right: Distribution Bars (5 Stars down to 1 Star) */}
          <div className="md:col-span-8 space-y-2.5">
            {[5, 4, 3, 2, 1].map((star) => {
              const count =
                summary.ratingDistribution[star as 1 | 2 | 3 | 4 | 5] || 0;
              const pct =
                summary.ratingPercentages[star as 1 | 2 | 3 | 4 | 5] || 0;
              const isSelected = starFilter === star;

              return (
                <button
                  key={star}
                  onClick={() => handleFilterByStar(star)}
                  className={`w-full flex items-center gap-3 text-xs group cursor-pointer p-1.5 rounded-xl transition-all ${
                    isSelected
                      ? "bg-amber-100/60 ring-1 ring-[#C9A227]"
                      : "hover:bg-slate-100"
                  }`}
                  title={`Filter by ${star} star reviews (${count})`}
                >
                  <span className="w-12 font-bold text-slate-700 text-left flex items-center gap-1">
                    {star} <Star size={12} className="fill-[#C9A227] text-[#C9A227]" />
                  </span>

                  {/* Progress Bar Container */}
                  <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isSelected
                          ? "bg-[#C9A227]"
                          : "bg-amber-400 group-hover:bg-[#C9A227]"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Percentage and Count */}
                  <span className="w-16 text-right font-medium text-slate-500">
                    {pct}% <span className="text-slate-400">({count})</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Filter Indicator */}
      {starFilter && (
        <div className="flex items-center gap-2 mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold px-3 py-1.5 rounded-xl">
            <Filter size={13} className="text-[#C9A227]" />
            <span>Showing {starFilter}-star reviews only</span>
            <button
              onClick={() => setStarFilter(null)}
              className="hover:text-red-600 transition-colors p-0.5 rounded cursor-pointer"
              title="Clear filter"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Student Eligibility & "Your Review" Banner */}
      {user && eligibility?.hasReviewed && eligibility.review && (
        <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-slate-50 border-2 border-[#C9A227]/40 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#C9A227]/15 text-[#C9A227]">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <h4 className="font-bold text-sm text-[#122340]">Your Submitted Review</h4>
                <p className="text-[11px] text-slate-500">
                  Published · Visible to all prospective students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-[#C9A227] hover:border-[#C9A227] text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Edit3 size={13} /> Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 text-xs font-semibold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={eligibility.review.rating} size={16} />
              <span className="text-xs font-bold text-slate-700">
                {eligibility.review.rating}.0 / 5.0
              </span>
              <span className="text-[11px] text-slate-400">
                · {new Date(eligibility.review.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed italic">
              "{eligibility.review.reviewText}"
            </p>
          </div>
        </div>
      )}

      {/* Progress Lock Notice: Enrolled but < 30% Progress */}
      {user &&
        eligibility?.isEnrolled &&
        !eligibility.canReview &&
        !eligibility.hasReviewed && (
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-50 text-[#C9A227] shrink-0 border border-amber-200/60">
                <Lock size={18} />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#122340]">
                  Reviews unlock at 30% course completion
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  To keep ratings authentic, reviews are reserved for enrolled students who have completed at least 30% of the course curriculum.
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#C9A227] rounded-full"
                      style={{ width: `${Math.min((eligibility.progress / 30) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-[#122340]">
                    {eligibility.progress}%
                  </span>
                  <span className="text-slate-400">/ 30% required</span>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* Reviews List */}
      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <Loader2 size={28} className="animate-spin mx-auto text-[#C9A227] mb-2" />
          <p className="text-sm font-medium">Loading student reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-12 px-6 rounded-3xl bg-slate-50 border border-slate-200/60 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-[#C9A227] flex items-center justify-center mx-auto mb-3 border border-amber-200/50">
            <Star size={22} className="fill-[#C9A227]" />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#122340]">
            {starFilter
              ? `No ${starFilter}-star reviews yet`
              : "No reviews yet"}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 mb-4">
            {starFilter
              ? "There are currently no reviews matching this star rating. Try clearing the filter."
              : "Be among the first students to complete this course and share your practical learning experience!"}
          </p>
          {starFilter && (
            <button
              onClick={() => setStarFilter(null)}
              className="text-xs font-bold text-[#122340] hover:text-[#C9A227] underline cursor-pointer"
            >
              Show all reviews
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev) => {
              const dateStr = new Date(rev.createdAt).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" },
              );
              const initials =
                rev.studentName
                  ?.split(" ")
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "S";

              return (
                <div
                  key={rev.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Student Info & Verified Badge */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {rev.studentAvatar ? (
                          <img
                            src={rev.studentAvatar}
                            alt={rev.studentName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#122340] to-[#1e3a5f] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                            {initials}
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-[#122340] leading-tight">
                            {rev.studentName}
                          </h4>
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 mt-0.5">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            Verified Student
                          </span>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 font-medium">
                        {dateStr}
                      </span>
                    </div>

                    {/* Star Rating */}
                    <div className="mb-2.5">
                      <StarRating rating={rev.rating} size={15} />
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {rev.reviewText}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => {
                  const prev = Math.max(page - 1, 1);
                  setPage(prev);
                  fetchReviews(prev, starFilter);
                }}
                disabled={page <= 1}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="text-xs font-semibold text-slate-600 px-3">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => {
                  const next = Math.min(page + 1, totalPages);
                  setPage(next);
                  fetchReviews(next, starFilter);
                }}
                disabled={page >= totalPages}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Review Modal Dialog */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        courseIdOrSlug={courseId}
        courseTitle={courseTitle}
        existingReview={eligibility?.review || null}
        onSuccess={handleReviewSuccess}
      />

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#122340]/40 backdrop-blur-sm transition-opacity"
            onClick={() => !isDeleting && setShowDeleteModal(false)}
          />

          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-extrabold text-[#122340] mb-2">Delete Review?</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Are you sure you want to delete your review? This action cannot be undone and your rating will be permanently removed.
              </p>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReview}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.25)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isDeleting ? (
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
    </section>
  );
}
