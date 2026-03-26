import { createAsyncThunk } from "@reduxjs/toolkit";
import apiClient from "../../services/apiConfig/apiClient";

export const fetchDashboardStats = createAsyncThunk(
    "dashboard/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/users/dashboard-stats');
            return response.data?.data || response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard stats");
        }
    }
);
