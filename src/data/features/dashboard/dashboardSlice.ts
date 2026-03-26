import { createSlice } from "@reduxjs/toolkit";
import { fetchDashboardStats } from "./dashboardThunks";
import { DashboardState } from "./dashboard.types";

const getInitialStats = () => {
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem("dashboardStats");
        if (cached) {
            try {
                return JSON.parse(cached);
            } catch (e) {
                console.error("Failed to parse dashboardStats from localStorage", e);
                return null;
            }
        }
    }
    return null;
};

const initialState: DashboardState = {
    stats: getInitialStats(),
    loading: false,
    error: null,
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        resetDashboardState: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStats.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDashboardStats.fulfilled, (state, action) => {
                state.loading = false;
                state.stats = action.payload;
                if (typeof window !== 'undefined') {
                    localStorage.setItem("dashboardStats", JSON.stringify(action.payload));
                }
            })
            .addCase(fetchDashboardStats.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer;
