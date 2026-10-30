'use client';

import React, { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import ToolCard from '@/components/tools/ToolCard';
import { toolIcon, toolPill, toolType } from '@/components/tools/toolsTheme';
import { TOOL_CATEGORIES, TOOLS_REGISTRY } from '@/data/toolsRegistry';

const ALL_TOOLS = 'All Tools';

export default function ToolsHubPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_TOOLS);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const query = searchQuery.trim().toLowerCase();

  const filteredTools = useMemo(
    () =>
      TOOLS_REGISTRY.filter((tool) => {
        const inCategory = selectedCategory === ALL_TOOLS || tool.category === selectedCategory;
        const inSearch =
          !query ||
          tool.title.toLowerCase().includes(query) ||
          tool.shortTitle.toLowerCase().includes(query) ||
          tool.tagline.toLowerCase().includes(query) ||
          tool.description.toLowerCase().includes(query) ||
          tool.features.some((f) => f.toLowerCase().includes(query));
        return inCategory && inSearch;
      }),
    [selectedCategory, query],
  );

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(ALL_TOOLS);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      {/* title left, search right — one row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={toolType.title}>Legal tools</h1>
          <p className={`${toolType.lead} mt-1`}>
            Research, drafting, review and translation — built for Indian courts.
          </p>
        </div>

        <div className="relative w-full shrink-0 sm:w-64">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#9CA3AF]"
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools"
            aria-label="Search tools"
            className="h-9 w-full rounded-md border border-[#E5E7EB] bg-white pr-8 pl-9 font-ui text-[13px] text-[#0B2242] transition-colors duration-150 placeholder:text-[#9CA3AF] focus:border-[#0B2242] focus:outline-hidden [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 inline-flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-[#9CA3AF] transition-colors hover:text-[#0B2242] focus-visible:outline-hidden"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          )}
        </div>
      </div>

      {/* filters left, count right — one row */}
      <div className="mt-4 flex items-center justify-between gap-4 border-b border-[#E5E7EB] pb-3">
        <div className="scrollbar-hide flex items-center gap-1 overflow-x-auto">
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={toolPill(selectedCategory === cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className={`${toolType.meta} hidden shrink-0 lg:block`}>
          {filteredTools.length} of {TOOLS_REGISTRY.length}
        </span>
      </div>

      {/* grid */}
      {filteredTools.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              href={`/${locale}${tool.route}`}
              title={tool.shortTitle}
              description={tool.description}
              actionLabel={tool.primaryAction}
              icon={toolIcon(tool.iconName)}
              meta={tool.status === 'coming_soon' ? undefined : tool.benchmarkTime}
              comingSoon={tool.status === 'coming_soon'}
            />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className={toolType.body}>No tools match “{searchQuery}”.</p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 cursor-pointer font-ui text-[13px] font-medium text-[#0B2242] underline underline-offset-4 hover:text-[#1B3A63]"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
