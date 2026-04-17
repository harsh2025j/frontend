import apiClient from "@/data/services/apiConfig/apiClient";
import { articleApi } from "@/data/services/article-service/article-service";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import { SearchApiResponse, SearchResult, SearchItem, SearchSuggestion } from "./search.types";
import { Article } from "../article/article.types";

export const searchService = {
    // 1. SUGGESTIONS: Fast, title-only for header dropdown
    getSuggestions: async (query: string, signal?: AbortSignal): Promise<SearchSuggestion[]> => {
        if (!query.trim()) return [];
        try {
            const response = await apiClient.get<any>(
                `/search/suggestions?q=${encodeURIComponent(query)}`,
                { signal }
            );
            // Response structure: { success: true, data: { data: [] } }
            return response.data?.data?.data || [];
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') throw error;
            console.error("Suggestions failed:", error);
            return [];
        }
    },

    // 2. UNIVERSAL SEARCH: Aggregated, mixed results for Search Page "All" tab or general search
    getUniversalSearch: async (
        query: string,
        page: number = 1,
        limit: number = 10,
        signal?: AbortSignal
    ): Promise<{ data: SearchResult[]; meta?: any }> => {
        try {
            const response = await apiClient.get<any>(
                `/search/universal?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                { signal }
            );

            // The response structure from universal search is { success: true, data: { data: SearchResult[], meta: {...} } }
            const items = response.data?.data?.data || [];
            const meta = response.data?.data?.meta;

            return {
                data: mapItemsToResults(items),
                meta
            };
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') throw error;
            console.error("Universal search failed:", error);
            return { data: [] };
        }
    },

    // 3. CATEGORY SPECIFIC: Use existing endpoints for specific tabs
    getCategorySearch: async (
        category: 'articles' | 'judges' | 'cases' | 'judgments',
        query: string,
        page: number = 1,
        limit: number = 10,
        signal?: AbortSignal
    ): Promise<{ data: SearchResult[]; meta?: any }> => {
        try {
            const endpoint = category === 'articles' ? '/search' : `/search/${category}`;
            const response = await apiClient.get<any>(
                `${endpoint}?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
                { signal }
            );

            // Response structure: { success: true, data: { data: [], meta: {} } }
            const items = response.data?.data?.data || [];
            const meta = response.data?.data?.meta;

            return {
                data: mapItemsToResults(items),
                meta
            };
        } catch (error: any) {
            if (error.name === 'CanceledError' || error.name === 'AbortError') throw error;
            console.error(`${category} search failed:`, error);
            return { data: [] };
        }
    }
};

// Updated helper to map ANY search item to a standard Result
function mapItemsToResults(items: any[]): SearchResult[] {
    return items.map((item: any) => {
        // Handle type normalization from OpenSearch index name
        const rawType = item.type || 'article';
        const typeMapping: Record<string, 'article' | 'judgment' | 'case' | 'judge'> = {
            'article': 'article',
            'judgment': 'judgment',
            'case': 'case',
            'judge': 'judge'
        };

        return {
            id: item.id || item._id,
            title: item.title || item.name || item.caseNumber || "Untitled",
            type: typeMapping[rawType] || 'article',
            slug: item.slug,
            description: item.subHeadline || item.summary || (item.body ? item.body.replace(/<[^>]*>/g, '').substring(0, 160) + '...' : ''),
            date: item.createdAt || item.judgmentDate || item.filingDate
                ? new Date(item.createdAt || item.judgmentDate || item.filingDate).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                })
                : undefined,
            thumbnail: item.thumbnail || item.photoUrl,
            status: item.status,
            category: item.category,
            // Type-specific fields
            caseNumber: item.caseNumber,
            court: item.court,
            petitioner: item.petitioner,
            respondent: item.respondent,
            designation: item.designation,
            authorId: item.authorId || item.creatorId
        };
    });
}
