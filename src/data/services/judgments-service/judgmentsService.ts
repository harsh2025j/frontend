import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const judgmentsService = {
    getAll: async (params?: any) => {
        return await apiClient.get(API_ENDPOINTS.JUDGMENTS.BASE, { params });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGMENTS.BASE}/${id}`);
    },
    create: async (data: any) => {
        return await apiClient.post(API_ENDPOINTS.JUDGMENTS.BASE, data);
    },
    update: async (id: string, data: any) => {
        return await apiClient.patch(`${API_ENDPOINTS.JUDGMENTS.BASE}/${id}`, data);
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.JUDGMENTS.BASE}/${id}`);
    },
    getLandmark: async () => {
        return await apiClient.get(API_ENDPOINTS.JUDGMENTS.LANDMARK);
    },
    getByCase: async (caseId: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGMENTS.BY_CASE}/${caseId}`);
    },
    getByJudge: async (judgeId: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGMENTS.BY_JUDGE}/${judgeId}`);
    }
};
