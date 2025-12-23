import { casesService } from "@/data/services/cases-service/casesService";

export interface SearchInputs {
    caseNumber: string;
    partyName: string;
    partyType: string;
    advocateName: string;
    court: string;
    caseType: string;
    year: string;
}

export type SearchType = "caseNumber" | "partyName" | "advocateName" | "caseDetails";

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
        // Validation: Prevent fetching all data if no inputs are provided
        if (searchType === "partyName") {
            // Strictly require Party Name, Type, and Year
            if (!inputs.partyName.trim() || !inputs.partyType.trim() || !inputs.year.trim()) {
                return [];
            }
        }
        else if (searchType === "advocateName") {
            if (!inputs.advocateName.trim()) {
                return [];
            }
        }
        else if (searchType === "caseDetails") {
            if (!inputs.court || !inputs.caseType || !inputs.year) {
                return [];
            }
        }

        // For all other search types, fetch ALL cases and filter client-side
        response = await casesService.getAll({});
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

        // Client-side filtering logic
        if (searchType === "partyName") {
            const yearInput = inputs.year.trim();
            const nameInput = inputs.partyName.trim().toLowerCase();
            const typeInput = inputs.partyType.trim().toLowerCase(); // petitioner or respondent

            results = results.filter(c => {
                let matchesYear = false;
                let matchesNameAndType = false;

                // 1. Year Check (if input provided)
                if (yearInput) {
                    // Match against either year property OR filingDate
                    // Safely handle potential undefined values
                    const cYear = c.year?.toString() || "";
                    const cFilingDate = c.filingDate?.toString() || "";

                    matchesYear = (cYear === yearInput) || (cFilingDate.substring(0, 4) === yearInput);
                }

                // 2. Name & Type Check (if name provided)
                if (nameInput) {
                    if (typeInput === 'petitioner') {
                        matchesNameAndType = c.petitioner?.toLowerCase() == (nameInput);
                    } else if (typeInput === 'respondent' && c.respondent) {
                        matchesNameAndType = c.respondent?.toLowerCase() == (nameInput);
                    }
                }

                // Strict AND: Both conditions must be true
                return matchesYear && matchesNameAndType;
            });
        }
        else if (searchType === "advocateName") {
            const yearInput = inputs.year.trim();
            const advocateNameInput = inputs.advocateName.trim().toLowerCase();
            const typeInput = inputs.partyType.trim().toLowerCase(); // petitioner or respondent

            results = results.filter(c => {
                let matchesYear = false;
                let matchesNameAndType = false;

                // 1. Year Check (if input provided)
                if (yearInput) {
                    // Match against either year property OR filingDate
                    // Safely handle potential undefined values
                    const cYear = c.year?.toString() || "";
                    const cFilingDate = c.filingDate?.toString() || "";

                    matchesYear = (cYear === yearInput) || (cFilingDate.substring(0, 4) === yearInput);
                }

                // 2. Name & Type Check (if name provided)
                if (advocateNameInput) {
                    if (typeInput === 'petitioner') {
                        matchesNameAndType = c.petitionerAdvocate?.toLowerCase() == (advocateNameInput);
                    } else if (typeInput === 'respondent' && c.respondentAdvocate) {
                        matchesNameAndType = c.respondentAdvocate?.toLowerCase() == (advocateNameInput);
                    }
                }

                // Strict AND: Both conditions must be true
                return matchesYear && matchesNameAndType;
            });
        }
        else if (searchType === "caseDetails") {
            if (inputs.court) {
                results = results.filter(c => c.court === inputs.court);
            }
            if (inputs.caseType) {
                results = results.filter(c => c.caseType?.toLowerCase() === inputs.caseType.toLowerCase());
            }
            if (inputs.year) {
                const yearVal = inputs.year.trim();
                results = results.filter(c => {
                    const cYear = c.year?.toString() || "";
                    const cFilingDate = c.filingDate?.toString() || "";
                    return cYear === yearVal || cFilingDate.slice(0, 4) == yearVal;
                });
            }
        }

        return results;
    }

    return [];
};
