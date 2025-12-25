export interface SearchResult {
    id: string;
    title: string;
    type: 'article' | 'judgment' | 'case';
    slug?: string;
    description?: string;
    date?: string;
    thumbnail?: string;
    status?: string;
    firstPage?: string;
    lastPage?: string;
    category?: {
        name: string;
        slug: string;
    };
    authors?: string;
    authorId?: string;
}

// The raw item from the API
export interface SearchItem {
    id: string;
    title: string;
    subHeadline?: string;
    body?: string; // Was 'content' in previous assumption, now 'body'
    slug: string;
    thumbnail?: string;
    createdAt: string;
    category?: {
        name: string;
        slug: string;
    };
    author?: {
        name: string;
    };
    authors?: string;
    authorId?: string;
}

// The API response wrapper
export interface SearchApiResponse {
    success: boolean;
    message: string;
    data: {
        data: SearchItem[]; // The actual array of items
        meta: {
            totalItems: number;
            currentPage: number;
            itemsPerPage: number;
            totalPages: number;
        };
    };
}
