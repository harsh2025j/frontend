import { createSlice } from "@reduxjs/toolkit";
import { fetchPermissions, createPermission, updatePermission, deletePermission } from "./permissionsThunks";
import { PermissionsState, Permission } from "./permissions.types";

const initialState: PermissionsState = {
    permissions: [],
    loading: false,
    error: null,
    message: null,
};

const permissionsSlice = createSlice({
    name: "permissions",
    initialState,
    reducers: {
        resetPermissionsState: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Permissions
            .addCase(fetchPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.permissions = (action.payload?.data as Permission[]) || [];
            })
            .addCase(fetchPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Permission
            .addCase(createPermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createPermission.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Permission created successfully";
            })
            .addCase(createPermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Permission
            .addCase(updatePermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updatePermission.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Permission updated successfully";
            })
            .addCase(updatePermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Permission
            .addCase(deletePermission.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deletePermission.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Permission deleted successfully";
            })
            .addCase(deletePermission.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetPermissionsState } = permissionsSlice.actions;
export default permissionsSlice.reducer;
