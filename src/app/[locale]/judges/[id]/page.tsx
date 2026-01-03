"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useParams, useRouter } from "next/navigation";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";

export default function JudgeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [judge, setJudge] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchJudgeDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgeDetails = async (id: string) => {
        try {
            const data = await judgesService.getById(id);
            setJudge(data);
        } catch (error) {
            console.error("Error fetching judge details:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!judge) return <div>Judge not found</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="bg-white shadow rounded-lg overflow-hidden">

                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors mb-6"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div className="bg-blue-600 h-32"></div>
                <div className="px-6 pb-6">
                    <div className="relative flex items-end -mt-16 mb-6">
                        <div className="h-32 w-32 rounded-full bg-white p-1 shadow-lg">
                            <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-4xl font-bold text-gray-600">
                                {judge.name.charAt(0)}
                            </div>
                        </div>
                        <div className="ml-6 mb-2 pt-16">
                            <h1 className="text-3xl font-bold text-gray-900">{judge.name}</h1>
                            <p className="text-lg text-gray-600">{judge.designation}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Court
                            </h3>
                            <p className="text-lg font-medium">{judge.court}</p>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                                Status
                            </h3>
                            <span
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${judge.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                    }`}
                            >
                                {judge.isActive ? "Active" : "Retired"}
                            </span>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-3">Biography</h3>
                        <p className="text-gray-700 leading-relaxed">{judge.biography}</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-3">Specializations</h3>
                        <div className="flex flex-wrap gap-2">
                            {judge.specialization?.map((spec: string, index: number) => (
                                <span
                                    key={index}
                                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                >
                                    {spec}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
