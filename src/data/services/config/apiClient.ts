import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./apiContants";
import { handleApiError } from "@/lib/utils/errorHandler";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

apiClient.interceptors.request.use(
  (config) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors centrally
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError) => {
    // Handle all errors centrally
    const apiError = handleApiError(error);

    // You can add additional error handling here, such as:
    // - Logging errors to a monitoring service
    // - Redirecting to login on 401 errors
    // - Showing toast notifications (optional)

    // For 401 errors, optionally clear token and redirect
    if (apiError.statusCode === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Optionally redirect to login page
        // window.location.href = "/auth/login";
      }
    }

    // Return a rejected promise with the formatted error
    return Promise.reject(apiError);
  }
);

export default apiClient;
