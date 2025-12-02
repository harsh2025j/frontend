// export const API_BASE_URL =
//   "https://shellproof-ka-noncorrelative.ngrok-free.dev/";


export const API_BASE_URL = "https://api.sajjadhusainlawassociates.com/";
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify",
    LOGIN: "/auth/login",
    RESEND_OTP: "/auth/forgot-password"
  },
  PROFILE: {
    FETCH: "/profile",
    UPDATE: "/profile",
  },

  ARTICLE: {
    CREATE: "/articles",
    FETCH_ALL: "/articles",
    APPROVE: "/articles/:id/approve",
    REJECT: "/articles/:id/reject",
  },
  CATEGORIE: {
    CREATE: "/categories",
    FETCH_ALL_CATEGORY: "/categories",
  },

  SUBSCRIPTION: {
    CREATE: "/plans",
    GET_ALL_PLAN: "/plans",
  },

  ROLES: {
    BASE: "/roles",
  },
  PERMISSIONS: {
    BASE: "/permissions",
  }
};

