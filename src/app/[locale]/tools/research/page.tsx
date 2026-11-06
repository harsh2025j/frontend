'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { toolsService } from '@/data/services/tools-service/toolsService';
import { Precedent } from '@/data/services/tools-service/types';
import CustomSelect from '@/components/ui/CustomSelect';
import { toolButton, toolPill, toolType } from '@/components/tools/toolsTheme';

const EXAMPLE_QUERIES = [
  'Basic structure doctrine',
  'Anticipatory bail PMLA',
  'Section 11 Arbitration Act',
  'Article 21 Right to Privacy',
];

const COURT_OPTIONS = [
  { label: 'All courts', value: '' },
  { label: 'Supreme Court of India', value: 'Supreme Court of India' },
  { label: 'High Courts', value: 'High Court' },
];

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
                source: parsedCache.source || '',
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
      const { precedents, source } = await toolsService.searchPrecedents(
        trimmed,
        activeCourt || undefined,
      );
      setResults(precedents);
      setHasSearched(true);
      setSearchedQuery(trimmed);

      // Save to Session Storage
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ results: precedents, source, timestamp: Date.now() }),
          );
          sessionStorage.setItem(
            ACTIVE_SEARCH_STORAGE_KEY,
            JSON.stringify({
              query: trimmed,
              courtFilter: activeCourt,
              results: precedents,
              source,
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

  const courtLabel =
    COURT_OPTIONS.find((o) => o.value === courtFilter)?.label || 'All courts';

  return (
    <div className="mx-auto max-w-5xl px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      {/* page heading */}
      <h1 className={toolType.title}>Precedent research</h1>
      <p className={`${toolType.lead} mt-1`}>
        Search Supreme Court and High Court judgments — ratio decidendi with certified
        citations.
      </p>

      {/* search — sticks to the top so results can be refined while scrolling */}
      <div className="sticky top-0 z-20 -mx-4 mt-5 border-b border-[#E5E7EB] bg-[#F8FAFC]/95 px-4 py-3 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeSearch(query);
          }}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-[#9CA3AF]"
              aria-hidden
            />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (validationError && e.target.value.trim().length >= 3) {
                  setValidationError(null);
                }
              }}
              aria-label="Search precedents"
              aria-invalid={Boolean(validationError)}
              placeholder="Search a doctrine, section, or case title"
              className={`h-11 w-full rounded-md border bg-white pr-9 pl-10 font-ui text-sm text-[#0B2242] transition-colors duration-150 placeholder:text-[#9CA3AF] focus:outline-hidden ${
                validationError
                  ? 'border-[#DC2626] focus:border-[#DC2626]'
                  : 'border-[#E5E7EB] focus:border-[#0B2242]'
              }`}
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                aria-label="Clear search"
                className="absolute top-1/2 right-2.5 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded text-[#9CA3AF] transition-colors hover:text-[#0B2242] focus-visible:outline-hidden"
              >
                <X className="size-4" aria-hidden />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={loading || (query.trim().length > 0 && query.trim().length < 3)}
              className={toolButton('solid', 'h-11 flex-1 px-5 sm:flex-none')}
            >
              {loading ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" aria-hidden />
                  Searching
                </>
              ) : (
                'Search'
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className={toolButton('outline', 'h-11')}
            >
              <SlidersHorizontal className="size-3.5 text-[#6B7280]" aria-hidden />
              Filters
            </button>
          </div>
        </form>

        {validationError && (
          <p
            role="alert"
            className="mt-2 flex items-center gap-1.5 font-ui text-[12.5px] text-[#DC2626]"
          >
            <AlertCircle className="size-3.5 shrink-0" aria-hidden />
            {validationError}
          </p>
        )}

        {showFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="font-ui text-[13px] text-[#6B7280]">Court</label>
            <div className="w-64">
              <CustomSelect
                value={courtFilter}
                onChange={(val) => handleCourtFilterChange(val)}
                options={COURT_OPTIONS}
                placeholder="All courts"
                searchable={false}
              />
            </div>
          </div>
        )}

        {/* active filter stays visible even when the panel is closed */}
        {!showFilters && courtFilter && (
          <button
            type="button"
            onClick={() => handleCourtFilterChange('')}
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-[#EEF2F7] px-2 py-1 font-ui text-[12px] text-[#0B2242] transition-colors hover:bg-[#E3E9F2]"
          >
            {courtLabel}
            <X className="size-3" aria-hidden />
          </button>
        )}

        {hasSearched && (
          <form onSubmit={handleRefine} className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={refineQuery}
              onChange={(e) => setRefineQuery(e.target.value)}
              aria-label="Refine the current search"
              placeholder="Narrow it down — e.g. only 5-judge bench, after 2015"
              className="h-9 flex-1 rounded-md border border-[#E5E7EB] bg-white px-3 font-ui text-[13px] text-[#0B2242] placeholder:text-[#9CA3AF] focus:border-[#0B2242] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!refineQuery.trim()}
              className={toolButton('outline', 'h-9')}
            >
              Refine
            </button>
          </form>
        )}
      </div>

      {/* ------------------------------------------------- intro / loading / results */}
      {!hasSearched && !loading ? (
        <div className="mt-10 max-w-xl">
          <h2 className="font-ui text-[15px] font-semibold text-[#0B2242]">
            Start with a doctrine, a section, or a case name
          </h2>
          <p className={`${toolType.body} mt-1.5`}>
            Enter at least 3 characters. Results carry the court, year, and reported citation.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {EXAMPLE_QUERIES.map((promptText) => (
              <button
                key={promptText}
                type="button"
                onClick={() => {
                  setQuery(promptText);
                  executeSearch(promptText);
                }}
                className={toolPill(false, 'border border-[#E5E7EB] bg-white')}
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      ) : loading ? (
        <div className="mt-6">
          <p className={`${toolType.meta} flex items-center gap-2`}>
            <RefreshCw className="size-3.5 animate-spin text-[#6B7280]" aria-hidden />
            Searching for “{query}”
          </p>

          <ul className="mt-3 animate-pulse divide-y divide-[#E5E7EB] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="px-5 py-4">
                <div className="h-3 w-24 rounded bg-[#E5E7EB]" />
                <div className="mt-2.5 h-4 w-2/3 rounded bg-[#E5E7EB]" />
                <div className="mt-2 h-3 w-1/3 rounded bg-[#F3F4F6]" />
                <div className="mt-3 space-y-1.5">
                  <div className="h-3 w-full rounded bg-[#F3F4F6]" />
                  <div className="h-3 w-5/6 rounded bg-[#F3F4F6]" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : results.length === 0 ? (
        <div className="mt-12 max-w-md">
          <BookOpen className="size-6 text-[#9CA3AF]" aria-hidden />
          <h2 className="mt-3 font-ui text-[15px] font-semibold text-[#0B2242]">
            No precedents for “{searchedQuery}”
          </h2>
          <p className={`${toolType.body} mt-1.5`}>
            Try broader wording, or remove the court filter.
          </p>
          <button
            type="button"
            onClick={handleClear}
            className="mt-3 cursor-pointer font-ui text-[13px] font-medium text-[#0B2242] underline underline-offset-4 hover:text-[#1B3A63]"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-ui text-[15px] font-semibold text-[#0B2242]">
              {results.length} {results.length === 1 ? 'judgment' : 'judgments'} for “
              {searchedQuery}”
            </h2>
            {isRestoredFromCache && (
              <span className={toolType.meta}>Restored from this session</span>
            )}
          </div>

          <ul className="mt-3 divide-y divide-[#E5E7EB] overflow-hidden rounded-lg border border-[#E5E7EB] bg-white">
            {results.map((item, index) => {
              const displayCitations =
                item.citation ||
                [item.citations?.neutral, item.citations?.scr].filter(Boolean).join(' · ') ||
                (item.year ? `${item.year} INSC` : '');

              const courtTag = item.court?.includes('Supreme')
                ? 'Supreme Court'
                : item.court?.includes('High')
                  ? 'High Court'
                  : item.court || 'Court';

              const detailHref = `/${locale}/tools/research/${item.slug || item.id}`;

              return (
                <li key={item.id || index}>
                  <Link
                    href={detailHref}
                    className="group block px-5 py-4 transition-colors duration-150 hover:bg-[#F9FAFB] focus-visible:bg-[#F9FAFB] focus-visible:outline-hidden"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="min-w-0 flex-1">
                        {/* meta line */}
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-ui text-[12px] text-[#6B7280]">
                          <span className="font-medium text-[#0B2242]">{courtTag}</span>
                          {item.year && (
                            <>
                              <span aria-hidden className="text-[#D1D5DB]">
                                ·
                              </span>
                              <span>{item.year}</span>
                            </>
                          )}
                          {item.case_type && (
                            <>
                              <span aria-hidden className="text-[#D1D5DB]">
                                ·
                              </span>
                              <span>{item.case_type}</span>
                            </>
                          )}
                          {index === 0 && (
                            <span className="rounded bg-[#FDF9EC] px-1.5 py-0.5 text-[11px] font-medium text-[#8A6D12]">
                              Top match
                            </span>
                          )}
                        </div>

                        {/* case title */}
                        <h3 className="mt-1.5 font-ui text-[15px] leading-snug font-semibold text-[#0B2242] group-hover:underline">
                          {item.caseTitle || item.title}
                        </h3>

                        {displayCitations && (
                          <p className="mt-1 truncate font-mono text-[11.5px] text-[#6B7280]">
                            {displayCitations}
                          </p>
                        )}

                        {/* ratio extract */}
                        <div className="mt-2 line-clamp-3 font-ui text-[13.5px] leading-[1.65] text-[#4B5563]">
                          {item.snippet ? (
                            <span dangerouslySetInnerHTML={{ __html: item.snippet }} />
                          ) : item.ratio ? (
                            <span>{item.ratio}</span>
                          ) : (
                            <span className="text-[#9CA3AF]">
                              Full ratio available in the law report.
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="hidden shrink-0 flex-col items-end gap-2 sm:flex">
                        {typeof item.relevanceScore === 'number' && (
                          <span className={toolType.meta}>
                            {item.relevanceScore.toFixed(0)}% match
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1.5 font-ui text-[13px] font-medium text-[#0B2242]">
                          Read ratio
                          <ArrowRight
                            className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none"
                            aria-hidden
                          />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
