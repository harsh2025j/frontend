import apiClient from "@/data/services/apiConfig/apiClient";
import { articleApi } from "@/data/services/article-service/article-service";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import { SearchApiResponse, SearchResult, SearchItem } from "./search.types";
import { Article } from "../article/article.types";

export const searchService = {
    // Original method for dropdown (quick search)
    searchContent: async (query: string, signal?: AbortSignal): Promise<SearchResult[]> => {
        try {
            const response = await apiClient.get<SearchApiResponse>(`/search?q=${encodeURIComponent(query)}`, {
                signal
            });

            if (!response.data || !response.data.success || !response.data.data || !response.data.data.data) {
                return [];
            }

            return mapItemsToResults(response.data.data.data);
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') throw error;
            console.error("Search service failed:", error);
            return [];
        }
    },

    // 2. DETAIL PATH: 2-Step search to bypass AWS payload limits on the Search Page
    searchContentWithPagination: async (
        query: string,
        page: number = 1,
        limit: number = 10,
        signal?: AbortSignal
    ): Promise<{ data: SearchResult[]; meta?: SearchApiResponse['data']['meta'] }> => {
        try {
            // Step A: Hit the optimized /search endpoint to natively find WHICH articles match.
            // Since you excluded heavy fields in the backend, this is lightning fast.
            const response = await apiClient.get<SearchApiResponse>(
                `/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                { signal }
            );

            const itemsFromStepA = response.data?.data?.data || (Array.isArray(response.data?.data) ? response.data.data : []);
            const meta = response.data?.data?.meta || (response.data as any)?.meta;

            if (!itemsFromStepA || itemsFromStepA.length === 0) {
                return { data: [], meta };
            }

            // Get exactly the IDs for the current page
            const ids = itemsFromStepA.map((item: any) => item.id || item._id);

            // Step B: Fetch only those specific articles in a focused batch.
            // The search page skeleton loader will naturally stay active until this finishes.
            try {
                const detailedArticlesResponse = await articleApi.fetchMultipleArticles(ids);
                const detailedArticles: Article[] = detailedArticlesResponse.data?.data || detailedArticlesResponse.data || [];

                // Map full articles to Rich Cards
                const data = mapDetailedArticlesToResults(detailedArticles);
                return { data, meta };
            } catch (multiError) {
                console.error("Multi-fetch failed, falling back to minimal results", multiError);
                return { data: mapItemsToResults(itemsFromStepA), meta };
            }
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') throw error;
            console.error("Paginated search failed:", error);
            return { data: [] };
        }
    }
};

// Helper to map API items to Frontend Results (Fallback/Step A)
function mapItemsToResults(items: any[]): SearchResult[] {
    return items.map((item: any) => ({
        id: item.id || item._id,
        title: item.title,
        type: item.category?.slug?.includes('judgment') ? 'judgment' : 'article',
        slug: item.slug,
        description: item.body
            ? item.body.replace(/<[^>]*>/g, '').substring(0, 160) + '...'
            : item.subHeadline || '',
        date: item.createdAt
            ? new Date(item.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric'
            })
            : undefined,
        thumbnail: item.thumbnail,
        status: item.status || 'pending', // Default to pending if not provided
        category: item.category,
        // FIX: Check multiple fields for author name
        authors: item.author?.name || item.authors || item.author || item.advocateName || item.user?.name || item.creator?.name || "Unknown",
        authorId: item.authorId || item.author?._id || item.user?._id || item.creator?._id
    }));
}

// Helper: Map full articles to Rich Cards
function mapDetailedArticlesToResults(articles: any[]): SearchResult[] {
    return articles.map((item: any) => ({
        id: item.id || item._id,
        title: item.title,
        type: 'article',
        slug: item.slug,
        description: item.subHeadline || item.aiSummary || (item.content ? item.content.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ''),
        date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
        }) : undefined,
        thumbnail: item.thumbnail,
        status: item.status || 'pending',
        category: item.category,
        authors: item.authors || item.advocateName || item.author?.name || "Unknown",
        authorId: item.authorId || item.user?._id || item.creator?._id
    }));
}
