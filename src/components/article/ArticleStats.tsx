"use client";

import React, { useState } from 'react';
import { Heart, Eye } from 'lucide-react';
import { articleApi } from '@/data/services/article-service/article-service';
import { useSelector } from 'react-redux';
import { RootState } from '@/data/redux/store';
import ConfirmationModal from '../ui/ConfirmationModal';
import { usePathname, useRouter } from '@/i18n/routing';
import toast from 'react-hot-toast';

interface ArticleStatsProps {
  articleId: string;
  initialLikes?: number;
  initialViews?: number;
  className?: string;
  hasLikedByCurrentUser?: boolean;
}

export default function ArticleStats({ articleId, initialLikes = 0, initialViews = 0, className = "", hasLikedByCurrentUser = false }: ArticleStatsProps) {
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(hasLikedByCurrentUser);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const pathname = usePathname();

  // Sync initial state if prop changes (e.g., after client-side hydration or data fetch)
  React.useEffect(() => {
    setHasLiked(hasLikedByCurrentUser);
  }, [hasLikedByCurrentUser]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fast initial check from local storage to prevent flicker before API returns
  const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? React.useLayoutEffect : React.useEffect;

  useIsomorphicLayoutEffect(() => {
    try {
      const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
      if (likedArticles.includes(articleId)) {
        setHasLiked(true);
      }
    } catch (e) { }
  }, [articleId]);

  // Fetch actual status for logged-in user on client side (bypassing SSR cache)
  React.useEffect(() => {
    if (user && articleId) {
      articleApi.getLikeStatus(articleId)
        .then(res => {
          const responseData = (res.data as any).data || res.data;
          if (responseData && typeof responseData.hasLiked === 'boolean') {
            setHasLiked(responseData.hasLiked);
            // Sync local storage with truth from server
            try {
              const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
              const hasIt = likedArticles.includes(articleId);
              if (responseData.hasLiked && !hasIt) {
                likedArticles.push(articleId);
                localStorage.setItem('liked_articles', JSON.stringify(likedArticles));
              } else if (!responseData.hasLiked && hasIt) {
                const index = likedArticles.indexOf(articleId);
                likedArticles.splice(index, 1);
                localStorage.setItem('liked_articles', JSON.stringify(likedArticles));
              }
            } catch (e) { }
          }
        })
        .catch(err => console.error("Failed to fetch like status", err));
    }
  }, [user, articleId]);

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const pendingTogglesRef = React.useRef(0);

  const handleLike = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    // 1. Optimistic UI Update & Local Storage
    const previousLiked = hasLiked;
    const previousCount = likesCount;
    const newHasLiked = !previousLiked;

    setHasLiked(newHasLiked);
    setLikesCount(newHasLiked ? previousCount + 1 : Math.max(0, previousCount - 1));

    try {
      const likedArticles = JSON.parse(localStorage.getItem('liked_articles') || '[]');
      if (newHasLiked && !likedArticles.includes(articleId)) {
        likedArticles.push(articleId);
      } else if (!newHasLiked) {
        const index = likedArticles.indexOf(articleId);
        if (index > -1) likedArticles.splice(index, 1);
      }
      localStorage.setItem('liked_articles', JSON.stringify(likedArticles));
    } catch (e) { }

    // 2. Track toggles for debounce
    pendingTogglesRef.current += 1;

    // 3. Clear existing timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // 4. Set 2-second debounce timer before API call
    timerRef.current = setTimeout(async () => {
      // If toggled an even number of times, the state didn't actually change!
      if (pendingTogglesRef.current % 2 === 0) {
        pendingTogglesRef.current = 0;
        return; // No API call needed
      }

      // State actually changed, send to backend
      pendingTogglesRef.current = 0;

      try {
        const res = await articleApi.toggleLike(articleId);

        // Sync with actual server response
        const responseData = (res.data as any).data || res.data;
        if (responseData && typeof responseData.totalLikes === 'number') {
          setHasLiked(responseData.liked);
          setLikesCount(responseData.totalLikes);
        }
      } catch (error: any) {
        // console.error("Failed to toggle like:", error);
        // Revert optimistic update on failure
        setHasLiked(previousLiked);
        setLikesCount(previousCount);
        
        if (error?.statusCode === 429) {
          toast.error("Too many requests. Please wait a moment.");
        }
      }
    }, 500); // Reduced debounce from 2s to 500ms to save almost instantly
  };

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Views */}
      <div className="flex items-center gap-1.5 text-gray-500">
        <Eye className="w-4 h-4 text-[#C9A227]" />
        <span className="font-medium text-sm">
          {initialViews} {initialViews === 1 ? 'View' : 'Views'}
        </span>
      </div>

      {/* Likes */}
      <button
        onClick={(e) => { e.preventDefault(); handleLike(); }}
        className={`flex items-center gap-1.5 transition-opacity duration-200 group/like focus:outline-none ${mounted ? 'opacity-100' : 'opacity-0'}`}
        aria-label={hasLiked ? "Unlike article" : "Like article"}
      >
        <Heart
          className={`w-4 h-4 transition-all duration-300 ${hasLiked ? "fill-[#e11d48] text-[#e11d48] scale-110" : "text-gray-400 group-hover/like:text-[#e11d48]"}`}
        />
        <span className={`font-medium text-sm transition-colors ${hasLiked ? "text-[#e11d48]" : "text-gray-500 group-hover/like:text-gray-700"}`}>
          {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
        </span>
      </button>

      <ConfirmationModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onConfirm={() => {
          router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
        }}
        title="Login Required"
        message="Please log in or sign up to interact with this article."
        confirmText="Login / Sign Up"
        cancelText="Cancel"
      />
    </div>
  );
}
