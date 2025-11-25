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
    // FIX: Changed from apiClient.put to apiClient.post, a common fix for profile update API issues.
    return await apiClient.post<ProfileResponse>(API_ENDPOINTS.PROFILE.UPDATE, data);
  },    
};