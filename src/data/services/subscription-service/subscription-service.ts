import { AddPlanRequest, AddPlanResponse, PlanGetResponse, CreateOrderRequest, CreateOrderResponse, UserSubscriptionResponse, VerifyPaymentRequest, VerifyPaymentResponse } from "@/data/features/subscription/subscription.types";
import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export const subscriptionApi = {
  addPlan: async (data: AddPlanRequest) => {
    // console.log(data);
    const response = await apiClient.post<AddPlanResponse>(API_ENDPOINTS.SUBSCRIPTION.CREATE, data);
    // console.log("response :", response);
    return response;
  },

  fetchPlans: async () => {
    // console.log("Fetch Plans Request URL:", ` ${API_ENDPOINTS.SUBSCRIPTION.GET_ALL_PLAN}`);
    const response = await apiClient.get<PlanGetResponse>(

      API_ENDPOINTS.SUBSCRIPTION.GET_ALL_PLAN,
      {
        headers: {
          // "ngrok-skip-browser-warning": "true",
        },
      }

    );
    // console.log("Fetch Articles API Response:", response.data);
    return response;
  },

  createOrder: async (data: CreateOrderRequest) => {
    const response = await apiClient.post<CreateOrderResponse>(
      API_ENDPOINTS.SUBSCRIPTION.CREATE_ORDER,
      data
    );
    return response;
  },

  verifyPayment: async (data: VerifyPaymentRequest) => {
    const response = await apiClient.post<VerifyPaymentResponse>(
      API_ENDPOINTS.SUBSCRIPTION.VERIFY_PAYMENT,
      data
    );
    return response;
  },

  getMySubscription: async () => {
    const response = await apiClient.get<UserSubscriptionResponse>(
      API_ENDPOINTS.SUBSCRIPTION.GET_MY_SUBSCRIPTION
    );
    return response;
  },
}