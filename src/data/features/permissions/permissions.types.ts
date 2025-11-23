export interface Permission {
    _id: string;
    name: string;
    isDeleted: boolean;
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
}

export interface UpdatePermissionRequest {
    id: string;
    name: string;
}

export interface PermissionsState {
    permissions: Permission[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
