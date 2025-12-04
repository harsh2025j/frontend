import { useState, useEffect } from "react";
import { articleApi } from "@/data/services/article-service/article-service";
import { Article } from "@/data/features/article/article.types";

export const useCategoryArticles = (categorySlug: string, limit: number = 6) => {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // Assuming fetchArticles accepts a category slug or ID. 
                // If backend expects ID, we might need to fetch category ID first or use a different endpoint.
                // For now, passing it as a query param assuming backend handles it or we filter client side (not ideal but fallback).
                // Ideally: params: { category: categorySlug, limit }
                const response = await articleApi.fetchArticles({ category: categorySlug, limit });

                // Adjust based on actual API response structure
                const data = response.data.data || [];
                setArticles(data);
            } catch (err: any) {
                setError(err.message || "Failed to fetch articles");
            } finally {
                setLoading(false);
            }
        };

        if (categorySlug) {
            fetchData();
        }
    }, [categorySlug, limit]);

    return { articles, loading, error };
};
