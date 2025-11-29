"use client";
import Image from "next/image";
import logo from "../../../../public/LightGray.png";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa"; // Added Icons
import CustomInput from "@/components/ui/CustomInput";
import { useRegisterActions } from "@/data/features/auth/useAuthActions";
import { useEffect, useState } from "react"; // Added useState
import toast from "react-hot-toast";
import Link from "next/link";

export default function RegisterPage() {
  const {
    formData,
    handleChange,
    handleRegister,
    loading,
    error,
    message,
    debugOtp,
    handleGoogleLogin,
  } = useRegisterActions();

  // State to toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) {
      const suffix = debugOtp ? ` (OTP: ${debugOtp})` : "";
      toast.success(`${message}${suffix}`);
    }
  }, [error, message, debugOtp]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="w-full px-6 sm:px-10 py-10">
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome!</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-4"
          >
            <CustomInput
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <CustomInput
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <CustomInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            {/* Password Field with Eye Icon */}
            <div>
              <label className="font-medium block mb-1">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <FaEyeSlash size={20} />
                  ) : (
                    <FaEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="flex justify-center items-center">
              <span className="w-full border-t border-gray-300"></span>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <span className="w-full border-t border-gray-300"></span>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full border border-gray-300 rounded-md py-3 flex items-center justify-center space-x-3 hover:bg-gray-50 transition"
            >
              <FcGoogle size={22} />
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 mt-6">
            Already have an account?
            <Link
              href="/auth/login"
              className="hover:underline text-blue-400 ml-1"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}