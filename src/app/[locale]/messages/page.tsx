"use client";

import React, { useEffect, useState } from "react";
import ChatWorkspace from "@/components/chat/ChatWorkspace";
import { useRouter } from "@/i18n/routing";
import { Lock, User } from "lucide-react";

export default function UserMessagesPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="h-[calc(100vh-120px)] bg-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <span className="animate-spin rounded-full h-8 w-8 border-4 border-[#0A2342] border-t-transparent"></span>
          <p className="text-stone-500 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return (
      <div className="h-[calc(100vh-120px)] bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 lg:p-20 border border-gray-100 shadow-2xl shadow-[#0A2342]/5 rounded-[32px] text-center max-w-2xl w-full mx-auto">
          <div className="w-20 h-20 bg-[#C9A227]/10 text-[#C9A227] rounded-[24px] flex items-center justify-center mb-8 mx-auto border border-[#C9A227]/20">
              <Lock size={32} strokeWidth={1.5} />
          </div>

          <h3 className="text-4xl md:text-5xl font-serif text-[#0A2342] mb-6 tracking-tight">Access Restricted</h3>
          <p className="text-gray-500 mb-12 text-lg leading-relaxed font-medium">
              To ensure client-attorney privilege and protect sensitive information, please authenticate your profile before accessing messages.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button
                  onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`)}
                  className="px-10 py-5 bg-[#0A2342] text-white rounded-2xl shadow-xl shadow-[#0A2342]/10 text-[11px] font-black uppercase tracking-widest hover:bg-[#153a66] transition-all flex items-center justify-center gap-3"
              >
                  <User size={16} />
                  Continue to Login
              </button>

              <button
                  onClick={() => router.push(`/auth/signup?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`)}
                  className="px-10 py-5 bg-[#C9A227] text-white rounded-2xl shadow-xl shadow-[#C9A227]/10 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
              >
                  Create New Profile
              </button>
          </div>

          <p className="mt-16 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Secure & Confidential Messaging Environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] bg-stone-100 flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 flex-1 max-w-[1400px] w-full mx-auto flex flex-col min-h-0">
        <h1 className="text-xl md:text-2xl font-black text-[#0A2342] uppercase tracking-widest mb-4 shrink-0">
          My Messages
        </h1>
        <div className="flex-1 min-h-0 w-full relative">
          <ChatWorkspace role="user" />
        </div>
      </div>
    </div>
  );
}
