import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";
import {
  Advertisement,
  CreateAdvertisementRequest,
  AdvertisementListResponse,
  AdvertisementResponse
} from "@/data/features/advertisement/advertisement.types";

export const advertisementApi = {
  fetchAdvertisements: async () => {
    const response = await apiClient.get<AdvertisementListResponse>(API_ENDPOINTS.ADVERTISEMENTS.BASE);
    return response;
  },

  fetchAdvertisementById: async (id: string) => {
    const response = await apiClient.get<AdvertisementResponse>(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`);
    return response;
  },

  fetchAdvertisementBySlot: async (slotId: string) => {
    const response = await apiClient.get<AdvertisementResponse>(`${API_ENDPOINTS.ADVERTISEMENTS.BY_SLOT}/${slotId}`);
    return response;
  },

  fetchAdvertisementHistory: async (id: string, page: number = 1, limit: number = 12) => {
    const response = await apiClient.get(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}/history`, { params: { page, limit } });
    return response;
  },

  fetchSlotHistory: async (slotId: string, page: number = 1, limit: number = 12) => {
    const response = await apiClient.get(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/slot/${slotId}/history`, { params: { page, limit } });
    return response;
  },

  createAdvertisement: async (data: CreateAdvertisementRequest) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("link", data.link);
    formData.append("slotId", data.slotId);
    formData.append("adType", data.adType);
    formData.append("priority", String(data.priority));
    formData.append("isActive", String(data.isActive));

    if (data.thumbnail) {
      formData.append("file", data.thumbnail);
    }

    const response = await apiClient.post<AdvertisementResponse>(
      API_ENDPOINTS.ADVERTISEMENTS.BASE,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  updateAdvertisement: async (id: string, data: CreateAdvertisementRequest) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.description) formData.append("description", data.description);
    formData.append("link", data.link);
    formData.append("slotId", data.slotId);
    formData.append("adType", data.adType);
    formData.append("priority", String(data.priority));
    formData.append("isActive", String(data.isActive));

    if (data.thumbnail) {
      formData.append("file", data.thumbnail);
    }

    const response = await apiClient.patch<AdvertisementResponse>(
      `${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response;
  },

  toggleAdvertisementStatus: async (id: string) => {
    const response = await apiClient.patch<AdvertisementResponse>(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}/toggle-status`);
    return response;
  },

  deleteAdvertisement: async (id: string) => {
    const response = await apiClient.delete<AdvertisementResponse>(`${API_ENDPOINTS.ADVERTISEMENTS.BASE}/${id}`);
    return response;
  },

  trackImpression: async (id: string) => {
    const endpoint = API_ENDPOINTS.ADVERTISEMENTS.TRACK_IMPRESSION.replace(':id', id);
    const response = await apiClient.post(endpoint);
    return response;
  },

  trackClick: async (id: string, userIdentifier: string) => {
    const endpoint = API_ENDPOINTS.ADVERTISEMENTS.TRACK_CLICK.replace(':id', id);
    const response = await apiClient.post(endpoint, { userIdentifier });
    return response;
  },
};
