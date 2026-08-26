"use client";

import React from 'react';
import { DownloadCloud, Award, Share2, Eye, ShieldCheck } from 'lucide-react';

const CERTIFICATES = [
  {
    id: "CERT-2026-0814",
    course: "Constitutional Law: Landmark Judgments Discussion",
    dateEarned: "August 10, 2026",
    instructor: "Justice (Retd.) K. Singh",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop" // Abstract texture
  }
];

export default function CertificatesPage() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700 ease-out">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">My Credentials</h1>
          <p className="text-[#122340]/60">Verified completion certificates for your resume and LinkedIn.</p>
        </div>
      </div>

      {CERTIFICATES.length === 0 ? (
        <div className="bg-white border border-[#122340]/5 rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-24 h-24 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#122340]/5">
            <Award size={40} className="text-[#122340]/20" />
          </div>
          <h3 className="text-xl font-extrabold text-[#122340] mb-3">No certificates yet</h3>
          <p className="text-[#122340]/50 max-w-md mx-auto font-medium">
            Complete your first course to unlock a digitally verified certificate of completion from Sajjad Husain Legal Academy.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {CERTIFICATES.map((cert) => (
            <div key={cert.id} className="group perspective-1000">
              
              {/* Certificate Card (3D hover effect container) */}
              <div className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-[#122340]/5 transition-transform duration-500 ease-out group-hover:-translate-y-2 group-hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)]">
                
                {/* Visual Preview Banner */}
                <div className="h-72 relative bg-gradient-to-br from-[#0a1628] to-[#1a2f4d] p-8 flex flex-col items-center justify-center text-center overflow-hidden border-b-4 border-[#C9A227]">
                  <div className="absolute inset-0 opacity-10 mix-blend-overlay">
                    <img src={cert.image} className="w-full h-full object-cover" alt="texture" />
                  </div>
                  
                  {/* Glowing effect behind badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#C9A227]/20 blur-3xl rounded-full"></div>
                  
                  <div className="relative z-10 w-full border border-[#C9A227]/40 p-6 h-full flex flex-col items-center justify-center bg-black/10 backdrop-blur-sm shadow-2xl">
                    <div className="mb-4">
                      <Award size={48} className="text-[#C9A227] drop-shadow-lg" />
                    </div>
                    <h4 className="text-blue-100/70 font-serif italic text-xs tracking-[0.2em] uppercase mb-3">Certificate of Completion</h4>
                    <h2 className="text-white font-extrabold text-xl leading-tight mb-4 max-w-[90%] drop-shadow-md">{cert.course}</h2>
                    <p className="text-[#C9A227] text-xs font-bold tracking-widest uppercase">Student User</p>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="p-8">
                  <div className="flex justify-between items-start mb-8 bg-[#fcfcfa] p-4 rounded-xl border border-[#122340]/5">
                    <div>
                      <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1.5">Issue Date</p>
                      <p className="font-extrabold text-[#122340] text-sm">{cert.dateEarned}</p>
                    </div>
                    <div className="w-px bg-[#122340]/10"></div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1.5">Credential ID</p>
                      <p className="font-extrabold text-[#122340] text-sm flex items-center justify-end gap-1.5">
                        <ShieldCheck size={14} className="text-green-500" />
                        {cert.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button className="flex-1 bg-[#122340] text-white py-3.5 rounded-xl font-bold shadow-[0_4px_14px_0_rgb(18,35,64,0.39)] hover:shadow-[0_6px_20px_rgba(18,35,64,0.23)] hover:-translate-y-0.5 transition-all duration-200 text-sm flex items-center justify-center gap-2">
                      <DownloadCloud size={18} /> Download
                    </button>
                    <button className="w-14 shrink-0 border border-[#122340]/10 text-[#122340] rounded-xl flex items-center justify-center hover:bg-[#122340]/5 transition-colors group/btn" title="View Full Screen">
                      <Eye size={20} className="text-[#122340]/60 group-hover/btn:text-[#122340] transition-colors" />
                    </button>
                    <button className="w-14 shrink-0 border border-[#C9A227]/30 text-[#C9A227] rounded-xl flex items-center justify-center hover:bg-[#C9A227]/10 transition-colors group/btn" title="Share to LinkedIn">
                      <Share2 size={20} className="text-[#C9A227]/80 group-hover/btn:text-[#C9A227] transition-colors" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
