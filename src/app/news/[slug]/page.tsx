import React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient";
import { Article } from "@/data/features/article/article.types";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";

// Force dynamic rendering as we depend on the slug param
export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ slug: string; locale: string }>;
};

// Function to fetch article data
async function getArticle(slug: string): Promise<Article | null> {
    try {
        const res = await fetch(`${API_BASE_URL}/articles/${slug}`, {
            cache: "no-store", // Ensure fresh data
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
            title: "Article Not Found",
        };
    }

    // intentionally stripping HTML tags from content for description
    const description = article.subHeadline || article.content.replace(/<[^>]*>?/gm, "").slice(0, 160) + "...";

    return {
        title: article.title,
        description: description,
        openGraph: {
            title: article.title,
            description: description,
            url: `https://www.sajjadhusainlawassociates.com/news/${slug}`, // Ideally base URL should be env var
            siteName: "Sajjad Husain Law Associates",
            images: [
                {
                    url: article.thumbnail || "https://ibb.co/LD3XGttL", // Fallback image
                    width: 200, // Setting small width to encourage summary card
                    height: 200, // Setting small height
                    alt: article.title,
                },
            ],
            locale: locale,
            type: "article",
            publishedTime: article.createdAt,
            authors: article.authors ? [article.authors] : undefined,
            section: article.category?.name,
            tags: article.tags?.map(t => t.name),
        },
        twitter: {
            card: "summary",
            title: article.title,
            description: description,
            images: [article.thumbnail || "https://ibb.co/LD3XGttL"],
        },
        alternates: {
            canonical: `https://www.sajjadhusainlawassociates.com/news/${slug}`,
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