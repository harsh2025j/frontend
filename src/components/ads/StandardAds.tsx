"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import { Advertisement } from "@/data/features/advertisement/advertisement.types";
import { isAdmin as checkIsAdmin } from "@/utils/permissions";

/**
 * Custom hook to fetch advertisement for a specific slot
 */
export function useAdvertisement(slotId: string) {
  const [ad, setAd] = useState<Advertisement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        const response = await advertisementApi.fetchAdvertisementBySlot(slotId);
        setAd(response.data.data);
      } catch (error) {
        setAd(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [slotId]);

  return { ad, loading };
}

interface BaseAdProps {
  width: string | number;
  height: string | number;
  label: string;
  imageUrl?: string;
  linkUrl?: string;
  className?: string;
  id?: string;
  adId?: string;
}

/**
 * BaseAd Component - Shared between frontend and admin preview
 */
export function BaseAd({
  width,
  height,
  label,
  imageUrl,
  linkUrl,
  className = '',
  id,
  adId,
}: BaseAdProps) {
  const isFixed = typeof width === 'number' && typeof height === 'number';

  // Impression Tracking
  useEffect(() => {
    if (adId) {
      advertisementApi.trackImpression(adId).catch(() => {});
    }
  }, [adId]);

  const handleAdClick = () => {
    if (adId) {
      // Get or generate a user identifier for click tracking
      let userIdentifier = localStorage.getItem('ad_user_id');
      if (!userIdentifier) {
        userIdentifier = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('ad_user_id', userIdentifier);
      }
      advertisementApi.trackClick(adId, userIdentifier).catch(() => {});
    }
  };

  const containerStyle: React.CSSProperties = isFixed ? {
    width: `${width}px`,
    height: `${height}px`,
  } : {
    width: '100%',
    minHeight: typeof height === 'number' ? `${height}px` : height,
  };

  const Content = () => (
    <div
      className={`relative bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden rounded-sm transition-all duration-300 hover:border-blue-300 group ${className}`}
      style={containerStyle}
      id={id}
    >
      {/* AD DISCLOSURE TAG - Always visible */}
      <div className="absolute top-1 right-1 z-10">
        <span className="text-[10px] font-bold text-gray-400 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 border border-gray-200 rounded uppercase tracking-tighter leading-none shadow-sm">
          Sponsored Ad
        </span>
      </div>

      {imageUrl ? (
        <div className="relative w-full h-full">
          <img
            src={imageUrl}
            alt={label}
            className="w-full h-full object-cover transition-none"
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-4 text-center">
          <p className="text-gray-400 font-semibold text-xs">{label}</p>
          {isFixed && <p className="text-gray-300 text-[10px] mt-1">{width} x {height}</p>}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>
      )}
    </div>
  );

  if (linkUrl) {
    return (
      <a 
        href={linkUrl} 
        className="block no-underline" 
        target="_blank" 
        rel="noopener noreferrer"
        onClick={handleAdClick}
      >
        <Content />
      </a>
    );
  }

  return <Content />;
}

// ─── DYNAMIC AD COMPONENTS ───

/** 
 * AdBanner - Wide horizontal advertisements
 */
export function AdBanner({ slotId, withContainer = false }: { slotId: string; withContainer?: boolean }) {
  const { ad, loading } = useAdvertisement(slotId);

  // --- PREMIUM & ADMIN AD-FREE CHECK ---
  const { currentSubscription } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  if (currentSubscription?.status === 'active' || checkIsAdmin(user as any)) return null;
  // ----------------------------------

  const bannerHeight = (slotId === "HOME_FEED_1") ? 150 : 90;

  if (loading) {
    if (withContainer) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-sm animate-pulse" style={{ minHeight: `${bannerHeight + 40}px` }} />
        </div>
      );
    }
    return (
      <div className="w-full flex justify-center py-4 animate-pulse">
        <div className="bg-gray-50 border border-gray-100 w-full max-w-5xl rounded-sm" style={{ height: `${bannerHeight}px` }} />
      </div>
    );
  }

  if (!ad || !ad.isActive) return null;



  const content = (
    <BaseAd
      width="100%"
      height={bannerHeight}
      label={ad.title}
      imageUrl={ad.imageUrl}
      linkUrl={ad.link}
      adId={ad._id}
    />
  );

  if (withContainer) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-2">Advertisement</h3>
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-4">
      {content}
    </div>
  );
}

/** 
 * AdSidebar - Square or vertical rectangular ads for sidebars 
 */
export function AdSidebar({ slotId, withContainer = false }: { slotId: string; withContainer?: boolean }) {
  const { ad, loading } = useAdvertisement(slotId);

  // --- PREMIUM & ADMIN AD-FREE CHECK ---
  const { currentSubscription } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  if (currentSubscription?.status === 'active' || checkIsAdmin(user as any)) return null;
  // ----------------------------------

  if (loading) {
    if (withContainer) {
      return (
        <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 shadow-sm mb-6 animate-pulse" style={{ minHeight: '290px' }} />
      );
    }
    return (
      <div className="mb-6 animate-pulse w-full">
        <div className="bg-gray-50 border border-gray-100 w-full rounded-sm" style={{ height: '250px' }} />
      </div>
    );
  }

  if (!ad || !ad.isActive) return null;

  const content = (
    <BaseAd
      width="100%"
      height={250}
      label={ad.title}
      imageUrl={ad.imageUrl}
      linkUrl={ad.link}
      adId={ad._id}
    />
  );

  if (withContainer) {
    return (
      <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm mb-6">
        <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-2">Sponsored</h3>
        {content}
      </div>
    );
  }

  return (
    <div className="mb-6">
      {content}
    </div>
  );
}

/** 
 * AdPopup - Special slot for popup-style ads with a timer and close button
 */
export function AdPopup({ slotId, showAfterSeconds = 5 }: { slotId: string, showAfterSeconds?: number }) {
  const { ad, loading } = useAdvertisement(slotId);
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenClosed, setHasBeenClosed] = useState(false);

  useEffect(() => {
    // Check if seen in this session
    const hasSeen = sessionStorage.getItem(`has_seen_ad_${slotId}`);
    
    if (!loading && ad && ad.isActive && !hasBeenClosed && !hasSeen) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Mark as seen for this session immediately when it shows
        sessionStorage.setItem(`has_seen_ad_${slotId}`, "true");
      }, showAfterSeconds * 1000);
      return () => clearTimeout(timer);
    }
  }, [loading, ad, showAfterSeconds, hasBeenClosed, slotId]);

  // --- PREMIUM & ADMIN AD-FREE CHECK ---
  const { currentSubscription } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  if (currentSubscription?.status === 'active' || checkIsAdmin(user as any)) return null;
  // ----------------------------------

  if (loading || !ad || !ad.isActive || !isVisible || hasBeenClosed) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative animate-in zoom-in-95 duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-[90vw] max-h-[90vh] aspect-square flex items-center justify-center">
        <button
          onClick={() => {
            setIsVisible(false);
            setHasBeenClosed(true);
          }}
          className="absolute -top-4 -right-4 z-[10001] bg-white text-gray-900 p-2 rounded-full shadow-2xl border border-gray-200 hover:bg-gray-100 transition-all hover:scale-110 active:scale-95"
        >
          <X size={24} />
        </button>
        <div className="w-full h-full overflow-hidden rounded-xl border-4 border-white">
          <BaseAd
            width="100%"
            height="100%"
            label={ad.title}
            imageUrl={ad.imageUrl}
            linkUrl={ad.link}
            adId={ad._id}
            className="rounded-none border-none h-full w-full"
          />
        </div>
      </div>
    </div>
  );
}

// ─── LEGACY / COMPATIBILITY EXPORTS ───

export function LeaderboardAd({ slotId = "HOME_BANNER_TOP_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
export function MediumRectangleAd({ slotId = "HOME_SIDEBAR_1" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }
export function SkyscraperAd({ slotId = "ARTICLE_SIDEBAR_2" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }
export function InFeedAd({ slotId = "HOME_FEED_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
export function HalfPageAd({ slotId = "ARTICLE_SIDEBAR_2" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }

// --- Article Specific Ads ---
export function ArticleTopAd({ slotId = "ARTICLE_BANNER_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
export function ArticleSidebarTopAd({ slotId = "ARTICLE_SIDEBAR_1" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }
export function ArticleSidebarBottomAd({ slotId = "ARTICLE_SIDEBAR_2" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }
export function ArticleBottomAd({ slotId = "ARTICLE_FOOTER_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
