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
import SearchableSelect, { SearchableOption } from "@/components/ui/SearchableSelect";

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

    const [judges, setJudges] = useState<any[]>([]);

    useEffect(() => {
        const fetchJudges = async () => {
            try {
                const response = await judgesService.getAll();
                // Check if response.data.data is an array (direct) or object with data property (paginated)
                const judgesData = response.data.data;
                if (Array.isArray(judgesData)) {
                    setJudges(judgesData);
                } else if (judgesData && Array.isArray(judgesData.data)) {
                    setJudges(judgesData.data);
                } else {
                    setJudges([]);
                }
            } catch (error) {
                console.error("Failed to fetch judges", error);
            }
        };
        fetchJudges();
    }, []);

    const loadJudgesOptions = async (query: string): Promise<SearchableOption[]> => {
        try {
            const response = await judgesService.searchJudges(query, 1, 20);
            let items: any[] = [];
            if (Array.isArray(response.data.data)) {
                items = response.data.data;
            } else if (response.data && Array.isArray(response.data.data?.data)) {
                items = response.data.data.data;
            } else if (Array.isArray(response.data)) {
                items = response.data;
            }
            return items.map((judge: any) => ({
                value: judge.id,
                label: `${judge.name} (${judge.designation})`,
            }));
        } catch (error) {
            console.error("Failed to search judges", error);
            return [];
        }
    };

    const judgeOptions: SearchableOption[] = judges.map(j => ({
        value: j.id,
        label: `${j.name} (${j.designation})`
    }));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const dataToSubmit: any = {
                ...formData,
                acts: formData.acts.split(',').map(s => s.trim()).filter(Boolean),
                underSections: formData.underSections.split(',').map(s => s.trim()).filter(Boolean),
            };

            if (formData.opposingParties) {
                dataToSubmit.opposingParties = formData.opposingParties.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.confidentialityLevel) {
                dataToSubmit.confidentialityLevel = parseInt(formData.confidentialityLevel);
            }
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Case Number <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="caseNumber"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. WP/1234/2024"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNR Number</label>
                            <input
                                type="text"
                                name="cnrNumber"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="16-digit unique number"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. State vs John Doe"
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                            placeholder="Brief description of the case..."
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
                            <CustomSelect
                                options={caseTypeOptions}
                                value={formData.caseType}
                                onChange={(value) => setFormData({ ...formData, caseType: value })}
                                placeholder="Select Case Type"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                name="status"
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
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. High Court of Delhi"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Presiding Judge</label>
                            <SearchableSelect
                                options={judgeOptions}
                                value={formData.judgeId}
                                onChange={(value) => setFormData({ ...formData, judgeId: value })}
                                onSearch={loadJudgesOptions}
                                placeholder="Select Judge"
                                name="judgeId"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Hearing Date</label>
                            <input
                                type="date"
                                name="firstHearingDate"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Next Hearing Date</label>
                            <input
                                type="date"
                                name="nextHearingDate"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Legal Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Legal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Under Acts</label>
                            <input
                                type="text"
                                name="acts"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Comma separated e.g. IPC, CrPC"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Under Sections</label>
                            <input
                                type="text"
                                name="underSections"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Comma separated e.g. 420, 302"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Police & FIR Details (Conditional) */}
                {(formData.caseType === 'criminal' || formData.caseType === 'other') && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Police & FIR Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Police Station</label>
                                <input
                                    type="text"
                                    name="policeStation"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FIR Number</label>
                                <input
                                    type="text"
                                    name="firNumber"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FIR Year</label>
                                <input
                                    type="text"
                                    name="firYear"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Parties & Advocates */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Parties & Advocates</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Petitioner <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="petitioner"
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
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Respondent Advocate</label>
                            <input
                                type="text"
                                name="respondentAdvocate"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {/* Law Firm Access Control Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Law Firm specific Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Office ID</label>
                            <input
                                type="text"
                                name="officeId"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Enter Office ID"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Practice Area ID</label>
                            <input
                                type="text"
                                name="practiceAreaId"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Enter Practice Area ID"
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confidentiality Level (1-5)</label>
                            <select
                                name="confidentialityLevel"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all bg-white"
                                value={formData.confidentialityLevel}
                                onChange={handleChange}
                            >
                                <option value="1">1 - Public</option>
                                <option value="2">2 - Internal</option>
                                <option value="3">3 - Confidential</option>
                                <option value="4">4 - Highly Confidential</option>
                                <option value="5">5 - Top Secret</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Opposing Parties</label>
                            <input
                                type="text"
                                name="opposingParties"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="Comma separated for conflicts check"
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
                        {submitting ? "Creating..." : "Create Case"}
                    </button>
                </div>
            </form>
        </div>
    );
}
