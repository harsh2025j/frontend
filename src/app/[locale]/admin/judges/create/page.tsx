"use client";

import React, { useState } from "react";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import FormField from "@/components/ui/FormField";
import CourtSearchableDropdown from "@/components/ui/CourtSearchableDropdown";

export default function CreateJudgePage() {
    useDocTitle("Create Judge  | Sajjad Husain Law Associates");
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        designation: "",
        court: "",
        appointmentDate: "",
        retirementDate: "",
        biography: "",
        photoUrl: "",
        specialization: "",
        isServing: true,
        isPublished: true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});



    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const inputClasses = (name: string) => `w-full px-4 py-2 border rounded-lg outline-none transition-all ${
        errors[name] 
            ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/5 placeholder:text-red-300" 
            : "border-gray-300 focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] bg-white"
    }`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Manual validation
        const requiredFields = [
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Official Email' },
            { key: 'designation', label: 'Designation' },
            { key: 'court', label: 'Court' },
            { key: 'appointmentDate', label: 'Appointment Date' }
        ];

        const newErrors: Record<string, string> = {};
        for (const field of requiredFields) {
            if (!formData[field.key as keyof typeof formData]) {
                newErrors[field.key] = `${field.label} is required`;
            }
        }

        // Email validation
        if (!newErrors.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                newErrors.email = "Please enter a valid email address";
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            
            // Scroll to the first error
            const firstErrorKey = Object.keys(newErrors)[0];
            const element = document.getElementsByName(firstErrorKey)[0];
            if (element) {
                const container = element.closest('.group');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.focus();
                }
            }
            return;
        }

        setSubmitting(true);
        try {
            const dataToSend: any = {
                ...formData,
                specialization: formData.specialization.split(",").map(s => s.trim()).filter(Boolean),
            };
            if (!formData.retirementDate) delete dataToSend.retirementDate;
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
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
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
                        <FormField label="Name" error={errors.name} required>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                className={inputClasses('name')}
                                placeholder="e.g. Justice John Smith"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Official Email" error={errors.email} required>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                className={inputClasses('email')}
                                placeholder="judge@court.gov.in"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Designation" error={errors.designation} required>
                            <input
                                type="text"
                                name="designation"
                                value={formData.designation}
                                className={inputClasses('designation')}
                                placeholder="e.g. Chief Justice"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Court" error={errors.court} required>
                            <CourtSearchableDropdown
                                name="court"
                                value={formData.court}
                                error={errors.court}
                                onChange={(value) => {
                                    setFormData({ ...formData, court: value });
                                    if (errors.court) {
                                        setErrors(prev => {
                                            const next = { ...prev };
                                            delete next.court;
                                            return next;
                                        });
                                    }
                                }}
                            />
                        </FormField>
                        <FormField label="Photo URL" error={errors.photoUrl}>
                            <input
                                type="text"
                                name="photoUrl"
                                value={formData.photoUrl}
                                className={inputClasses('photoUrl')}
                                placeholder="https://example.com/image.jpg"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Appointment Date" error={errors.appointmentDate} required>
                            <input
                                type="date"
                                name="appointmentDate"
                                value={formData.appointmentDate}
                                className={inputClasses('appointmentDate')}
                                onChange={handleChange}
                            />
                        </FormField>
                        <div className="flex items-center pt-8">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isServing"
                                    checked={formData.isServing}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[#0A2342] border-gray-300 rounded focus:ring-[#C9A227]"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-[#C9A227] transition-colors">Currently Serving</span>
                            </label>
                        </div>

                        <FormField label="Retirement Date" error={errors.retirementDate}>
                            <input
                                type="date"
                                name="retirementDate"
                                value={formData.retirementDate}
                                className={inputClasses('retirementDate')}
                                onChange={handleChange}
                            />
                        </FormField>
                        <div className="md:col-span-2">
                            <FormField label="Specialization" error={errors.specialization}>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    className={inputClasses('specialization')}
                                    placeholder="Constitutional Law, Criminal Law (comma separated)"
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>

                        <div className="md:col-span-2">
                            <FormField label="Biography" error={errors.biography}>
                                <textarea
                                    name="biography"
                                    value={formData.biography}
                                    rows={4}
                                    className={inputClasses('biography')}
                                    placeholder="Distinguished jurist..."
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    name="isPublished"
                                    checked={formData.isPublished}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[#0A2342] border-gray-300 rounded focus:ring-[#C9A227]"
                                />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-[#C9A227] transition-colors">Published</span>
                            </label>
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
