// Plan Types
export interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
    status?: string;
    discount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePlanRequest {
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
}

export interface UpdatePlanRequest {
    id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    features: string[];
}

export interface PlanState {
    plans: Plan[];
    loading: boolean;
    error: string | null;
    message: string | null;
}
