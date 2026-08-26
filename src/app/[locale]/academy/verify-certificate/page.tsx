"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Search, ArrowRight, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyCertificatePage() {
  const [certId, setCertId] = useState("");
  const router = useRouter();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      router.push(`/certificates/verify/${certId.trim()}`);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f0f2f5] p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-[#122340] p-10 text-center text-white relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <ShieldCheck size={48} className="mx-auto mb-4 text-[#C9A227]" />
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Verify Certificate</h1>
          <p className="text-blue-100/70 text-sm">
            Enter the unique certificate ID to verify its authenticity and details.
          </p>
        </div>

        <div className="p-10">
          <form onSubmit={handleVerify} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-[#122340] mb-2 uppercase tracking-wide">
                Certificate ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={certId}
                  onChange={(e) => setCertId(e.target.value)}
                  placeholder="e.g. CERT-2026-0814"
                  className="w-full pl-11 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-gray-800 placeholder:font-normal outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227]"></span>
                The Certificate ID can be found at the bottom right of the document.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#122340] hover:bg-[#0a1628] text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
            >
              Verify Now
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <Link href="/" className="text-sm font-bold text-[#122340]/50 hover:text-[#C9A227] transition-colors">
                Back to Academy Home
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
