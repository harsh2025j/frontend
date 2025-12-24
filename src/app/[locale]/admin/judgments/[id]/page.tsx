"use client";

import React, { useEffect, useState } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { casesService } from "@/data/services/cases-service/casesService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter, useParams } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

export default function EditJudgmentPage() {
    const router = useRouter();
    const params = useParams();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [cases, setCases] = useState<any[]>([]);
    const [judges, setJudges] = useState<any[]>([]);

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
    });

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
                let caseId = "";
                if (data.case && data.case.id) {
                    caseId = data.case.id;
                } else if (data.caseId) {
                    caseId = data.caseId;
                }

                let judgeId = "";
                if (data.judge && data.judge.id) {
                    judgeId = data.judge.id;
                } else if (data.judgeId) {
                    judgeId = data.judgeId;
                }

                // Format date for input
                let judgmentDate = "";
                if (data.judgmentDate) {
                    judgmentDate = new Date(data.judgmentDate).toISOString().split('T')[0];
                }

                setFormData({
                    title: data.title || "",
                    caseId: caseId,
                    judgeId: judgeId,
                    judgmentDate: judgmentDate,
                    judgmentType: data.judgmentType || "final",
                    outcome: data.outcome || "",
                    isLandmark: data.isLandmark || false,
                    citations: Array.isArray(data.citations) ? data.citations : [],
                    keyPoints: Array.isArray(data.keyPoints) ? data.keyPoints : [],
                    summary: data.summary || "",
                    fullText: data.fullText || data.content || "",
                    pdfUrl: data.pdfUrl || "",
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
        setSubmitting(true);
        try {
            // Exclude read-only and relational fields from payload
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { title, ...dataToSend } = formData;

            await judgmentsService.update(params.id as string, dataToSend);
            toast.success("Judgment updated successfully");
            router.push("/admin/judgments");
        } catch (error: any) {
            console.error("Error updating judgment:", error);
            toast.error(error.message || "Failed to update judgment");
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
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Case <span className="text-red-500">*</span></label>
                            <select
                                name="caseId"
                                value={formData.caseId}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all bg-white"
                            >
                                <option value="">Select a Case</option>
                                {cases.map((c: any) => (
                                    <option key={c.id} value={c.id}>
                                        {c.caseNumber} - {c.title}
                                    </option>
                                ))}
                            </select>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Judge</label>
                            <select
                                name="judgeId"
                                value={formData.judgeId}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all bg-white"
                            >
                                <option value="">Select a Judge</option>
                                {judges.map((j: any) => (
                                    <option key={j.id} value={j.id}>
                                        {j.name} ({j.designation})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judgment Type</label>
                            <select
                                name="judgmentType"
                                value={formData.judgmentType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all bg-white"
                            >
                                <option value="final">Final</option>
                                <option value="interim">Interim</option>
                                <option value="order">Order</option>
                                <option value="directive">Directive</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Outcome</label>
                            <input
                                type="text"
                                name="outcome"
                                value={formData.outcome}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all"
                                placeholder="e.g. Dismissed, Allowed"
                                onChange={handleChange}
                            />
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Judgment Text <span className="text-red-500">*</span></label>
                        <textarea
                            name="fullText"
                            value={formData.fullText}
                            required
                            rows={15}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all font-mono text-xs sm:text-sm"
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
