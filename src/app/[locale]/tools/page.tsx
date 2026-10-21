'use client';

import React, { useState } from 'react';
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
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import { TOOLS_REGISTRY, TOOL_CATEGORIES } from '@/data/toolsRegistry';

const ICON_MAP = {
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

export default function ToolsHubPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const [selectedCategory, setSelectedCategory] = useState<string>('All Tools');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = TOOLS_REGISTRY.filter((tool) => {
    const matchesCategory =
      selectedCategory === 'All Tools' || tool.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.features.some((f) => f.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 pb-24">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B2242] font-merriweather">
            Judicial Intelligence Tools
          </h1>
          <p className="mt-2 text-sm text-[#64748B]">
            Precedents, drafting, settlements, audits, and vernacular translation.
          </p>
        </div>

        {/* Search */}
        <div className="mt-8 mx-auto max-w-xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools"
            className="w-full rounded-full border border-[#E2E8F0] bg-white pl-11 pr-4 py-3 text-sm text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:ring-2 focus:ring-[#0B2242]/10 focus:outline-hidden"
          />
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2">
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#0B2242] text-white'
                  : 'text-[#475569] hover:bg-[#F1F5F9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTools.map((tool) => {
            const IconComponent = (ICON_MAP as any)[tool.iconName] || Scale;
            const toolHref = `/${locale}${tool.route}`;

            return (
              <Link
                key={tool.id}
                href={toolHref}
                className="group flex flex-col rounded-xl border border-[#E2E8F0] bg-white p-5 transition-colors hover:border-[#0B2242]"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-[#F1F5F9] text-[#0B2242]">
                  <IconComponent className="size-5" />
                </div>

                <h3 className="mt-4 text-sm font-semibold text-[#0B2242]">
                  {tool.title}
                </h3>

                <p className="mt-1.5 text-xs text-[#64748B] leading-relaxed line-clamp-2">
                  {tool.description}
                </p>

                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-[#0B2242]">
                  <span>{tool.primaryAction}</span>
                  <ArrowRight className="size-3.5" />
                </div>
              </Link>
            );
          })}
        </div>

        {filteredTools.length === 0 && (
          <p className="mt-16 text-center text-sm text-[#94A3B8]">
            No tools match your search.
          </p>
        )}
      </div>
    </div>
  );
}
