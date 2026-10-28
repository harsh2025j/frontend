'use client';

import React from 'react';
import Link from 'next/link';
import {
  Scale,
  Gavel,
  Clock,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface SettlementComingSoonProps {
  locale: string;
  onPreviewMode?: () => void;
  pageType?: 'dashboard' | 'wizard';
}

export default function SettlementComingSoon({
  locale,
  onPreviewMode,
  pageType = 'dashboard',
}: SettlementComingSoonProps) {
  return (
    <div className="min-h-[80vh] bg-[#FAF8F5] py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="mx-auto max-w-4xl w-full">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#64748B]">
          <Link
            href={`/${locale}`}
            className="hover:text-[#0F172A] transition-colors"
          >
            Home
          </Link>
          <span>/</span>
          <Link
            href={`/${locale}/tools`}
            className="hover:text-[#0F172A] transition-colors"
          >
            Legal Tools
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#0F172A]">
            Mediation &amp; Settlement
          </span>
        </div>

        {/* Main Card */}
        <div className="rounded-2xl border border-gray-200/90 bg-white p-8 sm:p-12 shadow-sm relative overflow-hidden">
          {/* Subtle Top Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#CAA438] via-[#283851] to-[#0B2242]" />

          {/* Badge & Eyebrow */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#FAF8F5] border border-gray-200 text-[#CAA438]">
                <Scale className="size-4" />
              </span>
              <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-[#CAA438]">
                ALTERNATIVE DISPUTE RESOLUTION
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-300/80 px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-amber-800">
                <Clock className="size-3.5 text-amber-600" />
                <span>Coming Soon</span>
              </span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="mt-8 text-center max-w-2xl mx-auto">
            <div className="inline-flex size-16 items-center justify-center rounded-2xl bg-[#F8FAFC] border border-gray-200 text-[#283851] shadow-2xs mb-5">
              <Gavel className="size-8 text-[#CAA438]" />
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111827] tracking-tight font-sans">
              Mediation &amp; Out-of-Court Settlement Desk
            </h1>

            <p className="mt-3 text-sm sm:text-base text-[#64748B] leading-relaxed">
              We are actively preparing our nationwide statutory out-of-court dispute resolution infrastructure. This feature will empower businesses, advocates, and individuals to resolve commercial and civil claims without protracted court litigation.
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-gray-200 px-3.5 py-1.5 text-xs font-mono text-[#283851]">
              <ShieldCheck className="size-4 text-emerald-600" />
              <span>Compliant with The Mediation Act, 2023 &amp; Order XXIII Rule 3 CPC</span>
            </div>
          </div>

          {/* Upcoming Pillars Grid */}
          <div className="mt-10 grid gap-4 sm:grid-cols-3 text-left">
            <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <FileText className="size-4 text-[#CAA438]" />
                <span>5-Part Term Sheets</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Structured settlement agreements enforceable like a decree of court under Section 27 of The Mediation Act, 2023.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Empanelled Mediators</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Empanelled directory of 21+ accredited advocates and dispute mediators across High Courts with transparent session fees.
              </p>
            </div>

            <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-4.5 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#0F172A]">
                <Sparkles className="size-4 text-[#4F80E1]" />
                <span>Order XXIII R3 CPC</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Automated compromise applications for disposal of ongoing court suits upon amicable bilateral settlement.
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/${locale}/tools`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#283851] hover:bg-[#1E293B] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition-colors"
              >
                <ArrowLeft className="size-4" />
                <span>Explore Other Legal Tools</span>
              </Link>

              <Link
                href={`/${locale}`}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white hover:bg-[#F8FAFC] px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#111827] transition-colors"
              >
                <span>Return to Home</span>
              </Link>
            </div>

            {/* Internal Preview Access Button */}
            {onPreviewMode && (
              <button
                type="button"
                onClick={onPreviewMode}
                className="inline-flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#283851] transition-colors cursor-pointer font-mono"
              >
                <Lock className="size-3.5" />
                <span>Preview Feature (Demo Mode)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
