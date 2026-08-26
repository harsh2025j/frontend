import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  forgotPasswordRequest, ForgotPasswordResponse, LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
} from "./auth.types";
import { requestFcmToken } from "@/lib/fcmUtils";
import { firebaseAuth } from "@/data/services/auth-service/auth-service";
import { AuthUser } from "./auth.types";
import { authApi } from "@/data/services/auth-service/auth-service";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { ApiError } from "@/lib/utils/errorHandler";


export const loginUser = createAsyncThunk<LoginResponse, LoginRequest>(
  "auth/loginUser",
  async (formData, thunkAPI) => {
    try {
      // console.log("login....")
      const res = await authApi.login(formData);
      // console.log(res.data);
      return res.data;
    } catch (err: unknown) {
      // Error is already handled by centralized error handler
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.LOGIN_FAIL);
    }
  }
);

export const registerUser = createAsyncThunk<RegisterResponse, RegisterRequest>(
  "auth/registerUser",
  async (formData, thunkAPI) => {
    try {
      // console.log("register")
      const res = await authApi.register(formData);
      // console.log("slfjsdkjflsdfj");
      // console.log(res);
      return res.data;
    } catch (err: unknown) {
      // Error is already handled by centralized error handler
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.REGISTER_FAIL);
    }
  }
);

export const verifyOtp = createAsyncThunk<VerifyOtpResponse, VerifyOtpRequest>(
  "auth/verifyOtp",
  async (formData, thunkAPI) => {
    try {
      // console.log("verify otp");
      // console.log(formData)
      const res = await authApi.verifyOtp(formData);
      // console.log("sldfjsdjkfk")
      return res.data;
    } catch (err: unknown) {
      // Error is already handled by centralized error handler
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.VERIFY_FAIL);
    }
  }
);

export const forgotPassword = createAsyncThunk<ForgotPasswordResponse, forgotPasswordRequest>(
  "auth/forgotPassword",
  async (data, thunkAPI) => {
    try {
      // console.log("otp generating")
      // console.log(data)
      const res = await authApi.forgotPassword(data);
      return res.data;
    } catch (err: unknown) {
      // Error is already handled by centralized error handler
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.FORGOT_FAIL);
    }

  }
)

export const resetPassword = createAsyncThunk<ResetPasswordResponse, ResetPasswordRequest>(
  "auth/resetPassword",
  async (formData, thunkAPI) => {
    try {
      const res = await authApi.resetPassword(formData);
      return res.data;
    } catch (err: unknown) {
      // Error is already handled by centralized error handler
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.RESET_FAIL);
    }

  }
)

export const ResendOtp = createAsyncThunk<ResendOtpResponse, ResendOtpRequest>(
  "auth/resendOtp",
  async (formData, thunkAPI) => {
    try {
      const res = await authApi.resendOtp(formData);
      return res.data;
    } catch (err: unknown) {
      // Error is already handled by centralized error handler
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.RESENDOTP_FAIL);
    }

  }
)


export const loginWithGoogle = createAsyncThunk<LoginResponse, { roleIds?: string[] } | void>(
  "auth/loginWithGoogle",
  async (args, thunkAPI) => {
    try {
      const firebaseUser = await firebaseAuth.loginWithGoogle();
      const fcmToken = await requestFcmToken();

      const socialLoginData = {
        email: firebaseUser.email || "",
        name: firebaseUser.displayName || "",
        provider: "google",
        providerId: firebaseUser.uid,
        profilePicture: firebaseUser.photoURL || "",
        roleIds: args?.roleIds,
        fcmToken: fcmToken || undefined,
        platform: "web"
      };

      const res = await authApi.socialLogin(socialLoginData);

      // The backend returns the same structure as normal login
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Google Login Failed");
    }
  }
);

export const refreshToken = createAsyncThunk<RefreshTokenResponse, RefreshTokenRequest>(
  "auth/refreshToken",
  async (data, thunkAPI) => {
    try {
      const res = await authApi.refreshToken(data);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Token Refresh Failed");
    }
  }
);

export const logoutUserAsync = createAsyncThunk(
  "auth/logoutUserAsync",
  async (_, thunkAPI) => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      const fcmToken = await requestFcmToken();

      if (refreshToken) {
        await authApi.logout({ refreshToken, fcmToken: fcmToken || undefined });
      }
      return true;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Logout Failed");
    }
  }
);

export const upgradeToStudentAsync = createAsyncThunk(
  "auth/upgradeToStudentAsync",
  async (_, thunkAPI) => {
    try {
      const response = await authApi.upgradeToStudent();
      return response.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Upgrade Failed");
    }
  }
);
