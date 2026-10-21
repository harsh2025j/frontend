'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Scale,
  Search,
  FileText,
  Gavel,
  FileCheck2,
  Languages,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function JudiciaryToolsSection() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const tools = [
    {
      id: 'research',
      number: '01',
      title: 'Supreme Court Precedents & Ratio Research',
      badge: '50k+ SCR Archive',
      description:
        'Instant precedent search across 50,000+ Supreme Court judgments. Extract ratio decidendi in context with binding citations.',
      actionText: 'Search Precedents',
      href: `/${locale}/tools/research`,
      icon: Search,
    },
    {
      id: 'drafting',
      number: '02',
      title: 'AI Legal Drafting Studio',
      badge: 'High Court Formats',
      description:
        'Turn matter facts, jurisdiction, grounds, and prayers into a disciplined review-ready first draft for Article 226/32 petitions and notices.',
      actionText: 'Launch Drafting Studio',
      href: `/${locale}/tools/drafting`,
      icon: FileText,
    },
    {
      id: 'mediation',
      number: '03',
      title: 'Mediation & Out-of-Court Settlement',
      badge: 'Order XXIII R3 CPC',
      description:
        'Turn commercial disputes, claim amounts, and desired outcomes into a 5-part balanced term sheet enforceable under the Mediation Act 2023.',
      actionText: 'Build Term Sheet',
      href: `/${locale}/tools/mediation`,
      icon: Gavel,
    },
    {
      id: 'documents',
      number: '04',
      title: 'Legal Document Health Check',
      badge: '3-Layer Risk Audit',
      description:
        'Diagnostic risk audit spotting missing arbitration seats, uncapped indemnities, unilateral terminations, and compliance traps.',
      actionText: 'Audit Document',
      href: `/${locale}/tools/documents`,
      icon: FileCheck2,
    },
    {
      id: 'translation',
      number: '05',
      title: 'Vernacular Translation & OCR',
      badge: '22 Indian Languages',
      description:
        'Convert vernacular court orders, police FIRs, revenue records, and deeds into structured English while preserving citations and sections.',
      actionText: 'Translate Document',
      href: `/${locale}/tools/translation`,
      icon: Languages,
    },
  ];

  return (
    <section className="bg-linear-to-b from-[#FAFBFE] via-white to-[#F8FAFC] py-16 lg:py-24 border-y border-[#E2E8F0]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Authority Badge */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E2E8F0]">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CAA438]/40 bg-[#FFFDF5] px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-[#0B2242] shadow-2xs mb-3">
              <Sparkles className="size-3.5 text-[#CAA438]" />
              <span>Sajjad Husain Law Associates · Judicial Workspace</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-merriweather text-[#0B2242] tracking-tight">
              Judiciary AI Tools Suite
            </h2>

            <p className="mt-3 text-sm sm:text-base text-[#475569] leading-relaxed">
              Purpose-built legal intelligence tools designed for Indian advocates, judges, and corporate counsel. Move from matter facts to persuasive pleadings with zero hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${locale}/tools`}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B2242] px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-[#15345E] shadow-xs transition-colors"
            >
              <span>Explore All Tools</span>
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* 5 Core Tools Cards Grid */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                className="group relative flex flex-col justify-between rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-[#0B2242] hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-lg bg-[#EAEFF9] text-[#0B2242] group-hover:bg-[#0B2242] group-hover:text-white transition-colors">
                      <Icon className="size-5" />
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#94A3B8]">
                        {tool.number}
                      </span>
                      <span className="rounded bg-[#F8FAFC] border border-[#E2E8F0] px-2 py-0.5 text-[10px] font-bold text-[#0B2242]">
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="mt-5 text-base sm:text-lg font-bold font-merriweather text-[#0B2242] group-hover:text-[#1D4ED8] transition-colors">
                    <Link href={tool.href}>{tool.title}</Link>
                  </h3>

                  <p className="mt-2.5 text-xs sm:text-sm text-[#475569] leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <Link
                    href={tool.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B2242] group-hover:text-[#1D4ED8] transition-colors"
                  >
                    <span>{tool.actionText}</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            );
          })}

          {/* Directory Summary Card */}
          <div className="flex flex-col justify-between rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-6 text-center">
            <div>
              <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-white border border-[#CBD5E1] text-[#0B2242]">
                <Scale className="size-5 text-[#CAA438]" />
              </div>
              <h4 className="mt-4 font-merriweather text-base font-bold text-[#0B2242]">
                Future-Ready Judiciary Suite
              </h4>
              <p className="mt-2 text-xs text-[#64748B] leading-relaxed">
                Extensible workspace architected to scale up to 20+ specialized judicial & compliance tools as new workflows are introduced.
              </p>
            </div>

            <div className="mt-6">
              <Link
                href={`/${locale}/tools`}
                className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg bg-[#0B2242] px-4 py-2 text-xs font-bold text-white hover:bg-[#15345E] shadow-2xs"
              >
                <span>Open Full Tools Directory</span>
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
