import { createAsyncThunk } from "@reduxjs/toolkit";
import { rolesApi } from "@/data/services/roles-service/roles-service";
import { RoleResponse, CreateRoleRequest, UpdateRoleRequest } from "./roles.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchRoles = createAsyncThunk<RoleResponse, void>(
    "roles/fetchRoles",
    async (_, thunkAPI) => {
        try {
            const res = await rolesApi.fetchRoles();
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch roles");
        }
    }
);

export const createRole = createAsyncThunk<RoleResponse, CreateRoleRequest>(
    "roles/createRole",
    async (data, thunkAPI) => {
        try {
            const res = await rolesApi.createRole(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to create role");
        }
    }
);

export const updateRole = createAsyncThunk<RoleResponse, UpdateRoleRequest>(
    "roles/updateRole",
    async (data, thunkAPI) => {
        try {
            const res = await rolesApi.updateRole(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to update role");
        }
    }
);

export const deleteRole = createAsyncThunk<RoleResponse, string>(
    "roles/deleteRole",
    async (id, thunkAPI) => {
        try {
            const res = await rolesApi.deleteRole(id);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to delete role");
        }
    }
);
