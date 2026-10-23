"use client";

import { Suspense, useEffect, useState } from "react";
import RouteFallback from "@/components/ui/RouteFallback";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Mail, Lock, Check, ArrowLeft } from "lucide-react";
import { useLoginActions } from "@/data/features/auth/useAuthActions";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/routing";
import { useDocTitle } from "@/hooks/useDocTitle";

const features = [
  { bold: "Ad free content", rest: "" },
  { bold: "Unlimited access", rest: "to our archives, orders and judgement copies, etc." },
  { bold: "Free copies of judgments", rest: "with download facility" },
  { bold: "Access to", rest: "weekly and monthly digests" },
  { bold: "Special coverage", rest: "on Tax, IBC, Arbitration" },
  { bold: "Exclusive notifications", rest: "on phone and via email, Weekly judgment text/ video roundups" },
  { bold: "In-depth articles", rest: "on current legal and constitutional issues" },
];

function LoginPageContent() {
  useDocTitle("Login | Sajjad Husain Law Associates");
  const router = useRouter();
  const {
    formData,
    handleChange,
    handleLogin,
    handleGoogleLogin,
    loading,
    error,
    message,
  } = useLoginActions();

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setRememberMe(true);
      handleChange({
        target: { name: "email", value: savedEmail },
      } as React.ChangeEvent<HTMLInputElement>);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", formData.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
    handleLogin();
  };

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
        FORM PANEL:
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
          <div className="w-full flex items-center justify-between mb-4 md:mb-5 lg:mb-3">
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
          <div className="mb-4 sm:mb-5 lg:mb-4">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B203E] tracking-tight mb-1">
              Welcome Back!
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-sans leading-relaxed">
              Sign in to access your dashboard and premium legal updates
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-3.5 lg:space-y-3">
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
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-2.5 md:py-3 lg:py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs sm:text-sm font-semibold text-[#1C2A39] font-sans">
                  Password
                </label>
                {/* Forgot Password Link */}
                <Link
                  href="/auth/forgot-password"
                  className="text-xs sm:text-sm font-semibold text-[#B5882D] hover:text-[#C99414] hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative rounded-xl border border-gray-300 hover:border-gray-400 bg-white focus-within:border-[#C5A059] focus-within:ring-4 focus-within:ring-[#C5A059]/15 transition-all shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4 md:w-5 md:h-5 lg:w-4 lg:h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-2.5 sm:py-2.5 md:py-3.5 lg:py-2.5 text-base sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent rounded-xl focus:outline-none font-sans"
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
                className="w-full py-2.5 sm:py-3 px-6 rounded-full font-bold text-sm sm:text-base text-[#0B203E] bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#C59B27] hover:brightness-105 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                <span>{loading ? "Processing..." : "Login"}</span>
              </button>
            </div>
          </form>

          {/* OR Divider */}
          <div className="relative my-3 sm:my-3.5 lg:my-3 flex items-center justify-center">
            <div className="w-full border-t border-gray-200"></div>
            <span className="absolute bg-white px-2.5 text-[11px] font-semibold text-gray-400 tracking-wider uppercase">
              OR
            </span>
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-2.5 px-4 border border-gray-300 hover:border-gray-400 rounded-xl flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50/80 shadow-2xs transition-all text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 cursor-pointer"
          >
            <FcGoogle size={18} />
            <span>Continue with Google</span>
          </button>

          {/* Register Link */}
          <div className="text-xs sm:text-sm text-gray-600 mt-3 sm:mt-4 lg:mt-3 text-center sm:text-left">
            Don&apos;t have an account?
            <Link
              href="/auth/signup"
              className="text-[#B5882D] hover:text-[#C99414] font-bold hover:underline ml-1"
            >
              Register
            </Link>
          </div>
        </div>
      </div>

      {/* 
        ========================================================================
        BRANDING & FEATURES PANEL:
        - Mobile & Tablet: hidden (only form shows in mobile and tab mode)
        - Desktop: lg:flex, lg:w-1/2, lg:h-full, fits strictly in 100vh
        ========================================================================
      */}
      <div className="hidden lg:flex lg:w-1/2 min-h-0 lg:h-full flex-col justify-center px-6 sm:px-8 md:px-8 lg:px-10 xl:px-12 py-10 lg:py-8 relative bg-[#081A32] overflow-hidden">

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
        <div className="absolute bottom-0 right-0 w-[75%] sm:w-[60%] md:w-[50%] max-w-[420px] h-[220px] sm:h-[260px] md:h-[280px] lg:h-[320px] pointer-events-none select-none z-0 overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src="/login-court-bg.jpg"
              alt="Supreme Court Architecture"
              fill
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 30vw"
              className="object-cover object-bottom-right opacity-90"
              style={{
                maskImage:
                  "linear-gradient(to top left, black 25%, rgba(0,0,0,0.6) 55%, transparent 85%)",
                WebkitMaskImage:
                  "linear-gradient(to top left, black 25%, rgba(0,0,0,0.6) 55%, transparent 85%)",
              }}
              priority
            />
          </div>
          {/* Deep blue fade overlays across top, left, and surface */}
          <div className="absolute inset-0 bg-[#081A32]/40 mix-blend-multiply pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#081A32]/50 via-[#081A32]/30 to-[#081A32] pointer-events-none"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#081A32] via-[#081A32]/60 to-transparent pointer-events-none"></div>
        </div>

        {/* Bottom Sweeping Gold Arc */}
        <svg
          className="absolute bottom-0 right-0 w-full h-32 sm:h-40 pointer-events-none z-10"
          viewBox="0 0 500 130"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,130 Q 260,20 500,0 L 500,130 Z"
            fill="#051224"
            opacity="0.55"
          />
          <path
            d="M 0,130 Q 260,20 500,0"
            stroke="#C5A059"
            strokeWidth="2"
            opacity="0.9"
          />
        </svg>

        {/* Grouped Header + Feature List */}
        <div className="relative z-20 w-full max-w-lg mx-auto md:mx-0 flex flex-col space-y-5 sm:space-y-6 pb-6 md:pb-0">
          {/* Top Header / Branding Emblem */}
          <div className="text-center w-full">
            <Image
              src="/login-logo-gold.png"
              alt="Sajjad Husain Law Associates"
              width={340}
              height={150}
              className="w-56 sm:w-68 md:w-72 lg:w-68 xl:w-76 h-auto object-contain mx-auto filter drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
              priority
            />
            <h2 className="text-white text-sm sm:text-base md:text-base lg:text-sm font-serif font-medium mt-2 tracking-wide drop-shadow-sm text-center">
              India&apos;s no.1 legal news portal
            </h2>
          </div>

          {/* Feature List (7 Items with Gold Check Badges) */}
          <div className="space-y-2.5 sm:space-y-3 md:space-y-3.5 lg:space-y-2 w-full pl-2 sm:pl-4 md:pl-2 lg:pl-6">
            {features.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
                <div className="w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-4.5 lg:h-4.5 rounded-full bg-[#B88E3E] flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white stroke-[3]" />
                </div>
                <div className="text-xs sm:text-[13px] md:text-sm lg:text-xs leading-snug drop-shadow-sm">
                  <span className="font-semibold text-white">{item.bold}</span>
                  {item.rest && <span className="text-gray-200"> {item.rest}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage(props: any) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <LoginPageContent {...props} />
    </Suspense>
  );
}
