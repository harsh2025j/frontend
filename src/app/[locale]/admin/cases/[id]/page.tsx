"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import CustomSelect from "@/components/ui/CustomSelect";
import { caseTypeOptions } from "@/constants/caseOptions";
import InfiniteSearchableSelect from "@/components/ui/InfiniteSearchableSelect";

export default function EditCasePage() {
    useDocTitle("Edit Case  | Sajjad Husain Law Associates");
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
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
        acts: "",
        underSections: "",
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
        opposingParties: "", // visual string state
    });

    const [initialJudge, setInitialJudge] = useState<any>(null);

    const extractTotalPages = (response: any) => {
        const meta = response.data?.meta ?? response.data?.data?.meta;
        if (meta?.totalPages) return meta.totalPages;
        
        const total = response.data?.data?.total ?? response.data?.total ?? 0;
        const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
        return total > 0 ? Math.ceil(total / limit) : 1;
    };

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
            // Format date for input field
            const formatDate = (dateString: string | null) => dateString ? new Date(dateString).toISOString().split('T')[0] : "";

            if (data.filingDate) data.filingDate = formatDate(data.filingDate);
            if (data.firstHearingDate) data.firstHearingDate = formatDate(data.firstHearingDate);
            if (data.nextHearingDate) data.nextHearingDate = formatDate(data.nextHearingDate);

            // Handle arrays for visual state
            if (Array.isArray(data.acts)) data.acts = data.acts.join(', ');
            if (Array.isArray(data.underSections)) data.underSections = data.underSections.join(', ');
            if (Array.isArray(data.opposingParties)) data.opposingParties = data.opposingParties.join(', ');

            // Handle judge relation
            if (data.judge) {
                data.judgeId = data.judge.id;
                setInitialJudge({
                    value: data.judge.id,
                    label: data.judge.name,
                    subLabel: data.judge.designation
                });
            }

            setFormData(data);
        } catch (error: any) {
            // console.error("Error fetching case details:", error);
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
            const dataToSubmit: any = {
                ...formData,
                acts: typeof formData.acts === 'string' ? formData.acts.split(',').map(s => s.trim()).filter(Boolean) : formData.acts,
                underSections: typeof formData.underSections === 'string' ? formData.underSections.split(',').map(s => s.trim()).filter(Boolean) : formData.underSections,
            };
            if (typeof formData.opposingParties === 'string') {
                dataToSubmit.opposingParties = formData.opposingParties.split(',').map(s => s.trim()).filter(Boolean);
            }
            if (formData.confidentialityLevel) {
                dataToSubmit.confidentialityLevel = parseInt(String(formData.confidentialityLevel));
            }
            if (!formData.officeId) delete dataToSubmit.officeId;
            if (!formData.practiceAreaId) delete dataToSubmit.practiceAreaId;

            const { id, createdAt, updatedAt, isDeleted, judge, judgments, displayBoards, ...dataToSend } = dataToSubmit as any;
            await casesService.update(params.id as string, dataToSend);
            toast.success("Case updated successfully");
            router.push("/admin/cases");
        } catch (error: any) {
            // console.error("Error updating case:", error);
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">CNR Number</label>
                            <input
                                type="text"
                                name="cnrNumber"
                                value={formData.cnrNumber || ""}
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
                            <CustomSelect
                                options={caseTypeOptions}
                                value={formData.caseType}
                                onChange={(value) => setFormData({ ...formData, caseType: value })}
                                placeholder="Select Case Type"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Presiding Judge</label>
                            <InfiniteSearchableSelect
                                name="judgeId"
                                value={formData.judgeId}
                                initialOption={initialJudge}
                                onChange={(value) => setFormData({ ...formData, judgeId: value })}
                                onSearch={async (query, page) => {
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

                {/* Legal Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Legal Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Under Acts</label>
                            <input
                                type="text"
                                name="acts"
                                value={formData.acts || ""}
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
                                value={formData.underSections || ""}
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
                                    value={formData.policeStation || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FIR Number</label>
                                <input
                                    type="text"
                                    name="firNumber"
                                    value={formData.firNumber || ""}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">FIR Year</label>
                                <input
                                    type="text"
                                    name="firYear"
                                    value={formData.firYear || ""}
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

                {/* Law Firm Access Control Details */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Law Firm specific Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Office ID</label>
                            <input
                                type="text"
                                name="officeId"
                                value={formData.officeId || ""}
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
                                value={formData.practiceAreaId || ""}
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
                                value={formData.confidentialityLevel || "3"}
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
                                value={formData.opposingParties || ""}
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
                        {submitting ? "Updating..." : "Update Case"}
                    </button>
                </div>
            </form>
        </div>
    );
}
