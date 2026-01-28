"use client";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchProfile, updateProfile } from "./profileThunks";
import { UpdateProfileRequest } from "./profile.types";
import { RootState } from "@/data/redux/store";
import toast from "react-hot-toast";

import { resetProfileState, setUser } from "./profileSlice";
import { UserData } from "./profile.types";

import { useRef, useMemo } from "react";
const selectProfileState = (state: RootState) => state.profile;

export const useProfileActions = () => {
  const dispatch = useAppDispatch();
  const { user, loading, error, message } = useAppSelector(selectProfileState);

  const fetchAttempted = useRef(false);

  // Fetch profile on component mount if token exists
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const storedUserStr = localStorage.getItem('user');

      if (token && !user && !loading && !fetchAttempted.current) {
        fetchAttempted.current = true;
        // Try to load from localStorage first (fast)
        if (storedUserStr) {
          try {
            const storedUser = JSON.parse(storedUserStr);
            // ... mapping logic remains the same ...
            let userData: UserData;

            if (storedUser.id && !storedUser._id) {
              userData = {
                _id: storedUser.id,
                name: storedUser.name,
                email: storedUser.email,
                profilePicture: storedUser.avatar || "",
                roles: [{
                  _id: "google-role",
                  name: "user",
                  slug: "user",
                  isDeleted: false,
                  description: "Google User",
                  isActive: true,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }],
                isActive: true,
                isVerified: true,
                preferredLanguage: "english-ind",
                permissions: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                __v: 0,
                phone: "",
                dob: "",
              };
            } else {
              userData = storedUser as UserData;
            }

            dispatch(setUser(userData));
          } catch (e) {
            console.error("Failed to parse stored user", e);
          }
        }

        // Also fetch fresh data from API
        dispatch(fetchProfile());
      }
    }
  }, [dispatch, user, loading]);

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

  return useMemo(() => ({
    user,
    loading,
    error,
    message,
    fetchProfile: () => dispatch(fetchProfile()),
    updateProfile: handleUpdateProfile,
  }), [user, loading, error, message, dispatch]);
};
