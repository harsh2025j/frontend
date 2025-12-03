"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import NewsCard from "@/components/ui/NewsCard";
import Link from "next/link";
import { Article } from "@/data/features/article/article.types";
import Loader from "@/components/ui/Loader";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles, loading } = useArticleListActions();
    const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);
    const [categoryName, setCategoryName] = useState<string>("");

    // useEffect(() => {
    //     if (articles.length > 0 && slug) {
    //         const filtered = articles.filter(
    //             (article: Article) =>
    //                 article.category?.slug === slug ||
    //                 article.category?.name.toLowerCase() === slug.toLowerCase()||
    //                 article.category?.id === article.subcategory?.parentId
    //         );
    //         setCategoryArticles(filtered);
    //     }
    // }, [articles, slug]);
    // sdfg
    // Helper function to clean category names (remove trailing numbers and extra whitespace)
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
                <h1 className="text-4xl text-[#0A2342] sm:text-5xl font-bold capitalize">
                    {categoryName}
                </h1>
                <p className="text-gray-600 max-w-2xl  text-sm sm:text-base">
                    Explore the latest insights, updates, and reports in the{" "}
                    <span className="font-medium text-gray-800 capitalize">{categoryName}</span>{" "}
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
                    {categoryArticles.map((article) => (
                        <Link href={`/news/${article.slug}`} key={article.id}>
                            <NewsCard
                                title={article.title}
                                content={article.content}
                                src={article.thumbnail || undefined}
                                court={article.location || undefined}
                                time={new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
