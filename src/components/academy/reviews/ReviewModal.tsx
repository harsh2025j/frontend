"use client";

import React, { useState, useEffect } from "react";
import { Star, X, Loader2, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import {
  reviewApi,
  CreateReviewPayload,
  UpdateReviewPayload,
} from "@/data/services/academy-service/review.service";
import { CourseReview } from "@/data/features/academy/course/course.types";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseIdOrSlug: string;
  courseTitle: string;
  existingReview?: CourseReview | null;
  initialRating?: number;
  onSuccess: (savedReview: CourseReview) => void;
}

const RATING_LABELS: Record<number, string> = {
  1: "Poor - Needs significant improvement",
  2: "Fair - Below expectations",
  3: "Good - Met expectations",
  4: "Very Good - Highly informative",
  5: "Excellent - Outstanding experience!",
};

export default function ReviewModal({
  isOpen,
  onClose,
  courseIdOrSlug,
  courseTitle,
  existingReview,
  initialRating,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(existingReview?.rating || initialRating || 5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>(
    existingReview?.reviewText || "",
  );
  const [submitting, setSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setReviewText(existingReview.reviewText);
    } else {
      setRating(initialRating || 5);
      setReviewText("");
    }
    setHasError(false);
  }, [existingReview, isOpen, initialRating]);

  if (!isOpen) return null;

  const currentDisplayRating = hoverRating || rating;
  const isEditing = Boolean(existingReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = reviewText.trim();

    if (cleanText.length < 5) {
      setHasError(true);
      toast.error("Please write a review message (at least 5 characters) before publishing.");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Please select a star rating from 1 to 5.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && existingReview) {
        const payload: UpdateReviewPayload = {
          rating,
          reviewText: cleanText,
        };
        const updated = await reviewApi.updateReview(
          courseIdOrSlug,
          existingReview.id,
          payload,
        );
        toast.success("Review updated successfully!");
        onSuccess(updated);
        onClose();
      } else {
        const payload: CreateReviewPayload = {
          rating,
          reviewText: cleanText,
        };
        const created = await reviewApi.createReview(courseIdOrSlug, payload);
        toast.success("Thank you! Your review has been published.");
        onSuccess(created);
        onClose();
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to submit review. Please try again.";
      toast.error(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Strip */}
        <div className="bg-gradient-to-r from-[#0a1628] via-[#122340] to-[#1e3a5f] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1 text-[#C9A227]">
            <Sparkles size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">
              {isEditing ? "Edit Your Review" : "Share Your Experience"}
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-white leading-snug line-clamp-1">
            {courseTitle}
          </h3>
          <p className="text-xs text-blue-100/70 mt-1">
            Your honest feedback helps fellow legal professionals choose the best courses.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Your Overall Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= currentDisplayRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform focus:outline-none cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={
                        isFilled
                          ? "text-[#C9A227] fill-[#C9A227] filter drop-shadow-sm"
                          : "text-slate-300"
                      }
                    />
                  </button>
                );
              })}
            </div>

            {/* Label based on stars */}
            <p className="text-xs font-semibold text-[#122340] mt-2 min-h-[18px]">
              {RATING_LABELS[currentDisplayRating] || ""}
            </p>
          </div>

          {/* Review Text */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Written Review & Feedback <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {reviewText.length}/2000
              </span>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => {
                setReviewText(e.target.value);
                if (hasError && e.target.value.trim().length >= 5) {
                  setHasError(false);
                }
              }}
              placeholder="What did you think of the lessons, instructors, study materials, and practical legal drafting assignments?"
              rows={5}
              maxLength={2000}
              className={`w-full p-3.5 rounded-2xl border ${
                hasError
                  ? "border-red-400 ring-2 ring-red-100 focus:border-red-500"
                  : "border-slate-200 focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/15"
              } text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none transition-all`}
            />
            <p className={`text-[11px] mt-1 ${hasError ? "text-red-500 font-semibold" : "text-slate-400"}`}>
              {hasError
                ? "Please enter at least 5 characters to describe your experience."
                : "Minimum 5 characters. Be specific and respectful."}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#C9A227] hover:bg-[#b08d20] text-[#0a1628] text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={16} className="animate-spin text-[#0a1628]" />}
              <span>{isEditing ? "Update Review" : "Publish Review"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
