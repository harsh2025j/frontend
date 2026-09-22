"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { courseApi } from "@/data/services/academy-service/course.service";

interface CourseSearchResult {
  id: string;
  title: string;
  slug: string;
}

interface AcademySearchProps {
  onSelectCourse?: () => void;
  placeholder?: string;
  className?: string;
}

export default function AcademySearch({
  onSelectCourse,
  placeholder = "Search for courses...",
  className = "",
}: AcademySearchProps) {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<CourseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 500ms Debounce: queries backend database directly with no frontend filtering (minimum 3 characters)
  useEffect(() => {
    const trimmed = searchTerm.trim();
    if (trimmed.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const handler = setTimeout(async () => {
      setIsLoading(true);
      // console.log(`[AcademySearch] 500ms debounce elapsed. Executing backend search for: "${trimmed}"`);
      try {
        const res = await courseApi.searchCourses(trimmed);
        const data = Array.isArray(res.data) ? res.data : (res as any);
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to search courses from backend:", err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectCourse = (course: CourseSearchResult) => {
    setIsOpen(false);
    setSearchTerm("");
    if (onSelectCourse) {
      onSelectCourse();
    }
    router.push(`/courses/${course.slug || course.id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectCourse(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelectCourse(results[0]);
      }
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Search Input Bar */}
      <div className="relative flex items-center">
        <Search
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          size={16}
        />

        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            if (val.trim().length >= 3) {
              setIsOpen(true);
            } else {
              setIsOpen(false);
              setResults([]);
            }
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            if (searchTerm.trim().length >= 3) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-9 pr-9 py-2 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] transition-all text-sm text-gray-900 placeholder-gray-500"
          autoComplete="off"
          aria-label="Search courses"
        />

        {/* Right Action: Spinner or Clear */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
          {isLoading ? (
            <Loader2 size={15} className="animate-spin text-[#C9A227]" />
          ) : searchTerm ? (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setResults([]);
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-0.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
              aria-label="Clear search"
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && searchTerm.trim().length >= 3 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[150] transition-all animate-in fade-in slide-in-from-top-1 duration-200">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-gray-500 font-medium">
              <Loader2 size={15} className="animate-spin text-[#C9A227]" />
              <span>Searching courses...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 py-1">
              {results.map((course, idx) => {
                const isSelected = selectedIndex === idx;

                return (
                  <div
                    key={course.id || course.slug}
                    onClick={() => handleSelectCourse(course)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`px-4 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition-colors ${isSelected
                        ? "bg-amber-50/70 text-[#C9A227]"
                        : "hover:bg-gray-50 text-gray-800"
                      }`}
                  >
                    <span className="text-sm font-medium hover:text-[#C9A227] transition-colors truncate">
                      {course.title}
                    </span>
                    <ArrowRight
                      size={13}
                      className="text-gray-300 group-hover:text-[#C9A227] shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-4 px-4 text-center text-xs text-gray-500">
              No courses found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
