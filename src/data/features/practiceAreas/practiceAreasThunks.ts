import { createAsyncThunk } from "@reduxjs/toolkit";
import { practiceAreasApi } from "@/data/services/practice-areas-service/practiceAreas.service";
import { PracticeAreaResponse, CreatePracticeAreaRequest, UpdatePracticeAreaRequest } from "./practiceAreas.types";
import { ApiError } from "@/lib/utils/errorHandler";

export const fetchPracticeAreas = createAsyncThunk<PracticeAreaResponse, void>(
    "practiceAreas/fetchPracticeAreas",
    async (_, thunkAPI) => {
        try {
            const res = await practiceAreasApi.fetchPracticeAreas();
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch practice areas");
        }
    }
);

export const fetchActivePracticeAreas = createAsyncThunk<PracticeAreaResponse, void>(
    "practiceAreas/fetchActivePracticeAreas",
    async (_, thunkAPI) => {
        try {
            const res = await practiceAreasApi.fetchActivePracticeAreas();
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch active practice areas");
        }
    }
);

export const createPracticeArea = createAsyncThunk<PracticeAreaResponse, CreatePracticeAreaRequest>(
    "practiceAreas/createPracticeArea",
    async (data, thunkAPI) => {
        try {
            const res = await practiceAreasApi.createPracticeArea(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to create practice area");
        }
    }
);

export const updatePracticeArea = createAsyncThunk<PracticeAreaResponse, UpdatePracticeAreaRequest>(
    "practiceAreas/updatePracticeArea",
    async (data, thunkAPI) => {
        try {
            const res = await practiceAreasApi.updatePracticeArea(data);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to update practice area");
        }
    }
);

export const deletePracticeArea = createAsyncThunk<PracticeAreaResponse, string>(
    "practiceAreas/deletePracticeArea",
    async (id, thunkAPI) => {
        try {
            const res = await practiceAreasApi.deletePracticeArea(id);
            return res.data;
        } catch (err: unknown) {
            const apiError = err as ApiError;
            return thunkAPI.rejectWithValue(apiError.message || "Failed to delete practice area");
        }
    }
);
