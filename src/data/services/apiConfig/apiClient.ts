import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { API_BASE_URL, API_ENDPOINTS } from "./apiContants";
import { isTokenExpiredSoon } from "@/lib/utils/jwtUtils";

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
    "ngrok-skip-browser-warning": "true",  //only in local development with ngrok, can be removed in production
  },
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: { resolve: (value: string) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token as string);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.request.use(
  async (config) => {
    if (store) {
      // store.dispatch(startLoading());
    }

    let token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const url = config.url || '';

    // Check if it's an auth endpoint to avoid looping
    const isAuthCall = url.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      url.includes('/auth/login') ||
      url.includes('/auth/social-login');

    if (!isAuthCall && token && typeof window !== "undefined") {
      // Check expiration proactively (buffer: 30 seconds)
      if (isTokenExpiredSoon(token, 0.5)) {
        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshToken = localStorage.getItem("refreshToken");
            const userStr = localStorage.getItem("user");
            const user = userStr ? JSON.parse(userStr) : null;
            const userId = user?.id || user?._id || user?.sub;

            if (refreshToken && userId) {
              const refreshResponse = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
                userId,
                refreshToken
              });

              const payload = refreshResponse.data?.data || refreshResponse.data;
              const newToken = payload?.accessToken;
              const newRefreshToken = payload?.refreshToken;

              if (newToken) {
                localStorage.setItem("token", newToken);
                if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

                if (store) {
                  store.dispatch({
                    type: 'auth/refreshToken/fulfilled',
                    payload: refreshResponse.data
                  });
                }

                token = newToken;
                processQueue(null, newToken);
              } else {
                throw new Error("Invalid token response");
              }
            } else {
              throw new Error("No refresh token or user id available, Please Login again");
            }
          } catch (error: any) {
            processQueue(error, null);

            if (error.response?.data?.message?.includes("Invalid refresh token")) {
              if (typeof window !== "undefined") {
                toast.dismiss();
              }
            }

            localStorage.removeItem("token");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            window.location.href = "/";
            return Promise.reject(error);
          } finally {
            isRefreshing = false;
          }
        }
        else {
          // Wait for the ongoing refresh to complete
          try {
            token = await new Promise<string>((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
          } catch (error) {
            return Promise.reject(error);
          }
        }
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (store) {
      // store.dispatch(stopLoading());
    }
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (store) {
      // store.dispatch(stopLoading());
    }
    if (typeof window !== "undefined") {
      toast.dismiss('retry-toast');
    }
    return response;
  },
  async (error: AxiosError) => {
    if (typeof window !== "undefined") {
      toast.dismiss('retry-toast');
    }
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
    console.error(`API Error [${error.config?.method?.toUpperCase()}] ${error.config?.url}:`, apiError);
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
      const url = String(error.config?.url || '');

      // Only logout for actual authentication failures (login, profile, etc.)
      // Don't logout for resource-not-found errors (like no subscription or permission requests)
      const isAuthFailure = typeof url === 'string' &&
        !url.includes('/subscriptions/me') &&
        !url.includes('/subscription') &&
        !url.includes('/permission-requests/my') &&
        !url.includes('/auth/login') &&
        !url.includes('/auth/register') &&
        !url.includes('/auth/forgot-password') &&
        !url.includes('/auth/reset-password') &&
        !url.includes('/auth/verify') &&
        !url.includes('/auth/resend-otp') &&
        !url.includes('/auth/social-login');

      if (isAuthFailure && shouldShowError('auth-error')) {
        if (typeof window !== "undefined") {
          if (store) {
            // Dispatch the synchronous logout action to clear auth and profile state
            store.dispatch({ type: 'auth/logoutUser' });
          } else {
            localStorage.clear();
          }
          // toast.error("Session expired. Please login again.", {
          //   duration: 3000,
          //   id: 'auth-error-toast'
          // });
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

