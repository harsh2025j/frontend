'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { searchService } from '@/data/features/search/searchService';
import { SearchResult } from '@/data/features/search/search.types';
import Image from 'next/image';
import {
    Search, Loader2, FileText, Gavel, Scale, User,
    Calendar, MapPin, ChevronRight, LayoutGrid, List
} from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useDocTitle } from '@/hooks/useDocTitle';
import Pagination from '@/components/Pagination';

type SearchTab = 'all' | 'judgment' | 'case' | 'judge' | 'article';

const SearchResultsContent = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const pageParam = searchParams.get('page');
    const tabParam = searchParams.get('tab') as SearchTab || 'all';
    const currentPage = pageParam ? parseInt(pageParam) : 1;

    useDocTitle(`Search Results: ${query} - Sajjad Husain Law Associates`);

    const [results, setResults] = useState<SearchResult[]>([]);
    const [meta, setMeta] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const tabs: { id: SearchTab; label: string; icon: React.ReactNode }[] = [
        { id: 'all', label: 'All Results', icon: <Search size={18} /> },
        { id: 'judgment', label: 'Judgments', icon: <Gavel size={18} /> },
        { id: 'case', label: 'Cases', icon: <Scale size={18} /> },
        { id: 'judge', label: 'Judges', icon: <User size={18} /> },
        { id: 'article', label: 'Articles', icon: <FileText size={18} /> },
    ];

    useEffect(() => {
        const fetchResults = async () => {
            if (!query.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                let response;
                if (tabParam === 'all') {
                    response = await searchService.getUniversalSearch(query, currentPage, 12);
                } else {
                    // Map frontend tab name to backend service category name
                    const categoryMap: Record<SearchTab, any> = {
                        all: 'universal',
                        judgment: 'judgments',
                        case: 'cases',
                        judge: 'judges',
                        article: 'articles'
                    };
                    response = await searchService.getCategorySearch(categoryMap[tabParam], query, currentPage, 12);
                }

                setResults(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error("Error fetching search results:", error);
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [query, currentPage, tabParam]);

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams);
        params.set('page', newPage.toString());
        router.push(`/search?${params.toString()}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleTabChange = (tab: SearchTab) => {
        const params = new URLSearchParams();
        params.set('q', query);
        params.set('tab', tab);
        params.set('page', '1');
        router.push(`/search?${params.toString()}`);
    };

    const getResultLink = (result: SearchResult) => {
        switch (result.type) {
            case 'judgment': return `/judgments/${result.id}`;
            case 'case': return `/cases/${result.id}`;
            case 'judge': return `/judges/${result.id}`;
            case 'article': return `/news/${result.slug}`;
            default: return '#';
        }
    };

    const ResultCard = ({ result }: { result: SearchResult }) => {
        const icon = {
            judgment: <Gavel size={20} className="text-[#C9A227]" />,
            case: <Scale size={20} className="text-[#C9A227]" />,
            judge: <User size={20} className="text-[#C9A227]" />,
            article: <FileText size={20} className="text-[#C9A227]" />
        }[result.type] || <FileText size={20} />;

        return (
            <Link
                href={getResultLink(result)}
                className="block group bg-white rounded-2xl border border-gray-100 hover:border-[#C9A227]/30 hover:shadow-xl hover:shadow-[#C9A227]/5 transition-all duration-300 p-5 mb-4"
            >
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Visual Media (Optional for legal types) */}
                    {(result.thumbnail || result.type === 'article' || result.type === 'judge') && (
                        <div className="w-full md:w-40 h-40 md:h-28 rounded-xl overflow-hidden flex-shrink-0 relative bg-gray-50 border border-gray-100">
                            {result.thumbnail ? (
                                <Image
                                    src={result.thumbnail}
                                    alt={result.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-300">
                                    {icon}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C9A227]/10 text-[#C9A227]">
                                {icon}
                                {result.type}
                            </span>
                            {result.date && (
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                    <Calendar size={12} /> {result.date}
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#C9A227] transition-colors mb-2 leading-snug line-clamp-2">
                            {result.title}
                        </h3>

                        {/* Type Specific Extras */}
                        {result.type === 'judgment' && (result.petitioner || result.respondent) && (
                            <div className="text-sm font-medium text-gray-700 italic mb-2">
                                {result.petitioner || 'Petitioner'} <span className="text-[#C9A227] not-italic mx-1">vs</span> {result.respondent || 'Respondent'}
                            </div>
                        )}

                        {result.type === 'case' && result.caseNumber && (
                            <div className="text-sm font-bold text-gray-600 mb-2 font-mono">
                                Case No: {result.caseNumber}
                            </div>
                        )}

                        {result.court && (
                            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                                <MapPin size={12} className="text-[#C9A227]" /> {result.court}
                            </div>
                        )}

                        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                            {result.description}
                        </p>
                    </div>

                    <div className="hidden md:flex items-center justify-center self-center text-gray-300 group-hover:text-[#C9A227] transition-colors translate-x-0 group-hover:translate-x-1 duration-300">
                        <ChevronRight size={24} />
                    </div>
                </div>
            </Link>
        );
    };

    return (
        <div className="min-h-screen bg-[#FDFCFB]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Search Header */}
                    <div className="mb-10">
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
                            Search Results
                        </h1>
                        <p className="text-gray-500">
                            Showing results for <span className="text-[#C9A227] font-semibold italic">"{query}"</span>
                        </p>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-gray-200">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all relative capitalize
                                    ${tabParam === tab.id
                                        ? 'text-[#C9A227]'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 rounded-t-xl'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                                {tabParam === tab.id && (
                                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C9A227] shadow-[0_0_8px_rgba(201,162,39,0.5)]"></span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Results Count Summary */}
                    {!isLoading && meta && (
                        <div className="mb-6 flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-600">
                                Found <span className="text-gray-900 font-bold">{meta.totalItems}</span> matching records in <span className="capitalize">{tabParam}</span>
                            </p>
                            {/* <div className="flex items-center gap-3">
                                <button className="p-2 bg-white rounded-lg border border-gray-200 text-[#C9A227] shadow-sm"><List size={18} /></button>
                                <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"><LayoutGrid size={18} /></button>
                            </div> */}
                        </div>
                    )}

                    {/* Content Section */}
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-40 bg-white border border-gray-100 rounded-2xl animate-pulse p-6">
                                    <div className="flex gap-6 h-full">
                                        <div className="w-28 bg-gray-50 rounded-xl"></div>
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-gray-50 rounded w-1/4"></div>
                                            <div className="h-6 bg-gray-50 rounded w-3/4"></div>
                                            <div className="h-10 bg-gray-50 rounded w-full"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div className="animate-fadeIn">
                            {results.map((result) => (
                                <ResultCard key={result.id} result={result} />
                            ))}
                        </div>
                    ) : (
                        query && (
                            <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Search className="h-10 w-10 text-gray-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching records</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">
                                    We couldn't find any results for "{query}" in the <span className="font-bold text-[#C9A227]">{tabParam}</span> category.
                                </p>
                                <button
                                    onClick={() => handleTabChange('all')}
                                    className="mt-8 px-8 py-3 bg-[#C9A227] text-white font-bold rounded-full hover:shadow-lg transition-all"
                                >
                                    Search in all categories
                                </button>
                            </div>
                        )
                    )}

                    {/* Pagination */}
                    {meta && meta.totalPages > 1 && !isLoading && (
                        <div className="mt-12 py-10 border-t border-gray-100">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={meta.totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen grid place-items-center bg-[#FDFCFB]"><Loader2 className="animate-spin text-[#C9A227]" size={40} /></div>}>
            <SearchResultsContent />
        </Suspense>
    );
}
