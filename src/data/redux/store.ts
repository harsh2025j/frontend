import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import articleReducer from "../features/article/articleSlice";
import categoryReducer from "../features/category/categorySlice";
import rolesReducer from "../features/roles/rolesSlice";
import permissionsReducer from "../features/permissions/permissionsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    article: articleReducer,
    category: categoryReducer,
    roles: rolesReducer,
    permissions: permissionsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
