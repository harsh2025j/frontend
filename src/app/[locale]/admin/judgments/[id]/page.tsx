"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { casesService } from "@/data/services/cases-service/casesService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save, Plus, X } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import InfiniteSearchableSelect from "@/components/ui/InfiniteSearchableSelect";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FormField from "@/components/ui/FormField";

export default function EditJudgmentPage() {
    useDocTitle("Edit Judgment  | Sajjad Husain Law Associates");
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cases, setCases] = useState<any[]>([]);
    const [judges, setJudges] = useState<any[]>([]);
    const [initialCase, setInitialCase] = useState<any>(null);
    const [initialJudge, setInitialJudge] = useState<any>(null);

    const [formData, setFormData] = useState({
        title: "",
        caseId: "",
        judgeId: "",
        judgmentDate: "",
        judgmentType: "final",
        outcome: "",
        isLandmark: false,
        citations: [] as string[],
        keyPoints: [] as string[],
        summary: "",
        fullText: "",
        pdfUrl: "",
        petitioner: "",
        respondent: "",
        petitionerCounsel: "",
        respondentCounsel: "",
        bench: "",
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const [newCitation, setNewCitation] = useState("");
    const [newKeyPoint, setNewKeyPoint] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [judgmentRes, casesRes, judgesRes] = await Promise.all([
                    judgmentsService.getById(params.id as string),
                    casesService.getAll(),
                    judgesService.getAll()
                ]);

                // Process Cases and Judges
                const casesData = casesRes.data?.data?.data || casesRes.data?.data || casesRes.data || [];
                const judgesData = judgesRes.data?.data?.data || judgesRes.data?.data || judgesRes.data || [];

                setCases(Array.isArray(casesData) ? casesData : []);
                setJudges(Array.isArray(judgesData) ? judgesData : []);

                // Process Judgment Data
                let data = judgmentRes.data;
                if (data.data) {
                    data = data.data;
                }

                // Ensure arrays are initialized
                if (!data.citations) data.citations = [];
                if (!data.keyPoints) data.keyPoints = [];

                // Map fields if necessary
                let judgeId = "";
                if (data.judge && data.judge.id) {
                    judgeId = data.judge.id;
                    setInitialJudge({
                        value: data.judge.id,
                        label: data.judge.name,
                        subLabel: data.judge.designation
                    });
                } else if (data.judgeId) {
                    judgeId = data.judgeId;
                }

                let caseId = "";
                if (data.case && data.case.id) {
                    caseId = data.case.id;
                    setInitialCase({
                        value: data.case.id,
                        label: `${data.case.caseNumber} - ${data.case.title}`,
                        subLabel: data.case.court
                    });
                } else if (data.caseId) {
                    caseId = data.caseId;
                }

                // Format date for input
                let judgmentDate = "";
                if (data.judgmentDate) {
                    judgmentDate = new Date(data.judgmentDate).toISOString().split('T')[0];
                }

                let parsedCitations: string[] = [];
                if (Array.isArray(data.citations)) {
                    parsedCitations = data.citations;
                } else if (typeof data.citations === 'string' && data.citations.trim()) {
                    parsedCitations = data.citations.split(',').map((c: string) => c.trim()).filter(Boolean);
                }

                let parsedKeyPoints: string[] = [];
                if (Array.isArray(data.keyPoints)) {
                    parsedKeyPoints = data.keyPoints;
                } else if (typeof data.keyPoints === 'string' && data.keyPoints.trim()) {
                    parsedKeyPoints = data.keyPoints.split(',').map((k: string) => k.trim()).filter(Boolean);
                }

                setFormData({
                    title: data.title || "",
                    caseId: caseId,
                    judgeId: judgeId,
                    judgmentDate: judgmentDate,
                    judgmentType: data.judgmentType || "final",
                    outcome: data.outcome || "",
                    isLandmark: data.isLandmark || false,
                    citations: parsedCitations,
                    keyPoints: parsedKeyPoints,
                    summary: data.summary || "",
                    fullText: data.fullText || data.content || "",
                    pdfUrl: data.pdfUrl || "",
                    petitioner: data.petitioner || "",
                    respondent: data.respondent || "",
                    petitionerCounsel: data.petitionerCounsel || "",
                    respondentCounsel: data.respondentCounsel || "",
                    bench: data.bench || "",
                });

            } catch (error: any) {
                console.error("Error fetching data:", error);
                toast.error(error.message || "Failed to fetch data");
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchData();
        }
    }, [params.id]);

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

    const handleFullTextChange = (value: string) => {
        setFormData(prev => ({ ...prev, fullText: value }));
        if (errors.fullText) {
            setErrors(prev => {
                const next = { ...prev };
                delete next.fullText;
                return next;
            });
        }
    };

    const addCitation = () => {
        if (newCitation.trim()) {
            setFormData(prev => ({ ...prev, citations: [...prev.citations, newCitation.trim()] }));
            setNewCitation("");
        }
    };

    const removeCitation = (index: number) => {
        setFormData(prev => ({ ...prev, citations: prev.citations.filter((_, i) => i !== index) }));
    };

    const addKeyPoint = () => {
        if (newKeyPoint.trim()) {
            setFormData(prev => ({ ...prev, keyPoints: [...prev.keyPoints, newKeyPoint.trim()] }));
            setNewKeyPoint("");
        }
    };

    const removeKeyPoint = (index: number) => {
        setFormData(prev => ({ ...prev, keyPoints: prev.keyPoints.filter((_, i) => i !== index) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Manual validation
        const requiredFields = [
            { key: 'title', label: 'Title' },
            { key: 'caseId', label: 'Case Selection' },
            { key: 'judgeId', label: 'Select Judge' }, // Added
            { key: 'judgmentDate', label: 'Judgment Date' },
            { key: 'outcome', label: 'Outcome' },
            { key: 'petitioner', label: 'Petitioner / Appellant' }, // Added
            { key: 'respondent', label: 'Respondent / Defendant' }, // Added
            { key: 'petitionerCounsel', label: "Petitioner's Counsel" }, // Added
            { key: 'respondentCounsel', label: "Respondent's Counsel" }, // Added
            { key: 'bench', label: 'Coram / Bench' }, // Added
            { key: 'summary', label: 'Summary' },
            { key: 'fullText', label: 'Full Judgment Text' }
        ];

        const newErrors: Record<string, string> = {};
        for (const field of requiredFields) {
            const value = formData[field.key as keyof typeof formData];
            if (!value || (typeof value === 'string' && value.trim() === '')) {
                newErrors[field.key] = `${field.label} is required`;
            }
        }

        // Additional check for RichTextEditor to remove HTML tags and check if empty
        const stripHtml = (html: string) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        };

        if (!newErrors.fullText && stripHtml(formData.fullText).trim() === '') {
            newErrors.fullText = "Full Judgment Text cannot be empty";
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
            // Exclude read-only and relational fields from payload as needed. Title is now editable.
            const { ...dataToSend } = formData;

            await judgmentsService.update(params.id as string, dataToSend);
            toast.success("Judgment updated successfully");
            router.push("/admin/judgments");
        } catch (error: any) {
            console.error("Error updating judgment:", error);
            toast.error(error.message || "Failed to update judgment");
            setSubmitting(false);
        }
    };

    const extractTotalPages = (response: any) => {
        const meta = response.data?.meta ?? response.data?.data?.meta;
        if (meta?.totalPages) return meta.totalPages;
        
        const total = response.data?.data?.total ?? response.data?.total ?? 0;
        const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
        return total > 0 ? Math.ceil(total / limit) : 1;
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><Loader size="lg" text="Loading Judgment Details..." /></div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            {submitting && <Loader fullScreen text="Updating Judgment..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
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
                            <FormField label="Title" error={errors.title} required>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    className={inputClasses('title')}
                                    placeholder="Enter an appropriate title for the judgment"
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>
                        <div className="md:col-span-2">
                            <FormField label="Select Case" error={errors.caseId} required>
                                <InfiniteSearchableSelect
                                    name="caseId"
                                    value={formData.caseId}
                                    error={errors.caseId}
                                    initialOption={initialCase}
                                    onChange={(val) => {
                                        setFormData(prev => ({ ...prev, caseId: val }));
                                        if (errors.caseId) {
                                            setErrors(prev => {
                                                const next = { ...prev };
                                                delete next.caseId;
                                                return next;
                                            });
                                        }
                                    }}
                                    placeholder="Search and select a case..."
                                    className="w-full"
                                    options={cases.map((c: any) => ({
                                        value: c.id,
                                        label: `${c.caseNumber} - ${c.title}`,
                                        subLabel: c.court
                                    }))}
                                    onSearch={async (query, page) => {
                                        const res = query.trim()
                                            ? await casesService.searchCases(query, page, 10)
                                            : await casesService.getAll({ page, limit: 10 });

                                        const items = res.data?.data?.data || res.data?.data || [];
                                        return {
                                            options: items.map((c: any) => ({
                                                value: c.id,
                                                label: `${c.caseNumber} - ${c.title}`,
                                                subLabel: c.court
                                            })),
                                            totalPages: extractTotalPages(res)
                                        };
                                    }}
                                />
                            </FormField>
                        </div>

                        <FormField label="Judgment Date" error={errors.judgmentDate} required>
                            <input
                                type="date"
                                name="judgmentDate"
                                value={formData.judgmentDate}
                                className={inputClasses('judgmentDate')}
                                onChange={handleChange}
                            />
                        </FormField>

                        <FormField label="Select Judge" error={errors.judgeId} required>
                            <InfiniteSearchableSelect
                                name="judgeId"
                                value={formData.judgeId}
                                initialOption={initialJudge}
                                error={errors.judgeId}
                                onChange={(val) => {
                                    setFormData(prev => ({ ...prev, judgeId: val }));
                                    if (errors.judgeId) {
                                        setErrors(prev => {
                                            const next = { ...prev };
                                            delete next.judgeId;
                                            return next;
                                        });
                                    }
                                }}
                                placeholder="Search and select a judge..."
                                className="w-full"
                                options={judges.map((j: any) => ({
                                    value: j.id,
                                    label: j.name,
                                    subLabel: j.email ? `${j.designation} (${j.email})` : j.designation
                                }))}
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
                            />
                        </FormField>

                        <FormField label="Judgment Type" error={errors.judgmentType}>
                            <select
                                name="judgmentType"
                                value={formData.judgmentType}
                                onChange={handleChange}
                                className={inputClasses('judgmentType')}
                            >
                                <option value="final">Final</option>
                                <option value="interim">Interim</option>
                                <option value="order">Order</option>
                                <option value="directive">Directive</option>
                            </select>
                        </FormField>
                        <FormField label="Outcome" error={errors.outcome} required>
                            <input
                                type="text"
                                name="outcome"
                                value={formData.outcome}
                                className={inputClasses('outcome')}
                                placeholder="e.g. Dismissed, Allowed"
                                onChange={handleChange}
                            />
                        </FormField>

                        {/* NEW LITIGATION PARTIES FIELDS */}
                        <FormField label="Petitioner / Appellant" error={errors.petitioner} required>
                            <input
                                type="text"
                                name="petitioner"
                                value={formData.petitioner}
                                className={inputClasses('petitioner')}
                                placeholder="e.g. State of Maharashtra"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Respondent / Defendant" error={errors.respondent} required>
                            <input
                                type="text"
                                name="respondent"
                                value={formData.respondent}
                                className={inputClasses('respondent')}
                                placeholder="e.g. Union of India"
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Petitioner's Counsel" error={errors.petitionerCounsel} required>
                            <input
                                type="text"
                                name="petitionerCounsel"
                                value={formData.petitionerCounsel}
                                className={inputClasses('petitionerCounsel')}
                                placeholder="Advocates for the petitioner..."
                                onChange={handleChange}
                            />
                        </FormField>
                        <FormField label="Respondent's Counsel" error={errors.respondentCounsel} required>
                            <input
                                type="text"
                                name="respondentCounsel"
                                value={formData.respondentCounsel}
                                className={inputClasses('respondentCounsel')}
                                placeholder="Advocates for the respondent..."
                                onChange={handleChange}
                            />
                        </FormField>
                        <div className="md:col-span-2">
                            <FormField label="Coram / Bench" error={errors.bench} required>
                                <input
                                    type="text"
                                    name="bench"
                                    value={formData.bench}
                                    className={inputClasses('bench')}
                                    placeholder="e.g. Hon'ble Mr. Justice D.Y. Chandrachud, Hon'ble Mr. Justice J.B. Pardiwala"
                                    onChange={handleChange}
                                />
                            </FormField>
                        </div>

                        <div className="flex items-end pb-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="isLandmark"
                                    checked={formData.isLandmark}
                                    onChange={handleChange}
                                    className="w-5 h-5 text-[#C9A227] rounded focus:ring-[#C9A227] border-gray-300"
                                />
                                <span className="text-sm font-medium text-gray-700">Is Distingushed/Landmark Judgment?</span>
                            </label>
                        </div>
                    </div>

                    {/* Citations */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Citations</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newCitation}
                                onChange={(e) => setNewCitation(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                                placeholder="Add citation (e.g. 2024 SCC 123)"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCitation())}
                            />
                            <button type="button" onClick={addCitation} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <Plus size={20} className="text-gray-700" />
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {formData.citations.map((cit, idx) => (
                                <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {cit}
                                    <button type="button" onClick={() => removeCitation(idx)} className="hover:text-blue-900"><X size={14} /></button>
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Key Points */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Points</label>
                        <div className="flex gap-2 mb-2">
                            <input
                                type="text"
                                value={newKeyPoint}
                                onChange={(e) => setNewKeyPoint(e.target.value)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none"
                                placeholder="Add key point..."
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyPoint())}
                            />
                            <button type="button" onClick={addKeyPoint} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                <Plus size={20} className="text-gray-700" />
                            </button>
                        </div>
                        <ul className="space-y-1">
                            {formData.keyPoints.map((point, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                    <span className="mt-0.5">•</span>
                                    <span className="flex-1">{point}</span>
                                    <button type="button" onClick={() => removeKeyPoint(idx)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <FormField label="Summary" error={errors.summary} required>
                        <textarea
                            name="summary"
                            value={formData.summary}
                            rows={3}
                            className={inputClasses('summary')}
                            placeholder="Brief summary of the judgment..."
                            onChange={handleChange}
                        />
                    </FormField>

                    <FormField label="Full Judgment Text" error={errors.fullText} required>
                        <div className={`border rounded-lg overflow-hidden bg-white transition-all ${
                            errors.fullText ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-300"
                        }`}>
                            <RichTextEditor
                                value={formData.fullText}
                                onChange={handleFullTextChange}
                                placeholder="Full text of the judgment..."
                            />
                        </div>
                        {/* Hidden input for scrolling to RichTextEditor */}
                        <input type="text" name="fullText" className="sr-only" readOnly />
                    </FormField>
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
