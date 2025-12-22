import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const casesService = {
    getAll: async (params?: any) => {
        return await apiClient.get(API_ENDPOINTS.CASES.BASE, { params });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.CASES.BASE}/${id}`);
    },
    create: async (data: any) => {
        return await apiClient.post(API_ENDPOINTS.CASES.BASE, data);
    },
    update: async (id: string, data: any) => {
        return await apiClient.patch(`${API_ENDPOINTS.CASES.BASE}/${id}`, data);
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.CASES.BASE}/${id}`);
    },
    getUpcomingHearings: async (days: number = 7) => {
        return await apiClient.get(API_ENDPOINTS.CASES.UPCOMING_HEARINGS, { params: { days } });
    },
    getByJudge: async (judgeId: string) => {
        return await apiClient.get(`${API_ENDPOINTS.CASES.BY_JUDGE}/${judgeId}`);
    },
    getByNumber: async (caseNumber: string) => {
        return await apiClient.get(`${API_ENDPOINTS.CASES.BY_NUMBER}/${caseNumber}`);
    },
    updateStatus: async (id: string, status: string) => {
        return await apiClient.patch(`${API_ENDPOINTS.CASES.BASE}/${id}/status`, { status });
    }
};
