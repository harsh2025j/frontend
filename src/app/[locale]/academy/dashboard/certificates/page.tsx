"use client";

import React, { useEffect, useState } from 'react';
import {
  DownloadCloud,
  Award,
  Share2,
  ShieldCheck,
  Copy,
  Loader2,
} from 'lucide-react';
import {
  certificateApi,
  Certificate,
} from '@/data/services/academy-service/certificate.service';
import {
  ShareCertificateModal,
  formatCertificateFilename,
} from './ShareCertificateModal';
import toast from 'react-hot-toast';

export default function CertificatesPage() {
  const [items, setItems] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareCert, setShareCert] = useState<Certificate | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await certificateApi.mine();
        setItems(((res?.data ?? res) as Certificate[]) || []);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load certificates');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="sa-rise space-y-5 sm:space-y-6">
      {/* ─── Header ─── */}
      <div className="sa-tile flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
            CREDENTIALS
          </span>
          <h1 className="font-serif text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-[#08172D] sm:text-[1.875rem]">
            My Certificates &amp; Credentials
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-600">
            Digitally verified completion certificates and credentials for your professional legal portfolio.
          </p>
        </div>
        {items.length > 0 && (
          <div className="shrink-0 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-800 shadow-2xs">
            <span className="font-serif text-lg font-black text-[#08172D]">
              {items.length}
            </span>{' '}
            issued
          </div>
        )}
      </div>

      {/* ─── Content ─── */}
      {loading ? (
        <div className="sa-bento">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="sa-tile sa-col-sm-6 sa-col-lg-6 !p-0 overflow-hidden"
            >
              <div className="h-56 w-full animate-pulse bg-[color:var(--sa-cream-2)]" />
              <div className="space-y-3 p-6">
                <div className="h-5 w-3/4 animate-pulse rounded bg-[color:var(--sa-cream-2)]" />
                <div className="h-4 w-1/2 animate-pulse rounded bg-[color:var(--sa-cream-2)]" />
                <div className="h-10 w-full animate-pulse rounded-xl bg-[color:var(--sa-cream-2)]" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="sa-tile sa-tile-pad-lg text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[color:var(--sa-gold-soft)] text-[color:var(--sa-gold-2)]">
            <Award size={28} />
          </span>
          <h3 className="mt-4 font-serif text-[1.25rem] font-bold text-[color:var(--sa-ink)]">
            No certificates yet
          </h3>
          <p className="sa-sub mx-auto mt-2 max-w-md">
            Complete your first course to unlock a digitally verified certificate
            of completion.
          </p>
        </div>
      ) : (
        <div className="sa-bento">
          {items.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              onShare={() => setShareCert(cert)}
            />
          ))}
        </div>
      )}

      {shareCert && (
        <ShareCertificateModal
          cert={shareCert}
          isOpen={!!shareCert}
          onClose={() => setShareCert(null)}
        />
      )}
    </div>
  );
}

function CertificateCard({
  cert,
  onShare,
}: {
  cert: Certificate;
  onShare: () => void;
}) {
  const [downloading, setDownloading] = useState(false);
  const verifyUrl = `${
    typeof window !== 'undefined' ? window.location.origin : ''
  }/certificates/verify/${cert.certificateId}`;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const filename = formatCertificateFilename(cert.studentName, cert.courseName, 'pdf');
    try {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(
        cert.pdfUrl,
      )}&filename=${encodeURIComponent(filename)}`;
      let res: Response;
      try {
        res = await fetch(cert.pdfUrl, { mode: 'cors' });
        if (!res.ok) throw new Error('Direct fetch failed');
      } catch {
        res = await fetch(proxyUrl);
        if (!res.ok) throw new Error(`Download failed (${res.status})`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(
        cert.pdfUrl,
      )}&filename=${encodeURIComponent(filename)}`;
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Starting PDF download...');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="sa-col-sm-6 sa-col-lg-6 !p-0 overflow-hidden flex flex-col rounded-2xl border-2 border-slate-200/90 hover:border-[#B7913A] bg-white shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative h-52 sm:h-64 overflow-hidden bg-gradient-to-br from-[#08172D] to-[#14233C]">
        <img
          src={cert.imageUrl || `/academy/certificates/image/${cert.certificateId}`}
          alt={cert.courseName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#08172D]/40 to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background:
              'linear-gradient(90deg, #8A6100, #F59E0B 48%, #8A6100)',
          }}
        />
      </div>

      <div className="p-5 sm:p-6 flex flex-col flex-grow">
        <h3 className="line-clamp-2 font-serif text-[1.125rem] sm:text-[1.2rem] font-bold tracking-tight text-[#08172D]">
          {cert.courseName}
        </h3>

        <div className="mt-4 flex flex-col xs:flex-row xs:items-start justify-between gap-2 xs:gap-4 rounded-xl border-2 border-slate-200 bg-slate-50 p-3.5 sm:p-4">
          <div>
            <p className="font-black text-[10px] uppercase tracking-wider text-slate-800">Issue date</p>
            <p className="mt-1 font-serif text-[13px] font-bold text-[#08172D]">
              {new Date(cert.issueDate).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-left xs:text-right">
            <p className="font-black text-[10px] uppercase tracking-wider text-slate-800">Credential ID</p>
            <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-bold text-[#08172D]">
              <ShieldCheck
                size={14}
                className="text-emerald-600"
              />
              {cert.certificateId}
            </p>
          </div>
        </div>

        <div className="mt-auto pt-5 flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="bg-[#08172D] hover:bg-[#040C18] text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-sm hover:shadow-md transition-all flex-1 min-w-[140px] disabled:opacity-70 cursor-pointer inline-flex items-center justify-center gap-2"
          >
            {downloading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Downloading
              </>
            ) : (
              <>
                <DownloadCloud size={15} /> Download PDF
              </>
            )}
          </button>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => {
                navigator.clipboard.writeText(verifyUrl);
                toast.success('Verify URL copied');
              }}
              className="border-2 border-slate-300 bg-white hover:bg-slate-50 text-slate-700 w-11 sm:w-12 shrink-0 rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              title="Copy verify URL"
              aria-label="Copy verify URL"
            >
              <Copy size={15} />
            </button>
            <button
              onClick={onShare}
              className="border-2 border-[#E8CD82] bg-[#FAF0D4] hover:bg-[#F5E6BF] text-[#8A6100] font-bold px-3 py-2 rounded-xl text-xs sm:text-sm cursor-pointer transition-colors inline-flex items-center gap-1.5"
              title="Share certificate"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
