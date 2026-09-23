"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAcademyLoginActions } from "@/data/features/academyAuth/useAcademyAuth";
import toast from "react-hot-toast";

export default function AcademyLogin() {
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
    <main className="min-h-[100dvh] w-full bg-[#f7f8fa] font-sans lg:h-[100dvh] lg:overflow-hidden">
      <div className="flex min-h-[100dvh] w-full flex-col lg:h-full lg:flex-row">

        {/* =====================================================
            LEFT - ACADEMY BRANDING
        ====================================================== */}
        <section
          className="
            relative
            hidden
            lg:flex
            lg:h-full
            lg:w-[42%]
            xl:w-[44%]
            shrink-0
            overflow-hidden
            bg-[#0d1b34]
            text-white
          "
        >
          {/* Subtle decorative elements */}
          <div
            className="
              pointer-events-none
              absolute
              -top-32
              -right-32
              h-[420px]
              w-[420px]
              rounded-full
              border-[70px]
              border-white/[0.025]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-40
              -left-40
              h-[500px]
              w-[500px]
              rounded-full
              border-[80px]
              border-[#c9a227]/[0.04]
            "
          />

          {/* Gold vertical accent */}
          {/* <div className="absolute left-0 top-0 h-full w-[4px] bg-[#c9a227]" /> */}

          <div className="relative z-10 flex min-h-full w-full flex-col px-10 py-8 lg:px-[3vw] lg:py-[3vh] xl:px-16 xl:py-[4vh]">

            {/* Logo */}
            <Link
              href="/"
              className="group inline-flex w-fit shrink-0 items-center gap-3"
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-white/15
                  bg-white/[0.06]
                  shadow-lg
                  transition
                  group-hover:border-[#c9a227]/50
                "
              >
                <span className="text-sm font-black tracking-tight text-[#c9a227]">
                  SA
                </span>
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-tight text-white">
                  Sajjad Husain
                </p>

                <p className="text-[11px] font-medium tracking-[0.16em] text-white/45 uppercase">
                  Legal Academy
                </p>
              </div>
            </Link>

            {/* Main branding content */}
            <div className="flex flex-1 flex-col justify-center lg:py-[2vh]">
              <div className="max-w-[560px]">

                <div className="mb-4 flex items-center gap-3 lg:mb-[2vh]">
                  

                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a227]">
                    Legal Education
                  </span>
                </div>

                <h1
                  className="
                    text-4xl
                    font-extrabold
                    leading-[1.08]
                    tracking-[-0.035em]
                    text-white
                    lg:text-[clamp(2rem,5vh,3.75rem)]
                  "
                >
                  Think like a lawyer.
                  <br />

                  <span className="text-[#c9a227]">
                    Practice like one.
                  </span>
                </h1>

                <p
                  className="
                    mt-5
                    max-w-[440px]
                    text-[15px]
                    leading-7
                    text-white/55
                    lg:mt-[2vh]
                    lg:text-[clamp(13px,1.8vh,16px)]
                    lg:leading-[1.6]
                  "
                >
                  Live sessions, real casework, and direct mentorship from a
                  practicing advocate — built for students who want
                  courtroom-ready skills, not just theory.
                </p>

                {/* Stats */}
                <div className="mt-8 flex items-stretch gap-8 border-t border-white/10 pt-6 lg:mt-[3.5vh] lg:pt-[2.5vh]">
                  {[
                    { value: "500+", label: "Students mentored" },
                    { value: "50+", label: "Live sessions monthly" },
                    { value: "12+", label: "Years in practice" },
                  ].map((stat, i) => (
                    <div
                      key={stat.label}
                      className={`${
                        i > 0 ? "border-l border-white/10 pl-8" : ""
                      }`}
                    >
                      <p className="text-[clamp(1.35rem,3.2vh,2rem)] font-extrabold tracking-tight text-[#c9a227]">
                        {stat.value}
                      </p>

                      <p className="mt-1.5 text-[11px] font-medium leading-tight text-white/45">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>

                {/* What you get */}
                <div className="mt-8 space-y-3 lg:mt-[3vh] lg:space-y-[1.2vh]">
                  {[
                    "Access to premium courses",
                    "Live Google Meet sessions with instructors",
                    "Practical, graded legal assignments",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3.5"
                    >
                      <CheckCircle2
                        size={16}
                        className="shrink-0 text-[#c9a227]"
                      />

                      <span className="text-[13px] font-medium text-white/65">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-end justify-between gap-6 border-t border-white/10 pt-5 lg:pt-[2vh]">
              <div>
                <p className="text-[12px] italic leading-snug text-white/40">
                  "Every lesson here comes from an active courtroom —
                  not a textbook."
                </p>

                {/* <p className="mt-2.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                  © {new Date().getFullYear()} Sajjad Husain Law Associates
                </p> */}
              </div>

              {/* <div className="hidden shrink-0 xl:block h-px w-16 self-end bg-white/10" /> */}
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT - LOGIN
        ====================================================== */}
        <section
          className="
            flex
            min-h-[100dvh]
            flex-1
            bg-white
            lg:h-full
            lg:min-h-0
            lg:overflow-y-auto
          "
        >
          <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 md:px-10 md:py-12 lg:px-12 lg:py-[3vh] xl:px-20">

            <div className="w-full max-w-[460px]">

              {/* Back */}
              <Link
                href="/"
                className="
                  group
                  mb-8
                  inline-flex
                  items-center
                  gap-2
                  text-[13px]
                  font-semibold
                  text-[#122340]/55
                  transition
                  hover:text-[#122340]
                  lg:mb-[3vh]
                "
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />

                Back to Home
              </Link>

              {/* Heading */}
              <div className="mb-8 lg:mb-[3vh]">

                <div className="mb-4 lg:hidden">
                  <div className="flex items-center gap-3">
                    <div
                      className="
                        flex
                        h-10
                        w-10
                        items-center
                        justify-center
                        rounded-xl
                        bg-[#122340]
                      "
                    >
                      <span className="text-xs font-black text-[#c9a227]">
                        SA
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-bold text-[#122340]">
                        Sajjad Husain
                      </p>

                      <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#122340]/40">
                        Legal Academy
                      </p>
                    </div>
                  </div>
                </div>

                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Student Portal
                </p>

                <h2
                  className="
                    text-3xl
                    font-extrabold
                    tracking-[-0.025em]
                    text-[#122340]
                    sm:text-4xl
                    lg:text-[clamp(1.5rem,4vh,2.25rem)]
                  "
                >
                  Welcome Back
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#122340]/50 lg:mt-[1vh]">
                  Sign in to continue your legal learning journey.
                </p>
              </div>

              {/* Login Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-4 lg:space-y-[1.8vh]"
              >

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="
                      mb-2.5
                      block
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[#122340]
                    "
                  >
                    Email Address
                  </label>

                  <div className="group relative">
                    <Mail
                      size={18}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#122340]/30
                        transition
                        group-focus-within:text-[#c9a227]
                      "
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
                      className="
                        h-[48px]
                        w-full
                        rounded-xl
                        border
                        border-[#122340]/10
                        bg-[#f8f9fb]
                        pl-11
                        pr-4
                        text-sm
                        font-medium
                        text-[#122340]
                        outline-none
                        transition
                        placeholder:text-[#122340]/30
                        focus:border-[#c9a227]/60
                        focus:bg-white
                        focus:ring-4
                        focus:ring-[#c9a227]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        lg:h-[clamp(44px,6.2vh,54px)]
                      "
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="mb-2.5 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#122340]
                      "
                    >
                      Password
                    </label>
                  </div>

                  <div className="group relative">
                    <Lock
                      size={18}
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#122340]/30
                        transition
                        group-focus-within:text-[#c9a227]
                      "
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
                      className="
                        h-[48px]
                        w-full
                        rounded-xl
                        border
                        border-[#122340]/10
                        bg-[#f8f9fb]
                        pl-11
                        pr-12
                        text-sm
                        font-medium
                        text-[#122340]
                        outline-none
                        transition
                        placeholder:text-[#122340]/30
                        focus:border-[#c9a227]/60
                        focus:bg-white
                        focus:ring-4
                        focus:ring-[#c9a227]/10
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        lg:h-[clamp(44px,6.2vh,54px)]
                      "
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-4
                        top-1/2
                        -translate-y-1/2
                        text-[#122340]/35
                        transition
                        hover:text-[#122340]
                      "
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>

                  <div className="mt-2.5 flex justify-end">
                    <Link
                      href="/auth/forgot-password"
                      className="
                        text-xs
                        font-semibold
                        text-[#122340]/65
                        transition
                        hover:text-[#c9a227]
                        hover:underline
                      "
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-3
                    flex
                    h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-[#122340]
                    text-sm
                    font-bold
                    text-white
                    
                    transition-all
                   
                    hover:bg-[#0e1d36]
                    
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    disabled:hover:translate-y-0
                    lg:h-[clamp(44px,6.2vh,54px)]
                  "
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={19}
                        className="animate-spin"
                      />
                      Signing in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2 lg:py-[0.6vh]">
                  <div className="h-px flex-1 bg-[#122340]/10" />

                  <span
                    className="
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-[#122340]/40
                    "
                  >
                    or
                  </span>

                  <div className="h-px flex-1 bg-[#122340]/10" />
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="
                    flex
                    h-[48px]
                    w-full
                    items-center
                    justify-center
                    gap-3
                    rounded-xl
                    border
                    border-[#122340]/10
                    bg-white
                    text-sm
                    font-bold
                    text-[#122340]
                    transition
                    hover:bg-[#f8f9fb]
                    hover:border-[#122340]/20
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    lg:h-[clamp(44px,6.2vh,54px)]
                  "
                >
                  <FcGoogle size={20} />
                  Continue with Google
                </button>
              </form>

              {/* Signup */}
              <div className="mt-8 text-center lg:mt-[2.5vh]">
                <p className="text-sm text-[#122340]/70">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="
                      font-bold
                      text-[#122340]
                      underline
                      decoration-[#c9a227]/40
                      underline-offset-4
                      transition
                      hover:text-[#c9a227]
                      hover:decoration-[#c9a227]
                    "
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Small footer */}
              <p className="mt-8 text-center text-[10px] font-medium text-[#122340]/55 lg:mt-[2vh]">
                Secure access to Sajjad Husain Legal Academy
              </p>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}