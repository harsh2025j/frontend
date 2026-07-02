"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { articleApi } from '@/data/services/article-service/article-service';

interface ViewTrackerProps {
  articleId: string;
  minViewTimeMs?: number; // Default: 5000ms (5 seconds)
}

export function ViewTracker({ articleId, minViewTimeMs = 5000 }: ViewTrackerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasTracked, setHasTracked] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only track if we are actually on a news article details page (e.g. /en/news/some-slug)
    const isArticlePage = pathname && pathname.includes('/news/') && pathname.split('/news/')[1]?.length > 0;

    if (!isArticlePage) {
      return;
    }

    // If we already tracked this view in this session, don't do it again
    const sessionKey = `tracked_article_${articleId}`;
    if (sessionStorage.getItem(sessionKey) || hasTracked) {
      return;
    }

    let timer: NodeJS.Timeout;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          // Start the timer when the element comes into view
          timer = setTimeout(async () => {
            if (!hasTracked && !sessionStorage.getItem(sessionKey)) {
              setHasTracked(true);
              sessionStorage.setItem(sessionKey, 'true');

              try {
                // Generate a random user identifier to pass to backend for cooldown
                let userIdentifier = localStorage.getItem('article_user_id');
                if (!userIdentifier) {
                  userIdentifier = Math.random().toString(36).substring(2, 15);
                  localStorage.setItem('article_user_id', userIdentifier);
                }

                await articleApi.trackView(articleId, userIdentifier);

                // console.log(`[ViewTracker] Tracked genuine view for article ${articleId}`);
              } catch (error) {
                // console.error('[ViewTracker] Failed to track view', error);
                // Revert so we can try again on next scroll if it failed
                setHasTracked(false);
                sessionStorage.removeItem(sessionKey);
              }
            }
          }, minViewTimeMs);
        } else {
          // Clear the timer if they scroll away before 20 seconds
          clearTimeout(timer);
        }
      },
      {
        threshold: 0.01, // 1% of the element must be visible (handles very long articles)
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [articleId, hasTracked, minViewTimeMs]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none opacity-0 -z-10" aria-hidden="true" />;
}
