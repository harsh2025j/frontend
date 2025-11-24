import { createAsyncThunk } from "@reduxjs/toolkit";
import { ApiError } from "@/lib/utils/errorHandler";
import { AddPlanRequest, AddPlanResponse, PlanGetResponse } from "./subscription.types";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { subscriptionApi } from "@/data/services/subscription-service/subscription-service";

export const addPlan = createAsyncThunk<AddPlanResponse,AddPlanRequest>(
  "/subscription/create",
  async (formData, thunkAPI) => {
    try {
      console.log(formData)
      const res = await subscriptionApi.addPlan(formData);
      console.log(res.data);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.SUBSCRIPTION_ADDING_FAIL);
    }
  }
);

export const fetchPlans = createAsyncThunk<PlanGetResponse, void>(
  "article/fetchArticles",
  async (_, thunkAPI) => {
    try {
      const res = await subscriptionApi.fetchPlans();
      console.log("Subscription Thunk Success - Raw Data received:", res.data);
      return res.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      return thunkAPI.rejectWithValue(apiError.message || MESSAGES.SUBSCRIPTION_FETCH_FAIL);
    }
  }
);