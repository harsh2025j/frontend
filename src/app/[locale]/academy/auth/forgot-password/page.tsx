"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, CheckCircle2, ShieldCheck, KeyRound, Eye, EyeOff } from "lucide-react";
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5] p-4 md:p-8 font-sans relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#C9A227]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] flex flex-col md:flex-row overflow-hidden relative z-10 border border-[#122340]/5 animate-in fade-in zoom-in-95 duration-700">
        
        {/* Left Side - Branding */}
        <div className="w-full md:w-5/12 bg-gradient-to-br from-[#122340] to-[#0a1628] p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          {/* Decorative graphic */}
          <div className="absolute -right-20 -top-20 w-64 h-64 border-[30px] border-white/5 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 border-[20px] border-[#C9A227]/10 rounded-full"></div>
          
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
              Account<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-yellow-400">Recovery.</span>
            </h1>
            <p className="text-blue-100/70 text-lg mb-8 font-medium max-w-sm">
              Follow the secure process to regain access to your legal learning dashboard.
            </p>
            
            <div className="space-y-4">
              {['Secure OTP Verification', 'Instant Access Restoration', 'Protected Student Data'].map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <ShieldCheck size={18} className="text-[#C9A227]" />
                  <span className="text-sm font-semibold text-blue-50/80">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10">
            <p className="text-xs text-blue-100/40 font-semibold tracking-wider uppercase">© {new Date().getFullYear()} Sajjad Husain Law Associates</p>
          </div>
        </div>

        {/* Right Side - Forms */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
          
          {/* STEP 1: REQUEST OTP */}
          {step === "forgot" && (
            <div className="animate-in slide-in-from-right-8 duration-500 fade-in">
              <div className="mb-10">
                <h2 className="text-3xl font-extrabold text-[#122340] mb-3 tracking-tight">Forgot Password?</h2>
                <p className="text-[#122340]/60 font-medium">Please enter your registered student email address to receive a verification code.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-11 pr-4 py-3.5 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                      placeholder="student@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#122340] text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(18,35,64,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(18,35,64,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? "Sending..." : "Request OTP"}
                </button>
              </form>

              <div className="mt-8 text-center">
                <Link href="/auth/login" className="text-sm font-extrabold text-[#122340] hover:text-[#C9A227] transition-colors underline underline-offset-4 decoration-[#C9A227]/30 hover:decoration-[#C9A227]">
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === "verify" && (
            <div className="animate-in slide-in-from-right-8 duration-500 fade-in">
              <div className="mb-10">
                <div className="w-12 h-12 bg-[#122340]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#122340]/10">
                  <Mail size={24} className="text-[#C9A227]" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#122340] mb-3 tracking-tight">Check your email</h2>
                <p className="text-[#122340]/60 font-medium">We've sent a 6-digit verification code to <span className="font-bold text-[#122340]">{email}</span></p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-8">
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
                    className="w-full bg-[#C9A227] text-[#0a1628] py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(201,162,39,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(201,162,39,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:hover:translate-y-0"
                  >
                    {verifyLoading ? "Verifying..." : "Verify Code"}
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

          {/* STEP 3: RESET PASSWORD */}
          {step === "reset" && (
            <div className="animate-in slide-in-from-right-8 duration-500 fade-in">
              <div className="mb-10">
                <div className="w-12 h-12 bg-[#122340]/5 rounded-2xl flex items-center justify-center mb-6 border border-[#122340]/10">
                  <KeyRound size={24} className="text-[#C9A227]" />
                </div>
                <h2 className="text-3xl font-extrabold text-[#122340] mb-3 tracking-tight">Set New Password</h2>
                <p className="text-[#122340]/60 font-medium">Your new password must be different to previously used passwords.</p>
              </div>

              <form onSubmit={handleReset} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">New Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                    </div>
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3.5 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#122340]/40 hover:text-[#122340] transition-colors"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#122340] uppercase tracking-wider">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock size={18} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="w-full pl-11 pr-12 py-3.5 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#122340]/40 hover:text-[#122340] transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#122340] text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(18,35,64,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(18,35,64,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                  {!loading && <CheckCircle2 size={18} className="text-[#C9A227]" />}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
