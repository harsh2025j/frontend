import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";

export interface JudgmentSearchInputs {
    caseId: string;
    caseNumber: string;
    judgeName: string;
    judgmentDate: string;
}

export type JudgmentSearchType = "caseNumber" | "Judge" | "JudgementDate";

export const performJudgmentSearch = async (searchType: JudgmentSearchType, inputs: JudgmentSearchInputs) => {
    let response;
    let results: any[] = [];

    // Validations to prevent empty searches
    if (searchType === "caseNumber" && !inputs.caseNumber.trim()) return [];
    if (searchType === "Judge" && !inputs.judgeName.trim()) return [];
    if (searchType === "JudgementDate" && !inputs.judgmentDate.trim()) return [];

    try {
        // Fetch all judgments for all search types to allow client-side filtering
        response = await judgmentsService.getAll();
        console.log("All Judgments filtered", response);

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

    // Client-side filtering
    if (searchType === "caseNumber") {
        const q = inputs.caseNumber.trim().toLowerCase();
        results = results.filter(j => {
            // Match against caseId or (safely) caseNumber if populated
            const cId = j.caseId?.toLowerCase() || "";
            // Check if 'case' object exists and has 'caseNumber'
            const cNum = j.case?.caseNumber?.toLowerCase() || "";

            return cId.includes(q) || cNum.includes(q);
        });
    } else if (searchType === "Judge") {
        const q = inputs.judgeName.toLowerCase().trim();
        // Assuming judgment object has 'judge' object or 'judgeName' property.
        // Based on interface in service: judgeId: string.
        // If data is populated, might have judge.name. Check safely.
        results = results.filter(j => {
            // adjust property access based on actual API response structure
            const name = j.judge?.name || j.judgeName || "";
            return name.toLowerCase().includes(q);
        });
    } else if (searchType === "JudgementDate") {
        const q = inputs.judgmentDate.trim();
        results = results.filter(j => {
            const d = j.judgmentDate || "";
            // simple string match or date comparison
            return d.includes(q);
        });
    }

    return results;
};
