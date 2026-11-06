"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  GraduationCap,
  Monitor,
  FileText,
  Quote,
  ShieldCheck,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAcademyLoginActions } from "@/data/features/academyAuth/useAcademyAuth";
import toast from "react-hot-toast";

function AcademyLoginContent() {
  const {
    formData,
    handleChange,
    handleLogin,
    handleGoogleLogin,
    loading,
    error,
    message,
  } = useAcademyLoginActions();

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  return (
    <main className="w-full min-h-screen lg:h-screen lg:overflow-hidden bg-[#08172D] font-sans">
      <div className="flex w-full min-h-screen lg:h-full flex-col lg:flex-row bg-white">

        {/* =====================================================
            LEFT - ACADEMY BRANDING (FIXED, NO SCROLL, IMMOVABLE)
        ====================================================== */}
        <section className="relative hidden lg:flex lg:w-[45%] xl:w-[46%] shrink-0 flex-col justify-between bg-[#08172D] text-white p-6 lg:p-8 xl:p-10 overflow-hidden border-r border-[#122340]/20 lg:h-full select-none">
          
          {/* Subtle architectural ambient accent */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#C9A227]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#122340]/60 blur-3xl" />

          {/* Top Logo */}
          <Link href="/academy" className="relative z-10 group inline-flex items-center gap-3.5 w-fit shrink-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 shadow-md transition-transform group-hover:scale-105">
              <span className="text-base font-black tracking-tight text-[#C9A227]">
                SH
              </span>
            </div>
            <div>
              <p className="text-[17px] font-bold tracking-tight text-white leading-tight">
                Sajjad Husain
              </p>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#C9A227] uppercase leading-tight mt-0.5">
                LEGAL ACADEMY
              </p>
            </div>
          </Link>

          {/* Center Content */}
          <div className="relative z-10 my-auto py-2 xl:py-4 max-w-lg">
            <h1 className="font-serif text-2xl sm:text-3xl xl:text-[38px] font-bold text-white leading-[1.15] tracking-tight">
              Think like a lawyer.
              <br />
              <span className="text-[#C9A227]">Practice like one.</span>
            </h1>

            <p className="mt-3 text-xs sm:text-sm leading-relaxed text-gray-300 font-normal max-w-md">
              Get practical legal learning and mentorship from experienced professionals.
            </p>

            {/* Stats Bar */}
            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 divide-x divide-white/15">
              <div className="pr-2.5">
                <p className="font-serif text-xl lg:text-2xl font-bold text-[#C9A227]">500+</p>
                <p className="mt-1 text-[11px] text-gray-300/90 font-medium leading-tight">Students mentored</p>
              </div>
              <div className="px-2.5">
                <p className="font-serif text-xl lg:text-2xl font-bold text-[#C9A227]">50+</p>
                <p className="mt-1 text-[11px] text-gray-300/90 font-medium leading-tight">Live sessions monthly</p>
              </div>
              <div className="pl-2.5">
                <p className="font-serif text-xl lg:text-2xl font-bold text-[#C9A227]">12+</p>
                <p className="mt-1 text-[11px] text-gray-300/90 font-medium leading-tight">Years in practice</p>
              </div>
            </div>

            {/* Checklist items */}
            <div className="mt-5 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="text-[#C9A227] shrink-0">
                  <GraduationCap size={17} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/95">Premium course access</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[#C9A227] shrink-0">
                  <Monitor size={17} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/95">Live sessions with instructors</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[#C9A227] shrink-0">
                  <FileText size={17} />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-white/95">Practical legal assignments</span>
              </div>
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10 pt-3 xl:pt-4 border-t border-white/10 shrink-0">
            <div className="flex items-start gap-2.5">
              <Quote size={15} className="text-[#C9A227] fill-[#C9A227] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-[13px] italic leading-relaxed text-gray-300 font-light">
                Every lesson here comes from an active courtroom — not a textbook.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT - LOGIN FORM (SCROLLABLE FORM, INDEPENDENT SCROLL)
        ====================================================== */}
        <section className="flex-1 flex flex-col items-center justify-start bg-white px-5 py-6 sm:py-8 md:px-10 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto">
          <div className="w-full max-w-[420px] pb-8">

            {/* High-Visibility Back to Home Button */}
            <div className="mb-4">
              <Link
                href="/academy"
                className="group inline-flex items-center gap-2.5 text-xs sm:text-sm font-bold text-[#0B2242] hover:text-[#8A6100] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#8A6100]/10 flex items-center justify-center transition-colors">
                  <ArrowLeft size={15} className="text-[#0B2242] group-hover:text-[#8A6100] transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-4">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
                STUDENT PORTAL
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B2242] tracking-tight">
                Welcome Back
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-normal font-normal">
                Sign in to continue your legal learning journey.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-3">

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                >
                  EMAIL ADDRESS
                </label>
                <div className="relative group">
                  <Mail
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="email"
                    placeholder="student@example.com"
                    className="w-full h-11 pl-10 pr-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                >
                  PASSWORD
                </label>
                <div className="relative group">
                  <Lock
                    size={17}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="w-full h-11 pl-10 pr-11 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0B2242] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
                <div className="mt-1 text-right">
                  <Link
                    href="/academy/auth/forgot-password"
                    className="text-[11px] font-bold text-[#0B2242] hover:text-[#8A6100] hover:underline underline decoration-[#B8860B] decoration-1 underline-offset-2 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Login Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-[#0B2242] hover:bg-[#07172C] text-white rounded-xl text-sm font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Login"
                )}
              </button>

              {/* OR Divider */}
              <div className="flex items-center gap-3 my-1.5">
                <div className="flex-1 h-[1px] bg-slate-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">OR</span>
                <div className="flex-1 h-[1px] bg-slate-200" />
              </div>

              {/* Continue with Google */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full h-11 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <FcGoogle size={18} />
                <span>Continue with Google</span>
              </button>
            </form>

            {/* Switch to Signup */}
            <div className="mt-4 text-center">
              <p className="text-xs sm:text-[13px] font-medium text-slate-600">
                Don't have an account?{" "}
                <Link
                  href="/academy/auth/signup"
                  className="font-extrabold text-[#0B2242] underline decoration-[#B8860B] decoration-2 underline-offset-4 hover:text-[#8A6100] transition-colors"
                >
                  Create an account
                </Link>
              </p>
            </div>

            {/* Security Footnote */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
              <ShieldCheck size={14} className="text-[#A67C00]" />
              <span>Secure access to Sajjad Husain Legal Academy</span>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default function AcademyLogin() {
  return (
    <Suspense fallback={<main className="min-h-screen w-full bg-white" />}>
      <AcademyLoginContent />
    </Suspense>
  );
}
