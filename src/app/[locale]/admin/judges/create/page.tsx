"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import JudgeForm from "../components/JudgeForm";

export default function CreateJudgePage() {
    useDocTitle("Create New Judge | Sajjad Husain Law Associates");
    const router = useRouter();

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
                    <h1 className="text-2xl font-extrabold text-[#0A2342]">Create New Judge</h1>
                    <p className="text-gray-500 text-sm">Add a comprehensive judicial profile to the database</p>
                </div>
            </div>

            <JudgeForm />
        </div>
    );
}
