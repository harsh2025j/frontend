"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2, User, Phone, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
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
    debugOtp
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
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C9A227]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-[#122340]/5 animate-in fade-in zoom-in-95 duration-700">

        {/* Left Side - Branding */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#122340] to-[#0a1628] p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Decorative graphic */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 border-[30px] border-white/5 rounded-full"></div>
          <div className="absolute -top-10 -left-10 w-40 h-40 border-[20px] border-[#C9A227]/10 rounded-full"></div>

          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20 shadow-lg backdrop-blur-sm group-hover:bg-white/20 transition-all">
                <span className="text-[#C9A227] font-black tracking-tighter">SA</span>
              </div>
              <span className="font-extrabold tracking-tight text-xl group-hover:text-white transition-colors text-white/90">Sajjad Husain Legal Academy</span>
            </Link>
          </div>

          <div className="relative z-10 my-16">
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
              Start your<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-yellow-400">Legal Journey.</span>
            </h1>
            <p className="text-blue-100/70 text-lg mb-8 font-medium max-w-sm">
              Register as a student to access premium apprenticeships, verifiable certificates, and expert guidance.
            </p>

            <div className="space-y-4">
              {[
                'Practical Apprenticeship Model',
                'Verifiable Certificates with QR Code',
                'Interactive Learning Dashboard'
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-[#C9A227]" />
                  <span className="text-sm font-semibold text-blue-50/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-xs text-blue-100/40 font-semibold tracking-wider uppercase">© {new Date().getFullYear()} Sajjad Husain Law Associates</p>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 flex flex-col justify-center relative bg-white overflow-y-auto max-h-[90vh]">
          <div className="max-w-md w-full mx-auto py-4">

            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#122340]/50 hover:text-[#C9A227] transition-colors mb-10 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>

            <div className="mb-8 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">Create Account</h2>
              <p className="text-[#122340]/60 font-medium text-sm">Join the Academy to advance your legal career.</p>
            </div>

            {step === "register" && (
              <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }} className="space-y-5 animate-in fade-in duration-500">

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={registerLoading}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                    placeholder="Advocate Student"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={registerLoading}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">Mobile Number</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={registerLoading}
                    className="w-full pl-11 pr-4 py-3 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={registerLoading}
                    className="w-full pl-11 pr-12 py-3 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#122340]/40 hover:text-[#122340] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* <p className="text-[10px] text-[#122340]/40 font-bold px-1 pt-1">Must be at least 8 characters</p> */}
              </div>

              <button
                type="submit"
                disabled={registerLoading}
                className="w-full bg-[#122340] text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(18,35,64,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(18,35,64,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:hover:-translate-y-0"
              >
                {registerLoading ? <Loader2 size={20} className="animate-spin" /> : "Create Student Account"}
              </button>

              <div className="mt-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-[#122340]/10"></div>
                  <span className="text-[#122340]/40 text-xs font-bold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-[#122340]/10"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={registerLoading}
                  className="w-full bg-white border border-[#122340]/10 text-[#122340] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  <FcGoogle size={22} />
                  Continue with Google
                </button>
              </div>

            </form>
            )}

            {step === "verify" && (
              <div className="animate-in slide-in-from-right-8 duration-500 fade-in">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-[#122340]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#122340]/10">
                    <Mail size={24} className="text-[#C9A227]" />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#122340] mb-3 tracking-tight">Check your email</h2>
                  <p className="text-[#122340]/60 font-medium text-sm">We've sent a 6-digit verification code to your email.</p>
                </div>

                <form onSubmit={onVerifySubmit} className="space-y-8">
                  <div className="flex justify-between gap-2 sm:gap-4">
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
                            const nextInput = document.querySelector<HTMLInputElement>(`input[data-index="${i + 1}"]`);
                            nextInput?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            const prevInput = document.querySelector<HTMLInputElement>(`input[data-index="${i - 1}"]`);
                            prevInput?.focus();
                          }
                        }}
                        data-index={i}
                        className="w-10 h-12 sm:w-12 sm:h-14 text-center bg-[#f8f9fa] border border-[#122340]/10 rounded-xl text-xl font-bold text-[#122340] outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all"
                      />
                    ))}
                  </div>

                  <div className="flex flex-col items-center gap-4">
                    <button
                      type="submit"
                      disabled={verifyLoading || resendLoading || otp.length < 6}
                      className="w-full bg-[#122340] text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(18,35,64,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(18,35,64,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {verifyLoading ? <Loader2 size={20} className="animate-spin" /> : "Verify Code"}
                    </button>

                    <button
                      type="button"
                      onClick={handleResendWithTimer}
                      disabled={resendLoading || verifyLoading || countdown > 0}
                      className="text-sm font-bold text-[#122340] hover:text-[#C9A227] transition-colors disabled:opacity-50"
                    >
                      {resendLoading ? "Sending..." : countdown > 0 ? `Resend code in 0:${countdown.toString().padStart(2, '0')}` : "Didn't receive code? Resend"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="mt-8 text-center">
              <p className="text-sm font-medium text-[#122340]/60">
                Already have an account?{' '}
                <Link href="/auth/login" className="font-extrabold text-[#122340] hover:text-[#C9A227] transition-colors underline underline-offset-4 decoration-[#C9A227]/30 hover:decoration-[#C9A227]">
                  Login
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
