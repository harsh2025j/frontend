import { judgesService } from "@/data/services/judges-service/judgesService";

export type JudgeSearchType = "JudgeName" | "CourtStatus";

export interface JudgeSearchInputs {
    judgeName?: string;
    courtType?: string;
    courtName?: string; // For High Court Name
    status?: string; // Sitting / Retired
}

export const performJudgeSearch = async (searchType: JudgeSearchType, inputs: JudgeSearchInputs) => {
    const params: any = {};

    if (searchType === "JudgeName") {
        if (!inputs.judgeName) return [];
        params.search = inputs.judgeName;
    } else if (searchType === "CourtStatus") {
        if (inputs.courtType) params.court_type = inputs.courtType;
        if (inputs.courtName) params.court_name = inputs.courtName; // Or 'state' depending on backend
        if (inputs.status) params.status = inputs.status;
    }

    try {
        const response = await judgesService.getAll(params);
        // Ensure we return the array data
        // API response structure might vary, adapting to likely response
        const data = response.data?.data?.data || response.data?.data || response.data || [];
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Error performing judge search:", error);
        throw error;
    }
};
