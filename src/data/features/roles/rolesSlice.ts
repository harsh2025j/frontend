import { createSlice } from "@reduxjs/toolkit";
import { fetchRoles, createRole, updateRole, deleteRole, updateRolePermissions } from "./rolesThunks";
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
                // Handle potentially double-wrapped response: { data: { data: [...] } } or { data: [...] } or [...]
                const level1 = (action.payload as any)?.data || action.payload;
                const level2 = (level1 as any)?.data || level1;
                state.roles = Array.isArray(level2) ? level2 : [];
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
            })
            // Update Role Permissions
            .addCase(updateRolePermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateRolePermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.message = "Role permissions updated successfully";
                // Update the role in the state
                const updatedRole = ((action.payload as any)?.data || action.payload) as Role;
                if (updatedRole && updatedRole._id) {
                    const index = (state.roles as Role[]).findIndex(r => r._id === updatedRole._id);
                    if (index !== -1) {
                        state.roles[index] = updatedRole;
                    }
                }
            })
            .addCase(updateRolePermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetRolesState } = rolesSlice.actions;
export default rolesSlice.reducer;
