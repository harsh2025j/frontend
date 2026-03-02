import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export interface BroadcastPayload {
    title: string;
    body: string;
    sendToAll: boolean;
    channels: string[];
    userIds?: string[];
}

export const getBroadcastService = {
    getBroadcast: async (page = 1, limit = 16) => {
        return await apiClient.get(API_ENDPOINTS.NOTIFICATIONS.GET_BROADCAST, {
            params: { page, limit },
        });
    },
};
export const postBroadcastService = {
    sendBroadcast: async (data: BroadcastPayload) => {
        return await apiClient.post(API_ENDPOINTS.USERS.BROADCAST, data);
    },
    resendBroadcast: async (id: string) => {
        const url = API_ENDPOINTS.NOTIFICATIONS.RESEND_BROADCAST.replace(':id', id);
        return await apiClient.post(url, {});
    }

};
