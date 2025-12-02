import { createSlice } from "@reduxjs/toolkit";
import { fetchProfile, updateProfile } from "./profileThunks";
import { loginWithGoogle } from "../auth/authThunks";
import { ProfileState } from "./profile.types";
// 1. Import the logout action
import { logoutUser } from "../auth/authSlice"; 

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
      // It is good practice to clear user here too, though usually unnecessary if handled in extraReducers
      state.user = null; 
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
           // ... (your existing mapping logic) ...
           state.user = {
            _id: googleUser._id,
            name: googleUser.name,
            email: googleUser.email,
            profilePicture: googleUser.profilePicture || "",
            roles: [{
              _id: "google-role",
              name: "user",
              slug: "user",
              description: "Google User",
              isActive: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }],
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
      })
      
      
      .addCase(logoutUser, (state) => {
        localStorage.clear();
        state.user = null;
        state.error = null;
        state.message = null;
        state.loading = false;

      });
  },
});

export const { resetProfileState, setUser } = profileSlice.actions;
export default profileSlice.reducer;