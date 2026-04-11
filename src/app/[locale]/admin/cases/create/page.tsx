"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import CustomSelect from "@/components/ui/CustomSelect";
import { caseTypeOptions } from "@/constants/caseOptions";
import InfiniteSearchableSelect from "@/components/ui/InfiniteSearchableSelect";
import CourtSearchableDropdown from "@/components/ui/CourtSearchableDropdown";
import FormField from "@/components/ui/FormField";

export default function CreateCasePage() {
    useDocTitle("Create Case  | Sajjad Husain Law Associates");
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        caseNumber: "",
        cnrNumber: "",
        title: "",
        description: "",
        caseType: "civil",
        status: "filed",
        filingDate: "",
        firstHearingDate: "",
        nextHearingDate: "",
        court: "",
        judgeId: "",
        acts: "", // visual state as string
        underSections: "", // visual state as string
        policeStation: "",
        firNumber: "",
        firYear: "",
        petitioner: "",
        respondent: "",
        petitionerAdvocate: "",
        respondentAdvocate: "",
        officeId: "",
        practiceAreaId: "",
        confidentialityLevel: "3",
        opposingParties: "", // visual state as string
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const extractTotalPages = (response: any) => {
        const meta = response.data?.meta ?? response.data?.data?.meta;
        if (meta?.totalPages) return meta.totalPages;

        const total = response.data?.data?.total ?? response.data?.total ?? 0;
        const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
        return total > 0 ? Math.ceil(total / limit) : 1;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
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
            { key: 'caseNumber', label: 'Case Number' },
            { key: 'cnrNumber', label: 'CNR Number' }, // Added
            { key: 'title', label: 'Title' },
            { key: 'caseType', label: 'Case Type' },
            { key: 'filingDate', label: 'Filing Date' },
            { key: 'court', label: 'Court' },
            { key: 'petitioner', label: 'Petitioner' },
            { key: 'respondent', label: 'Respondent' },
            { key: 'petitionerAdvocate', label: 'Petitioner Advocate' }, // Added
            { key: 'respondentAdvocate', label: 'Respondent Advocate' }, // Added
        ];

        const newErrors: Record<string, string> = {};
        for (const field of requiredFields) {
            if (!formData[field.key as keyof typeof formData]) {
                newErrors[field.key] = `${field.label} is required`;
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            
            // Scroll to the first error
            const firstErrorKey = Object.keys(newErrors)[0];
            const element = document.getElementsByName(firstErrorKey)[0];
            if (element) {
                // Scroll to the parent FormField (the .group div) for better visibility
                const container = element.closest('.group');
                if (container) {
                    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                // If it's a focusable element, focus it
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                    element.focus();
                }
            }
            return;
        }

        setSubmitting(true);
        try {
            const dataToSubmit: any = {
                ...formData,
                acts: formData.acts.split(',').map(s => s.trim()).filter(Boolean),
                underSections: formData.underSections.split(',').map(s => s.trim()).filter(Boolean),
            };

            if (formData.opposingParties) {
                dataToSubmit.opposingParties = formData.opposingParties.split(',').map(s => s.trim()).filter(Boolean);
            } else {
                delete dataToSubmit.opposingParties;
            }
            if (formData.confidentialityLevel) {
                dataToSubmit.confidentialityLevel = parseInt(formData.confidentialityLevel);
            }
            if (!formData.firstHearingDate) delete dataToSubmit.firstHearingDate;
            if (!formData.nextHearingDate) delete dataToSubmit.nextHearingDate;
            if (!formData.officeId) delete dataToSubmit.officeId;
            if (!formData.practiceAreaId) delete dataToSubmit.practiceAreaId;

            await casesService.create(dataToSubmit);
            toast.success("Case created successfully");
            router.push("/admin/cases");
        } catch (error: any) {
            // console.error("Error creating case:", error);
            toast.error(error.message || "Failed to create case");
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {submitting && <Loader fullScreen text="Creating Case..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Case</h1>
                    <p className="text-gray-500 text-sm">Enter the details of the new legal case</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">

                {/* Basic Information */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Case Number" error={errors.caseNumber} required>
                            <input
                                type="text"
                                name="caseNumber"
                                className={inputClasses('caseNumber')}
                                placeholder="e.g. WP/1234/2024"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="CNR Number" error={errors.cnrNumber} required>
                            <input
                                type="text"
                                name="cnrNumber"
                                className={inputClasses('cnrNumber')}
                                placeholder="16-digit unique number"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Title" error={errors.title} required>
                            <input
                                type="text"
                                name="title"
                                className={inputClasses('title')}
                                placeholder="e.g. State vs John Doe"
                                onChange={handleChange}
                            />
                        </FormField>
                    </div>

                    <FormField label="Description" error={errors.description}>
                        <textarea
                            name="description"
                            rows={4}
                            className={inputClasses('description')}
                            placeholder="Brief description of the case..."
                            onChange={handleChange}
                        />
                    </FormField>
                </div>

                {/* Case Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Case Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Case Type" error={errors.caseType} required>
                            <CustomSelect
                                name="caseType"
                                options={caseTypeOptions}
                                value={formData.caseType}
                                onChange={(value) => {
                                    setFormData({ ...formData, caseType: value });
                                    if (errors.caseType) {
                                        setErrors(prev => {
                                            const next = { ...prev };
                                            delete next.caseType;
                                            return next;
                                        });
                                    }
                                }}
                                placeholder="Select Case Type"
                            />
                        </FormField>
                        <FormField label="Status" error={errors.status}>
                            <select
                                name="status"
                                className={inputClasses('status')}
                                onChange={handleChange}
                            >
                                <option value="filed">Filed</option>
                                <option value="pending">Pending</option>
                                <option value="hearing">Hearing</option>
                                <option value="judgment">Judgment</option>
                                <option value="closed">Closed</option>
                            </select>
                        </FormField>
                        <FormField label="Filing Date" error={errors.filingDate} required>
                            <input
                                type="date"
                                name="filingDate"
                                className={inputClasses('filingDate')}
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
                        <FormField label="Presiding Judge" error={errors.judgeId}>
                            <InfiniteSearchableSelect
                                name="judgeId"
                                value={formData.judgeId}
                                error={errors.judgeId}
                                onChange={(value) => {
                                    setFormData({ ...formData, judgeId: value });
                                    if (errors.judgeId) {
                                        setErrors(prev => {
                                            const next = { ...prev };
                                            delete next.judgeId;
                                            return next;
                                        });
                                    }
                                }}
                                onSearch={async (query: string, page: number) => {
                                    const res = query.trim()
                                        ? await judgesService.searchJudges(query, page, 10)
                                        : await judgesService.getAll({ page, limit: 10 });

                                    const items = res.data?.data?.data || res.data?.data || [];
                                    return {
                                        options: items.map((j: any) => ({
                                            value: j.id,
                                            label: j.name,
                                            subLabel: j.email ? `${j.designation} (${j.email})` : j.designation
                                        })),
                                        totalPages: extractTotalPages(res)
                                    };
                                }}
                                placeholder="Select Judge"
                            />
                        </FormField>
                        <FormField label="First Hearing Date" error={errors.firstHearingDate}>
                            <input
                                type="date"
                                name="firstHearingDate"
                                className={inputClasses('firstHearingDate')}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Next Hearing Date" error={errors.nextHearingDate}>
                            <input
                                type="date"
                                name="nextHearingDate"
                                className={inputClasses('nextHearingDate')}
                                onChange={handleChange}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Legal Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Legal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Under Acts" error={errors.acts}>
                            <input
                                type="text"
                                name="acts"
                                className={inputClasses('acts')}
                                placeholder="Comma separated e.g. IPC, CrPC"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Under Sections" error={errors.underSections}>
                            <input
                                type="text"
                                name="underSections"
                                className={inputClasses('underSections')}
                                placeholder="Comma separated e.g. 420, 302"
                                onChange={handleChange}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Police & FIR Details (Conditional) */}
                {(formData.caseType === 'criminal' || formData.caseType === 'other') && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Police & FIR Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField label="Police Station" error={errors.policeStation}>
                                <input
                                    type="text"
                                    name="policeStation"
                                    className={inputClasses('policeStation')}
                                    onChange={handleChange}
                                />
                            </FormField>
                            <FormField label="FIR Number" error={errors.firNumber}>
                                <input
                                    type="text"
                                    name="firNumber"
                                    className={inputClasses('firNumber')}
                                    onChange={handleChange}
                                />
                            </FormField>
                            <FormField label="FIR Year" error={errors.firYear}>
                                <input
                                    type="text"
                                    name="firYear"
                                    className={inputClasses('firYear')}
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                    </div>
                )}

                {/* Parties & Advocates */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Parties & Advocates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Petitioner" error={errors.petitioner} required>
                            <input
                                type="text"
                                name="petitioner"
                                className={inputClasses('petitioner')}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Respondent" error={errors.respondent} required>
                            <input
                                type="text"
                                name="respondent"
                                className={inputClasses('respondent')}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Petitioner Advocate" error={errors.petitionerAdvocate} required>
                            <input
                                type="text"
                                name="petitionerAdvocate"
                                className={inputClasses('petitionerAdvocate')}
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Respondent Advocate" error={errors.respondentAdvocate} required>
                            <input
                                type="text"
                                name="respondentAdvocate"
                                className={inputClasses('respondentAdvocate')}
                                onChange={handleChange}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Law Firm Access Control Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Law Firm specific Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField label="Office ID" error={errors.officeId}>
                            <input
                                type="text"
                                name="officeId"
                                className={inputClasses('officeId')}
                                placeholder="Enter Office ID"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Practice Area ID" error={errors.practiceAreaId}>
                            <input
                                type="text"
                                name="practiceAreaId"
                                className={inputClasses('practiceAreaId')}
                                placeholder="Enter Practice Area ID"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Confidentiality Level" error={errors.confidentialityLevel}>
                            <select
                                name="confidentialityLevel"
                                className={inputClasses('confidentialityLevel')}
                                value={formData.confidentialityLevel}
                                onChange={handleChange}
                            >
                                <option value="1">1 - Public</option>
                                <option value="2">2 - Internal</option>
                                <option value="3">3 - Confidential</option>
                                <option value="4">4 - Highly Confidential</option>
                                <option value="5">5 - Top Secret</option>
                            </select>
                        </FormField>
                        <FormField label="Opposing Parties" error={errors.opposingParties}>
                            <input
                                type="text"
                                name="opposingParties"
                                className={inputClasses('opposingParties')}
                                placeholder="Comma separated for conflicts check"
                                onChange={handleChange}
                            />
                        </FormField>
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
                        {submitting ? "Creating..." : "Create Case"}
                    </button>
                </div>
            </form>
        </div>
    );
}
