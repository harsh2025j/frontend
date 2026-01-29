import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { CreatePermissionRequest, UpdatePermissionRequest } from "../../features/permissions/permissions.types";

export const permissionsApi = {
    fetchPermissions: async () => {
        return await apiClient.get(API_ENDPOINTS.PERMISSIONS.BASE, {
            headers: {
                // "ngrok-skip-browser-warning": "true",
            },
        });
    },
    createPermission: async (data: CreatePermissionRequest) => {
        return await apiClient.post(API_ENDPOINTS.PERMISSIONS.BASE, data);
    },
    updatePermission: async (data: UpdatePermissionRequest) => {
        const payload = {
            name: data.name,
            description: data.description
        };
        return await apiClient.patch(`${API_ENDPOINTS.PERMISSIONS.BASE}/${data.id}`, payload);
    },
    deletePermission: async (id: string) => {
        // console.log(id)
        return await apiClient.delete(`${API_ENDPOINTS.PERMISSIONS.BASE}/${id}`);
    },
};
