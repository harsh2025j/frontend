import apiClient from "@/data/services/apiConfig/apiClient";
import { UserFilter, UserListResponse } from "../../features/users/users.types";

export const teamsApi = {
    fetchTeams: async (filters?: UserFilter) => {
        const params = new URLSearchParams();
        if (filters) {
            if (filters.name) params.append("name", filters.name);
            if (filters.email) params.append("email", filters.email);
            if (filters.isActive !== undefined && filters.isActive !== "")
                params.append("isActive", String(filters.isActive));
            if (filters.isVerified !== undefined && filters.isVerified !== "")
                params.append("isVerified", String(filters.isVerified));
            if (filters.roleId) params.append("roleId", filters.roleId);
            if (filters.officeId) params.append("officeId", filters.officeId);
            if (filters.practiceAreaId) params.append("practiceAreaId", filters.practiceAreaId);
            if (filters.clearanceLevel !== undefined && filters.clearanceLevel !== "")
                params.append("clearanceLevel", String(filters.clearanceLevel));
            if (filters.page) params.append("page", String(filters.page));
            if (filters.limit) params.append("limit", String(filters.limit));
        }

        try {
            const response = await apiClient.get<UserListResponse>(
                `/users/teams?${params.toString()}`
            );
            return response.data;
        } catch (error: any) {
            console.error("teamsApi fetchTeams ERROR:", error);
            throw error;
        }
    },
};
