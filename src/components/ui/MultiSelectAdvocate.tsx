"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronDown, X, Loader2, UserPlus } from "lucide-react";
import { Advocate } from "@/data/features/article/article.types";
import { articleApi } from "@/data/services/article-service/article-service";
import debounce from "lodash/debounce";

interface MultiSelectAdvocateProps {
  selectedAdvocates: Advocate[];
  onChange: (advocates: Advocate[]) => void;
  placeholder?: string;
  className?: string;
}

const MultiSelectAdvocate: React.FC<MultiSelectAdvocateProps> = ({
  selectedAdvocates,
  onChange,
  placeholder = "Select Advocates...",
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState<Advocate[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAdvocates = useCallback(
    async (query: string, pageNum: number, isNewSearch: boolean) => {
      try {
        setLoading(true);
        const response = await articleApi.searchAdvocates(query, pageNum, 12);
        const advocateData = response.data.data?.data || [];
        const newOptions = advocateData.map((user: any) => ({
          userId: user._id,
          name: user.name,
          email: user.email,
        }));

        if (isNewSearch) {
          setOptions(newOptions);
        } else {
          setOptions((prev) => [...prev, ...newOptions]);
        }

        setHasMore(newOptions.length === 12);
      } catch (error) {
        console.error("Failed to fetch advocates:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedFetch = useCallback(
    debounce((query: string) => {
      setPage(1);
      fetchAdvocates(query, 1, true);
    }, 700),
    [fetchAdvocates]
  );

  useEffect(() => {
    if (open) {
      fetchAdvocates("", 1, true);
    }
  }, [open, fetchAdvocates]);

  useEffect(() => {
    if (open) debouncedFetch(search);
  }, [search, open, debouncedFetch]);

  // Handle scroll for infinite loading
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 10 && hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchAdvocates(search, nextPage, false);
    }
  };

  const handleSelect = (advocate: Advocate) => {
    if (!selectedAdvocates.find((a) => a.userId === advocate.userId && a.name === advocate.name)) {
      onChange([...selectedAdvocates, advocate]);
    }
    setSearch("");
  };

  const handleRemove = (advocateName: string) => {
    onChange(selectedAdvocates.filter((a) => a.name !== advocateName));
  };

  const handleAddCustom = () => {
    if (search.trim()) {
      handleSelect({ name: search.trim() });
      setSearch("");
    }
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Selected Items / Trigger */}
      <div
        className="min-h-[42px] w-full border rounded-lg px-2 py-1.5 bg-gray-50 flex flex-wrap gap-2 items-center cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        onClick={() => {
          setOpen(true);
          searchRef.current?.focus();
        }}
      >
        {selectedAdvocates.map((adv) => (
          <span
            key={adv.userId || adv.name}
            className="bg-blue-100 text-blue-700 text-sm px-2 py-1 rounded-md flex items-center gap-1 group"
          >
            {adv.name}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove(adv.name);
              }}
              className="hover:text-blue-900"
            >
              <X size={14} />
            </button>
          </span>
        ))}
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={selectedAdvocates.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none outline-none text-sm min-w-[120px]"
          onFocus={() => setOpen(true)}
        />
        <ChevronDown
          size={16}
          className={`text-gray-400 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div
          ref={dropdownRef}
          className="absolute z-[9999] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col"
          style={{ maxHeight: "300px" }}
        >
          <div className="overflow-y-auto flex-1 p-1" onScroll={handleScroll}>
            {options.length === 0 && !loading && !search.trim() ? (
              <div className="px-3 py-3 text-sm text-gray-400 text-center">Start typing to search...</div>
            ) : (
              options.map((opt) => (
                <button
                  key={opt.userId}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors rounded-md flex flex-col"
                >
                  <span className="font-medium text-gray-900">{opt.name}</span>
                  {opt.email && <span className="text-xs text-gray-500">{opt.email}</span>}
                </button>
              ))
            )}

            {search.trim() && !options.find(o => o.name.toLowerCase() === search.toLowerCase()) && (
              <button
                type="button"
                onClick={handleAddCustom}
                className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors rounded-md flex items-center gap-2"
              >
                <UserPlus size={16} />
                <span>Add "{search}"</span>
              </button>
            )}

            {loading && (
              <div className="px-3 py-3 flex justify-center">
                <Loader2 size={20} className="animate-spin text-blue-500" />
              </div>
            )}

            {!loading && options.length === 0 && search.trim() && (
              <div className="px-3 py-3 text-sm text-gray-400 text-center">No advocates found in system</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectAdvocate;
