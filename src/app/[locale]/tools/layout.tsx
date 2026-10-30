'use client';

import React from 'react';
import { useRouter, usePathname, useParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import ToolsAuthGate from '@/components/tools/ToolsAuthGate';

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const isHub = pathname === `/${locale}/tools` || pathname === '/tools';

  const handleBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(isHub ? `/${locale}` : `/${locale}/tools`);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="no-print no-print-bar no-print-area border-b border-[#E5E7EB] bg-white print:hidden">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={handleBack}
            className="group -ml-1 inline-flex cursor-pointer items-center gap-1.5 rounded px-1 py-1 font-ui text-[13px] text-[#6B7280] transition-colors duration-150 hover:text-[#0B2242] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B2242]/25"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-150 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
            Back
          </button>

        </div>
      </div>

      {/* the directory is public; an individual tool requires a login */}
      <main>{isHub ? children : <ToolsAuthGate>{children}</ToolsAuthGate>}</main>
    </div>
  );
}
