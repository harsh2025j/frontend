export interface Permission {
    _id: string;
    name: string;
    description?: string;
    isDeleted: boolean;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface PermissionResponse {
    success: boolean;
    message: string;
    data: Permission | Permission[];
}

export interface CreatePermissionRequest {
    name: string;
    description?: string;
}

export interface UpdatePermissionRequest {
    id: string;
    name: string;
    description?: string;
}

export interface PermissionsState {
    permissions: Permission[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
