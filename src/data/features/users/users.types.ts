import { Role, Permission } from "../profile/profile.types";

export interface User {
    _id: string;
    name: string;
    email: string;
    username: string;
    isActive: boolean;
    isVerified: boolean;
    preferredLanguage: string;
    createdAt: string;
    updatedAt: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    } | null;
    roles: Role[];
    permissions: Permission[];
    profilePicture?: string | null;

    // Verification details
    verifiedBy?: string | null;
    verifiedAt?: string | null;
    unverifiedBy?: {
        _id: string;
        name: string;
        email: string;
    } | null;
    unverifiedAt?: string | null;

    // Law Firm Access Control Fields
    officeId?: string | null;
    office?: {
        _id: string;
        name: string;
        code: string;
    } | null;
    practiceAreaIds?: string[];
    practiceAreas?: Array<{
        _id: string;
        name: string;
        slug: string;
    }>;
    clearanceLevel?: number; // 1-5 scale
    accessEndDate?: string | null;
    conflictList?: string[];
    reportingTo?: string | null;
    reportingManager?: {
        _id: string;
        name: string;
        email: string;
    } | null;
    hierarchyLevel?: number | null;
}

export interface UserFilter {
    search?: string;
    name?: string;
    email?: string;
    isActive?: boolean | string;
    isVerified?: boolean | string;
    roleId?: string;
    roleName?: string;
    createdBy?: string;
    officeId?: string;
    practiceAreaId?: string;
    clearanceLevel?: number | string;
    page?: number;
    limit?: number;
}

export interface UserListResponse {
    success: boolean;
    message: string;
    data: {
        data: User[];
        total: number;
        page: number;
        limit: number;
    };
}

export interface UserVerificationResponse {
    success: boolean;
    message: string;
    data: {
        _id: string;
        isActive: boolean;
        isVerified: boolean;
        // Include other fields if necessary, but Partial<User> might be safer if structure varies 
        // or define explicitly based on the payload provided.
        // The payload showed roles without names.
        [key: string]: any;
    };
}

export interface UsersState {
    users: User[];
    total: number;
    page: number;
    limit: number;
    loading: boolean;
    error: string | null;
    message: string | null;
}
