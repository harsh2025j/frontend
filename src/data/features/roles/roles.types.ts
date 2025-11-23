export interface Role {
    _id: string;
    name: string;
    permissions: string[];
    isDeleted: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface RoleResponse {
    success: boolean;
    message: string;
    data: Role | Role[];
}

export interface CreateRoleRequest {
    name: string;
    permissions: string[];
}

export interface UpdateRoleRequest {
    id: string;
    name?: string;
    permissions?: string[];
}

export interface RolesState {
    roles: Role[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
