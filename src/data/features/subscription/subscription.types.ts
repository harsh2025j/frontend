export interface Plans{
  id:string;
  name:string;
  features: string[];
  price:number;
  discount:number;
  status: "active" | "inactive";
}
export interface AddPlanRequest {
  name: string;
  price: number | string;
  discount:number | string;
  // currency: string;
  features: string[];
}
export interface AddPlanResponse {
  success:string;
  message:string;
}
export interface PlanGetResponse{
  success:string;
  message:string;
  data: Plans[];
}



export interface SubscriptionState {
  loading: boolean;
  error: string | null;
  plans:Plans[];
  //status: "active" |"inactive";
//   startDate: string | null;
//   endDate: string | null;
//   autoRenew: boolean;
//   price: number | null;
//   currency: string | null;
  message: string | null;
}
