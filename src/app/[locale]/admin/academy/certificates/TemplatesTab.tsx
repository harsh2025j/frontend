"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Copy, Edit3, Trash2, X, Star, Lock, Award, Eye, AlertTriangle, Loader2 } from "lucide-react";
import { certificateApi, CertificateTemplate } from "@/data/services/academy-service/certificate.service";
import { courseApi } from "@/data/services/academy-service/course.service";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";

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

export default function TemplatesTab() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Modals state
  const [previewTarget, setPreviewTarget] = useState<CertificateTemplate | null>(null);
  const [editConfirmTarget, setEditConfirmTarget] = useState<CertificateTemplate | null>(null);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<CertificateTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [creatingMaster, setCreatingMaster] = useState(false);

  const initMasterTemplate = async () => {
    setCreatingMaster(true);
    try {
      const res: any = await certificateApi.createTemplate({
        name: "Universal Master Certificate",
        isDefault: true,
        courseId: null,
      });
      const created = res?.data?.data ?? res?.data ?? res;
      toast.success("Universal Master Certificate initialized!");
      if (created?.id) {
        router.push(`/${locale}/admin/academy/certificates/templates/${created.id}`);
      } else {
        load();
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to initialize master template");
    } finally {
      setCreatingMaster(false);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      const [tRes, cRes]: any[] = await Promise.all([
        certificateApi.listTemplates(),
        courseApi.fetchCourses(),
      ]);
      let tList: CertificateTemplate[] = (tRes?.data ?? tRes) || [];
      const cList = ((cRes?.data ?? cRes) || []) as any[];

      // Auto-create Master Template if missing from database
      const hasMaster = tList.some((t) => t.isDefault || t.name?.toLowerCase().includes("universal"));
      if (!hasMaster) {
        try {
          const createRes: any = await certificateApi.createTemplate({
            name: "Universal Master Certificate",
            isDefault: true,
            courseId: null,
          });
          const created = createRes?.data?.data ?? createRes?.data ?? createRes;
          if (created?.id) {
            tList = [created, ...tList];
          }
        } catch (err) {
          console.warn("Could not auto-create master template:", err);
        }
      }

      setTemplates(tList);
      setCourses(cList);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const courseNameById = useMemo(() => {
    const map: Record<string, string> = {};
    courses.forEach((c: any) => (map[c.id] = c.title));
    return map;
  }, [courses]);

  const masterTemplate = useMemo(() => {
    return (
      templates.find((t) => t.isDefault) ||
      templates.find(
        (t) =>
          t.name?.toLowerCase().includes("universal") ||
          t.name?.toLowerCase().includes("master")
      ) ||
      (!templates.some((t) => t.courseId) && templates.length > 0 ? templates[0] : null)
    );
  }, [templates]);

  const courseTemplates = useMemo(() => {
    if (!masterTemplate) return templates.filter((t) => !t.isDefault);
    return templates.filter((t) => t.id !== masterTemplate.id);
  }, [templates, masterTemplate]);

  // Triggered when user confirms delete in custom modal
  const executeDelete = async () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.isDefault) {
      toast.error("The Universal Master Template cannot be deleted");
      return;
    }
    setIsDeleting(true);
    try {
      await certificateApi.deleteTemplate(deleteConfirmTarget.id);
      toast.success("Certificate template deleted");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  // Triggered when user confirms edit in custom modal
  const executeEdit = () => {
    if (!editConfirmTarget) return;
    const targetId = editConfirmTarget.id;
    setEditConfirmTarget(null);
    setPreviewTarget(null);
    router.push(`/${locale}/admin/academy/certificates/templates/${targetId}`);
  };

  return (
    <div className="space-y-8">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=Inter:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap"
      />
      {/* ─── 1. UNIVERSAL / MASTER CERTIFICATE SECTION (AT TOP) ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Award className="text-amber-500" size={22} />
          <h2 className="text-lg font-bold text-gray-900">Universal / Master Certificate</h2>
          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
            <Lock size={12} /> Permanent Baseline
          </span>
        </div>

        {loading && !masterTemplate ? (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-400 text-sm">
            Loading Master Template…
          </div>
        ) : masterTemplate ? (
          <div className="bg-white rounded-2xl border border-amber-200/80 shadow-sm overflow-hidden flex flex-col md:flex-row">
            {/* Visual Preview (Clickable to preview) */}
            <div
              onClick={() => setPreviewTarget(masterTemplate)}
              className="md:w-80 h-48 md:h-auto bg-gradient-to-br from-[#0c192c] via-[#162a4a] to-[#0c192c] p-4 flex flex-col justify-between relative cursor-pointer group"
              style={
                masterTemplate.backgroundImageUrl
                  ? {
                    backgroundImage: `url(${masterTemplate.backgroundImageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }
                  : undefined
              }
            >
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition" />
              <div className="flex justify-between items-start relative z-10">
                <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded shadow">
                  Master
                </span>
                <span className="text-[11px] text-white/90 font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                  {masterTemplate.widthPx}×{masterTemplate.heightPx}px
                </span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-lg backdrop-blur-sm border border-white/10 relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-amber-300 font-semibold uppercase tracking-wider">Universal Baseline</p>
                  <p className="text-xs font-bold text-white truncate">{masterTemplate.name}</p>
                </div>
                <span className="p-1.5 bg-white/20 text-white rounded-md group-hover:bg-amber-500 transition">
                  <Eye size={14} />
                </span>
              </div>
            </div>

            {/* Content & Actions */}
            <div className="p-6 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-extrabold text-gray-900">{masterTemplate.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-full font-medium">
                    {masterTemplate.orientation.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-2 max-w-2xl leading-relaxed">
                  This is the academy's <strong className="text-gray-900">Universal Master Certificate</strong>. Any course without a specific override automatically inherits this design. It <strong className="text-gray-900">cannot be deleted</strong>, but can be updated and re-styled at any time.
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                    Canvas: <strong>{masterTemplate.widthPx}×{masterTemplate.heightPx}px</strong>
                  </span>
                  <span className="bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                    Background: <strong>{masterTemplate.backgroundImageUrl ? "Custom Background Image" : "Default Canvas"}</strong>
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                <button
                  onClick={() => setEditConfirmTarget(masterTemplate)}
                  className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2 shadow-sm"
                >
                  <Edit3 size={16} /> Edit Master Certificate
                </button>
                <button
                  onClick={() => setPreviewTarget(masterTemplate)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-200 transition flex items-center gap-2"
                >
                  <Eye size={16} /> Preview Look
                </button>
                <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                  <Lock size={12} /> Permanent Baseline · Cannot be deleted
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-amber-300 p-8 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">Universal Master Certificate</h3>
              <p className="text-xs text-gray-500 max-w-md mt-1">
                The Universal Master Certificate provides the baseline design for all courses that do not have a custom template.
              </p>
            </div>
            <button
              onClick={initMasterTemplate}
              disabled={creatingMaster}
              className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2 disabled:opacity-50"
            >
              {creatingMaster ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Initializing...
                </>
              ) : (
                <>
                  Initialize & Edit Master Certificate
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ─── 2. COURSE-SPECIFIC CERTIFICATES (OVERRIDES) ─── */}
      <div className="pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Course-Specific Certificates</h2>
            <p className="text-xs text-gray-500">
              Custom certificate designs configured for specific courses. Overrides the Universal Master Template above.
            </p>
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-black transition flex items-center gap-2 shadow-sm"
          >
            <Plus size={16} /> New Course Template
          </button>
        </div>

        {courseTemplates.length === 0 ? (
          <div className="p-10 bg-white rounded-2xl border border-dashed border-gray-200 text-center">
            <p className="text-sm font-semibold text-gray-700 mb-1">No course-specific certificates configured yet</p>
            <p className="text-xs text-gray-400 max-w-md mx-auto mb-4">
              All courses currently issue the Universal Master Certificate shown above. Click below if you want a custom design for a specific course.
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Create Course Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseTemplates.map((t) => (
              <div key={t.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                <div
                  onClick={() => setPreviewTarget(t)}
                  className="h-36 relative bg-gradient-to-br from-[#0a1628] to-[#1a2f4d] flex items-center justify-center p-3 cursor-pointer group"
                  style={
                    t.backgroundImageUrl
                      ? { backgroundImage: `url(${t.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : undefined
                  }
                >
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition" />
                  <span className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded shadow z-10">
                    Course Override
                  </span>
                  <p className="text-white/90 font-serif italic text-xs z-10">{t.widthPx}×{t.heightPx} · {t.orientation}</p>
                  <span className="absolute bottom-2 right-2 p-1 bg-black/40 text-white rounded text-[10px] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition z-10">
                    <Eye size={12} /> Preview
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col gap-2">
                  <p className="font-bold text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs font-medium text-blue-600 truncate bg-blue-50 px-2 py-1 rounded">
                    Course: {courseNameById[t.courseId || ""] || "Specific Course"}
                  </p>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => setEditConfirmTarget(t)}
                      className="flex-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50/60 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-1.5 transition"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget(t)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Delete Course Template"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── 3. TEMPLATE LOOK PREVIEW MODAL ─── */}
      {previewTarget && (
        <TemplatePreviewModal
          template={previewTarget}
          courseName={courseNameById[previewTarget.courseId || ""]}
          onClose={() => setPreviewTarget(null)}
          onEdit={() => {
            const target = previewTarget;
            setPreviewTarget(null);
            setEditConfirmTarget(target);
          }}
        />
      )}

      {/* ─── 4. CUSTOM CONFIRMATION: EDIT WARNING ─── */}
      {editConfirmTarget && (
        <ConfirmationModal
          isOpen={true}
          variant={editConfirmTarget.isDefault ? "warning" : "info"}
          title={
            editConfirmTarget.isDefault
              ? "Edit Universal Master Certificate?"
              : `Edit Certificate for "${courseNameById[editConfirmTarget.courseId || ""] || editConfirmTarget.name}"?`
          }
          message={
            editConfirmTarget.isDefault
              ? "Warning: You are about to edit the Universal Master Certificate. Any changes made to this canvas, layout, or styling will apply automatically to all academy courses that do not have a custom certificate configured. Are you sure you want to proceed to the visual editor?"
              : `You are about to edit the certificate design for "${courseNameById[editConfirmTarget.courseId || ""] || editConfirmTarget.name}". Only students who complete this specific course will be awarded this certificate. Do you want to proceed to the visual editor?`
          }
          confirmText={editConfirmTarget.isDefault ? "Yes, Proceed to Editor" : "Proceed to Editor"}
          cancelText="Cancel"
          onConfirm={executeEdit}
          onClose={() => setEditConfirmTarget(null)}
        />
      )}

      {/* ─── 5. CUSTOM CONFIRMATION: DELETE TEMPLATE ─── */}
      {deleteConfirmTarget && (
        <ConfirmationModal
          isOpen={true}
          variant="danger"
          isLoading={isDeleting}
          title={`Delete Certificate for "${courseNameById[deleteConfirmTarget.courseId || ""] || deleteConfirmTarget.name}"?`}
          message={`Are you sure you want to delete this course certificate? This action cannot be undone. All future students who finish "${courseNameById[deleteConfirmTarget.courseId || ""] || deleteConfirmTarget.name}" will automatically revert to receiving the Universal Master Certificate.`}
          confirmText="Yes, Delete Template"
          cancelText="Cancel"
          onConfirm={executeDelete}
          onClose={() => setDeleteConfirmTarget(null)}
        />
      )}

      {/* ─── 6. CREATE NEW COURSE TEMPLATE MODAL ─── */}
      {showNew && (
        <NewCourseTemplateModal
          masterTemplate={masterTemplate || undefined}
          courses={courses}
          onClose={() => setShowNew(false)}
          onCreated={(id) => {
            setShowNew(false);
            router.push(`/${locale}/admin/academy/certificates/templates/${id}`);
          }}
        />
      )}
    </div>
  );
}

// ─── VISUAL PREVIEW MODAL (HOW IT LOOKS BEFORE EDITING) ───
function TemplatePreviewModal({
  template,
  courseName,
  onClose,
  onEdit,
}: {
  template: CertificateTemplate;
  courseName?: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const scale = 0.55; // visual preview scaling

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/70">
          <div className="flex items-center gap-2">
            {template.isDefault ? (
              <span className="p-1.5 bg-amber-100 text-amber-800 rounded-lg">
                <Award size={18} />
              </span>
            ) : (
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <Star size={18} />
              </span>
            )}
            <div>
              <p className="font-bold text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">
                {template.isDefault
                  ? "Universal Master Certificate · Applies to all courses by default"
                  : `Course Override · ${courseName || "Specific Course"}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Scaled Visual Preview Canvas */}
        <div className="flex-1 overflow-auto p-6 bg-gray-100 flex items-center justify-center">
          <div
            style={{
              width: template.widthPx * scale,
              height: template.heightPx * scale,
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
            className="rounded-lg border border-gray-300"
          >
            {/* Background */}
            {template.backgroundImageUrl && (
              <img
                src={template.backgroundImageUrl}
                alt="bg"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}

            {/* Assets */}
            {(template.assets || []).map((a) => (
              <img
                key={a.id}
                src={a.url}
                alt={a.type}
                style={{
                  position: "absolute",
                  left: a.x * scale,
                  top: a.y * scale,
                  width: a.width * scale,
                  height: a.height * scale,
                  objectFit: "contain",
                }}
              />
            ))}

            {/* Fields */}
            {(template.fields || []).map((f, i) => {
              if (f.key === "qrCode") {
                const qrSize = Math.round((f.height || 76) * scale);
                const containerWidth = Math.max(f.width || (f.height || 76) + 20, 96) * scale;
                const verifyUrl = "https://academy.sajjadhusainlawassociates.com/certificates/verify/SHLA-CON-K3N8QP";
                const cardBg = (f as any).bgColor || (f.color?.startsWith("rgba") ? f.color : "rgba(255,255,255,0.96)");
                const isTransparent = cardBg === "transparent";
                const qrPatternColor = ((f as any).qrColor || "#122340").replace("#", "");
                const textColor = f.color || "#122340";
                const bgParam = getQrBgParam(cardBg);
                const textFontSize = Math.max(6, Math.round((f.fontSize || 9) * scale));
                const textFontWeight = f.fontWeight || "700";

                return (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      left: f.x * scale,
                      top: f.y * scale,
                      width: containerWidth,
                      background: cardBg,
                      padding: `${6 * scale}px ${6 * scale}px ${5 * scale}px ${6 * scale}px`,
                      borderRadius: Math.max(4, Math.round(8 * scale)),
                      border: isTransparent ? "none" : "1px solid rgba(18, 35, 64, 0.12)",
                      boxShadow: isTransparent ? "none" : "0 2px 6px rgba(0,0,0,0.06)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      boxSizing: "border-box",
                      zIndex: 3,
                    }}
                  >
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(verifyUrl)}&bgcolor=${bgParam}&color=${qrPatternColor}&margin=1`}
                      width={qrSize}
                      height={qrSize}
                      style={{
                        width: `${qrSize}px`,
                        height: `${qrSize}px`,
                        display: "block",
                        borderRadius: Math.max(2, Math.round(4 * scale)),
                        mixBlendMode: isTransparent ? "multiply" : "normal",
                      }}
                      alt="QR Code"
                    />
                    <span
                      style={{
                        fontFamily: "system-ui, sans-serif",
                        fontSize: `${textFontSize}px`,
                        fontWeight: textFontWeight,
                        color: textColor,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        marginTop: 4 * scale,
                        whiteSpace: "nowrap",
                        lineHeight: 1.1,
                      }}
                    >
                      Scan to Verify
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: f.x * scale,
                    top: f.y * scale,
                    width: f.width * scale,
                    fontSize: Math.max(8, Math.round(f.fontSize * scale)),
                    fontFamily: f.fontFamily || "Georgia, serif",
                    fontWeight: f.fontWeight || "400",
                    fontStyle: (f.italic || f.fontStyle === "italic") ? "italic" : "normal",
                    color: f.color || "#122340",
                    textAlign: f.textAlign || "center",
                    textTransform: f.uppercase ? "uppercase" : "none",
                    lineHeight: 1.2,
                  }}
                >
                  {f.key === "studentName"
                    ? "John Doe"
                    : f.key === "courseName"
                      ? courseName || "Sample Course Title"
                      : f.key === "certificateId"
                        ? "SHLA-CRS-SAMPLE"
                        : f.defaultText || f.label}
                </div>
              );
            })}

            {/* Fallback QR Indicator: ONLY shown if template has NO qrCode field */}
            {!(template.fields || []).some((f) => f.key === "qrCode") && (
              <div
                style={{
                  position: "absolute",
                  left: 80 * scale,
                  bottom: 40 * scale,
                  padding: `${4 * scale}px ${8 * scale}px`,
                  background: "rgba(255,255,255,0.9)",
                  borderRadius: 4,
                  border: "1px solid rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div style={{ width: 28 * scale, height: 28 * scale, background: "#122340", borderRadius: 2 }} />
                <span style={{ fontSize: Math.max(7, Math.round(9 * scale)), fontWeight: 700, color: "#122340" }}>
                  Scan to Verify
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/70">
          <div className="text-xs text-gray-500">
            Dimensions: <strong>{template.widthPx} × {template.heightPx} px</strong> · {template.orientation}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-100 transition">
              Close
            </button>
            <button
              onClick={onEdit}
              className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition flex items-center gap-1.5 shadow-sm"
            >
              <Edit3 size={15} /> Edit This Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEW COURSE TEMPLATE MODAL ───
function NewCourseTemplateModal({
  masterTemplate,
  courses,
  onClose,
  onCreated,
}: {
  masterTemplate?: CertificateTemplate;
  courses: any[];
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [name, setName] = useState("");
  const [courseId, setCourseId] = useState<string>("");
  const [copyFromMaster, setCopyFromMaster] = useState(true);
  const [saving, setSaving] = useState(false);

  const create = async () => {
    if (!name.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (!courseId) {
      toast.error("Please pick a course for this template");
      return;
    }
    setSaving(true);
    try {
      const res: any = await certificateApi.createTemplate({
        name: name.trim(),
        courseId,
        isDefault: false,
        copyFromTemplateId: copyFromMaster && masterTemplate ? masterTemplate.id : undefined,
      });
      const created = res?.data ?? res;
      toast.success("Course template created");
      onCreated(created.id);
    } catch (e: any) {
      toast.error(e?.message || "Failed to create template");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h3 className="text-lg font-bold text-gray-900">New Course Certificate Template</h3>
            <p className="text-xs text-gray-500 mt-0.5">Creates an override certificate design for a specific course.</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"><X size={20} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Target Course *</label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                const matched = courses.find((c: any) => c.id === e.target.value);
                if (matched && !name) {
                  setName(`${matched.title} Certificate`);
                }
              }}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select a course to attach…</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">Template Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Constitutional Law Certificate"
            />
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={copyFromMaster}
                onChange={(e) => setCopyFromMaster(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="text-xs font-bold text-blue-950">Copy design from Universal Master Template</span>
                <p className="text-[11px] text-blue-800/80 mt-0.5">
                  Inherits all canvas dimensions, field positions, and styling from the Master Certificate so you only need to tweak what's specific to this course.
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-5 border-t border-gray-100 flex justify-end gap-2 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
            Cancel
          </button>
          <button
            onClick={create}
            disabled={saving || !courseId || !name.trim()}
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold disabled:opacity-50 hover:bg-blue-700 transition shadow-sm"
          >
            {saving ? "Creating…" : "Create & Open Builder"}
          </button>
        </div>
      </div>
    </div>
  );
}
