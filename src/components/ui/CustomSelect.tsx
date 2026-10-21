'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

export interface CustomSelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: (string | CustomSelectOption)[];
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  name?: string;
  error?: boolean;
  id?: string;
  disabled?: boolean;
  buttonClassName?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
  searchable = true,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to { label, value }
  const normalizedOptions: CustomSelectOption[] = options.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  // Current selected option label
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  // Filter options based on search query
  const filteredOptions = normalizedOptions.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div ref={containerRef} className={`relative w-full text-left ${className}`} onClick={(e) => e.stopPropagation()}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between rounded-lg border border-[#CBD5E1] bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#0B2242] hover:border-[#0B2242] focus:outline-hidden focus:border-[#0B2242] transition-colors shadow-2xs cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate pr-2">{displayLabel}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-[#0B2242]' : ''
          }`}
        />
      </button>

      {/* Floating Menu with max 300px height and zero overlap */}
      {isOpen && (
        <div
          className="absolute left-0 top-full mt-1.5 w-full z-50 rounded-xl border border-[#CBD5E1] bg-white shadow-2xl py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          style={{ maxHeight: '300px' }}
        >
          {/* Search box if options > 5 */}
          {searchable && normalizedOptions.length > 5 && (
            <div className="p-2 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <div className="relative">
                <Search className="absolute left-2.5 top-2 size-3.5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type to filter..."
                  className="w-full rounded-md border border-[#CBD5E1] bg-white pl-8 pr-2.5 py-1.5 text-xs text-[#0B2242] focus:border-[#0B2242] focus:outline-hidden"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}

          {/* Options List (strictly max-h-[300px] or remaining space) */}
          <div
            className="overflow-y-auto overscroll-contain"
            style={{ maxHeight: searchable && normalizedOptions.length > 5 ? '240px' : '290px' }}
            role="listbox"
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs sm:text-sm text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EAEFF9] text-[#0B2242] font-bold'
                        : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0B2242]'
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span className="truncate pr-2">{opt.label}</span>
                    {isSelected && <Check className="size-3.5 shrink-0 text-[#0B2242]" />}
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-gray-400 italic">No matching options</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
