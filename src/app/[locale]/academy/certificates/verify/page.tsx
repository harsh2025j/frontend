"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Award,
  FileCheck2,
  RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { normalizeCertificateId } from "@/data/services/academy-service/certificate.service";

interface ThreeBoxInputProps {
  onCompleteId: (fullId: string) => void;
  onEnterPress: () => void;
  initialValue?: string;
}

function ThreeBoxSegmentedInput({
  onCompleteId,
  onEnterPress,
  initialValue = "",
}: ThreeBoxInputProps) {
  const [part1, setPart1] = useState("");
  const [part2, setPart2] = useState("");
  const [part3, setPart3] = useState("");

  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const lastEmittedRef = useRef<string>(initialValue);

  // Helper to compose and emit ID upwards
  const emitChange = (p1: string, p2: string, p3: string) => {
    const c1 = p1.trim().toUpperCase();
    const c2 = p2.trim().toUpperCase();
    const c3 = p3.trim().toUpperCase();

    let fullId = "";
    if (c1 && !c2 && !c3) {
      fullId = c1;
    } else if (c1 && c2 && !c3) {
      fullId = `${c1}-${c2}`;
    } else if (c1 || c2 || c3) {
      fullId = `${c1}-${c2}-${c3}`;
    }

    lastEmittedRef.current = fullId;
    onCompleteId(fullId);
  };

  // Parse external value on mount or when parent truly changes (e.g. from URL param)
  useEffect(() => {
    if (!initialValue || initialValue === lastEmittedRef.current) return;
    lastEmittedRef.current = initialValue;

    let clean = initialValue.trim();
    if (clean.includes("/certificates/verify/")) {
      const parts = clean.split("/certificates/verify/");
      clean = parts[parts.length - 1];
    }
    clean = clean.split("?")[0].split("#")[0].trim().toUpperCase();

    if (clean.includes("-")) {
      const parts = clean.split("-").map((p) => p.replace(/[^A-Z0-9]/g, ""));
      setPart1((parts[0] || "").slice(0, 4));
      setPart2((parts[1] || "").slice(0, 3));
      setPart3((parts[2] || "").slice(0, 6));
    } else {
      const raw = clean.replace(/[^A-Z0-9]/g, "");
      setPart1(raw.slice(0, 4));
      setPart2(raw.slice(4, 7));
      setPart3(raw.slice(7, 13));
    }
  }, [initialValue]);

  // Handle paste in any of the 3 boxes
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text");
    if (!pasted) return;

    let clean = pasted.trim();
    if (clean.includes("/certificates/verify/")) {
      const parts = clean.split("/certificates/verify/");
      clean = parts[parts.length - 1];
    }
    clean = clean.split("?")[0].split("#")[0].trim().toUpperCase();

    let p1 = "";
    let p2 = "";
    let p3 = "";

    if (clean.includes("-")) {
      const parts = clean.split("-").map((p) => p.replace(/[^A-Z0-9]/g, ""));
      p1 = (parts[0] || "").slice(0, 4);
      p2 = (parts[1] || "").slice(0, 3);
      p3 = (parts[2] || "").slice(0, 6);
    } else {
      const raw = clean.replace(/[^A-Z0-9]/g, "");
      p1 = raw.slice(0, 4);
      p2 = raw.slice(4, 7);
      p3 = raw.slice(7, 13);
    }

    setPart1(p1);
    setPart2(p2);
    setPart3(p3);
    emitChange(p1, p2, p3);

    // Focus destination after paste
    if (p3.length > 0) {
      ref3.current?.focus();
    } else if (p2.length > 0) {
      ref2.current?.focus();
    } else if (p1.length === 4) {
      ref2.current?.focus();
    }
  };

  // Box 1 (Prefix: strictly 4 characters, e.g. SHLA)
  const handlePart1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    setPart1(raw);
    emitChange(raw, part2, part3);
    // Auto advance to box 2 when 4 characters entered
    if (raw.length === 4) {
      ref2.current?.focus();
    }
  };

  // Box 2 (Course Code: strictly 3 characters, e.g. TES)
  const handlePart2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 3);
    setPart2(raw);
    emitChange(part1, raw, part3);
    // Auto advance to box 3 when 3 characters entered
    if (raw.length === 3) {
      ref3.current?.focus();
    }
  };

  // Box 3 (Unique Code: strictly 6 characters, e.g. 9GDB4C)
  const handlePart3Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
    setPart3(raw);
    emitChange(part1, part2, raw);
  };

  // Keyboard navigation & auto-backspace between boxes
  const handleKeyDown1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnterPress();
    } else if (e.key === "-" || (e.key === "ArrowRight" && part1.length === 4)) {
      e.preventDefault();
      ref2.current?.focus();
    }
  };

  const handleKeyDown2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnterPress();
    } else if (e.key === "-" || (e.key === "ArrowRight" && part2.length >= 3)) {
      e.preventDefault();
      ref3.current?.focus();
    } else if (e.key === "Backspace" && part2 === "") {
      e.preventDefault();
      ref1.current?.focus();
    } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      ref1.current?.focus();
    }
  };

  const handleKeyDown3 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onEnterPress();
    } else if (e.key === "Backspace" && part3 === "") {
      e.preventDefault();
      ref2.current?.focus();
    } else if (e.key === "ArrowLeft" && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      ref2.current?.focus();
    }
  };

  const clearAll = () => {
    setPart1("");
    setPart2("");
    setPart3("");
    emitChange("", "", "");
    ref1.current?.focus();
  };

  const hasContent = Boolean(part1 || part2 || part3);
  const isComplete = part1.length === 4 && part2.length === 3 && part3.length === 6;
  const formattedDisplay = [part1, part2, part3].filter(Boolean).join("-");

  return (
    <div className="space-y-2">
      {/* 3-Box Segmented Inputs Container: [ SHLA (4) ] - [ TES (3) ] - [ 9GDB4C (6) ] */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 p-2 sm:p-3 rounded-xl bg-slate-50/80 border border-slate-200">

        {/* Box 1: Prefix (strictly 4 chars, e.g. SHLA) */}
        <div className="flex-1 max-w-[100px] sm:max-w-[120px]">
          <input
            ref={ref1}
            type="text"
            value={part1}
            onChange={handlePart1Change}
            onKeyDown={handleKeyDown1}
            onPaste={handlePaste}
            placeholder="SHLA"
            maxLength={4}
            className="w-full text-center py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl border-2 border-slate-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 focus:bg-white bg-white font-mono font-bold text-base sm:text-lg md:text-xl text-[#122340] placeholder:text-slate-300 tracking-wider uppercase transition-all outline-none"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
            autoFocus
          />
        </div>

        {/* Dash 1 */}
        <div className="flex items-center justify-center select-none text-slate-400 font-mono font-bold text-xl px-0.5">
          -
        </div>

        {/* Box 2: Course / Category Code (strictly 3 chars, e.g. TES) */}
        <div className="flex-1 max-w-[85px] sm:max-w-[105px]">
          <input
            ref={ref2}
            type="text"
            value={part2}
            onChange={handlePart2Change}
            onKeyDown={handleKeyDown2}
            onPaste={handlePaste}
            placeholder="TES"
            maxLength={3}
            className="w-full text-center py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl border-2 border-slate-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 focus:bg-white bg-white font-mono font-bold text-base sm:text-lg md:text-xl text-[#122340] placeholder:text-slate-300 tracking-wider uppercase transition-all outline-none"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>

        {/* Dash 2 */}
        <div className="flex items-center justify-center select-none text-slate-400 font-mono font-bold text-xl px-0.5">
          -
        </div>

        {/* Box 3: Unique Identifier (strictly 6 chars, e.g. 9GDB4C) */}
        <div className="flex-1 max-w-[125px] sm:max-w-[155px]">
          <input
            ref={ref3}
            type="text"
            value={part3}
            onChange={handlePart3Change}
            onKeyDown={handleKeyDown3}
            onPaste={handlePaste}
            placeholder="9GDB4C"
            maxLength={6}
            className="w-full text-center py-2 sm:py-2.5 px-1.5 sm:px-2 rounded-xl border-2 border-slate-200 focus:border-[#C9A227] focus:ring-2 focus:ring-[#C9A227]/20 focus:bg-white bg-white font-mono font-bold text-base sm:text-lg md:text-xl text-[#122340] placeholder:text-slate-300 tracking-wider uppercase transition-all outline-none"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Helper preview bar & reset button */}
      <div className="flex items-center justify-between text-xs px-1 text-slate-500">
        <div>
          {hasContent ? (
            <span className="font-mono text-[11px] font-bold text-slate-700">
              Certificate ID:{" "}
              <span className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                {formattedDisplay}
              </span>
            </span>
          ) : (
            <span className="text-slate-400 text-[11px]">
              Auto-formats with dashes as you type
            </span>
          )}
        </div>

        {hasContent && (
          <button
            type="button"
            onClick={clearAll}
            className="text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer transition-colors text-[11px]"
          >
            <RotateCcw size={11} /> Clear
          </button>
        )}
      </div>
    </div>
  );
}

function VerifyCertificateContent() {
  const [certId, setCertId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  useEffect(() => {
    const paramId = searchParams.get("id") || searchParams.get("certificateId");
    if (paramId && paramId.trim()) {
      const normalized = normalizeCertificateId(paramId);
      if (normalized) {
        setCertId(normalized);
        router.replace(`/certificates/verify/${encodeURIComponent(normalized)}`);
      }
    }
  }, [searchParams, router]);

  const handleVerify = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const normalized = normalizeCertificateId(certId);
    if (normalized && normalized.length === 15) {
      setIsSubmitting(true);
      router.push(`/certificates/verify/${encodeURIComponent(normalized)}`);
    }
  };

  const isIdComplete = certId.trim().length === 15 && certId.split("-").length === 3;

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col justify-center items-center bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] px-4 py-2 sm:py-3">
      
      {/* Micro top header */}
      <div className="w-full max-w-lg text-center mb-2 text-slate-400 text-[11px] font-semibold shrink-0 select-none">
        Sajjad Husain Legal Academy · Credential Verification
      </div>

      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-[#0a1628] via-[#122340] to-[#1e3a5f] px-5 py-3.5 sm:py-4 text-center text-white relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-16 -bottom-16 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="inline-flex items-center justify-center p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 mb-1.5 shadow-inner">
            <ShieldCheck size={24} className="text-[#C9A227]" />
          </div>

          <h1 className="text-lg sm:text-xl font-serif font-extrabold tracking-tight mb-0.5">
            Verify Certificate
          </h1>
          <p className="text-blue-100/75 text-xs max-w-sm mx-auto leading-relaxed">
            Enter the 15-character certificate ID to verify authenticity directly from academic records.
          </p>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-3">
          <form onSubmit={handleVerify} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Certificate ID
              </label>

              {/* 3-Box Segmented View: [ SHLA (4) ] - [ TES (3) ] - [ 9GDB4C (6) ] */}
              <ThreeBoxSegmentedInput
                onCompleteId={(val) => setCertId(val)}
                onEnterPress={handleVerify}
                initialValue={certId}
              />

              <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C9A227] shrink-0" />
                The Certificate ID is found at the bottom right of the document.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !isIdComplete}
              className="w-full bg-[#122340] hover:bg-[#0a1628] text-white py-2.5 sm:py-3 rounded-xl font-bold text-sm shadow hover:shadow-md active:translate-y-0 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{isSubmitting ? "Verifying Record…" : "Verify Certificate"}</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Value Props & Trust Badges */}
          <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-slate-800 truncate">Instant Check</h4>
                <p className="text-[9px] text-slate-500 truncate">Registry direct</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <Award size={15} className="text-[#C9A227] shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-slate-800 truncate">Tamper-Proof</h4>
                <p className="text-[9px] text-slate-500 truncate">15-char hash</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50/70 border border-slate-100">
              <FileCheck2 size={15} className="text-blue-600 shrink-0" />
              <div className="min-w-0">
                <h4 className="text-[10px] font-bold text-slate-800 truncate">Original PDF</h4>
                <p className="text-[9px] text-slate-500 truncate">Official replica</p>
              </div>
            </div>
          </div>

          <div className="text-center pt-0.5">
            <Link
              href={`/${locale}/courses`}
              className="text-[11px] font-bold text-slate-400 hover:text-[#C9A227] transition-colors"
            >
              ← Back to Academy Courses
            </Link>
          </div>
        </div>
      </div>

      {/* Micro Institutional Footer Note */}
      <div className="w-full text-center text-[10px] sm:text-[11px] text-slate-400 mt-2 shrink-0 select-none">
        Official Institutional Registry · Cryptographically Authenticated · Sajjad Husain Legal Academy
      </div>
    </div>
  );
}

export default function CertificateVerifyPortalPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center bg-[#f8fafc] text-slate-400">Loading verification portal…</div>}>
      <VerifyCertificateContent />
    </Suspense>
  );
}
