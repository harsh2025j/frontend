// Mirror of apiContants.ts — all Socket.io event names in one place.
// Namespace: /chat  (connected at API_BASE_URL + "/chat")

export const SOCKET_NAMESPACE = "/chat";

export const SOCKET_EMIT = {
  // Connection lifecycle
  USER_CONNECTED: "user_connected",
  GET_ONLINE_USERS: "get_online_users",

  // Conversation
  JOIN_CONVERSATION: "join_conversation",
  MARK_SEEN: "mark_seen",

  // Messaging
  SEND_MESSAGE: "send_message",

  // Typing
  TYPING: "typing",
  STOP_TYPING: "stop_typing",
} as const;

export const SOCKET_ON = {
  // Connection lifecycle
  CONNECT: "connect",

  // Presence
  ONLINE_USERS_LIST: "online_users_list",
  USER_STATUS_CHANGED: "user_status_changed",

  // Typing
  USER_TYPING: "user_typing",
  USER_STOPPED_TYPING: "user_stopped_typing",

  // Messaging
  NEW_MESSAGE: "new_message",
  MESSAGES_SEEN: "messages_seen",

  // Payments
  PAYMENT_SUCCESS: "payment_success",
} as const;

export type SocketEmitEvent = (typeof SOCKET_EMIT)[keyof typeof SOCKET_EMIT];
export type SocketOnEvent = (typeof SOCKET_ON)[keyof typeof SOCKET_ON];
