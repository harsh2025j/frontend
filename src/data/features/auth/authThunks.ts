import { createAsyncThunk } from "@reduxjs/toolkit";
import {  forgotPasswordRequest, ForgotPasswordResponse, LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  VerifyOtpRequest,
  VerifyOtpResponse, } from "./auth.types";
import { authApi } from "@/data/services/auth-service/auth-service";
import { MESSAGES } from "@/lib/constants/messageConstants";


export const loginUser = createAsyncThunk<LoginResponse, LoginRequest>(
  "auth/loginUser",
  async (formData, thunkAPI) => {
    try {
      console.log("login....")
      const res = await authApi.login(formData);
      console.log(res.data);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || MESSAGES.LOGIN_FAIL
      );
    }
  }
);

export const registerUser = createAsyncThunk<RegisterResponse, RegisterRequest>(
  "auth/registerUser",
  async (formData, thunkAPI) => {
    try {
      console.log("register")
      const res = await authApi.register(formData);
      console.log("slfjsdkjflsdfj");
      console.log(res);
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || MESSAGES.REGISTER_FAIL
      );
    }
  }
);

export const verifyOtp = createAsyncThunk<VerifyOtpResponse, VerifyOtpRequest>(
  "auth/verifyOtp",
  async (formData, thunkAPI) => {
    try {
      console.log("verify otp"); 
      console.log(formData)
      const res = await authApi.verifyOtp(formData);
      console.log("sldfjsdjkfk")
      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || MESSAGES.VERIFY_FAIL
      );
    }
  }
);

export const forgotPassword = createAsyncThunk<ForgotPasswordResponse,forgotPasswordRequest>(
  "auth/forgotPassword",
  async(data,thunkAPI)=>{
    try{
      console.log("otp generating")
      console.log(data)
      const res = await authApi.forgotPassword(data);
      return res.data;
    }catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || MESSAGES.FORGOT_FAIL);
    }

  }
)

export const resetPassword = createAsyncThunk<ResetPasswordResponse,ResetPasswordRequest>(
  "auth/resetPassword",
  async(formData,thunkAPI)=>{
    try{
      const {conformPassword , ...newData}=formData
      const res = await authApi.resetPassword(newData);
      // const res = await authApi.resetPassword(formData);
      return res.data;
    }catch (err: any) {
      return thunkAPI.rejectWithValue(err.response?.data?.message || MESSAGES.RESET_FAIL);
    }

  }
)

