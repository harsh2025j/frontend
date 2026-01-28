import { createSlice } from "@reduxjs/toolkit";
import { fetchPracticeAreas, fetchActivePracticeAreas, createPracticeArea, updatePracticeArea, deletePracticeArea } from "./practiceAreasThunks";
import { PracticeAreasState, PracticeArea } from "./practiceAreas.types";

const initialState: PracticeAreasState = {
    practiceAreas: [],
    loading: false,
    error: null,
    message: null,
};

const practiceAreasSlice = createSlice({
    name: "practiceAreas",
    initialState,
    reducers: {
        resetPracticeAreasState: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Practice Areas
            .addCase(fetchPracticeAreas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPracticeAreas.fulfilled, (state, action) => {
                state.loading = false;
                state.practiceAreas = (action.payload?.data as PracticeArea[]) || [];
            })
            .addCase(fetchPracticeAreas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Active Practice Areas
            .addCase(fetchActivePracticeAreas.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActivePracticeAreas.fulfilled, (state, action) => {
                state.loading = false;
                state.practiceAreas = (action.payload?.data as PracticeArea[]) || [];
            })
            .addCase(fetchActivePracticeAreas.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Practice Area
            .addCase(createPracticeArea.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPracticeArea.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Practice area created successfully";
            })
            .addCase(createPracticeArea.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Practice Area
            .addCase(updatePracticeArea.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePracticeArea.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Practice area updated successfully";
            })
            .addCase(updatePracticeArea.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Practice Area
            .addCase(deletePracticeArea.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePracticeArea.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Practice area deleted successfully";
            })
            .addCase(deletePracticeArea.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetPracticeAreasState } = practiceAreasSlice.actions;
export default practiceAreasSlice.reducer;
