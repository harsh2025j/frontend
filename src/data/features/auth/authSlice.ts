import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, verifyOtp } from "./authThunks";
import { AuthState } from "./auth.types";
import { MESSAGES } from "@/lib/constants/messageConstants";

const initialState: AuthState = {
  loading: false,
  error: null,
  token: null,
  refreshToken: null,
  user: null,
  message: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.message = null;
    },
    logoutUser: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      localStorage.clear();
    },
  },
 extraReducers: (builder) => {
  builder
    .addCase(loginUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    })
    .addCase(loginUser.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.error = null;
      state.message = MESSAGES.LOGIN_SUCCESS;
    })
    .addCase(loginUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(registerUser.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    })
    .addCase(registerUser.fulfilled, (state) => {
      state.loading = false;
      state.message = MESSAGES.REGISTER_SUCCESS;
    })
    .addCase(registerUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    .addCase(verifyOtp.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.message = null;
    })
    .addCase(verifyOtp.fulfilled, (state, action) => {
      state.loading = false;
      state.token = action.payload.token;
      state.user = action.payload.user || null;
      state.message = MESSAGES.VERIFY_SUCCESS;
    })
    .addCase(verifyOtp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
}

});

export const { resetAuthState, logoutUser } = authSlice.actions;
export default authSlice.reducer;
