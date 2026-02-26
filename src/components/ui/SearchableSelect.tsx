"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, Check, Search, X, Loader2 } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

export interface SearchableOption {
    value: string;
    label: string;
    subLabel?: string;
}

interface SearchableSelectProps {
    options: SearchableOption[];
    value: string;
    onChange: (value: string) => void;
    onSearch?: (query: string) => Promise<SearchableOption[]>;
    placeholder?: string;
    className?: string;
    required?: boolean;
    name?: string;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    required = false,
    name,
    onSearch
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearchQuery = useDebounce(searchQuery, 800);
    const [isLoading, setIsLoading] = useState(false);
    const [asyncOptions, setAsyncOptions] = useState<SearchableOption[]>([]);

    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Prefer async options if they exist, otherwise use default options
    const displayOptions = asyncOptions.length > 0 || (debouncedSearchQuery.length >= 3 && typeof onSearch !== 'undefined') ? asyncOptions : options;
    const selectedOption = options.find((opt) => opt.value === value) || asyncOptions.find((opt) => opt.value === value);

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

    // Focus query input when popup opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        } else {
            setSearchQuery(""); // clear search on close
            setAsyncOptions([]);
        }
    }, [isOpen]);

    // Async searching side effect
    useEffect(() => {
        let isMounted = true;

        const performSearch = async () => {
            if (typeof onSearch !== 'undefined' && debouncedSearchQuery.length >= 3) {
                setIsLoading(true);
                try {
                    const results = await onSearch(debouncedSearchQuery);
                    if (isMounted) {
                        setAsyncOptions(results);
                    }
                } catch (error) {
                    console.error("Search failed:", error);
                    if (isMounted) setAsyncOptions([]);
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            } else if (typeof onSearch !== 'undefined' && debouncedSearchQuery.length < 3) {
                setAsyncOptions([]);
            }
        };

        performSearch();

        return () => {
            isMounted = false;
        };
    }, [debouncedSearchQuery, onSearch]);

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery("");
        setAsyncOptions([]);
    };

    const filteredOptions = displayOptions.filter(opt => {
        // If we are using async results, don't filter them locally as the server did it
        if (asyncOptions.length > 0 || (typeof onSearch !== 'undefined' && debouncedSearchQuery.length >= 3)) return true;

        const query = searchQuery.toLowerCase();
        return (
            opt.label.toLowerCase().includes(query) ||
            (opt.subLabel && opt.subLabel.toLowerCase().includes(query))
        );
    });

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                className={`w-full px-4 py-2 border rounded-lg text-left flex justify-between items-center transition-all bg-white
          ${isOpen ? "border-[#C9A227] ring-2 ring-[#C9A227]/20" : "border-gray-300 hover:border-gray-400"}
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

            {/* Validation hidden input */}
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
                    {/* Search Bar */}
                    <div className="p-2 border-b border-gray-100 flex items-center gap-2">
                        <Search size={16} className="text-gray-400 ml-2 flex-shrink-0" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Type to search..."
                            className="w-full py-1.5 px-2 text-sm outline-none bg-transparent"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()} // Prevent closing popup
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

                    {/* Result List */}
                    <div className="max-h-[260px] overflow-y-auto w-full py-1">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 text-gray-500 gap-2">
                                <Loader2 size={24} className="animate-spin text-[#C9A227]" />
                                <span className="text-sm">Searching server...</span>
                            </div>
                        ) : filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
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
                            ))
                        ) : (
                            <div className="px-4 py-8 text-center text-gray-500 text-sm">
                                <span>No options found matching "{searchQuery}"</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
