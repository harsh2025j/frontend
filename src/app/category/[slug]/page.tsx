"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import NewsCard from "@/components/ui/NewsCard";
import Link from "next/link";
import { Article } from "@/data/features/article/article.types";

export default function CategoryPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles, loading } = useArticleListActions();
    const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);

    useEffect(() => {
        if (articles.length > 0 && slug) {
            const filtered = articles.filter(
                (article: Article) =>
                    article.category?.slug === slug ||
                    article.category?.name.toLowerCase() === slug.toLowerCase()
            );
            setCategoryArticles(filtered);
        }
    }, [articles, slug]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen text-lg font-medium text-gray-600">
                Loading...
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">

            {/* Header */}
            <div className="text-left mb-10 space-y-2">
                <h1 className="text-4xl text-[#0A2342] sm:text-5xl font-bold capitalize">
                    {slug.replace(/-/g, " ")}
                </h1>
                <p className="text-gray-600 max-w-2xl  text-sm sm:text-base">
                    Explore the latest insights, updates, and reports in the{" "}
                    <span className="font-medium text-gray-800 capitalize">{slug.replace(/-/g, " ")}</span>{" "}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryArticles.map((article) => (
                        <Link href={`/news/${article.slug}`} key={article.id}>
                            <NewsCard
                                title={article.title}
                                src={article.thumbnail || undefined}
                                court={article.location || undefined}
                                views={String(article.views || 0)}
                                likes={String(article.likes || 0)}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
