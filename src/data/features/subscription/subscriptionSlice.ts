import { createSlice } from "@reduxjs/toolkit";
// import { createSubscription} from "./subscriptionThunks";
import { SubscriptionState } from "./subscription.types";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { addPlan, fetchPlans } from "./subscriptionThunks";

const initialState: SubscriptionState = {
  loading: false,
  error: null,
  message: null,
  plans:[],
  
 
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

         .addCase(fetchPlans.pending, (state) => {
              state.loading = true;
              state.error = null;
              state.message = null;
            })
            .addCase(fetchPlans.fulfilled, (state, action) => {
              state.loading = false;
              // FIX: Correctly access the articles array from the 'data' property
              const payload: any = action.payload as any; 
              state.plans = payload.data || [];
            })
            .addCase(fetchPlans.rejected, (state, action) => {
              state.loading = false;
              state.error = action.payload as string;
            });
  },
});

export const { resetSubscriptionState } = SubscriptionSlice.actions;
export default SubscriptionSlice.reducer;