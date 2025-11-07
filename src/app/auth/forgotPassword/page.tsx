"use client";

import Image from "next/image";
import logo from "../../../../public/logo.svg";
import CustomInput from "@/components/ui/CustomInput";
import { useForgotPasswordAction, useResetPasswordAction, useVerifyForgotActions } from "@/data/features/auth/useAuthActions";
import { FormEvent, useEffect } from "react";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const { email, otpSent, handleChange, handleForgotPassword ,loading, error,message,} = useForgotPasswordAction();
  const { formData, handleChange: handleOtpChange, handleVerify} = useVerifyForgotActions(email);
  useEffect(() => {
      if (error) toast.error(error);
      if (message) toast.success(message);
  }, [error, message]);

  // const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   if (!otpSent) {
  //     handleGenOtp();
  //   } else {
  //     handleVerify();
  //   }
  // };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row bg-white">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 bg-[#ffffff] border px-6 sm:px-10 py-10">
      <div className="bg-white shadow-lg p-8 rounded-xl w-[400px]">
        <h2 className="text-xl font-semibold text-center mb-6">
          Forgot Password
        </h2>

        {!otpSent ? (
          <>
            <label className="block text-sm mb-2 font-medium ">Email </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="w-full  mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
              required
            />
            
            <button
              onClick={handleForgotPassword}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? "Sending..." : "Send Otp"}
            </button>
          </>
        ) : (
          <>
          
           <label className="block text-sm mb-2 font-medium ">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              required
              className="w-full  mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />


            <label className="block text-sm mb-2 font-medium ">OTP</label>
            <input
              type="text"
              name="otp"
              required
              value={formData.otp}
              onChange={handleOtpChange}
              className="w-full  mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter OTP"
            />

            <button
              onClick={handleVerify}
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </>
        )}
      </div>
    </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 bg-[#0A2342] flex flex-col justify-center px-6 py-10">
          <div className="flex justify-center mb-6">
            <Image
              src={logo}
              alt="Logo"
              width={300}
              height={300}
              className="rounded-full w-48 h-48 object-contain sm:w-60 sm:h-60 bg-white"
              priority
            />
          </div>

          <h3 className="text-xl text-white text-center mb-4">Almost there!</h3>
          <p className="text-sm text-white text-center px-4 sm:px-10 lg:px-24">
            You’re one step away from accessing premium legal updates and insights.
            Reset your password.
          </p>
        </div>
      </div>
    </div>
  );
}
