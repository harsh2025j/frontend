// import { configureStore } from "@reduxjs/toolkit";
// import authReducer from "../features/auth/authSlice";
// import articleReducer from "../features/article/articleSlice";
// import subscriptionReducer from "../features/subscription/subscriptionSlice"
// import { create } from "zustand";
// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     article:articleReducer,
//     subscription:subscriptionReducer,
// import categoryReducer from "../features/category/categorySlice";
// import rolesReducer from "../features/roles/rolesSlice";
// import permissionsReducer from "../features/permissions/permissionsSlice";

// export const store = configureStore({
//   reducer: {
//     auth: authReducer,
//     article: articleReducer,
//     category: categoryReducer,
//     roles: rolesReducer,
//     permissions: permissionsReducer,

//   },
// });

// export const useGlobalStore = create((set:any) => ({
//   planData: null,
//   setPlanData: (data:any) => set({ planData: data }),
// }));

// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;



import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import articleReducer from "../features/article/articleSlice";
import categoryReducer from "../features/category/categorySlice";
import rolesReducer from "../features/roles/rolesSlice";
import permissionsReducer from "../features/permissions/permissionsSlice";
import uiReducer from "../features/ui/uiSlice";
import subscriptionReducer from "../features/subscription/subscriptionSlice"
import profileReducer from "../features/profile/profileSlice"
import usersReducer from "../features/users/usersSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    article: articleReducer,
    category: categoryReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
    ui: uiReducer,
    subscription: subscriptionReducer,
    users: usersReducer,
  },

},
);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
