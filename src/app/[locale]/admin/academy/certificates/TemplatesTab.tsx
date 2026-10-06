"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit3, Trash2, X, Award, Eye, Loader2, Lock, Star, LayoutTemplate } from "lucide-react";
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
  if (m && m.length >= 3) return `${m[0]}-${m[1]}-${m[2]}`;
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

      const hasMaster = tList.some((t) => t.isDefault || t.name?.toLowerCase().includes("universal"));
      if (!hasMaster) {
        try {
          const createRes: any = await certificateApi.createTemplate({
            name: "Universal Master Certificate",
            isDefault: true,
            courseId: null,
          });
          const created = createRes?.data?.data ?? createRes?.data ?? createRes;
          if (created?.id) tList = [created, ...tList];
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
      templates.find((t) => t.name?.toLowerCase().includes("universal") || t.name?.toLowerCase().includes("master")) ||
      (!templates.some((t) => t.courseId) && templates.length > 0 ? templates[0] : null)
    );
  }, [templates]);

  const courseTemplates = useMemo(() => {
    if (!masterTemplate) return templates.filter((t) => !t.isDefault);
    return templates.filter((t) => t.id !== masterTemplate.id);
  }, [templates, masterTemplate]);

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

  const executeEdit = () => {
    if (!editConfirmTarget) return;
    const targetId = editConfirmTarget.id;
    setEditConfirmTarget(null);
    setPreviewTarget(null);
    router.push(`/${locale}/admin/academy/certificates/templates/${targetId}`);
  };

  /* ─────────────────── JSX ─────────────────── */
  return (
    <div className="space-y-6">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel+Decorative:wght@700&family=Cinzel:wght@400;600;700;900&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Dancing+Script:wght@400;600;700&family=Great+Vibes&family=Inter:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Merriweather:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,400&family=Pinyon+Script&family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Roboto:ital,wght@0,300;0,400;0,700;1,400&display=swap"
      />

      {/* ── 1. Master / Universal Template ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Award size={18} className="text-amber-500" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Universal Master Certificate</h2>
          <span className="ml-auto flex items-center gap-1 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
            <Lock size={11} /> Permanent Baseline
          </span>
        </div>

        {loading && !masterTemplate ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 size={18} className="animate-spin text-blue-500" /> Loading…
          </div>
        ) : masterTemplate ? (
          <div className="bg-white rounded-2xl border border-amber-200/60 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* Visual Thumbnail */}
              <div
                onClick={() => setPreviewTarget(masterTemplate)}
                className="md:w-72 h-44 md:h-auto relative cursor-pointer group overflow-hidden shrink-0"
                style={
                  masterTemplate.backgroundImageUrl
                    ? { backgroundImage: `url(${masterTemplate.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : { background: "linear-gradient(135deg, #0c192c 0%, #162a4a 50%, #0c192c 100%)" }
                }
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all duration-300" />
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow">
                    Master
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 z-10">
                  <span className="text-[10px] text-white/80 font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
                    {masterTemplate.widthPx}×{masterTemplate.heightPx}px
                  </span>
                </div>
              </div>

              {/* Info & Actions */}
              <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-extrabold text-gray-900">{masterTemplate.name}</h3>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full font-semibold uppercase">
                      {masterTemplate.orientation}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-lg">
                    The academy's baseline certificate. All courses without a custom template inherit this design automatically.
                    It <strong className="text-gray-700">cannot be deleted</strong>.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                      Canvas: <strong>{masterTemplate.widthPx}×{masterTemplate.heightPx}px</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-gray-50 border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                      Background: <strong>{masterTemplate.backgroundImageUrl ? "Custom Image" : "Default Canvas"}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setEditConfirmTarget(masterTemplate)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition cursor-pointer"
                  >
                    <Edit3 size={15} /> Edit Master
                  </button>
                  <button
                    onClick={() => setPreviewTarget(masterTemplate)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition cursor-pointer"
                  >
                    <Eye size={15} /> Preview
                  </button>
                  <span className="ml-auto text-xs text-gray-400 flex items-center gap-1">
                    <Lock size={11} /> Cannot be deleted
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-amber-300 p-10 text-center flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award size={26} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">No Master Template Found</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-sm">
                Initialize the Universal Master Certificate to set a baseline design for all academy courses.
              </p>
            </div>
            <button
              onClick={initMasterTemplate}
              disabled={creatingMaster}
              className="mt-1 flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {creatingMaster ? <><Loader2 size={15} className="animate-spin" /> Initializing…</> : "Initialize Master Template"}
            </button>
          </div>
        )}
      </section>

      {/* ── 2. Course-Specific Templates ── */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <LayoutTemplate size={18} className="text-blue-500" />
          <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Course-Specific Overrides</h2>
          <span className="ml-1 text-xs text-gray-400 font-medium">
            ({courseTemplates.length} template{courseTemplates.length !== 1 ? "s" : ""})
          </span>
          <button
            onClick={() => setShowNew(true)}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus size={14} /> New Template
          </button>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
            <Loader2 size={16} className="animate-spin text-blue-500" /> Loading templates…
          </div>
        ) : courseTemplates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <LayoutTemplate size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700">No course-specific templates yet</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              All courses use the Universal Master Certificate above. Create a course override if you need a unique design for a specific course.
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Plus size={13} /> Create Course Template
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseTemplates.map((t) => (
              <div key={t.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                {/* Thumbnail */}
                <div
                  onClick={() => setPreviewTarget(t)}
                  className="h-36 relative cursor-pointer overflow-hidden"
                  style={
                    t.backgroundImageUrl
                      ? { backgroundImage: `url(${t.backgroundImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                      : { background: "linear-gradient(135deg, #0a1628 0%, #1a2f4d 100%)" }
                  }
                >
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-all" />
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-md z-10">
                    Override
                  </span>
                  <span className="absolute top-3 right-3 text-[10px] text-white/80 font-mono bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm z-10">
                    {t.widthPx}×{t.heightPx}
                  </span>

                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col gap-2.5">
                  <div>
                    <p className="font-bold text-gray-900 truncate leading-tight">{t.name}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1 bg-blue-50 px-2.5 py-1 rounded-lg truncate">
                      {courseNameById[t.courseId || ""] || "Specific Course"}
                    </p>
                  </div>
                  <div className="mt-auto pt-3 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => setEditConfirmTarget(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl transition cursor-pointer"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setPreviewTarget(t)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                    >
                      <Eye size={13} /> Preview
                    </button>
                    <button
                      onClick={() => setDeleteConfirmTarget(t)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ─── Preview Modal ─── */}
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

      {/* ─── Edit Confirm ─── */}
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
              ? "Warning: Changes to this canvas will apply to all courses without a custom template. Do you want to proceed to the visual editor?"
              : `You are about to edit the certificate design for "${courseNameById[editConfirmTarget.courseId || ""] || editConfirmTarget.name}". Do you want to proceed to the visual editor?`
          }
          confirmText={editConfirmTarget.isDefault ? "Yes, Proceed to Editor" : "Proceed to Editor"}
          cancelText="Cancel"
          onConfirm={executeEdit}
          onClose={() => setEditConfirmTarget(null)}
        />
      )}

      {/* ─── Delete Confirm ─── */}
      {deleteConfirmTarget && (
        <ConfirmationModal
          isOpen={true}
          variant="danger"
          isLoading={isDeleting}
          title={`Delete "${courseNameById[deleteConfirmTarget.courseId || ""] || deleteConfirmTarget.name}"?`}
          message={`This action cannot be undone. Future students in "${courseNameById[deleteConfirmTarget.courseId || ""] || deleteConfirmTarget.name}" will automatically revert to the Universal Master Certificate.`}
          confirmText="Yes, Delete Template"
          cancelText="Cancel"
          onConfirm={executeDelete}
          onClose={() => setDeleteConfirmTarget(null)}
        />
      )}

      {/* ─── New Course Template Modal ─── */}
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

/* ─── Template Preview Modal ─── */
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
  const scale = 0.55;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/60">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${template.isDefault ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
              {template.isDefault ? <Award size={18} /> : <Star size={18} />}
            </div>
            <div>
              <p className="font-bold text-gray-900">{template.name}</p>
              <p className="text-xs text-gray-500">
                {template.isDefault ? "Universal Master · Applies to all courses by default" : `Course Override · ${courseName || "Specific Course"}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Canvas Preview */}
        <div className="flex-1 overflow-auto p-8 bg-gray-100 flex items-start justify-center">
          <div
            style={{
              width: template.widthPx * scale,
              height: template.heightPx * scale,
              position: "relative",
              boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
              overflow: "hidden",
              backgroundColor: "#ffffff",
            }}
            className="rounded-xl border border-gray-200"
          >
            {template.backgroundImageUrl && (
              <img src={template.backgroundImageUrl} alt="bg" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            )}
            {(template.assets || []).map((a) => (
              <img key={a.id} src={a.url} alt={a.type} style={{ position: "absolute", left: a.x * scale, top: a.y * scale, width: a.width * scale, height: a.height * scale, objectFit: "contain" }} />
            ))}
            {(template.fields || []).map((f, i) => {
              if (f.key === "qrCode") {
                const qrCalcSize = Math.max(f.height || 88, 88);
                const qrSize = Math.round(qrCalcSize * scale);
                const containerWidth = Math.round(Math.max(f.width || 112, qrCalcSize + 24) * scale);
                const verifyUrl = "https://academy.sajjadhusainlawassociates.com/v/SHLA-CON-K3N8QP";
                const qrPatternColor = ((f as any).qrColor || "#122340").replace("#", "");
                const textColor = f.color || "#122340";
                const textFontSize = Math.max(6, Math.round(Math.max(8, Math.min(13, Math.round(qrCalcSize * 0.1))) * scale));
                return (
                  <div key={i} style={{ position: "absolute", left: f.x * scale, top: f.y * scale, width: containerWidth, background: "#ffffff", padding: `${6 * scale}px ${8 * scale}px`, borderRadius: Math.max(4, Math.round(8 * scale)), border: "1px solid rgba(18,35,64,0.12)", boxShadow: "0 2px 6px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", boxSizing: "border-box", zIndex: 3 }}>
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=${qrPatternColor}&margin=2&ecc=H`} width={qrSize} height={qrSize} style={{ width: `${qrSize}px`, height: `${qrSize}px`, display: "block", imageRendering: "pixelated" }} alt="QR Code" />
                    <span style={{ fontFamily: "system-ui, sans-serif", fontSize: `${textFontSize}px`, fontWeight: "700", color: textColor, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 * scale, whiteSpace: "nowrap", lineHeight: 1.1 }}>Scan to Verify</span>
                  </div>
                );
              }
              return (
                <div key={i} style={{ position: "absolute", left: f.x * scale, top: f.y * scale, width: f.width * scale, fontSize: Math.max(8, Math.round(f.fontSize * scale)), fontFamily: f.fontFamily || "Georgia, serif", fontWeight: f.fontWeight || "400", fontStyle: (f.italic || f.fontStyle === "italic") ? "italic" : "normal", color: f.color || "#122340", textAlign: f.textAlign || "center", textTransform: f.uppercase ? "uppercase" : "none", lineHeight: 1.2 }}>
                  {f.key === "studentName" ? "John Doe" : f.key === "courseName" ? courseName || "Sample Course Title" : f.key === "certificateId" ? "SHLA-CRS-SAMPLE" : f.defaultText || f.label}
                </div>
              );
            })}
            {!(template.fields || []).some((f) => f.key === "qrCode") && (
              <div style={{ position: "absolute", left: 80 * scale, bottom: 40 * scale, padding: `${4 * scale}px ${8 * scale}px`, background: "rgba(255,255,255,0.9)", borderRadius: 4, border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 28 * scale, height: 28 * scale, background: "#122340", borderRadius: 2 }} />
                <span style={{ fontSize: Math.max(7, Math.round(9 * scale)), fontWeight: 700, color: "#122340" }}>Scan to Verify</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
          <p className="text-xs text-gray-400">
            {template.widthPx} × {template.heightPx} px &middot; {template.orientation}
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 transition cursor-pointer">
              Close
            </button>
            <button onClick={onEdit} className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition flex items-center gap-1.5 cursor-pointer">
              <Edit3 size={14} /> Edit Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── New Course Template Modal ─── */
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
    if (!name.trim()) { toast.error("Template name is required"); return; }
    if (!courseId) { toast.error("Please pick a course for this template"); return; }
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">New Course Certificate</h3>
              <p className="text-xs text-gray-400">Creates a custom override for a specific course</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Target Course <span className="text-red-500">*</span>
            </label>
            <select
              value={courseId}
              onChange={(e) => {
                setCourseId(e.target.value);
                const matched = courses.find((c: any) => c.id === e.target.value);
                if (matched && !name) setName(`${matched.title} Certificate`);
              }}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="">Select a course…</option>
              {courses.map((c: any) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Template Name <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              placeholder="e.g. Constitutional Law Certificate"
            />
          </div>

          <label className="flex items-start gap-3 p-3.5 bg-blue-50/60 border border-blue-100 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={copyFromMaster}
              onChange={(e) => setCopyFromMaster(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <div>
              <p className="text-xs font-bold text-blue-900">Copy design from Universal Master Template</p>
              <p className="text-[11px] text-blue-700/80 mt-0.5">
                Inherits canvas dimensions, field positions, and styling from the Master Certificate — just tweak what's course-specific.
              </p>
            </div>
          </label>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5 bg-gray-50/50">
          <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition cursor-pointer">
            Cancel
          </button>
          <button
            onClick={create}
            disabled={saving || !courseId || !name.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-50 transition shadow-sm cursor-pointer"
          >
            {saving ? "Creating…" : "Create & Open Builder"}
          </button>
        </div>
      </div>
    </div>
  );
}
