"use client";

import React, { useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateJudgePage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        designation: "",
        court: "",
        appointmentDate: "",
        retirementDate: "",
        biography: "",
        photoUrl: "",
        specialization: "",
        isActive: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dataToSend = {
                ...formData,
                specialization: formData.specialization.split(",").map(s => s.trim()).filter(Boolean),
            };
            await judgesService.create(dataToSend);
            toast.success("Judge profile created successfully");
            router.push("/admin/judges");
        } catch (error: any) {
            console.error("Error creating judge:", error);
            toast.error(error.message || "Failed to create judge profile");
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {submitting && <Loader fullScreen text="Creating Profile..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Judge</h1>
                    <p className="text-gray-500 text-sm">Enter the details of the judge</p>
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
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. Justice John Smith"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Designation <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="designation"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. Chief Justice"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Court <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="court"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. Supreme Court"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                            <input
                                type="text"
                                name="photoUrl"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="https://example.com/image.jpg"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Appointment Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                name="appointmentDate"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                            <input
                                type="text"
                                name="specialization"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Constitutional Law, Criminal Law (comma separated)"
                                onChange={handleChange}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    checked={formData.isActive}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[#0A2342] border-gray-300 rounded focus:ring-[#C9A227]"
                                />
                                <span className="text-sm font-medium text-gray-700">Active Judge</span>
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                            <textarea
                                name="biography"
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Distinguished jurist..."
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
                        {submitting ? "Creating..." : "Create Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
}
