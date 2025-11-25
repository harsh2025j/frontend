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

  // Fetch profile on component mount
  useEffect(() => {
    // Only attempt to fetch if authenticated (token exists)
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  // Display toast messages for success/error
  useEffect(() => {
    if (error) {
      toast.error(error);
      // In a real app, you might dispatch an action to clear the error state here
    }
    if (message) {
    //   toast.success(message);
      // In a real app, you might dispatch an action to clear the message state here
    }
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