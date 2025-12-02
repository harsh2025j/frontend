import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers } from "./usersThunks";
import { UsersState, User } from "./users.types";

const initialState: UsersState = {
    users: [],
    loading: false,
    error: null,
    message: null,
};

const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        resetUsersState: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Users
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload.data || [];
            })
            .addCase(fetchUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetUsersState } = usersSlice.actions;
export default usersSlice.reducer;
