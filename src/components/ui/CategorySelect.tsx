"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
    id: string;
    name: string;
}

interface CategorySelectProps {
    value: string;
    onChange: (id: string) => void;
    options: Option[];
    placeholder?: string;
    required?: boolean;
    className?: string;
}

/**
 * Custom category select that renders its dropdown inside the viewport,
 * capping height at 260px with an internal scrollbar — no overflow off-screen.
 */
const CategorySelect: React.FC<CategorySelectProps> = ({
    value,
    onChange,
    options,
    placeholder = "Select Category",
    required = false,
    className = "",
}) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selected = options.find((o) => o.id === value);

    const filtered = search.trim()
        ? options.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()))
        : options;

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

    // Focus search when opens
    useEffect(() => {
        if (open) setTimeout(() => searchRef.current?.focus(), 10);
    }, [open]);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((p) => !p)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between gap-2 text-left"
            >
                <span className={selected ? "text-gray-900" : "text-gray-400"}>
                    {selected ? selected.name : placeholder}
                </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                />
            </button>

            {/* Hidden native input for form required validation */}
            {required && (
                <input
                    tabIndex={-1}
                    required
                    value={value}
                    onChange={() => { }}
                    className="absolute opacity-0 w-0 h-0"
                    aria-hidden
                />
            )}

            {/* Dropdown */}
            {open && (
                <div className="absolute z-[30] mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col"
                    style={{ maxHeight: "260px" }}
                >
                    {/* Search */}
                    <div className="p-2 border-b border-gray-100 flex-shrink-0">
                        <input
                            ref={searchRef}
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search categories..."
                            className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>

                    {/* Options list */}
                    <div className="overflow-y-auto flex-1" role="listbox">
                        {filtered.length === 0 ? (
                            <div className="px-3 py-3 text-sm text-gray-400 text-center">No categories found</div>
                        ) : (
                            filtered.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    role="option"
                                    aria-selected={value === opt.id}
                                    onClick={() => {
                                        onChange(opt.id);
                                        setOpen(false);
                                        setSearch("");
                                    }}
                                    className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${value === opt.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                        }`}
                                >
                                    {opt.name}
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategorySelect;
