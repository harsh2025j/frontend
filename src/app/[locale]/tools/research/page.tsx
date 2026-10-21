'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Search,
  X,
  SlidersHorizontal,
  BookOpen,
  RefreshCw,
  Sparkles,
  ChevronRight,
  Gavel,
  Scale,
  FileText,
  AlertCircle,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { Precedent } from '@/data/services/tools-service/types';
import CustomSelect from '@/components/ui/CustomSelect';

const ACTIVE_SEARCH_STORAGE_KEY = 'legaltech_precedent_active_search';
const CACHE_STORAGE_PREFIX = 'legaltech_precedent_cache_';

export default function ResearchPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  const [query, setQuery] = useState('');
  const [refineQuery, setRefineQuery] = useState('');
  const [courtFilter, setCourtFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [results, setResults] = useState<Precedent[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [searchedQuery, setSearchedQuery] = useState('');
  const [isRestoredFromCache, setIsRestoredFromCache] = useState(false);

  // 1. Session Storage Restoration on Mount (Instant Back Navigation Without Re-hitting API)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = sessionStorage.getItem(ACTIVE_SEARCH_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.results) && parsed.results.length > 0) {
            setQuery(parsed.query || '');
            setSearchedQuery(parsed.query || '');
            setCourtFilter(parsed.courtFilter || '');
            setResults(parsed.results);
            setHasSearched(true);
            setIsRestoredFromCache(true);
          }
        }
      }
    } catch (err) {
      console.warn('Could not restore precedent search from session:', err);
    }
  }, []);

  // 2. Core Search Execution with Minimum 3 Chars Check & Session Caching
  const executeSearch = async (searchQuery: string, targetCourt?: string) => {
    const trimmed = (searchQuery ?? query).trim();

    // Guardrail: Minimum 3 characters
    if (trimmed.length < 3) {
      setValidationError('Please enter at least 3 characters to search precedents.');
      return;
    }
    setValidationError(null);

    const activeCourt = targetCourt !== undefined ? targetCourt : courtFilter;
    const cacheKey = `${CACHE_STORAGE_PREFIX}${encodeURIComponent(activeCourt || 'all')}_${encodeURIComponent(trimmed.toLowerCase())}`;

    // A. Check Session Cache to prevent redundant LLM API calls
    try {
      if (typeof window !== 'undefined') {
        const cachedJson = sessionStorage.getItem(cacheKey);
        if (cachedJson) {
          const parsedCache = JSON.parse(cachedJson);
          if (parsedCache && Array.isArray(parsedCache.results)) {
            setResults(parsedCache.results);
            setHasSearched(true);
            setSearchedQuery(trimmed);
            setIsRestoredFromCache(true);

            // Persist as current active search
            sessionStorage.setItem(
              ACTIVE_SEARCH_STORAGE_KEY,
              JSON.stringify({
                query: trimmed,
                courtFilter: activeCourt,
                results: parsedCache.results,
                hasSearched: true,
              })
            );
            return;
          }
        }
      }
    } catch (cacheErr) {
      console.warn('Session cache read error:', cacheErr);
    }

    // B. Fetch from API if not cached in session
    setLoading(true);
    setIsRestoredFromCache(false);
    try {
      const data = await toolsService.searchPrecedents(trimmed, activeCourt || undefined);
      setResults(data);
      setHasSearched(true);
      setSearchedQuery(trimmed);

      // Save to Session Storage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify({ results: data, timestamp: Date.now() }));
          sessionStorage.setItem(
            ACTIVE_SEARCH_STORAGE_KEY,
            JSON.stringify({
              query: trimmed,
              courtFilter: activeCourt,
              results: data,
              hasSearched: true,
            })
          );
        } catch (saveErr) {
          console.warn('Session storage quota exceeded or unavailable:', saveErr);
        }
      }
    } catch (err: any) {
      console.error('Precedent search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCourtFilterChange = (newCourt: string) => {
    setCourtFilter(newCourt);
    if (hasSearched && query.trim().length >= 3) {
      executeSearch(query, newCourt);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setSearchedQuery('');
    setValidationError(null);
    setIsRestoredFromCache(false);
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(ACTIVE_SEARCH_STORAGE_KEY);
      }
    } catch (e) {}
  };

  const handleRefine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refineQuery.trim()) return;
    const combined = query.trim() ? `${query.trim()} (${refineQuery.trim()})` : refineQuery.trim();
    setQuery(combined);
    executeSearch(combined);
    setRefineQuery('');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Search Input Box */}
      <div className="rounded-xl border border-[#CBD5E1] bg-white p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <span className="flex size-7 items-center justify-center rounded bg-[#0B2242] text-white">
            <Search className="size-4 text-[#CAA438]" />
          </span>
          <h1 className="font-merriweather text-lg font-bold text-[#0B2242]">
            Supreme Court & High Court Precedent Search
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex flex-col sm:flex-row items-center gap-3"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3.5 size-4 text-[#64748B]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (validationError && e.target.value.trim().length >= 3) {
                  setValidationError(null);
                }
              }}
              placeholder="Enter legal query, doctrine, or section (min. 3 characters)..."
              className={`w-full rounded-lg border bg-white pl-10 pr-9 py-2.5 text-xs sm:text-sm text-[#0B2242] placeholder:text-[#94A3B8] focus:ring-2 focus:outline-hidden transition-colors ${
                validationError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-100'
                  : 'border-[#CBD5E1] focus:border-[#0B2242] focus:ring-[#0B2242]/10'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#0B2242]"
                title="Clear input"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              type="submit"
              disabled={loading || (query.trim().length > 0 && query.trim().length < 3)}
              className="flex-1 sm:flex-none rounded-lg bg-[#0B2242] hover:bg-[#15345E] px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-xs cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Search Precedents</span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none rounded-lg border border-[#CBD5E1] bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#0B2242] hover:bg-[#F8FAFC] transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <SlidersHorizontal className="size-3.5 text-[#64748B]" />
              <span>Filters</span>
            </button>
          </div>
        </form>

        {/* Validation Warning Alert */}
        {validationError && (
          <div className="mt-2.5 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
            <AlertCircle className="size-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Quick Example Query Suggestions */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-[#64748B]">Try searching:</span>
          {[
            'Basic structure doctrine',
            'Anticipatory bail PMLA',
            'Section 11 Arbitration Act',
            'Article 21 Right to Privacy',
          ].map((promptText) => (
            <button
              key={promptText}
              type="button"
              onClick={() => {
                setQuery(promptText);
                executeSearch(promptText);
              }}
              className="rounded-full border border-[#CBD5E1] bg-[#F8FAFC] px-2.5 py-1 text-[11px] font-medium text-[#0B2242] hover:border-[#0B2242] hover:bg-[#EEF2F6] transition-colors cursor-pointer"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Collapsible Filter Bar */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center gap-4 text-xs">
            <label className="font-semibold text-[#0B2242]">Filter Jurisdiction / Court:</label>
            <div className="w-72">
              <CustomSelect
                value={courtFilter}
                onChange={(val) => handleCourtFilterChange(val)}
                options={[
                  { label: 'All Courts (Supreme Court & High Courts)', value: '' },
                  { label: 'Supreme Court of India', value: 'Supreme Court of India' },
                  { label: 'High Courts', value: 'High Court' },
                ]}
                placeholder="All Courts (Supreme Court & High Courts)"
                searchable={false}
              />
            </div>
          </div>
        )}

        {/* Refine Search Box - only visible once a search has been executed */}
        {hasSearched && (
          <div className="mt-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <span className="block font-mono text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5">
              ☐ Refine / Sub-Filter Query
            </span>
            <form onSubmit={handleRefine} className="flex items-center gap-2">
              <input
                type="text"
                value={refineQuery}
                onChange={(e) => setRefineQuery(e.target.value)}
                placeholder='Add a condition — e.g. "only 5-judge bench", "after 2015", "quashing of FIR"...'
                className="flex-1 rounded-md border border-[#CBD5E1] bg-white px-3 py-2 text-xs text-[#0B2242] placeholder:text-[#94A3B8] focus:border-[#0B2242] focus:outline-hidden"
              />
              <button
                type="submit"
                className="rounded-md bg-[#64748B] hover:bg-[#475569] px-4 py-2 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Refine
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Main Body: Welcome Hero / Loading / Empty / Results */}
      {!hasSearched && !loading ? (
        <div className="mt-8 rounded-2xl border border-dashed border-[#CBD5E1] bg-gradient-to-b from-[#F8FAFC] to-white p-8 sm:p-12 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-[#0B2242]/5 border border-[#0B2242]/10 text-[#0B2242]">
            <Scale className="size-7 text-[#CAA438]" />
          </div>
          <h2 className="mt-4 font-merriweather text-xl font-bold text-[#0B2242]">
            Search Indian Precedents & Legal Ratios
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm text-[#64748B] leading-relaxed">
            Enter any legal doctrine, constitutional provision, or case title above (at least 3 characters) to research landmark Supreme Court and High Court precedents with certified SCR citations and authoritative ratios.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-[#475569]">
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 border border-[#E2E8F0] shadow-xs">
              <BookOpen className="size-4 text-[#CAA438]" />
              <span className="font-medium">Supreme Court Law Reports</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 border border-[#E2E8F0] shadow-xs">
              <Sparkles className="size-4 text-[#CAA438]" />
              <span className="font-medium">Direct Ratio Decidendi</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 border border-[#E2E8F0] shadow-xs">
              <ShieldCheck className="size-4 text-[#CAA438]" />
              <span className="font-medium">Zero Redundant API Calls</span>
            </div>
          </div>
        </div>
      ) : loading ? (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full bg-[#0B2242] text-white px-4 py-2 shadow-md border border-[#CAA438]/40">
              <RefreshCw className="size-3.5 text-[#CAA438] animate-spin" />
              <span className="text-xs font-bold font-merriweather">
                Searching Precedents Index & Repository...
              </span>
              <span className="text-[11px] text-[#94A3B8] font-mono">
                for &ldquo;{query}&rdquo;
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="flex flex-col justify-between rounded-xl border border-[#CBD5E1] bg-white p-6 shadow-xs space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 w-20 rounded bg-slate-200" />
                    <div className="h-4 w-24 rounded bg-slate-100" />
                  </div>
                  <div className="mt-3.5 space-y-2">
                    <div className="h-4 w-11/12 rounded bg-slate-300" />
                    <div className="h-4 w-3/4 rounded bg-slate-200" />
                  </div>
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                  <div className="mt-3 h-5 w-28 rounded bg-[#EAEFF9]" />
                  <div className="mt-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] p-3 space-y-1.5">
                    <div className="h-3 w-full rounded bg-slate-200" />
                    <div className="h-3 w-5/6 rounded bg-slate-200" />
                  </div>
                </div>
                <div className="pt-4 border-t border-[#F1F5F9] flex items-center justify-between">
                  <div className="h-4 w-24 rounded bg-slate-200" />
                  <div className="h-4 w-28 rounded bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[#E2E8F0] bg-white p-12 text-center">
          <BookOpen className="mx-auto size-10 text-[#94A3B8]" />
          <h3 className="mt-3 text-base font-bold text-[#0B2242] font-merriweather">
            No Precedents Found
          </h3>
          <p className="mt-1 text-xs text-[#64748B]">
            No matching precedents found for &ldquo;{searchedQuery}&rdquo;. Try broader terms or check the spelling.
          </p>
        </div>
      ) : (
        <>
          {/* Results Header */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <h2 className="font-merriweather text-xl font-bold tracking-tight text-[#0B2242]">
                {results.length} {results.length === 1 ? 'Judgment' : 'Judgments'} Found
              </h2>
              <span className="rounded-full bg-[#EAEFF9] text-[#0B2242] font-semibold text-xs px-3 py-0.5 border border-[#CBD5E1]">
                Official Law Reports Index
              </span>
            </div>

            {isRestoredFromCache && (
              <span className="inline-flex items-center gap-1.5 text-xs text-[#64748B] bg-[#F8FAFC] px-2.5 py-1 rounded-md border border-[#E2E8F0]">
                <Database className="size-3 text-[#10B981]" />
                <span>Restored from session</span>
              </span>
            )}
          </div>

          {/* Results Grid */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((item, index) => {
              const isMostRelevant = index === 0;
              const displayCitations =
                item.citation ||
                [item.citations?.neutral, item.citations?.scr].filter(Boolean).join(' • ') ||
                (item.year ? `${item.year} INSC` : '');

              const detailHref = `/${locale}/tools/research/${item.slug || item.id}`;

              return (
                <div
                  key={item.id || index}
                  className={`relative flex flex-col justify-between rounded-xl border bg-white p-6 shadow-xs transition-all duration-300 hover:border-[#0B2242] hover:shadow-md ${
                    isMostRelevant ? 'border-[#0B2242] ring-1 ring-[#0B2242]/20' : 'border-[#CBD5E1]'
                  }`}
                >
                  {isMostRelevant && (
                    <div className="absolute -top-3 left-6">
                      <span className="rounded-full bg-[#0B2242] text-white font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 shadow-xs">
                        ★ Key Precedent
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Court & Year */}
                    <div className={`flex items-center justify-between text-xs font-mono ${isMostRelevant ? 'mt-2' : ''}`}>
                      <span className="rounded bg-[#F1F5F9] text-[#0B2242] font-bold px-2 py-0.5 text-[11px]">
                        {item.court?.includes('Supreme') ? 'SC' : item.court?.includes('High') ? 'HC' : 'COURT'}
                        {item.year ? ` • ${item.year}` : ''}
                      </span>
                      {typeof item.relevanceScore === 'number' && (
                        <span className="text-[#64748B] font-semibold text-xs">
                          Relevance: {item.relevanceScore.toFixed(1)}%
                        </span>
                      )}
                    </div>

                    {/* Case Title */}
                    <h3 className="mt-3.5 text-sm font-bold font-merriweather uppercase tracking-tight text-[#0B2242] line-clamp-2">
                      <Link href={detailHref} className="hover:text-[#1D4ED8] transition-colors">
                        {item.caseTitle || item.title}
                      </Link>
                    </h3>

                    {/* Citations */}
                    {displayCitations && (
                      <p className="mt-1 font-mono text-[11px] text-[#64748B] font-medium truncate">
                        {displayCitations}
                      </p>
                    )}

                    {/* Case Type Tag */}
                    {item.case_type && (
                      <div className="mt-2.5">
                        <span className="rounded bg-[#F8FAFC] text-[#475569] font-mono text-[10px] font-bold uppercase px-2 py-0.5 border border-[#E2E8F0]">
                          {item.case_type}
                        </span>
                      </div>
                    )}

                    {/* Snippet / Ratio extract */}
                    <div className="mt-3.5 text-xs text-[#334155] leading-relaxed line-clamp-4 font-sans">
                      {item.snippet ? (
                        <span dangerouslySetInnerHTML={{ __html: item.snippet }} />
                      ) : item.ratio ? (
                        <span>{item.ratio}</span>
                      ) : (
                        <span className="text-[#94A3B8] italic">
                          Official judgment text and ratio details available in full law report.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom: Court & Read link */}
                  <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-[#64748B] text-[11px]">
                      <BookOpen className="size-3.5 text-[#94A3B8]" />
                      <span className="truncate max-w-[150px]">{item.court || 'Supreme Court of India'}</span>
                    </span>

                    <Link
                      href={detailHref}
                      className="font-bold text-[#0B2242] hover:text-[#1D4ED8] flex items-center gap-1 text-xs transition-colors shrink-0"
                    >
                      <span>Read Full Ratio</span>
                      <ChevronRight className="size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
