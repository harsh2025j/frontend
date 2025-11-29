import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "./apiContants";
import { handleApiError } from "@/lib/utils/errorHandler";
import toast from "react-hot-toast";
import { startLoading, stopLoading } from "@/data/features/ui/uiSlice";

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    // "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

apiClient.interceptors.request.use(
  (config) => {
    if (store) {
      store.dispatch(startLoading());
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    if (store) {
      store.dispatch(stopLoading());
    }
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors centrally
apiClient.interceptors.response.use(
  (response) => {
    if (store) {
      store.dispatch(stopLoading());
    }
    // Return successful responses as-is
    return response;
  },
  (error: AxiosError) => {
    if (store) {
      store.dispatch(stopLoading());
    }
    // Handle all errors centrally
    const apiError = handleApiError(error);

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
