import { createSlice } from "@reduxjs/toolkit";
import { loginUser, registerUser, verifyOtp, forgotPassword, resetPassword, ResendOtp, loginWithGoogle } from "./authThunks";
import { AuthState } from "./auth.types";
import { MESSAGES } from "@/lib/constants/messageConstants";

const initialState: AuthState = {
  loading: false,
  error: null,
  token: null,
  refreshToken: null,
  user: null,
  message: null,
  debugOtp: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetAuthState: (state) => {
      state.error = null;
      state.message = null;
      state.debugOtp = null;
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
        const payload: any = action.payload as any;
        const user =
          payload?.user ??
          payload?.data?.user ??
          null;
        const accessToken =
          payload?.accessToken ??
          payload?.token ??
          payload?.data?.accessToken ??
          payload?.data?.token ??
          null;
        const refreshToken =
          payload?.refreshToken ??
          payload?.data?.refreshToken ??
          null;

        state.user = user;
        state.token = accessToken;
        state.refreshToken = refreshToken;
        state.error = null;
        state.message = MESSAGES.LOGIN_SUCCESS;
        try {
          if (typeof window !== "undefined") {
            if (user) localStorage.setItem("user", JSON.stringify(user));
            if (accessToken) localStorage.setItem("token", accessToken || "");
          }
        } catch { }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.debugOtp = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.message = MESSAGES.REGISTER_SUCCESS;
        // Attempt to extract OTP from various possible response shapes
        const payload: any = action.payload as any;
        const otp =
          payload?.data?.user?.otp ??
          payload?.user?.otp ??
          payload?.otp ??
          null;
        state.debugOtp = otp ?? null;
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
        const payload: any = action.payload as any;
        const token =
          payload?.token ??
          payload?.accessToken ??
          payload?.data?.token ??
          payload?.data?.accessToken ??
          null;
        const user =
          payload?.user ??
          payload?.data?.user ??
          null;

        state.token = token;
        state.user = user || null;
        state.message = MESSAGES.VERIFY_SUCCESS;
        try {
          if (typeof window !== "undefined") {
            if (user) localStorage.setItem("user", JSON.stringify(user));
            if (token) localStorage.setItem("token", token);
          }
        } catch { }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
        state.debugOtp = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = MESSAGES.FORGOT_SUCCESS;
        const payload: any = action.payload as any;
        const otp =
          payload?.data?.otp ??
          payload?.otp ??
          payload?.data?.user?.otp ??
          null;
        state.debugOtp = otp ?? null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = MESSAGES.RESET_SUCCESS;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(ResendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(ResendOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.message = MESSAGES.RESENDOTP_SUCCESS;
      })
      .addCase(ResendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
        state.message = "Google Login Successful";

        try {
          if (typeof window !== "undefined") {
            if (action.payload.user) localStorage.setItem("user", JSON.stringify(action.payload.user));
            if (action.payload.accessToken) localStorage.setItem("token", action.payload.accessToken);
          }
        } catch { }
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });


  }

});

export const { resetAuthState, logoutUser } = authSlice.actions;
export default authSlice.reducer;
