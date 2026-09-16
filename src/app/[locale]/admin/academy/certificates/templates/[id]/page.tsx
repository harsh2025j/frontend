"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Minus,
  Trash2,
  Upload,
  Image as ImageIcon,
  ChevronDown,
  QrCode,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Layers,
  Sliders,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Check,
  ExternalLink,
  Move,
  Settings2,
  Palette,
  Layout,
  RectangleHorizontal,
  RectangleVertical,
  MousePointer,
  HelpCircle,
  FileCheck2,
} from "lucide-react";
import toast from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";
import {
  certificateApi,
  CertificateTemplate,
  TemplateField,
  TemplateAsset,
} from "@/data/services/academy-service/certificate.service";

const PLACEHOLDERS = [
  { key: "studentName", label: "Student Name", category: "Recipient" },
  { key: "courseName", label: "Course Name", category: "Course" },
  { key: "courseSubtitle", label: "Course Subtitle", category: "Course" },
  { key: "courseDuration", label: "Course Duration", category: "Course" },
  { key: "instructorName", label: "Instructor Name", category: "Instructor" },
  { key: "issueDate", label: "Issue Date", category: "Metadata" },
  { key: "certificateId", label: "Certificate ID", category: "Metadata" },
  { key: "platformName", label: "Platform Name", category: "Platform" },
  { key: "grade", label: "Grade / Score", category: "Recipient" },
  { key: "verifyUrl", label: "Verify URL", category: "Verification" },
  { key: "disclaimer", label: "Disclaimer / Note", category: "Legal" },
];

const SAMPLE_VALUES: Record<string, string> = {
  studentName: "John Doe",
  courseName: "Constitutional Law: Landmark Judgments",
  courseSubtitle: "Advanced Track",
  courseDuration: "40 Hours",
  instructorName: "Adv. Sajjad Husain",
  issueDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
  certificateId: "SHLA-CON-K3N8QP",
  platformName: "Sajjad Husain Legal Academy",
  grade: "92%",
  verifyUrl: "https://academy.sajjadhusainlawassociates.com/certificates/verify/SHLA-CON-K3N8QP",
  disclaimer: "This certificate is awarded for meritorious completion of all syllabus requirements, assignments, and examinations.",
  qrCode: "[Scan to Verify QR Code]",
};

const COLOR_SWATCHES = [
  { name: "Academy Navy", hex: "#122340" },
  { name: "Prestigious Gold", hex: "#d97706" },
  { name: "Charcoal Dark", hex: "#1e293b" },
  { name: "Legal Crimson", hex: "#991b1b" },
  { name: "Emerald Honor", hex: "#065f46" },
  { name: "Pure Black", hex: "#000000" },
];

const DIMENSION_PRESETS = [
  { label: "A4 Landscape", width: 1123, height: 794, orientation: "landscape" as const },
  { label: "US Letter", width: 1056, height: 816, orientation: "landscape" as const },
  { label: "Square Studio", width: 800, height: 800, orientation: "portrait" as const },
];

function getQrBgParam(bg?: string): string {
  if (!bg || bg === "transparent") return "ffffff";
  if (bg.startsWith("#")) {
    const hex = bg.replace("#", "");
    if (hex.length === 3) {
      return `${parseInt(hex[0] + hex[0], 16)}-${parseInt(hex[1] + hex[1], 16)}-${parseInt(hex[2] + hex[2], 16)}`;
    }
    if (hex.length === 6) {
      return `${parseInt(hex.slice(0, 2), 16)}-${parseInt(hex.slice(2, 4), 16)}-${parseInt(hex.slice(4, 6), 16)}`;
    }
  }
  const m = bg.match(/\d+/g);
  if (m && m.length >= 3) {
    return `${m[0]}-${m[1]}-${m[2]}`;
  }
  return "ffffff";
}

const FONT_FAMILIES = [
  {
    group: "Classic & Formal Serif",
    fonts: [
      { label: "Georgia (Classic Serif)", value: "Georgia, serif" },
      { label: "Playfair Display (Luxury Serif)", value: "'Playfair Display', serif" },
      { label: "Cinzel (Classical Roman)", value: "'Cinzel', serif" },
      { label: "Cormorant Garamond (Prestige)", value: "'Cormorant Garamond', serif" },
      { label: "Merriweather (Warm Serif)", value: "'Merriweather', serif" },
      { label: "Times New Roman (Traditional)", value: "'Times New Roman', serif" },
      { label: "Garamond (French Formal)", value: "Garamond, serif" },
    ],
  },
  {
    group: "Calligraphy & Script",
    fonts: [
      { label: "Great Vibes (Calligraphy Script)", value: "'Great Vibes', cursive" },
      { label: "Alex Brush (Signature Cursive)", value: "'Alex Brush', cursive" },
      { label: "Dancing Script (Casual Script)", value: "'Dancing Script', cursive" },
      { label: "Pinyon Script (Regal Script)", value: "'Pinyon Script', cursive" },
    ],
  },
  {
    group: "Clean Sans-Serif",
    fonts: [
      { label: "Inter (Crisp Modern)", value: "'Inter', sans-serif" },
      { label: "Montserrat (Geometric Sans)", value: "'Montserrat', sans-serif" },
      { label: "Roboto (Balanced Sans)", value: "'Roboto', sans-serif" },
      { label: "Arial (Standard Sans)", value: "Arial, sans-serif" },
      { label: "Helvetica Neue (Clean Swiss)", value: "'Helvetica Neue', sans-serif" },
    ],
  },
  {
    group: "Display & Monospace",
    fonts: [
      { label: "Cinzel Decorative (Ornate Header)", value: "'Cinzel Decorative', serif" },
      { label: "Monospace (Code / Serial ID)", value: "monospace" },
    ],
  },
];

export default function TemplateEditorPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";
  const id = params?.id as string;

  const [t, setT] = useState<CertificateTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [zoom, setZoom] = useState(0.45);
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);
  const [selectedAssetIdx, setSelectedAssetIdx] = useState<number | null>(null);
  const [customBgUrl, setCustomBgUrl] = useState("");
  const [assetUrlInput, setAssetUrlInput] = useState("");
  const [rightTab, setRightTab] = useState<"elements" | "inspector">("elements");

  const rightPanelRef = useRef<HTMLDivElement>(null);
  const leftPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res: any = await certificateApi.getTemplate(id);
        setT(res?.data ?? res);
      } catch (e: any) {
        toast.error(e?.message || "Failed to load template");
      }
    })();
  }, [id]);

  const patch = (partial: Partial<CertificateTemplate>) => {
    setT((prev) => (prev ? { ...prev, ...partial } : null));
  };

  const updateField = (idx: number, partial: Partial<TemplateField>) => {
    if (!t) return;
    const fields = [...t.fields];
    fields[idx] = { ...fields[idx], ...partial };
    patch({ fields });
  };

  const selectField = (idx: number | null) => {
    setSelectedFieldIdx(idx);
    if (idx !== null) {
      setSelectedAssetIdx(null);
      setRightTab("inspector");
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const selectAsset = (idx: number | null) => {
    setSelectedAssetIdx(idx);
    if (idx !== null) {
      setSelectedFieldIdx(null);
      setRightTab("inspector");

      // Smoothly scroll the left panel to this asset card
      setTimeout(() => {
        const el = document.getElementById(`asset-card-${idx}`);
        const panel = leftPanelRef.current;
        if (el && panel) {
          const elRect = el.getBoundingClientRect();
          const panelRect = panel.getBoundingClientRect();
          const relativeTop = elRect.top - panelRect.top + panel.scrollTop;
          panel.scrollTo({
            top: Math.max(0, relativeTop - 30),
            behavior: "smooth",
          });
        }
      }, 60);

      // Scroll right panel to top of inspector
      if (rightPanelRef.current) {
        rightPanelRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleReplaceAssetImage = async (idx: number, file: File) => {
    try {
      toast.loading("Uploading replacement image...", { id: "asset-replace" });
      const url = await uploadImage(file);
      updateAsset(idx, { url });
      toast.success("Asset image updated successfully!", { id: "asset-replace" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to replace asset image", { id: "asset-replace" });
    }
  };

  const addField = (placeholder?: { key: string; label: string }) => {
    if (!t) return;
    const isQr = placeholder?.key === "qrCode";
    const isCertId = placeholder?.key === "certificateId";
    const newField: TemplateField = {
      key: placeholder?.key || `custom_${Date.now()}`,
      label: placeholder?.label || "Custom Text",
      x: 100,
      y: 100,
      width: isQr ? 210 : isCertId ? 280 : 400,
      height: isQr ? 72 : undefined,
      fontSize: isQr ? 14 : isCertId ? 14 : 24,
      fontFamily: isCertId ? "monospace" : "Georgia, serif",
      fontWeight: isCertId ? "700" : "400",
      color: "#122340",
      textAlign: isCertId ? "right" : "center",
      uppercase: isCertId ? true : false,
      defaultText: isCertId ? "SHLA-CRS-XXXXXX" : (placeholder?.label || "Text"),
    };
    patch({ fields: [...t.fields, newField] });
    selectField(t.fields.length);
    toast.success(`Added ${newField.label}`);
  };

  const removeField = (idx: number) => {
    if (!t) return;
    patch({ fields: t.fields.filter((_, i) => i !== idx) });
    selectField(null);
    setRightTab("elements");
  };

  const addAsset = async (type: TemplateAsset["type"], url: string) => {
    if (!t) return;
    const newAsset: TemplateAsset = {
      id: `${type}_${Date.now()}`,
      type,
      url,
      x: 50,
      y: 50,
      width: 120,
      height: 120,
    };
    patch({ assets: [...t.assets, newAsset] });
    selectAsset(t.assets.length);
  };

  const updateAsset = (idx: number, partial: Partial<TemplateAsset>) => {
    if (!t) return;
    const assets = [...t.assets];
    assets[idx] = { ...assets[idx], ...partial };
    patch({ assets });
  };

  const removeAsset = (idx: number) => {
    if (!t) return;
    patch({ assets: t.assets.filter((_, i) => i !== idx) });
    selectAsset(null);
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const res: any = await apiClient.post("/academy/s3/presigned-url", {
        filename,
        contentType: file.type,
      });
      const payload = res?.data?.data || res?.data || res;
      const { url } = payload;
      if (url && typeof url === "string") {
        await axios.put(url, file, {
          headers: { "Content-Type": file.type },
        });
        const cleanUrl = url.split("?")[0];
        return cleanUrl;
      }
    } catch (e) {
      console.warn("S3 upload failed, falling back to data URL:", e);
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const doSave = async () => {
    if (!t) return;
    setSaving(true);
    try {
      // If a custom background image is provided, clear the legacy default text boilerplate
      // so it does not render duplicate titles over the custom graphic.
      const isDefaultBoilerplate =
        (t.htmlBody || "").includes("margin-top:40px") &&
        (t.htmlBody || "").includes("Certificate of Completion");
      const cleanHtmlBody = t.backgroundImageUrl && isDefaultBoilerplate ? "" : (t.htmlBody || "");

      await certificateApi.updateTemplate(t.id, {
        name: t.name,
        widthPx: t.widthPx,
        heightPx: t.heightPx,
        orientation: t.orientation,
        backgroundImageUrl: t.backgroundImageUrl,
        htmlBody: cleanHtmlBody,
        css: t.css,
        fields: t.fields,
        assets: t.assets,
      });
      if (t.isDefault) {
        toast.success("Universal Master Template saved successfully!");
      } else {
        toast.success("Course template saved successfully.");
      }
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const buildPreviewHtml = (): string => {
    if (!t) return "";
    const escHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

    const mustache = (str: string) =>
      (str || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, k) => SAMPLE_VALUES[k] ?? "");

    const fieldsHtml = (t.fields || [])
      .map((f) => {
        const raw = SAMPLE_VALUES[f.key] ?? f.defaultText ?? "";
        const text = f.uppercase ? raw.toUpperCase() : raw;
        if (f.key === "qrCode") {
          const qrData = encodeURIComponent(SAMPLE_VALUES.verifyUrl);
          const qrSize = f.height || 76;
          const containerWidth = Math.max(f.width || (qrSize + 20), qrSize + 16);
          const qrPatternColor = (f.qrColor || "#122340").replace("#", "");
          const textColor = f.color || "#122340";
          const cardBg = f.bgColor || (f.color?.startsWith("rgba") ? f.color : "rgba(255,255,255,0.96)");
          const isTransparent = cardBg === "transparent";
          const borderStyle = isTransparent
            ? "border:none;box-shadow:none;"
            : "border:1px solid rgba(18,35,64,0.12);box-shadow:0 2px 8px rgba(0,0,0,0.06);";
          const bgParam = getQrBgParam(cardBg);
          const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${qrData}&bgcolor=${bgParam}&color=${qrPatternColor}&margin=1`;
          const blendStyle = isTransparent ? "mix-blend-mode:multiply;" : "";
          const textFontSize = f.fontSize || 9;
          const textFontWeight = f.fontWeight || "700";
          return `<div style="position:absolute;left:${f.x}px;top:${f.y}px;width:${containerWidth}px;background:${cardBg};padding:8px 8px 6px 8px;border-radius:8px;${borderStyle}display:flex;flex-direction:column;align-items:center;text-align:center;box-sizing:border-box;">
            <img src="${qrSrc}" width="${qrSize}" height="${qrSize}" style="width:${qrSize}px;height:${qrSize}px;display:block;border-radius:4px;${blendStyle}" alt="QR Code" />
            <div style="font-family:system-ui,sans-serif;font-size:${textFontSize}px;font-weight:${textFontWeight};color:${textColor};letter-spacing:0.8px;text-transform:uppercase;margin-top:5px;white-space:nowrap;">Scan to Verify</div>
          </div>`;
        }
        const isItalic = f.italic || f.fontStyle === "italic";
        const isCertId = f.key === "certificateId";
        return `<div style="position:absolute;left:${f.x}px;top:${f.y}px;width:${f.width}px;max-width:calc(100% - ${f.x}px);font-size:${f.fontSize}px;font-family:${f.fontFamily || "Georgia,serif"};font-weight:${f.fontWeight || "400"};font-style:${isItalic ? "italic" : "normal"};color:${f.color || "#122340"};text-align:${f.textAlign || "center"};line-height:1.2;text-transform:${f.uppercase ? "uppercase" : "none"};${isCertId ? "white-space:nowrap;" : ""}box-sizing:border-box;">${escHtml(text)}</div>`;
      })
      .join("\n");

    const assetsHtml = (t.assets || [])
      .map((a) => `<img src="${a.url}" style="position:absolute;left:${a.x}px;top:${a.y}px;width:${a.width}px;height:${a.height}px;object-fit:contain;" alt="${a.type}" />`)
      .join("\n");

    const bg = t.backgroundImageUrl
      ? `<img src="${t.backgroundImageUrl}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;" alt="bg" />`
      : "";

    const isDefaultBoilerplate =
      (t.htmlBody || "").includes("margin-top:40px") &&
      (t.htmlBody || "").includes("Certificate of Completion");
    const bodyHtml = t.backgroundImageUrl && isDefaultBoilerplate ? "" : mustache(t.htmlBody || "");
    const cssStr = mustache(t.css || "");

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Certificate Preview — ${escHtml(t.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=Inter:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap" rel="stylesheet">
<style>
  @page { size: ${t.widthPx}px ${t.heightPx}px; margin: 0; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; width: ${t.widthPx}px; height: ${t.heightPx}px; overflow: hidden; -webkit-print-color-adjust: exact; print-color-adjust: exact; background: #888; }
  .cert-container { position: relative; width: ${t.widthPx}px; height: ${t.heightPx}px; background: #fff; overflow: hidden; }
  ${cssStr}
</style>
</head>
<body>
<div class="cert-container">
  ${bg}
  ${bodyHtml}
  ${assetsHtml}
  ${fieldsHtml}
</div>
</body>
</html>`;
  };

  const handlePreview = () => {
    setPreviewing(true);
    try {
      const html = buildPreviewHtml();
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank", "noopener,noreferrer");
      if (win) setTimeout(() => URL.revokeObjectURL(url), 10000);
      else toast.error("Popup blocked — please allow popups for this site.");
    } catch (e: any) {
      toast.error(e?.message || "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  if (!t) {
    return (
      <div className="space-y-4 animate-pulse p-6">
        <div className="h-14 bg-slate-200/70 rounded-2xl w-full" />
        <div className="grid grid-cols-12 gap-4 h-[600px]">
          <div className="col-span-3 bg-slate-200/60 rounded-2xl" />
          <div className="col-span-6 bg-slate-200/50 rounded-2xl" />
          <div className="col-span-3 bg-slate-200/60 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-[1920px] mx-auto">
      {/* Dynamic typography fonts for live certificate preview and canvas */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=Inter:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap"
      />
      {/* ──────────────── Top Studio Header ──────────────── */}
      <header className="bg-white rounded-2xl border border-slate-200/80 px-4 py-2.5 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push(`/${locale}/admin/academy/certificates`)}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors shrink-0 cursor-pointer"
            title="Back to certificates"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="h-6 w-px bg-slate-200 shrink-0" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <input
                value={t.name}
                onChange={(e) => patch({ name: e.target.value })}
                className="text-base font-bold text-slate-900 bg-transparent hover:bg-slate-50 focus:bg-slate-50 focus:ring-2 focus:ring-blue-500/20 rounded-lg px-2 py-0.5 -mx-2 transition-all truncate"
                title="Click to rename template"
              />
              {t.isDefault ? (
                <span className="bg-gradient-to-r from-amber-500/10 to-amber-600/15 text-amber-900 border border-amber-300/80 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                  Universal Master
                </span>
              ) : (
                <span className="bg-gradient-to-r from-blue-500/10 to-indigo-600/15 text-indigo-900 border border-indigo-200 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-2xs">
                  Course Override
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {t.isDefault
                ? "Universal Baseline · Applied to all academy courses without dedicated certificates"
                : t.courseId
                  ? "Course-specific override"
                  : "Custom standalone template"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
          <button
            type="button"
            onClick={handlePreview}
            disabled={previewing}
            className="px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
            title="Preview certificate HTML in new tab"
          >
            <Eye size={14} className="text-slate-600" />
            Preview Look
          </button>
          <button
            onClick={doSave}
            disabled={saving}
            className={`px-4 py-2 text-white rounded-xl text-xs font-semibold flex items-center gap-2 disabled:opacity-60 shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer ${
              t.isDefault
                ? "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            }`}
          >
            <Save size={14} />
            {saving ? "Saving…" : t.isDefault ? "Save Universal Master" : "Save Template"}
          </button>
        </div>
      </header>

      {/* ──────────────── 3-Column Studio Grid ──────────────── */}
      <div className="grid grid-cols-12 gap-3.5 h-[calc(100vh-140px)] min-h-[440px] max-h-[calc(100vh-140px)] items-stretch">
        {/* ──────── 1. LEFT PANEL: Canvas & Assets ──────── */}
        <aside className="col-span-3 h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Settings2 size={15} className="text-slate-600" />
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Canvas & Assets</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{t.widthPx} × {t.heightPx}</span>
          </div>

          <div
            ref={leftPanelRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-5 custom-scrollbar pb-14"
          >
            {/* Dimensions Section */}
            <Section title="Dimensions & Setup">
              {/* Orientation segmented button */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Orientation</label>
                <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      if (t.orientation !== "landscape") {
                        patch({
                          orientation: "landscape",
                          widthPx: Math.max(t.widthPx, t.heightPx),
                          heightPx: Math.min(t.widthPx, t.heightPx),
                        });
                      }
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      t.orientation === "landscape"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <RectangleHorizontal size={14} /> Landscape
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (t.orientation !== "portrait") {
                        patch({
                          orientation: "portrait",
                          widthPx: Math.min(t.widthPx, t.heightPx),
                          heightPx: Math.max(t.widthPx, t.heightPx),
                        });
                      }
                    }}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                      t.orientation === "portrait"
                        ? "bg-white text-slate-900 shadow-2xs font-bold"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <RectangleVertical size={14} /> Portrait
                  </button>
                </div>
              </div>

              {/* Standard presets */}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">Quick Standard Presets</span>
                <div className="grid grid-cols-3 gap-1">
                  {DIMENSION_PRESETS.map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() =>
                        patch({
                          widthPx: p.width,
                          heightPx: p.height,
                          orientation: p.orientation,
                        })
                      }
                      className={`text-[10px] py-1.5 px-1 text-center font-medium rounded-lg border transition cursor-pointer ${
                        t.widthPx === p.width && t.heightPx === p.height
                          ? "bg-blue-50 border-blue-300 text-blue-700 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Width / Height inputs */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <NumInput label="Width (px)" badge="W" value={t.widthPx} onChange={(v) => patch({ widthPx: v })} />
                <NumInput label="Height (px)" badge="H" value={t.heightPx} onChange={(v) => patch({ heightPx: v })} />
              </div>
            </Section>

            {/* Background Image Section */}
            <Section title="Background Image">
              {t.backgroundImageUrl ? (
                <div className="space-y-2 border border-slate-200/80 rounded-xl p-2 bg-slate-50/50">
                  <div
                    className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center w-full shadow-inner"
                    style={{
                      aspectRatio: `${t.widthPx || 1123} / ${t.heightPx || 794}`,
                      maxHeight: "220px",
                    }}
                  >
                    <img
                      src={t.backgroundImageUrl}
                      alt="Background"
                      className="w-full h-full object-contain block"
                    />
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={t.backgroundImageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-white/95 hover:bg-white text-slate-800 rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                      >
                        View Full
                      </a>
                      <button
                        type="button"
                        onClick={() => patch({ backgroundImageUrl: null })}
                        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 px-1">
                    <span className="truncate max-w-[170px] font-mono">Custom S3 Background</span>
                    <button
                      type="button"
                      onClick={() => patch({ backgroundImageUrl: null })}
                      className="text-red-600 hover:underline font-semibold text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  <FileUploadButton
                    onFile={async (f) => {
                      try {
                        const url = await uploadImage(f);
                        patch({ backgroundImageUrl: url });
                        toast.success("Background uploaded");
                      } catch (e: any) {
                        toast.error(e?.message || "Upload failed");
                      }
                    }}
                  >
                    Upload Background Image
                  </FileUploadButton>

                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-slate-200"></div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">or paste URL</span>
                    <div className="h-px flex-1 bg-slate-200"></div>
                  </div>

                  <div className="flex gap-1.5">
                    <input
                      type="url"
                      placeholder="https://example.com/cert-bg.jpg"
                      value={customBgUrl}
                      onChange={(e) => setCustomBgUrl(e.target.value)}
                      className="text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customBgUrl.trim()) {
                          patch({ backgroundImageUrl: customBgUrl.trim() });
                          setCustomBgUrl("");
                          toast.success("Background URL set");
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-lg hover:bg-slate-900 transition cursor-pointer"
                    >
                      Set
                    </button>
                  </div>
                </div>
              )}
            </Section>

            {/* Branding Assets Section */}
            <Section title="Logos, Seals & Signatures">
              <FileUploadButton
                onFile={async (f) => {
                  try {
                    const url = await uploadImage(f);
                    await addAsset("image", url);
                    toast.success("Asset added to canvas");
                  } catch (e: any) {
                    toast.error(e?.message || "Upload failed");
                  }
                }}
              >
                Upload Image (Logo / Seal / Signature)
              </FileUploadButton>

              <div className="pt-1 space-y-1.5">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Or paste asset image URL…"
                    value={assetUrlInput}
                    onChange={(e) => setAssetUrlInput(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!assetUrlInput.trim()) {
                        toast.error("Please enter image URL");
                        return;
                      }
                      addAsset("image", assetUrlInput.trim());
                      setAssetUrlInput("");
                      toast.success("Asset added to canvas");
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* QR Code Quick Badge Trigger */}
              <div className="pt-1">
                {(() => {
                  const qrFieldIdx = (t.fields || []).findIndex((f) => f.key === "qrCode");
                  const hasQr = qrFieldIdx !== -1;
                  return hasQr ? (
                    <button
                      type="button"
                      onClick={() => selectField(qrFieldIdx)}
                      className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 flex items-center justify-between transition cursor-pointer"
                      title="Click to select and inspect QR Code badge"
                    >
                      <span className="flex items-center gap-1.5">
                        <QrCode size={14} className="text-emerald-600" />
                        QR Verification Badge
                      </span>
                      <span className="text-[10px] bg-emerald-200/60 px-1.5 py-0.5 rounded-md font-bold uppercase">
                        Active
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        addField({
                          key: "qrCode",
                          label: "QR Code Verification Badge",
                        });
                      }}
                      className="w-full py-2 px-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-2xs cursor-pointer"
                    >
                      <QrCode size={14} /> + Add QR Verification Badge
                    </button>
                  );
                })()}
              </div>

              {/* Asset Cards */}
              {t.assets.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Placed Assets ({t.assets.length})
                  </span>
                  {t.assets.map((a, i) => (
                    <div
                      key={a.id}
                      id={`asset-card-${i}`}
                      onClick={() => selectAsset(i)}
                      className={`border rounded-xl p-2.5 space-y-2 transition-all cursor-pointer ${
                        selectedAssetIdx === i
                          ? "border-indigo-500 bg-indigo-50/80 ring-2 ring-indigo-400 shadow-md scale-[1.01]"
                          : "border-slate-200 bg-slate-50/40 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs font-bold text-slate-800 capitalize truncate">
                            {a.type} #{i + 1}
                          </span>
                          {selectedAssetIdx === i && (
                            <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAsset(i);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded transition cursor-pointer"
                          title="Remove asset"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div className="w-full h-16 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-1.5 shadow-2xs">
                        <img src={a.url} alt={a.type} className="max-w-full max-h-full object-contain" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>
        </aside>

        {/* ──────── 2. CENTER PANEL: Live Studio Canvas ──────── */}
        <main className="col-span-6 h-full bg-slate-900/5 rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden flex flex-col relative">
          {/* Top Canvas Toolbar */}
          <div className="px-4 py-2.5 border-b border-slate-200/80 bg-white flex items-center justify-between text-xs shrink-0 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-semibold text-slate-700">
                <Move size={12} className="text-slate-500" />
                Live Canvas Studio
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline">Click & drag items directly to reposition</span>
            </div>

            {/* Quick Zoom Bar */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setZoom(Math.max(0.25, Number((zoom - 0.05).toFixed(2))))}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut size={13} />
                </button>
                <input
                  type="range"
                  min={0.25}
                  max={1}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-20 h-1.5 accent-blue-600 bg-slate-300 rounded-lg cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => setZoom(Math.min(1, Number((zoom + 0.05).toFixed(2))))}
                  className="text-slate-500 hover:text-slate-800 p-0.5 rounded cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn size={13} />
                </button>
                <span className="text-slate-700 font-mono text-[11px] font-bold w-9 text-right">
                  {Math.round(zoom * 100)}%
                </span>
              </div>

              {/* Preset Buttons */}
              <div className="hidden lg:flex items-center gap-1">
                {[
                  { label: "Fit", val: 0.38 },
                  { label: "50%", val: 0.5 },
                  { label: "75%", val: 0.75 },
                  { label: "100%", val: 1 },
                ].map((z) => (
                  <button
                    key={z.label}
                    type="button"
                    onClick={() => setZoom(z.val)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer ${
                      Math.abs(zoom - z.val) < 0.03
                        ? "bg-blue-600 text-white font-bold"
                        : "text-slate-500 hover:bg-slate-200/60"
                    }`}
                  >
                    {z.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Canvas Viewport */}
          <div className="flex-1 overflow-auto overscroll-contain p-6 flex items-start justify-center studio-canvas-grid custom-scrollbar">
            <CanvasPreview
              template={t}
              zoom={zoom}
              selectedFieldIdx={selectedFieldIdx}
              selectedAssetIdx={selectedAssetIdx}
              onSelect={selectField}
              onSelectAsset={selectAsset}
              onFieldMove={(i, x, y) => updateField(i, { x, y })}
              onAssetMove={(i, x, y) => updateAsset(i, { x, y })}
            />
          </div>
        </main>

        {/* ──────── 3. RIGHT PANEL: Elements & Inspector Tabs ──────── */}
        <aside className="col-span-3 h-full bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col overflow-hidden">
          {/* Dual-Tab Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/60 shrink-0">
            <div className="flex items-center justify-between p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => setRightTab("elements")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  rightTab === "elements"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Layers size={13} />
                Elements ({t.fields.length + t.assets.length})
              </button>
              <button
                type="button"
                onClick={() => setRightTab("inspector")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer relative ${
                  rightTab === "inspector"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Sliders size={13} />
                Properties
                {(selectedFieldIdx !== null || selectedAssetIdx !== null) && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse inline-block" />
                )}
              </button>
            </div>
          </div>

          <div
            ref={rightPanelRef}
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 custom-scrollbar pb-16"
          >
            {/* ──────── TAB 1: ELEMENTS LIST ──────── */}
            {rightTab === "elements" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <InsertPlaceholder onPick={(p) => addField(p)} />
                  <button
                    onClick={() => addField()}
                    className="w-full px-3 py-2 border border-dashed border-slate-300 text-xs font-semibold text-slate-600 rounded-xl hover:bg-slate-50 hover:border-slate-400 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Plus size={13} /> Custom Text Field
                  </button>
                </div>

                {/* Text Fields */}
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Certificate Fields ({t.fields.length})
                  </span>
                  {t.fields.map((f, i) => (
                    <div
                      key={i}
                      onClick={() => selectField(i)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between group ${
                        selectedFieldIdx === i
                          ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-100 font-semibold shadow-2xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="flex items-center gap-1.5">
                          <p className="font-bold text-slate-900 truncate text-xs">{f.label}</p>
                          {f.key === "qrCode" && (
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded uppercase">
                              QR
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] font-mono text-slate-400 truncate mt-0.5">{`{{${f.key}}}`}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectField(i);
                          }}
                          className="text-slate-400 hover:text-blue-600 p-1 rounded-md transition cursor-pointer"
                          title="Edit properties"
                        >
                          <Sliders size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeField(i);
                          }}
                          className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                          title="Delete field"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Placed Images & Badges */}
                {t.assets.length > 0 && (
                  <div className="space-y-1.5 pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Placed Images & Badges ({t.assets.length})
                    </span>
                    {t.assets.map((a, i) => (
                      <div
                        key={a.id}
                        onClick={() => selectAsset(i)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs transition cursor-pointer flex items-center justify-between group ${
                          selectedAssetIdx === i
                            ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-100 font-semibold shadow-2xs"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 p-0.5 overflow-hidden">
                            <img src={a.url} alt={a.type} className="max-w-full max-h-full object-contain" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate text-xs capitalize">{a.type} #{i + 1}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{a.width}×{a.height}px @ ({a.x}, {a.y})</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              selectAsset(i);
                            }}
                            className="text-slate-400 hover:text-indigo-600 p-1 rounded-md transition cursor-pointer"
                            title="Edit properties"
                          >
                            <Sliders size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeAsset(i);
                            }}
                            className="text-slate-400 hover:text-red-600 p-1 rounded-md transition cursor-pointer"
                            title="Delete asset"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ──────── TAB 2: PROPERTIES INSPECTOR ──────── */}
            {rightTab === "inspector" && (
              <div>
                {selectedFieldIdx !== null && t.fields[selectedFieldIdx] ? (
                  <div className="space-y-4">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <button
                          type="button"
                          onClick={() => setRightTab("elements")}
                          className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                        >
                          ← Back to all elements
                        </button>
                        <h4 className="text-sm font-black text-slate-900 truncate">
                          {t.fields[selectedFieldIdx].label}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                        {`{{${t.fields[selectedFieldIdx].key}}}`}
                      </span>
                    </div>

                    <FieldEditor
                      field={t.fields[selectedFieldIdx]}
                      onChange={(p) => updateField(selectedFieldIdx, p)}
                    />
                  </div>
                ) : selectedAssetIdx !== null && t.assets[selectedAssetIdx] ? (
                  <div className="space-y-4">
                    {/* Header with back button */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div>
                        <button
                          type="button"
                          onClick={() => setRightTab("elements")}
                          className="text-[11px] font-semibold text-indigo-600 hover:underline flex items-center gap-1 mb-1 cursor-pointer"
                        >
                          ← Back to all elements
                        </button>
                        <h4 className="text-sm font-black text-slate-900 truncate capitalize">
                          {t.assets[selectedAssetIdx].type} #{selectedAssetIdx + 1}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded-full font-bold uppercase">
                        Asset Layer
                      </span>
                    </div>

                    <AssetEditor
                      asset={t.assets[selectedAssetIdx]}
                      onChange={(p) => updateAsset(selectedAssetIdx, p)}
                      onRemove={() => removeAsset(selectedAssetIdx)}
                      onReplaceImage={(file) => handleReplaceAssetImage(selectedAssetIdx, file)}
                      onScrollToLeft={() => {
                        const el = document.getElementById(`asset-card-${selectedAssetIdx}`);
                        const panel = leftPanelRef.current;
                        if (el && panel) {
                          const elRect = el.getBoundingClientRect();
                          const panelRect = panel.getBoundingClientRect();
                          const relativeTop = elRect.top - panelRect.top + panel.scrollTop;
                          panel.scrollTo({
                            top: Math.max(0, relativeTop - 30),
                            behavior: "smooth",
                          });
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                      <MousePointer size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">No element selected</h4>
                      <p className="text-[11px] text-slate-500 mt-1 max-w-[220px] mx-auto">
                        Click any element directly on the canvas or choose from the Elements tab to inspect and customize it.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRightTab("elements")}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      View All Elements
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Global studio styles */}
      <style jsx global>{`
        .studio-canvas-grid {
          background-image: radial-gradient(#cbd5e1 1.2px, transparent 1.2px);
          background-size: 16px 16px;
          background-color: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 9999px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────── Sub-components ────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-black uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  compact = false,
  step = 1,
  min = 0,
  max,
  badge,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  compact?: boolean;
  step?: number;
  min?: number;
  max?: number;
  badge?: string;
}) {
  const [localVal, setLocalVal] = useState<string>(String(value ?? 0));
  const isFocused = useRef(false);
  const valRef = useRef<number>(value ?? 0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isFocused.current) {
      setLocalVal(String(value ?? 0));
      valRef.current = value ?? 0;
    }
  }, [value]);

  const stopRepeat = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopRepeat();
  }, []);

  const doStep = (delta: number) => {
    const cur = valRef.current;
    let next = Math.max(min, cur + delta);
    if (max !== undefined) next = Math.min(max, next);
    valRef.current = next;
    setLocalVal(String(next));
    onChange(next);
  };

  const startRepeat = (delta: number) => {
    stopRepeat();
    doStep(delta);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        doStep(delta);
      }, 50);
    }, 280);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    if (text === "" || text === "-") {
      setLocalVal(text);
      return;
    }
    if (/^-?\d*$/.test(text)) {
      setLocalVal(text);
      const parsed = parseInt(text, 10);
      if (!isNaN(parsed)) {
        valRef.current = parsed;
        onChange(parsed);
      }
    }
  };

  const handleBlur = () => {
    isFocused.current = false;
    let parsed = parseInt(localVal, 10);
    if (isNaN(parsed)) {
      parsed = min;
    } else {
      parsed = Math.max(min, parsed);
      if (max !== undefined) parsed = Math.min(max, parsed);
    }
    setLocalVal(String(parsed));
    valRef.current = parsed;
    onChange(parsed);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className={`block ${compact ? "text-[10px]" : "text-xs"} font-bold text-slate-700`}>{label}</label>
        {badge && (
          <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 shadow-2xs">
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            startRepeat(-step);
          }}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
          className={`${compact ? "w-6 h-7 text-xs" : "w-7 h-8 text-xs"} bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold border-r border-slate-200 select-none active:bg-slate-200 transition cursor-pointer`}
          title="Decrease"
        >
          <Minus size={11} />
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localVal}
          onFocus={() => {
            isFocused.current = true;
          }}
          onChange={handleTextChange}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.currentTarget.blur();
            }
          }}
          className={`w-full text-center ${compact ? "py-0.5 text-xs" : "py-1 text-xs"} text-slate-800 font-bold focus:outline-none`}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            startRepeat(step);
          }}
          onMouseUp={stopRepeat}
          onMouseLeave={stopRepeat}
          className={`${compact ? "w-6 h-7 text-xs" : "w-7 h-8 text-xs"} bg-slate-50 hover:bg-slate-100 text-slate-600 flex items-center justify-center font-bold border-l border-slate-200 select-none active:bg-slate-200 transition cursor-pointer`}
          title="Increase"
        >
          <Plus size={11} />
        </button>
      </div>
    </div>
  );
}

function InsertPlaceholder({ onPick }: { onPick: (p: (typeof PLACEHOLDERS)[number]) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
      >
        <Plus size={14} /> Insert Placeholder <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute z-20 mt-1.5 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto custom-scrollbar">
          {PLACEHOLDERS.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                onPick(p);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50/80 flex items-center justify-between border-b border-slate-50 last:border-0 transition cursor-pointer"
            >
              <div>
                <span className="font-bold text-slate-900 block">{p.label}</span>
                <span className="text-[10px] font-mono text-slate-400">{`{{${p.key}}}`}</span>
              </div>
              <span className="text-[9px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded">
                {p.category}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function FontFamilySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Find active font label
  const currentFont = useMemo(() => {
    for (const group of FONT_FAMILIES) {
      const match = group.fonts.find((f) => f.value === value);
      if (match) return match;
    }
    return { label: value || "Georgia (Classic Serif)", value };
  }, [value]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-medium flex items-center justify-between hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs transition-colors"
      >
        <span className="truncate text-slate-800 font-medium" style={{ fontFamily: currentFont.value }}>
          {currentFont.label}
        </span>
        <ChevronDown
          size={14}
          className={`text-slate-400 shrink-0 ml-1.5 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 w-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 max-h-[300px] overflow-y-auto custom-scrollbar p-1.5 space-y-2">
          {FONT_FAMILIES.map((group) => (
            <div key={group.group} className="space-y-0.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 sticky top-0 bg-white/95 backdrop-blur-xs z-10 border-b border-slate-100">
                {group.group}
              </div>
              {group.fonts.map((f) => {
                const isSelected = f.value === value;
                return (
                  <button
                    key={f.value}
                    type="button"
                    onClick={() => {
                      onChange(f.value);
                      setOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-blue-50 text-blue-700 font-bold"
                        : "text-slate-700 hover:bg-slate-100/80"
                    }`}
                  >
                    <span className="truncate" style={{ fontFamily: f.value }}>
                      {f.label}
                    </span>
                    {isSelected && <Check size={13} className="text-blue-600 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FieldEditor({ field, onChange }: { field: TemplateField; onChange: (p: Partial<TemplateField>) => void }) {
  if (field.key === "qrCode") {
    const cardBg = field.bgColor || (field.color?.startsWith("rgba") ? field.color : "rgba(255,255,255,0.96)");
    const qrColor = field.qrColor || "#122340";
    const textColor = field.color?.startsWith("#") ? field.color : "#122340";

    return (
      <div className="space-y-3.5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Field Label</label>
          <input
            value={field.label}
            onChange={(e) => onChange({ label: e.target.value })}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Position X (px)" badge="X" value={field.x} onChange={(v) => onChange({ x: v })} />
          <NumInput label="Position Y (px)" badge="Y" value={field.y} onChange={(v) => onChange({ y: v })} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Badge Width (px)" badge="W" value={field.width} onChange={(v) => onChange({ width: v })} />
          <NumInput label="QR Size (px)" badge="H" value={field.height || 76} onChange={(v) => onChange({ height: v })} min={36} max={180} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Text Font Size (px)" badge="PT" value={field.fontSize || 9} onChange={(v) => onChange({ fontSize: v })} min={6} max={24} />
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Font Weight</label>
            <select
              value={field.fontWeight || "700"}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="400">Regular (400)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="800">Extra Bold (800)</option>
            </select>
          </div>
        </div>

        {/* 1. QR Pattern Color */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">QR Pattern Color</label>
          <div className="flex items-center gap-1.5 mb-1.5">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ qrColor: c.hex })}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full border-2 transition shadow-2xs cursor-pointer ${
                  qrColor.toLowerCase() === c.hex.toLowerCase()
                    ? "border-blue-600 scale-110 ring-2 ring-blue-200"
                    : "border-white"
                }`}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
            <input
              type="color"
              value={qrColor.startsWith("#") ? qrColor : "#122340"}
              onChange={(e) => onChange({ qrColor: e.target.value })}
              className="w-5 h-5 border-0 rounded cursor-pointer p-0"
            />
            <input
              type="text"
              value={qrColor}
              onChange={(e) => onChange({ qrColor: e.target.value })}
              className="text-xs font-mono font-bold text-slate-800 bg-transparent border-0 focus:outline-none w-24"
              placeholder="#122340"
            />
          </div>
        </div>

        {/* 2. Text Color ("Scan to Verify") */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Text Color ("Scan to Verify")</label>
          <div className="flex items-center gap-1.5 mb-1.5">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ color: c.hex })}
                style={{ backgroundColor: c.hex }}
                className={`w-5 h-5 rounded-full border-2 transition shadow-2xs cursor-pointer ${
                  textColor.toLowerCase() === c.hex.toLowerCase()
                    ? "border-blue-600 scale-110 ring-2 ring-blue-200"
                    : "border-white"
                }`}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
            <input
              type="color"
              value={textColor.startsWith("#") ? textColor : "#122340"}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-5 h-5 border-0 rounded cursor-pointer p-0"
            />
            <input
              type="text"
              value={textColor}
              onChange={(e) => onChange({ color: e.target.value })}
              className="text-xs font-mono font-bold text-slate-800 bg-transparent border-0 focus:outline-none w-24"
              placeholder="#122340"
            />
          </div>
        </div>

        {/* 3. Card Background */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Card Background</label>
          <div className="flex items-center gap-1.5 mb-1.5">
            <button
              type="button"
              onClick={() => onChange({ bgColor: "rgba(255,255,255,0.96)" })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                (!cardBg || cardBg.includes("255") || cardBg === "#ffffff")
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              White Card
            </button>
            <button
              type="button"
              onClick={() => onChange({ bgColor: "transparent" })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all ${
                cardBg === "transparent"
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-2xs"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Transparent
            </button>
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1 bg-white">
            <input
              type="color"
              value={cardBg.startsWith("#") ? cardBg : "#ffffff"}
              onChange={(e) => onChange({ bgColor: e.target.value })}
              className="w-5 h-5 border-0 rounded cursor-pointer p-0"
            />
            <input
              type="text"
              value={cardBg}
              onChange={(e) => onChange({ bgColor: e.target.value })}
              className="text-xs font-mono font-bold text-slate-800 bg-transparent border-0 focus:outline-none w-full"
              placeholder="rgba(255,255,255,0.96)"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Field Label</label>
        <input
          value={field.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <NumInput label="Position X (px)" badge="X" value={field.x} onChange={(v) => onChange({ x: v })} />
        <NumInput label="Position Y (px)" badge="Y" value={field.y} onChange={(v) => onChange({ y: v })} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col justify-end">
          <button
            type="button"
            onClick={() => onChange({ x: Math.round((1123 - field.width) / 2) })}
            className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
            title="Auto-center horizontally on the canvas"
          >
            <AlignCenter size={13} /> Center on Page
          </button>
        </div>
        <NumInput label="Field Width (px)" badge="W" value={field.width} onChange={(v) => onChange({ width: v })} />
      </div>

      {/* Typography */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Typography</span>
        
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Font Family</label>
          <FontFamilySelect
            value={field.fontFamily}
            onChange={(val) => onChange({ fontFamily: val })}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <NumInput label="Font Size (px)" badge="PT" value={field.fontSize} onChange={(v) => onChange({ fontSize: v })} min={8} />
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Weight</label>
            <select
              value={field.fontWeight}
              onChange={(e) => onChange({ fontWeight: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs bg-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="300">Light (300)</option>
              <option value="400">Regular (400)</option>
              <option value="600">Semibold (600)</option>
              <option value="700">Bold (700)</option>
              <option value="900">Black (900)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Style & Alignment */}
      <div className="space-y-2">
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Alignment & Style</span>
        
        {/* Alignment Segmented Control */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Text Alignment</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                type="button"
                onClick={() => onChange({ textAlign: align })}
                className={`py-1.5 flex items-center justify-center rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                  field.textAlign === align
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title={`Align ${align}`}
              >
                {align === "left" && <AlignLeft size={14} />}
                {align === "center" && <AlignCenter size={14} />}
                {align === "right" && <AlignRight size={14} />}
              </button>
            ))}
          </div>
        </div>

        {/* Style Toggles: Italic & Uppercase */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              const next = !(field.italic || field.fontStyle === "italic");
              onChange({ italic: next, fontStyle: next ? "italic" : "normal" });
            }}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              field.italic || field.fontStyle === "italic"
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-2xs"
                : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 text-slate-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="italic font-serif font-black text-sm">I</span>
              <span>Italic Text</span>
            </span>
            <span
              className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                field.italic || field.fontStyle === "italic"
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
            >
              ✓
            </span>
          </button>

          <button
            type="button"
            onClick={() => onChange({ uppercase: !field.uppercase })}
            className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              field.uppercase
                ? "border-blue-500 bg-blue-50 text-blue-700 shadow-2xs"
                : "border-slate-200 bg-slate-50/70 hover:bg-slate-100/70 text-slate-700"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <span className="font-mono text-xs">AA</span>
              <span>Uppercase</span>
            </span>
            <span
              className={`w-4 h-4 rounded-md flex items-center justify-center border text-[10px] font-bold ${
                field.uppercase
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-slate-300 bg-white text-transparent"
              }`}
            >
              ✓
            </span>
          </button>
        </div>

        {/* Color Palette & Custom Picker */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Text Color</label>
          <div className="flex items-center gap-1.5 mb-2">
            {COLOR_SWATCHES.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => onChange({ color: c.hex })}
                style={{ backgroundColor: c.hex }}
                className={`w-6 h-6 rounded-full border-2 transition shadow-2xs cursor-pointer ${
                  field.color?.toLowerCase() === c.hex.toLowerCase()
                    ? "border-blue-600 scale-110 ring-2 ring-blue-200"
                    : "border-white"
                }`}
                title={c.name}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-white">
            <input
              type="color"
              value={field.color}
              onChange={(e) => onChange({ color: e.target.value })}
              className="w-6 h-6 border-0 rounded cursor-pointer p-0"
            />
            <span className="text-xs font-mono font-bold text-slate-800">{field.color}</span>
          </div>
        </div>
      </div>

      {/* Default Text */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">Fallback / Sample Text</label>
        <input
          value={field.defaultText || ""}
          onChange={(e) => onChange({ defaultText: e.target.value })}
          placeholder="Enter default preview text…"
          className="w-full px-3 py-1.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
      </div>
    </div>
  );
}

function FileUploadButton({
  children,
  onFile,
}: {
  children: React.ReactNode;
  onFile: (f: File) => Promise<void> | void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            await onFile(f);
          } finally {
            setBusy(false);
            if (ref.current) ref.current.value = "";
          }
        }}
      />
      <button
        onClick={() => ref.current?.click()}
        disabled={busy}
        className="w-full px-3 py-2 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 flex items-center justify-center gap-2 shadow-2xs transition disabled:opacity-60 cursor-pointer"
      >
        <Upload size={13} className="text-slate-500" /> {busy ? "Uploading to Cloud…" : children}
      </button>
    </>
  );
}

function AssetEditor({
  asset,
  onChange,
  onRemove,
  onReplaceImage,
  onScrollToLeft,
}: {
  asset: TemplateAsset;
  onChange: (p: Partial<TemplateAsset>) => void;
  onRemove: () => void;
  onReplaceImage: (file: File) => Promise<void>;
  onScrollToLeft?: () => void;
}) {
  const [replacing, setReplacing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReplacing(true);
    try {
      await onReplaceImage(file);
    } finally {
      setReplacing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Preview & File Replacement */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Asset Preview</span>
          <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full font-bold capitalize">
            {asset.type}
          </span>
        </div>
        <div className="w-full h-24 bg-white border border-slate-200 rounded-lg flex items-center justify-center p-2 overflow-hidden shadow-2xs">
          <img src={asset.url} alt={asset.type} className="max-w-full max-h-full object-contain" />
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            disabled={replacing}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Upload size={13} className="text-slate-500" />
            {replacing ? "Uploading Replacement…" : "Replace Image File"}
          </button>
        </div>
      </div>

      {/* Classification Selector */}
      <div>
        <label className="block text-[11px] font-bold text-slate-600 mb-1.5">Asset Classification</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {(["signature", "logo", "seal", "image"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ type })}
              className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize border transition cursor-pointer text-center ${
                asset.type === type
                  ? "border-indigo-600 bg-indigo-50 text-indigo-800 font-bold shadow-2xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Position & Size */}
      <div className="space-y-2">
        <label className="block text-[11px] font-bold text-slate-600">Position & Dimensions (px)</label>
        <div className="grid grid-cols-2 gap-2">
          <NumInput compact badge="X" label="Position X" value={asset.x} onChange={(v) => onChange({ x: v })} />
          <NumInput compact badge="Y" label="Position Y" value={asset.y} onChange={(v) => onChange({ y: v })} />
          <NumInput compact badge="W" label="Width" value={asset.width} onChange={(v) => onChange({ width: v })} />
          <NumInput compact badge="H" label="Height" value={asset.height} onChange={(v) => onChange({ height: v })} />
        </div>
      </div>

      {/* Shortcut to view on left panel */}
      {onScrollToLeft && (
        <button
          type="button"
          onClick={onScrollToLeft}
          className="w-full py-1.5 px-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-[11px] font-semibold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <ExternalLink size={12} /> Show Card in Left Panel
        </button>
      )}

      {/* Delete button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onRemove}
          className="w-full py-2 px-3 text-red-600 hover:bg-red-50 border border-red-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <Trash2 size={14} /> Remove Asset from Certificate
        </button>
      </div>
    </div>
  );
}

function CanvasPreview({
  template,
  zoom,
  selectedFieldIdx,
  selectedAssetIdx,
  onSelect,
  onSelectAsset,
  onFieldMove,
  onAssetMove,
}: {
  template: CertificateTemplate;
  zoom: number;
  selectedFieldIdx: number | null;
  selectedAssetIdx: number | null;
  onSelect: (i: number | null) => void;
  onSelectAsset: (i: number | null) => void;
  onFieldMove: (i: number, x: number, y: number) => void;
  onAssetMove?: (i: number, x: number, y: number) => void;
}) {
  const [dragging, setDragging] = useState<{
    type: "field" | "asset";
    i: number;
    offX: number;
    offY: number;
  } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const onMouseDownField = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    onSelect(i);
    onSelectAsset(null);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const f = template.fields[i];
    const px = (e.clientX - rect.left) / zoom;
    const py = (e.clientY - rect.top) / zoom;
    setDragging({ type: "field", i, offX: px - f.x, offY: py - f.y });
  };

  const onMouseDownAsset = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    e.stopPropagation();
    onSelectAsset(i);
    onSelect(null);
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const a = template.assets[i];
    const px = (e.clientX - rect.left) / zoom;
    const py = (e.clientY - rect.top) / zoom;
    setDragging({ type: "asset", i, offX: px - a.x, offY: py - a.y });
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging) return;
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / zoom;
    const py = (e.clientY - rect.top) / zoom;
    const newX = Math.max(0, Math.round(px - dragging.offX));
    const newY = Math.max(0, Math.round(py - dragging.offY));
    if (dragging.type === "field") {
      onFieldMove(dragging.i, newX, newY);
    } else if (dragging.type === "asset" && onAssetMove) {
      onAssetMove(dragging.i, newX, newY);
    }
  };

  const onMouseUp = () => setDragging(null);

  const scaledW = template.widthPx * zoom;
  const scaledH = template.heightPx * zoom;

  return (
    <div
      style={{ width: scaledW, height: scaledH }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      className="relative transition-all"
    >
      <div
        ref={canvasRef}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onSelect(null);
            onSelectAsset(null);
          }
        }}
        style={{
          width: template.widthPx,
          height: template.heightPx,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          background: "#fff",
          position: "relative",
          boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.22), 0 0 0 1px rgba(15, 23, 42, 0.08)",
          overflow: "hidden",
          borderRadius: 4,
        }}
      >
        {/* Certificate Background Image */}
        {template.backgroundImageUrl && (
          <img
            src={template.backgroundImageUrl}
            alt="Certificate Background"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
        )}

        {/* Branding Assets (Logos, Seals, Signatures) */}
        {template.assets.map((a, i) => (
          <img
            key={a.id}
            src={a.url}
            alt={a.type}
            onMouseDown={(e) => onMouseDownAsset(e, i)}
            style={{
              position: "absolute",
              left: a.x,
              top: a.y,
              width: a.width,
              height: a.height,
              objectFit: "contain",
              zIndex: 2,
              cursor: dragging?.type === "asset" && dragging.i === i ? "grabbing" : "grab",
              outline: selectedAssetIdx === i ? "2px solid #6366f1" : "none",
              outlineOffset: 2,
              filter: selectedAssetIdx === i ? "drop-shadow(0 4px 12px rgba(99, 102, 241, 0.3))" : "none",
            }}
          />
        ))}

        {/* Text & QR Fields */}
        {template.fields.map((f, i) => {
          const raw = SAMPLE_VALUES[f.key] ?? f.defaultText ?? "";
          const text = f.uppercase ? raw.toUpperCase() : raw;
          const isSelected = selectedFieldIdx === i;

          return (
            <div
              key={i}
              onMouseDown={(e) => onMouseDownField(e, i)}
              style={{
                position: "absolute",
                left: f.x,
                top: f.y,
                width: f.width,
                fontSize: f.fontSize,
                fontFamily: f.fontFamily,
                fontWeight: f.fontWeight as any,
                fontStyle: (f.italic || f.fontStyle === "italic") ? "italic" : "normal",
                color: f.color,
                textAlign: f.textAlign,
                lineHeight: 1.2,
                cursor: dragging?.type === "field" && dragging?.i === i ? "grabbing" : "grab",
                outline: isSelected ? "2px solid #3b82f6" : "1px dashed transparent",
                boxShadow: isSelected ? "0 0 0 3px rgba(59, 130, 246, 0.25)" : "none",
                outlineOffset: 2,
                userSelect: "none",
                zIndex: 3,
                transition: dragging ? "none" : "box-shadow 0.15s ease",
              }}
            >
              {f.key === "qrCode" ? (
                (() => {
                  const qrSize = f.height || 76;
                  const qrPatternColor = (f.qrColor || "#122340").replace("#", "");
                  const textColor = f.color || "#122340";
                  const cardBg = f.bgColor || (f.color?.startsWith("rgba") ? f.color : "rgba(255,255,255,0.96)");
                  const isTransparent = cardBg === "transparent";
                  const bgParam = getQrBgParam(cardBg);
                  const textFontSize = f.fontSize || 9;
                  const textFontWeight = f.fontWeight || "700";
                  return (
                    <div
                      style={{ background: cardBg }}
                      className={`flex flex-col items-center text-center p-2 pb-1.5 rounded-xl ${isTransparent ? "" : "border border-slate-200/80 shadow-sm"} pointer-events-none box-border w-full`}
                    >
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(SAMPLE_VALUES.verifyUrl)}&bgcolor=${bgParam}&color=${qrPatternColor}&margin=1`}
                        width={qrSize}
                        height={qrSize}
                        style={{
                          width: `${qrSize}px`,
                          height: `${qrSize}px`,
                          mixBlendMode: isTransparent ? "multiply" : "normal",
                        }}
                        alt="QR Code"
                        className="rounded-md flex-shrink-0"
                      />
                      <span
                        style={{ color: textColor, fontSize: `${textFontSize}px`, fontWeight: textFontWeight }}
                        className="uppercase tracking-wider mt-1.5 whitespace-nowrap"
                      >
                        Scan to Verify
                      </span>
                    </div>
                  );
                })()
              ) : (
                <div style={{ whiteSpace: f.key === "certificateId" ? "nowrap" : "normal" }}>
                  {text}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
