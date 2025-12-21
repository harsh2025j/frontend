"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { Link } from "@/i18n/routing";

export default function JudgesPage() {
    const [judges, setJudges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJudges();
    }, []);

    const fetchJudges = async () => {
        try {
            const response = await judgesService.getAll();
            setJudges(response.data.data.data);
        } catch (error) {
            console.error("Error fetching judges:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Judges</h1>
            </div>

            {loading ? (
                <div>Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {judges.map((judge) => (
                        <div key={judge.id} className="bg-white rounded-lg shadow p-6">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600">
                                    {judge.name.charAt(0)}
                                </div>
                                <div className="ml-4">
                                    <h2 className="text-lg font-semibold">{judge.name}</h2>
                                    <p className="text-sm text-gray-500">{judge.designation}</p>
                                </div>
                            </div>
                            <p className="text-gray-600 mb-2">
                                <span className="font-medium">Court:</span> {judge.court}
                            </p>
                            <p className="text-gray-600 mb-4">
                                <span className="font-medium">Specialization:</span>{" "}
                                {judge.specialization?.join(", ")}
                            </p>
                            <Link
                                href={`/judges/${judge.id}`}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                                View Profile
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
