import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";
import { Article } from "@/data/features/article/article.types";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";

// Revalidate the page in the background every 1 hour (3600 seconds)
// This enables Incremental Static Regeneration (ISR) and slashes SSR costs
export const revalidate = 3600;

const SITE_URL = "https://www.sajjadhusainlawassociates.com"; // production
// const SITE_URL = "https://unimpeded-sprung-banter.ngrok-free.dev"; // dev (url)
// ---------------------------------------------------------------------
type Props = {
    params: Promise<{ slug: string; locale: string }>;
};

// Function to fetch article data
async function getArticle(slug: string): Promise<Article | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/articles/${slug}`, {
            next: { revalidate: 3600 }, // Cache response for 1 hour to prevent constant API calls
            headers: {
                // "ngrok-skip-browser-warning": "true",
            },
        });

        if (!res.ok) {
            if (res.status === 404) return null;
            throw new Error(`Failed to fetch article: ${res.status}`);
        }

        const data = await res.json();
        return data.data || null;
    } catch (error) {
        console.error("Error fetching article:", error);
        return null;
    }
}

// Generate Metadata for OG Tags
export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // read route params
    const { slug, locale } = await params;

    // fetch data
    const article = await getArticle(slug);

    if (!article) {
        return {
            metadataBase: new URL(SITE_URL),
            title: "Article Not Found",
        };
    }

    // intentionally stripping HTML tags from content for description
    const description = article.subHeadline || article.content.replace(/<[^>]*>?/gm, "").slice(0, 160) + "...";

    // --- SEO ENHANCEMENT ---
    // Add semantic keywords to the title to rank for "judgment", "news", "update" etc.
    const isJudgment = article.category?.name?.toLowerCase().includes('judgment') || article.title.toLowerCase().includes('court');
    const seoSuffix = isJudgment ? " | Latest Judgment & Legal News" : " | Latest Update & News";
    const seoTitle = `${article.title}${seoSuffix} - Sajjad Husain Law Associates`;

    return {
        metadataBase: new URL(SITE_URL),
        title: seoTitle,
        description: description,
        keywords: [
            article.title,
            article.category?.name || "Legal News",
            "judgment update",
            "court order",
            "legal news india",
            "latest judgment",
            "legal case analysis",
            ...(article.tags?.map(t => t.name) || [])
        ],
        openGraph: {
            title: seoTitle,
            description: description,
            url: `${SITE_URL}/${locale}/news/${slug}`,
            siteName: "Sajjad Husain Law Associates",
            locale: locale,
            type: "article",
            publishedTime: article.createdAt,
            authors: article.authors ? [article.authors] : undefined,
            section: article.category?.name,
            tags: article.tags?.map(t => t.name),
            images: [
                {
                    url: `${SITE_URL}/${locale}/news/${slug}/opengraph-image?format=.jpg`,
                    width: 1200,
                    height: 630,
                    alt: "News Article Preview",
                    type: "image/jpeg"
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: seoTitle,
            description: description,
            images: [`${SITE_URL}/${locale}/news/${slug}/opengraph-image`]
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}/news/${slug}`,
        }
    };
}

export default async function ArticlePage({ params }: Props) {
    const { slug, locale } = await params;
    const article = await getArticle(slug);

    if (!article) {
        notFound();
    }

    // JSON-LD for NewsArticle SEO
    const newsArticleJsonLd = {
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": `${SITE_URL}/${locale}/news/${slug}`
        },
        "headline": article.title,
        "description": article.subHeadline || article.content.replace(/<[^>]*>?/gm, "").slice(0, 160) + "...",
        "image": [
            `${SITE_URL}/${locale}/news/${slug}/opengraph-image`
        ],
        "datePublished": article.createdAt,
        "dateModified": article.updatedAt || article.createdAt,
        "author": [{
            "@type": "Person",
            "name": article.authors || "Sajjad Husain Law Associates",
            "url": SITE_URL
        }],
        "publisher": {
            "@type": "Organization",
            "name": "Sajjad Husain Law Associates",
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/logo-gold.png`
            }
        },
        "articleSection": article.category?.name || "Legal News",
        "keywords": [article.category?.name, "Legal News", "Court Updates"].join(",")
    };

    // Breadcrumb Schema
    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": `${SITE_URL}/${locale}`
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": article.category?.name || "News",
                "item": `${SITE_URL}/${locale}/category/${article.category?.slug || 'news'}`
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": article.title,
                "item": `${SITE_URL}/${locale}/news/${slug}`
            }
        ]
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(newsArticleJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />
            <ArticleClient initialArticle={article} slug={slug} />
        </>
    );
}