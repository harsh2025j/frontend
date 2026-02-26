"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface CustomSelectProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    required?: boolean;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select an option",
    className = "",
    required = false,
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

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

    const handleSelect = (optionValue: string) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                className={`w-full px-4 py-3 border-2 rounded-lg text-left flex justify-between items-center transition-all bg-white
          ${isOpen ? "border-[#C9A227] ring-2 ring-[#C9A227]" : "border-gray-300 hover:border-gray-400"}
          ${!value ? "text-gray-500" : "text-gray-900"}
        `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={20}
                    className={`transition-transform duration-200 text-gray-500 ${isOpen ? "rotate-180" : ""}`}
                />
            </button>

            {/* Validation hidden input */}
            <input
                type="text"
                className="sr-only"
                value={value}
                required={required}
                onChange={() => { }}
                tabIndex={-1}
            />

            {isOpen && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => handleSelect(option.value)}
                            className={`w-full px-4 py-2.5 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors
                ${value === option.value ? "bg-blue-50 text-[#0A2342] font-semibold" : "text-gray-700"}
              `}
                        >
                            <span>{option.label}</span>
                            {value === option.value && <Check size={16} className="text-[#C9A227]" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
