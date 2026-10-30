/**
 * Shared styling for the Judiciary Tools surfaces
 * (home showcase section + /tools directory).
 *
 * Deliberately small: one button scale, one type scale, one border colour.
 * Both surfaces import from here so they cannot drift apart.
 */
import { cn } from '@/lib/utils';
import {
  BookOpen,
  FileCheck2,
  FileText,
  Gavel,
  Languages,
  Scale,
  Search,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

/* ---------------------------------------------------------------- palette */

export const TOOL_COLORS = {
  navy: '#0B2242',
  navySoft: '#1B3A63',
  muted: '#6B7280',
  line: '#E5E7EB',
} as const;

/* ------------------------------------------------------------- typography */

export const toolType = {
  /** Page / section heading. */
  title: 'font-merriweather text-xl sm:text-2xl font-bold tracking-[-0.01em] text-[#0B2242]',
  /** Card heading. */
  cardTitle: 'font-ui text-[15px] font-semibold tracking-[-0.005em] text-[#0B2242]',
  /** Supporting copy under a heading. */
  lead: 'font-ui text-[13.5px] leading-[1.65] text-[#6B7280]',
  /** Copy inside a card. */
  body: 'font-ui text-[13px] leading-[1.6] text-[#6B7280]',
  /** Small print: counts, timings, labels. */
  meta: 'font-ui text-[12px] text-[#9CA3AF]',
} as const;

/* ---------------------------------------------------------------- buttons */

type ButtonVariant = 'solid' | 'outline' | 'link';

const BUTTON_BASE =
  'group/btn inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-ui text-[13px] font-medium ' +
  'transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B2242]/25 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50';

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  solid: 'h-10 px-4 bg-[#0B2242] text-white hover:bg-[#1B3A63]',
  outline: 'h-10 px-4 border border-[#E5E7EB] bg-white text-[#0B2242] hover:border-[#0B2242]',
  link: 'text-[#0B2242] hover:text-[#1B3A63]',
};

export function toolButton(variant: ButtonVariant = 'solid', extra?: string) {
  return cn(BUTTON_BASE, BUTTON_VARIANTS[variant], extra);
}

/** Arrow inside a button or link. */
export const toolArrow =
  'size-3.5 transition-transform duration-150 group-hover/btn:translate-x-0.5 motion-reduce:transition-none';

/* ------------------------------------------------------------------ pills */

export function toolPill(active: boolean, extra?: string) {
  return cn(
    'inline-flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 font-ui text-[13px] whitespace-nowrap',
    'transition-colors duration-150 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0B2242]/25',
    active
      ? 'bg-[#0B2242] text-white'
      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0B2242]',
    extra,
  );
}

/* ------------------------------------------------------------- icon lookup */

export const TOOL_ICONS: Record<string, LucideIcon> = {
  Search,
  FileText,
  Gavel,
  FileCheck2,
  Languages,
  Scale,
  BookOpen,
  ShieldAlert: ShieldCheck,
  Briefcase: Scale,
};

export function toolIcon(name?: string): LucideIcon {
  return (name && TOOL_ICONS[name]) || Scale;
}
