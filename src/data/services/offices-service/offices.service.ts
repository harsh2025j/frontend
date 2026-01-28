import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { CreateOfficeRequest, UpdateOfficeRequest } from "../../features/offices/offices.types";

export const officesApi = {
    fetchOffices: async () => {
        return await apiClient.get(API_ENDPOINTS.OFFICES.BASE);
    },
    fetchActiveOffices: async () => {
        return await apiClient.get(API_ENDPOINTS.OFFICES.ACTIVE);
    },
    createOffice: async (data: CreateOfficeRequest) => {
        return await apiClient.post(API_ENDPOINTS.OFFICES.BASE, data);
    },
    updateOffice: async (data: UpdateOfficeRequest) => {
        const { id, ...updateData } = data;
        return await apiClient.patch(`${API_ENDPOINTS.OFFICES.BASE}/${id}`, updateData);
    },
    deleteOffice: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.OFFICES.BASE}/${id}`);
    },
};
