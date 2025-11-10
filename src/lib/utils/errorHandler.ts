import { AxiosError } from "axios";

export interface ApiError {
  message: string;
  statusCode?: number;
  originalError?: any;
}

export const handleApiError = (error: unknown): ApiError => {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    // Network error - server is not running or connection refused
    if (error.code === "ECONNREFUSED" || error.code === "ERR_NETWORK") {
      return {
        message: "Unable to connect to the server. Please check if the server is running.",
        statusCode: 0,
        originalError: error,
      };
    }

    // Timeout error
    if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
      return {
        message: "Request timed out. Please try again.",
        statusCode: 408,
        originalError: error,
      };
    }

    // CORS error
    if (error.code === "ERR_CORS") {
      return {
        message: "CORS error. Please check server configuration.",
        statusCode: 0,
        originalError: error,
      };
    }

    // No response from server
    if (!error.response) {
      return {
        message: "No response from server. Please check your connection and try again.",
        statusCode: 0,
        originalError: error,
      };
    }

    // Handle HTTP status codes
    const status = error.response.status;
    const serverMessage = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return {
          message: serverMessage || "Invalid request. Please check your input.",
          statusCode: 400,
          originalError: error,
        };
      case 401:
        return {
          message: serverMessage || "Unauthorized. Please login again.",
          statusCode: 401,
          originalError: error,
        };
      case 403:
        return {
          message: serverMessage || "Access forbidden. You don't have permission to perform this action.",
          statusCode: 403,
          originalError: error,
        };
      case 404:
        return {
          message: serverMessage || "Resource not found.",
          statusCode: 404,
          originalError: error,
        };
      case 422:
        return {
          message: serverMessage || "Validation error. Please check your input.",
          statusCode: 422,
          originalError: error,
        };
      case 429:
        return {
          message: serverMessage || "Too many requests. Please try again later.",
          statusCode: 429,
          originalError: error,
        };
      case 500:
        return {
          message: serverMessage || "Internal server error. Please try again later.",
          statusCode: 500,
          originalError: error,
        };
      case 502:
        return {
          message: serverMessage || "Bad gateway. The server is temporarily unavailable.",
          statusCode: 502,
          originalError: error,
        };
      case 503:
        return {
          message: serverMessage || "Service unavailable. The server is temporarily down.",
          statusCode: 503,
          originalError: error,
        };
      case 504:
        return {
          message: serverMessage || "Gateway timeout. Please try again later.",
          statusCode: 504,
          originalError: error,
        };
      default:
        return {
          message: serverMessage || `An error occurred (${status}). Please try again.`,
          statusCode: status,
          originalError: error,
        };
    }
  }

  // Handle non-Axios errors
  if (error instanceof Error) {
    return {
      message: error.message || "An unexpected error occurred. Please try again.",
      originalError: error,
    };
  }

  // Handle unknown error types
  return {
    message: "An unexpected error occurred. Please try again.",
    originalError: error,
  };
};

/**
 * Get user-friendly error message from any error
 */
export const getErrorMessage = (error: unknown): string => {
  return handleApiError(error).message;
};

