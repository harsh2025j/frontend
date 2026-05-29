import { API_ENDPOINTS } from '../apiConfig/apiContants';
import apiClient from '../apiConfig/apiClient';

export const ChatServiceAPI = {
  createOrGetConversation: async (participantIds: string[]) => {
    return apiClient({
      url: API_ENDPOINTS.CHATS.CREATE_OR_GET,
      method: 'POST',
      data: { participantIds },
    });
  },

  getPresignedUrl: async (fileName: string, contentType: string) => {
    return apiClient({
      url: '/chats/presigned-url',
      method: 'POST',
      data: { fileName, contentType },
    });
  },

  getUserConversations: async (userId: string, skip = 0, limit = 20, search?: string) => {
    const url = API_ENDPOINTS.CHATS.GET_USER_CONVERSATIONS.replace(':userId', userId);
    let fullUrl = `${url}?skip=${skip}&limit=${limit}`;
    if (search && search.trim() !== '') {
      fullUrl += `&search=${encodeURIComponent(search.trim())}`;
    }
    return apiClient({
      url: fullUrl,
      method: 'GET',
    });
  },

  getMessages: async (conversationId: string, userId: string, skip = 0, limit = 50) => {
    const url = API_ENDPOINTS.CHATS.GET_MESSAGES.replace(':conversationId', conversationId);
    return apiClient({
      url: `${url}?userId=${userId}&skip=${skip}&limit=${limit}`,
      method: 'GET',
    });
  },

  createPaymentOrder: async (paymentReqId: string, amount: number, userId: string, advocateId: string) => {
    return apiClient({
      url: API_ENDPOINTS.CHATS.CREATE_PAYMENT_ORDER,
      method: 'POST',
      data: { paymentReqId, amount, userId, advocateId },
    });
  },

  verifyPaymentOrder: async (razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string) => {
    return apiClient({
      url: API_ENDPOINTS.CHATS.VERIFY_PAYMENT_ORDER,
      method: 'POST',
      data: { razorpay_order_id, razorpay_payment_id, razorpay_signature },
    });
  },
};

