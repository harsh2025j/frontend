import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export const advocatesService = {
  getTopAdvocates: async (page = 1, limit = 5, court?: string) => {
    return apiClient.get(API_ENDPOINTS.ADVOCATES.TOP, {
      params: { page, limit, court },
    });
  },

  getUniqueCourts: async () => {
    return apiClient.get(API_ENDPOINTS.ADVOCATES.UNIQUE_COURTS);
  },

  getAdvocateById: async (id: string) => {
    return apiClient.get(`${API_ENDPOINTS.ADVOCATES.BASE}/${id}`);
  },
};
