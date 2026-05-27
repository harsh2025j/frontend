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

  getUserConversations: async (userId: string, skip = 0, limit = 20) => {
    const url = API_ENDPOINTS.CHATS.GET_USER_CONVERSATIONS.replace(':userId', userId);
    return apiClient({
      url: `${url}?skip=${skip}&limit=${limit}`,
      method: 'GET',
    });
  },

  getMessages: async (conversationId: string, skip = 0, limit = 50) => {
    const url = API_ENDPOINTS.CHATS.GET_MESSAGES.replace(':conversationId', conversationId);
    return apiClient({
      url: `${url}?skip=${skip}&limit=${limit}`,
      method: 'GET',
    });
  },
};

