import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./apiContants";
import { handleApiError } from "@/lib/utils/errorHandler";
import toast from "react-hot-toast";
import { startLoading, stopLoading } from "@/data/features/ui/uiSlice";

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

// Error tracking to prevent duplicate messages
const errorMessageCache = new Map<string, number>();
const ERROR_DISPLAY_COOLDOWN = 5000; // 5 seconds cooldown between same error messages

// Function to check if we should show an error message
const shouldShowError = (errorKey: string): boolean => {
  const now = Date.now();
  const lastShown = errorMessageCache.get(errorKey);

  if (!lastShown || now - lastShown > ERROR_DISPLAY_COOLDOWN) {
    errorMessageCache.set(errorKey, now);
    return true;
  }

  return false;
};

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base delay

// Function to determine if request should be retried
const shouldRetry = (error: AxiosError, retryCount: number = 0): boolean => {
  if (retryCount >= MAX_RETRIES) return false;

  // Retry on network errors or 5xx server errors
  if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
    return true;
  }

  // Retry on timeout
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  return false;
};

// Exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};

// Retry request with exponential backoff
const retryRequest = async (error: AxiosError): Promise<any> => {
  const config = error.config as AxiosRequestConfig & { retryCount?: number };

  if (!config) {
    return Promise.reject(error);
  }

  config.retryCount = config.retryCount || 0;

  if (shouldRetry(error, config.retryCount)) {
    config.retryCount += 1;
    const delay = getRetryDelay(config.retryCount - 1);

    // Only show retry message on first retry
    if (config.retryCount === 1 && shouldShowError('retry-attempt')) {
      toast.loading(`Connection issue detected. Retrying... (${config.retryCount}/${MAX_RETRIES})`, {
        duration: delay,
        id: 'retry-toast'
      });
    }

    await new Promise(resolve => setTimeout(resolve, delay));
    return apiClient(config);
  }

  return Promise.reject(error);
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
    // Dismiss any retry toasts on success
    toast.dismiss('retry-toast');
    return response;
  },
  async (error: AxiosError) => {
    if (store) {
      store.dispatch(stopLoading());
    }

    // Dismiss retry toast
    toast.dismiss('retry-toast');

    // Try to retry the request first
    const config = error.config as AxiosRequestConfig & { retryCount?: number };
    const retryCount = config?.retryCount || 0;

    if (shouldRetry(error, retryCount)) {
      try {
        return await retryRequest(error);
      } catch (retryError) {
        // If all retries failed, continue with error handling
        error = retryError as AxiosError;
      }
    }

    // Handle all errors centrally
    const apiError = handleApiError(error);
    const errorKey = `${apiError.statusCode || 'network'}-${error.config?.url || 'unknown'}`;

    // Only show error messages if they haven't been shown recently
    if (apiError.statusCode && apiError.statusCode >= 500) {
      toast.error("Server Error: Something went wrong on our end. Please try again later.", {
        id: "server_error",
      });
    }
    // Handle Network Errors (no status code usually means network error)
    else if (!apiError.statusCode && error.message === "Network Error") {
      toast.error("Network Error: Unable to connect to the server. Please check your internet connection.", {
        id: "network_error",
      });
    }

    // For 401 errors, optionally clear token and redirect
    if (apiError.statusCode === 401) {
      if (shouldShowError('auth-error')) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.", {
            duration: 3000,
            id: 'auth-error-toast'
          });
          // Optionally redirect to login page after a delay
          // setTimeout(() => {
          //   window.location.href = "/auth/login";
          // }, 1500);
        }
      }
    }

    // Return a rejected promise with the formatted error
    return Promise.reject(apiError);
  }
);

// Clean up old error cache entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of errorMessageCache.entries()) {
      if (now - timestamp > ERROR_DISPLAY_COOLDOWN * 2) {
        errorMessageCache.delete(key);
      }
    }
  }, 60000); // Clean up every minute
}

export default apiClient;

