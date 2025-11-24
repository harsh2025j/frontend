import apiClient from "@/data/services/config/apiClient";
import { API_ENDPOINTS } from "@/data/services/config/apiContants";
import { CreatePermissionRequest, UpdatePermissionRequest } from "../../features/permissions/permissions.types";

export const permissionsApi = {
    fetchPermissions: async () => {
        return await apiClient.get(API_ENDPOINTS.PERMISSIONS.BASE, {
            headers: {
                "ngrok-skip-browser-warning": "true",
            },
        });
    },
    createPermission: async (data: CreatePermissionRequest) => {
        return await apiClient.post(API_ENDPOINTS.PERMISSIONS.BASE, data);
    },
    updatePermission: async (data: UpdatePermissionRequest) => {
        return await apiClient.post(`${API_ENDPOINTS.PERMISSIONS.BASE}/${data.id}`, data);
    },
    deletePermission: async (id: string) => {
        return await apiClient.post(`${API_ENDPOINTS.PERMISSIONS.BASE}/${id}`);
    },
};
