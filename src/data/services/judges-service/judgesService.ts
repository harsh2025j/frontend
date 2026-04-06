import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const judgesService = {
    getAll: async (params?: { q?: string; court?: string; courtType?: string; category?: string; year?: string; page?: number; limit?: number }) => {
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
    },
    searchJudges: async (q: string, page: number = 1, limit: number = 10, category?: string, courtType?: string, year?: string) => {
        // Redirection: use the same /judges endpoint but with search params
        // This ensures category filtering works during search!
        return await apiClient.get(API_ENDPOINTS.JUDGES.BASE, {
            params: { q, page, limit, category, courtType, year }
        });
    },
    getTopJudges: async (page = 1, limit = 5, court?: string) => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.TOP, {
            params: { page, limit, court }
        });
    },
    getUniqueCourts: async () => {
        return await apiClient.get(API_ENDPOINTS.JUDGES.UNIQUE_COURTS);
    }
};
