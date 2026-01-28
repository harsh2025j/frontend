export interface Office {
    id: string;
    name: string;
    slug: string;
    code: string;
    city?: string;
    state?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
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

export interface OfficeResponse {
    success: boolean;
    message: string;
    data: Office[];
}

export interface CreateOfficeRequest {
    name: string;
    code: string;
    city?: string;
    state?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    isActive?: boolean;
}

export interface UpdateOfficeRequest {
    id: string;
    name?: string;
    code?: string;
    city?: string;
    state?: string;
    address?: string;
    phoneNumber?: string;
    email?: string;
    isActive?: boolean;
}

export interface OfficesState {
    offices: Office[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
