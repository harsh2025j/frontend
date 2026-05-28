// src/hooks/useAuthActions.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { LoginRequest, RegisterRequest, ResendOtpRequest, ResetPasswordRequest, VerifyOtpRequest } from "./auth.types";
import { forgotPassword, loginUser, registerUser, ResendOtp, resetPassword, verifyOtp, loginWithGoogle } from "./authThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { resetAuthState, logoutUser } from "./authSlice";

import { RootState } from "@/data/redux/store";
import toast from "react-hot-toast";
import { requestFcmToken } from "@/lib/fcmUtils";

const selectAuthLoading = (state: RootState) => state.auth.loading;
const selectAuthError = (state: RootState) => state.auth.error;
const selectAuthUser = (state: RootState) => state.auth.user;
const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
const selectIsToken = (state: RootState) => state.auth.token;
const selectAuthMessage = (state: RootState) => state.auth.message;
const selectDebugOtp = (state: RootState) => state.auth.debugOtp;

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const message = useAppSelector(selectAuthMessage);
  const token = useAppSelector(selectIsToken);
  const debugOtp = useAppSelector(selectDebugOtp);

  const logout = () => {
    dispatch(logoutUser());
    window.location.href = '/'; // Force full page reload

  };

  return { user, isAuthenticated, loading, error, logout, message, token, debugOtp };
};

export const useRegisterActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, message, debugOtp, token } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const fcmToken = await requestFcmToken();

    const payload: RegisterRequest = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone,
      fcmToken: fcmToken || undefined,
      platform: "web",
    };

    dispatch(registerUser(payload));
  };

  const handleGoogleLogin = () => {
    dispatch(loginWithGoogle());
  };

  useEffect(() => {
    if (message === MESSAGES.REGISTER_SUCCESS) {
      if (debugOtp) {
        toast.success(`${MESSAGES.REGISTER_SUCCESS} (OTP: ${debugOtp})`);
      }
      localStorage.setItem("email", formData.email)
      router.push("/auth/verify");
      dispatch(resetAuthState());
    }
  }, [message, debugOtp]);

  // Redirect if token exists (e.g. from Google Login)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/");
      dispatch(resetAuthState());
    }
  }, [token]);

  return {
    formData,
    setFormData,
    handleChange,
    handleRegister,
    loading,
    error,
    message,
    debugOtp,
    handleGoogleLogin,
  };
};

export const useLoginActions = () => {
  const dispatch = useAppDispatch();
  const { loading, error, token, message, user } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    const fcmToken = await requestFcmToken();

    dispatch(loginUser({
      ...formData,
      email: formData.email.trim(),
      fcmToken: fcmToken || undefined,
      platform: "web",
    }));
  };

  const handleGoogleLogin = () => {
    dispatch(loginWithGoogle());
  };



  useEffect(() => {
    // Check if we have a token and user in the state (successful login)
    if (token && user) {
      localStorage.setItem("email", formData.email);
      // Ensure localStorage is set if not already (redundant safety)
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);

      if (redirect) {
        router.push(redirect);
      } else {
        const roles = user.roles?.map((r) => r.name) || [];
        if (roles.includes("admin") || roles.includes("superadmin") || roles.includes("advocate")) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }
    }

    if (message === "Google Login Successful" || message === MESSAGES.LOGIN_SUCCESS) {
      dispatch(resetAuthState());
    }

  }, [token, user, message, redirect, router, dispatch, formData.email]);

  return {
    formData,
    handleChange,
    handleLogin,
    handleGoogleLogin,

    loading,
    error,
    message,
  };
};

export const useVerifyActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Use local loading state to avoid conflicts with Resend OTP
  const { error, message } = useAppSelector((state) => state.auth);
  const [localLoading, setLocalLoading] = useState(false);

  const [formData, setFormData] = useState<VerifyOtpRequest>({
    email: "",
    otp: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("email") || "";
      // console.log(storedEmail);
      setFormData((prev) => ({
        ...prev,
        email: storedEmail,
      }));
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerify = async () => {
    if (!formData.email || !formData.otp) {
      toast.error("Please enter both email and OTP");
      return;
    }

    setLocalLoading(true);
    try {
      // We use .unwrap() to ensure we wait for the thunk to finish
      await dispatch(verifyOtp(formData)).unwrap();
    } catch (err) {
      console.error("Verification failed", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (message === MESSAGES.VERIFY_SUCCESS) {
      router.push("/");
      dispatch(resetAuthState());
    }
  }, [message]);

  return {
    formData,
    handleChange,
    handleVerify,
    loading: localLoading, // Expose local loading state
    error,
    message,
  };
};

export const useResendOtp = () => {
  const dispatch = useAppDispatch();
  const { error, message } = useAppSelector((state) => state.auth);

  // Use local loading state for independent tracking
  const [localLoading, setLocalLoading] = useState(false);

  const [email, setEmail] = useState<ResendOtpRequest>({
    email: "",
  });

  useEffect(() => {
    const loadEmail = () => {
      const newEmail = localStorage.getItem("email") || "";
      setEmail({ email: newEmail });
    };

    loadEmail();

    window.addEventListener("storage", loadEmail);
    return () => {
      window.removeEventListener("storage", loadEmail);
    };
  }, []);

  const handleReSendOtp = async () => {
    //  always get the latest email value directly
    const currentEmail = localStorage.getItem("email") || email.email;
    if (!currentEmail) {
      console.warn("Email not found in localStorage");
      return;
    }

    setLocalLoading(true);
    try {
      await dispatch(ResendOtp({ email: currentEmail })).unwrap();
    } catch (err) {
      console.error("Resend OTP failed", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (message === MESSAGES.RESENDOTP_SUCCESS) {
      dispatch(resetAuthState());
    }
  }, [message, dispatch]);

  return {
    error,
    loading: localLoading, // Expose local loading state
    message,
    handleReSendOtp,
  };
};