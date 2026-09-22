"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  XCircle,
  Award,
  CheckCircle2,
  ShieldAlert,
  DownloadCloud,
  ArrowLeft,
  Loader2,
  Image as ImageIcon,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Calendar,
  User,
  Shield,
} from "lucide-react";
import {
  certificateApi,
  VerifyResult,
  normalizeCertificateId,
} from "@/data/services/academy-service/certificate.service";
import toast from "react-hot-toast";

function formatCertificateFilename(
  studentName?: string,
  courseName?: string,
  ext: "pdf" | "png" = "pdf"
) {
  const sanitize = (str?: string) =>
    (str || "")
      .trim()
      .replace(/[\/\\:*?"<>|]/g, "")
      .replace(/\s+/g, "_");
  const student = sanitize(studentName || "Student");
  const course = sanitize(courseName || "Course");
  return `${student}_${course}.${ext}`;
}

interface CertificateVerifyClientProps {
  initialResult: VerifyResult | null;
  rawId: string;
}

export default function CertificateVerifyClient({
  initialResult,
  rawId,
}: CertificateVerifyClientProps) {
  const [result, setResult] = useState<VerifyResult | null>(initialResult);
  const [loading, setLoading] = useState(!initialResult);

  useEffect(() => {
    if (initialResult) {
      setResult(initialResult);
      setLoading(false);
      return;
    }
    if (!rawId) return;

    (async () => {
      try {
        const res = await certificateApi.verify(rawId);
        setResult(res);
      } catch {
        setResult({ status: "not_found" });
      } finally {
        setLoading(false);
      }
    })();
  }, [rawId, initialResult]);

  const displayId =
    normalizeCertificateId(decodeURIComponent(rawId || "")) ||
    decodeURIComponent(rawId || "").toUpperCase();

  return (
    <div className="h-[calc(100dvh-64px)] max-h-[calc(100dvh-64px)] w-full overflow-y-auto overflow-x-hidden flex flex-col justify-between bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] px-3 py-3 sm:px-6 sm:py-4">
      
      {/* Top Breadcrumb & Status Bar */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs py-1 shrink-0">
        <Link
          href="../../verify-certificate"
          className="font-bold text-[#122340]/70 hover:text-[#C9A227] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft size={14} /> Verify another certificate
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-slate-500 font-medium">
          <Shield size={13} className="text-[#C9A227]" />
          <span>Sajjad Husain Legal Academy Official Registry</span>
        </div>
      </div>

      {/* Main Content Area: Centered in remaining viewport space */}
      <div className="my-auto w-full py-2">
        {loading ? (
          <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 text-center text-slate-500 border border-slate-200">
            <Loader2 size={32} className="animate-spin text-[#C9A227] mx-auto mb-3" />
            <p className="font-bold text-sm text-[#122340]">Verifying Credential Authenticity</p>
            <p className="font-mono text-xs text-blue-600 font-bold mt-1">{displayId}</p>
          </div>
        ) : result?.status === "valid" && result.certificate ? (
          <SuccessCard cert={result.certificate} />
        ) : result?.status === "revoked" && result.certificate ? (
          <RevokedCard cert={result.certificate} />
        ) : (
          <NotFoundCard id={displayId} />
        )}
      </div>

      {/* Micro Institutional Footer Note */}
      <div className="w-full text-center text-[11px] text-slate-400 py-1 shrink-0 select-none">
        Official Digital Registry · Cryptographically Authenticated · Sajjad Husain Legal Academy
      </div>
    </div>
  );
}

function SuccessCard({ cert }: { cert: NonNullable<VerifyResult["certificate"]> }) {
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(cert.certificateId);
    setCopiedId(true);
    toast.success("Certificate ID copied");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      toast.success("Verification link copied");
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    const filename = formatCertificateFilename(cert.studentName, cert.courseName, "pdf");
    try {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.pdfUrl)}&filename=${encodeURIComponent(filename)}`;
      let res: Response;
      try {
        res = await fetch(cert.pdfUrl, { mode: "cors" });
        if (!res.ok) throw new Error("CORS or direct fetch failed");
      } catch {
        res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Certificate PDF downloaded");
    } catch {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.pdfUrl)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement("a");
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast("Starting PDF download...", { icon: "📥" });
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!cert.imageUrl || downloadingPng) return;
    setDownloadingPng(true);
    const filename = formatCertificateFilename(cert.studentName, cert.courseName, "png");
    try {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.imageUrl)}&filename=${encodeURIComponent(filename)}`;
      let res: Response;
      try {
        res = await fetch(cert.imageUrl, { mode: "cors" });
        if (!res.ok) throw new Error("CORS or direct fetch failed");
      } catch {
        res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success("Certificate image downloaded");
    } catch {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.imageUrl)}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement("a");
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast("Starting image download...", { icon: "📥" });
    } finally {
      setDownloadingPng(false);
    }
  };

  const formattedIssueDate = new Date(cert.issueDate).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        {/* Top Accent Strip with gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-[#C9A227] to-[#122340]" />

        <div className="p-4 sm:p-5 lg:p-7">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            
            {/* Left Column: Certificate Visual Replica & Download Controls (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#C9A227]/30 shadow-lg bg-slate-950/5 flex items-center justify-center">
                {cert.imageUrl ? (
                  <img
                    src={cert.imageUrl}
                    alt={`Certificate of Completion for ${cert.studentName}`}
                    className="w-full max-h-[320px] md:max-h-[360px] xl:max-h-[390px] object-contain block select-none"
                    loading="eager"
                  />
                ) : (
                  <div className="w-full h-[260px] bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col items-center justify-center p-6 text-center">
                    <Award size={44} className="text-[#C9A227] mb-2" />
                    <p className="font-serif font-bold text-base text-[#122340]">{cert.courseName}</p>
                    <p className="text-xs text-slate-500 mt-1">Certificate Preview</p>
                  </div>
                )}

                {/* View Full Size link */}
                {cert.imageUrl && (
                  <a
                    href={cert.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="absolute bottom-2.5 right-2.5 bg-white/95 hover:bg-white text-slate-800 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-md border border-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    View Full
                  </a>
                )}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-3.5 w-full">
                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="flex-1 min-w-[160px] inline-flex items-center justify-center gap-2 bg-[#122340] hover:bg-[#0a1628] text-white py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
                >
                  {downloadingPdf ? (
                    <Loader2 size={16} className="animate-spin text-[#C9A227]" />
                  ) : (
                    <DownloadCloud size={16} className="text-[#C9A227]" />
                  )}
                  Download Official PDF
                </button>

                {cert.imageUrl && (
                  <button
                    onClick={handleDownloadPng}
                    disabled={downloadingPng}
                    className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#122340] border border-slate-300 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                  >
                    {downloadingPng ? (
                      <Loader2 size={16} className="animate-spin text-[#122340]" />
                    ) : (
                      <ImageIcon size={16} className="text-[#C9A227]" />
                    )}
                    Download Image
                  </button>
                )}

                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  title="Share / Copy verification URL"
                >
                  {copiedLink ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
                  <span>{copiedLink ? "Copied" : "Share"}</span>
                </button>
              </div>
            </div>

            {/* Right Column: Verified Credential Details Dossier (5 cols on desktop) */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-3 sm:space-y-3.5">
              
              {/* Verified Status Tag */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold tracking-wide">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  Officially Verified Record
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Academic Registry
                </span>
              </div>

              {/* Credential ID Capsule */}
              <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Credential ID
                  </p>
                  <p className="font-mono font-black text-base sm:text-lg text-[#122340] tracking-wide mt-0.5">
                    {cert.certificateId}
                  </p>
                </div>
                <button
                  onClick={handleCopyId}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#122340] hover:border-slate-300 transition-all shadow-2xs cursor-pointer"
                  title="Copy Certificate ID"
                >
                  {copiedId ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>
              </div>

              {/* Recipient Name */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Issued To (Recipient)
                </p>
                <h2 className="font-serif font-black text-xl sm:text-2xl text-[#122340] leading-tight">
                  {cert.studentName}
                </h2>
              </div>

              {/* Academic Program */}
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Completed Academic Program
                </p>
                <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                  {cert.courseName}
                </p>
              </div>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1.5 border-t border-slate-100">
                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                    <Calendar size={11} className="text-[#C9A227]" /> Issue Date
                  </p>
                  <p className="font-bold text-xs sm:text-sm text-[#122340]">
                    {formattedIssueDate}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                    <User size={11} className="text-[#C9A227]" /> Instructor
                  </p>
                  <p className="font-bold text-xs sm:text-sm text-[#122340] truncate" title={cert.instructorName}>
                    {cert.instructorName || "Academy Faculty"}
                  </p>
                </div>
              </div>

              {/* Institutional Assurance */}
              <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-50/80 to-blue-50/80 border border-amber-200/50 flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <p className="text-[11px] text-slate-600 leading-tight">
                  Issued by <strong className="text-slate-800">{cert.platformName || "Sajjad Husain Legal Academy"}</strong>. Tamper-evident record backed by institutional digital signature.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function RevokedCard({ cert }: { cert: NonNullable<VerifyResult["certificate"]> }) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-red-500/20 overflow-hidden relative p-6 sm:p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4 border-2 border-red-100">
        <ShieldAlert size={36} className="text-red-500" />
      </div>
      <h3 className="text-2xl font-serif font-black text-[#122340] mb-1">Certificate Revoked</h3>
      <p className="font-mono font-bold text-red-600 text-sm mb-3">{cert.certificateId}</p>
      <p className="text-xs text-slate-600 max-w-sm mx-auto mb-4">
        This certificate was issued but has since been revoked by <strong>{cert.platformName || "the issuing academy"}</strong>.
      </p>
      {cert.revokedReason && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-left mb-5">
          <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-0.5">Reason</p>
          <p className="text-xs text-red-800">{cert.revokedReason}</p>
        </div>
      )}
      <Link
        href="../../verify-certificate"
        className="inline-flex items-center justify-center gap-2 bg-[#122340] hover:bg-[#0a1628] text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow-md"
      >
        <ArrowLeft size={14} /> Verify another certificate
      </Link>
    </div>
  );
}

function NotFoundCard({ id }: { id: string }) {
  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative p-6 sm:p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 border-2 border-amber-100">
        <XCircle size={36} className="text-amber-600" />
      </div>
      <h3 className="text-2xl font-serif font-black text-[#122340] mb-1">Certificate Not Found</h3>
      <p className="font-mono font-bold text-slate-700 text-sm mb-3">{id || "Invalid ID"}</p>
      <p className="text-xs text-slate-600 max-w-sm mx-auto mb-6">
        No issued certificate records match this credential ID in our digital registry. Please verify the code on your certificate and try again.
      </p>
      <Link
        href="../../verify-certificate"
        className="inline-flex items-center justify-center gap-2 bg-[#122340] hover:bg-[#0a1628] text-white py-2.5 px-6 rounded-xl text-xs font-bold transition-all shadow-md"
      >
        <ArrowLeft size={14} /> Back to Verification Search
      </Link>
    </div>
  );
}
