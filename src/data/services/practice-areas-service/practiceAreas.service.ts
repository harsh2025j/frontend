import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { CreatePracticeAreaRequest, UpdatePracticeAreaRequest } from "../../features/practiceAreas/practiceAreas.types";

export const practiceAreasApi = {
    fetchPracticeAreas: async () => {
        return await apiClient.get(API_ENDPOINTS.PRACTICE_AREAS.BASE);
    },
    fetchActivePracticeAreas: async () => {
        return await apiClient.get(API_ENDPOINTS.PRACTICE_AREAS.ACTIVE);
    },
    createPracticeArea: async (data: CreatePracticeAreaRequest) => {
        return await apiClient.post(API_ENDPOINTS.PRACTICE_AREAS.BASE, data);
    },
    updatePracticeArea: async (data: UpdatePracticeAreaRequest) => {
        const { id, ...updateData } = data;
        return await apiClient.patch(`${API_ENDPOINTS.PRACTICE_AREAS.BASE}/${id}`, updateData);
    },
    deletePracticeArea: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.PRACTICE_AREAS.BASE}/${id}`);
    },
};
