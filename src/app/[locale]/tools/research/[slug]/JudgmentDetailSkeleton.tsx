'use client';

import React from 'react';
import { ArrowLeft, Loader2, Sparkles, Scale, BookOpen, Gavel } from 'lucide-react';

interface JudgmentDetailSkeletonProps {
  onBack?: () => void;
}

export default function JudgmentDetailSkeleton({ onBack }: JudgmentDetailSkeletonProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Top Header & Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0B2242] transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Precedents Research</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Skeleton Buttons */}
          <div className="h-8 w-28 rounded-lg bg-slate-200" />
          <div className="h-8 w-24 rounded-lg bg-slate-200" />
          <div className="h-8 w-32 rounded-lg bg-slate-300" />
        </div>
      </div>

      {/* Floating Status Notification Pill */}
      <div className="mt-6 flex items-center justify-center">
        <div className="inline-flex items-center gap-3 rounded-full bg-[#0B2242] text-white px-5 py-2.5 shadow-lg border border-[#CAA438]/40">
          <Loader2 className="size-4 text-[#CAA438] animate-spin shrink-0" />
          <div className="text-left">
            <span className="text-xs font-bold font-merriweather tracking-wide block">
              Retrieving Authentic Supreme Court Record...
            </span>
            <span className="text-[11px] text-[#94A3B8] font-mono block">
              Loading certified law report, ratio decidendi, and verified judicial paragraphs
            </span>
          </div>
        </div>
      </div>

      {/* Main Case Identification Header Skeleton */}
      <div className="mt-6 rounded-2xl border border-[#CBD5E1] bg-white p-6 sm:p-8 shadow-xs">
        {/* Badges & Date */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="h-6 w-36 rounded-md bg-[#0B2242]/20" />
            <div className="h-6 w-32 rounded-md bg-[#EAEFF9]" />
          </div>
          <div className="h-4 w-28 rounded-sm bg-slate-200" />
        </div>

        {/* Title Lines */}
        <div className="mt-5 space-y-2.5">
          <div className="h-8 w-11/12 sm:w-4/5 rounded-md bg-slate-200" />
          <div className="h-7 w-3/5 sm:w-1/2 rounded-md bg-slate-200" />
        </div>

        {/* Citations Box Skeleton */}
        <div className="mt-4 flex items-center gap-2">
          <div className="h-7 w-52 rounded-lg bg-slate-100 border border-slate-200" />
        </div>

        {/* Coram & Metadata Row */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-[#F1F5F9] pt-4">
          <div className="flex items-start gap-2">
            <div className="size-4 rounded-full bg-amber-200 shrink-0 mt-0.5" />
            <div className="w-full space-y-1.5">
              <div className="h-3.5 w-28 rounded bg-slate-300" />
              <div className="h-3 w-5/6 rounded bg-slate-200" />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="size-4 rounded-full bg-slate-300 shrink-0 mt-0.5" />
            <div className="w-full space-y-1.5">
              <div className="h-3.5 w-24 rounded bg-slate-300" />
              <div className="h-3 w-4/6 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      </div>

      {/* PROMINENT EXECUTIVE CASE SUMMARY CARD SKELETON */}
      <section className="mt-8 rounded-2xl border-2 border-[#CBD5E1] bg-white shadow-sm overflow-hidden">
        {/* Card Header Strip */}
        <div className="bg-[#0B2242] px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-[#CAA438]/20 border border-[#CAA438]/40 flex items-center justify-center">
              <Scale className="size-5 text-[#CAA438]" />
            </div>
            <div className="space-y-1">
              <div className="h-4 w-60 rounded bg-slate-200/50" />
              <div className="h-3 w-80 rounded bg-slate-300/30" />
            </div>
          </div>
          <div className="h-7 w-36 rounded-lg bg-[#CAA438]/30" />
        </div>

        {/* Card Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Section 1: Core Ratio Decidendi Callout Skeleton */}
          <div className="rounded-xl border-l-4 border-l-[#CAA438] border border-[#E2E8F0] bg-gradient-to-r from-[#FFFDF8] via-white to-[#F8FAFC] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 rounded-full bg-amber-300" />
              <div className="h-3.5 w-72 rounded bg-amber-200/70" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-slate-200" />
              <div className="h-4 w-11/12 rounded bg-slate-200" />
              <div className="h-4 w-4/5 rounded bg-slate-200" />
            </div>
          </div>

          {/* Section 2: Detailed Headnotes Skeleton */}
          <div className="space-y-3">
            <div className="h-3.5 w-48 rounded bg-slate-300" />
            <div className="space-y-2">
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-1.5">
                <div className="h-3.5 w-full rounded bg-slate-200" />
                <div className="h-3.5 w-5/6 rounded bg-slate-200" />
              </div>
              <div className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 space-y-1.5">
                <div className="h-3.5 w-11/12 rounded bg-slate-200" />
                <div className="h-3.5 w-4/5 rounded bg-slate-200" />
              </div>
            </div>
          </div>

          {/* Section 3: Key Legal Holdings Badges */}
          <div className="space-y-2">
            <div className="h-3.5 w-40 rounded bg-slate-300" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-36 rounded-full bg-slate-200" />
              <div className="h-7 w-44 rounded-full bg-slate-200" />
              <div className="h-7 w-32 rounded-full bg-slate-200" />
              <div className="h-7 w-40 rounded-full bg-slate-200" />
            </div>
          </div>

          {/* Section 4: Provisions Cited */}
          <div className="space-y-2">
            <div className="h-3.5 w-48 rounded bg-slate-300" />
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-40 rounded bg-[#EAEFF9]" />
              <div className="h-6 w-32 rounded bg-[#EAEFF9]" />
              <div className="h-6 w-48 rounded bg-[#EAEFF9]" />
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Row Skeleton */}
      <div className="mt-8 flex gap-2 border-b border-[#E2E8F0] pb-2">
        <div className="h-9 w-44 rounded-lg bg-[#0B2242]/20" />
        <div className="h-9 w-36 rounded-lg bg-slate-100" />
        <div className="h-9 w-40 rounded-lg bg-slate-100" />
      </div>

      {/* PDF Document Frame Skeleton */}
      <div className="mt-4 rounded-xl border border-[#CBD5E1] bg-white overflow-hidden shadow-xs">
        {/* Document Frame Toolbar Skeleton */}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-4 w-20 rounded bg-slate-200" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-20 rounded bg-slate-200" />
            <div className="h-7 w-24 rounded bg-slate-200" />
          </div>
        </div>

        {/* Realistic Legal Document Page Skeleton */}
        <div className="p-8 sm:p-12 min-h-[480px] bg-white flex flex-col items-center">
          <div className="w-full max-w-3xl space-y-6">
            {/* Header Seal & Emblem Placeholder */}
            <div className="flex flex-col items-center space-y-2 pb-4 border-b border-slate-100">
              <div className="size-12 rounded-full bg-amber-100 flex items-center justify-center">
                <Gavel className="size-6 text-amber-500/70" />
              </div>
              <div className="h-4 w-56 rounded bg-slate-300" />
              <div className="h-3 w-40 rounded bg-slate-200" />
            </div>

            {/* Simulated Case Header */}
            <div className="space-y-2 pt-2">
              <div className="h-3.5 w-3/4 mx-auto rounded bg-slate-200" />
              <div className="h-3 w-1/2 mx-auto rounded bg-slate-200" />
            </div>

            {/* Paragraph Blocks */}
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-11/12 rounded bg-slate-200" />
                <div className="h-3 w-4/5 rounded bg-slate-200" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-5/6 rounded bg-slate-200" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="h-3 w-full rounded bg-slate-200" />
                <div className="h-3 w-10/12 rounded bg-slate-200" />
                <div className="h-3 w-3/4 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
