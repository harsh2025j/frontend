import { createSlice } from "@reduxjs/toolkit";
import { fetchRoles, createRole, updateRole, deleteRole } from "./rolesThunks";
import { RolesState, Role } from "./roles.types";

const initialState: RolesState = {
    roles: [],
    loading: false,
    error: null,
    message: null,
};

const rolesSlice = createSlice({
    name: "roles",
    initialState,
    reducers: {
        resetRolesState: (state) => {
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Roles
            .addCase(fetchRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = (action.payload?.data as Role[]) || [];
            })
            .addCase(fetchRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Create Role
            .addCase(createRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Role created successfully";
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update Role
            .addCase(updateRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Role updated successfully";
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete Role
            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Role deleted successfully";
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetRolesState } = rolesSlice.actions;
export default rolesSlice.reducer;
