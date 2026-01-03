import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL } from "./apiContants";
import { handleApiError } from "@/lib/utils/errorHandler";
import toast from "react-hot-toast";
import { startLoading, stopLoading } from "@/data/features/ui/uiSlice";

let store: any;

export const injectStore = (_store: any) => {
  store = _store;
};

const errorMessageCache = new Map<string, number>();
const ERROR_DISPLAY_COOLDOWN = 5000;

const shouldShowError = (errorKey: string): boolean => {
  const now = Date.now();
  const lastShown = errorMessageCache.get(errorKey);

  if (!lastShown || now - lastShown > ERROR_DISPLAY_COOLDOWN) {
    errorMessageCache.set(errorKey, now);
    return true;
  }

  return false;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const shouldRetry = (error: AxiosError, retryCount: number = 0): boolean => {
  if (retryCount >= MAX_RETRIES) return false;

  if (!error.response || (error.response.status >= 500 && error.response.status < 600)) {
    return true;
  }
  if (error.code === 'ECONNABORTED') {
    return true;
  }

  return false;
};

const getRetryDelay = (retryCount: number): number => {
  return RETRY_DELAY * Math.pow(2, retryCount);
};
const retryRequest = async (error: AxiosError): Promise<any> => {
  const config = error.config as AxiosRequestConfig & { retryCount?: number };

  if (!config) {
    return Promise.reject(error);
  }

  config.retryCount = config.retryCount || 0;

  if (shouldRetry(error, config.retryCount)) {
    config.retryCount += 1;
    const delay = getRetryDelay(config.retryCount - 1);

    // Silently retry without showing toast

    await new Promise(resolve => setTimeout(resolve, delay));
    return apiClient(config);
  }

  return Promise.reject(error);
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",    // only for ngrok remove in production 
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    if (store) {
      store.dispatch(startLoading());
    }
    // console.log("only for testing",localStorage.getItem("token"))
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

apiClient.interceptors.response.use(
  (response) => {
    if (store) {
      store.dispatch(stopLoading());
    }
    toast.dismiss('retry-toast');
    return response;
  },
  async (error: AxiosError) => {
    if (store) {
      store.dispatch(stopLoading());
    }
    toast.dismiss('retry-toast');
    const config = error.config as AxiosRequestConfig & { retryCount?: number };
    const retryCount = config?.retryCount || 0;

    if (shouldRetry(error, retryCount)) {
      try {
        return await retryRequest(error);
      } catch (retryError) {
        error = retryError as AxiosError;
      }
    }
    const apiError = handleApiError(error);
    const errorKey = `${apiError.statusCode || 'network'}-${error.config?.url || 'unknown'}`;
    // Silently handle server errors (500+) and network errors
    // if (apiError.statusCode && apiError.statusCode >= 500) {
    //   Server error - handled silently
    // }
    // else if (!apiError.statusCode && error.message === "Network Error") {
    //   Network error - handled silently
    // }
    // Handle 401 errors - but distinguish between auth failures and resource-not-found
    if (apiError.statusCode === 401) {
      const url = error.config?.url || '';

      // Only logout for actual authentication failures (login, profile, etc.)
      // Don't logout for resource-not-found errors (like no subscription)
      const isAuthFailure = !url.includes('/subscriptions/me') && !url.includes('/subscription');

      if (isAuthFailure && shouldShowError('auth-error')) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.", {
            duration: 3000,
            id: 'auth-error-toast'
          });
          setTimeout(() => {
            window.location.href = "/";
          }, 1500);
        }
      }
    }

    return Promise.reject(apiError);
  }
);

if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of errorMessageCache.entries()) {
      if (now - timestamp > ERROR_DISPLAY_COOLDOWN * 2) {
        errorMessageCache.delete(key);
      }
    }
  }, 60000);
}

export default apiClient;

