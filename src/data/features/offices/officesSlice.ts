import { createSlice } from "@reduxjs/toolkit";
import { fetchOffices, fetchActiveOffices, createOffice, updateOffice, deleteOffice } from "./officesThunks";
import { OfficesState, Office } from "./offices.types";

const initialState: OfficesState = {
    offices: [],
    loading: false,
    error: null,
    message: null,
};

const officesSlice = createSlice({
    name: "offices",
    initialState,
    reducers: {
        resetOfficesState: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Offices
            .addCase(fetchOffices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOffices.fulfilled, (state, action) => {
                state.loading = false;
                const extract = (d: any): any[] => {
                    if (Array.isArray(d)) return d;
                    if (d && typeof d === 'object') {
                        if (Array.isArray(d.data)) return extract(d.data);
                        if (d.data && typeof d.data === 'object') return extract(d.data);
                    }
                    return [];
                };
                state.offices = extract(action.payload);
            })
            .addCase(fetchOffices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Active Offices
            .addCase(fetchActiveOffices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchActiveOffices.fulfilled, (state, action) => {
                state.loading = false;
                const extract = (d: any): any[] => {
                    if (Array.isArray(d)) return d;
                    if (d && typeof d === 'object') {
                        if (Array.isArray(d.data)) return extract(d.data);
                        if (d.data && typeof d.data === 'object') return extract(d.data);
                    }
                    return [];
                };
                state.offices = extract(action.payload);
            })
            .addCase(fetchActiveOffices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Office
            .addCase(createOffice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createOffice.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Office created successfully";
            })
            .addCase(createOffice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Office
            .addCase(updateOffice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateOffice.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Office updated successfully";
            })
            .addCase(updateOffice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Office
            .addCase(deleteOffice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteOffice.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Office deleted successfully";
            })
            .addCase(deleteOffice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetOfficesState } = officesSlice.actions;
export default officesSlice.reducer;
