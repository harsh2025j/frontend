// export const API_BASE_URL = "https://shellproof-ka-noncorrelative.ngrok-free.dev/";


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
    CREATE_ORDER: "/subscriptions/orders/create",
    VERIFY_PAYMENT: "/subscriptions/verify-payment",
    GET_MY_SUBSCRIPTION: "/subscriptions/me",
  },

  ROLES: {
    BASE: "/roles",
  },
  PERMISSIONS: {
    BASE: "/permissions",
  },
  TASKS: {
    TRIGGER_DAILY_NEWS: "/tasks/trigger-daily-news",
  },
  CASES: {
    BASE: "/cases",
    UPCOMING_HEARINGS: "/cases/upcoming-hearings",
    BY_JUDGE: "/cases/judge",
    BY_NUMBER: "/cases/number",
  },
  JUDGMENTS: {
    BASE: "/judgments",
    LANDMARK: "/judgments/landmark",
    BY_CASE: "/judgments/case",
    BY_JUDGE: "/judgments/judge",
  },
  JUDGES: {
    BASE: "/judges",
    ACTIVE: "/judges/active",
    BY_COURT: "/judges/court",
  },
  USERS: {
    BROADCAST: "/users/broadcast",
  },
  NOTIFICATIONS: {
    FETCH_BY_ID: "/notifications",
    READ_ALL: "/notifications/read-all",
    MARK_READ: "/notifications/:id/read",
    DELETE: "/notifications/:id",
  },
  REPORTS: {
    BASE: "/reports",
    GENERATE_CASE_STATS: "/reports/generate/case-statistics",
    GENERATE_JUDGMENT_ANALYSIS: "/reports/generate/judgment-analysis",
  },
  DISPLAY_BOARDS: {
    BASE: "/display-boards",
    ACTIVE: "/display-boards/active",
    BY_DATE: "/display-boards/date",
    BY_COURT: "/display-boards/court",
    GENERATE_CAUSE_LIST: "/display-boards/generate/cause-list",
  }
};

