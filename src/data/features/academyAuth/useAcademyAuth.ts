"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { LoginRequest, RegisterRequest } from "@/data/features/auth/auth.types";
import { loginUser, registerUser, loginWithGoogle, verifyOtp } from "@/data/features/auth/authThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { resetAuthState } from "@/data/features/auth/authSlice";
import toast from "react-hot-toast";
import { requestFcmToken } from "@/lib/fcmUtils";
import { useAuth } from "@/data/features/auth/useAuthActions";
import { rolesApi } from "@/data/services/roles-service/roles-service";

export const useAcademyRegisterActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, message, debugOtp, token } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegister = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLocalLoading(true);
    try {
      // 1. Fetch roles and find the 'student' and 'user' role IDs
      const rolesResponse = await rolesApi.fetchRoles();
      const rolesData = rolesResponse.data?.data || rolesResponse.data;

      const studentRole = rolesData?.find((r: any) => r.name.toLowerCase() === 'student' || r.slug === 'student');
      const userRole = rolesData?.find((r: any) => r.name.toLowerCase() === 'user' || r.slug === 'user');

      const roleIds: string[] = [];
      if (userRole) roleIds.push(userRole._id);
      if (studentRole) roleIds.push(studentRole._id);

      if (roleIds.length === 0) {
        console.warn("Neither 'user' nor 'student' roles found in the database. Proceeding without role assignment.");
      }

      // 2. Fetch FCM Token
      const fcmToken = await requestFcmToken();

      // 3. Dispatch Register
      const payload: RegisterRequest = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone,
        roles: roleIds,
        fcmToken: fcmToken || undefined,
        platform: "web",
      };

      await dispatch(registerUser(payload));
    } catch (err) {
      console.error("Failed to fetch roles or register", err);
      toast.error("An error occurred during registration.");
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const rolesResponse = await rolesApi.fetchRoles();
      const rolesData = rolesResponse.data?.data || rolesResponse.data;

      const studentRole = rolesData?.find((r: any) => r.name.toLowerCase() === 'student' || r.slug === 'student');
      const userRole = rolesData?.find((r: any) => r.name.toLowerCase() === 'user' || r.slug === 'user');

      const roleIds: string[] = [];
      if (userRole) roleIds.push(userRole._id);
      if (studentRole) roleIds.push(studentRole._id);

      dispatch(loginWithGoogle({ roleIds }));
    } catch (err) {
      console.error("Failed to fetch roles for Google Login", err);
      dispatch(loginWithGoogle());
    }
  };

  useEffect(() => {
    if (message === MESSAGES.REGISTER_SUCCESS) {
      if (debugOtp) {
        toast.success(`${MESSAGES.REGISTER_SUCCESS} (OTP: ${debugOtp})`);
      }
      localStorage.setItem("email", formData.email);
      // We no longer redirect to /auth/verify here. The component will handle the step change.
    }
  }, [message, debugOtp, dispatch, formData.email, router]);

  const searchParams = useSearchParams();

  // Redirect if token exists (e.g. from Google Login)
  useEffect(() => {
    if (localStorage.getItem("token")) {
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/dashboard"); // Middleware maps this to /academy/dashboard
      }
      dispatch(resetAuthState());
    }
  }, [token, dispatch, router, searchParams]);

  return {
    formData,
    setFormData,
    handleChange,
    handleRegister,
    loading: loading || isLocalLoading,
    error,
    message,
    debugOtp,
    handleGoogleLogin,
  };
};

export const useAcademyLoginActions = () => {
  const dispatch = useAppDispatch();
  const { loading, error, token, message, user } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsLocalLoading(true);
    try {
      const fcmToken = await requestFcmToken();

      await dispatch(loginUser({
        ...formData,
        email: formData.email.trim(),
        fcmToken: fcmToken || undefined,
        platform: "web",
      }));
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const rolesResponse = await rolesApi.fetchRoles();
      const rolesData = rolesResponse.data?.data || rolesResponse.data;

      const studentRole = rolesData?.find((r: any) => r.name.toLowerCase() === 'student' || r.slug === 'student');
      const userRole = rolesData?.find((r: any) => r.name.toLowerCase() === 'user' || r.slug === 'user');

      const roleIds: string[] = [];
      if (userRole) roleIds.push(userRole._id);
      if (studentRole) roleIds.push(studentRole._id);

      dispatch(loginWithGoogle({ roleIds }));
    } catch (err) {
      console.error("Failed to fetch roles for Google Login", err);
      dispatch(loginWithGoogle());
    }
  };

  useEffect(() => {
    // Check if we have a token and user in the state (successful login)
    if (token && user) {
      localStorage.setItem("email", formData.email);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (token) localStorage.setItem("token", token);

      // Explicitly route back to academy dashboard for academy login
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.push(returnUrl);
      } else {
        router.push("/dashboard"); // Middleware handles subdomain rewrite
      }
    }

    if (message === "Google Login Successful" || message === MESSAGES.LOGIN_SUCCESS) {
      dispatch(resetAuthState());
    }
  }, [token, user, message, router, dispatch, formData.email, searchParams]);

  return {
    formData,
    handleChange,
    handleLogin,
    handleGoogleLogin,
    loading: loading || isLocalLoading,
    error,
    message,
  };
};

export const useAcademyVerifyActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error, message } = useAppSelector((state) => state.auth);
  const [localLoading, setLocalLoading] = useState(false);

  const [formData, setFormData] = useState({ email: "", otp: "" });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("email") || "";
      setFormData((prev) => ({ ...prev, email: storedEmail }));
    }
  }, []);

  const handleVerify = async (otpValue: string, emailFromRegister?: string) => {
    const emailToUse = emailFromRegister || formData.email;
    if (!emailToUse || !otpValue) {
      toast.error("Please enter the complete OTP");
      return;
    }

    setLocalLoading(true);
    try {
      await dispatch(verifyOtp({ email: emailToUse, otp: otpValue })).unwrap();
    } catch (err) {
      console.error("Verification failed", err);
    } finally {
      setLocalLoading(false);
    }
  };

  useEffect(() => {
    if (message === MESSAGES.VERIFY_SUCCESS) {
      toast.success("Account successfully verified! Welcome to SA Academy.");
      router.push("/dashboard"); // Middleware handles subdomain rewrite
      dispatch(resetAuthState());
    }
  }, [message, router, dispatch]);

  return {
    handleVerify,
    loading: localLoading,
    error,
    message,
  };
};
