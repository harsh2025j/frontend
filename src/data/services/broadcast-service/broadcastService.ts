import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export interface BroadcastPayload {
    title: string;
    body: string;
    sendToAll: boolean;
    channels: string[];
}

export const broadcastService = {
    sendBroadcast: async (data: BroadcastPayload) => {
        return await apiClient.post(API_ENDPOINTS.USERS.BROADCAST, data);
    },

};
