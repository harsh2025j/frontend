"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";

export default function EditJudgmentPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        caseId: "",
        judgmentDate: "",
        judgeName: "",
        content: "",
        summary: "",
        tags: "",
    });

    useEffect(() => {
        if (params.id) {
            fetchJudgmentDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgmentDetails = async (id: string) => {
        try {
            const response = await judgmentsService.getById(id);
            const data = response.data.data;
            if (data.judgmentDate) {
                data.judgmentDate = new Date(data.judgmentDate).toISOString().split('T')[0];
            }
            if (Array.isArray(data.tags)) {
                data.tags = data.tags.join(", ");
            }
            setFormData(data);
        } catch (error) {
            console.error("Error fetching judgment details:", error);
            toast.error("Failed to fetch judgment details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { title, ...dataWithoutTitle } = formData;
            const dataToSend = {
                ...dataWithoutTitle,
                tags: formData.tags.split(",").map((tag) => tag.trim()),
            };
            await judgmentsService.update(params.id as string, dataToSend);
            toast.success("Judgment updated successfully");
            router.push("/admin/judgments");
        } catch (error) {
            console.error("Error updating judgment:", error);
            toast.error("Failed to update judgment");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader size="lg" text="Loading Judgment Details..." /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {submitting && <Loader fullScreen text="Updating Judgment..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Judgment</h1>
                    <p className="text-gray-500 text-sm">Update the details of the judgment</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">

                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Judgment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title (Auto-generated)</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Case ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="caseId"
                                value={formData.caseId}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judgment Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="judgmentDate"
                                value={formData.judgmentDate}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judge Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="judgeName"
                                value={formData.judgeName}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Content <span className="text-red-500">*</span></label>
                        <textarea
                            name="content"
                            value={formData.content}
                            required
                            rows={10}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-sm"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
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
                        className="px-6 py-2.5 bg-[#0A2342] text-white rounded-lg hover:bg-[#153a66] font-medium transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        <Save size={18} />
                        {submitting ? "Updating..." : "Update Judgment"}
                    </button>
                </div>
            </form>
        </div>
    );
}
