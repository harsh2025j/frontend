import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "./profileThunks";
import { loginWithGoogle } from "../auth/authThunks";
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
    setUser: (state, action) => {
      state.user = action.payload;
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
        state.user = action.payload.data;
        state.message = action.payload.message || "Profile updated successfully";
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        const googleUser = action.payload.user;
        if (googleUser) {
          // Map AuthUser to UserData (mocking missing fields)
          state.user = {
            _id: googleUser.id,
            name: googleUser.name,
            email: googleUser.email,
            profilePicture: googleUser.avatar || "",
            role: {
              _id: "google-role",
              name: "user",
              slug: "user",
              isDeleted: false,
              description: "Google User",
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            isActive: true,
            isVerified: true,
            preferredLanguage: "english-ind",
            permissions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            __v: 0,
            phone: "",
            dob: "",
          };
          state.message = "Profile synced with Google Login";
        }
      });
  },
});

export const { resetProfileState, setUser } = profileSlice.actions;
export default profileSlice.reducer;