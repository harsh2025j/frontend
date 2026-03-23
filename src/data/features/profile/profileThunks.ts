import { createAsyncThunk } from "@reduxjs/toolkit";
import { UpdateProfileRequest, ProfileResponse } from "./profile.types";
import { ApiError } from "@/lib/utils/errorHandler";
import { profileApi } from '@/data/services/profile-service/profile-service';
import { RootState } from "@/data/redux/store";

export const fetchProfile = createAsyncThunk<
  ProfileResponse,
  void,
  { rejectValue: string }
>(
  "profile/fetchProfile",
  async (_, thunkAPI) => {
    try {
      const res = await profileApi.fetchProfile();
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch profile");
    }
  }
);

export const updateProfile = createAsyncThunk<
  ProfileResponse,
  UpdateProfileRequest,
  { rejectValue: string }
>(
  "profile/updateProfile",
  async (formData, thunkAPI) => {
    try {
      const res = await profileApi.updateProfile(formData);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Failed to update profile");
    }
  }
);

export const toggleSavePost = createAsyncThunk<
  ProfileResponse,
  string,
  { rejectValue: string }
>(
  "profile/toggleSavePost",
  async (postId, thunkAPI) => {
    try {
      const res = await profileApi.toggleSavePost(postId);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Failed to toggle saved post");
    }
  }
);