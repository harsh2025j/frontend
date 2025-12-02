
import {
  forgotPasswordRequest,
  ForgotPasswordResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/data/features/auth/auth.types";
import apiClient from "../apiConfig/apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "../apiConfig/apiContants";

export const authApi = {
  register: async (data: RegisterRequest) => {
    // console.log("register11")
    // console.log(data)
    // console.log("Register request URL:", `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
    // console.log("Register request headers:", apiClient.defaults.headers);
    // console.log("Register request payload:", JSON.stringify(data, null, 2));

    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    // console.log("Register API Response:", response.data);
    return response;
  },

  resetPassword: async (data: ResetPasswordRequest) => {
    // console.log("Send data to server:", data);
    const response = await apiClient.post<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, data);
    // console.log(response)
    return response;
  },

  resendOtp: async (data: ResendOtpRequest) => {
    // console.log("Send data to server:", data);
    const response = await apiClient.post<ResendOtpResponse>(API_ENDPOINTS.AUTH.RESEND_OTP, data);
    // console.log(response)
    return response;
  },



  forgotPassword: async (data: forgotPasswordRequest) => {
    // console.log("Gen OTP API hit:", data);
    const response = await apiClient.post<ForgotPasswordResponse>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data);
    // console.log("response :", response);
    return response;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    console.log("from service")
    const response = await apiClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    );
    // console.log("Verify OTP Response:", response.data);
    return response;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    // console.log("Login API Response:", response.data);
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get(
      API_ENDPOINTS.PROFILE.FETCH
    );
    // console.log("Profile Response:", response.data);
    return response;
  },
};

import { auth, googleProvider } from "@/config/firebase";
import { signInWithPopup, signOut } from "firebase/auth";

export const firebaseAuth = {
  loginWithGoogle: async () => {
    if (!auth) {
      throw new Error("Firebase not initialized. Please check your environment variables.");
    }
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Firebase Google Login Error:", error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Firebase Logout Error:", error);
      throw error;
    }
  },
};
