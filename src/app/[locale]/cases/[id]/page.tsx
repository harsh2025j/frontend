"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { useParams } from "next/navigation";

export default function CaseDetailPage() {
    const params = useParams();
    const [caseData, setCaseData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchCaseDetails(params.id as string);
        }
    }, [params.id]);

    const fetchCaseDetails = async (id: string) => {
        try {
            const response = await casesService.getById(id);
            setCaseData(response.data.data);
        } catch (error) {
            console.error("Error fetching case details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!caseData) return <div>Case not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{caseData.title}</h1>
                        <p className="text-gray-500 text-lg">{caseData.caseNumber}</p>
                    </div>
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${caseData.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                            }`}
                    >
                        {caseData.status.toUpperCase()}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Court</h3>
                        <p className="text-lg">{caseData.court}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Case Type</h3>
                        <p className="text-lg capitalize">{caseData.caseType}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Filing Date</h3>
                        <p className="text-lg">{new Date(caseData.filingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Next Hearing</h3>
                        <p className="text-lg">
                            {caseData.nextHearingDate
                                ? new Date(caseData.nextHearingDate).toLocaleDateString()
                                : "Not Scheduled"}
                        </p>
                    </div>
                </div>

                <div className="border-t pt-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Parties</h2>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Petitioner</h3>
                            <p className="text-lg">{caseData.petitioner}</p>
                            <p className="text-sm text-gray-600">Advocate: {caseData.petitionerAdvocate}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500">Respondent</h3>
                            <p className="text-lg">{caseData.respondent}</p>
                            <p className="text-sm text-gray-600">Advocate: {caseData.respondentAdvocate}</p>
                        </div>
                    </div>
                </div>

                <div className="border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{caseData.description}</p>
                </div>
            </div>
        </div>
    );
}
