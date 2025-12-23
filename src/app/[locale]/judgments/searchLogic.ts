import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";

export interface JudgmentSearchInputs {
    caseId: string;
    caseNumber: string;
    caseType?: string;
    court?: string;
    judgeName: string;
    judgmentDate: string;
    startDate?: string;
    endDate?: string;
    year?: string;
}

export type JudgmentSearchType = "caseNumber" | "Judge" | "JudgementDate";

export const performJudgmentSearch = async (searchType: JudgmentSearchType, inputs: JudgmentSearchInputs) => {
    let response;
    let results: any[] = [];

    const params: any = {};

    // Validations & Param Construction
    if (searchType === "caseNumber") {
        if (!inputs.caseNumber.trim()) return [];
        params.caseNumber = inputs.caseNumber.trim();
        if (inputs.caseType) params.caseType = inputs.caseType;
    }
    else if (searchType === "Judge") {
        if (!inputs.judgeName.trim()) return [];
        params.judgeName = inputs.judgeName.trim();
        if (inputs.court) params.court = inputs.court;
        if (inputs.year) params.year = inputs.year.trim();
    }
    else if (searchType === "JudgementDate") {
        // Required: Court, Start Date, End Date
        if (!inputs.court || !inputs.startDate?.trim() || !inputs.endDate?.trim()) {
            return [];
        }
        params.courtName = inputs.court;
        params.startDate = inputs.startDate.trim();
        params.endDate = inputs.endDate.trim();
    }

    try {
        // Fetch all judgments for all search types to allow client-side filtering
        response = await judgmentsService.getAll(params);
        // console.log("All Judgments filtered", response);

        if (response && response.data) {
            const rawData = response.data;
            if (rawData.data && Array.isArray(rawData.data.data)) {
                results = rawData.data.data;
            } else if (rawData.data && Array.isArray(rawData.data)) {
                results = rawData.data;
            } else if (Array.isArray(rawData)) { // Direct array
                results = rawData;
            }
        }
    } catch (error) {
        console.error("Error performing judgment search:", error);
        return [];
    }

    return results;
};
