import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./apiContants";
import { handleApiError } from "@/lib/utils/errorHandler";
import toast from "react-hot-toast";

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

    // Handle Server Errors (5xx)
    if (apiError.statusCode && apiError.statusCode >= 500) {
      toast.error("Server Error: Something went wrong on our end. Please try again later.");
    }
    // Handle Network Errors (no status code usually means network error)
    else if (!apiError.statusCode && error.message === "Network Error") {
      toast.error("Network Error: Unable to connect to the server. Please check your internet connection.");
    }

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
