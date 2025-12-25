'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchService } from '@/data/features/search/searchService';
import { SearchResult } from '@/data/features/search/search.types';
import { Search, Loader2, ChevronLeft, ChevronRight, FileText, Gavel, Scale } from 'lucide-react';
import { Link } from '@/i18n/routing';

const SearchResultsContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const pageParam = searchParams.get('page');
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    const [results, setResults] = useState<SearchResult[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await searchService.searchContentWithPagination(query, currentPage);
                setResults(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, currentPage]);

    const handlePageChange = (newPage: number) => {
        router.push(`/search?q=${encodeURIComponent(query)}&page=${newPage}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'judgment': return <Gavel size={24} />;
            case 'case': return <Scale size={24} />;
            default: return <FileText size={24} />;
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header Section */}
                    {query && !isLoading && (
                        <div className="mb-8 pb-4 border-b border-gray-100 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Search Results for <span className="text-[#C9A227]">"{query}"</span>
                            </h1>
                            <p className="text-gray-500 text-sm">
                                {meta?.totalItems || 0} results found
                            </p>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading ? (
                        <div className="space-y-8 animate-pulse">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-48 h-48 md:h-32 bg-gray-100 rounded-lg flex-shrink-0"></div>
                                    <div className="space-y-3 flex-1">
                                        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
                                        <div className="h-6 bg-gray-100 rounded w-3/4"></div>
                                        <div className="h-16 bg-gray-100 rounded w-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="space-y-6">
                            {results.map((result) => (
                                <Link
                                    key={result.id}
                                    href={`/news/${result.slug}`}
                                    className="flex flex-col md:flex-row gap-6 group bg-white hover:bg-gray-50 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-gray-100 hover:shadow-sm"
                                >
                                    {/* Thumbnail Image */}
                                    <div className="w-full md:w-48 h-48 md:h-32 rounded-lg overflow-hidden flex-shrink-0 relative bg-gray-100 shadow-sm">
                                        {result.thumbnail ? (
                                            <img
                                                src={result.thumbnail}
                                                alt={result.title}
                                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                                                {getIcon(result.type)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 flex flex-col justify-center">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                            <span className="bg-[#C9A227]/10 text-[#C9A227] px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">
                                                {result.type}
                                            </span>
                                            {result.date && <span className="text-gray-400">• {result.date}</span>}
                                        </div>

                                        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-snug mb-2 group-hover:text-[#C9A227] transition-colors">
                                            {result.title}
                                        </h3>

                                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
                                            {result.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        query && (
                            <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-100">
                                <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <h3 className="text-xl font-medium text-gray-900 mb-2">No matches found</h3>
                                <p className="text-gray-500">
                                    We couldn't find any results for "{query}". <br />Try different keywords.
                                </p>
                            </div>
                        )
                    )}

                    {/* Pagination */}
                    {meta && meta.totalPages > 1 && (
                        <div className="mt-12 py-8 border-t border-gray-100 flex items-center justify-center gap-2">
                            <button
                                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage <= 1}
                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronLeft size={20} />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
                                    let p = i + 1;
                                    if (meta.totalPages > 5) {
                                        if (currentPage > 3) p = currentPage - 2 + i;
                                        if (p > meta.totalPages) return null;
                                    }
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => handlePageChange(p)}
                                            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${currentPage === p
                                                    ? 'bg-[#C9A227] text-white'
                                                    : 'text-gray-700 hover:bg-gray-300'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => handlePageChange(Math.min(meta.totalPages, currentPage + 1))}
                                disabled={currentPage >= meta.totalPages}
                                className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center"><Loader2 className="animate-spin text-[#C9A227]" size={40} /></div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
