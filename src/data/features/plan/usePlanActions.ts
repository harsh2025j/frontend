"use client";
import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchPlans, createPlan, updatePlan, deletePlan } from "./planThunks";
import { resetPlanState, clearPlanError } from "./planSlice";
import { CreatePlanRequest, UpdatePlanRequest } from "./plan.types";
import toast from "react-hot-toast";

// Module-level flags to prevent duplicate operations
let lastShownError: string | null = null;
let errorTimeout: NodeJS.Timeout | null = null;

// Selectors
const selectPlanLoading = (state: any) => state.plan.loading;
const selectPlanError = (state: any) => state.plan.error;
const selectPlanMessage = (state: any) => state.plan.message;
const selectPlans = (state: any) => state.plan.plans;
const selectHasFetched = (state: any) => state.plan.hasFetched;

export const usePlanActions = () => {
    const dispatch = useAppDispatch();

    const plans = useAppSelector(selectPlans);
    const loading = useAppSelector(selectPlanLoading);
    const error = useAppSelector(selectPlanError);
    const message = useAppSelector(selectPlanMessage);
    const hasFetched = useAppSelector(selectHasFetched);

    // Handle success/error messages (show only once with debounce)
    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(resetPlanState());
        }

        if (error && error !== lastShownError) {
            // Clear any pending timeout
            if (errorTimeout) clearTimeout(errorTimeout);

            lastShownError = error;
            console.error("Plan Error:", error);
            toast.error(error);
            dispatch(clearPlanError());

            // Reset after 3 seconds
            errorTimeout = setTimeout(() => {
                lastShownError = null;
            }, 3000);
        }
    }, [message, error, dispatch]);

    const handleCreatePlan = useCallback(async (planData: CreatePlanRequest) => {
        return dispatch(createPlan(planData));
    }, [dispatch]);

    const handleUpdatePlan = useCallback(async (planData: UpdatePlanRequest) => {
        return dispatch(updatePlan(planData));
    }, [dispatch]);

    const handleDeletePlan = useCallback(async (id: string) => {
        return dispatch(deletePlan(id));
    }, [dispatch]);

    const handleRefetchPlans = useCallback(() => {
        // Only prevent if currently loading (to avoid concurrent requests)
        // Allow fetching even if hasFetched=true (for manual refresh)
        if (!loading) {
            dispatch(fetchPlans());
        }
    }, [dispatch, loading]);

    return {
        plans,
        loading,
        error,
        message,
        hasFetched,
        createPlan: handleCreatePlan,
        updatePlan: handleUpdatePlan,
        deletePlan: handleDeletePlan,
        refetchPlans: handleRefetchPlans,
    };
};
