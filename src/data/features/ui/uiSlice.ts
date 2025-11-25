import { createSlice } from "@reduxjs/toolkit";

interface UiState {
    isLoading: boolean;
    loadingRequestCount: number;
}

const initialState: UiState = {
    isLoading: false,
    loadingRequestCount: 0,
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        startLoading: (state) => {
            state.loadingRequestCount += 1;
            state.isLoading = true;
        },
        stopLoading: (state) => {
            state.loadingRequestCount -= 1;
            if (state.loadingRequestCount <= 0) {
                state.loadingRequestCount = 0;
                state.isLoading = false;
            }
        },
    },
});

export const { startLoading, stopLoading } = uiSlice.actions;
export default uiSlice.reducer;
