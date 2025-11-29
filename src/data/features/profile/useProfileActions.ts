"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchProfile, updateProfile } from "./profileThunks";
import { UpdateProfileRequest } from "./profile.types";
import { RootState } from "@/data/redux/store";
import toast from "react-hot-toast";

const selectProfileState = (state: RootState) => state.profile;

export const useProfileActions = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, message } = useAppSelector(selectProfileState);

  // Fetch profile on component mount if token exists
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
     
      if (!user) {
        dispatch(fetchProfile());
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
    // if (message) {
    //   toast.success(message);
    // }
  }, [error, message]);

  const handleUpdateProfile = (formData: UpdateProfileRequest) => {
    if (!user) {
        toast.error("Cannot update profile: User data missing.");
        return;
    }
    
    dispatch(updateProfile(formData));
  };

  return {
    user,
    loading,
    error,
    message,
    fetchProfile: () => dispatch(fetchProfile()),
    updateProfile: handleUpdateProfile,
  };
};