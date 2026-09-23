"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { DownloadCloud, Award, Share2, ShieldCheck, Copy, Loader2 } from 'lucide-react';
import { certificateApi, Certificate } from '@/data/services/academy-service/certificate.service';
import { ShareCertificateModal, formatCertificateFilename } from './ShareCertificateModal';
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
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#122340] mb-2 tracking-tight">My Credentials</h1>
          <p className="text-[#122340]/60">Verified completion certificates for your resume and LinkedIn.</p>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-gray-400 text-sm">Loading…</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#122340]/5 rounded-3xl p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-24 h-24 bg-[#f0f2f5] rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border border-[#122340]/5">
            <Award size={40} className="text-[#122340]/20" />
          </div>
          <h3 className="text-xl font-extrabold text-[#122340] mb-3">No certificates yet</h3>
          <p className="text-[#122340]/50 max-w-md mx-auto font-medium">
            Complete your first course to unlock a digitally verified certificate of completion.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {items.map((cert) => (
            <CertificateCard
              key={cert.id}
              cert={cert}
              onShare={() => setShareCert(cert)}
            />
          ))}
        </div>
      )}

      {/* Social Share & Export Modal */}
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
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/certificates/verify/${cert.certificateId}`;

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    const filename = formatCertificateFilename(cert.studentName, cert.courseName, 'pdf');
    try {
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.pdfUrl)}&filename=${encodeURIComponent(filename)}`;
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
      const proxyUrl = `/api/academy/download?url=${encodeURIComponent(cert.pdfUrl)}&filename=${encodeURIComponent(filename)}`;
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
    <div>
      <div className="bg-white rounded-xl overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-[#122340]/5">
        {/* Certificate image preview (strictly images on web, never heavy PDF iframe) */}
        <div className="h-72 relative bg-gradient-to-br from-[#0a1628] to-[#1a2f4d] border-b-4 border-[#C9A227] overflow-hidden">
          <img
            src={cert.imageUrl || `/academy/certificates/image/${cert.certificateId}`}
            alt={cert.courseName}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        </div>

        <div className="p-8">
          <p className="font-extrabold text-[#122340] text-lg mb-1 truncate">{cert.courseName}</p>
          <div className="flex justify-between items-start mb-6 mt-4 bg-[#fcfcfa] p-4 rounded-xl border border-[#122340]/5">
            <div>
              <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1.5">Issue Date</p>
              <p className="font-extrabold text-[#122340] text-sm">
                {new Date(cert.issueDate).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-[#122340]/40 uppercase tracking-widest mb-1.5">Credential ID</p>
              <p className="font-mono font-extrabold text-[#122340] text-sm flex items-center justify-end gap-1.5">
                <ShieldCheck size={14} className="text-green-500" />
                {cert.certificateId}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 bg-[#122340] text-white py-3.5 rounded-xl font-bold hover:bg-[#0a1628] transition-colors text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {downloading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-[#C9A227]" /> Downloading...
                </>
              ) : (
                <>
                  <DownloadCloud size={18} /> Download PDF
                </>
              )}
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(verifyUrl);
                toast.success('Verify URL copied');
              }}
              className="w-14 shrink-0 border border-[#122340]/10 text-[#122340] rounded-xl flex items-center justify-center hover:bg-[#122340]/5 cursor-pointer transition-colors"
              title="Copy verify URL"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={onShare}
              className="px-4 border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#122340] rounded-xl flex items-center justify-center gap-1.5 hover:bg-[#C9A227]/20 cursor-pointer transition-colors text-sm font-bold"
              title="Share Certificate"
            >
              <Share2 size={17} className="text-[#C9A227]" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
