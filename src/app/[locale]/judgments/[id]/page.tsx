"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { useParams } from "next/navigation";

export default function JudgmentDetailPage() {
    const params = useParams();
    const [judgment, setJudgment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchJudgmentDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgmentDetails = async (id: string) => {
        try {
            const response = await judgmentsService.getById(id);
            setJudgment(response.data.data);
        } catch (error) {
            console.error("Error fetching judgment details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!judgment) return <div>Judgment not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Judgment Details</h1>
                        <p className="text-gray-500">
                            Date: {new Date(judgment.judgmentDate).toLocaleDateString()}
                        </p>
                    </div>
                    {judgment.isLandmark && (
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                            Landmark Judgment
                        </span>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Summary</h2>
                    <p className="text-gray-700 bg-gray-50 p-4 rounded">{judgment.summary}</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Outcome</h2>
                    <p className="text-lg font-medium text-blue-800">{judgment.outcome}</p>
                </div>

                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Full Text</h2>
                    <div className="prose max-w-none bg-white border p-6 rounded">
                        {judgment.fullText}
                    </div>
                </div>

                {judgment.citations && judgment.citations.length > 0 && (
                    <div className="border-t pt-6">
                        <h2 className="text-lg font-semibold mb-2">Citations</h2>
                        <ul className="list-disc list-inside text-gray-700">
                            {judgment.citations.map((citation: string, index: number) => (
                                <li key={index}>{citation}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
