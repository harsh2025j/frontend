export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    children: Category[];
    createdAt?: string;
    updatedAt?: string;
}

export interface CategoryState {
    categories: Category[];
    loading: boolean;
    error: string | null;
    message: string | null;
}

export interface CreateCategoryRequest {
    name: string;
    slug: string;
    parentId?: string | null;
}

export interface UpdateCategoryRequest {
    id: string;
    name: string;
    slug: string;
    parentId?: string | null;
}

export interface CategoryResponse {
    success: boolean;
    message: string;
    data: Category[];
}
