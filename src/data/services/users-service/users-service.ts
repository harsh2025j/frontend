import apiClient from "@/data/services/apiConfig/apiClient";
import { UserFilter, UserResponse } from "../../features/users/users.types";

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
            const response = await apiClient.get<UserResponse>(
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
};
