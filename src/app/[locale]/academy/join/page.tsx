"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/data/features/auth/useAuthActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { upgradeToStudentAsync } from "@/data/features/auth/authThunks";
import toast from "react-hot-toast";

export default function JoinAcademy() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  // If already a student, redirect to dashboard
  useEffect(() => {
    if (user?.roles?.some((r: any) => r.slug === "student" || r.name === "student")) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleBecomeStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await dispatch(upgradeToStudentAsync()).unwrap();
      toast.success("Welcome to SA Academy!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error || "Failed to activate student profile. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#122340] to-[#f0f2f5]"></div>
      
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] relative z-10 border border-[#122340]/5 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Side Info */}
          <div className="p-10 md:p-12 bg-gradient-to-br from-[#122340] to-[#0a1628] text-white flex flex-col justify-between">
            <div>
              <div className="w-16 h-16 rounded-2xl bg-[#C9A227]/20 border border-[#C9A227]/30 flex items-center justify-center mb-8 text-[#C9A227] shadow-inner">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-3xl font-extrabold mb-4 leading-tight tracking-tight">
                Unlock the <span className="text-[#C9A227]">Academy</span> Dashboard
              </h2>
              <p className="text-blue-100/70 font-medium text-sm leading-relaxed mb-8">
                You are currently logged in with your main LegalTech account. To access courses, apprenticeships, and live sessions, you need to activate your student profile.
              </p>

              <div className="space-y-5">
                {[
                  { title: "No Extra Cost", desc: "Activating your profile is completely free." },
                  { title: "Seamless Access", desc: "Use your existing login credentials." },
                  { title: "Verifiable Certifications", desc: "Earn QR-code verifiable legal certificates." }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="mt-1">
                      <CheckCircle2 size={18} className="text-[#C9A227]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-blue-100/50 mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Form Action */}
          <div className="p-10 md:p-12 flex flex-col justify-center">
            
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 text-green-600 border border-green-200 text-xs font-bold mb-6">
                <ShieldCheck size={14} /> Account Verified
              </div>
              <h3 className="text-2xl font-extrabold text-[#122340] mb-2 tracking-tight">Activate Student Profile</h3>
              <p className="text-[#122340]/60 text-sm font-medium">
                Confirm your details below to upgrade your account and enter the Academy Dashboard.
              </p>
            </div>

            <form onSubmit={handleBecomeStudent} className="space-y-6">
              
              <div className="p-5 rounded-2xl bg-[#f8f9fa] border border-[#122340]/10 space-y-4">
                <div className="flex justify-between items-center border-b border-[#122340]/5 pb-4">
                  <span className="text-xs font-bold text-[#122340]/40 uppercase tracking-wider">Name</span>
                  <span className="text-sm font-bold text-[#122340]">{user?.name || "Loading..."}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#122340]/40 uppercase tracking-wider">Email</span>
                  <span className="text-sm font-bold text-[#122340]">{user?.email || "Loading..."}</span>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" required className="mt-1 w-4 h-4 rounded border-gray-300 text-[#C9A227] focus:ring-[#C9A227]" />
                  <span className="text-xs font-semibold text-[#122340]/60 leading-relaxed group-hover:text-[#122340]/80 transition-colors">
                    I agree to the Academy's <Link href="#" className="text-[#C9A227] hover:underline">Terms of Service</Link> and <Link href="#" className="text-[#C9A227] hover:underline">Honor Code</Link> for student conduct.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#122340] text-white py-4 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(18,35,64,0.4)] hover:shadow-[0_12px_25px_-6px_rgba(18,35,64,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Activating Profile...
                  </span>
                ) : (
                  <>
                    Become a Student
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>

            <div className="mt-8 text-center">
              <Link href="/" className="text-xs font-bold text-[#122340]/40 hover:text-[#122340] transition-colors uppercase tracking-widest">
                Return to Main Site
              </Link>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
