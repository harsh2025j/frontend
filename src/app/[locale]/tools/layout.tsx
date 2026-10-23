'use client';

import React from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const handleBack = () => {
    // If browser has history, use router.back() to return to previous page where user came from
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      // Graceful dynamic fallback if opened directly without prior history
      const isHub = pathname === `/${locale}/tools` || pathname === `/tools`;
      router.push(isHub ? `/${locale}` : `/${locale}/tools`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Top Left Navigation Bar with dynamic Back button aligned with base content */}
      <div className="no-print no-print-bar no-print-area print:hidden border-b border-[#E2E8F0]/70 bg-white/80 backdrop-blur-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="group inline-flex items-center gap-2 rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-1.5 text-xs font-bold text-[#0B2242] shadow-2xs hover:bg-[#F1F5F9] hover:border-[#0B2242] transition-all cursor-pointer"
            title="Go back to previous page"
          >
            <ArrowLeft className="size-4 text-[#64748B] group-hover:text-[#0B2242] group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-[#64748B]">
            <span className="hidden sm:inline">Sajjad Husain Law Associates</span>
            <span className="hidden sm:inline text-[#CBD5E1]">·</span>
            <span className="font-semibold text-[#0B2242]">Judiciary Workspace</span>
          </div>
        </div>
      </div>

      {/* Base Content */}
      <main>{children}</main>
    </div>
  );
}
