"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Lock, ArrowRight, CheckCircle2, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useAcademyLoginActions } from "@/data/features/academyAuth/useAcademyAuth";
import { useEffect } from "react";
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
              Master the<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A227] to-yellow-400">Legal Practice.</span>
            </h1>
            <p className="text-blue-100/70 text-lg mb-8 font-medium max-w-sm">
              Log in to continue your legal apprenticeship, access live sessions, and track your assignments.
            </p>

            <div className="space-y-4">
              {['Access to premium courses', 'Live Google Meet sessions', 'Practical legal assignments'].map((feature, i) => (
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

        {/* Right Side - Login Form */}
        <div className="w-full md:w-7/12 p-8 md:p-12 lg:p-16 flex flex-col justify-center relative bg-white">
          <div className="max-w-md w-full mx-auto">

            <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#122340]/50 hover:text-[#C9A227] transition-colors mb-10 group">
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
            </Link>

            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">Welcome Back</h2>
              <p className="text-[#122340]/60 font-medium text-sm">Please enter your details to login.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">

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
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
                    placeholder="student@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#122340] uppercase tracking-wider">Password</label>
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
                    disabled={loading}
                    className="w-full pl-11 pr-12 py-3.5 bg-[#f8f9fa] border border-[#122340]/10 rounded-xl outline-none focus:bg-white focus:border-[#C9A227]/50 focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340]"
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
                <div className="flex justify-end pt-1">
                  <Link href="/auth/forgot-password" className="text-xs font-bold text-[#122340]/60 hover:text-[#C9A227] transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#122340] text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(18,35,64,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(18,35,64,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group mt-8 disabled:opacity-70 disabled:hover:-translate-y-0"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Login"}
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
                  disabled={loading}
                  className="w-full bg-white border border-[#122340]/10 text-[#122340] py-3.5 rounded-xl font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
                >
                  <FcGoogle size={22} />
                  Continue with Google
                </button>
              </div>

            </form>

            <div className="mt-10 text-center">
              <p className="text-sm font-medium text-[#122340]/60">
                Don't have an account?{' '}
                <Link href="/auth/signup" className="font-extrabold text-[#122340] hover:text-[#C9A227] transition-colors underline underline-offset-4 decoration-[#C9A227]/30 hover:decoration-[#C9A227]">
                  Sign up now
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
