import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";

export interface JudgmentSearchInputs {
    caseNumber?: string;
    caseType?: string;
    year?: string;
    diaryNumber?: string;
    freeText?: string;
    fromDate?: string;
    toDate?: string;
    judgeName?: string;
    judgeYear?: string;
    page?: number;
}

export type JudgmentSearchType = "caseNumber" | "diaryNumber" | "freeText" | "judgeName";

export const performJudgmentSearch = async (searchType: JudgmentSearchType, inputs: JudgmentSearchInputs) => {
    let response;
    let resultsData = { data: [] as any[], total: 0, page: inputs.page || 1, limit: 10 };

    const params: any = {
        page: inputs.page || 1,
        limit: 10
    };

    try {
        if (searchType === "caseNumber") {
            if (!inputs.caseNumber?.trim()) return resultsData;
            params.caseNumber = inputs.caseNumber.trim();
            if (inputs.caseType) params.caseType = inputs.caseType.trim();
            if (inputs.year) params.year = inputs.year.trim();

            response = await judgmentsService.getAll(params);
        }
        else if (searchType === "diaryNumber") {
            if (!inputs.diaryNumber?.trim()) return resultsData;
            params.diaryNumber = inputs.diaryNumber.trim();
            if (inputs.year) params.year = inputs.year.trim();

            response = await judgmentsService.getAll(params);
        }
        else if (searchType === "freeText") {
            if (!inputs.freeText?.trim()) return resultsData;
            response = await judgmentsService.search({
                q: inputs.freeText.trim(),
                fromDate: inputs.fromDate,
                toDate: inputs.toDate,
                page: inputs.page || 1,
                limit: 10
            });
        }
        else if (searchType === "judgeName") {
            if (!inputs.judgeName?.trim()) return resultsData;
            params.judgeName = inputs.judgeName.trim();
            if (inputs.judgeYear) params.judgeYear = parseInt(inputs.judgeYear.trim());

            response = await judgmentsService.getAll(params);
        }

        if (response && response.data) {
            const rawData = response.data;
            if (rawData.data && Array.isArray(rawData.data.data)) {
                resultsData = {
                    data: rawData.data.data,
                    total: rawData.data.total ?? rawData.data.data.length,
                    page: rawData.data.page ?? params.page,
                    limit: rawData.data.limit ?? params.limit
                };
            } else if (rawData.data && Array.isArray(rawData.data)) {
                resultsData = {
                    data: rawData.data,
                    total: rawData.meta?.totalItems ?? rawData.total ?? rawData.data.length,
                    page: rawData.meta?.currentPage ?? rawData.page ?? params.page,
                    limit: rawData.limit ?? params.limit
                };
            } else if (Array.isArray(rawData)) { // Direct array
                resultsData = {
                    data: rawData,
                    total: rawData.length,
                    page: params.page,
                    limit: params.limit
                };
            } else if (rawData.data && rawData.total !== undefined) {
                resultsData = {
                    data: rawData.data,
                    total: rawData.total,
                    page: rawData.page ?? params.page,
                    limit: rawData.limit ?? params.limit
                };
            }
        }
    } catch (error) {
        console.error("Error performing judgment search:", error);
        return resultsData;
    }

    return resultsData;
};
