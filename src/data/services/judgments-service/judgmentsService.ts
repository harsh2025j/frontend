import { API_ENDPOINTS } from "../apiConfig/apiContants";
import apiClient from "../apiConfig/apiClient";

export interface Judgment {
    id?: string;
    title?: string;
    caseId: string;
    judgeIds?: string[];
    coramIds?: string[];
    judgmentDate: string;
    judgmentType: string;
    summary: string;
    fullText?: string;
    neutralCitationHC?: string;
    neutralCitationSC?: string;
    legalPhrases?: string[];
    relevantSections?: string[];
    implementationDelivery?: string;
    judgmentLink?: string;
    outcome: string;
    benchStrength?: string;
    judgeRole?: string;
    petitionInfo?: string;
    administrativeDetails?: string;
    proceedingDetail?: string;
    petitioner?: string;
    petitionerPartyType?: string;
    respondent?: string;
    respondentPartyType?: string;
    intervenors?: string;
    amicusCuriae?: string;
    natureOfCompliance?: string;
    counselDetails?: {
        petitionerCounsel?: string;
        respondentCounsel?: string;
        intervenorCounsel?: string;
        stateCounsel?: string;
    };
    reporterCitation?: string;
    citations?: string[];
    caseNotes?: string;
    historyLink?: string;
    citationManagementSite?: string;
    keyPoints?: string[];
    articleCreator?: string;
    discoverySocialInfo?: string;
    isReserved?: boolean;
    reservedDateFrom?: string;
    reservedDuration?: string;
    nextListDate?: string;
    additionalNotes?: string;
    relatedNewsIds?: string[];
    pdfUrl?: string;
    isLandmark?: boolean;
}

export const judgmentsService = {

    getAll: async (params?: any) => {
        // console.log("Judgments Service", API_ENDPOINTS.JUDGMENTS.BASE, { params })
        return await apiClient.get(API_ENDPOINTS.JUDGMENTS.BASE, { params });
    },
    search: async (params?: any) => {
        return await apiClient.get(API_ENDPOINTS.SEARCH.JUDGMENTS, { params });
    },
    fetchMultipleJudgments: async (ids: string[]) => {
        return await apiClient.post<any>(API_ENDPOINTS.JUDGMENTS.FETCH_MULTI, { ids });
    },
    getById: async (id: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGMENTS.BASE}/${id}`);
    },
    create: async (data: any) => {
        // If data is FormData (has files), let axios set the correct Content-Type with boundary
        const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
        return await apiClient.post(API_ENDPOINTS.JUDGMENTS.BASE, data, config);
    },
    update: async (id: string, data: any) => {
        // If data is FormData (has files), let axios set the correct Content-Type with boundary
        const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
        return await apiClient.patch(`${API_ENDPOINTS.JUDGMENTS.BASE}/${id}`, data, config);
    },
    delete: async (id: string) => {
        return await apiClient.delete(`${API_ENDPOINTS.JUDGMENTS.BASE}/${id}`);
    },
    getLandmark: async () => {
        return await apiClient.get(API_ENDPOINTS.JUDGMENTS.LANDMARK);
    },
    getByCase: async (caseId: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGMENTS.BY_CASE}/${caseId}`);
    },
    getByJudge: async (judgeId: string) => {
        return await apiClient.get(`${API_ENDPOINTS.JUDGMENTS.BY_JUDGE}/${judgeId}`);
    }
};
