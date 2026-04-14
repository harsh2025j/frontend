"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, Gavel } from "lucide-react";

interface CourtSearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  name?: string;
}

const INDIAN_HIGH_COURTS = [
  "Allahabad High Court",
  "Andhra Pradesh High Court",
  "Bombay High Court",
  "Calcutta High Court",
  "Chhattisgarh High Court",
  "Delhi High Court",
  "Gauhati High Court",
  "Gujarat High Court",
  "Himachal Pradesh High Court",
  "Jammu & Kashmir and Ladakh High Court",
  "Jharkhand High Court",
  "Karnataka High Court",
  "Kerala High Court",
  "Madhya Pradesh High Court",
  "Madras High Court",
  "Manipur High Court",
  "Meghalaya High Court",
  "Orissa High Court",
  "Patna High Court",
  "Punjab and Haryana High Court",
  "Rajasthan High Court",
  "Sikkim High Court",
  "Telangana High Court",
  "Tripura High Court",
  "Uttarakhand High Court",
];

const PREDEFINED_COURTS = [
  "Supreme Court of India",
  ...INDIAN_HIGH_COURTS,
];

export default function CourtSearchableDropdown({
  value,
  onChange,
  placeholder = "Select or type court name",
  className = "",
  required = false,
  error,
  name,
}: CourtSearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    }
  }, [isOpen]);

  const filteredOptions = PREDEFINED_COURTS.filter((court) =>
    court.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (courtName: string) => {
    onChange(courtName);
    setIsOpen(false);
    setSearchQuery("");
  };

  const isCustomValue = searchQuery && !PREDEFINED_COURTS.some(c => c.toLowerCase() === searchQuery.toLowerCase());

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full px-4 py-2.5 border rounded-xl text-left flex justify-between items-center transition-all bg-white/50 backdrop-blur-sm cursor-pointer
          ${isOpen ? "border-[#C9A227] ring-2 ring-[#C9A227]/10" : error ? "border-red-500 ring-4 ring-red-500/5 bg-red-50/10" : "border-gray-200 hover:border-[#C9A227]/50 shadow-sm"}
          ${!value ? "text-gray-400" : "text-gray-900"}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          <Gavel size={16} className={value ? "text-[#C9A227]" : "text-gray-400"} />
          <span className="block truncate font-medium">
            {value || placeholder}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 text-gray-400 flex-shrink-0 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-[30] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          {/* Search Input Area */}
          <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
            <Search size={16} className="text-gray-400 ml-1 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or enter district court..."
              className="w-full py-1.5 px-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchQuery) {
                  handleSelect(searchQuery);
                }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="max-h-[300px] overflow-y-auto w-full custom-scrollbar">
            {/* Custom Entry Option */}
            {isCustomValue && (
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => handleSelect(searchQuery)}
                  className="w-full px-3 py-3 text-left flex items-center gap-3 hover:bg-[#C9A227]/5 rounded-xl transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                    <Search size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                      Use "{searchQuery}"
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">Custom Court Name</span>
                  </div>
                </button>
              </div>
            )}

            {/* List Header if search query empty或者有匹配 */}
            {(filteredOptions.length > 0) && (
              <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-50/30">
                {searchQuery ? "Suggested Courts" : "Popular Indian Courts"}
              </div>
            )}

            {filteredOptions.length > 0 ? (
              <div className="p-1.5 pt-0">
                {filteredOptions.map((court) => (
                  <button
                    key={court}
                    type="button"
                    onClick={() => handleSelect(court)}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between hover:bg-gray-50 rounded-xl transition-all group
                      ${value === court ? "bg-amber-50/50" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                        ${value === court ? "bg-[#C9A227] text-white" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"}
                      `}>
                        <Gavel size={14} />
                      </div>
                      <span className={`text-sm ${value === court ? "text-[#0A2342] font-bold" : "text-gray-700 font-medium group-hover:text-gray-900"}`}>
                        {court}
                      </span>
                    </div>
                    {value === court && <Check size={16} className="text-[#C9A227] shrink-0" />}
                  </button>
                ))}
              </div>
            ) : !isCustomValue && (
              <div className="px-4 py-10 text-center flex flex-col items-center gap-2">
                <Search size={24} className="text-gray-300" />
                <span className="text-sm text-gray-500">No results. Start typing to add custom court.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form validation */}
      <input
        type="text"
        className="sr-only"
        name={name}
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
      />
    </div>
  );
}
