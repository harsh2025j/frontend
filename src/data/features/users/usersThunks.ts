import { createAsyncThunk } from "@reduxjs/toolkit";
import { usersApi } from "@/data/services/users-service/users-service";
import { UserResponse, UserFilter } from "./users.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchUsers = createAsyncThunk<UserResponse, UserFilter | undefined>(
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
