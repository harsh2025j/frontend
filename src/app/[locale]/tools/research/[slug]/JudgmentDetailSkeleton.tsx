'use client';

import React from 'react';
interface JudgmentDetailSkeletonProps {
  /** Kept for call-site compatibility; the tools layout owns the Back control. */
  onBack?: () => void;
}

export default function JudgmentDetailSkeleton({}: JudgmentDetailSkeletonProps) {
  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 lg:px-8" aria-busy>
      {/* actions — the tools layout already provides the Back control */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <div className="flex animate-pulse items-center gap-2">
          <div className="h-9 w-28 rounded-md bg-[#E5E7EB]" />
          <div className="h-9 w-20 rounded-md bg-[#E5E7EB]" />
          <div className="h-9 w-32 rounded-md bg-[#D1D5DB]" />
        </div>
      </div>

      <div className="mt-6 animate-pulse">
        {/* case header */}
        <div className="border-b border-[#E5E7EB] pb-6">
          <div className="h-3 w-56 rounded bg-[#E5E7EB]" />
          <div className="mt-3 h-7 w-4/5 rounded bg-[#D1D5DB]" />
          <div className="mt-2 h-7 w-2/5 rounded bg-[#D1D5DB]" />
          <div className="mt-3 h-3 w-64 rounded bg-[#F3F4F6]" />

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <div key={i}>
                <div className="h-2.5 w-16 rounded bg-[#E5E7EB]" />
                <div className="mt-2 h-3 w-full rounded bg-[#F3F4F6]" />
                <div className="mt-1.5 h-3 w-3/4 rounded bg-[#F3F4F6]" />
              </div>
            ))}
          </div>
        </div>

        {/* ratio */}
        <div className="mt-8">
          <div className="h-4 w-32 rounded bg-[#E5E7EB]" />
          <div className="mt-3 border-l-2 border-[#E5E7EB] pl-4">
            <div className="h-3.5 w-full rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-3.5 w-11/12 rounded bg-[#F3F4F6]" />
            <div className="mt-2 h-3.5 w-2/3 rounded bg-[#F3F4F6]" />
          </div>
        </div>

        {/* headnotes */}
        <div className="mt-8">
          <div className="h-4 w-24 rounded bg-[#E5E7EB]" />
          <div className="mt-3 divide-y divide-[#E5E7EB] border-y border-[#E5E7EB]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="py-3.5">
                <div className="h-3 w-full rounded bg-[#F3F4F6]" />
                <div className="mt-2 h-3 w-5/6 rounded bg-[#F3F4F6]" />
              </div>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className="mt-10 flex items-center gap-5 border-b border-[#E5E7EB] pb-2.5">
          <div className="h-3.5 w-24 rounded bg-[#D1D5DB]" />
          <div className="h-3.5 w-28 rounded bg-[#F3F4F6]" />
          <div className="h-3.5 w-24 rounded bg-[#F3F4F6]" />
        </div>

        <div className="mt-5 h-80 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]" />
      </div>
    </div>
  );
}
