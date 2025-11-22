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
            // Filter articles by category slug
            // Note: Assuming article.category has a slug field based on types
            const filtered = articles.filter(
                (article: Article) => article.category?.slug === "weq3weq" || article.category?.name.toLowerCase() === slug.toLowerCase()
            );
            setCategoryArticles(filtered);
        }
    }, [articles, slug]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 capitalize">{slug.replace(/-/g, " ")} News</h1>

            {categoryArticles.length === 0 ? (
                <div className="text-center text-gray-600">No articles found in this category.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categoryArticles.map((article) => (
                        <Link href={`/news/${article.slug}`} key={article.id}>
                            <NewsCard
                                title={article.title}
                                src={article.thumbnail || undefined}
                                court={article.location || undefined}
                            // time={new Date(article.createdAt).getTime()} // NewsCard expects number? Let's check
                            // NewsCard time is number, maybe minutes ago? 
                            // Let's just pass undefined for now or calculate diff
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
