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
    name?: string;
    error?: boolean;
    buttonClassName?: string;
}

export default function CustomSelect({
    options,
    value,
    onChange,
    placeholder = "Select option",
    className = "",
    required = false,
    name,
    error = false,
    buttonClassName,
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
                className={buttonClassName || `w-full px-4 py-1.5 border rounded-lg text-left flex justify-between items-center transition-all bg-white
          ${error
                        ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/5 text-red-900"
                        : isOpen
                            ? "border-[#C9A227] ring-2 ring-[#C9A227]/20"
                            : "border-gray-300 hover:border-gray-400"}
          ${!value && !error ? "text-gray-400" : ""}
        `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="block truncate font-medium">
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 text-gray-400 ${isOpen ? "rotate-180" : ""}`}
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
                <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl shadow-gray-200/50 max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`w-full px-4 py-2 text-left text-sm flex items-center justify-between hover:bg-gray-50 transition-colors
                    ${value === option.value ? "bg-[#C9A227]/5 text-[#C9A227] font-bold" : "text-gray-700"}
                  `}
                            >
                                <span>{option.label}</span>
                                {value === option.value && <Check size={16} className="text-[#C9A227]" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
