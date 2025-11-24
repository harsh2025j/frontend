// src/hooks/useAuthActions.ts
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { LoginRequest, RegisterRequest, ResendOtpRequest, ResetPasswordRequest, VerifyOtpRequest } from "./auth.types";
import { forgotPassword, loginUser, registerUser, ResendOtp, resetPassword, verifyOtp } from "./authThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { resetAuthState, logoutUser } from "./authSlice";


import { RootState } from "@/data/redux/store";
import toast from "react-hot-toast";


const selectAuthLoading = (state: RootState) => state.auth.loading;
const selectAuthError = (state: RootState) => state.auth.error;
const selectAuthUser = (state: RootState) => state.auth.user;
const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
const selectIsToken = (state: RootState) => state.auth.token;
const selectAuthMessage = (state: RootState) => state.auth.message;
const selectDebugOtp = (state: RootState) => state.auth.debugOtp;


const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const message = useAppSelector(selectAuthMessage);
  const token = useAppSelector(selectIsToken);
  const debugOtp = useAppSelector(selectDebugOtp);
  const logout = () => dispatch(logoutUser());
  return { user, isAuthenticated, loading, error, logout, message, token, debugOtp };
};



export const useRegisterActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, message, debugOtp } = useAuth();

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

  const handleRegister = () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload: RegisterRequest = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone,
    };

    dispatch(registerUser(payload));
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

  return {
    formData,
    setFormData,
    handleChange,
    handleRegister,
    loading,
    error,
    message,
    debugOtp,
  };
};


export const useLoginActions = () => {
  const dispatch = useAppDispatch();
  const { loading, error, token, message } = useAuth();

  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",

  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = () => {
    if (!formData.email || !formData.password) {
      toast.error("Please enter both email and password");
      return;
    }

    dispatch(loginUser({
      ...formData,
      email: formData.email.trim(),
    }));
  };



  useEffect(() => {
    if (localStorage.getItem("token")) {
      console.log("user logout");
      console.log(token);
      router.push("/");
      localStorage.setItem("email", formData.email);
      dispatch(resetAuthState());
    }
  }, [token]);

  return {
    formData,
    handleChange,
    handleLogin,

    loading,
    error,
    message,
  };
};



export const useVerifyActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error, message } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState<VerifyOtpRequest>({
    email: "",
    otp: "",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedEmail = localStorage.getItem("email") || "";
      console.log(storedEmail);
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


  const handleVerify = () => {
    if (!formData.email || !formData.otp) {
      toast.error("Please enter both email and OTP");
      return;
    }
    dispatch(verifyOtp(formData));
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
    loading,
    error,
    message,
  };
};




// export const useVerifyForgotActions = (initialEmail = "") => {  
//   const dispatch = useAppDispatch();
//   const router = useRouter();

//   const { loading, error, message } = useAppSelector((state) => state.auth);

//   const [formData, setFormData] = useState({
//     email: "",
//     otp: "",
//   });

//   useEffect(() => {
//     if (initialEmail) {
//       setFormData((prev) => ({ ...prev, email: initialEmail }));
//     }
//   }, [initialEmail]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleVerify = async () => {
//     if (!formData.otp) {
//       toast.error("Please enter OTP");
//       return;
//     }

//     await dispatch(verifyOtp(formData));
//   };

//   useEffect(() => {
//     if (message === MESSAGES.VERIFY_SUCCESS) {
//       // alert("Verification successful");
//       sessionStorage.setItem("otpVerified", "verified_2138");
//       sessionStorage.setItem("resetEmail", formData.email);
//       sessionStorage.setItem("resetOtp", formData.otp);
//       router.push("/auth/resetPassword");
//       dispatch(resetAuthState());
//     }
//   }, [message]);

//   return {
//     formData,
//     handleChange,
//     handleVerify,
//     loading,
//     error,
//     message,
//   };
// };


// export const useForgotPasswordAction = () => {
//   const router = useRouter();

//   const dispatch = useAppDispatch();
//   const [email, setEmail] = useState("");
//   const [otpSent, setOtpSent] = useState(false);

//   const { loading, error, message, debugOtp } = useAppSelector((state) => state.auth);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setEmail(e.target.value);
//   };

//   const handleForgotPassword = async () => {
//     if (!email) {
//       toast.error("Please enter email");
//       return;
//     }

//     try {
//       await dispatch(forgotPassword({ email })).unwrap();
//       // alert("OTP sent successfully");
//       setOtpSent(true);
//     } catch (err) {
//       console.error(err);
//       // alert("Failed to send OTP");
//     }
//   };

//   return {
//     email,
//     otpSent,
//     handleChange,
//     handleForgotPassword,
//     loading,
//     error,
//     message,
//     debugOtp,
//   };
// };

// export const useResetPasswordAction=()=>{
//   const dispatch=useAppDispatch();
//   const router = useRouter();
//   const { loading, error, message } = useAppSelector((state) => state.auth);
//   const [formData,setFormData]=useState<ResetPasswordRequest>({
//     email:"",
//     otp:"", 
//     newPassword:"",
//     conformPassword:""
//   })

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       const storedEmail = sessionStorage.getItem("resetEmail") || "";
//       const storedOtp = sessionStorage.getItem("resetOtp") || "";

//       setFormData((prev) => ({
//         ...prev,
//         email: storedEmail,
//         otp: storedOtp,
//       }));
//     }
//   }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleResetPassword = async () => {
//     console.log("Email:", formData.email);
//     console.log("OTP:", formData.otp);

//     if (formData.newPassword !== formData.conformPassword) {
//       toast.error("Confirm password must match the New Password");
//       return;
//     }

//     dispatch(resetPassword(formData));
//   };

//   useEffect(() => {
//     if (message === MESSAGES.RESET_SUCCESS) {
//       if (typeof window !== "undefined") {
//         sessionStorage.removeItem("resetEmail");
//         sessionStorage.removeItem("resetOtp");
//       }
//       router.push("/auth/login");
//       dispatch(resetAuthState());
//     }
//   }, [message, router, dispatch]);

//   return {
//     formData,
//     handleChange,
//     handleResetPassword,
//     loading,
//     error,
//     message,
//   };
// };


export const useResendOtp = () => {
  const dispatch = useAppDispatch();
  const { loading, error, message } = useAppSelector((state) => state.auth);

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

  const handleReSendOtp = () => {
    // ✅ always get the latest email value directly
    const currentEmail = localStorage.getItem("email") || email.email;
    if (!currentEmail) {
      console.warn("Email not found in localStorage");
      return;
    }
    dispatch(ResendOtp({ email: currentEmail }));
  };

  useEffect(() => {
    if (message === MESSAGES.RESENDOTP_SUCCESS) {
      dispatch(resetAuthState());
    }
  }, [message, dispatch]);

  return {
    error,
    loading,
    message,
    handleReSendOtp,
  };
};
