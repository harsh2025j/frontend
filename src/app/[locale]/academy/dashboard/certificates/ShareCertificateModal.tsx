"use client";

import React, { useState, useEffect } from 'react';
import {
  X,
  DownloadCloud,
  Copy,
  Check,
  Share2,
  ExternalLink,
  Loader2,
  ShieldCheck,
  Image as ImageIcon,
  Mail,
  Award,
  Sparkles,
} from 'lucide-react';
import { Certificate, certificateApi } from '@/data/services/academy-service/certificate.service';
import toast from 'react-hot-toast';

export function formatCertificateFilename(
  studentName?: string,
  courseName?: string,
  ext: 'pdf' | 'png' = 'pdf',
) {
  const sanitize = (str?: string) =>
    (str || '')
      .trim()
      .replace(/[\/\\:*?"<>|]/g, '')
      .replace(/\s+/g, '_');
  const student = sanitize(studentName || 'Student');
  const course = sanitize(courseName || 'Course');
  return `${student}_${course}.${ext}`;
}

interface ShareCertificateModalProps {
  cert: Certificate;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareCertificateModal({ cert, isOpen, onClose }: ShareCertificateModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(cert.imageUrl || null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingImage, setDownloadingImage] = useState(false);
  const [copyingLink, setCopiedLink] = useState(false);
  const [copyingImage, setCopyingImage] = useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const verifyUrl = `${origin}/academy/certificates/verify/${cert.certificateId}`;

  // Fetch or generate image URL if not already present on the certificate
  useEffect(() => {
    if (!isOpen) return;
    if (!imageUrl && !cert.imageUrl) {
      setLoadingImage(true);
      certificateApi
        .getImageUrl(cert.certificateId)
        .then((res) => {
          if (res?.imageUrl) {
            setImageUrl(res.imageUrl);
          }
        })
        .catch((err) => {
          console.warn('Could not lazily fetch certificate image:', err);
        })
        .finally(() => {
          setLoadingImage(false);
        });
    } else if (cert.imageUrl && !imageUrl) {
      setImageUrl(cert.imageUrl);
    }
  }, [isOpen, cert.certificateId, cert.imageUrl, imageUrl]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Download handlers
  const handleDownloadPdf = async () => {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    const filename = formatCertificateFilename(cert.studentName, cert.courseName, 'pdf');
    try {
      const res = await fetch(cert.pdfUrl);
      if (!res.ok) throw new Error('Failed to fetch certificate PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate PDF downloaded');
    } catch (err) {
      console.error('PDF download error:', err);
      const a = document.createElement('a');
      a.href = cert.pdfUrl;
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleDownloadImage = async () => {
    if (downloadingImage) return;
    setDownloadingImage(true);
    const filename = formatCertificateFilename(cert.studentName, cert.courseName, 'png');

    try {
      let targetImg = imageUrl;
      if (!targetImg) {
        const res = await certificateApi.getImageUrl(cert.certificateId);
        targetImg = res?.imageUrl;
        if (targetImg) setImageUrl(targetImg);
      }

      if (!targetImg) throw new Error('Image URL is not available');

      const res = await fetch(targetImg);
      if (!res.ok) throw new Error('Failed to download image file');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Certificate image downloaded');
    } catch (err: any) {
      console.error('Image download error:', err);
      toast.error(err?.message || 'Could not download certificate image');
    } finally {
      setDownloadingImage(false);
    }
  };

  const handleCopyImageToClipboard = async () => {
    if (copyingImage) return;
    setCopyingImage(true);
    try {
      let targetImg = imageUrl;
      if (!targetImg) {
        const res = await certificateApi.getImageUrl(cert.certificateId);
        targetImg = res?.imageUrl;
        if (targetImg) setImageUrl(targetImg);
      }

      if (!targetImg) throw new Error('Image not available');

      const response = await fetch(targetImg);
      const blob = await response.blob();

      // Ensure blob is image/png
      const pngBlob = blob.type === 'image/png' ? blob : new Blob([blob], { type: 'image/png' });

      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'image/png': pngBlob,
          }),
        ]);
        toast.success('Certificate image copied to clipboard! You can paste (Ctrl+V) directly into WhatsApp or LinkedIn.');
      } else {
        throw new Error('Clipboard image copy not supported in this browser');
      }
    } catch (err: any) {
      console.warn('Clipboard copy error, downloading image instead:', err);
      toast('Could not copy directly to clipboard. Downloading image instead...');
      await handleDownloadImage();
    } finally {
      setCopyingImage(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verifyUrl);
    setCopiedLink(true);
    toast.success('Verification URL copied to clipboard');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Social sharing links
  const shareMessage = `I'm proud to share that I have successfully completed "${cert.courseName}" and earned my verified Certificate of Completion from Sajjad Husain Legal Academy! Check out my official credential:`;
  const linkedInPostUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`;
  const linkedInProfileUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(cert.courseName)}&organizationName=${encodeURIComponent('Sajjad Husain Legal Academy')}&issueYear=${new Date(cert.issueDate).getFullYear()}&issueMonth=${new Date(cert.issueDate).getMonth() + 1}&certUrl=${encodeURIComponent(cert.pdfUrl)}&certId=${encodeURIComponent(cert.certificateId)}`;
  const whatsAppUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareMessage} ${verifyUrl}`)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Proud to earn my Certificate of Completion in "${cert.courseName}" from Sajjad Husain Legal Academy! 🎓`)}&url=${encodeURIComponent(verifyUrl)}`;
  const emailUrl = `mailto:?subject=${encodeURIComponent(`Verified Certificate of Completion - ${cert.courseName}`)}&body=${encodeURIComponent(`Hello,\n\nI am delighted to share that I have earned my verified Certificate of Completion for "${cert.courseName}" from Sajjad Husain Legal Academy.\n\nYou can view and verify my official credential here:\n${verifyUrl}\n\nRecipient: ${cert.studentName}\nCertificate ID: ${cert.certificateId}\nIssue Date: ${new Date(cert.issueDate).toLocaleDateString()}\n\nBest regards,\n${cert.studentName}`)}`;

  const openPopup = (url: string) => {
    const w = 650;
    const h = 600;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;
    window.open(url, '_blank', `width=${w},height=${h},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`);
  };

  const handleDeviceShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${cert.courseName} - Certificate of Completion`,
          text: shareMessage,
          url: verifyUrl,
        });
      } catch (e) {
        // User cancelled or share failed
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-[#122340]/10 flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#fcfcfa]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#122340] text-[#C9A227] flex items-center justify-center shadow-sm">
              <Share2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#122340]">Share Your Achievement</h2>
              <p className="text-xs text-[#122340]/60 font-medium">
                Showcase your verified credential across professional networks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-[#122340] hover:bg-gray-200 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Certificate Preview Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-[#0a1628] to-[#1a2f4d] p-4 text-white border-2 border-[#C9A227]/40 shadow-inner overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Thumbnail */}
              <div className="w-full sm:w-48 h-32 rounded-xl bg-black/40 border border-white/10 overflow-hidden flex items-center justify-center shrink-0 relative">
                {imageUrl || cert.imageUrl ? (
                  <img
                    src={imageUrl || cert.imageUrl || `/academy/certificates/image/${cert.certificateId}`}
                    alt="Certificate preview"
                    className="w-full h-full object-cover"
                  />
                ) : loadingImage ? (
                  <div className="flex flex-col items-center gap-1.5 text-xs text-[#C9A227]">
                    <Loader2 size={22} className="animate-spin" />
                    <span>Rendering preview...</span>
                  </div>
                ) : (
                  <img
                    src={`/academy/certificates/image/${cert.certificateId}`}
                    alt="Certificate preview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                )}
                <div className="absolute top-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-[#C9A227] flex items-center gap-1 backdrop-blur-xs">
                  <ShieldCheck size={11} className="text-green-400" />
                  Verified
                </div>
              </div>

              {/* Text Info */}
              <div className="flex-1 text-left space-y-1 w-full">
                <div className="flex items-center gap-1.5 text-[11px] text-[#C9A227] font-bold uppercase tracking-wider">
                  <Award size={13} />
                  Certificate of Completion
                </div>
                <h3 className="font-extrabold text-base line-clamp-2 text-white leading-tight">
                  {cert.courseName}
                </h3>
                <p className="text-xs text-white/70">
                  Issued to <strong className="text-white">{cert.studentName}</strong>
                </p>
                <p className="text-[11px] font-mono text-white/50 pt-1">
                  ID: {cert.certificateId}
                </p>
              </div>
            </div>
          </div>

          {/* Social Platform Share Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#122340]/60 uppercase tracking-wider">
                Share to Social Platforms
              </span>
              <span className="text-[11px] text-gray-400">Posts with certificate card</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* LinkedIn Post */}
              <button
                onClick={() => openPopup(linkedInPostUrl)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-gray-200 hover:border-[#0A66C2] hover:bg-[#0A66C2]/5 transition-all text-center group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.64 1.64 0 1 0 0 3.28 1.64 1.64 0 0 0 0-3.28Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#122340]">LinkedIn</p>
                  <p className="text-[10px] text-gray-500 font-medium">Share as post</p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                onClick={() => openPopup(whatsAppUrl)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-gray-200 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all text-center group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.44-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.05 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#122340]">WhatsApp</p>
                  <p className="text-[10px] text-gray-500 font-medium">Direct message</p>
                </div>
              </button>

              {/* X / Twitter */}
              <button
                onClick={() => openPopup(twitterUrl)}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-gray-200 hover:border-black hover:bg-black/5 transition-all text-center group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-black text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#122340]">X / Twitter</p>
                  <p className="text-[10px] text-gray-500 font-medium">Tweet credential</p>
                </div>
              </button>

              {/* Email */}
              <a
                href={emailUrl}
                className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50/50 transition-all text-center group cursor-pointer"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[#122340]">Email</p>
                  <p className="text-[10px] text-gray-500 font-medium">Send by email</p>
                </div>
              </a>
            </div>
          </div>

          {/* Add to LinkedIn Profile banner */}
          <div className="bg-[#f0f4f9] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 border border-[#0A66C2]/20">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#0A66C2] text-white flex items-center justify-center shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#122340]">Add to LinkedIn Profile</p>
                <p className="text-[11px] text-[#122340]/60">
                  Feature this under Licenses & Certifications on your profile
                </p>
              </div>
            </div>
            <a
              href={linkedInProfileUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-[#0A66C2] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#084e96] transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              Add Credential <ExternalLink size={13} />
            </a>
          </div>

          {/* Downloads Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[#122340]/60 uppercase tracking-wider">
                Download & Copy Files
              </span>
              <span className="text-[11px] text-gray-400 font-mono">
                {formatCertificateFilename(cert.studentName, cert.courseName, 'pdf')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Download PDF */}
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#122340] text-white text-xs font-bold hover:bg-[#0a1628] transition-colors cursor-pointer disabled:opacity-60 shadow-sm"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#C9A227]" />
                    Downloading PDF...
                  </>
                ) : (
                  <>
                    <DownloadCloud size={16} className="text-[#C9A227]" />
                    Download PDF
                  </>
                )}
              </button>

              {/* Download Image (PNG) */}
              <button
                onClick={handleDownloadImage}
                disabled={downloadingImage || loadingImage}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border-2 border-[#122340]/15 hover:border-[#122340] text-[#122340] text-xs font-bold transition-all cursor-pointer disabled:opacity-60"
              >
                {downloadingImage || loadingImage ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#C9A227]" />
                    {loadingImage ? 'Preparing Image...' : 'Downloading PNG...'}
                  </>
                ) : (
                  <>
                    <ImageIcon size={16} className="text-[#C9A227]" />
                    Download Image (PNG)
                  </>
                )}
              </button>

              {/* Copy Image to Clipboard */}
              <button
                onClick={handleCopyImageToClipboard}
                disabled={copyingImage || loadingImage}
                className="flex items-center justify-center gap-2 p-3 rounded-xl bg-[#fcfcfa] border border-[#122340]/10 hover:bg-[#f0f2f5] text-[#122340] text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
                title="Copy certificate image to clipboard to paste (Ctrl+V) into chat or social post"
              >
                {copyingImage ? (
                  <>
                    <Loader2 size={16} className="animate-spin text-[#C9A227]" />
                    Copying...
                  </>
                ) : (
                  <>
                    <Copy size={16} className="text-[#122340]/70" />
                    Copy Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Copy Verification Link */}
          <div>
            <label className="block text-xs font-bold text-[#122340]/60 uppercase tracking-wider mb-2">
              Public Verification Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={verifyUrl}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#122340] focus:outline-hidden select-all"
              />
              <button
                onClick={handleCopyLink}
                className="bg-[#122340] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#0a1628] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copyingLink ? (
                  <>
                    <Check size={14} className="text-green-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy Link
                  </>
                )}
              </button>
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={handleDeviceShare}
                  className="border border-[#122340]/15 text-[#122340] hover:bg-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Share via device"
                >
                  <Share2 size={14} /> More
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
