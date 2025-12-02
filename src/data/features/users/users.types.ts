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
}

export interface UserFilter {
    name?: string;
    email?: string;
    isActive?: boolean | string;
    isVerified?: boolean | string;
    roleId?: string;
    createdBy?: string;
}

export interface UserResponse {
    success: boolean;
    message: string;
    data: User[];
}

export interface UsersState {
    users: User[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
