"use client";

import React, { useState } from "react";
import { reportsService } from "@/data/services/reports-service/reportsService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, BarChart2, FileText } from "lucide-react";

export default function CreateReportPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [reportType, setReportType] = useState("case_statistics");
    const [formData, setFormData] = useState({
        startDate: "",
        endDate: "",
        generatedBy: "current-user-id", // In a real app, get this from auth context
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (reportType === "case_statistics") {
                await reportsService.generateCaseStatistics(formData);
            } else if (reportType === "judgment_analysis") {
                await reportsService.generateJudgmentAnalysis(formData);
            }
            toast.success("Report generated successfully");
            router.push("/admin/reports");
        } catch (error) {
            console.error("Error generating report:", error);
            toast.error("Failed to generate report");
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            {submitting && <Loader fullScreen text="Generating Report..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Generate New Report</h1>
                    <p className="text-gray-500 text-sm">Select report type and date range</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <div className="mb-8">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Report Type</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setReportType("case_statistics")}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${reportType === "case_statistics"
                                ? "border-[#0A2342] bg-[#0A2342]/5 text-[#0A2342]"
                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                                }`}
                        >
                            <BarChart2 size={24} />
                            <span className="font-medium">Case Statistics</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setReportType("judgment_analysis")}
                            className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center gap-2 transition-all ${reportType === "judgment_analysis"
                                ? "border-[#0A2342] bg-[#0A2342]/5 text-[#0A2342]"
                                : "border-gray-200 hover:border-gray-300 text-gray-600"
                                }`}
                        >
                            <FileText size={24} />
                            <span className="font-medium">Judgment Analysis</span>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="startDate"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="endDate"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? "Generating..." : "Generate Report"}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
}
