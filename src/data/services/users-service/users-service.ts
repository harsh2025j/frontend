import apiClient from "@/data/services/apiConfig/apiClient";
import { UserFilter, UserListResponse, UserVerificationResponse } from "../../features/users/users.types";
import { permission } from "process";

export const usersApi = {
    fetchUsers: async (filters?: UserFilter) => {
        // console.log("usersApi fetchUsers", filters);

        const params = new URLSearchParams();
        if (filters) {
            if (filters.name) params.append("name", filters.name);
            if (filters.email) params.append("email", filters.email);
            if (filters.isActive !== undefined && filters.isActive !== "")
                params.append("isActive", String(filters.isActive));
            if (filters.isVerified !== undefined && filters.isVerified !== "")
                params.append("isVerified", String(filters.isVerified));
            if (filters.roleId) params.append("roleId", filters.roleId);
            if (filters.createdBy) params.append("createdBy", filters.createdBy);
        }

        try {
            const response = await apiClient.get<UserListResponse>(
                `/users?${params.toString()}`,
                {
                    headers: {
                        // "ngrok-skip-browser-warning": "true",
                    },
                }

            );

            // console.log("usersApi fetchUsers responsdfdsfse:", response);
            return response.data;
        } catch (error: any) {
            console.error("usersApi fetchUsers ERROR:", error);
            throw error;
        }
    },

    verifyUser: async (userId: string, isVerified: boolean) => {
        try {
            // console.log(userId, isVerified);
            const response = await apiClient.patch<UserVerificationResponse>(`/users/${userId}/verify`, { isVerified });
            return response.data;
        } catch (error: any) {
            console.error("usersApi verifyUser ERROR:", error);
            throw error;
        }
    },

    getUserById: async (userId: string) => {
        try {
            const response = await apiClient.get<UserVerificationResponse>(`/users/${userId}`);
            // Reuse UserVerificationResponse as it contains a single user data object, 
            // or we might need a specific/generic SingleUserResponse if strictness matters.
            // Assuming GET /users/:id returns { success: true, data: User } similar to other endpoints.
            return response.data;
        } catch (error: any) {
            console.error("usersApi getUserById ERROR:", error);
            throw error;
        }
    },

    assignUserRoles: async (userId: string, data: { roleIds: string[]; permissionIds: string[] }) => {
        try {
            // console.log(data);
            
            const response = await apiClient.post(`/assign/${userId}`,data);
            return response.data;
        } catch (error: any) {
            console.error("usersApi assignUserRoles ERROR:", error);
            throw error;
        }
    },
};
