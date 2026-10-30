'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import ToolCard from '@/components/tools/ToolCard';
import { toolArrow, toolButton, toolIcon, toolType } from '@/components/tools/toolsTheme';
import { TOOLS_REGISTRY } from '@/data/toolsRegistry';

export default function JudiciaryToolsSection() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <section className="border-y border-[#E5E7EB] bg-white py-14 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <h2 className={toolType.title}>Legal tools</h2>
            <p className={`${toolType.lead} mt-2`}>
              Research, drafting, review and translation — built for Indian courts.
            </p>
          </div>

          <Link href={`/${locale}/tools`} className={toolButton('outline')}>
            View all tools
            <ArrowRight className={toolArrow} aria-hidden />
          </Link>
        </div>

        {/* grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS_REGISTRY.map((tool) => (
            <ToolCard
              key={tool.id}
              href={`/${locale}${tool.route}`}
              title={tool.shortTitle}
              description={tool.description}
              actionLabel={tool.primaryAction}
              icon={toolIcon(tool.iconName)}
              comingSoon={tool.status === 'coming_soon'}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
