"use client";

import React, { useState, useEffect, useRef } from "react";
import { judgmentsService, Judgment } from "@/data/services/judgments-service/judgmentsService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { casesService } from "@/data/services/cases-service/casesService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save, Plus, X, Search } from "lucide-react";

export default function CreateJudgmentPage() {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<Judgment>({
        caseId: "",
        judgeId: "",
        judgmentDate: "",
        judgmentType: "final",
        summary: "",
        fullText: "",
        outcome: "",
        isLandmark: false,
        citations: [],
        keyPoints: []
    });

    // Helper state for searching
    const [caseQuery, setCaseQuery] = useState("");
    const [judgeQuery, setJudgeQuery] = useState("");
    const [foundCases, setFoundCases] = useState<any[]>([]);
    const [foundJudges, setFoundJudges] = useState<any[]>([]);
    const [showCaseDropdown, setShowCaseDropdown] = useState(false);
    const [showJudgeDropdown, setShowJudgeDropdown] = useState(false);

    // Helper state for arrays
    const [newCitation, setNewCitation] = useState("");
    const [newKeyPoint, setNewKeyPoint] = useState("");

    // Debounce Search
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (caseQuery.length > 0) {
                try {
                    const response = await casesService.getAll({ search: caseQuery });
                    // Based on admin/cases/page.tsx: response.data.data.data
                    // But we should handle potential variations just in case
                    const rawData = response.data;
                    let results: any[] = [];

                    if (Array.isArray(rawData)) {
                        results = rawData;
                    } else if (rawData?.data && Array.isArray(rawData.data)) {
                        results = rawData.data;
                    } else if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
                        results = rawData.data.data;
                    } else {
                        results = [];
                    }

                    // Client-side fallback filter
                    if (results.length > 0) {
                        const q = caseQuery.toLowerCase();
                        results = results.filter((c: any) =>
                            (c.caseNumber && c.caseNumber.toString().toLowerCase().includes(q)) ||
                            (c.title && c.title.toLowerCase().includes(q)) ||
                            (c.caseId && c.caseId.toString().toLowerCase().includes(q))
                        );
                    }

                    setFoundCases(results);
                    setShowCaseDropdown(true);
                } catch (error) {
                    console.error("Error searching cases", error);
                    setFoundCases([]);
                }
            } else {
                setFoundCases([]);
                setShowCaseDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [caseQuery]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (judgeQuery.length > 0) {
                try {
                    const response = await judgesService.getAll({ search: judgeQuery });
                    // Based on admin/judges/page.tsx: response.data.data.data
                    const rawData = response.data;
                    let results: any[] = [];

                    if (Array.isArray(rawData)) {
                        results = rawData;
                    } else if (rawData?.data && Array.isArray(rawData.data)) {
                        results = rawData.data;
                    } else if (rawData?.data?.data && Array.isArray(rawData.data.data)) {
                        results = rawData.data.data;
                    } else {
                        results = [];
                    }

                    if (results.length > 0) {
                        const q = judgeQuery.toLowerCase();
                        results = results.filter((j: any) =>
                            (j.name && j.name.toLowerCase().includes(q)) ||
                            (j.fullName && j.fullName.toLowerCase().includes(q)) ||
                            (j.court && j.court.toLowerCase().includes(q))
                        );
                    }

                    setFoundJudges(results);
                    setShowJudgeDropdown(true);
                } catch (error) {
                    console.error("Error searching judges", error);
                    setFoundJudges([]);
                }
            } else {
                setFoundJudges([]);
                setShowJudgeDropdown(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [judgeQuery]);


    // Handlers
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({ ...formData, [name]: checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSelectCase = (selectedCase: any) => {
        setFormData({ ...formData, caseId: selectedCase.id || selectedCase._id });
        setCaseQuery(selectedCase.caseNumber || selectedCase.title || "Selected Case"); // Adjust display field
        setShowCaseDropdown(false);
    };

    const handleSelectJudge = (judge: any) => {
        setFormData({ ...formData, judgeId: judge.id || judge._id });
        setJudgeQuery(judge.name || judge.fullName || "Selected Judge"); // Adjust display field
        setShowJudgeDropdown(false);
    };

    // Array Handlers
    const addCitation = () => {
        if (newCitation.trim()) {
            setFormData({ ...formData, citations: [...formData.citations, newCitation.trim()] });
            setNewCitation("");
        }
    };

    const removeCitation = (index: number) => {
        setFormData({ ...formData, citations: formData.citations.filter((_, i) => i !== index) });
    };

    const addKeyPoint = () => {
        if (newKeyPoint.trim()) {
            setFormData({ ...formData, keyPoints: [...formData.keyPoints, newKeyPoint.trim()] });
            setNewKeyPoint("");
        }
    };

    const removeKeyPoint = (index: number) => {
        setFormData({ ...formData, keyPoints: formData.keyPoints.filter((_, i) => i !== index) });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.caseId) {
            toast.error("Please search and select a Case");
            return;
        }
        if (!formData.judgeId) {
            toast.error("Please search and select a Judge");
            return;
        }

        setSubmitting(true);
        try {

            await judgmentsService.create(formData);
            toast.success("Judgment created successfully");
            router.push("/admin/judgments");
        } catch (error) {
            console.error("Error creating judgment:", error);
            toast.error("Failed to create judgment");
            setSubmitting(false);
        }
    };

    // Click outside to close dropdowns
    const wrapperRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowCaseDropdown(false);
                setShowJudgeDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);


    return (
        <div className="p-6 max-w-4xl mx-auto" ref={wrapperRef}>
            {submitting && <Loader fullScreen text="Creating Judgment..." />}

            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Judgment</h1>
                    <p className="text-gray-500 text-sm">Enter the details of the judgment</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8">

                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">Case & Judge Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                        {/* Case Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Case (ID/Number) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={caseQuery}
                                    onChange={(e) => {
                                        setCaseQuery(e.target.value);
                                        if (formData.caseId) setFormData({ ...formData, caseId: "" }); // Clear selection on edit
                                    }}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all ${formData.caseId ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300 focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]'}`}
                                    placeholder="Type to search case..."
                                />
                            </div>
                            {showCaseDropdown && foundCases.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {foundCases.map((c) => (
                                        <li
                                            key={c.id || c._id}
                                            onClick={() => handleSelectCase(c)}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                        >
                                            <div className="font-medium">{c.caseNumber || c.title || "No Number"}</div>
                                            <div className="text-xs text-gray-500">{c.title || c.description || "No Title"}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Judge Search */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search Judge (Name) <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={judgeQuery}
                                    onChange={(e) => {
                                        setJudgeQuery(e.target.value);
                                        if (formData.judgeId) setFormData({ ...formData, judgeId: "" });
                                    }}
                                    className={`w-full pl-10 pr-4 py-2 border rounded-lg outline-none transition-all ${formData.judgeId ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-300 focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]'}`}
                                    placeholder="Type judge name..."
                                />
                            </div>
                            {showJudgeDropdown && foundJudges.length > 0 && (
                                <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
                                    {foundJudges.map((j) => (
                                        <li
                                            key={j.id || j._id}
                                            onClick={() => handleSelectJudge(j)}
                                            className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b last:border-0"
                                        >
                                            <div className="font-medium">{j.name || j.fullName || j.username || "Unknown"}</div>
                                            <div className="text-xs text-gray-500">{j.court || j.designation || ""}</div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 pt-4">Judgment Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Judgment Type</label>
                            <select
                                name="judgmentType"
                                value={formData.judgmentType}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] outline-none transition-all bg-white"
                            >
                                <option value="final">Final</option>
                                <option value="interim">Interim</option>
                                <option value="reserved">Reserved</option>
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
                            placeholder="Brief summary of the judgment..."
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
                            placeholder="Full text of the judgment..."
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
                        {submitting ? "Creating..." : "Create Judgment"}
                    </button>
                </div>
            </form>
        </div>
    );
}
