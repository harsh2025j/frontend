import { createAsyncThunk } from "@reduxjs/toolkit";
import { planService } from "@/data/services/plan-service/plan-service";
import { CreatePlanRequest, UpdatePlanRequest } from "./plan.types";

// Fetch all plans
export const fetchPlans = createAsyncThunk(
    "plan/fetchPlans",
    async (_, { rejectWithValue }) => {
        try {
            const response = await planService.getAllPlans();
            return response.data || response;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to fetch plans"
            );
        }
    }
);

// Create a new plan
export const createPlan = createAsyncThunk(
    "plan/createPlan",
    async (planData: CreatePlanRequest, { rejectWithValue }) => {
        try {
            const response = await planService.createPlan(planData);
            return {
                plan: response.data || response,
                message: response.message || "Plan created successfully",
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to create plan"
            );
        }
    }
);

// Update an existing plan
export const updatePlan = createAsyncThunk(
    "plan/updatePlan",
    async (planData: UpdatePlanRequest, { rejectWithValue }) => {
        try {
            const response = await planService.updatePlan(planData);
            return {
                plan: response.data || response,
                message: response.message || "Plan updated successfully",
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to update plan"
            );
        }
    }
);

// Delete a plan
export const deletePlan = createAsyncThunk(
    "plan/deletePlan",
    async (id: string, { rejectWithValue }) => {
        try {
            const response = await planService.deletePlan(id);
            return {
                id,
                message: response.message || "Plan deleted successfully",
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data?.message || "Failed to delete plan"
            );
        }
    }
);
