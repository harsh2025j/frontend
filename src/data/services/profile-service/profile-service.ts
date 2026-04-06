// src/data/services/profile-service/profile-service.ts

import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";
import { UpdateProfileRequest, ProfileResponse } from "@/data/features/profile/profile.types";

export const profileApi = {
  fetchProfile: async () => {
    const response = await apiClient.get<ProfileResponse>(
      API_ENDPOINTS.PROFILE.FETCH,
      {
        headers: {
          // "ngrok-skip-browser-warning": "true",
        },
      }
    );

    // console.log("FETCH PROFILE RESPONSE:", response.data);
    return response;
  },


  updateProfile: async (data: UpdateProfileRequest) => {
    const formData = new FormData();
    if (data.name !== undefined) formData.append("name", data.name);
    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.dob !== undefined) formData.append("dob", data.dob);
    if (data.city !== undefined) formData.append("city", data.city);
    if (data.state !== undefined) formData.append("state", data.state);
    if (data.designation !== undefined) formData.append("designation", data.designation);
    if (data.yearsOfExperience !== undefined) formData.append("yearsOfExperience", String(data.yearsOfExperience));
    if (data.specialization !== undefined && Array.isArray(data.specialization)) {
      data.specialization.forEach(spec => formData.append("specialization", spec));
    }
    if (data.barRegistrationNumber !== undefined) formData.append("barRegistrationNumber", data.barRegistrationNumber);
    if (data.court !== undefined) formData.append("court", data.court);
    if (data.bio !== undefined) formData.append("bio", data.bio);
    if (data.avatar) formData.append("file", data.avatar);

    return await apiClient.post<ProfileResponse>(API_ENDPOINTS.PROFILE.UPDATE, formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  },

  toggleSavePost: async (postId: string) => {
    return await apiClient.post<ProfileResponse>(
      `/profile/save-post/${postId}`
    );
  },

  fetchPublicProfile: async (id: string) => {
    return await apiClient.get<ProfileResponse>(
      API_ENDPOINTS.PROFILE.PUBLIC.replace(":id", id)
    );
  },

  fetchProfileByUsername: async (username: string) => {
    return await apiClient.get<ProfileResponse>(
      API_ENDPOINTS.PROFILE.BY_USERNAME.replace(":username", username)
    );
  },
};