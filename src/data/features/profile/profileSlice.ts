import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "./profileThunks";
import { ProfileState } from "./profile.types";

const initialState: ProfileState = {
  loading: false,
  error: null,
  user: null,
  message: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    resetProfileState: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Fetch Profile ---
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        // The data field in ProfileResponse is the UserData object
        state.user = action.payload.data;
        state.message = action.payload.message || "Profile fetched successfully";
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // --- Update Profile ---
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        // The data field contains the updated user object
        state.user = action.payload.data; 
        state.message = action.payload.message || "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;