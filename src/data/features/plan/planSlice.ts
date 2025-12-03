import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { PlanState, Plan } from "./plan.types";
import { fetchPlans, createPlan, updatePlan, deletePlan } from "./planThunks";

const initialState: PlanState = {
    plans: [],
    loading: false,
    error: null,
    message: null,
};

const planSlice = createSlice({
    name: "plan",
    initialState,
    reducers: {
        resetPlanState: (state) => {
            state.loading = false;
            state.error = null;
            state.message = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Plans
        builder
            .addCase(fetchPlans.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchPlans.fulfilled, (state, action: PayloadAction<Plan[]>) => {
                state.loading = false;
                state.plans = action.payload;
            })
            .addCase(fetchPlans.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Create Plan
        builder
            .addCase(createPlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(createPlan.fulfilled, (state, action: PayloadAction<{ plan: Plan; message: string }>) => {
                state.loading = false;
                state.plans.push(action.payload.plan);
                state.message = action.payload.message || "Plan created successfully";
            })
            .addCase(createPlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update Plan
        builder
            .addCase(updatePlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(updatePlan.fulfilled, (state, action: PayloadAction<{ plan: Plan; message: string }>) => {
                state.loading = false;
                const index = state.plans.findIndex((p) => p.id === action.payload.plan.id);
                if (index !== -1) {
                    state.plans[index] = action.payload.plan;
                }
                state.message = action.payload.message || "Plan updated successfully";
            })
            .addCase(updatePlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete Plan
        builder
            .addCase(deletePlan.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.message = null;
            })
            .addCase(deletePlan.fulfilled, (state, action: PayloadAction<{ id: string; message: string }>) => {
                state.loading = false;
                state.plans = state.plans.filter((p) => p.id !== action.payload.id);
                state.message = action.payload.message || "Plan deleted successfully";
            })
            .addCase(deletePlan.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetPlanState } = planSlice.actions;
export default planSlice.reducer;
