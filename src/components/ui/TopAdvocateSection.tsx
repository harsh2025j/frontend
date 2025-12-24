'use client'
import React, { useMemo } from 'react';
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { getArticlesBySlugs } from "../home/Stores";
import { Article } from "@/data/features/article/article.types";
import Image from 'next/image';

export default function TopAdvocateSection() {
    const { articles: allArticles, loading } = useArticleListActions();

    const articles = useMemo(
        () => allArticles?.filter((a: { status: string }) => a.status === 'published') || [],
        [allArticles]
    );

    const advocateData = useMemo(
        () => {
            if (!articles || articles.length === 0) return [];
            return getArticlesBySlugs(articles, ["top-advocates"]);
        },
        [articles]
    );

    const hasAdvocates = advocateData && advocateData.length > 0;

    return (
        <div className="flex flex-col gap-3 md:gap-4 w-full lg:max-w-[600px]">
            <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-merriweather text-[#0A2342]">
                    Top Advocate
                </h1>
            </div>
            <div className="flex flex-col p-4 sm:p-5 bg-white justify-evenly transition-all duration-300 rounded-lg shadow-md h-full gap-3">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C9A227]"></div>
                    </div>
                ) : hasAdvocates ? (
                    <div className="space-y-3">
                        {advocateData.slice(0, 3).map((advocate: Article) => (
                            <div
                                key={advocate.id}
                                className="flex items-center gap-4 bg-[#e5e5e5] p-5 rounded-xl w-full h-auto hover:bg-[#d5d5d5] transition-colors cursor-pointer"
                            >
                                <div className="w-14 h-14 relative rounded-full overflow-hidden flex-shrink-0 bg-gray-300">
                                    {advocate.thumbnail ? (
                                        <Image
                                            src={advocate.thumbnail}
                                            alt={advocate.title || 'Advocate'}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                    <h3 className="text-md font-semibold text-gray-900 truncate">
                                        {advocate.title}
                                    </h3>
                                    {advocate.aiSummary ? (
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {advocate.aiSummary}
                                        </p>
                                    ) : advocate.category ? (
                                        <p className="text-sm text-gray-700">
                                            {advocate.category.name}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                            Top Advocates Information
                        </h3>
                        <p className="text-sm text-gray-600">
                            We are currently collecting advocate data to display here
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
