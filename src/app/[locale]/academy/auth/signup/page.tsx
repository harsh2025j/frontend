"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  Lock,
  CheckCircle2,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAcademyRegisterActions, useAcademyVerifyActions } from "@/data/features/academyAuth/useAcademyAuth";
import { useResendOtp } from "@/data/features/auth/useAuthActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { resetAuthState } from "@/data/features/auth/authSlice";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";

export default function AcademySignup() {
  const {
    formData,
    handleChange,
    handleRegister,
    handleGoogleLogin,
    loading: registerLoading,
    error: registerError,
    message: registerMessage,
    debugOtp,
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
                  Start your
                  <br />

                  <span className="text-[#c9a227]">
                    Legal Journey.
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
                  Create your student account in a few minutes — no
                  application fee, no waiting list, and access opens the
                  moment your email is verified.
                </p>

                {/* How it works */}
                <div className="mt-8 space-y-5 border-t border-white/10 pt-6 lg:mt-[3.5vh] lg:space-y-[2vh] lg:pt-[2.5vh]">
                  {[
                    {
                      step: "01",
                      title: "Create your account",
                      desc: "Name, email, phone and a password — that's it.",
                    },
                    {
                      step: "02",
                      title: "Verify your email",
                      desc: "Enter the 6-digit code we send you to confirm it's you.",
                    },
                    {
                      step: "03",
                      title: "Start learning",
                      desc: "Get instant access to courses and upcoming live sessions.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="flex gap-4">
                      <span className="mt-0.5 shrink-0 text-[13px] font-extrabold tracking-tight text-[#c9a227]">
                        {item.step}
                      </span>

                      <div>
                        <p className="text-[13px] font-semibold text-white/85">
                          {item.title}
                        </p>

                        <p className="mt-0.5 text-[12.5px] leading-snug text-white/45">
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
              <div>
                <p className="text-[12px] italic leading-snug text-white/40">
                  "I went from reading bare acts to drafting my first
                  contract in six weeks."
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
            RIGHT - SIGNUP
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
          <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 md:px-10 md:py-12 lg:px-12 lg:py-[2.2vh] xl:px-20">

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
                  lg:mb-[2.2vh]
                "
              >
                <ArrowLeft
                  size={16}
                  className="transition-transform group-hover:-translate-x-1"
                />

                Back to Home
              </Link>

              {/* Heading */}
              <div className="mb-8 lg:mb-[2.2vh]">

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

                {/* <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[#c9a227]">
                  Student Portal
                </p> */}

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
                  {step === "register" ? "Create Account" : "Check Your Email"}
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#122340]/50 lg:mt-[1vh]">
                  {step === "register"
                    ? "Join the Academy to advance your legal career."
                    : "We've sent a 6-digit verification code to your email."}
                </p>
              </div>

              {step === "register" && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRegister();
                  }}
                  className="space-y-3.5 lg:space-y-[1.3vh]"
                >

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="name"
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
                      Full Name
                    </label>

                    <div className="group relative">
                      <User
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
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        disabled={registerLoading}
                        autoComplete="name"
                        placeholder="Advocate Student"
                        className="
                          h-[46px]
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
                          lg:h-[clamp(40px,5.4vh,50px)]
                        "
                      />
                    </div>
                  </div>

                  {/* Email */}
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
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={registerLoading}
                        autoComplete="email"
                        placeholder="student@example.com"
                        className="
                          h-[46px]
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
                          lg:h-[clamp(40px,5.4vh,50px)]
                        "
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
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
                      Mobile Number
                    </label>

                    <div className="group relative">
                      <Phone
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
                        id="phone"
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        disabled={registerLoading}
                        autoComplete="tel"
                        placeholder="+91 98765 43210"
                        className="
                          h-[46px]
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
                          lg:h-[clamp(40px,5.4vh,50px)]
                        "
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
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
                      Password
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
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        disabled={registerLoading}
                        autoComplete="new-password"
                        placeholder="Enter your password"
                        className="
                          h-[46px]
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
                          lg:h-[clamp(40px,5.4vh,50px)]
                        "
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        disabled={registerLoading}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
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
                  </div>

                  {/* Create Account Button */}
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="
                      mt-2
                      flex
                      h-[46px]
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
                      lg:h-[clamp(40px,5.4vh,50px)]
                    "
                  >
                    {registerLoading ? (
                      <>
                        <Loader2 size={19} className="animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Student Account"
                    )}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 py-1.5 lg:py-[0.4vh]">
                    <div className="h-px flex-1 bg-[#122340]/10" />

                    <span
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.18em]
                        text-[#122340]/50
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
                    disabled={registerLoading}
                    className="
                      flex
                      h-[46px]
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
                      lg:h-[clamp(40px,5.4vh,50px)]
                    "
                  >
                    <FcGoogle size={20} />
                    Continue with Google
                  </button>
                </form>
              )}

              {step === "verify" && (
                <div>
                  {/* <div
                    className="
                      mb-6
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-2xl
                      border
                      border-[#122340]/10
                      bg-[#122340]/5
                      lg:mb-[2vh]
                    "
                  >
                    <Mail size={20} className="text-[#c9a227]" />
                  </div> */}

                  <form
                    onSubmit={onVerifySubmit}
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
                            const value = e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 1);
                            const chars = otp.split("");
                            chars[i] = value;
                            setOtp(chars.join(""));
                            if (value && i < 5) {
                              const nextInput =
                                document.querySelector<HTMLInputElement>(
                                  `input[data-index="${i + 1}"]`
                                );
                              nextInput?.focus();
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Backspace" && !otp[i] && i > 0) {
                              const prevInput =
                                document.querySelector<HTMLInputElement>(
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
                        disabled={
                          verifyLoading || resendLoading || otp.length < 6
                        }
                        className="
                          flex
                          h-[50px]
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
                        "
                      >
                        {verifyLoading ? (
                          <Loader2 size={19} className="animate-spin" />
                        ) : (
                          "Verify Code"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={handleResendWithTimer}
                        disabled={
                          resendLoading || verifyLoading || countdown > 0
                        }
                        className="
                          text-sm
                          font-semibold
                          text-[#122340]/70
                          transition
                          hover:text-[#c9a227]
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {resendLoading
                          ? "Sending..."
                          : countdown > 0
                          ? `Resend code in 0:${countdown
                              .toString()
                              .padStart(2, "0")}`
                          : (<>Didn't receive code? <span className="text-[#c9a227] hover:underline">Resend</span></>)}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Login link */}
              <div className="mt-8 text-center lg:mt-[2.2vh]">
                <p className="text-sm text-[#122340]/70">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
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
                    Login
                  </Link>
                </p>
              </div>

              {/* Small footer */}
              <p className="mt-8 text-center text-[10px] font-medium text-[#122340]/45 lg:mt-[1.8vh]">
                Secure access to Sajjad Husain Legal Academy
              </p>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}