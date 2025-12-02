"use client";
import Image from "next/image";
import logo from "../../../../public/LightGray.png";
import award1 from "../../../../public/awards/award1.jpg";
import award2 from "../../../../public/awards/award2.jpg";
import award3 from "../../../../public/awards/award3.jpg";
import award4 from "../../../../public/awards/award4.jpg";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook, FaEye, FaEyeSlash } from "react-icons/fa";
import CustomInput from "@/components/ui/CustomInput";
import { useRegisterActions } from "@/data/features/auth/useAuthActions";
import { useEffect, useState } from "react";
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
    <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row bg-white">
        {/* Left Panel - Registration Form */}
        <div className="w-full lg:w-1/2 bg-[#ffffff] border px-6 sm:px-10 py-10">
          <h2 className="text-2xl font-semibold text-center mb-4">Welcome!</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-4 px-6 sm:px-14"
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

          <div className="mt-6 space-y-3 px-6 sm:px-14">
            <div className="flex justify-center items-center">
              <span className="inline-block w-48 border border-gray-400"></span>
              <span className="mx-1 text-xl">OR</span>
              <span className="inline-block w-48 border border-gray-400"></span>
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

          <div className="text-left text-xs text-gray-500 mt-10 px-6 sm:px-14">
            Already have an account?
            <Link href="/auth/login" className="hover:underline text-blue-400 ml-1">
              Login
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

          <h3 className="text-xl text-white text-center mb-4">
            Stay informed. Stay ahead.
          </h3>
          <p className="text-sm text-white text-center px-4 sm:px-10 lg:px-24">
            Welcome to India's most trusted legal news platform — your one-stop
            destination for the latest court updates, case analyses, and expert
            legal insights. Whether you're a lawyer, law student, or simply curious
            about the legal world, our platform delivers authentic, timely, and
            premium news right at your fingertips.
          </p>

          {/* Awards Section */}
          <div className="mt-10">
            <p className="text-xl text-center text-white mb-2">
              Awards or Certifications
            </p>
            <div className="border-b-2 border-[#D9D9D9] mx-auto w-4/5 sm:w-2/3" />
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              {[award1, award2, award3, award4].map((award, i) => (
                <div key={i} className="h-24 w-24 relative">
                  <Image
                    src={award}
                    alt={`Award ${i + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}