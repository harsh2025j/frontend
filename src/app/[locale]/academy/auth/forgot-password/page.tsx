"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  CheckCircle2,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { forgotPassword, resetPassword, verifyOtp } from "@/data/features/auth/authThunks";
import { resetAuthState } from "@/data/features/auth/authSlice";
import { useResendOtp } from "@/data/features/auth/useAuthActions";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";

type Step = "forgot" | "verify" | "reset";

export default function AcademyForgotPassword() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  // Auth State
  const { loading, error, message, user } = useAppSelector((s) => s.auth);
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
      router.push("/auth/login");
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
    } catch { }
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
    } catch {
    } finally {
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
          conformPassword: confirmPassword, // mapping to expected API prop
        })
      ).unwrap();
    } catch { }
  };

  const stepMeta: Record<Step, { eyebrow: string; heading: string; sub: string }> = {
    forgot: {
      eyebrow: "Request Code",
      heading: "Forgot Password?",
      sub: "Enter your registered student email address to receive a verification code.",
    },
    verify: {
      eyebrow: "Verify Identity",
      heading: "Check Your Email",
      sub: `We've sent a 6-digit verification code to ${email || "your email"}.`,
    },
    reset: {
      eyebrow: "New Password",
      heading: "Set New Password",
      sub: "Your new password must be different from previously used passwords.",
    },
  };

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
                  {/* <div className="h-px w-10 bg-[#c9a227]" /> */}

                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#c9a227]">
                    Account Security
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
                  Locked out?
                  <br />

                  <span className="text-[#c9a227]">
                    Let&apos;s fix that.
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
                  A verified email and one code are all it takes to get back
                  into your dashboard — no support ticket required.
                </p>

                {/* Recovery steps */}
                <div className="mt-8 space-y-5 border-t border-white/10 pt-6 lg:mt-[3.5vh] lg:space-y-[2vh] lg:pt-[2.5vh]">
                  {[
                    {
                      active: step === "forgot",
                      done: step === "verify" || step === "reset",
                      title: "Request a code",
                      desc: "Enter the email address on your student account.",
                    },
                    {
                      active: step === "verify",
                      done: step === "reset",
                      title: "Verify it's you",
                      desc: "Enter the 6-digit code we send to your inbox.",
                    },
                    {
                      active: step === "reset",
                      done: false,
                      title: "Set a new password",
                      desc: "Choose a new password and you're back in.",
                    },
                  ].map((item, i) => (
                    <div key={item.title} className="flex gap-4">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                          item.done
                            ? "bg-[#c9a227] text-[#0d1b34]"
                            : item.active
                            ? "border border-[#c9a227] text-[#c9a227]"
                            : "border border-white/20 text-white/30"
                        }`}
                      >
                        {item.done ? (
                          <CheckCircle2 size={13} strokeWidth={3} />
                        ) : (
                          i + 1
                        )}
                      </span>

                      <div>
                        <p
                          className={`text-[13px] font-semibold ${
                            item.active || item.done
                              ? "text-white/90"
                              : "text-white/50"
                          }`}
                        >
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[12.5px] leading-snug text-white/40">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex shrink-0 items-end justify-between gap-6 border-t border-white/10 pt-5 lg:pt-[2vh]">
              <div className="flex items-center gap-2.5">
                <ShieldCheck size={14} className="shrink-0 text-[#c9a227]" />

                <div>
                  <p className="text-[12px] font-medium leading-snug text-white/40">
                    Every reset request is encrypted end-to-end.
                  </p>

                  {/* <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">
                    © {new Date().getFullYear()} Sajjad Husain Law Associates
                  </p> */}
                </div>
              </div>

              {/* <div className="hidden shrink-0 xl:block h-px w-16 self-end bg-white/10" /> */}
            </div>
          </div>
        </section>

        {/* =====================================================
            RIGHT - RECOVERY FLOW
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
          <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 md:px-10 md:py-12 lg:px-12 lg:py-[2.5vh] xl:px-20">

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
                  text-[#122340]/65
                  transition
                  hover:text-[#122340]
                  lg:mb-[2.5vh]
                "
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />

                Back to Home
              </Link>

              {/* Mobile logo */}
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

              {/* Icon badge for verify / reset steps */}
              {step !== "forgot" && (
                <div
                  className="
                    mb-6
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-[#122340]/10
                    bg-[#122340]/5
                    lg:mb-[2vh]
                  "
                >
                  {step === "verify" ? (
                    <Mail size={15} className="text-[#c9a227]" />
                  ) : (
                    <KeyRound size={20} className="text-[#c9a227]" />
                  )}
                </div>
              )}

              {/* Heading */}
              <div className="mb-8 lg:mb-[2.5vh]">
                <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  {stepMeta[step].eyebrow}
                </p>

                <h2
                  className="
                    text-3xl
                    font-extrabold
                    tracking-[-0.025em]
                    text-[#122340]
                    sm:text-4xl
                    lg:text-[clamp(1.5rem,3.8vh,2.25rem)]
                  "
                >
                  {stepMeta[step].heading}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#122340]/70 lg:mt-[1vh]">
                  {step === "verify" ? (
                    <>
                      We&apos;ve sent a 6-digit verification code to{" "}
                      <span className="font-semibold text-[#122340]">
                        {email}
                      </span>
                      .
                    </>
                  ) : (
                    stepMeta[step].sub
                  )}
                </p>
              </div>

              {/* STEP 1: REQUEST OTP */}
              {step === "forgot" && (
                <>
                  <form
                    onSubmit={handleSendOtp}
                    className="space-y-4 lg:space-y-[1.8vh]"
                  >
                    <div>
                      <label
                        htmlFor="email"
                        className="
                          mb-2
                          block
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-[0.12em]
                          text-[#122340]
                          lg:mb-[0.7vh]
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
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          autoComplete="email"
                          placeholder="student@example.com"
                          className="
                            h-[52px]
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
                            lg:h-[clamp(44px,6vh,54px)]
                          "
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        mt-2
                        flex
                        h-[52px]
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
                        lg:h-[clamp(44px,6vh,54px)]
                      "
                    >
                      {loading ? (
                        <>
                          <Loader2 size={19} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Request OTP"
                      )}
                    </button>
                  </form>

                  <div className="mt-8 text-center lg:mt-[2.5vh]">
                    <Link
                      href="/auth/login"
                      className="
                        text-sm
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
                      Back to Login
                    </Link>
                  </div>
                </>
              )}

              {/* STEP 2: VERIFY OTP */}
              {step === "verify" && (
                <form
                  onSubmit={handleVerifyOtp}
                  className="space-y-6 lg:space-y-[2.5vh]"
                >
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
                        className="
                          h-12
                          w-10
                          rounded-xl
                          border
                          border-[#122340]/10
                          bg-[#f8f9fb]
                          text-center
                          text-xl
                          font-bold
                          text-[#122340]
                          outline-none
                          transition
                          focus:border-[#c9a227]/60
                          focus:bg-white
                          focus:ring-4
                          focus:ring-[#c9a227]/10
                          sm:h-14
                          sm:w-12
                        "
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      type="submit"
                      disabled={verifyLoading || resendLoading || otp.length < 6}
                      className="
                        flex
                        h-[52px]
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
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                        disabled:hover:translate-y-0
                        lg:h-[clamp(44px,6vh,54px)]
                      "
                    >
                      {verifyLoading ? (
                        <>
                          <Loader2 size={19} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify Code"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendWithTimer}
                      disabled={resendLoading || verifyLoading || countdown > 0}
                      className="
                        text-sm
                        font-semibold
                        text-[#122340]/90
                        transition
                        
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {resendLoading
                        ? "Sending..."
                        : countdown > 0
                        ? `Resend code in 0:${countdown.toString().padStart(2, "0")}`
                        : (
                            <>
                              Didn't receive code?{" "}
                              <span className="text-[#c9a227] hover:underline">Resend</span>
                            </>
                          )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: RESET PASSWORD */}
              {step === "reset" && (
                <form
                  onSubmit={handleReset}
                  className="space-y-4 lg:space-y-[1.8vh]"
                >
                  <div>
                    <label
                      htmlFor="newPassword"
                      className="
                        mb-2
                        block
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#122340]
                        lg:mb-[0.7vh]
                      "
                    >
                      New Password
                    </label>

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
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                        placeholder="Enter new password"
                        className="
                          h-[52px]
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
                          lg:h-[clamp(44px,6vh,54px)]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
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
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="
                        mb-2
                        block
                        text-[11px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#122340]
                        lg:mb-[0.7vh]
                      "
                    >
                      Confirm Password
                    </label>

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
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="new-password"
                        placeholder="Re-enter new password"
                        className="
                          h-[52px]
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
                          lg:h-[clamp(44px,6vh,54px)]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
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
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="
                      mt-2
                      flex
                      h-[52px]
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
                      lg:h-[clamp(44px,6vh,54px)]
                    "
                  >
                    {loading ? (
                      <>
                        <Loader2 size={19} className="animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        Reset Password
                        {/* <CheckCircle2 size={18} className="text-[#c9a227]" /> */}
                      </>
                    )}
                  </button>
                </form>
              )}

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