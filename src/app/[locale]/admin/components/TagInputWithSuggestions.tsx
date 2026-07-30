'use client'

import React, { useState, useEffect, useRef } from 'react';
import { tagApi, Tag } from '@/data/services/tag-service/tag-service';
import { X, Search, Hash } from 'lucide-react';

interface TagInputWithSuggestionsProps {
    selectedTags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
}

export default function TagInputWithSuggestions({
    selectedTags,
    onChange,
    placeholder = "Type tag and press Enter..."
}: TagInputWithSuggestionsProps) {
    const [inputValue, setInputValue] = useState('');
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced search logic
    useEffect(() => {
        // Validate min/max length before showing error or searching
        if (inputValue.length > 0 && inputValue.length < 3) {
            setError("Tag must be at least 3 characters");
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        if (inputValue.length > 120) {
            setError("Tag must not exceed 120 characters");
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        setError(null);

        if (inputValue.trim().length < 3) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setIsOpen(true);

        const timer = setTimeout(async () => {
            try {
                const response = await tagApi.fetchTags(inputValue.trim(), controller.signal);
                const fetchedTags = response.data?.data || [];
                // Filter out tags that are already selected
                const filteredTags = fetchedTags.filter(t => !selectedTags.includes(t.name));
                setSuggestions(filteredTags);
            } catch (err: any) {
                if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
                    console.error("Failed to fetch tag suggestions", err);
                    setSuggestions([]);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }, 600); // 600ms debounce

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [inputValue, selectedTags]);

    const handleAddTag = (tagName: string) => {
        const trimmed = tagName.trim();

        if (trimmed.length < 3 || trimmed.length > 120) {
            setError("Tag must be between 3 and 120 characters.");
            return;
        }

        if (!selectedTags.includes(trimmed)) {
            onChange([...selectedTags, trimmed]);
        }
        setInputValue('');
        setSuggestions([]);
        setIsOpen(false);
        setError(null);
    };

    const handleRemoveTag = (tagToRemove: string) => {
        onChange(selectedTags.filter(tag => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (inputValue.trim()) {
                handleAddTag(inputValue);
            }
        }
    };

    return (
        <div className="space-y-2 relative" ref={dropdownRef}>
            <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`flex-1 border rounded-lg px-3 py-2 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent ${error ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                />
                <button
                    type="button"
                    onClick={() => {
                        if (inputValue.trim()) {
                            handleAddTag(inputValue);
                        }
                    }}
                    className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    Add
                </button>
            </div>

            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

            {/* Dropdown */}
            {isOpen && (inputValue.trim().length >= 3) && (
                <div className="absolute top-10 left-0 right-20 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                    {isLoading ? (
                        <div className="p-3 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            Searching tags...
                        </div>
                    ) : suggestions.length > 0 ? (
                        <ul className="py-1">
                            {suggestions.map((tag) => (
                                <li
                                    key={tag.id}
                                    onClick={() => handleAddTag(tag.name)}
                                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm flex items-center gap-2 transition-colors"
                                >
                                    <Hash size={14} className="text-gray-400" />
                                    <span className="font-medium text-gray-700">{tag.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 text-center text-sm text-gray-500">
                            No matching tags found. Press <kbd className="bg-gray-100 px-1 rounded mx-1">Enter</kbd> to create it.
                        </div>
                    )}
                </div>
            )}

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                    {selectedTags.map((tag, i) => (
                        <span
                            key={i}
                            className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-3 py-1.5 rounded-full flex items-center gap-2 group hover:bg-blue-200 transition-colors"
                        >
                            {tag}
                            <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-blue-600 hover:text-red-600 font-bold transition-colors"
                                aria-label={`Remove ${tag}`}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
