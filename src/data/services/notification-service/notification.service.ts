import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export interface Notification {
    _id: string;
    userId: string;
    title: string;
    body: string;
    type: string;
    read: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
}

export const notificationService = {
    getNotifications: async (userId: string) => {
        return apiClient.get<Notification[]>(`${API_ENDPOINTS.NOTIFICATIONS.FETCH_BY_ID}?userId=${userId}`);
    },

    markAllRead: async (userId: string) => {
        return apiClient.post(API_ENDPOINTS.NOTIFICATIONS.READ_ALL, { userId });
    },

    markRead: async (id: string) => {
        const url = API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(":id", id);
        return apiClient.post(url, {});
    },

    deleteNotification: async (id: string) => {
        const url = API_ENDPOINTS.NOTIFICATIONS.DELETE.replace(":id", id);
        return apiClient.delete(url);
    },
};
