"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export interface SearchableOption {
    value: string;
    label: string;
    subLabel?: string;
}

interface InfiniteSearchableSelectProps {
    options?: SearchableOption[];
    value: string;
    onChange: (value: string) => void;
    onSearch: (query: string, page: number) => Promise<{ options: SearchableOption[]; totalPages: number }>;
    initialOption?: SearchableOption | null;
    placeholder?: string;
    className?: string;
    required?: boolean;
    name?: string;
    error?: string;
}

export default function InfiniteSearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    required = false,
    name,
    onSearch,
    initialOption,
    error,
}: InfiniteSearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const [isLoading, setIsLoading] = useState(false);
    const [asyncOptions, setAsyncOptions] = useState<SearchableOption[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [localSelectedOption, setLocalSelectedOption] = useState<SearchableOption | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Prefer async options if they exist, otherwise use initial options
    const displayOptions = asyncOptions.length > 0 || (isOpen && debouncedSearchQuery.length >= 0) ? asyncOptions : options;

    // Calculate display label: check props options, current async results, local cache, or initialOption fallback
    const selectedOption = options?.find((opt) => opt.value === value) ||
        asyncOptions.find((opt) => opt.value === value) ||
        (localSelectedOption?.value === value ? localSelectedOption : null) ||
        (value && initialOption?.value === value ? initialOption : null);

    // Sync local cache when value changes
    useEffect(() => {
        if (value) {
            const found = options.find(o => o.value === value) || asyncOptions.find(o => o.value === value);
            if (found) {
                setLocalSelectedOption(found);
            }
            // Note: We don't clear if not found here to preserve metadata from previous pages
        } else {
            setLocalSelectedOption(null);
        }
    }, [value, options, asyncOptions]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        } else if (!isOpen) {
            setSearchQuery("");
            setAsyncOptions([]);
            setPage(1);
            setTotalPages(1);
        }
    }, [isOpen]);

    const performSearch = useCallback(async (query: string, pageNum: number, append = false) => {
        setIsLoading(true);
        try {
            const { options: newOptions, totalPages: total } = await onSearch(query, pageNum);
            setAsyncOptions(prev => append ? [...prev, ...newOptions] : newOptions);
            setTotalPages(total);

            // If the current value is in the new results, cache its metadata
            if (value) {
                const found = newOptions.find(o => o.value === value);
                if (found) setLocalSelectedOption(found);
            }
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [onSearch, value]);

    useEffect(() => {
        if (isOpen) {
            setPage(1);
            performSearch(debouncedSearchQuery, 1, false);
        }
    }, [debouncedSearchQuery, isOpen, performSearch]);

    const loadMore = useCallback(() => {
        if (!isLoading && page < totalPages) {
            const nextPage = page + 1;
            setPage(nextPage);
            performSearch(debouncedSearchQuery, nextPage, true);
        }
    }, [isLoading, page, totalPages, debouncedSearchQuery, performSearch]);

    const { lastElementRef } = useInfiniteScroll({
        isLoading,
        hasMore: page < totalPages,
        onLoadMore: loadMore,
    });

    const handleSelect = (option: SearchableOption) => {
        setLocalSelectedOption(option);
        onChange(option.value);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                className={`w-full px-4 py-2 border rounded-lg text-left flex justify-between items-center transition-all bg-white
          ${isOpen ? "border-[#C9A227] ring-2 ring-[#C9A227]/20" : error ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-300 hover:border-gray-400"}
          ${!value ? "text-gray-500" : "text-gray-900"}
        `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-col truncate pr-2">
                    <span className="block truncate font-medium">
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.subLabel && (
                        <span className="block truncate text-xs text-gray-500 mt-0.5">
                            {selectedOption.subLabel}
                        </span>
                    )}
                </div>
                <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 text-gray-500 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            <input
                type="text"
                className="sr-only"
                name={name}
                value={value}
                required={required}
                onChange={() => { }}
                tabIndex={-1}
            />

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                        <Search size={16} className="text-gray-400 ml-2 flex-shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Type to search..."
                            className="w-full py-1.5 px-2 text-sm outline-none bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSearchQuery(""); searchInputRef.current?.focus(); }}
                                className="p-1 text-gray-400 hover:bg-gray-100 rounded-full"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>

                    <div className="max-h-[260px] overflow-y-auto w-full py-1">
                        {displayOptions.length > 0 ? (
                            <>
                                {displayOptions.map((option, index) => (
                                    <button
                                        key={`${option.value}-${index}`}
                                        ref={index === displayOptions.length - 1 ? lastElementRef : null}
                                        type="button"
                                        onClick={() => handleSelect(option)}
                                        className={`w-full px-4 py-2.5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors
                                            ${value === option.value ? "bg-blue-50" : ""}
                                        `}
                                    >
                                        <div className="flex flex-col">
                                            <span className={`text-sm ${value === option.value ? "text-[#0A2342] font-semibold" : "text-gray-700"}`}>
                                                {option.label}
                                            </span>
                                            {option.subLabel && (
                                                <span className="text-xs text-gray-500 mt-0.5">
                                                    {option.subLabel}
                                                </span>
                                            )}
                                        </div>
                                        {value === option.value && <Check size={16} className="text-[#C9A227] mt-0.5 shrink-0" />}
                                    </button>
                                ))}
                                {isLoading && page > 1 && (
                                    <div className="flex justify-center py-2">
                                        <Loader2 size={16} className="animate-spin text-[#C9A227]" />
                                    </div>
                                )}
                            </>
                        ) : isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                                <Loader2 size={24} className="animate-spin text-[#C9A227]" />
                                <span className="text-sm">Searching...</span>
                            </div>
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                <span>No options found</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
