import apiClient from "../apiConfig/apiClient";
import { CreatePlanRequest, UpdatePlanRequest } from "@/data/features/plan/plan.types";

const PLAN_BASE_URL = "/plans";

export const planService = {
    // Get all plans
    getAllPlans: async () => {
        const response = await apiClient.get(PLAN_BASE_URL);
        return response.data;
    },

    // Create a new plan
    createPlan: async (planData: CreatePlanRequest) => {
        const response = await apiClient.post(PLAN_BASE_URL, planData);
        return response.data;
    },

    // Update an existing plan
    updatePlan: async (planData: UpdatePlanRequest) => {
        const { id, ...data } = planData;
        const response = await apiClient.post(`${PLAN_BASE_URL}/${id}`, data);
        return response.data;
    },

    // Delete a plan
    deletePlan: async (id: string) => {
        const response = await apiClient.delete(`${PLAN_BASE_URL}/${id}`);
        return response.data;
    },
};
