import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError } from "@/lib/utils/errorHandler";
import { AddPlanRequest, AddPlanResponse, PlanGetResponse, UserSubscriptionResponse } from "./subscription.types";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { subscriptionApi } from "@/data/services/subscription-service/subscription-service";

export const addPlan = createAsyncThunk<AddPlanResponse, AddPlanRequest>(
  "/subscription/create",
  async (formData, thunkAPI) => {
    try {
      const res = await subscriptionApi.addPlan(formData);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.SUBSCRIPTION_ADDING_FAIL);
    }
  }
);

export const fetchPlans = createAsyncThunk<PlanGetResponse, void>(
  "subscription/fetchPlans",
  async (_, thunkAPI) => {
    try {
      const res = await subscriptionApi.fetchPlans();
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.SUBSCRIPTION_FETCH_FAIL);
    }
  }
);

export const getUserSubscription = createAsyncThunk<UserSubscriptionResponse, void>(
  "subscription/getUserSubscription",
  async (_, thunkAPI) => {
    try {
      const res = await subscriptionApi.getMySubscription();
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || "Failed to fetch subscription");
    }
  }
);