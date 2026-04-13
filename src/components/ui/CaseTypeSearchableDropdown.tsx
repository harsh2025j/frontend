"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X, FileText, Info } from "lucide-react";
import { CASE_TYPES } from "@/constants/caseOptions";

interface CaseTypeSearchableDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  error?: string;
  name?: string;
}

export default function CaseTypeSearchableDropdown({
  value,
  onChange,
  placeholder = "Select case type",
  className = "",
  required = false,
  error,
  name,
}: CaseTypeSearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
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

  const filteredTypes = CASE_TYPES.filter((ct) =>
    ct.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (caseType: string) => {
    onChange(caseType.toUpperCase());
    setIsOpen(false);
    setSearchQuery("");
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger button */}
      <div
        className={`w-full px-4 py-2.5 border rounded-xl text-left flex justify-between items-center transition-all bg-white/50 backdrop-blur-sm cursor-pointer
          ${isOpen
            ? "border-[#C9A227] ring-2 ring-[#C9A227]/10"
            : error
              ? "border-red-500 ring-4 ring-red-500/5 bg-red-50/10"
              : "border-gray-200 hover:border-[#C9A227]/50 shadow-sm"}
          ${!value ? "text-gray-400" : "text-gray-900"}
        `}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <FileText size={16} className={value ? "text-[#C9A227] shrink-0" : "text-gray-400 shrink-0"} />
          <span className="block truncate font-medium text-sm">
            {value || placeholder}
          </span>
        </div>
        <ChevronDown
          size={18}
          className={`transition-transform duration-300 text-gray-400 shrink-0 ml-2 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          {/* Search bar */}
          <div className="p-3 border-b border-gray-100 flex items-center gap-2 bg-gray-50/60 sticky top-0">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search case type…"
              className="w-full py-1 px-1 text-sm outline-none bg-transparent placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") { setIsOpen(false); setSearchQuery(""); }
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Help hint */}
          <div className="px-4 py-2 text-[11px] text-amber-700 bg-amber-50/50 border-b border-amber-100 flex items-start gap-2">
            <Info size={14} className="shrink-0 mt-0.5" />
            <span>Type to search or add a custom case type if not in the list.</span>
          </div>

          {/* Count badge */}
          <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-gray-50/30 flex justify-between items-center">
            <span>{searchQuery ? "Matching Types" : "All Case Types"}</span>
            <span className="text-gray-400 font-normal">{filteredTypes.length} found</span>
          </div>

          {/* Options list */}
          <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
            {/* Custom selection option */}
            {searchQuery && !filteredTypes.some(t => t.toLowerCase() === searchQuery.toLowerCase()) && (
              <div className="p-1.5 border-b border-gray-100 bg-amber-50/20">
                <button
                  type="button"
                  onClick={() => handleSelect(searchQuery)}
                  className="w-full px-3 py-2.5 text-left flex items-center gap-3 hover:bg-amber-100/50 rounded-xl transition-all group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[#C9A227] text-white flex items-center justify-center shrink-0">
                    <Search size={13} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 leading-tight">Use "{searchQuery.toUpperCase()}"</span>
                    <span className="text-[10px] text-amber-600">Select this as a custom case type</span>
                  </div>
                </button>
              </div>
            )}

            {filteredTypes.length > 0 ? (
              <div className="p-1.5">
                {filteredTypes.map((ct) => (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => handleSelect(ct)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-amber-50/50 rounded-xl transition-all group
                      ${value?.toUpperCase() === ct.toUpperCase() ? "bg-amber-50" : ""}
                    `}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors
                        ${value?.toUpperCase() === ct.toUpperCase() ? "bg-[#C9A227] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-amber-100 group-hover:text-[#C9A227]"}
                      `}>
                        <FileText size={13} />
                      </div>
                      <span className={`text-xs leading-tight ${value?.toUpperCase() === ct.toUpperCase() ? "text-[#0A2342] font-bold" : "text-gray-700 font-medium group-hover:text-gray-900"}`}>
                        {ct}
                      </span>
                    </div>
                    {value?.toUpperCase() === ct.toUpperCase() && <Check size={15} className="text-[#C9A227] shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-10 text-center flex flex-col items-center gap-2">
                <Search size={24} className="text-gray-300" />
                <span className="text-sm text-gray-500">No case types match "{searchQuery}"</span>
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
