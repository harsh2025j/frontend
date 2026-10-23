"use client";

import { Suspense, useEffect, useState } from "react";
import RouteFallback from "@/components/ui/RouteFallback";
import Image from "next/image";
import award1 from "../../../../../public/awards/award1.jpg";
import award2 from "../../../../../public/awards/award2.jpg";
import award3 from "../../../../../public/awards/award3.jpg";
import award4 from "../../../../../public/awards/award4.jpg";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Mail, Lock, User, Phone, ArrowLeft } from "lucide-react";
import { useRegisterActions } from "@/data/features/auth/useAuthActions";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/routing";
import { useDocTitle } from "@/hooks/useDocTitle";

function RegisterPageContent() {
  useDocTitle("Register | Sajjad Husain Law Associates");
  const router = useRouter();
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

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) {
      const suffix = debugOtp ? ` (OTP: ${debugOtp})` : "";
      toast.success(`${message}${suffix}`);
    }
  }, [error, message, debugOtp]);

  const handleGoBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <div className="h-dvh max-h-dvh w-full flex flex-col lg:flex-row bg-white selection:bg-[#C5A059]/20 selection:text-[#0B203E] overflow-hidden">
      {/* 
        ========================================================================
        LEFT PANEL - REGISTRATION FORM:
        - Mobile & Tablet (< lg): Centered form, fits strictly in 100dvh without scroll
        - Desktop (lg: 1024px+): 50% width, fits neatly inside 100vh
        ========================================================================
      */}
      <div className="w-full lg:w-1/2 h-full flex flex-col justify-center items-center px-5 sm:px-8 md:px-12 lg:px-12 xl:px-16 py-4 sm:py-6 md:py-8 lg:py-4 relative bg-white overflow-y-auto overflow-x-hidden">
        {/* Subtle decorative ivory flourish in bottom-left background safely contained */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
          <svg
            className="absolute -bottom-8 -left-8 w-56 h-56 sm:w-72 sm:h-72 opacity-40"
            viewBox="0 0 300 300"
            fill="none"
          >
            <path d="M 0,300 C 50,220 120,220 220,300 Z" fill="#F7F1DF" />
            <path d="M 0,300 C 80,180 180,190 300,300 Z" fill="#FAF5EB" opacity="0.7" />
          </svg>
        </div>

        <div className="w-full max-w-[420px] sm:max-w-[440px] md:max-w-[460px] lg:max-w-[420px] mx-auto relative z-10 py-1">
          {/* Subtle Top Navigation Row */}
          <div className="w-full flex items-center justify-between mb-3 md:mb-4 lg:mb-2.5">
            <button
              type="button"
              onClick={handleGoBack}
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#0B203E] font-medium transition-colors group cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 text-gray-400 group-hover:text-[#0B203E]" />
              <span>Back to home</span>
            </button>
           
          </div>

          {/* Heading & Subtitle */}
          <div className="mb-3 sm:mb-4 lg:mb-3">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B203E] tracking-tight mb-0.5 md:mb-1">
              Create Account
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
              Sign up to get your daily dose of hot premium legal updates
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRegister();
            }}
            className="space-y-2.5 md:space-y-3 lg:space-y-2"
          >
            {/* Full Name Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1C2A39] mb-1 font-sans">
                Full Name
              </label>
              <div className="relative rounded-xl border border-gray-300 hover:border-gray-400 bg-white focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/15 transition-all shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                </div>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2 md:py-2.5 lg:py-2 text-base sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1C2A39] mb-1 font-sans">
                Phone Number
              </label>
              <div className="relative rounded-xl border border-gray-300 hover:border-gray-400 bg-white focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/15 transition-all shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Phone className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2 md:py-2.5 lg:py-2 text-base sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1C2A39] mb-1 font-sans">
                Email Address
              </label>
              <div className="relative rounded-xl border border-gray-300 hover:border-gray-400 bg-white focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/15 transition-all shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-3.5 py-2 md:py-2.5 lg:py-2 text-base sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1C2A39] mb-1 font-sans">
                Password
              </label>
              <div className="relative rounded-xl border border-gray-300 hover:border-gray-400 bg-white focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/15 transition-all shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2 md:py-2.5 lg:py-2 text-base sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button - Hero Gold Button with Crisp Navy Text */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 md:py-3 lg:py-2.5 px-6 rounded-full font-bold text-sm sm:text-base text-[#0B203E] bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C59B27] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Signing Up..." : "Sign Up"}</span>
              </button>
            </div>
          </form>

          {/* OR Divider */}
          <div className="relative my-2.5 sm:my-3 lg:my-2 flex items-center justify-center">
            <div className="w-full border-t border-gray-200"></div>
            <span className="absolute bg-white px-2.5 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
              OR
            </span>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-2 md:py-2.5 lg:py-2 px-4 border border-gray-300 hover:border-gray-400 rounded-xl flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50/80 shadow-2xs transition-all text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            <FcGoogle size={18} />
            <span>Continue with Google</span>
          </button>

          {/* Login Link */}
          <div className="text-xs sm:text-sm text-gray-600 mt-2.5 sm:mt-3 lg:mt-2 text-center sm:text-left">
            Already have an account?
            <Link
              href="/auth/login"
              className="text-[#B5882D] hover:text-[#C99414] font-bold hover:underline ml-1"
            >
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        RIGHT PANEL - BRANDING:
        - Mobile & Tablet: hidden (only form shows in mobile and tab mode)
        - Desktop: lg:flex, lg:w-1/2, lg:h-full with Supreme Court night backdrop
        ========================================================================
      */}
      <div className="hidden lg:flex lg:w-1/2 min-h-0 lg:h-full bg-[#081A32] flex-col justify-center px-6 sm:px-8 md:px-8 lg:px-12 py-10 lg:py-8 relative overflow-hidden">
        {/* Left Dividing Golden Arc (Desktop only) */}
        <svg
          className="hidden lg:block absolute left-0 top-0 h-full w-6 pointer-events-none z-20"
          viewBox="0 0 24 1000"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 2,0 Q 18,500 2,1000"
            stroke="#C5A059"
            strokeWidth="2"
            opacity="0.9"
          />
        </svg>

        {/* Top-Right Corner Sweeping Gold Arc */}
        <div className="absolute top-0 right-0 w-44 sm:w-60 h-44 sm:h-60 pointer-events-none overflow-hidden z-10">
          <svg className="w-full h-full" viewBox="0 0 200 200" fill="none">
            <path
              d="M 60,0 Q 140,40 200,140 L 200,0 Z"
              fill="#051224"
              opacity="0.7"
            />
            <path
              d="M 60,0 Q 140,40 200,140"
              stroke="#C5A059"
              strokeWidth="2"
              opacity="0.95"
            />
          </svg>
        </div>

        {/* Bottom-Right Supreme Court Architecture Image - Small with Blue Fade */}
        <div className="absolute bottom-0 right-0 w-[75%] sm:w-[60%] md:w-[65%] lg:w-[50%] max-w-[420px] h-[220px] sm:h-[260px] md:h-[320px] lg:h-[280px] pointer-events-none select-none z-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/login-court-bg.jpg"
              alt="Supreme Court Architecture"
              fill
              sizes="(max-width: 1200px) 50vw, 30vw"
              className="object-cover object-bottom-right opacity-85"
              style={{
                maskImage:
                  "linear-gradient(to top left, black 25%, rgba(0,0,0,0.6) 55%, transparent 85%)",
                WebkitMaskImage:
                  "linear-gradient(to top left, black 25%, rgba(0,0,0,0.6) 55%, transparent 85%)",
              }}
              priority
            />
          </div>
          {/* Deep blue fade overlays */}
          <div className="absolute inset-0 bg-[#081A32]/40 mix-blend-multiply pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#081A32]/60 via-[#081A32]/35 to-[#081A32] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#081A32] via-[#081A32]/60 to-transparent pointer-events-none"></div>
        </div>

        {/* Content Section */}
        <div className="relative z-10 max-w-lg mx-auto w-full text-center pb-6 md:pb-0">
          {/* Golden Supreme Court Logo Emblem */}
          <div className="flex justify-center mb-4 md:mb-5 lg:mb-3">
            <Image
              src="/login-logo-gold.png"
              alt="Sajjad Husain Law Associates"
              width={320}
              height={140}
              className="w-56 sm:w-68 md:w-72 lg:w-64 xl:w-76 h-auto object-contain mx-auto filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
              priority
            />
          </div>

          <h3 className="text-xl sm:text-2xl md:text-2xl lg:text-xl text-white text-center mb-2 md:mb-3 lg:mb-2 font-serif font-medium tracking-wide">
            Stay informed. Stay ahead.
          </h3>
          <p className="text-xs sm:text-sm md:text-sm lg:text-xs text-gray-200 text-center px-4 sm:px-6 lg:px-6 leading-relaxed mb-4 md:mb-6 lg:mb-3">
            Welcome to India&apos;s most trusted legal news platform — your one-stop
            destination for the latest court updates, case analyses, and expert
            legal insights. Whether you&apos;re a lawyer, law student, or simply curious
            about the legal world, our platform delivers authentic, timely, and
            premium news right at your fingertips.
          </p>

          {/* Awards or Certifications Section */}
          <div className="mt-3 md:mt-5 lg:mt-3">
            <p className="text-xs sm:text-sm md:text-base lg:text-xs text-center text-[#E5C278] mb-1.5 md:mb-2 font-medium tracking-wider uppercase">
              Awards or Certifications
            </p>
            <div className="border-b border-[#C5A059]/40 mx-auto w-32 sm:w-40 mb-3 md:mb-4" />
            <div className="flex flex-wrap gap-2.5 sm:gap-3 md:gap-3.5 justify-center">
              {[award1, award2, award3, award4].map((award, i) => (
                <div
                  key={i}
                  className="h-16 w-16 sm:h-18 sm:w-18 md:h-20 md:w-20 lg:h-16 lg:w-16 relative bg-white/10 rounded-xl p-1.5 border border-[#C5A059]/30 shadow-md backdrop-blur-xs hover:border-[#C5A059] transition-all"
                >
                  <Image
                    src={award}
                    alt={`Award ${i + 1}`}
                    fill
                    className="object-contain p-1"
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

export default function RegisterPage(props: any) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <RegisterPageContent {...props} />
    </Suspense>
  );
}
