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
  meta,
  comingSoon = false,
  className,
}: ToolCardProps) {
  const shell = 'flex h-full flex-col rounded-lg border border-[#E5E7EB] bg-white p-5';

  if (comingSoon) {
    return (
      <div aria-disabled className={cn(shell, 'bg-[#FAFAFA]', className)}>
        <Icon className="size-5 text-[#9CA3AF]" strokeWidth={1.75} aria-hidden />

        <h3 className={cn(toolType.cardTitle, 'mt-4 text-[#6B7280]')}>{title}</h3>
        <p className={cn(toolType.body, 'mt-1.5 line-clamp-2 text-[#9CA3AF]')}>{description}</p>

        <div className="mt-auto pt-5">
          <span className={cn(toolType.meta, 'font-medium')}>Coming soon</span>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        shell,
        'group transition-colors duration-150 hover:border-[#0B2242]',
        'focus-visible:border-[#0B2242] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B2242]/20',
        className,
      )}
    >
      <Icon
        className="size-5 text-[#0B2242] transition-colors duration-150"
        strokeWidth={1.75}
        aria-hidden
      />

      <h3 className={cn(toolType.cardTitle, 'mt-4')}>{title}</h3>
      <p className={cn(toolType.body, 'mt-1.5 line-clamp-2')}>{description}</p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-5">
        <span className="inline-flex items-center gap-1.5 font-ui text-[13px] font-medium text-[#0B2242]">
          {actionLabel}
          <ArrowRight
            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
            aria-hidden
          />
        </span>
        {meta && <span className={cn(toolType.meta, 'truncate')}>{meta}</span>}
      </div>
    </Link>
  );
}
