"use client";

import React, { useEffect, useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";

export default function EditJudgePage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        court: "",
        appointmentDate: "",
        retirementDate: "",
        bio: "",
        imageUrl: "",
    });

    useEffect(() => {
        if (params.id) {
            fetchJudgeDetails(params.id as string);
        }
    }, [params.id]);

    const fetchJudgeDetails = async (id: string) => {
        try {
            const response = await judgesService.getById(id);
            const data = response.data.data;
            if (data.appointmentDate) {
                data.appointmentDate = new Date(data.appointmentDate).toISOString().split('T')[0];
            }
            if (data.retirementDate) {
                data.retirementDate = new Date(data.retirementDate).toISOString().split('T')[0];
            }
            setFormData(data);
        } catch (error) {
            console.error("Error fetching judge details:", error);
            toast.error("Failed to fetch judge details");
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
            await judgesService.update(params.id as string, formData);
            toast.success("Judge profile updated successfully");
            router.push("/admin/judges");
        } catch (error) {
            console.error("Error updating judge:", error);
            toast.error("Failed to update judge profile");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader size="lg" text="Loading Profile..." /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {submitting && <Loader fullScreen text="Updating Profile..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Judge</h1>
                    <p className="text-gray-500 text-sm">Update the details of the judge</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">

                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Profile Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl || ""}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Retirement Date</label>
                            <input
                                type="date"
                                name="retirementDate"
                                value={formData.retirementDate || ""}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                        <textarea
                            name="bio"
                            value={formData.bio || ""}
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
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
                        {submitting ? "Updating..." : "Update Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
