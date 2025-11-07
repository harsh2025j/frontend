// src/hooks/useAuthActions.ts

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { LoginRequest, RegisterRequest, ResetPasswordRequest, VerifyOtpRequest } from "./auth.types";
import { forgotPassword, loginUser, registerUser, resetPassword, verifyOtp } from "./authThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import { resetAuthState,logoutUser } from "./authSlice";


import { RootState } from "@/data/redux/store";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { log } from "node:console";


 const selectAuthLoading = (state: RootState) => state.auth.loading;
 const selectAuthError = (state: RootState) => state.auth.error;
 const selectAuthUser = (state: RootState) => state.auth.user;
 const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
 const selectIsToken = (state: RootState) => state.auth.token;
 const selectAuthMessage = (state: RootState) => state.auth.message;


const useAuth = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectAuthUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);
  const message = useAppSelector(selectAuthMessage);
  const token = useAppSelector(selectIsToken);
  const logout = () => dispatch(logoutUser());
  return { user, isAuthenticated, loading, error, logout, message, token };
};



export const useRegisterActions = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error, message } = useAuth();

  const [formData, setFormData] = useState<RegisterRequest>({
  name: "",
  email: "",
  password: "",
  number:"",
  state:""
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
      number:formData.number,
      state:formData.state,
    };

    dispatch(registerUser(payload));
  };

  useEffect(() => {
    if (message === MESSAGES.REGISTER_SUCCESS) {
      localStorage.setItem("registeredEmail", formData.email);
      router.push("/auth/verify");
      dispatch(resetAuthState());
    }
  }, [message]);

  return {
    formData,
    setFormData,
    handleChange,
    handleRegister,
    loading,
    error,
    message,
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

    dispatch(loginUser(formData));
  };

 

  useEffect(() => {
    if (token) {
      router.push("/dashboard");
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
      router.push("/dashboard");
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

export const useVerifyForgotActions = (initialEmail = "") => {  
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { loading, error, message } = useAppSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
  });

  useEffect(() => {
    if (initialEmail) {
      setFormData((prev) => ({ ...prev, email: initialEmail }));
    }
  }, [initialEmail]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleVerify = async () => {
    if (!formData.otp) {
      toast.error("Please enter OTP");
      return;
    }

    await dispatch(verifyOtp(formData));
  };

  useEffect(() => {
    if (message === MESSAGES.VERIFY_SUCCESS) {
      // alert("Verification successful");
      localStorage.setItem("otpVerified", "true");
      sessionStorage.setItem("resetEmail", formData.email);
      sessionStorage.setItem("resetOtp", formData.otp);
      router.push(`/auth/resetPassword`);
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


export const useForgotPasswordAction = () => {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const { loading, error, message } = useAppSelector((state) => state.auth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      // alert("OTP sent successfully");
      setOtpSent(true);
    } catch (err) {
      console.error(err);
      // alert("Failed to send OTP");
    }
  };

  return {
    email,
    otpSent,
    handleChange,
    handleForgotPassword,
    loading,
    error,
    message,
  };
};

export const useResetPasswordAction=()=>{
  const dispatch=useAppDispatch();
  const router = useRouter();
  const { loading, error, message } = useAppSelector((state) => state.auth);
  const [formData,setFormData]=useState<ResetPasswordRequest>({
    email: sessionStorage.getItem("resetEmail") || "",
    otp: sessionStorage.getItem("resetOtp") || "",
    newPassword:"",
    conformPassword:""
  })
  

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleResetPassword = async () => {
    console.log(formData.email)
    console.log(formData.newPassword)

    if(formData.newPassword !== formData.conformPassword){
      
      toast.error("Conform password must be same as New Password")
    }
    dispatch(resetPassword(formData));
    
  }

  useEffect(() => {
    if (message === MESSAGES.RESET_SUCCESS) {
      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOtp");
      router.push("/auth/signin");
      dispatch(resetAuthState());
    }
  }, [message]);
  return{
    formData,
    handleChange,
    handleResetPassword,
    loading,
    error,
    message,
  }

}