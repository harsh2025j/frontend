"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";

export default function ArticleDetailPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles, loading } = useArticleListActions();
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        if (articles.length > 0 && slug) {
            const found = articles.find((a: Article) => a.slug === slug);
            setArticle(found || null);
        }
    }, [articles, slug]);

    if (loading) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    if (!article) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold">Article not found</h1>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <div className="mb-6">
                <span className="bg-blue-100 text-blue-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                    {article.category?.name || "News"}
                </span>
                <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">{article.title}</h1>
                {article.subHeadline && (
                    <h2 className="text-xl text-gray-600 mb-4">{article.subHeadline}</h2>
                )}
                <div className="flex items-center text-gray-500 text-sm mb-6">
                    <span className="mr-4">By {article.authorRole || "Editor"}</span>
                    <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    {article.location && <span className="ml-4">📍 {article.location}</span>}
                </div>
            </div>

            {article.thumbnail && (
                <div className="relative w-full h-[400px] mb-8 rounded-lg overflow-hidden">
                    <Image
                        src={article.thumbnail}
                        alt={article.title}
                        fill
                        className="object-cover"
                    />
                </div>
            )}

            <div className="prose max-w-none">
                {/* Rendering content safely - assuming it might be HTML or plain text */}
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t">
                    <h3 className="text-lg font-semibold mb-3">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
