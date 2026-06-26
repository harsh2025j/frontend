import { useState, useEffect } from "react";
import { articleApi } from "@/data/services/article-service/article-service";
import { Article } from "@/data/features/article/article.types";

export const useCategoryArticles = (categorySlug: string, limit: number = 6, skipFetch: boolean = false, page: number = 1) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (skipFetch) {
            setLoading(false);
            return;
        }

        // Read from cache immediately after mount (hydration-safe)
        if (typeof window !== "undefined") {
            const cached = localStorage.getItem(`articles_cache_${categorySlug}_page_${page}`);
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.length > 0) {
                        setArticles(parsed);
                        setLoading(false);
                    }
                } catch (e) {
                    console.error("Failed to parse articles cache", e);
                }
            }
        }

        const fetchData = async () => {
            try {
                // If we already have articles, don't show the main loader (background fetch)
                if (articles.length === 0) {
                    setLoading(true);
                }
                const response = await articleApi.fetchArticles({ category: categorySlug, limit, page, status: 'published' });
                const data = response.data.data || [];
                setArticles(data);

                if (typeof window !== "undefined") {
                    localStorage.setItem(`articles_cache_${categorySlug}_page_${page}`, JSON.stringify(data));
                }
            } catch (err: any) {
                setError(err.message || "Failed to fetch articles");
            } finally {
                setLoading(false);
            }
        };

        if (categorySlug && !skipFetch) {
            fetchData();
        }
    }, [categorySlug, limit, skipFetch, page]);

    return { articles, loading, error };
};

