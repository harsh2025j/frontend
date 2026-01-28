import { createAsyncThunk } from "@reduxjs/toolkit";
import { officesApi } from "@/data/services/offices-service/offices.service";
import { OfficeResponse, CreateOfficeRequest, UpdateOfficeRequest } from "./offices.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchOffices = createAsyncThunk<OfficeResponse, void>(
    "offices/fetchOffices",
    async (_, thunkAPI) => {
        try {
            const res = await officesApi.fetchOffices();
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch offices");
        }
    }
);

export const fetchActiveOffices = createAsyncThunk<OfficeResponse, void>(
    "offices/fetchActiveOffices",
    async (_, thunkAPI) => {
        try {
            const res = await officesApi.fetchActiveOffices();
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch active offices");
        }
    }
);

export const createOffice = createAsyncThunk<OfficeResponse, CreateOfficeRequest>(
    "offices/createOffice",
    async (data, thunkAPI) => {
        try {
            const res = await officesApi.createOffice(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to create office");
        }
    }
);

export const updateOffice = createAsyncThunk<OfficeResponse, UpdateOfficeRequest>(
    "offices/updateOffice",
    async (data, thunkAPI) => {
        try {
            const res = await officesApi.updateOffice(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to update office");
        }
    }
);

export const deleteOffice = createAsyncThunk<OfficeResponse, string>(
    "offices/deleteOffice",
    async (id, thunkAPI) => {
        try {
            const res = await officesApi.deleteOffice(id);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to delete office");
        }
    }
);
