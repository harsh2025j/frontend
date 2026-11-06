"use client";

import { Suspense, useState, useEffect } from "react";
import React from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Quote,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import {
  useAcademyRegisterActions,
  useAcademyVerifyActions,
} from "@/data/features/academyAuth/useAcademyAuth";
import { useResendOtp } from "@/data/features/auth/useAuthActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { resetAuthState } from "@/data/features/auth/authSlice";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";

function AcademySignupContent() {
  const {
    formData,
    handleChange,
    handleRegister,
    handleGoogleLogin,
    loading: registerLoading,
    error: registerError,
    message: registerMessage,
  } = useAcademyRegisterActions();

  const { handleVerify, loading: verifyLoading } = useAcademyVerifyActions();
  const { handleReSendOtp, loading: resendLoading } = useResendOtp();
  const dispatch = useAppDispatch();

  const [step, setStep] = useState<"register" | "verify">("register");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (registerError) toast.error(registerError);
    if (registerMessage === MESSAGES.REGISTER_SUCCESS) {
      setStep("verify");
      dispatch(resetAuthState());
    }
  }, [registerError, registerMessage, dispatch]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const onVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) return;
    handleVerify(otp, formData.email);
  };

  const handleResendWithTimer = async () => {
    if (countdown > 0) return;
    try {
      await handleReSendOtp();
      setCountdown(60);
    } catch (error) {
      console.error("Failed to resend OTP:", error);
    }
  };

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
              Start your
              <br />
              <span className="text-[#C9A227]">Legal Journey.</span>
            </h1>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-gray-300 font-normal max-w-md">
              Create your student account in minutes and get immediate access to courses, practical assignments, and live courtroom mentoring.
            </p>

            {/* Step-by-Step Onboarding Overview */}
            <div className="mt-5 pt-4 border-t border-white/15 space-y-2.5">
              {[
                {
                  step: "01",
                  active: step === "register",
                  done: step === "verify",
                  title: "Create your account",
                  desc: "Name, email, phone and a password — that's it.",
                },
                {
                  step: "02",
                  active: step === "verify",
                  done: false,
                  title: "Verify your email",
                  desc: "Enter the 6-digit code we send you to confirm your identity.",
                },
                {
                  step: "03",
                  active: false,
                  done: false,
                  title: "Start learning",
                  desc: "Get instant access to courses and upcoming live sessions.",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className={`relative flex items-start gap-3.5 p-3 rounded-xl transition-all ${
                    item.active
                      ? "bg-white/[0.09] border border-white/20 shadow-inner"
                      : "border border-transparent"
                  }`}
                >
                  <span
                    className={`shrink-0 flex h-8 w-8 items-center justify-center rounded-full text-xs font-mono font-black mt-0.5 transition-all ${
                      item.done
                        ? "bg-[#C9A227] text-[#08172D] shadow-md shadow-[#C9A227]/40 ring-2 ring-[#C9A227]/50"
                        : item.active
                        ? "bg-[#C9A227] text-[#08172D] shadow-lg shadow-[#C9A227]/60 ring-4 ring-white/30 text-sm"
                        : "border-2 border-white/50 bg-[#122340] text-white font-bold"
                    }`}
                  >
                    {item.done ? <CheckCircle2 size={17} strokeWidth={3} /> : item.step}
                  </span>
                  <div>
                    <p
                      className={`text-[15px] font-bold leading-tight ${
                        item.active || item.done ? "text-white" : "text-white/90"
                      }`}
                    >
                      {item.title}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-relaxed font-normal ${
                        item.active ? "text-slate-200" : "text-slate-300"
                      }`}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Quote */}
          <div className="relative z-10 pt-3 xl:pt-4 border-t border-white/10 shrink-0">
            <div className="flex items-start gap-2.5">
              <Quote size={15} className="text-[#C9A227] fill-[#C9A227] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-[12px] italic leading-relaxed text-gray-300 font-light">
                Every lesson here comes from an active courtroom — not a textbook.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT - SIGNUP FORM (SCROLLABLE FORM, INDEPENDENT SCROLL)
        ====================================================== */}
        <section className="flex-1 flex flex-col items-center justify-start bg-white px-5 py-6 sm:py-8 md:px-10 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto">
          <div className="w-full max-w-[420px] pb-8">

            {/* High-Visibility Back to Home Button */}
            <div className="mb-3">
              <Link
                href="/academy"
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0B2242] hover:text-[#8A6100] transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#8A6100]/10 flex items-center justify-center transition-colors">
                  <ArrowLeft size={15} className="text-[#0B2242] group-hover:text-[#8A6100] transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Header */}
            <div className="mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
                STUDENT PORTAL
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B2242] tracking-tight">
                {step === "register" ? "Create Account" : "Check Your Email"}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-normal font-normal">
                {step === "register"
                  ? "Join the Academy to advance your legal career."
                  : "We've sent a 6-digit verification code to your email."}
              </p>
            </div>

            {/* Step 1: Registration Form */}
            {step === "register" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleRegister();
                }}
                className="space-y-2.5"
              >
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-0.5"
                  >
                    FULL NAME
                  </label>
                  <div className="relative group">
                    <User
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                    />
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      disabled={registerLoading}
                      autoComplete="name"
                      placeholder="Advocate Student"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-0.5"
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
                      disabled={registerLoading}
                      autoComplete="email"
                      placeholder="student@example.com"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-0.5"
                  >
                    MOBILE NUMBER
                  </label>
                  <div className="relative group">
                    <Phone
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                    />
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={registerLoading}
                      autoComplete="tel"
                      placeholder="+91 98765 43210"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-0.5"
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
                      disabled={registerLoading}
                      autoComplete="new-password"
                      placeholder="Create a strong password"
                      className="w-full h-10.5 pl-10 pr-11 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={registerLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0B2242] transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Create Account Submit Button */}
                <button
                  type="submit"
                  disabled={registerLoading}
                  className="w-full h-10.5 bg-[#0B2242] hover:bg-[#07172C] text-white rounded-xl text-sm font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {registerLoading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Creating account...</span>
                    </>
                  ) : (
                    "Create Student Account"
                  )}
                </button>

                {/* OR Divider */}
                <div className="flex items-center gap-3 my-1">
                  <div className="flex-1 h-[1px] bg-slate-200" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-1">OR</span>
                  <div className="flex-1 h-[1px] bg-slate-200" />
                </div>

                {/* Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={registerLoading}
                  className="w-full h-10.5 rounded-xl border-2 border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400 text-slate-800 text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <FcGoogle size={18} />
                  <span>Continue with Google</span>
                </button>
              </form>
            )}

            {/* Step 2: Verification Flow */}
            {step === "verify" && (
              <form onSubmit={onVerifySubmit} className="space-y-5">
                <div className="flex justify-between gap-2 sm:gap-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <input
                      key={i}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 1);
                        const chars = otp.split("");
                        chars[i] = value;
                        setOtp(chars.join(""));
                        if (value && i < 5) {
                          const nextInput = document.querySelector<HTMLInputElement>(
                            `input[data-index="${i + 1}"]`
                          );
                          nextInput?.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !otp[i] && i > 0) {
                          const prevInput = document.querySelector<HTMLInputElement>(
                            `input[data-index="${i - 1}"]`
                          );
                          prevInput?.focus();
                        }
                      }}
                      data-index={i}
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-center text-lg font-bold text-[#0B2242] outline-none transition-all focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/20 shadow-2xs hover:border-slate-400"
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-3">
                  <button
                    type="submit"
                    disabled={verifyLoading || resendLoading || otp.length < 6}
                    className="w-full h-11 bg-[#0B2242] hover:bg-[#07172C] text-white rounded-xl text-sm font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifyLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        <span>Verifying code...</span>
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleResendWithTimer}
                    disabled={resendLoading || verifyLoading || countdown > 0}
                    className="text-xs font-bold text-slate-600 transition-colors hover:text-[#8A6100] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {resendLoading
                      ? "Sending..."
                      : countdown > 0
                      ? `Resend code in 0:${countdown.toString().padStart(2, "0")}`
                      : (
                        <>
                          Didn&apos;t receive code?{" "}
                          <span className="text-[#8A6100] font-bold underline decoration-[#B8860B] decoration-2 hover:text-[#6D4C00]">Resend</span>
                        </>
                      )}
                  </button>
                </div>
              </form>
            )}

            {/* Switch to Login */}
            <div className="mt-3 text-center">
              <p className="text-xs sm:text-[13px] font-medium text-slate-600">
                Already have an account?{" "}
                <Link
                  href="/academy/auth/login"
                  className="font-extrabold text-[#0B2242] underline decoration-[#B8860B] decoration-2 underline-offset-4 hover:text-[#8A6100] transition-colors"
                >
                  Login
                </Link>
              </p>
            </div>

            {/* Security Footnote */}
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
              <ShieldCheck size={14} className="text-[#A67C00]" />
              <span>Secure access to Sajjad Husain Legal Academy</span>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default function AcademySignup(props: any) {
  return (
    <Suspense fallback={<main className="min-h-screen w-full bg-white" />}>
      <AcademySignupContent {...props} />
    </Suspense>
  );
}
