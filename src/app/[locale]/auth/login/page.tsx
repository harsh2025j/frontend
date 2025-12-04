"use client";

import Image from "next/image";
import logo from "../../../../../public/LightGray.png";
import award1 from "../../../../public/awards/award1.jpg";
import award2 from "../../../../public/awards/award2.jpg";
import award3 from "../../../../public/awards/award3.jpg";
import award4 from "../../../../public/awards/award4.jpg";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaEye, FaEyeSlash, FaCheckCircle } from "react-icons/fa";
import { useLoginActions } from "@/data/features/auth/useAuthActions";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";

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
    <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row bg-white">
        {/* Left Panel - Login Form */}
        <div className="w-full lg:w-1/2 bg-[#ffffff] border px-6 sm:px-10 py-10">
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome Back!</h2>
          <p className="text-center text-gray-600 mb-6">
            Login to get your daily dose of hot premium legal updates
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 px-6 sm:px-14">
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
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
                  className="w-full border border-gray-300 rounded-md px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
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

          <div className="mt-6 space-y-3 px-6 sm:px-14">
            <div className="flex justify-center items-center">
              <span className="inline-block w-48 border border-gray-400"></span>
              <span className="mx-1 text-xl">OR</span>
              <span className="inline-block w-48 border border-gray-400"></span>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full border border-gray-300 rounded-md py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition"
            >
              <FcGoogle size={22} />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="text-left text-xs text-gray-500 mt-10 px-6 sm:px-14">
            Don’t have an account?
            <Link href="/auth/signup" className="hover:underline text-blue-400 ml-1">
              Register
            </Link>
          </div>
        </div>

        {/* Right Panel - Branding */}
        <div className="w-full lg:w-1/2 bg-[#0A2342] flex flex-col justify-center px-6 py-10">
          <div className="flex justify-center mb-6">
            <Image
              src={logo}
              alt="Logo"
              width={300}
              height={300}
              className="w-full h-48 object-contain sm:w-full sm:h-60"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-white text-center mb-8">
            Sajjad Law Associates
          </h1>

          <h2 className="text-2xl font-semibold text-white text-center mb-8">
            India’s no.1 legal news portal
          </h2>

          <div className="space-y-4 px-4 sm:px-10 lg:px-12">
            {[
              "Ad free content",
              "Unlimited access to our archives, orders and judgement copies, etc.",
              "Free copies of judgments with download facility",
              "Access to weekly and monthly digests",
              "Special coverage on Tax, IBC, Arbitration",
              "Exclusive notifications on phone and via email. Weekly judgement text/ video roundups",
              "In-depth articles on current legal and constitutional issues"
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-3">
                <FaCheckCircle className="text-[#C9A227] mt-1 flex-shrink-0" size={18} />
                <span className="text-white text-sm sm:text-base leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}