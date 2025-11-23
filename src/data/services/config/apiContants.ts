export const API_BASE_URL =
  "https://shellproof-ka-noncorrelative.ngrok-free.dev/";

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify",
    LOGIN: "/auth/login",
    PROFILE: "/auth/profile",
    RESEND_OTP: "/auth/forgot-password"
  },

  ARTICLE: {
    CREATE: "/articles",
    FETCH_ALL: "/articles",
  },
  CATEGORIE: {
    CREATE: "/categories",
    FETCH_ALL_CATEGORY: "/categories",  //get request
  },
  ROLES: {
    BASE: "/roles",
  },
  PERMISSIONS: {
    BASE: "/permissions",
  }
};

