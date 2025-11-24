import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import articleReducer from "../features/article/articleSlice";
import subscriptionReducer from "../features/subscription/subscriptionSlice"
import { create } from "zustand";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    article:articleReducer,
    subscription:subscriptionReducer,
  },
});

export const useGlobalStore = create((set:any) => ({
  planData: null,
  setPlanData: (data:any) => set({ planData: data }),
}));

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
