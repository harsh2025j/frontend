"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import { Advertisement, GOOGLE_AD_MAPPINGS, AD_SLOTS } from "@/data/features/advertisement/advertisement.types";
import { isAdmin as checkIsAdmin } from "@/utils/permissions";

/**
 * Helper to get slot aspect ratio
 */
export function getSlotAspectRatio(slotId?: string): string | undefined {
  if (!slotId) return undefined;
  const slot = AD_SLOTS.find(s => s.id === slotId);
  if (slot && slot.dimensions) {
    const [w, h] = slot.dimensions.split("x");
    return `${w} / ${h}`;
  }
  // Fallbacks if not found in list but slotId naming pattern is standard
  if (slotId === "HOME_FEED_1") return "728 / 150";
  if (slotId.includes("BANNER") || slotId.includes("FOOTER")) return "728 / 90";
  if (slotId.includes("SIDEBAR")) return "300 / 250";
  return undefined;
}

/**
 * Helper to get slot width
 */
export function getSlotWidth(slotId?: string): number | undefined {
  if (!slotId) return undefined;
  const slot = AD_SLOTS.find(s => s.id === slotId);
  if (slot && slot.dimensions) {
    const [w] = slot.dimensions.split("x");
    return parseInt(w);
  }
  // Fallbacks if not found in list but slotId naming pattern is standard
  if (slotId === "HOME_FEED_1") return 728;
  if (slotId.includes("BANNER") || slotId.includes("FOOTER")) return 728;
  if (slotId.includes("SIDEBAR")) return 300;
  return undefined;
}

/**
 * Custom hook to fetch per-slot visibility settings.
 * Each slot checks its own toggle. Slots not in the map default to ON (visible).
 */
export function useSlotVisibility(slotId: string) {
  const [isSlotEnabled, setIsSlotEnabled] = useState<boolean>(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await advertisementApi.fetchSlotVisibility();
        // Fixed: The backend wraps the API response in an extra 'data' object.
        const map = response.data?.data?.slotVisibility || {};
        // If the slot is not in the map, default to true (visible)
        setIsSlotEnabled(map[slotId] !== false);
      } catch (error) {
        setIsSlotEnabled(true); // default to visible on error
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [slotId]);

  return { isSlotEnabled, settingsLoading };
}

/**
 * Custom hook to fetch active advertisement for a slot
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
  slotId?: string;
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
  slotId,
}: BaseAdProps) {
  const isFixed = typeof width === 'number' && typeof height === 'number';
  const aspectRatio = getSlotAspectRatio(slotId);
  const slotWidth = getSlotWidth(slotId);

  // Impression Tracking
  useEffect(() => {
    if (adId) {
      advertisementApi.trackImpression(adId).catch(() => { });
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
      advertisementApi.trackClick(adId, userIdentifier).catch(() => { });
    }
  };

  const containerStyle: React.CSSProperties = isFixed ? {
    width: `${width}px`,
    height: `${height}px`,
  } : {
    width: '100%',
    ...(aspectRatio ? { aspectRatio } : {}),
    height: aspectRatio ? 'auto' : (typeof height === 'number' ? `${height}px` : height),
    maxHeight: typeof height === 'number' ? `${height}px` : height,
    maxWidth: slotWidth ? `${slotWidth}px` : undefined,
  };

  const Content = () => (
    <div
      className={`relative bg-gray-50 border border-gray-200 flex flex-col items-center justify-center overflow-hidden rounded-sm transition-all duration-300 hover:border-blue-300 group mx-auto ${className}`}
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

/**
 * GoogleAdSense Component - Safely renders Google AdSense units
 */
export function GoogleAdSense({ slotId, width, height, className = '' }: { slotId: string, width?: string | number, height?: string | number, className?: string }) {
  const adUnitId = GOOGLE_AD_MAPPINGS[slotId];
  const isFixed = typeof width === 'number' && typeof height === 'number';
  const insRef = React.useRef<HTMLModElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const displayHeight = typeof height === 'number' ? height : (slotId === "HOME_FEED_1" ? 150 : 90);
  const aspectRatio = getSlotAspectRatio(slotId);
  const slotWidth = getSlotWidth(slotId);

  const containerStyle: React.CSSProperties = isFixed ? {
    width: `${width}px`,
    height: `${height}px`,
  } : {
    width: '100%',
    ...(aspectRatio ? { aspectRatio } : {}),
    height: aspectRatio ? 'auto' : (typeof height === 'number' ? `${height}px` : (height || '90px')),
    maxHeight: typeof height === 'number' ? `${height}px` : (height || '90px'),
    maxWidth: slotWidth ? `${slotWidth}px` : undefined,
  };

  useEffect(() => {
    const applyStyles = () => {
      if (containerRef.current) {
        if (aspectRatio) {
          containerRef.current.style.setProperty('aspect-ratio', aspectRatio, 'important');
          containerRef.current.style.setProperty('height', 'auto', 'important');
        } else {
          containerRef.current.style.setProperty('height', `${displayHeight}px`, 'important');
        }
        containerRef.current.style.setProperty('max-height', `${displayHeight}px`, 'important');
        if (slotWidth) {
          containerRef.current.style.setProperty('max-width', `${slotWidth}px`, 'important');
        }
      }
      if (insRef.current) {
        if (aspectRatio) {
          insRef.current.style.setProperty('aspect-ratio', aspectRatio, 'important');
          insRef.current.style.setProperty('height', 'auto', 'important');
        } else {
          insRef.current.style.setProperty('height', `${displayHeight}px`, 'important');
        }
        insRef.current.style.setProperty('max-height', `${displayHeight}px`, 'important');
        if (slotWidth) {
          insRef.current.style.setProperty('max-width', `${slotWidth}px`, 'important');
        }
      }
    };

    applyStyles();

    try {
      if (insRef.current && insRef.current.innerHTML === "") {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (e) {
      console.error("AdSense error", e);
    }

    const timer1 = setTimeout(applyStyles, 100);
    const timer2 = setTimeout(applyStyles, 500);
    const timer3 = setTimeout(applyStyles, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [slotId, displayHeight, aspectRatio, slotWidth]);

  if (!adUnitId) return null; // No mapping found

  return (
    <div
      ref={containerRef}
      className={`relative bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 mx-auto ${className}`}
      style={containerStyle}
    >
      <div className="absolute top-1 right-1 z-10">
        <span className="text-[10px] font-bold text-gray-400 bg-white/80 backdrop-blur-sm px-1.5 py-0.5 border border-gray-200 rounded uppercase tracking-tighter leading-none shadow-sm">
          Google Ad
        </span>
      </div>
      <ins
        ref={insRef}
        className="adsbygoogle w-full h-full block"
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Replace with real client ID later
        data-ad-slot={adUnitId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}

// ─── DYNAMIC AD COMPONENTS ───

/** 
 * AdBanner - Wide horizontal advertisements
 */
export function AdBanner({ slotId, withContainer = false }: { slotId: string; withContainer?: boolean }) {
  const { ad, loading } = useAdvertisement(slotId);
  const { isSlotEnabled, settingsLoading } = useSlotVisibility(slotId);

  // --- PREMIUM & ADMIN AD-FREE CHECK ---
  const { currentSubscription } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  if (currentSubscription?.status === 'active' || checkIsAdmin(user as any)) return null;
  // --- PER-SLOT TOGGLE CHECK ---
  if (!settingsLoading && !isSlotEnabled) return null;
  // ----------------------------------

  const bannerHeight = (slotId === "HOME_FEED_1") ? 150 : 90;

  if (loading) {
    if (withContainer) {
      return (
        <div className="container mx-auto px-4 py-8 flex justify-center">
          <div className="bg-gray-50 border border-gray-100 w-full max-w-5xl rounded-sm animate-pulse" style={{ height: `${bannerHeight}px` }} />
        </div>
      );
    }
    return (
      <div className="w-full flex justify-center py-4 animate-pulse">
        <div className="bg-gray-50 border border-gray-100 w-full max-w-5xl rounded-sm" style={{ height: `${bannerHeight}px` }} />
      </div>
    );
  }

  const renderAdContent = () => {
    if (ad && ad.isActive) {
      return (
        <BaseAd
          slotId={slotId}
          width="100%"
          height={bannerHeight}
          label={ad.title}
          imageUrl={ad.imageUrl}
          linkUrl={ad.link}
          adId={ad._id}
        />
      );
    }

    // Google Ad Fallback
    if (GOOGLE_AD_MAPPINGS[slotId]) {
      return <GoogleAdSense slotId={slotId} height={bannerHeight} />;
    }

    return null;
  };

  const content = renderAdContent();
  if (!content) return null;

  if (withContainer) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        {content}
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
  const { isSlotEnabled, settingsLoading } = useSlotVisibility(slotId);

  // --- PREMIUM & ADMIN AD-FREE CHECK ---
  const { currentSubscription } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  if (currentSubscription?.status === 'active' || checkIsAdmin(user as any)) return null;
  // --- PER-SLOT TOGGLE CHECK ---
  if (!settingsLoading && !isSlotEnabled) return null;
  // ----------------------------------

  if (loading) {
    return (
      <div className="mb-6 animate-pulse w-full flex justify-center">
        <div className="bg-gray-50 border border-gray-100 w-full rounded-sm" style={{ height: '250px', maxWidth: '300px' }} />
      </div>
    );
  }

  const renderAdContent = () => {
    if (ad && ad.isActive) {
      return (
        <BaseAd
          slotId={slotId}
          width="100%"
          height={250}
          label={ad.title}
          imageUrl={ad.imageUrl}
          linkUrl={ad.link}
          adId={ad._id}
        />
      );
    }

    // Google Ad Fallback
    if (GOOGLE_AD_MAPPINGS[slotId]) {
      return <GoogleAdSense slotId={slotId} height={250} />;
    }

    return null;
  };

  const content = renderAdContent();
  if (!content) return null;

  return (
    <div className="mb-6 flex justify-center w-full">
      {content}
    </div>
  );
}

/** 
 * AdPopup - Special slot for popup-style ads with a timer and close button
 */
export function AdPopup({ slotId, showAfterSeconds = 5 }: { slotId: string, showAfterSeconds?: number }) {
  const { ad, loading } = useAdvertisement(slotId);
  const { isSlotEnabled, settingsLoading } = useSlotVisibility(slotId);
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
  // --- PER-SLOT TOGGLE CHECK ---
  if (!settingsLoading && !isSlotEnabled) return null;
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
export function InFeedAd({ slotId = "HOME_BANNER_TOP_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
export function HalfPageAd({ slotId = "ARTICLE_SIDEBAR_2" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }

// --- Article Specific Ads ---
export function ArticleTopAd({ slotId = "ARTICLE_BANNER_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
export function ArticleSidebarTopAd({ slotId = "ARTICLE_SIDEBAR_1" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }
export function ArticleSidebarBottomAd({ slotId = "ARTICLE_SIDEBAR_2" }: { slotId?: string }) { return <AdSidebar slotId={slotId} />; }
export function ArticleBottomAd({ slotId = "ARTICLE_FOOTER_1" }: { slotId?: string }) { return <AdBanner slotId={slotId} />; }
