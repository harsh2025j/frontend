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

export const performCaseSearch = async (searchType: SearchType, inputs: SearchInputs) => {
    let response;

    if (searchType === "caseNumber") {
        if (!inputs.caseNumber.trim()) {
            return [];
        }
        // Use specific endpoint for case number
        response = await casesService.getByNumber(inputs.caseNumber.trim());
    }
    else {
        const params: any = {};

        // Validation & Param Construction
        if (searchType === "partyName") {
            // Strictly require Party Name, Type, and Year
            if (!inputs.partyName.trim() || !inputs.partyType.trim() || !inputs.year.trim()) {
                return [];
            }
            const name = inputs.partyName.trim();
            const type = inputs.partyType.trim().toLowerCase();

            if (type === 'petitioner') params.petitioner = name;
            else if (type === 'respondent') params.respondent = name;

            params.year = inputs.year.trim();
        }
        else if (searchType === "advocateName") {
            if (!inputs.advocateName.trim()) {
                return [];
            }
            const name = inputs.advocateName.trim();
            const type = inputs.partyType.trim().toLowerCase();

            if (type === 'petitioner') params.petitionerAdvocate = name;
            else if (type === 'respondent') params.respondentAdvocate = name;

            if (inputs.year.trim()) params.year = inputs.year.trim();
        }
        else if (searchType === "caseDetails") {
            if (!inputs.court || !inputs.caseType || !inputs.year) {
                return [];
            }
            params.court = inputs.court;
            params.caseType = inputs.caseType;
            params.year = inputs.year;
        }

        // Fetch with server-side params
        console.log(params);
        response = await casesService.getAll(params);
    }

    if (response && response.data) {
        const rawData = response.data;
        let results: any[] = [];

        if (searchType === "caseNumber") {
            if (rawData.data && !Array.isArray(rawData.data)) {
                results = [rawData.data];
            } else if (Array.isArray(rawData.data)) {
                results = rawData.data;
            } else if (!Array.isArray(rawData) && rawData.id) {
                results = [rawData];
            }
        } else {
            if (rawData.data && Array.isArray(rawData.data.data)) {
                results = rawData.data.data;
            } else if (rawData.data && Array.isArray(rawData.data)) {
                results = rawData.data;
            } else if (Array.isArray(rawData)) {
                results = rawData;
            }
        }

        return results;
    }

    return [];
};
