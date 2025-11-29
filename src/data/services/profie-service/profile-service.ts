// src/data/services/profie-service/profile-service.ts

import apiClient from "@/data/services/config/apiClient";
import { API_ENDPOINTS } from "@/data/services/config/apiContants";
import { UpdateProfileRequest, ProfileResponse } from "@/data/features/profile/profile.types";

export const profileApi = {
  fetchProfile: async () => {
    return await apiClient.get<ProfileResponse>(API_ENDPOINTS.PROFILE.FETCH, {
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
    });
  },

  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData();
     if (data.name) formData.append("name", data.name);
     if (data.phone) formData.append("phone", data.phone);
     if (data.dob) formData.append("dob", data.dob);
     if (data.avatar) formData.append("file", data.avatar);

    return await apiClient.post<ProfileResponse>(API_ENDPOINTS.PROFILE.UPDATE, formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  },    
};