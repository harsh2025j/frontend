import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export interface TemplateField {
  key: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  uppercase: boolean;
  italic?: boolean;
  fontStyle?: "normal" | "italic";
  defaultText?: string;
  qrColor?: string;
  bgColor?: string;
}

export interface TemplateAsset {
  id: string;
  type: "logo" | "signature" | "seal" | "image";
  url: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CertificateRules {
  minProgressPct: number;
  requireAssignmentApproved: boolean;
  requireFinalAssessmentPass: boolean;
  minAssessmentScorePct: number;
}

export interface CertificateTemplate {
  id: string;
  name: string;
  courseId: string | null;
  isDefault: boolean;
  widthPx: number;
  heightPx: number;
  orientation: "landscape" | "portrait";
  backgroundImageUrl: string | null;
  htmlBody: string;
  css: string;
  fields: TemplateField[];
  assets: TemplateAsset[];
  rules: CertificateRules;
  createdAt: string;
  updatedAt: string;
}

export interface Certificate {
  id: string;
  certificateId: string;
  userId: string;
  courseId: string;
  enrollmentId: string;
  studentName: string;
  studentEmail: string;
  courseName: string;
  instructorName: string;
  issueDate: string;
  status: "issued" | "revoked";
  revokedAt?: string | null;
  revokedReason?: string | null;
  templateId: string;
  pdfUrl: string;
  imageUrl?: string | null;
  gradePct?: number | null;
  createdAt: string;
}

export interface VerifyResult {
  status: "valid" | "revoked" | "not_found";
  certificate?: {
    certificateId: string;
    studentName: string;
    courseName: string;
    instructorName: string;
    issueDate: string;
    pdfUrl: string;
    imageUrl?: string | null;
    status: string;
    revokedAt?: string | null;
    revokedReason?: string | null;
    platformName: string;
  };
}

const T = API_ENDPOINTS.ACADEMY.CERTIFICATES;

export const certificateApi = {
  // ─── TEMPLATES (admin) ───────────────────────────────────────────
  listTemplates: async (courseId?: string) => {
    return apiClient.get<any>(T.TEMPLATES, { params: { courseId } });
  },
  getTemplate: async (id: string) => {
    return apiClient.get<any>(T.TEMPLATE_BY_ID.replace(":id", id));
  },
  createTemplate: async (data: Partial<CertificateTemplate> & { copyFromTemplateId?: string; name: string }) => {
    return apiClient.post<any>(T.TEMPLATES, data);
  },
  updateTemplate: async (id: string, data: Partial<CertificateTemplate>) => {
    return apiClient.patch<any>(T.TEMPLATE_BY_ID.replace(":id", id), data);
  },
  deleteTemplate: async (id: string) => {
    return apiClient.delete<any>(T.TEMPLATE_BY_ID.replace(":id", id));
  },
  previewTemplate: async (id: string, sampleValues?: Record<string, string>) => {
    return apiClient.post<any>(T.TEMPLATE_PREVIEW.replace(":id", id), { sampleValues });
  },

  // ─── ISSUED (admin) ──────────────────────────────────────────────
  listCertificates: async (params: {
    q?: string;
    courseId?: string;
    status?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    return apiClient.get<any>(T.BASE, { params });
  },
  issue: async (enrollmentId: string, force?: boolean) => {
    return apiClient.post<any>(T.ISSUE, { enrollmentId, force });
  },
  manualIssue: async (data: {
    courseId: string;
    studentName: string;
    studentEmail?: string;
    instructorName?: string;
    issueDate?: string;
    grade?: string | number;
    enrollmentId?: string;
    userId?: string;
    mode?: "enrolled" | "external";
    sendEmail?: boolean;
  }) => {
    return apiClient.post<any>((T as any).MANUAL_ISSUE || `${T.BASE}/manual-issue`, data);
  },
  revoke: async (id: string, reason: string) => {
    return apiClient.post<any>(T.REVOKE.replace(":id", id), { reason });
  },
  reissue: async (id: string) => {
    return apiClient.post<any>(T.REISSUE.replace(":id", id));
  },

  // ─── STUDENT ─────────────────────────────────────────────────────
  mine: async () => {
    return apiClient.get<any>(T.MINE);
  },

  // ─── PUBLIC ──────────────────────────────────────────────────────
  verify: async (certificateId: string): Promise<VerifyResult> => {
    const normalized = normalizeCertificateId(certificateId);
    const res = await apiClient.get<any>(
      T.VERIFY.replace(":certificateId", encodeURIComponent(normalized)),
    );
    // apiClient may or may not unwrap { data } — return either shape.
    return (res?.data ?? res) as VerifyResult;
  },

  getImageUrl: async (certificateId: string): Promise<{ imageUrl: string }> => {
    const normalized = normalizeCertificateId(certificateId);
    const res = await apiClient.get<any>(
      `/academy/certificates/image-url/${encodeURIComponent(normalized)}`
    );
    return res?.data ?? res;
  },
};

/**
 * Normalizes and formats a certificate ID.
 * Examples:
 * - "SHLA-TES-9GDB4C" -> "SHLA-TES-9GDB4C"
 * - "shla-tes-9gdb4c" -> "SHLA-TES-9GDB4C"
 * - "SHLATES9GDB4C" -> "SHLA-TES-9GDB4C"
 * - "shlates9gdb4c" -> "SHLA-TES-9GDB4C"
 */
export function normalizeCertificateId(id: string): string {
  if (!id) return "";
  let clean = id.trim().toUpperCase();

  if (clean.includes("/CERTIFICATES/VERIFY/")) {
    const parts = clean.split("/CERTIFICATES/VERIFY/");
    clean = parts[parts.length - 1];
  }
  clean = clean.split("?")[0].split("#")[0].trim();

  // If 13 continuous alphanumeric chars (e.g. SHLATES9GDB4C or shlates9gdb4c)
  if (/^[A-Z0-9]{13}$/.test(clean)) {
    return `${clean.slice(0, 4)}-${clean.slice(4, 7)}-${clean.slice(7, 13)}`;
  }

  // If hyphenated
  if (clean.includes("-")) {
    const parts = clean.split("-").map((p) => p.replace(/[^A-Z0-9]/g, ""));
    const p1 = (parts[0] || "").slice(0, 4);
    const p2 = (parts[1] || "").slice(0, 3);
    const p3 = (parts[2] || "").slice(0, 6);
    return [p1, p2, p3].filter(Boolean).join("-");
  }

  return clean;
}
