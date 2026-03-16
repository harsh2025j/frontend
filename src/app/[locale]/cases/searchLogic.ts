import { casesService } from "@/data/services/cases-service/casesService";

export interface SearchInputs {
    caseNumber: string;
    partyName: string;
    partyType: string;
    advocateName: string;
    court: string;
    caseType: string;
    year: string;
    filingNumber: string;
    crimeNumber: string;
}

export type SearchType = "caseNumber" | "partyName" | "advocateName" | "caseDetails" | "filingNumber" | "crimeNumber";

export const performCaseSearch = async (searchType: SearchType, inputs: SearchInputs, page: number = 1, limit: number = 10) => {
    let response;

    if (searchType === "caseNumber") {
        if (!inputs.caseNumber.trim()) {
            return { results: [], total: 0, totalPages: 0 };
        }
        // Use specific endpoint for case number
        const params = {
            caseNumber: inputs.caseNumber.trim(),
            caseType: inputs.caseType,
            year: inputs.year.trim(),
            page,
            limit
        };
        response = await casesService.getByNumber(params);
    }
    else {
        const params: any = { page, limit };

        // Validation & Param Construction
        if (searchType === "partyName") {
            // Strictly require Party Name, Type, and Year
            if (!inputs.partyName.trim() || !inputs.partyType.trim() || !inputs.year.trim()) {
                return { results: [], total: 0, totalPages: 0 };
            }
            const name = inputs.partyName.trim();
            const type = inputs.partyType.trim().toLowerCase();

            if (type === 'petitioner') params.petitionerName = name;
            else if (type === 'respondent') params.respondentName = name;

            params.year = inputs.year.trim();
        }
        else if (searchType === "advocateName") {
            if (!inputs.advocateName.trim()) {
                return { results: [], total: 0, totalPages: 0 };
            }
            const name = inputs.advocateName.trim();
            const type = inputs.partyType.trim().toLowerCase();

            if (type === 'petitioner') params.petitionerAdvocate = name;
            else if (type === 'respondent') params.respondentAdvocate = name;

            if (inputs.year.trim()) params.year = inputs.year.trim();
        }
        else if (searchType === "caseDetails") {
            if (!inputs.court.trim() || !inputs.caseType.trim() || !inputs.year.trim()) {
                return { results: [], total: 0, totalPages: 0 };
            }
            params.court = inputs.court.trim();
            params.caseType = inputs.caseType.trim();
            params.year = inputs.year.trim();
        }
        else if (searchType === "filingNumber") {
            if (!inputs.filingNumber.trim() || !inputs.year.trim()) {
                return { results: [], total: 0, totalPages: 0 };
            }
            params.cnrNumber = inputs.filingNumber.trim();
            params.year = inputs.year.trim();
        }
        else if (searchType === "crimeNumber") {
            if (!inputs.crimeNumber.trim() || !inputs.year.trim()) {
                return { results: [], total: 0, totalPages: 0 };
            }
            params.firNumber = inputs.crimeNumber.trim();
            params.year = inputs.year.trim();
        }

        // Fetch with server-side params
        console.log(params);
        response = await casesService.getAll(params);
    }

    if (response && response.data) {
        const rawData = response.data;
        let results: any[] = [];
        let total = 0;
        let totalPages = 0;

        // check if it's already a paginated response (data.data.data and data.data.total)
        if (rawData.data && rawData.data.data && Array.isArray(rawData.data.data)) {
            results = rawData.data.data;
            total = rawData.data.total || results.length;
            totalPages = rawData.data.totalPages || Math.ceil(total / limit);
        }
        else if (rawData.data && Array.isArray(rawData.data)) {
            results = rawData.data;
            // The backend CasesService returns { data, total, page, limit }
            total = typeof rawData.total === 'number' ? rawData.total : results.length;
            totalPages = typeof rawData.totalPages === 'number' ? rawData.totalPages : Math.ceil(total / limit);
        } else if (Array.isArray(rawData)) {
            results = rawData;
            total = results.length;
            totalPages = 1;
        } else if (rawData.data && !Array.isArray(rawData.data)) {
            // Fallback for single object response wrapped in data
            results = [rawData.data];
            total = 1;
            totalPages = 1;
        } else if (!Array.isArray(rawData) && rawData.id) {
            results = [rawData];
            total = 1;
            totalPages = 1;
        }

        return { results, total, totalPages };
    }

    return { results: [], total: 0, totalPages: 0 };
};
