'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, Scale, Gavel } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchService } from '@/data/features/search/searchService';
import { SearchSuggestion } from '@/data/features/search/search.types';
import { User } from 'lucide-react';

interface SearchWithDropdownProps {
    placeholder?: string;
    className?: string;
    onSearch?: (query: string) => void;
    onResultSelect?: () => void;
}

export default function SearchWithDropdown({
    placeholder = "Search any Legal question or track a case...",
    className = "",
    onSearch,
    onResultSelect
}: SearchWithDropdownProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [results, setResults] = useState<SearchSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
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


    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        const controller = new AbortController();
        const signal = controller.signal;

        setIsLoading(true);

        const timer = setTimeout(async () => {
            try {
                const results = await searchService.getSuggestions(query, signal);
                setResults(results);
                setIsOpen(results.length > 0);
            } catch (error: any) {
                if (error.name !== 'AbortError' && error.name !== 'CanceledError') {
                    setResults([]);
                }
            } finally {
                if (!signal.aborted) setIsLoading(false);
            }
        }, 300); // Faster debounce for suggestions

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query]);


    const handleResultClick = (result: SearchSuggestion) => {
        let path = '';
        switch (result.type) {
            case 'judgment': 
                if (result.pdfUrl) {
                    window.open(result.pdfUrl, '_blank');
                    setQuery('');
                    setIsOpen(false);
                    if (onResultSelect) onResultSelect();
                    return;
                }
                path = `/judgments/${result.id}`; 
                break;
            case 'case': path = `/cases/${result.id}`; break;
            case 'judge': path = `/judges/${result.id}`; break;
            default: path = `/news/${result.slug}`; break;
        }
        
        router.push(path);
        setQuery('');
        setIsOpen(false);
        if (onResultSelect) onResultSelect();
    };

    const handleSearchClick = () => {
        if (query.trim()) {
            if (onSearch) {
                onSearch(query);
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
            case 'judgment': return <Gavel size={18} className="text-[#C9A227]" />;
            case 'case': return <Scale size={18} className="text-[#C9A227]" />;
            case 'judge': return <User size={18} className="text-[#C9A227]" />;
            default: return <FileText size={18} className="text-[#C9A227]" />;
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
                    onFocus={() => query.trim().length >= 3 && results.length > 0 && setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-5 pr-12 py-1.5 text-sm md:text-base border-2 border-[#C9A227] rounded-full focus:outline-none focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 transition-all placeholder:text-gray-400"
                />

                {query && (
                    <button onClick={clearSearch} className="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={16} className="text-gray-400" />
                    </button>
                )}

                <button onClick={handleSearchClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C9A227] transition-colors">
                    <Search size={20} />
                </button>
            </div>

            {/* Dropdown Results */}
            {isOpen && (
                <div className="absolute top-full left-0 lg:-left-10 lg:-right-10 right-0 mt-2 bg-white border-2 border-[#C9A227] rounded-xl shadow-2xl max-h-[500px] overflow-y-auto z-50 animate-slideDown overflow-x-hidden">
                    {isLoading ? (
                        <div className="p-4 text-center text-gray-500">
                            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#C9A227]"></div>
                            <p className="mt-2 text-sm">Searching...</p>
                        </div>
                    ) : results.length > 0 ? (
                        <div className="py-2">
                            {results.map((result) => (
                                <button key={result.id} onClick={() => handleResultClick(result)} className="w-full px-4 py-3 hover:bg-[#C9A227]/5 transition-colors text-left border-b border-gray-100 last:border-b-0 group">
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 bg-gray-50 p-1.5 rounded-lg group-hover:bg-white transition-colors border border-transparent group-hover:border-[#C9A227]/20">{getIcon(result.type)}</div>
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
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-500">
                            <FileText size={32} className="mx-auto mb-2 text-gray-300" />
                            <p className="text-sm">No results found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
