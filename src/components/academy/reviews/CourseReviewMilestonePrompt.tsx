"use client";

import React, { useState, useEffect } from "react";
import { Star, X, Sparkles, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface CourseReviewMilestonePromptProps {
  courseId: string;
  courseTitle: string;
  progress: number;
  hasReviewed: boolean;
  onOpenReview: (initialRating?: number) => void;
}

export default function CourseReviewMilestonePrompt({
  courseId,
  courseTitle,
  progress,
  hasReviewed,
  onOpenReview,
}: CourseReviewMilestonePromptProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hoverStar, setHoverStar] = useState(0);

  // Determine current milestone
  // Milestone 30: 30% to 69%
  // Milestone 70: 70% to 99%
  let activeMilestone: "30" | "70" | null = null;
  if (progress >= 30 && progress < 70) {
    activeMilestone = "30";
  } else if (progress >= 70 && progress < 100) {
    activeMilestone = "70";
  }

  useEffect(() => {
    if (!courseId || hasReviewed || !activeMilestone) {
      setIsVisible(false);
      return;
    }

    // Check if dismissed previously for this milestone
    try {
      const storageKey = `academy_review_dismissed_${courseId}_${activeMilestone}`;
      const isDismissed = localStorage.getItem(storageKey);
      if (!isDismissed) {
        // Small delay after loading lesson before showing prompt so it feels natural
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    } catch {
      setIsVisible(false);
    }
  }, [courseId, activeMilestone, hasReviewed]);

  if (!isVisible || !activeMilestone || hasReviewed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      const storageKey = `academy_review_dismissed_${courseId}_${activeMilestone}`;
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {}
    setIsVisible(false);
    toast("We'll remind you at the next milestone!", {
      icon: "⏰",
      duration: 3000,
    });
  };

  const handleSelectRating = (starValue: number) => {
    try {
      const storageKey = `academy_review_dismissed_${courseId}_${activeMilestone}`;
      localStorage.setItem(storageKey, String(Date.now()));
    } catch {}
    setIsVisible(false);
    onOpenReview(starValue);
  };

  const isThirty = activeMilestone === "30";

  return (
    <div
      className="fixed bottom-6 right-6 z-50 w-[calc(100%-3rem)] max-w-sm sm:max-w-md bg-[#0a1628]/95 backdrop-blur-xl border border-[#C9A227]/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-2xl p-5 text-white animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="dialog"
      aria-label="Course Review Reminder"
    >
      {/* Header with Badge & Close Button */}
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C9A227]/15 border border-[#C9A227]/30 text-[#C9A227] text-[11px] font-bold tracking-wide uppercase">
          <Sparkles size={12} />
          {isThirty ? "30% Milestone Reached" : "70% Milestone Reached"}
        </span>

        <button
          onClick={handleDismiss}
          className="text-white/40 hover:text-white transition-colors p-1 -mr-1 rounded-lg hover:bg-white/5 cursor-pointer"
          title="Remind me later"
          aria-label="Close reminder"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <h3 className="font-extrabold text-base sm:text-lg text-white mb-1.5 leading-snug">
        {isThirty ? "How is your learning journey so far?" : "You're making incredible progress!"}
      </h3>
      <p className="text-white/70 text-xs leading-relaxed mb-4">
        {isThirty
          ? `You have completed 30% of "${courseTitle}". Take 30 seconds to rate your experience and help future students.`
          : `You've conquered 70% of "${courseTitle}". What do you think of the practical insights and lectures?`}
      </p>

      {/* Quick Interactive Star Selector */}
      <div className="flex items-center justify-between bg-black/25 rounded-xl px-4 py-2.5 mb-4 border border-white/5">
        <span className="text-[11px] font-medium text-white/60">Quick rating:</span>
        <div className="flex items-center gap-1.5" onMouseLeave={() => setHoverStar(0)}>
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = (hoverStar || 5) >= star;
            return (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverStar(star)}
                onClick={() => handleSelectRating(star)}
                className="cursor-pointer transition-transform hover:scale-125 focus:outline-none p-0.5"
                title={`Rate ${star} star${star > 1 ? "s" : ""}`}
              >
                <Star
                  size={20}
                  className={`${
                    isFilled ? "text-[#C9A227] fill-[#C9A227]" : "text-white/20"
                  } transition-colors`}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => handleSelectRating(hoverStar || 5)}
          className="flex-1 bg-[#C9A227] text-[#0a1628] hover:bg-[#d8b030] px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Star size={13} className="fill-[#0a1628]" />
          <span>Write Full Review</span>
        </button>
        <button
          onClick={handleDismiss}
          className="px-3.5 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <Clock size={12} />
          <span>Remind Later</span>
        </button>
      </div>
    </div>
  );
}
