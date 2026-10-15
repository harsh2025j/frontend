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
          <p className="sa-runhead">Credentials</p>
          <h1 className="font-serif text-[1.625rem] font-bold leading-tight tracking-[-0.015em] text-[color:var(--sa-ink)] sm:text-[1.875rem]">
            My certificates
          </h1>
          <p className="mt-1.5 text-[13px] text-[color:var(--sa-ink-3)]">
            Verified completion certificates for your resume and LinkedIn.
          </p>
        </div>
        {items.length > 0 && (
          <div className="shrink-0 rounded-full border border-[rgba(11,18,32,0.08)] bg-[color:var(--sa-cream)] px-4 py-2 text-[12px] font-semibold text-[color:var(--sa-ink-2)]">
            <span className="font-serif text-[18px] font-bold text-[color:var(--sa-ink)]">
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
      toast('Starting PDF download...', { icon: '📥' });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <article className="sa-tile sa-tile-hover sa-col-sm-6 sa-col-lg-6 !p-0 overflow-hidden">
      <div className="relative h-52 sm:h-64 overflow-hidden bg-gradient-to-br from-[color:var(--sa-navy-ink)] to-[color:var(--sa-navy-2)]">
        <img
          src={cert.imageUrl || `/academy/certificates/image/${cert.certificateId}`}
          alt={cert.courseName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[rgba(11,18,32,0.3)] to-transparent"
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-[3px]"
          style={{
            background:
              'linear-gradient(90deg, var(--sa-gold-3), var(--sa-gold-1) 48%, var(--sa-gold-3))',
          }}
        />
      </div>

      <div className="p-4 sm:p-6">
        <h3 className="line-clamp-1 font-serif text-[1.0625rem] font-bold tracking-[-0.005em] text-[color:var(--sa-ink)]">
          {cert.courseName}
        </h3>

        <div className="mt-3.5 sm:mt-4 flex flex-col xs:flex-row xs:items-start justify-between gap-2 xs:gap-4 rounded-xl border border-[rgba(11,18,32,0.06)] bg-[color:var(--sa-cream)] px-3.5 sm:px-4 py-2.5 sm:py-3">
          <div>
            <p className="sa-label !text-[10px]">Issue date</p>
            <p className="mt-0.5 sm:mt-1 font-serif text-[13px] font-bold text-[color:var(--sa-ink)]">
              {new Date(cert.issueDate).toLocaleDateString(undefined, {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="text-left xs:text-right">
            <p className="sa-label !text-[10px]">Credential ID</p>
            <p className="mt-0.5 sm:mt-1 inline-flex items-center gap-1.5 font-mono text-[12.5px] font-bold text-[color:var(--sa-ink)]">
              <ShieldCheck
                size={13}
                className="text-[color:var(--sa-sage-2)]"
              />
              {cert.certificateId}
            </p>
          </div>
        </div>

        <div className="mt-4 sm:mt-5 flex flex-wrap gap-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="sa-btn sa-btn-primary flex-1 min-w-[140px] disabled:opacity-70 cursor-pointer"
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
              className="sa-btn sa-btn-ghost w-11 sm:w-12 shrink-0 !px-0 cursor-pointer"
              title="Copy verify URL"
              aria-label="Copy verify URL"
            >
              <Copy size={15} />
            </button>
            <button
              onClick={onShare}
              className="sa-btn sa-btn-ghost shrink-0 !border-[color:var(--sa-gold-line)] !bg-[color:var(--sa-gold-soft)] !text-[color:var(--sa-gold-3)] cursor-pointer"
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
