"use client";

import React, { useState } from 'react';
import { Search, ShieldCheck, XCircle, Award, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

// Mock Database of Valid Certificates
const VALID_CERTIFICATES: Record<string, any> = {
  "CERT-2026-0814": {
    studentName: "Sajjad Student",
    course: "Constitutional Law: Landmark Judgments Discussion",
    issueDate: "August 10, 2026",
    instructor: "Justice (Retd.) K. Singh",
    status: "Valid & Verified",
  },
  "CERT-2026-0001": {
    studentName: "John Doe",
    course: "Core Criminal Law Course Package (BNS, BNSS & BSA)",
    issueDate: "July 15, 2026",
    instructor: "Adv. Sajjad Husain",
    status: "Valid & Verified",
  }
};

export default function CertificateVerificationPage() {
  const [certId, setCertId] = useState("");
  const [isSearched, setIsSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setIsSearching(true);
    setIsSearched(false);

    // Simulate network delay
    setTimeout(() => {
      const formattedId = certId.trim().toUpperCase();
      const foundCert = VALID_CERTIFICATES[formattedId];
      
      setResult(foundCert || null);
      setIsSearched(true);
      setIsSearching(false);
    }, 800);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#fcfcfa] flex flex-col items-center py-20 px-6">
      
      {/* Header Section */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-16 h-16 bg-[#122340]/5 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldCheck size={32} className="text-[#122340]" />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#122340] mb-4 tracking-tight">Verify Certificate</h1>
        <p className="text-lg text-[#122340]/60">
          Enter a certificate ID to verify its authenticity and view the credential details.
        </p>
      </div>

      {/* Search Box */}
      <div className="w-full max-w-xl mx-auto mb-16">
        <form onSubmit={handleVerify} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search size={20} className="text-[#122340]/40 group-focus-within:text-[#C9A227] transition-colors" />
          </div>
          <input
            type="text"
            value={certId}
            onChange={(e) => setCertId(e.target.value)}
            placeholder="e.g. CERT-2026-0814"
            className="block w-full pl-12 pr-32 py-5 bg-white border-2 border-[#122340]/10 rounded-2xl text-[#122340] font-bold text-lg focus:ring-0 focus:border-[#C9A227] outline-none shadow-sm transition-all uppercase placeholder:normal-case placeholder:font-medium placeholder:text-[#122340]/30"
            required
          />
          <div className="absolute inset-y-2 right-2">
            <button
              type="submit"
              disabled={isSearching}
              className="h-full px-6 bg-[#122340] hover:bg-[#0a1628] text-white font-bold rounded-xl transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSearching ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              ) : (
                "Verify"
              )}
            </button>
          </div>
        </form>
        <p className="text-center text-sm text-[#122340]/40 mt-4 font-medium">Try searching for <button type="button" onClick={() => setCertId('CERT-2026-0814')} className="text-[#C9A227] hover:underline font-bold">CERT-2026-0814</button></p>
      </div>

      {/* Results Area */}
      {isSearched && (
        <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-bottom-4 fade-in duration-500">
          {result ? (
            // Success Card
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-green-500/20 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-green-600"></div>
              
              <div className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  
                  {/* Left: Icon & Badge */}
                  <div className="flex flex-col items-center gap-4 shrink-0 w-full md:w-auto">
                    <div className="w-24 h-24 rounded-full bg-green-50 flex items-center justify-center border-4 border-green-100 shadow-inner relative">
                      <Award size={40} className="text-green-600" />
                      <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                        <CheckCircle2 size={24} className="text-green-500 fill-green-100" />
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                      Verified
                    </span>
                  </div>

                  {/* Right: Details */}
                  <div className="flex-1 w-full space-y-6">
                    <div>
                      <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1">Credential ID</p>
                      <p className="font-mono font-bold text-lg text-[#122340]">{certId.toUpperCase()}</p>
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1">Recipient</p>
                      <p className="font-extrabold text-2xl text-[#122340]">{result.studentName}</p>
                    </div>

                    <div className="p-5 bg-[#fcfcfa] rounded-2xl border border-[#122340]/5">
                      <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-2">Completed Course</p>
                      <p className="font-bold text-[#122340] leading-snug">{result.course}</p>
                      
                      <div className="mt-4 pt-4 border-t border-[#122340]/5 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1">Issue Date</p>
                          <p className="font-bold text-[#122340] text-sm">{result.issueDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1">Instructor</p>
                          <p className="font-bold text-[#122340] text-sm">{result.instructor}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          ) : (
            // Error Card
            <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-red-500/20 overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-red-600"></div>
              
              <div className="p-8 md:p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
                  <XCircle size={40} className="text-red-500" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#122340] mb-2">Invalid Certificate ID</h3>
                <p className="text-[#122340]/60 max-w-sm mx-auto mb-8 font-medium">
                  We could not find any records matching the ID <strong>"{certId.toUpperCase()}"</strong>. Please check for typos and try again.
                </p>
                <button 
                  onClick={() => setCertId('')} 
                  className="px-8 py-3 bg-[#f0f2f5] hover:bg-[#122340]/5 text-[#122340] font-bold rounded-xl transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
