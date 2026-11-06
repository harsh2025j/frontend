"use client";

import { Suspense } from "react";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Quote,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { forgotPassword, resetPassword, verifyOtp } from "@/data/features/auth/authThunks";
import { resetAuthState } from "@/data/features/auth/authSlice";
import { useResendOtp } from "@/data/features/auth/useAuthActions";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";

type Step = "forgot" | "verify" | "reset";

function AcademyForgotPasswordContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Auth State
  const { loading, error, message } = useAppSelector((s) => s.auth);
  const { handleReSendOtp, loading: resendLoading } = useResendOtp();
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Flow State
  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Handle URL Params for reset link entry
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("Step");
    const emailParam = params.get("email");

    if (stepParam) setStep("reset");
    if (emailParam) setEmail(emailParam);
  }, []);

  // Handle Redux Messages
  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  // Handle Reset Success Redirection
  useEffect(() => {
    if (message === MESSAGES.RESET_SUCCESS) {
      router.push("/academy/auth/login");
      dispatch(resetAuthState());
    }
  }, [message, router, dispatch]);

  // Countdown Timer for Resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter email");
      return;
    }
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      localStorage.setItem("email", email);
      setStep("verify");
    } catch {}
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    setVerifyLoading(true);
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      setStep("reset");
    } catch {} finally {
      setVerifyLoading(false);
    }
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

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await dispatch(
        resetPassword({
          email,
          otp,
          newPassword,
          conformPassword: confirmPassword,
        })
      ).unwrap();
    } catch {}
  };

  const stepMeta: Record<Step, { eyebrow: string; heading: string; sub: string }> = {
    forgot: {
      eyebrow: "PASSWORD RESET",
      heading: "Forgot Password?",
      sub: "Enter your registered student email address to receive a 6-digit verification code.",
    },
    verify: {
      eyebrow: "VERIFY IDENTITY",
      heading: "Check Your Email",
      sub: `We've sent a 6-digit verification code to ${email || "your email"}.`,
    },
    reset: {
      eyebrow: "NEW CREDENTIALS",
      heading: "Set New Password",
      sub: "Choose a strong password that is different from previously used passwords.",
    },
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
              Account
              <br />
              <span className="text-[#C9A227]">Recovery Portal.</span>
            </h1>

            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-gray-300 font-normal max-w-md">
              Securely reset your password and regain immediate access to your courses, practical assignments, and live courtroom sessions.
            </p>

            {/* Recovery Step Indicators */}
            <div className="mt-5 pt-4 border-t border-white/15 space-y-2.5">
              {[
                {
                  step: "01",
                  active: step === "forgot",
                  done: step === "verify" || step === "reset",
                  title: "Request a code",
                  desc: "Enter your registered student email address.",
                },
                {
                  step: "02",
                  active: step === "verify",
                  done: step === "reset",
                  title: "Verify your identity",
                  desc: "Enter the 6-digit code we send to your email.",
                },
                {
                  step: "03",
                  active: step === "reset",
                  done: false,
                  title: "Set a new password",
                  desc: "Create a secure password and get back into your portal.",
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
                Every recovery request is protected with student-level security encryption.
              </p>
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT - RECOVERY FORM (SCROLLABLE, INDEPENDENT SCROLL)
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

            {/* Header (No mobile logo badge per design rule) */}
            <div className="mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
                {stepMeta[step].eyebrow}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B2242] tracking-tight">
                {stepMeta[step].heading}
              </h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-normal font-normal">
                {step === "verify" ? (
                  <>
                    We&apos;ve sent a 6-digit verification code to{" "}
                    <span className="font-semibold text-[#0B2242]">{email}</span>.
                  </>
                ) : (
                  stepMeta[step].sub
                )}
              </p>
            </div>

            {/* STEP 1: REQUEST OTP */}
            {step === "forgot" && (
              <form onSubmit={handleSendOtp} className="space-y-3">
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="email"
                      placeholder="student@example.com"
                      className="w-full h-10.5 pl-10 pr-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10.5 bg-[#0B2242] hover:bg-[#07172C] text-white rounded-xl text-sm font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-1 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Sending code...</span>
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </button>

                <div className="mt-3 text-center">
                  <Link
                    href="/academy/auth/login"
                    className="text-xs sm:text-[13px] font-extrabold text-[#0B2242] underline decoration-[#B8860B] decoration-2 underline-offset-4 hover:text-[#8A6100] transition-colors"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {/* STEP 2: VERIFY OTP */}
            {step === "verify" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                    className="w-full h-10.5 bg-[#0B2242] hover:bg-[#07172C] text-white rounded-xl text-sm font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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

                  <button
                    type="button"
                    onClick={() => setStep("forgot")}
                    className="text-xs font-semibold text-slate-500 hover:text-[#0B2242] transition-colors"
                  >
                    Change email address
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3: RESET PASSWORD */}
            {step === "reset" && (
              <form onSubmit={handleReset} className="space-y-3">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                  >
                    NEW PASSWORD
                  </label>
                  <div className="relative group">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                    />
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      className="w-full h-10.5 pl-10 pr-11 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={showNewPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0B2242] transition-colors cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                  >
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative group">
                    <Lock
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      className="w-full h-10.5 pl-10 pr-11 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#0B2242] transition-colors cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10.5 bg-[#0B2242] hover:bg-[#07172C] text-white rounded-xl text-sm font-extrabold tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={17} className="animate-spin" />
                      <span>Resetting password...</span>
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}

            {/* Security Footnote */}
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600">
              <ShieldCheck size={14} className="text-[#A67C00]" />
              <span>Secure access to Sajjad Husain Legal Academy</span>
            </div>

          </div>
        </section>
      </div>
    </main>
  );
}

export default function AcademyForgotPassword(props: any) {
  return (
    <Suspense fallback={<main className="min-h-screen w-full bg-white" />}>
      <AcademyForgotPasswordContent {...props} />
    </Suspense>
  );
}
