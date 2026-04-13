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
        return (
            <div className="flex flex-col justify-center items-center min-vh-100 py-20">
                <Loader size="lg" text="Fetching Judge Profile..." />
            </div>
        );
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
