
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from "@/data/features/auth/auth.types";
import apiClient from "../config/apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "../config/apiContants";

export const authApi = {
  register: async (data: RegisterRequest) => {
    console.log("register11")
    console.log(data)
    console.log("Register request URL:", `${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`);
    console.log("Register request headers:", apiClient.defaults.headers);
    console.log("Register request payload:", JSON.stringify(data, null, 2));

    const response = await apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    console.log("Register API Response:", response.data);
    return response;
  },

  verifyOtp: async (data: VerifyOtpRequest) => {
    console.log("from service")
    const response = await apiClient.post<VerifyOtpResponse>(
      API_ENDPOINTS.AUTH.VERIFY_OTP,
      data
    );
    console.log("Verify OTP Response:", response.data);
    return response;
  },

  login: async (data: LoginRequest) => {
    const response = await apiClient.post<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      data
    );
    console.log("Login API Response:", response.data);
    return response;
  },

  getProfile: async () => {
    const response = await apiClient.get(
      API_ENDPOINTS.AUTH.PROFILE
    );
    console.log("Profile Response:", response.data);
    return response;
  },
};
