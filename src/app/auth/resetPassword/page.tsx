"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import Image from "next/image";
import logo from "../../../../public/logo.svg";
import { useResetPasswordAction} from "@/data/features/auth/useAuthActions";
import toast from "react-hot-toast";


export default function ResetPasswordPage() {
const router = useRouter();
const {formData,handleChange,handleResetPassword,loading,error,message}=useResetPasswordAction();

const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const verified = sessionStorage.getItem("otpVerified");

      if (verified === "verified_2138") {
        setIsVerified(true);
      
      } else {
        router.replace("/auth/forgotPassword");
      }
    }
  }, [router]);

  useEffect(() => {
  if (isVerified) {
    console.log("Now removing otpVerified flag");
    sessionStorage.removeItem("otpVerified");
  }
}, [isVerified]);

useEffect(() => {
      if (error) toast.error(error);
      if (message) toast.success(message);
  }, [error, message]);

 const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleResetPassword();
  };


if (!isVerified) return null;


  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row bg-white">
        <div className="w-full lg:w-1/2 bg-[#ffffff] border px-6 sm:px-10 py-10">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Reset Password
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 sm:px-14">
            
            <label className="block text-sm mb-2 font-medium">Email</label>
            <input
              name="email"
              type="email"
              placeholder="example@example.com"
              value={formData.email}
              onChange={handleChange}
              readOnly
              className="w-full mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            
            <label className="block text-sm mb-2 font-medium">New Password</label>
            <input
              name="newPassword"
              type="password"
              placeholder="Enter new Password"
              value={formData.newPassword}
              onChange={handleChange}
              required
              className="w-full mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            
            <input
              name="otp"
              type="hidden"
              value={formData.otp}
              onChange={handleChange}
              readOnly
              required
            />

            
            <label className="block text-sm mb-2 font-medium">
              Confirm Password
            </label>
            <input
              name="conformPassword"
              type="password"
              placeholder="Re-enter new Password"
              value={formData.conformPassword}
              onChange={handleChange}
              required
              className="w-full mb-4 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Processing.." : "Save"}
            </button>
          </form>
        </div>

        
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