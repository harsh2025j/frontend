import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const displayBoardsService = {
    getAll: async (params?: any) => {
        return await apiClient.get(API_ENDPOINTS.DISPLAY_BOARDS.BASE, { params });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.DISPLAY_BOARDS.BASE}/${id}`);
    },
    create: async (data: any) => {
        return await apiClient.post(API_ENDPOINTS.DISPLAY_BOARDS.BASE, data);
    },
    update: async (id: string, data: any) => {
        return await apiClient.patch(`${API_ENDPOINTS.DISPLAY_BOARDS.BASE}/${id}`, data);
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.DISPLAY_BOARDS.BASE}/${id}`);
    },
    getActive: async () => {
        return await apiClient.get(API_ENDPOINTS.DISPLAY_BOARDS.ACTIVE);
    },
    getByDate: async (date: string) => {
        return await apiClient.get(`${API_ENDPOINTS.DISPLAY_BOARDS.BY_DATE}/${date}`);
    },
    getByCourt: async (court: string) => {
        return await apiClient.get(`${API_ENDPOINTS.DISPLAY_BOARDS.BY_COURT}/${court}`);
    },
    generateCauseList: async (data: { court: string; date: string }) => {
        return await apiClient.post(API_ENDPOINTS.DISPLAY_BOARDS.GENERATE_CAUSE_LIST, data);
    }
};
