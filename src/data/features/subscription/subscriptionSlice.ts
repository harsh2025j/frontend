import { createSlice } from "@reduxjs/toolkit";
import { SubscriptionState } from "./subscription.types";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { addPlan, fetchPlans, getUserSubscription } from "./subscriptionThunks";

const initialState: SubscriptionState = {
  loading: false,
  error: null,
  message: null,
  plans: [],
  currentSubscription: null,
};

const SubscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    resetSubscriptionState: (state) => {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add Plan
      .addCase(addPlan.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(addPlan.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message || MESSAGES.ARTICLE_CREATE_SUCCESS;
      })
      .addCase(addPlan.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Fetch Plans
      .addCase(fetchPlans.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(fetchPlans.fulfilled, (state, action) => {
        state.loading = false;
        const payload: any = action.payload as any;
        state.plans = payload.data || [];
      })
      .addCase(fetchPlans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Get User Subscription
      .addCase(getUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSubscription = action.payload.data;
      })
      .addCase(getUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.currentSubscription = null;
      });
  },
});

export const { resetSubscriptionState } = SubscriptionSlice.actions;
export default SubscriptionSlice.reducer;