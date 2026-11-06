'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toolType } from './toolsTheme';

export interface ToolCardProps {
  href: string;
  title: string;
  description: string;
  actionLabel: string;
  icon: LucideIcon;
  category?: string;
  badge?: string;
  /** Small grey line under the description, e.g. "< 1 second". */
  meta?: string;
  comingSoon?: boolean;
  className?: string;
}

export default function ToolCard({
  href,
  title,
  description,
  actionLabel,
  icon: Icon,
  category,
  badge,
  meta,
  comingSoon = false,
  className,
}: ToolCardProps) {
  const shell = 'flex h-full flex-col rounded-lg border border-[#E5E7EB] bg-white p-5 sm:p-6 transition-all duration-200';

  if (comingSoon) {
    return (
      <div
        aria-disabled="true"
        className={cn(
          shell,
          'bg-[#FAFAFA] border-dashed border-[#E5E7EB] cursor-not-allowed select-none opacity-80',
          className,
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="size-11 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
            <Icon className="size-5 stroke-[1.75]" aria-hidden />
          </div>
          <span className="font-ui text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 rounded-full">
            In Development
          </span>
        </div>

        <h3 className="font-heading text-[16px] sm:text-[17px] font-semibold text-[#6B7280] mt-4 mb-2 leading-snug">
          {title}
        </h3>
        <p className="font-body text-[13.5px] leading-[1.6] text-[#9CA3AF] line-clamp-2 mb-4 flex-1">
          {description}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <span className="font-ui text-[12px] font-medium text-gray-400">
            Coming soon
          </span>
          {badge && (
            <span className="font-ui text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 truncate max-w-[150px]">
              {badge}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        shell,
        'group hover:border-[#C9A227]',
        'focus-visible:border-[#C9A227] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#C9A227]/25',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Real Legal Icon Medallion */}
        <div className="size-11 rounded-lg bg-[#FAF8F5] border border-slate-200/90 flex items-center justify-center text-[#0B2242] transition-colors duration-200 group-hover:border-[#C9A227] group-hover:bg-[#FAF6EC] group-hover:text-[#C9A227] shrink-0">
          <Icon className="size-5 stroke-[1.75]" aria-hidden />
        </div>

        {/* Real Legal Domain Pill */}
        {category && (
          <span className="font-ui text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-0.5 rounded-full transition-colors group-hover:text-[#0B2242] group-hover:border-slate-300 truncate max-w-[170px]">
            {category}
          </span>
        )}
      </div>

      <h3 className="font-heading text-[16px] sm:text-[17px] font-semibold text-[#0B2242] mt-4 mb-2 transition-colors duration-200 group-hover:text-[#C9A227] leading-snug">
        {title}
      </h3>
      <p className="font-body text-[13.5px] leading-[1.6] text-slate-600 line-clamp-2 mb-4 flex-1">
        {description}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 font-ui text-[13px] font-medium text-[#0B2242] transition-colors duration-200 group-hover:text-[#C9A227]">
          {actionLabel}
          <ArrowRight
            className="size-3.5 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden
          />
        </span>
        {badge ? (
          <span className="font-ui text-[11px] font-medium text-slate-500 bg-slate-100/70 px-2 py-0.5 rounded border border-slate-200/60 truncate max-w-[150px]">
            {badge}
          </span>
        ) : meta ? (
          <span className={cn(toolType.meta, 'truncate')}>{meta}</span>
        ) : null}
      </div>
    </Link>
  );
}
