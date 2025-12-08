import { createSlice } from "@reduxjs/toolkit";
import { fetchUsers, verifyUser, fetchUserById, assignUserRoles } from "./usersThunks";
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
            })

            // Verify User
            .addCase(verifyUser.fulfilled, (state, action) => {
                // The backend returns the updated user (or lean version of it)
                const updatedData = action.payload.data;
                const userId = updatedData._id || action.meta.arg.userId;

                const userIndex = state.users.findIndex(u => u._id === userId);
                if (userIndex !== -1) {
                    // Update the fields we know changed and are present in response
                    state.users[userIndex].isVerified = updatedData.isVerified;

                    // Update tracking fields if present in response
                    if (updatedData.verifiedBy !== undefined) state.users[userIndex].verifiedBy = updatedData.verifiedBy;
                    if (updatedData.verifiedAt !== undefined) state.users[userIndex].verifiedAt = updatedData.verifiedAt;
                    if (updatedData.unverifiedBy !== undefined) state.users[userIndex].unverifiedBy = updatedData.unverifiedBy;
                    if (updatedData.unverifiedAt !== undefined) state.users[userIndex].unverifiedAt = updatedData.unverifiedAt;
                }
            }) // Correct closing for proper chaining

            // Fetch User By ID
            .addCase(fetchUserById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.loading = false;
                // Since we don't have a dedicated selectedUser in state yet, let's add it or just push to users list if not there.
                // Or better, let's add `selectedUser` to the interface first?
                // For now, I'll update the `users` list to include/update this user to ensure consistency.
                const fetchedUser = action.payload.data as unknown as User; // Force cast if needed due to strict types

                const index = state.users.findIndex(u => u._id === fetchedUser._id);
                if (index !== -1) {
                    state.users[index] = fetchedUser;
                } else {
                    state.users.push(fetchedUser);
                }
            })
            .addCase(fetchUserById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Assign Roles
            .addCase(assignUserRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignUserRoles.fulfilled, (state) => {
                state.loading = false;
                state.message = "Roles assigned successfully";
            })
            .addCase(assignUserRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetUsersState } = usersSlice.actions;
export default usersSlice.reducer;
