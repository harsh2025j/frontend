export interface SearchResult {
    id: string;
    title: string;
    type: 'article' | 'judgment' | 'case' | 'judge';
    slug?: string;
    description?: string;
    date?: string;
    thumbnail?: string;
    status?: string;
    // For specific types
    caseNumber?: string;
    court?: string;
    designation?: string;
    petitioner?: string;
    respondent?: string;
    category?: {
        name: string;
        slug: string;
    };
    authorId?: string;
    pdfUrl?: string;
}

export interface SearchSuggestion {
    id: string;
    title: string;
    type: string;
    slug?: string;
    pdfUrl?: string;
}

// The raw item from the API
export interface SearchItem {
    id: string;
    title: string;
    subHeadline?: string;
    body?: string; 
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
