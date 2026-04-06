"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import NewsCard from "@/components/ui/NewsCard";
import { Link } from "@/i18n/routing";
import { Article } from "@/data/features/article/article.types";
import Loader from "@/components/ui/Loader";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";
import { useDocTitle } from "@/hooks/useDocTitle";
import { timeAgo } from "@/lib/utils/timeAgo";
import { articleApi } from "@/data/services/article-service/article-service";
import Pagination from "@/components/Pagination";

const ITEMS_PER_PAGE = 12;

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const locale = useLocale();

    const [articles, setArticles] = useState<Article[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState("");

    useDocTitle(`${categoryName || "Category"} | Sajjad Husain Law Associates`);

    const cleanCategoryName = (name: string) =>
        name.replace(/\s*\d+\s*$/g, "").replace(/\s+/g, " ").trim();

    const fetchData = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const res = await articleApi.fetchArticles({
                category: slug,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            const data = res.data as any;
            const items: Article[] = data.data ?? [];
            setArticles(items);
            setTotalPages(data.meta?.total_pages ?? 1);
            setTotalItems(data.meta?.total_items ?? 0);

            // Derive category display name from first article or from slug
            if (items.length > 0 && items[0].category) {
                const cat = items[0].category;
                const currentSlugLower = slug.toLowerCase();

                let name = "";
                if (cat.slug?.toLowerCase() === currentSlugLower) name = cat.name;
                else if (cat.parent?.slug?.toLowerCase() === currentSlugLower) name = cat.parent.name;
                else name = cat.name;
                setCategoryName(cleanCategoryName(name));
            } else if (currentPage === 1) {
                const formatted = slug
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
                setCategoryName(cleanCategoryName(formatted));
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [slug, currentPage]);

    useEffect(() => { fetchData(); }, [fetchData]);
    // Reset page on slug change
    useEffect(() => { setCurrentPage(1); }, [slug]);

    // ── Translation ──
    const [textsToTranslate, setTextsToTranslate] = useState<string[]>([]);
    useEffect(() => {
        if (locale === "en" || !categoryName) return;
        const texts: string[] = [categoryName];
        articles.forEach((a) => {
            texts.push(a.title);
            texts.push(a.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...");
        });
        setTextsToTranslate(texts);
    }, [categoryName, articles, locale]);

    const { translatedText, loading: translating } = useGoogleTranslate(
        locale !== "en" && textsToTranslate.length > 0 ? textsToTranslate : null
    );

    const displayCategoryName = React.useMemo(() => {
        if (locale === "en" || !translatedText?.length) return categoryName;
        return translatedText[0];
    }, [categoryName, translatedText, locale]);

    const displayArticles = React.useMemo(() => {
        if (locale === "en" || !translatedText?.length) return articles;
        return articles.map((a, i) => ({
            ...a,
            title: translatedText[1 + i * 2] || a.title,
            content: translatedText[1 + i * 2 + 1] || a.content,
        }));
    }, [articles, translatedText, locale]);

    if (loading && currentPage === 1) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader text="Loading Content..." size="lg" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            {/* Header */}
            <div className="text-left mb-10 space-y-2">
                <h1 className="text-4xl text-[#0A2342] sm:text-5xl font-bold capitalize flex items-center gap-3">
                    {displayCategoryName}
                    {translating && <span className="text-sm text-[#C9A227] animate-pulse font-normal">Translating...</span>}
                </h1>
                <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                    Explore the latest insights, updates, and reports in the{" "}
                    <span className="font-medium text-gray-800 capitalize">{displayCategoryName}</span>{" "}
                    category.
                </p>
                <div className="w-24 h-1 bg-black/80 rounded-full mt-3" />
                <p className="text-sm text-gray-400 pt-1">{totalItems} article{totalItems !== 1 ? "s" : ""}</p>
            </div>

            {/* Article grid */}
            {!loading && displayArticles.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium py-20">
                    No articles found in this category.
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
                        {(loading ? Array(ITEMS_PER_PAGE).fill(null) : displayArticles).map((article, i) =>
                            loading ? (
                                <div key={i} className="bg-gray-100 rounded-xl animate-pulse h-64" />
                            ) : (
                                <Link href={`/news/${article.slug}`} key={article.id} className="flex">
                                    <NewsCard
                                        title={article.title}
                                        content={article.content}
                                        src={article.thumbnail || undefined}
                                        court={article.location || undefined}
                                        time={timeAgo(article.createdAt)}
                                        author={article.authors || article.advocateName || undefined}
                                    />
                                </Link>
                            )
                        )}
                    </div>

                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </>
            )}
        </div>
    );
}
