import { createAsyncThunk } from "@reduxjs/toolkit";
import { permissionsApi } from "@/data/services/permissions-service/permissions-service";
import { PermissionResponse, CreatePermissionRequest, UpdatePermissionRequest } from "./permissions.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchPermissions = createAsyncThunk<PermissionResponse, void>(
    "permissions/fetchPermissions",
    async (_, thunkAPI) => {
        try {
            const res = await permissionsApi.fetchPermissions();
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch permissions");
        }
    }
);

export const createPermission = createAsyncThunk<PermissionResponse, CreatePermissionRequest>(
    "permissions/createPermission",
    async (data, thunkAPI) => {
        try {
            const res = await permissionsApi.createPermission(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to create permission");
        }
    }
);

export const updatePermission = createAsyncThunk<PermissionResponse, UpdatePermissionRequest>(
    "permissions/updatePermission",
    async (data, thunkAPI) => {
        try {
            const res = await permissionsApi.updatePermission(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to update permission");
        }
    }
);

export const deletePermission = createAsyncThunk<PermissionResponse, string>(
    "permissions/deletePermission",
    async (id, thunkAPI) => {
        try {
            const res = await permissionsApi.deletePermission(id);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to delete permission");
        }
    }
);
