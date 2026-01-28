export interface PracticeArea {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isActive: boolean;
    isDeleted: boolean;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface PracticeAreaResponse {
    success: boolean;
    message: string;
    data: PracticeArea[];
}

export interface CreatePracticeAreaRequest {
    name: string;
    description?: string;
    isActive?: boolean;
}

export interface UpdatePracticeAreaRequest {
    id: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface PracticeAreasState {
    practiceAreas: PracticeArea[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
