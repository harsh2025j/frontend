import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const judgesService = {
    getAll: async (params?: any) => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.BASE, { params });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGES.BASE}/${id}`);
    },
    create: async (data: any) => {
        return await apiClient.post(API_ENDPOINTS.JUDGES.BASE, data);
    },
    update: async (id: string, data: any) => {
        return await apiClient.patch(`${API_ENDPOINTS.JUDGES.BASE}/${id}`, data);
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.JUDGES.BASE}/${id}`);
    },
    getActive: async () => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.ACTIVE);
    },
    getByCourt: async (court: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGES.BY_COURT}/${court}`);
    }
};
