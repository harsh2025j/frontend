import apiClient from "@/data/services/apiConfig/apiClient";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import { SearchApiResponse, SearchResult, SearchItem } from "./search.types";

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

    // New method for full page search with pagination
    searchContentWithPagination: async (
        query: string,
        page: number = 1,
        limit: number = 10,
        signal?: AbortSignal
    ): Promise<{ data: SearchResult[]; meta?: SearchApiResponse['data']['meta'] }> => {
        try {
            // FIX: Remove API_BASE_URL as apiClient handles it
            const response = await apiClient.get<SearchApiResponse>(
                `/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                { signal }
            );

            // console.log("Search API Raw Response:", response.data);

            if (!response.data || !response.data.success || !response.data.data || !response.data.data.data) {
                return { data: [] };
            }

            return {
                data: mapItemsToResults(response.data.data.data),
                meta: response.data.data.meta
            };
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') throw error;
            console.error("Paginated search failed:", error);
            return { data: [] };
        }
    }
};

// Helper to map API items to Frontend Results
const mapItemsToResults = (items: SearchItem[]): SearchResult[] => {
    return items.map((item: SearchItem) => ({
        id: item.id,
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
        status: (item as any).status || 'pending', // Default to pending if not provided
        category: item.category,
        // FIX: Check multiple fields for author name
        authors: (item as any).author?.name || (item as any).authors || (item as any).author || (item as any).advocateName || (item as any).user?.name || (item as any).creator?.name || "Unknown",
        authorId: (item as any).authorId || (item as any).author?._id || (item as any).user?._id || (item as any).creator?._id
    }));
};
