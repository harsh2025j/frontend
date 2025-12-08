import { createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "@/data/services/users-service/users-service";
import { UserListResponse, UserVerificationResponse, UserFilter } from "./users.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchUsers = createAsyncThunk<UserListResponse, UserFilter | undefined>(
    "users/fetchUsers",
    async (filters, thunkAPI) => {
        try {
            const res = await usersApi.fetchUsers(filters);
            return res;
        } catch (err: unknown) {
            // console.log("usersApi fetchUsers error", err);
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch users");
        }
    }
);

export const verifyUser = createAsyncThunk<
    UserVerificationResponse,
    { userId: string; isVerified: boolean }
>("users/verifyUser", async ({ userId, isVerified }, thunkAPI) => {
    try {
        const res = await usersApi.verifyUser(userId, isVerified);
        return res;
    } catch (err: unknown) {
        const apiError = err as ApiError;
        return thunkAPI.rejectWithValue(apiError.message || "Failed to verify user");
    }
});

export const fetchUserById = createAsyncThunk<
    UserVerificationResponse, // Reusing response type which holds single user data
    string
>("users/fetchUserById", async (userId, thunkAPI) => {
    try {
        const res = await usersApi.getUserById(userId);
        return res;
    } catch (err: unknown) {
        const apiError = err as ApiError;
        return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch user");
    }
});

export const assignUserRoles = createAsyncThunk<
    any, // Response type might be generic success
    { userId: string; roleIds: string[]; permissionIds: string[] }
>("users/assignUserRoles", async ({ userId, roleIds, permissionIds }, thunkAPI) => {
    try {
        const res = await usersApi.assignUserRoles(userId, { roleIds, permissionIds });
        return res;
    } catch (err: unknown) {
        const apiError = err as ApiError;
        return thunkAPI.rejectWithValue(apiError.message || "Failed to assign roles");
    }
});
