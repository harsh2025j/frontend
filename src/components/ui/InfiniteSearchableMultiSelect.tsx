"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Search, X, Loader2, Users } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";

export interface SearchableOption {
    value: string;
    label: string;
    subLabel?: string;
}

interface InfiniteSearchableMultiSelectProps {
    selectedValues: string[];
    onChange: (values: string[]) => void;
    onSearch: (query: string, page: number) => Promise<{ options: SearchableOption[]; totalPages: number }>;
    placeholder?: string;
    className?: string;
    required?: boolean;
    name?: string;
}

export default function InfiniteSearchableMultiSelect({
    selectedValues = [],
    onChange,
    placeholder = "Select users...",
    className = "",
    required = false,
    name,
    onSearch,
}: InfiniteSearchableMultiSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 600);
    const [isLoading, setIsLoading] = useState(false);
    const [asyncOptions, setAsyncOptions] = useState<SearchableOption[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedOptions, setSelectedOptions] = useState<SearchableOption[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Filter out options that are already selected to avoid duplicates in the dropdown
    const displayOptions = asyncOptions;

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
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsLoading(false);
        }
    }, [onSearch]);

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
        if (selectedValues.includes(option.value)) {
            const newValues = selectedValues.filter(v => v !== option.value);
            onChange(newValues);
            // No need to manually update selectedOptions here, the effect below will sync it
        } else {
            const newValues = [...selectedValues, option.value];
            onChange(newValues);
            setSelectedOptions(prev => {
                if (prev.find(o => o.value === option.value)) return prev;
                return [...prev, option];
            });
        }
    };

    // Effect to prune selectedOptions if selectedValues changes externally or options are removed
    useEffect(() => {
        setSelectedOptions(prev => prev.filter(opt => selectedValues.includes(opt.value)));
    }, [selectedValues]);

    // Cleanup: we don't clear selectedOptions on close if we want them to persist across re-opens
    // But we DO need them to persist across component remounts. 
    // Since this component is inside a conditional block in page.tsx, it unmounts when sendToAll is true.
    // To fix this properly, we should ideally lift selectedOptions state to the parent,
    // or just accept that searching/scrolling will be needed to re-add them if they aren't in current results.
    // COMPROMISE: We check asyncOptions for any missing selected labels.
    useEffect(() => {
        if (asyncOptions.length > 0) {
            const newlyFound = asyncOptions.filter(opt => 
                selectedValues.includes(opt.value) && 
                !selectedOptions.find(so => so.value === opt.value)
            );
            if (newlyFound.length > 0) {
                setSelectedOptions(prev => [...prev, ...newlyFound]);
            }
        }
    }, [asyncOptions, selectedValues, selectedOptions]);

    const removeOption = (valueToRemove: string) => {
        const newValues = selectedValues.filter(v => v !== valueToRemove);
        onChange(newValues);
        setSelectedOptions(prev => prev.filter(o => o.value !== valueToRemove));
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <div 
                className={`min-h-[42px] w-full px-3 py-1.5 border rounded-lg text-left flex flex-wrap gap-2 items-center transition-all bg-white cursor-pointer
                    ${isOpen ? "border-[#0A2342] ring-2 ring-[#0A2342]/10" : "border-gray-300 hover:border-gray-400"}
                `}
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedOptions.length === 0 && !isOpen && (
                    <span className="text-gray-500 text-sm ml-1">{placeholder}</span>
                )}
                
                {selectedOptions.map((option) => (
                    <span 
                        key={option.value}
                        className="inline-flex items-center gap-1 bg-[#0A2342]/5 text-[#0A2342] px-2 py-1 rounded-md text-xs font-medium border border-[#0A2342]/10 group"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {option.label}
                        <button
                            type="button"
                            onClick={() => removeOption(option.value)}
                            className="hover:bg-[#0A2342]/10 rounded-full p-0.5 transition-colors"
                        >
                            <X size={12} />
                        </button>
                    </span>
                ))}
                
                <div className="flex-1 min-w-[60px]">
                   {isOpen && (
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Type to search..."
                            className="w-full py-0.5 px-1 text-sm outline-none bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                        />
                   )}
                </div>

                <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 text-gray-400 flex-shrink-0 ml-auto ${isOpen ? "rotate-180" : ""}`}
                />
            </div>

            <input
                type="text"
                className="sr-only"
                name={name}
                value={selectedValues.join(",")}
                required={required && selectedValues.length === 0}
                onChange={() => { }}
                tabIndex={-1}
            />

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="max-h-[280px] overflow-y-auto w-full py-1 custom-scrollbar">
                        {displayOptions.length > 0 ? (
                            <>
                                {displayOptions.map((option, index) => {
                                    const isSelected = selectedValues.includes(option.value);
                                    return (
                                        <button
                                            key={`${option.value}-${index}`}
                                            ref={index === displayOptions.length - 1 ? lastElementRef : null}
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelect(option);
                                            }}
                                            className={`w-full px-4 py-2.5 text-left flex items-start justify-between hover:bg-gray-50 transition-colors
                                                ${isSelected ? "bg-blue-50/50" : ""}
                                            `}
                                        >
                                            <div className="flex flex-col min-w-0 pr-4">
                                                <span className={`text-sm truncate ${isSelected ? "text-[#0A2342] font-semibold" : "text-gray-700"}`}>
                                                    {option.label}
                                                </span>
                                                {option.subLabel && (
                                                    <span className="text-xs text-gray-500 mt-0.5 truncate">
                                                        {option.subLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                                ${isSelected ? "bg-[#0A2342] border-[#0A2342]" : "border-gray-300"}
                                            `}>
                                                {isSelected && <Check size={14} className="text-white" />}
                                            </div>
                                        </button>
                                    );
                                })}
                                {isLoading && (
                                    <div className="flex justify-center py-4">
                                        <Loader2 size={20} className="animate-spin text-[#0A2342]" />
                                    </div>
                                )}
                            </>
                        ) : isLoading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-3">
                                <Loader2 size={28} className="animate-spin text-[#0A2342]" />
                                <span className="text-sm font-medium">Searching users...</span>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-10 text-gray-500 gap-2">
                                <Users size={32} className="text-gray-300" />
                                <span className="text-sm">No users found</span>
                            </div>
                        )}
                    </div>
                    
                    {selectedValues.length > 0 && (
                        <div className="p-2 border-t border-gray-100 bg-gray-50 flex justify-between items-center rounded-b-lg">
                            <span className="text-xs text-gray-500 font-medium ml-2">
                                {selectedValues.length} selected
                            </span>
                            <button 
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange([]);
                                    setSelectedOptions([]);
                                }}
                                className="text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1 hover:bg-red-50 rounded transition-colors"
                            >
                                Clear all
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
