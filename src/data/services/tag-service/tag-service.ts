import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const tagApi = {
  fetchTags: async (search?: string, signal?: AbortSignal) => {
    const response = await apiClient.get<{ data: Tag[], meta: any }>(
      API_ENDPOINTS.TAGS.BASE,
      {
        params: { search, limit: 10 },
        signal
      }
    );
    return response;
  },
};
