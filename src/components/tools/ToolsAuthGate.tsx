'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '@/data/features/auth/useAuthActions';
import { TOOLS_REGISTRY } from '@/data/toolsRegistry';
import { toolButton, toolType } from './toolsTheme';

/**
 * Tool pages are for signed-in users. The tools directory stays public —
 * this only wraps an individual tool, and sends the visitor back to it
 * once they have logged in.
 */
export default function ToolsAuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const { isAuthenticated } = useAuth();

  // Redux restores the session from localStorage in an effect, so on the first
  // client render a logged-in user still looks logged out. Read the token
  // ourselves before deciding, otherwise the prompt flashes on every visit.
  const [resolved, setResolved] = useState(false);
  const [hasStoredToken, setHasStoredToken] = useState(false);

  useEffect(() => {
    try {
      setHasStoredToken(Boolean(localStorage.getItem('token')));
    } catch {
      setHasStoredToken(false);
    }
    setResolved(true);
  }, []);

  if (!resolved) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center" aria-busy>
        <span className="size-7 animate-spin rounded-full border-2 border-[#0B2242] border-t-[#C9A227]" />
      </div>
    );
  }

  if (isAuthenticated || hasStoredToken) {
    return <>{children}</>;
  }

  const slug = pathname?.split('/').filter(Boolean)[2];
  const toolName = TOOLS_REGISTRY.find((t) => t.slug === slug)?.shortTitle;
  const target = encodeURIComponent(pathname || `/${locale}/tools`);

  return (
    <div className="relative flex min-h-[calc(100dvh-44px)] items-center justify-center overflow-hidden bg-[#FAF8F5] bg-[url('/images/legal-auth-bg.webp')] bg-cover bg-top bg-no-repeat p-4 select-none">
      {/* wash so the card stays readable over the photograph */}
      <div aria-hidden className="absolute inset-0 bg-[#0B2242]/15" />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white/95 p-7 text-center shadow-[0_24px_60px_-20px_rgba(11,34,66,0.45)] backdrop-blur-sm sm:p-9">
        <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-[#C9A227]/40 bg-[#FAF6EC] text-[#C9A227]">
          <Lock className="size-5" strokeWidth={1.75} aria-hidden />
        </span>

        <h1 className={`${toolType.title} mt-4`}>
          {toolName ? `Log in to use ${toolName}` : 'Log in to use this tool'}
        </h1>

        <p className={`${toolType.lead} mt-2`}>
          Legal tools are available to signed-in users. We&apos;ll bring you straight back
          here once you&apos;re in.
        </p>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link
            href={`/${locale}/auth/login?redirect=${target}`}
            className={toolButton('solid', 'h-11 flex-1')}
          >
            Log in
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
          <Link
            href={`/${locale}/auth/signup?redirect=${target}`}
            className={toolButton('outline', 'h-11 flex-1')}
          >
            Create account
          </Link>
        </div>

        <Link
          href={`/${locale}/tools`}
          className="mt-5 inline-block font-ui text-[13px] text-[#6B7280] underline underline-offset-4 transition-colors hover:text-[#0B2242]"
        >
          Back to all tools
        </Link>
      </div>
    </div>
  );
}
