"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchPlans, createPlan, updatePlan, deletePlan } from "./planThunks";
import { resetPlanState } from "./planSlice";
import { CreatePlanRequest, UpdatePlanRequest } from "./plan.types";
import toast from "react-hot-toast";

// Selectors
const selectPlanLoading = (state: any) => state.plan.loading;
const selectPlanError = (state: any) => state.plan.error;
const selectPlanMessage = (state: any) => state.plan.message;
const selectPlans = (state: any) => state.plan.plans;

export const usePlanActions = () => {
    const dispatch = useAppDispatch();

    const plans = useAppSelector(selectPlans);
    const loading = useAppSelector(selectPlanLoading);
    const error = useAppSelector(selectPlanError);
    const message = useAppSelector(selectPlanMessage);

    // Fetch plans on mount
    useEffect(() => {
        if (plans.length === 0 && !loading) {
            dispatch(fetchPlans());
        }
    }, [dispatch, plans.length, loading]);

    // Handle success/error messages
    useEffect(() => {
        if (message) {
            toast.success(message);
            dispatch(resetPlanState());
        }
        if (error) {
            console.error("Plan Error:", error);
            toast.error("Working on this module, it's under development");
            dispatch(resetPlanState());
        }
    }, [message, error, dispatch]);

    const handleCreatePlan = async (planData: CreatePlanRequest) => {
        return dispatch(createPlan(planData));
    };

    const handleUpdatePlan = async (planData: UpdatePlanRequest) => {
        return dispatch(updatePlan(planData));
    };

    const handleDeletePlan = async (id: string) => {
        return dispatch(deletePlan(id));
    };

    const handleRefetchPlans = () => {
        dispatch(fetchPlans());
    };

    return {
        plans,
        loading,
        error,
        message,
        createPlan: handleCreatePlan,
        updatePlan: handleUpdatePlan,
        deletePlan: handleDeletePlan,
        refetchPlans: handleRefetchPlans,
    };
};
