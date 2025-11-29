"use client";

import Image from "next/image";
import logo from "../../../../public/LightGray.png";
import { FcGoogle } from "react-icons/fc";
// Added FaEye and FaEyeSlash imports
import { FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLoginActions } from "@/data/features/auth/useAuthActions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
// We don't strictly need CustomInput for password if we want the eye icon inside the input easily
// unless CustomInput supports an 'endIcon' prop. I will implement it with raw input for control.
import CustomInput from "@/components/ui/CustomInput";

export default function LoginPage() {
  const {
    formData,
    handleChange,
    handleLogin,
    handleGoogleLogin,
    loading,
    error,
    message,
  } = useLoginActions();

  // 1. New State for UI toggles
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 2. Handle Toast Messages
  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  // 3. Check Local Storage on Component Mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setRememberMe(true);

      handleChange({ target: { name: "email", value: savedEmail } } as React.ChangeEvent<HTMLInputElement>);
    }
  }, []); // Runs once on mount

  // 4. Handle Form Submission with Remember Me logic
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    handleLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md p-6 sm:p-8">
        <div className="flex justify-center mb-6 ">
          <Image src={logo} alt="Logo" width={220} height={220} className="invert" />
          <Image src={logo} alt="Logo" width={220} height={220} className="invert" />
        </div>

        <h2 className="text-2xl font-bold text-center mb-2">Welcome Back!</h2>
        <p className="text-center text-gray-600 mb-6">
          Login to get your daily dose of hot premium legal updates
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-600"
            />
          </div>

          {/* Password Field with Eye Icon */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex justify-between text-sm text-gray-600">
            <label className="flex items-center space-x-2 cursor-pointer">
              {/* <input 
                type="checkbox" 
                className="h-4 w-4" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span> */}
            </label>
            <button
              type="button"
              className="text-gray-800 hover:underline"
            >

              <a href="/auth/forgot-password" className="text-gray-800 hover:underline">Forgot Password?</a>
            </button>

            <Link href="/auth/forgot-password" className="text-gray-800 hover:underline">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full border border-gray-300 rounded-md py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition"
          >
            <FcGoogle size={22} />
            <span>Continue with Google</span>
          </button>
        </div>

        <div className="text-center text-sm text-gray-600 mt-8">
          <p>
            Don’t have an account?{" "}
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}