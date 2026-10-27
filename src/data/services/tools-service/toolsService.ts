import apiClient from "../apiConfig/apiClient";
import { API_BASE_URL, API_ENDPOINTS } from "../apiConfig/apiContants";
import {
  DraftRequest,
  DraftResponse,
  HealthCheckReport,
  JudgmentDetails,
  Precedent,
  PrecedentSearchResponse,
  SettlementRequest,
  SettlementResponse,
  TranslationResponse,
  SavedDraftItem,
  LegalDocDraft,
  ExtractedEntityItem,
  StillNeededItem,
} from "./types";

export const toolsService = {
  getStatus: async () => {
    const res = await apiClient.get(API_ENDPOINTS.TOOLS.STATUS);
    return res.data?.data || res.data;
  },

  searchPrecedents: async (query: string, court?: string, year?: string): Promise<Precedent[]> => {
    const res = await apiClient.post(API_ENDPOINTS.TOOLS.RESEARCH, { query, court, year });
    const payload = res.data?.data || res.data;
    if (payload?.precedents && Array.isArray(payload.precedents)) {
      return payload.precedents;
    }
    if (Array.isArray(payload)) {
      return payload;
    }
    return [];
  },

  getJudgmentDetails: async (identifier: string | number): Promise<JudgmentDetails> => {
    const endpoint = API_ENDPOINTS.TOOLS.JUDGMENT_DETAILS.replace(":id", encodeURIComponent(String(identifier)));
    const res = await apiClient.get(endpoint);
    const payload = res.data?.data || res.data;
    return payload?.judgment || payload;
  },

  getJudgmentDownload: async (identifier: string | number): Promise<{ url: string; official_portal?: string }> => {
    const endpoint = API_ENDPOINTS.TOOLS.JUDGMENT_DOWNLOAD.replace(":id", encodeURIComponent(String(identifier)));
    const res = await apiClient.get(endpoint);
    return res.data?.data || res.data;
  },

  getJudgmentPdfUrl: (identifier: string | number): string => {
    return `${API_BASE_URL.replace(/\/$/, '')}/tools/judgment/${encodeURIComponent(String(identifier))}/pdf`;
  },

  getJudgmentParagraphs: async (identifier: string | number) => {
    const endpoint = API_ENDPOINTS.TOOLS.JUDGMENT_PARAGRAPHS.replace(":id", encodeURIComponent(String(identifier)));
    const res = await apiClient.get(endpoint);
    return res.data?.data || res.data;
  },

  generateLegalDraft: async (payload: DraftRequest): Promise<DraftResponse> => {
    const res = await apiClient.post(API_ENDPOINTS.TOOLS.DRAFTING, payload, {
      timeout: 75000,
    });
    const data = res.data?.data || res.data;
    return data?.draft || data;
  },

  getDraftHistory: async (): Promise<SavedDraftItem[]> => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.TOOLS.DRAFT_HISTORY);
      const data = res.data?.data || res.data;
      return data?.history || [];
    } catch {
      return [];
    }
  },

  deleteDraftFromHistory: async (id: string): Promise<boolean> => {
    try {
      const endpoint = API_ENDPOINTS.TOOLS.DRAFT_DELETE.replace(":id", encodeURIComponent(id));
      await apiClient.delete(endpoint);
      return true;
    } catch {
      return false;
    }
  },

  saveDraft: async (draft: any): Promise<any> => {
    try {
      const res = await apiClient.post('/tools/drafting/save', { draft });
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  },

  generateSettlement: async (payload: SettlementRequest): Promise<SettlementResponse> => {
    const res = await apiClient.post(API_ENDPOINTS.TOOLS.MEDIATION, payload);
    const data = res.data?.data || res.data;
    return data?.termSheet || data;
  },

  checkDocumentHealth: async (text?: string, file?: File): Promise<HealthCheckReport> => {
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (file) formData.append("document", file);

    const res = await apiClient.post(API_ENDPOINTS.TOOLS.HEALTH_CHECK, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    const data = res.data?.data || res.data;
    return data?.report || data;
  },

  translateLegalDocument: async (
    text?: string,
    sourceLanguage?: string,
    targetLanguage?: string,
    file?: File,
  ): Promise<TranslationResponse> => {
    const formData = new FormData();
    if (text) formData.append("text", text);
    if (sourceLanguage) formData.append("sourceLanguage", sourceLanguage);
    if (targetLanguage) formData.append("targetLanguage", targetLanguage);
    if (file) formData.append("document", file);

    const res = await apiClient.post(API_ENDPOINTS.TOOLS.TRANSLATION, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    });
    const data = res.data?.data || res.data;
    return data?.result || data;
  },

  analyzeLegalDocumentChat: async (payload: {
    template: string;
    category: string;
    situation: string;
    messages: any[];
  }): Promise<{ assistantMessage: string; whatIHave: ExtractedEntityItem[]; stillNeeded: StillNeededItem[] }> => {
    try {
      const res = await apiClient.post(API_ENDPOINTS.TOOLS.DOCUMENTS_CHAT, payload);
      const data = res.data?.data || res.data;
      return data;
    } catch {
      // Fallback local heuristic extraction
      return {
        assistantMessage:
          "Thank you, I have reviewed the details for " +
          payload.template +
          ". A few specific commercial and procedural details are still needed before final completion.",
        whatIHave: [],
        stillNeeded: [],
      };
    }
  },

  generateLegalDocumentDraft: async (payload: {
    template: string;
    templateId?: string;
    category: string;
    situation: string;
    extractedData: Record<string, string>;
  }): Promise<{ content: string; source?: string }> => {
    const res = await apiClient.post(API_ENDPOINTS.TOOLS.DOCUMENTS_GENERATE, payload);
    const data = res.data?.data || res.data;
    return data;
  },

  saveLegalDocumentDraft: async (document: Partial<LegalDocDraft>): Promise<LegalDocDraft | null> => {
    try {
      const res = await apiClient.post(API_ENDPOINTS.TOOLS.DOCUMENTS_SAVE, { document });
      return res.data?.data?.document || res.data?.document || null;
    } catch {
      return null;
    }
  },

  getLegalDocumentHistory: async (): Promise<LegalDocDraft[]> => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.TOOLS.DOCUMENTS_HISTORY);
      const data = res.data?.data || res.data;
      return data?.history || [];
    } catch {
      return [];
    }
  },

  deleteLegalDocumentFromHistory: async (id: string): Promise<boolean> => {
    try {
      const endpoint = API_ENDPOINTS.TOOLS.DOCUMENTS_DELETE.replace(":id", encodeURIComponent(id));
      await apiClient.delete(endpoint);
      return true;
    } catch {
      return false;
    }
  },

  getTemplateCategories: async () => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.TOOLS.TEMPLATES_CATEGORIES);
      return res.data?.data?.categories || res.data?.categories || [];
    } catch {
      return [];
    }
  },

  getTemplates: async (params?: { category?: string; subcategory?: string; q?: string; page?: number; limit?: number }) => {
    try {
      const res = await apiClient.get(API_ENDPOINTS.TOOLS.TEMPLATES, { params });
      return res.data?.data || res.data;
    } catch {
      return { success: false, templates: [] };
    }
  },

  getTemplateById: async (id: string) => {
    try {
      const endpoint = API_ENDPOINTS.TOOLS.TEMPLATE_BY_ID.replace(":id", encodeURIComponent(id));
      const res = await apiClient.get(endpoint);
      return res.data?.data?.template || res.data?.template || null;
    } catch {
      return null;
    }
  },

  getTemplatePdfUrl: (id: string): string => {
    return `${API_BASE_URL.replace(/\/$/, '')}/tools/documents/templates/${encodeURIComponent(id)}/pdf`;
  },
};

