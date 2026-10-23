"use client";

import React, { useEffect, useState } from "react";
import ChatWorkspace from "@/components/chat/ChatWorkspace";
import { Link } from "@/i18n/routing";
import { Lock, User, PenSquare, ArrowRight, ShieldCheck } from "lucide-react";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

export default function UserMessagesPage() {
  const { user, loading: profileLoading } = useProfileActions();
  const [hasToken, setHasToken] = useState<boolean | null>(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setHasToken(Boolean(token));
  }, []);

  // Show a smooth loader while determining auth state
  if (hasToken === null || (hasToken && profileLoading && !user)) {
    return (
      <div className="h-[calc(100dvh-64px)] sm:h-[calc(100dvh-80px)] lg:h-[calc(100dvh-124px)] bg-[#FAF8F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin rounded-full h-9 w-9 border-3 border-[#0B2242] border-t-[#C9A227]"></span>
          <p className="text-slate-500 font-serif text-sm font-medium tracking-wide">
            Verifying secure access...
          </p>
        </div>
      </div>
    );
  }

  // Not Logged In State -> Fit cleanly within 100vh with no scroll and matching button heights
  if (!hasToken && !user) {
    return (
      <div className="h-[calc(100dvh-64px)] sm:h-[calc(100dvh-80px)] lg:h-[calc(100dvh-124px)] max-h-[calc(100dvh-64px)] sm:max-h-[calc(100dvh-80px)] lg:max-h-[calc(100dvh-124px)] bg-[#FAF8F5] bg-[url('/images/legal-auth-bg.webp')] bg-cover bg-top bg-no-repeat flex items-center justify-center p-3 sm:p-5 lg:p-6 relative overflow-hidden select-none">
        {/* Top-Left Corner Decorative Navy/Gold Arc */}
        <div className="absolute top-0 left-0 w-28 sm:w-48 h-16 sm:h-28 pointer-events-none z-0">
          <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="none">
            <path d="M 0,0 L 200,0 C 140,24 60,70 0,120 Z" fill="#0B2242" />
            <path d="M 0,120 C 60,70 140,24 200,0" stroke="#C9A227" strokeWidth="4" fill="none" />
          </svg>
        </div>

        {/* Central Floating Card - Compact Proportions to Fit 100vh Perfectly */}
        <div className="relative z-10 bg-white/95 backdrop-blur-xs rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl shadow-[#0B2242]/10 border border-[#E2E8F0]/80 max-w-[560px] w-full mx-auto text-center">
          {/* Padlock Icon with Flanking Gold Accent Lines */}
          <div className="flex items-center justify-center gap-3 sm:gap-5 mb-3.5 sm:mb-4">
            <span className="h-px w-10 sm:w-14 bg-[#C9A227]/70" />
            <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-full bg-[#FAF6EC] border border-[#C9A227]/40 flex items-center justify-center text-[#C9A227] shadow-xs shrink-0">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />
            </div>
            <span className="h-px w-10 sm:w-14 bg-[#C9A227]/70" />
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-3xl md:text-[34px] font-bold text-[#0B2242] tracking-tight mb-2 sm:mb-2.5">
            Access Restricted
          </h1>

          {/* Subtitle / Body Copy */}
          <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto mb-5 sm:mb-6 font-normal">
            To ensure client-attorney privilege and protect sensitive information, please authenticate your profile before accessing messages.
          </p>

          {/* Two Action Buttons - Exact Identical Height and Single Line */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full mb-5 sm:mb-6">
            {/* 1. Continue to Login */}
            <Link href="/auth/login?redirect=/messages" className="flex-1 w-full sm:w-1/2">
              <button
                type="button"
                className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl bg-[#0B2242] hover:bg-[#15345E] text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <User className="size-4 shrink-0 text-white/90" />
                <span className="whitespace-nowrap">CONTINUE TO LOGIN</span>
                <ArrowRight className="size-3.5 shrink-0 text-white/80" />
              </button>
            </Link>

            {/* 2. Create New Profile */}
            <Link href="/auth/signup?redirect=/messages" className="flex-1 w-full sm:w-1/2">
              <button
                type="button"
                className="w-full h-11 sm:h-12 inline-flex items-center justify-center gap-2 px-4 sm:px-5 rounded-xl bg-gradient-to-r from-[#C9A227] to-[#B38E1B] hover:from-[#B8921F] hover:to-[#A37F14] text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase whitespace-nowrap shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <PenSquare className="size-4 shrink-0 text-white/90" />
                <span className="whitespace-nowrap">CREATE NEW PROFILE</span>
                <ArrowRight className="size-3.5 shrink-0 text-white/80" />
              </button>
            </Link>
          </div>

          {/* Bottom Security / Confidence Footer */}
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <span className="h-px w-8 sm:w-12 bg-[#C9A227]/50" />
            <ShieldCheck className="size-3.5 sm:size-4 text-[#C9A227] shrink-0" />
            <span className="h-px w-8 sm:w-12 bg-[#C9A227]/50" />
          </div>
          <p className="text-[9px] sm:text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-serif">
            SECURE & CONFIDENTIAL MESSAGING ENVIRONMENT
          </p>
        </div>
      </div>
    );
  }

  // Authenticated State -> Load ChatWorkspace
  return (
    <div className="h-[calc(100vh-120px)] bg-white flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 flex-1 max-w-[1400px] w-full mx-auto flex flex-col min-h-0">
        <div className="flex-1 min-h-0 w-full relative">
          <ChatWorkspace role="user" />
        </div>
      </div>
    </div>
  );
}
