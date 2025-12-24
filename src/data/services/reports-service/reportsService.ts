import apiClient from "../apiConfig/apiClient";
import { API_ENDPOINTS } from "../apiConfig/apiContants";

export interface CaseStatistics {
    totalCases: number;
    pendingCases: number;
    resolvedCases: number;
    casesByType: {
        type: string;
        count: number;
    }[];
    casesByStatus: {
        status: string;
        count: number;
    }[];
    monthlyTrends: {
        month: string;
        filed: number;
        resolved: number;
    }[];
}

export interface JudgmentAnalysis {
    totalJudgments: number;
    landmarkJudgments: number;
    judgmentsByCategory: {
        category: string;
        count: number;
    }[];
    judgmentsByJudge: {
        judgeName: string;
        count: number;
    }[];
    recentJudgments: {
        id: string;
        title: string;
        date: string;
        category: string;
    }[];
}

export interface Report {
    id: string;
    title: string;
    description: string;
    type: "case-statistics" | "judgment-analysis" | "custom";
    generatedDate: string;
    generatedBy: string;
    fileUrl?: string;
    data?: any;
}

export interface ReportsResponse {
    reports: Report[];
    total: number;
}

export const reportsService = {
    // Get all reports
    getAllReports: async (): Promise<ReportsResponse> => {
        const response = await apiClient.get<ReportsResponse>(API_ENDPOINTS.REPORTS.BASE);
        return response.data;
    },

    // Generate case statistics report
    generateCaseStats: async (): Promise<CaseStatistics> => {
        const response = await apiClient.post<CaseStatistics>(
            API_ENDPOINTS.REPORTS.GENERATE_CASE_STATS
        );
        return response.data;
    },

    // Generate judgment analysis report
    generateJudgmentAnalysis: async (): Promise<JudgmentAnalysis> => {
        const response = await apiClient.post<JudgmentAnalysis>(
            API_ENDPOINTS.REPORTS.GENERATE_JUDGMENT_ANALYSIS
        );
        return response.data;
    },

    // Get report by ID
    getReportById: async (id: string): Promise<Report> => {
        const response = await apiClient.get<Report>(`${API_ENDPOINTS.REPORTS.BASE}/${id}`);
        return response.data;
    },

    // Download report
    downloadReport: async (id: string): Promise<Blob> => {
        const response = await apiClient.get(`${API_ENDPOINTS.REPORTS.BASE}/${id}/download`, {
            responseType: 'blob'
        });
        return response.data;
    },
};
