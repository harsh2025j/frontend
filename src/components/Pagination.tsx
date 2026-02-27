"use client";
import React from "react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

/**
 * Reusable Pagination component.
 * Shows: 1  2  3  ...  last-1  last   (smart ellipsis)
 */
const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
}) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = (): (number | "...")[] => {
        const pages: (number | "...")[] = [];
        const delta = 2; // pages around current

        const rangeStart = Math.max(2, currentPage - delta);
        const rangeEnd = Math.min(totalPages - 1, currentPage + delta);

        pages.push(1);

        if (rangeStart > 2) pages.push("...");

        for (let i = rangeStart; i <= rangeEnd; i++) {
            pages.push(i);
        }

        if (rangeEnd < totalPages - 1) pages.push("...");

        if (totalPages > 1) pages.push(totalPages);

        return pages;
    };

    const pageNumbers = getPageNumbers();

    const btnBase =
        "min-w-[36px] h-9 px-2 rounded-md text-sm font-medium transition-colors border";
    const activeBtn =
        "bg-[#0B2149] text-white border-[#0B2149]";
    const inactiveBtn =
        "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300";
    const arrowBtn =
        "min-w-[36px] h-9 px-3 rounded-md text-sm font-medium border border-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed";

    return (
        <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
            {/* Prev */}
            <button
                className={arrowBtn}
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
            >
                ‹
            </button>

            {pageNumbers.map((page, idx) =>
                page === "..." ? (
                    <span
                        key={`ellipsis-${idx}`}
                        className="min-w-[36px] h-9 flex items-center justify-center text-gray-400 text-sm"
                    >
                        …
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page as number)}
                        className={`${btnBase} ${currentPage === page ? activeBtn : inactiveBtn
                            }`}
                        aria-current={currentPage === page ? "page" : undefined}
                    >
                        {page}
                    </button>
                )
            )}

            {/* Next */}
            <button
                className={arrowBtn}
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
            >
                ›
            </button>
        </div>
    );
};

export default Pagination;
