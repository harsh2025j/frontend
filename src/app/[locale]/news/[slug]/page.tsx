import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";
import { Article } from "@/data/features/article/article.types";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";

// Force dynamic rendering as we depend on the slug param
export const dynamic = "force-dynamic";

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
            cache: "no-store", // Ensure fresh data
            headers: {
                "ngrok-skip-browser-warning": "true",
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

    return {
        metadataBase: new URL(SITE_URL),
        title: article.title,
        description: description,
        openGraph: {
            title: article.title,
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
            title: article.title,
            description: description,
            images: [`${SITE_URL}/${locale}/news/${slug}/opengraph-image`]
        },
        alternates: {
            canonical: `${SITE_URL}/${locale}/news/${slug}`,
        }
    };
}

export default async function ArticlePage({ params }: Props) {
    const { slug } = await params;
    const article = await getArticle(slug);

    if (!article) {
        notFound();
    }

    return <ArticleClient initialArticle={article} slug={slug} />;
}