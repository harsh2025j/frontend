import { getToken } from "firebase/messaging";
import { messaging } from "@/config/firebase";

export const requestFcmToken = async (): Promise<string | null> => {
    try {
        if (typeof window === "undefined" || !messaging) {
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === "granted") {

            const currentToken = await getToken(messaging, {
                vapidKey: "BNJrZiqKg_60JhtBxeQI19p_o1aNtodTt04nw6lI2Q2o8r6RJSLDjLE_iiqb5jW4uzdVarresWWL8O6B1K1Z2FM"//only for testing put it on .env in production 
            }).catch((err) => {
                console.warn("Failed to get token with placeholder VAPID key, trying without key");
                return getToken(messaging);
            });

            if (currentToken) {
                return currentToken;
            } else {
                console.log("No registration token available. Request permission to generate one.");
                return null;
            }
        } else {
            console.log("Unable to get permission to notify.");
            return null;
        }
    } catch (error) {
        console.error("An error occurred while retrieving token. ", error);
        return null;
    }
};
