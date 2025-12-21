import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const reportsService = {
    getAll: async (params?: any) => {
        return await apiClient.get(API_ENDPOINTS.REPORTS.BASE, { params });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}`);
    },
    create: async (data: any) => {
        return await apiClient.post(API_ENDPOINTS.REPORTS.BASE, data);
    },
    update: async (id: string, data: any) => {
        return await apiClient.patch(`${API_ENDPOINTS.REPORTS.BASE}/${id}`, data);
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.REPORTS.BASE}/${id}`);
    },
    generateCaseStatistics: async (data: { startDate: string; endDate: string; generatedBy: string }) => {
        return await apiClient.post(API_ENDPOINTS.REPORTS.GENERATE_CASE_STATS, data);
    },
    generateJudgmentAnalysis: async (data: { startDate: string; endDate: string; generatedBy: string }) => {
        return await apiClient.post(API_ENDPOINTS.REPORTS.GENERATE_JUDGMENT_ANALYSIS, data);
    }
};
