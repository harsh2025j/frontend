import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { CreateRoleRequest, UpdateRoleRequest } from "../../features/roles/roles.types";

export const rolesApi = {
    fetchRoles: async () => {
        return await apiClient.get(API_ENDPOINTS.ROLES.BASE, {
            headers: {
                // "ngrok-skip-browser-warning": "true",
            },
        });
    },
    createRole: async (data: CreateRoleRequest) => {
        return await apiClient.post(API_ENDPOINTS.ROLES.BASE, data);
    },
    updateRole: async (data: UpdateRoleRequest) => {
        return await apiClient.post(`${API_ENDPOINTS.ROLES.BASE}/${data.id}`, data);
    },
    deleteRole: async (id: string) => {
        console.log("this id is belongs to detlete role",id);

        return await apiClient.delete(`${API_ENDPOINTS.ROLES.BASE}/${id}`);
    },
};
