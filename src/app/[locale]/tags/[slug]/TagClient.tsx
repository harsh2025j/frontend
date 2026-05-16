"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Link, useRouter, usePathname } from "@/i18n/routing";
import { Article } from "@/data/features/article/article.types";
import Loader from "@/components/ui/Loader";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";
import { useDocTitle } from "@/hooks/useDocTitle";
import { timeAgo } from "@/lib/utils/timeAgo";
import { articleApi } from "@/data/services/article-service/article-service";
import Pagination from "@/components/Pagination";
import NewsCard from "@/components/ui/NewsCard";
import { AdBanner, AdSidebar, useAdvertisement } from "@/components/ads/StandardAds";
import { isAdmin as checkIsAdmin } from "@/utils/permissions";
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";

const ITEMS_PER_PAGE = 12;

export default function TagClient() {
    const { currentSubscription } = useSelector((state: RootState) => state.subscription);
    const { user } = useSelector((state: RootState) => state.auth);
    const isPremium = currentSubscription?.status === "active";
    const isAdmin = checkIsAdmin(user as any);

    // Check for Sidebar Ad presence
    const { ad: sidebarAd, loading: adLoading } = useAdvertisement("CATEGORY_SIDEBAR_1");
    const hasActiveAd = !adLoading && sidebarAd && sidebarAd.isActive;

    // Content should only shrink if there's a reason to show the sidebar (Not Premium, Not Admin, and Has Ad)
    const showSidebar = !isPremium && !isAdmin && hasActiveAd;

    const params = useParams();
    const slug = params.slug as string;
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const locale = useLocale();

    const [articles, setArticles] = useState<Article[]>([]);
    const currentPage = parseInt(searchParams.get("page") || "1");
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tagName, setTagName] = useState("");

    useDocTitle(`${tagName || "Tag"} | Sajjad Husain Law Associates`);

    const cleanTagName = (name: string) =>
        name.replace(/\s*\d+\s*$/g, "").replace(/\s+/g, " ").trim();

    const fetchData = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        try {
            const res = await articleApi.fetchArticles({
                tag: slug,
                page: currentPage,
                limit: ITEMS_PER_PAGE,
            });
            const data = res.data as any;
            const items: Article[] = data.data ?? [];
            setArticles(items);
            setTotalPages(data.meta?.total_pages ?? 1);
            setTotalItems(data.meta?.total_items ?? 0);

            if (items.length > 0) {
                const currentSlugLower = slug.toLowerCase();
                const matchedTag = items
                    .flatMap((a) => a.tags || [])
                    .find((t: any) => t.slug?.toLowerCase() === currentSlugLower || t.name?.toLowerCase() === currentSlugLower);

                setTagName(matchedTag ? cleanTagName(matchedTag.name) : cleanTagName(slug.replace(/-/g, " ")));
            } else if (currentPage === 1) {
                const formatted = slug
                    .split("-")
                    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(" ");
                setTagName(cleanTagName(formatted));
            }
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    }, [slug, currentPage]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const [textsToTranslate, setTextsToTranslate] = useState<string[]>([]);
    useEffect(() => {
        if (locale === "en" || !tagName) return;
        const texts: string[] = [tagName];
        articles.forEach((a) => {
            texts.push(a.title);
            texts.push(a.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...");
        });
        setTextsToTranslate(texts);
    }, [tagName, articles, locale]);

    const { translatedText, loading: translating } = useGoogleTranslate(
        locale !== "en" && textsToTranslate.length > 0 ? textsToTranslate : null
    );

    const displayTagName = React.useMemo(() => {
        if (locale === "en" || !translatedText?.length) return tagName;
        return translatedText[0];
    }, [tagName, translatedText, locale]);

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
            {/* Top Tag Banner */}
            <div className="mb-10">
                <AdBanner slotId="CATEGORY_BANNER_1" />
            </div>

            <div className="text-left mb-10 space-y-2">
                <h1 className="text-4xl text-[#0A2342] sm:text-5xl font-bold capitalize flex items-center gap-3">
                    {displayTagName}
                    {translating && <span className="text-sm text-[#C9A227] animate-pulse font-normal">Translating...</span>}
                </h1>
                <p className="text-gray-600 max-w-2xl text-sm sm:text-base">
                    Explore the latest insights, updates, and reports in the{" "}
                    <span className="font-medium text-gray-800 capitalize">{displayTagName}</span>{" "}
                    topic.
                </p>
                <div className="w-24 h-1 bg-black/80 rounded-full mt-3" />
                <p className="text-sm text-gray-400 pt-1">{totalItems} article{totalItems !== 1 ? "s" : ""}</p>
            </div>

            {!loading && displayArticles.length === 0 ? (
                <div className="text-center text-gray-500 text-lg font-medium py-20">
                    No articles found for this tag.
                </div>
            ) : (
                <div className={`grid grid-cols-1 ${showSidebar ? 'lg:grid-cols-4' : 'lg:grid-cols-1'} gap-8`}>
                    {/* Main Content */}
                    <div className={`${showSidebar ? 'lg:col-span-3' : 'lg:col-span-4'} space-y-10`}>
                        <div className={`grid grid-cols-1 md:grid-cols-2 ${showSidebar ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 items-stretch`}>
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
                            onPageChange={(page) => {
                                const params = new URLSearchParams(searchParams.toString());
                                params.set("page", page.toString());
                                router.push(`${pathname}?${params.toString()}`);
                            }}
                        />
                    </div>

                    {/* Sidebar Ad (Only if needed) */}
                    {showSidebar && (
                        <div className="lg:col-span-1">
                            <div className="sticky top-24">
                                <AdSidebar slotId="CATEGORY_SIDEBAR_1" withContainer />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
