export interface PlanFeature {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface Plans {
  id: string;
  name: string;
  description?: string | null;
  features: PlanFeature[];
  price: string;
  currency?: string;
  discount?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
export interface AddPlanRequest {
  name: string;
  price: number | string;
  discount: number | string;
  features: string[];
}
export interface AddPlanResponse {
  success: string;
  message: string;
}
export interface PlanGetResponse {
  success: string;
  message: string;
  data: Plans[];
}

// Subscription Order Types
export interface CreateOrderRequest {
  planId: string;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  data?: any;
}

// User Subscription Types
export interface UserSubscription {
  id: string;
  userId: string;
  planId: string;
  planName?: string;
  status: "active" | "inactive" | "expired";
  startDate: string;
  endDate: string;
  autoRenew?: boolean;
}

export interface UserSubscriptionResponse {
  success: boolean;
  message: string;
  data: UserSubscription | null;
}

export interface SubscriptionState {
  loading: boolean;
  error: string | null;
  plans: Plans[];
  currentSubscription: UserSubscription | null;
  message: string | null;
}
