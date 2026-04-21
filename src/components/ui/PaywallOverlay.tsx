"use client";

import React from "react";
import { Lock, Sparkles, UserPlus } from "lucide-react";
import { Link } from "@/i18n/routing";

interface PaywallOverlayProps {
  isLoggedIn: boolean;
  t: (key: string) => string;
}

export default function PaywallOverlay({ isLoggedIn, t }: PaywallOverlayProps) {
  return (
    <div className="relative mt-[-100px] pt-[100px] z-10">
      {/* Blur/Fade effect over the truncated text */}
      <div className="absolute top-0 left-0 right-0 h-[150px] bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />

      <div className="relative bg-white border-t border-gray-100 px-6 py-12 text-center rounded-b-2xl shadow-[0_-20px_50px_-20px_rgba(0,0,0,0.1)]">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0A2342]/5 mb-6 ring-8 ring-[#0A2342]/5">
          <div className="w-14 h-14 rounded-full bg-[#0A2342] flex items-center justify-center text-[#C9A227] shadow-xl">
            <img src="/logo-gold.png" alt="Lock" className="w-14 h-14" />
          </div>
        </div>

        <h3 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
          This is a <span className="text-[#C9A227]">Premium</span> Story
        </h3>

        <p className="text-lg text-gray-600 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
          Unlock full access to this article, expert legal analysis, and exclusive case studies by joining our community.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/subscription"
            className="w-full sm:w-auto px-10 py-4 bg-[#C9A227] !text-white !no-underline font-bold rounded-xl hover:bg-[#C9A227] hover:text-white transition-all  hover:shadow-sm flex items-center justify-center gap-2 group"
          >
            {/* <Sparkles size={20} className="text-white group-hover:animate-pulse" /> */}
            Upgrade to Premium
          </Link>

          {!isLoggedIn && (
            <Link
              href="/auth/login"
              className="w-full !no-underline sm:w-auto px-10 py-4 bg-white text-[#0A2342] font-bold rounded-xl border-2 border-[#0A2342] hover:bg-gray-50 transition-all  flex items-center justify-center gap-2"
            >
              {/* <UserPlus size={20} /> */}
              Login / Sign Up
            </Link>
          )}
        </div>

        <p className="mt-8 text-sm text-gray-400 font-medium">
          {isLoggedIn
            ? "Choose a plan that works for you. Cancel anytime."
            : "Already a premium member? Sign in to continue reading."}
        </p>
      </div>
    </div>
  );
}
