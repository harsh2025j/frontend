"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { judgesService } from "@/data/services/judges-service/judgesService";
import JudgeForm from "../components/JudgeForm";
import { Judge } from "@/data/services/judges-service/judges.types";

export default function EditJudgePage() {
    useDocTitle("Edit Judge Profile | Sajjad Husain Law Associates");
    const router = useRouter();
    const params = useParams();
    const [judge, setJudge] = useState<Judge | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (params.id) {
            fetchJudgeDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgeDetails = async (id: string) => {
        try {
            const response = await judgesService.getById(id);
            const data = response.data.data;
            
            // Format dates for input fields (YYYY-MM-DD)
            if (data.dob) data.dob = new Date(data.dob).toISOString().split('T')[0];
            if (data.appointmentDate) data.appointmentDate = new Date(data.appointmentDate).toISOString().split('T')[0];
            if (data.retirementDate) data.retirementDate = new Date(data.retirementDate).toISOString().split('T')[0];
            
            setJudge(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to fetch judge details");
            router.push("/admin/judges");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <EditJudgeSkeleton />;
    }

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-extrabold text-[#0A2342]">Edit Judge Profile</h1>
                    <p className="text-gray-500 text-sm">Update comprehensive details for {judge?.prefix} {judge?.name}</p>
                </div>
            </div>

            {judge && <JudgeForm initialData={judge} />}
        </div>
    );
}

function EditJudgeSkeleton() {
    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100 bg-gray-50/50">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="px-6 py-4">
                            <div className="h-5 w-24 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>

                <div className="p-8 min-h-[500px]">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="w-full md:w-1/3">
                            <div className="space-y-2 mb-2">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                            </div>
                            <div className="aspect-square rounded-2xl bg-gray-200 border-2 border-dashed border-gray-300"></div>
                        </div>

                        <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2 space-y-2">
                                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
                            </div>
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                                    <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <div className="h-10 w-20 bg-gray-200 rounded-lg"></div>
                    <div className="h-10 w-24 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        </div>
    );
}
