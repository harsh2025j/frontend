"use client"
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AddPlanRequest } from "./subscription.types";
import toast from "react-hot-toast";
import { addPlan, fetchPlans } from "./subscriptionThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";


const selectSubscriptionLoading = (state: any) => state.subscription.loading;
const selectSubscriptionError = (state: any) => state.subscription.error;
const selectSubscriptionMessage = (state: any) => state.subscription.message;
const selectSubscriptionPlans = (state: any) => state.subscription.plans;

const useSubscription = () => {
  const loading = useAppSelector(selectSubscriptionLoading);
  const error = useAppSelector(selectSubscriptionError );
  const message = useAppSelector(selectSubscriptionMessage);
  const plans=useAppSelector(selectSubscriptionPlans)
  return { plans,loading, error,message};
};

export const useCreatePlanActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, message} = useSubscription();

  const [formData, setFormData] = useState<AddPlanRequest>({
    name: "",
    price:"",
    discount: "",
    features: [] as string[],
});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle feature checkbox toggle
  const toggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists
          ? prev.features.filter((f) => f !== feature) // remove like cart
          : [...prev.features, feature], // add like cart
      };
    });
  };

  const handleAddPlan = () => {
    if (!formData.name || !formData.price || !formData.discount) {
      toast.error("Please fill in all required fields");
      return;
    }
    // console.log(formData)
    dispatch(addPlan(formData));
  };

  useEffect(() => {
    if (message === MESSAGES.SUBSCRIPTION_ADDING_SUCCESS) {
        setFormData({
             name: "",
    price:"",
    discount: "",
    features: [] as string[],
        })
      toast.success(message);
      router.push("/admin/plans"); 
    }else{
        
    }
   

  }, [message]);
  
  return {
    formData,
    setFormData,
    handleChange,
    loading,
    error,
    message,
    toggleFeature,
    handleAddPlan
  };
};


export const useSubscriptionListActions = () => {
  const dispatch = useAppDispatch();

  const {plans,loading,error,message} = useSubscription();
  
  useEffect(() => {
    // console.log("data fetching ");
    dispatch(fetchPlans());
    
  },[dispatch]);

  useEffect(() => {
    console.log("Fetched Articles (useArticleListActions hook):", plans?.[0]?.id);
  }, [plans]);

  return {
    plans,
    loading,
    error,
  };
};