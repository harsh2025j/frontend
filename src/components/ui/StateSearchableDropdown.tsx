"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, MapPin } from "lucide-react";
import { INDIAN_STATES } from "@/constants/indianStates";

interface StateSearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  name?: string;
}

export default function StateSearchableDropdown({
  value,
  onChange,
  placeholder = "Select state",
  className = "",
  required = false,
  error,
  name,
}: StateSearchableDropdownProps) {
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredStates = INDIAN_STATES.filter((state) =>
    state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (stateName: string) => {
    onChange(stateName);
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div
        className={`w-full px-4 py-2.5 border rounded-xl text-left flex justify-between items-center transition-all bg-white cursor-pointer
          ${isOpen ? "border-[#C9A227] ring-2 ring-[#C9A227]/10" : error ? "border-red-500 ring-1 ring-red-500 bg-red-50/10" : "border-gray-200 hover:border-[#C9A227]/50 shadow-sm"}
          ${!value ? "text-gray-400" : "text-gray-900"}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin size={16} className={value ? "text-[#C9A227]" : "text-gray-400"} />
          <span className="block truncate font-medium text-sm">
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
          <div className="p-3 border-b border-gray-50 flex items-center gap-2 bg-gray-50/50">
            <Search size={16} className="text-gray-400 ml-1 flex-shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search state..."
              className="w-full py-1.5 px-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          <div className="max-h-[250px] overflow-y-auto w-full custom-scrollbar">
            {filteredStates.length > 0 ? (
              <div className="p-1.5">
                {filteredStates.map((state) => (
                  <button
                    key={state}
                    type="button"
                    onClick={() => handleSelect(state)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-gray-50 rounded-lg transition-all group
                      ${value === state ? "bg-amber-50/50" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-sm ${value === state ? "text-[#0A2342] font-bold" : "text-gray-700 font-medium group-hover:text-gray-900"}`}>
                        {state}
                      </span>
                    </div>
                    {value === state && <Check size={16} className="text-[#C9A227] shrink-0" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center flex flex-col items-center gap-2">
                <span className="text-sm text-gray-500">No states found</span>
              </div>
            )}
          </div>
        </div>
      )}

      <input
        type="text"
        className="sr-only"
        name={name}
        value={value}
        required={required}
        readOnly
      />
    </div>
  );
}
