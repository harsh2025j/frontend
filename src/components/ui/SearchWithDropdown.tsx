'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Scale, Gavel } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useArticleListActions } from '@/data/features/article/useArticleActions';
import { Article } from '@/data/features/article/article.types';

interface SearchResult {
    id: string;
    title: string;
    type: 'article' | 'judgment' | 'case';
    slug?: string;
    description?: string;
    date?: string;
}

interface SearchWithDropdownProps {
    placeholder?: string;
    className?: string;
    onSearch?: (query: string) => void;
}

export default function SearchWithDropdown({
    placeholder = "Search any Legal question or track a case...",
    className = "",
    onSearch
}: SearchWithDropdownProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const { articles } = useArticleListActions();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Search logic
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);

        // Simulate search delay
        const timer = setTimeout(() => {
            const searchQuery = query.toLowerCase();

            // Filter articles
            const filteredArticles = articles
                .filter((article: Article) =>
                    article.status === 'published' &&
                    (article.title.toLowerCase().includes(searchQuery) ||
                        article.content.toLowerCase().includes(searchQuery) ||
                        article.category?.name.toLowerCase().includes(searchQuery))
                )
                .slice(0, 10)
                .map((article: Article) => ({
                    id: article.id,
                    title: article.title,
                    type: article.category?.slug?.includes('judgment') ? 'judgment' as const : 'article' as const,
                    slug: article.slug,
                    description: article.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...',
                    date: new Date(article.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })
                }));

            setResults(filteredArticles);
            setIsOpen(filteredArticles.length > 0);
            setIsLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, articles]);

    const handleResultClick = (result: SearchResult) => {
        if (result.slug) {
            router.push(`/article/${result.slug}`);
        }
        setQuery('');
        setIsOpen(false);
    };

    const handleSearchClick = () => {
        if (query.trim()) {
            if (onSearch) {
                onSearch(query);
            } else {
                router.push(`/ai-assistant?query=${encodeURIComponent(query)}`);
            }
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'judgment':
                return <Gavel size={18} className="text-blue-600" />;
            case 'case':
                return <Scale size={18} className="text-purple-600" />;
            default:
                return <FileText size={18} className="text-gray-600" />;
        }
    };

    return (
        <div ref={searchRef} className={`relative w-full ${className}`}>
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-5 pr-12 py-1.5 text-sm md:text-base border-2 border-[#C9A227] rounded-full focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all placeholder:text-gray-400"
                />

                {/* Clear Button */}
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={16} className="text-gray-400" />
                    </button>
                )}

                {/* Search Icon */}
                <button
                    onClick={handleSearchClick}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A227] transition-colors"
                >
                    <Search size={20} />
                </button>
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-[#C9A227] rounded-lg shadow-2xl max-h-[400px] overflow-y-auto z-50 animate-slideDown">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]"></div>
                            <p className="mt-2 text-sm">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleResultClick(result)}
                                    className="w-full px-4 py-3 hover:bg-[#C9A227]/5 transition-colors text-left border-b border-gray-100 last:border-b-0 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0">
                                            {getIcon(result.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm md:text-base font-medium text-gray-900 group-hover:text-[#C9A227] transition-colors line-clamp-2">
                                                {result.title}
                                            </h4>
                                            {result.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                    {result.description}
                                                </p>
                                            )}
                                            {result.date && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {result.date}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No results found for "{query}"</p>
                            <p className="text-xs mt-1">Try different keywords</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
