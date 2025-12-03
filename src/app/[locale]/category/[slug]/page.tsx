"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import NewsCard from "@/components/ui/NewsCard";
import Link from "next/link";
import { Article } from "@/data/features/article/article.types";
import Loader from "@/components/ui/Loader";

import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles, loading } = useArticleListActions();
    const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
    const [categoryName, setCategoryName] = useState<string>("");
    const locale = useLocale();

    // ... (existing cleanCategoryName function) ...
    const cleanCategoryName = (name: string): string => {
        return name
            .replace(/\s*\d+\s*$/g, '') // Remove trailing numbers
            .replace(/\s+/g, ' ')        // Replace multiple spaces with single space
            .trim();                      // Remove leading/trailing whitespace
    };

    useEffect(() => {
        if (articles.length > 0 && slug) {
            const filtered = articles.filter((article: Article) => {
                const category = article.category;
                if (!category) return false;

                const currentSlug = slug.toLowerCase();

                const categorySlug = category.slug?.toLowerCase();
                const categoryName = category.name?.toLowerCase();
                const parentSlug = category.parent?.slug?.toLowerCase();
                const parentName = category.parent?.name?.toLowerCase();

                return (
                    // match current category
                    categorySlug === currentSlug ||
                    categoryName === currentSlug ||

                    // match parent → show children
                    parentSlug === currentSlug ||
                    parentName === currentSlug
                );
            });

            setCategoryArticles(filtered);

            // Set the category name from the first matching article
            if (filtered.length > 0 && filtered[0].category) {
                const firstArticleCategory = filtered[0].category;
                const currentSlug = slug.toLowerCase();

                let displayName = '';

                // Check if the slug matches the category slug
                if (firstArticleCategory.slug?.toLowerCase() === currentSlug) {
                    displayName = cleanCategoryName(firstArticleCategory.name);
                }
                // Check if the slug matches the category name (formatted)
                else if (firstArticleCategory.name?.toLowerCase() === currentSlug) {
                    displayName = cleanCategoryName(firstArticleCategory.name);
                }
                // Check if the slug matches the parent category slug
                else if (firstArticleCategory.parent?.slug?.toLowerCase() === currentSlug) {
                    displayName = cleanCategoryName(firstArticleCategory.parent.name);
                }
                // Check if the slug matches the parent category name (formatted)
                else if (firstArticleCategory.parent?.name?.toLowerCase() === currentSlug) {
                    displayName = cleanCategoryName(firstArticleCategory.parent.name);
                }
                // Default fallback to the article's category name
                else {
                    displayName = cleanCategoryName(firstArticleCategory.name);
                }

                setCategoryName(displayName);
            } else {
                // Fallback to formatted slug if no articles found
                // Convert slug to title case (e.g., "supreme-court" -> "Supreme Court")
                const formattedSlug = slug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                setCategoryName(cleanCategoryName(formattedSlug));
            }
        }
    }, [articles, slug]);

    // --- Translation Logic ---
    const [textsToTranslate, setTextsToTranslate] = useState<string[]>([]);

    useEffect(() => {
        if (locale === 'en' || !categoryName) return;

        const texts: string[] = [];
        // 1. Category Name
        texts.push(categoryName);

        // 2. Articles (Title + Content Snippet)
        categoryArticles.forEach(a => {
            texts.push(a.title);
            texts.push(a.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...");
        });

        setTextsToTranslate(texts);
    }, [categoryName, categoryArticles, locale]);

    const { translatedText, loading: translating } = useGoogleTranslate(
        locale !== 'en' && textsToTranslate.length > 0 ? textsToTranslate : null
    );

    const displayCategoryName = React.useMemo(() => {
        if (locale === 'en' || !translatedText || !Array.isArray(translatedText) || translatedText.length === 0) {
            return categoryName;
        }
        return translatedText[0];
    }, [categoryName, translatedText, locale]);

    const displayArticles = React.useMemo(() => {
        if (locale === 'en' || !translatedText || !Array.isArray(translatedText) || translatedText.length === 0) {
            return categoryArticles;
        }

        // First element is category name, so articles start at index 1
        return categoryArticles.map((article, index) => {
            const titleIdx = 1 + (index * 2);
            const contentIdx = 1 + (index * 2) + 1;

            return {
                ...article,
                title: translatedText[titleIdx] || article.title,
                content: translatedText[contentIdx] || article.content
            };
        });
    }, [categoryArticles, translatedText, locale]);


    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-lg font-medium text-gray-600">
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
                <p className="text-gray-600 max-w-2xl  text-sm sm:text-base">
                    Explore the latest insights, updates, and reports in the{" "}
                    <span className="font-medium text-gray-800 capitalize">{displayCategoryName}</span>{" "}
                    category.
                </p>
                <div className="w-24 h-1 bg-black/80  rounded-full mt-3"></div>
            </div>

            {/* Article list */}
            {categoryArticles.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium py-20">
                    No articles found in this category.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {displayArticles.map((article) => (
                        <Link href={`/news/${article.slug}`} key={article.id}>
                            <NewsCard
                                title={article.title}
                                content={article.content}
                                src={article.thumbnail || undefined}
                                court={article.location || undefined}
                                time={new Date(article.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                                views={String(0)}
                                likes={String(0)}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
