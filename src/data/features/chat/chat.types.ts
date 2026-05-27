export type MessageType = "text" | "document" | "payment_request";

export interface MessageMetadata {
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  paymentRequestId?: string;
  amount?: number;
  status?: "pending" | "paid" | "failed";
  transactionId?: string;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  type: MessageType;
  content: string;
  metadata?: MessageMetadata;
  deliveryStatus: "sent" | "received" | "seen";
  sentAt: string;
  receivedAt?: string;
  seenAt?: string;
}

export interface ConversationParticipant {
  id: string;
  _id: string;
  name: string;
  username: string;
  profilePicture?: string;
  photoUrl?: string;
  role: string;
}

export interface Conversation {
  _id: string;
  participants: ConversationParticipant[];
  lastMessage?: {
    text: string;
    senderId: string;
    timestamp: string;
    deliveryStatus?: "sent" | "received" | "seen";
  };
  createdAt: string;
  updatedAt: string;
}

export interface ConversationListResponse {
  success: boolean;
  message: string;
  data: Conversation[];
}

export interface MessageListResponse {
  success: boolean;
  message: string;
  data: Message[];
}

export interface SingleMessageResponse {
  success: boolean;
  message: string;
  data: Message;
}
