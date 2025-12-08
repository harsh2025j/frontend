import { Role, Permission } from "../profile/profile.types";

export interface User {
    _id: string;
    name: string;
    email: string;
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
}

export interface UserFilter {
    name?: string;
    email?: string;
    isActive?: boolean | string;
    isVerified?: boolean | string;
    roleId?: string;
    createdBy?: string;
}

export interface UserListResponse {
    success: boolean;
    message: string;
    data: User[];
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
    loading: boolean;
    error: string | null;
    message: string | null;
}
