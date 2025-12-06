export interface RolePermission {
    _id: string;
    name: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
}

export interface Role {
    id: string;
    name: string;
    slug: string;
    description?: string;
    isDeleted: boolean;
    isActive?: boolean;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt?: string;
    updatedAt?: string;
}

export interface RoleResponse {
    success: boolean;
    message: string;
    data: Role[];
}

export interface CreateRoleRequest {
    name: string;
    description?: string;
}

export interface UpdateRoleRequest {
    id: string;
    name: string;
    description?: string;
}

export interface RolesState {
    roles: Role[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
