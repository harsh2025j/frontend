"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import NewsCard from "@/components/ui/NewsCard";
// import Link from "next/link";
import { Link } from "@/i18n/routing";
import { Article } from "@/data/features/article/article.types";
import Loader from "@/components/ui/Loader";

import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";
import { useDocTitle } from "@/hooks/useDocTitle";
import { timeAgo } from "@/lib/utils/timeAgo";


export default function TagPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { articles: allArticles, loading } = useArticleListActions();
    const articles = React.useMemo(() => allArticles.filter((a: { status: string; }) => a.status === 'published'), [allArticles]);
    const [tagArticles, setTagArticles] = useState<Article[]>([]);
    const [tagName, setTagName] = useState<string>("");
    const locale = useLocale();
    useDocTitle(`${tagName}`);

    const cleanTagName = (name: string): string => {
        return name
            .replace(/\s*\d+\s*$/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    useEffect(() => {
        if (articles.length > 0 && slug) {
            const currentSlug = slug.toLowerCase();

            const filtered = articles.filter((article: Article) => {
                // Check Tag match
                const tagMatch = article.tags?.some(tag =>
                    tag.slug.toLowerCase() === currentSlug ||
                    tag.name.toLowerCase() === currentSlug
                );

                return tagMatch;
            });

            setTagArticles(filtered);

            // Determine Display Name
            if (filtered.length > 0) {
                // Try to find exact tag match for naming
                const matchArticle = filtered.find((a: any) =>
                    a.tags?.some((t: any) => t.slug.toLowerCase() === currentSlug)
                );

                if (matchArticle) {
                    const matchedTag = matchArticle.tags?.find((t: any) => t.slug.toLowerCase() === currentSlug);
                    if (matchedTag) {
                        setTagName(matchedTag.name);
                    } else {
                        setTagName(cleanTagName(slug.replace(/-/g, ' ')));
                    }
                } else {
                    setTagName(cleanTagName(slug.replace(/-/g, ' ')));
                }
            } else {
                const formattedSlug = slug
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');

                setTagName(cleanTagName(formattedSlug));
            }
        }
    }, [articles, slug]);

    // --- Translation Logic ---
    const [textsToTranslate, setTextsToTranslate] = useState<string[]>([]);

    useEffect(() => {
        if (locale === 'en' || !tagName) return;

        const texts: string[] = [];
        // 1. Tag Name
        texts.push(tagName);

        // 2. Articles (Title + Content Snippet)
        tagArticles.forEach(a => {
            texts.push(a.title);
            texts.push(a.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...");
        });

        setTextsToTranslate(texts);
    }, [tagName, tagArticles, locale]);

    const { translatedText, loading: translating } = useGoogleTranslate(
        locale !== 'en' && textsToTranslate.length > 0 ? textsToTranslate : null
    );

    const displayTagName = React.useMemo(() => {
        if (locale === 'en' || !translatedText || !Array.isArray(translatedText) || translatedText.length === 0) {
            return tagName;
        }
        return translatedText[0];
    }, [tagName, translatedText, locale]);

    const displayArticles = React.useMemo(() => {
        if (locale === 'en' || !translatedText || !Array.isArray(translatedText) || translatedText.length === 0) {
            return tagArticles;
        }

        // First element is tag name, so articles start at index 1
        return tagArticles.map((article, index) => {
            const titleIdx = 1 + (index * 2);
            const contentIdx = 1 + (index * 2) + 1;

            return {
                ...article,
                title: translatedText[titleIdx] || article.title,
                content: translatedText[contentIdx] || article.content
            };
        });
    }, [tagArticles, translatedText, locale]);


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
                    {displayTagName}
                    {translating && <span className="text-sm text-[#C9A227] animate-pulse font-normal">Translating...</span>}
                </h1>
                <p className="text-gray-600 max-w-2xl  text-sm sm:text-base">
                    Explore the latest insights, updates, and reports in the{" "}
                    <span className="font-medium text-gray-800 capitalize">{displayTagName}</span>{" "}
                    topic.
                </p>
                <div className="w-24 h-1 bg-black/80  rounded-full mt-3"></div>
            </div>

            {/* Article list */}
            {tagArticles.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium py-20">
                    No articles found for this tag.
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
                                time={timeAgo(article.createdAt)}
                            // time={new Date(article.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                            // views={String(0)}
                            // likes={String(0)}
                            />
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
