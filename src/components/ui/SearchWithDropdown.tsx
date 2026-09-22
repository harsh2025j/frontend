'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Scale, Gavel, User, Loader2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchService } from '@/data/features/search/searchService';
import { SearchSuggestion } from '@/data/features/search/search.types';

interface SearchWithDropdownProps {
    placeholder?: string;
    className?: string;
    onSearch?: (query: string) => void;
    onResultSelect?: () => void;
}

export default function SearchWithDropdown({
    placeholder = "Search articles, cases, judgments...",
    className = "",
    onSearch,
    onResultSelect,
}: SearchWithDropdownProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

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

    // Fast 250ms Debounce: triggers quick suggestions with spinning loader
    useEffect(() => {
        const trimmed = query.trim();
        if (trimmed.length < 2) {
            setResults([]);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);
        const controller = new AbortController();

        const timer = setTimeout(async () => {
            try {
                const fetchedResults = await searchService.getSuggestions(trimmed, controller.signal);
                setResults(Array.isArray(fetchedResults) ? fetchedResults : []);
            } catch (error: any) {
                if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                    setResults([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 250); // Fast snappy debounce

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);

    const handleResultClick = (result: SearchSuggestion) => {
        let path = '';
        switch (result.type) {
            case 'judgment':
                path = `/judgments/${result.slug || result.id}`;
                break;
            case 'case':
                path = `/cases/${result.slug || result.id}`;
                break;
            case 'judge':
                path = `/judges/${result.slug || result.id}`;
                break;
            default:
                path = `/news/${result.slug || result.id}`;
                break;
        }

        setIsOpen(false);
        setQuery('');
        if (onResultSelect) onResultSelect();
        router.push(path);
    };

    const handleSearchSubmit = () => {
        const trimmed = query.trim();
        if (trimmed) {
            setIsOpen(false);
            if (onSearch) {
                onSearch(trimmed);
            } else {
                router.push(`/search?q=${encodeURIComponent(trimmed)}`);
            }
            if (onResultSelect) onResultSelect();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
            return;
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen && query.trim().length >= 2) {
                setIsOpen(true);
            } else if (results.length > 0) {
                setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (results.length > 0) {
                setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && selectedIndex < results.length) {
                handleResultClick(results[selectedIndex]);
            } else {
                handleSearchSubmit();
            }
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.focus();
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'judgment':
                return <Gavel size={18} className="text-[#C9A227]" />;
            case 'case':
                return <Scale size={18} className="text-[#C9A227]" />;
            case 'judge':
                return <User size={18} className="text-[#C9A227]" />;
            default:
                return <FileText size={18} className="text-[#C9A227]" />;
        }
    };

    return (
        <div ref={searchRef} className={`relative w-full ${className}`}>
            {/* Search Input */}
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setSelectedIndex(-1);
                    }}
                    onKeyDown={handleKeyDown}
                    onFocus={() => {
                        if (query.trim().length >= 2) {
                            setIsOpen(true);
                        }
                    }}
                    placeholder={placeholder}
                    className="w-full pl-5 pr-20 py-1.5 text-sm md:text-base border-2 border-[#C9A227] rounded-full focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all placeholder:text-gray-400 bg-white"
                    autoComplete="off"
                    aria-label="Search articles, cases and judgments"
                />

                {/* Right Actions: Spinning Loader / Clear / Search */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                    {isLoading ? (
                        <Loader2 size={18} className="animate-spin text-[#C9A227]" />
                    ) : query ? (
                        <button
                            type="button"
                            onClick={clearSearch}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition cursor-pointer"
                            aria-label="Clear search"
                        >
                            <X size={16} />
                        </button>
                    ) : null}

                    <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="p-1 text-gray-400 hover:text-[#C9A227] transition-colors cursor-pointer"
                        title="Search"
                        aria-label="Submit search"
                    >
                        <Search size={19} />
                    </button>
                </div>
            </div>

            {/* Dropdown Results - Classic Layout with Fast Spinning Feedback */}
            {isOpen && query.trim().length >= 2 && (
                <div className="absolute top-full left-0 lg:-left-10 lg:-right-10 right-0 mt-2 bg-white border-2 border-[#C9A227] rounded-xl shadow-2xl max-h-[500px] overflow-y-auto z-[150] animate-slideDown overflow-x-hidden">
                    {isLoading ? (
                        <div className="p-6 text-center text-gray-500">
                            <Loader2 size={24} className="animate-spin text-[#C9A227] mx-auto" />
                            <p className="mt-2 text-sm font-medium">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result, idx) => {
                                const isSelected = selectedIndex === idx;
                                return (
                                    <button
                                        key={`${result.type}-${result.id || idx}`}
                                        type="button"
                                        onClick={() => handleResultClick(result)}
                                        onMouseEnter={() => setSelectedIndex(idx)}
                                        className={`w-full px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 group cursor-pointer ${
                                            isSelected ? 'bg-[#C9A227]/10' : 'hover:bg-[#C9A227]/5'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1 flex-shrink-0 bg-gray-50 p-1.5 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-[#C9A227]/20">
                                                {getIcon(result.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start gap-4">
                                                    <h4 className="text-sm md:text-base font-semibold text-gray-900 group-hover:text-[#C9A227] transition-colors line-clamp-2 flex-1">
                                                        {result.title}
                                                    </h4>
                                                    <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 rounded border border-gray-200 group-hover:bg-[#C9A227]/10 group-hover:text-[#C9A227] group-hover:border-[#C9A227]/20 transition-all">
                                                        {result.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm font-medium">No results found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


