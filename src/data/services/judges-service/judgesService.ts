import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export interface Judge {
    id: string;
    name: string;
    designation: string;
    category: "chief-justice" | "senior-judges" | "judges" | "retired";
    courtType?: string; // High Court, Supreme Court, District Court
    appointmentDate: string;
    retirementDate?: string;
    education: string[];
    specialization: string[];
    courtNumber?: string;
    email?: string;
    phone?: string;
    imageUrl?: string;
    bio?: string;
}

export interface JudgesResponse {
    judges: Judge[];
    total: number;
}

export const judgesService = {
    // Get all judges
    getAllJudges: async (): Promise<JudgesResponse> => {
        const response = await apiClient.get<JudgesResponse>(API_ENDPOINTS.JUDGES.BASE);
        return response.data;
    },

    // Get active judges
    getActiveJudges: async (): Promise<JudgesResponse> => {
        const response = await apiClient.get<JudgesResponse>(API_ENDPOINTS.JUDGES.ACTIVE);
        return response.data;
    },

    // Get judges by court type
    getJudgesByCourt: async (courtType: string): Promise<JudgesResponse> => {
        const response = await apiClient.get<JudgesResponse>(
            `${API_ENDPOINTS.JUDGES.BY_COURT}/${courtType}`
        );
        return response.data;
    },

    // Get judge by ID
    getJudgeById: async (id: string): Promise<Judge> => {
        const response = await apiClient.get<Judge>(`${API_ENDPOINTS.JUDGES.BASE}/${id}`);
        return response.data;
    },

    // Update judge
    update: async (id: string, data: Partial<Judge>): Promise<Judge> => {
        const response = await apiClient.put<Judge>(`${API_ENDPOINTS.JUDGES.BASE}/${id}`, data);
        return response.data;
    },
};
