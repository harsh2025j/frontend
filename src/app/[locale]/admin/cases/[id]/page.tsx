"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";

export default function EditCasePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        caseNumber: "",
        title: "",
        description: "",
        caseType: "civil",
        status: "filed",
        filingDate: "",
        court: "",
        petitioner: "",
        respondent: "",
        petitionerAdvocate: "",
        respondentAdvocate: "",
    });

    useEffect(() => {
        if (params.id) {
            fetchCaseDetails(params.id as string);
        }
    }, [params.id]);

    const fetchCaseDetails = async (id: string) => {
        try {
            const response = await casesService.getById(id);
            const data = response.data.data;
            // Format date for input field
            if (data.filingDate) {
                data.filingDate = new Date(data.filingDate).toISOString().split('T')[0];
            }
            setFormData(data);
        } catch (error: any) {
            console.error("Error fetching case details:", error);
            toast.error(error.message || "Failed to fetch case details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const { id, createdAt, updatedAt, isDeleted, judge, judgments, displayBoards, ...dataToSend } = formData as any; await casesService.update(params.id as string, dataToSend);
            toast.success("Case updated successfully");
            router.push("/admin/cases");
        } catch (error: any) {
            console.error("Error updating case:", error);
            toast.error(error.message || "Failed to update case");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader size="lg" text="Loading Case Details..." /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {submitting && <Loader fullScreen text="Updating Case..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Case</h1>
                    <p className="text-gray-500 text-sm">Update the details of the legal case</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">

                {/* Basic Information */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Case Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="caseNumber"
                                value={formData.caseNumber}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {/* Case Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Case Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Case Type</label>
                            <select
                                name="caseType"
                                value={formData.caseType}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                onChange={handleChange}
                            >
                                <option value="civil">Civil</option>
                                <option value="criminal">Criminal</option>
                                <option value="constitutional">Constitutional</option>
                                <option value="corporate">Corporate</option>
                                <option value="family">Family</option>
                                <option value="tax">Tax</option>
                                <option value="labor">Labor</option>
                                <option value="property">Property</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                                onChange={handleChange}
                            >
                                <option value="filed">Filed</option>
                                <option value="pending">Pending</option>
                                <option value="hearing">Hearing</option>
                                <option value="judgment">Judgment</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Filing Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="filingDate"
                                value={formData.filingDate}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Court <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="court"
                                value={formData.court}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Parties & Advocates */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Parties & Advocates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Petitioner <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="petitioner"
                                value={formData.petitioner}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Respondent <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="respondent"
                                value={formData.respondent}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Petitioner Advocate</label>
                            <input
                                type="text"
                                name="petitionerAdvocate"
                                value={formData.petitionerAdvocate || ""}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Advocate</label>
                            <input
                                type="text"
                                name="respondentAdvocate"
                                value={formData.respondentAdvocate || ""}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
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
                        {submitting ? "Updating..." : "Update Case"}
                    </button>
                </div>
            </form>
        </div>
    );
}
