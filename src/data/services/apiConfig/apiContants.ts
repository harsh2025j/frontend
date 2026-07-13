// export const API_BASE_URL = "https://shellproof-ka-noncorrelative.ngrok-free.dev";
// export const API_BASE_URL = "https://galliardly-pyritic-kathleen.ngrok-free.dev";
// export const API_BASE_URL = "https://api.sajjadhusainlawassociates.com/";
export const API_BASE_URL = "http://localhost:8000/"
export const API_ENDPOINTS = {
  SEARCH: {
    JUDGES: "/search/judges",
    CASES: "/search/cases",
    JUDGMENTS: "/search/judgments",
  },
  AUTH: {
    REGISTER: "/auth/register",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    VERIFY_OTP: "/auth/verify",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    RESEND_OTP: "/auth/resend-otp",
    SOCIAL_LOGIN: "/auth/social-login",
    REFRESH: "/auth/refresh"
  },
  PROFILE: {
    FETCH: "/profile",
    UPDATE: "/profile",
    ADVOCATES: "/profile/advocates",
    PUBLIC: "/profile/public/:id",
    BY_USERNAME: "/profile/username/:username",
    CONSULTANCY: "/profile/consultancy",
  },
  ARTICLE: {
    CREATE: "/articles",
    FETCH_ALL: "/articles",
    FETCH_MULTI: "/articles/multi",
    APPROVE: "/articles/:id/approve",
    REJECT: "/articles/:id/reject",
    TRACK_VIEW: "/articles/:id/view",
    TOGGLE_LIKE: "/articles/:id/like",
  },
  CATEGORIES: {
    CREATE: "/categories",
    FETCH_ALL_CATEGORY: "/categories",
  },
  TAGS: {
    BASE: "/tags",
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
    CASE_TYPES: "/cases/types",
  },
  JUDGMENTS: {
    BASE: "/judgments",
    FETCH_MULTI: "/judgments/multi",
    LANDMARK: "/judgments/landmark",
    BY_CASE: "/judgments/case",
    BY_JUDGE: "/judgments/judge",
  },
  JUDGES: {
    BASE: "/judges",
    ACTIVE: "/judges/active",
    BY_COURT: "/judges/court",
    TOP: "/judges/top",
    UNIQUE_COURTS: "/judges/unique-courts",
  },
  ADVOCATES: {
    BASE: "/advocates",
    TOP: "/advocates/top",
    UNIQUE_COURTS: "/advocates/unique-courts",
  },
  USERS: {
    BROADCAST: "/users/broadcast",
  },
  NOTIFICATIONS: {
    GET_BROADCAST: "/notifications/broadcasts",
    RESEND_BROADCAST: "/notifications/broadcasts/:id/resend",
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
  },
  OFFICES: {
    BASE: "/offices",
    ACTIVE: "/offices/active",
  },
  PRACTICE_AREAS: {
    BASE: "/practice-areas",
    ACTIVE: "/practice-areas/active",
  },
  AUDIT_LOGS: {
    BASE: "/audit-logs",
    STATISTICS: "/audit-logs/statistics",
    FAILED_ATTEMPTS: "/audit-logs/failed-attempts",
    EXPORT: "/audit-logs/export",
  },
  ADVERTISEMENTS: {
    BASE: "/advertisements",
    BY_SLOT: "/advertisements/slot",
    TRACK_IMPRESSION: "/advertisements/:id/track-impression",
    TRACK_CLICK: "/advertisements/:id/track-click",
  },
  APPOINTMENTS: {
    CREATE: "/appointments",
    FETCH_BY_ID: "/appointments/:id",
    FETCH_BY_ADVOCATE: "/appointments/advocate/:advocateId",
    FETCH_BY_CLIENT: "/appointments/client",
    GET_UNREAD_COUNT: "/appointments/unread-count/:advocateId",
    MARK_READ: "/appointments/:id/read",
    UPDATE_STATUS: "/appointments/:id/status",
    UPDATE_OUTCOME: "/appointments/:id/outcome",
    CANCEL: "/appointments/:id/cancel",
    CONFIRM: "/appointments/:id/confirm",
    RESCHEDULE: "/appointments/:id/reschedule",
    CLIENT_CONFIRM: "/appointments/:id/client-confirm",
    FINALIZE_MEETING: "/appointments/:id/finalize-meeting",
    AVAILABLE_SLOTS: "/appointments/available-slots/:advocateId",
    CREATE_PAYMENT_ORDER: "/appointments/:id/payment/create-order",
    VERIFY_PAYMENT_ORDER: "/appointments/:id/payment/verify",
  },
  PAYOUTS: {
    GET_COMMISSION: "/payouts/settings/commission",
    UPDATE_COMMISSION: "/payouts/settings/commission",
    GET_ADVOCATES: "/payouts/advocates",
    GET_ADVOCATE_DETAILS: "/payouts/advocate/:id",
    GET_ADVOCATE_APPOINTMENTS: "/payouts/advocate/:id/appointments",
    GET_ADVOCATE_DOCUMENTS: "/payouts/advocate/:id/documents",
    GET_ADVOCATE_PAYOUT_HISTORY: "/payouts/advocate/:id/history",
    LOG_PAYOUT: "/payouts/advocate/:id",
  },
  CHATS: {
    CREATE_OR_GET: "/chats/conversation",
    GET_USER_CONVERSATIONS: "/chats/user/:userId",
    GET_MESSAGES: "/chats/:conversationId/messages",
    CREATE_PAYMENT_ORDER: "/chats/payment/create-order",
    VERIFY_PAYMENT_ORDER: "/chats/payment/verify",
  }
};
