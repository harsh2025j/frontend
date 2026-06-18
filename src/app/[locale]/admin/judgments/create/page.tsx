"use client";

import React, { useState, useEffect, useCallback } from "react";
import { judgmentsService } from "@/data/services/judgments-service/judgmentsService";
import { casesService } from "@/data/services/cases-service/casesService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { usersApi } from "@/data/services/users-service/users-service";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save, Plus, X, Landmark, Gavel, Scale, Users, Info, FileText, Image as ImageIcon, Link as LinkIcon, History } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import InfiniteSearchableSelect from "@/components/ui/InfiniteSearchableSelect";
import InfiniteSearchableMultiSelect from "@/components/ui/InfiniteSearchableMultiSelect";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FormField from "@/components/ui/FormField";
import CustomSelect from "@/components/ui/CustomSelect";

const DISPOSAL_NATURES = [
    "Allowed", "Partially Allowed", "Dismissed", "Dismissed in Default", "Withdrawn",
    "Compromised", "Settled Out of Court", "Abated", "Transferred", "Decreed",
    "Decree on Compromise", "Remanded", "Null and Void", "Recalled and Restored",
    "Acquitted", "Convicted", "Compounded"
];

const JUDGMENT_TYPES = [
    "Final Judgment", "Interim Order", "Judgment", "Order", "Decree", "Direction / Directive",
    "Stay Order", "Injunction Order", "Bail Order", "Anticipatory Bail", "Remand Order",
    "Execution Order", "Transfer Order", "Reference Order", "Review Order", "Revision Order",
    "Appeal Decision", "Contempt Order", "Suo Motu Order", "Quashing Order",
    "Settlement / Compromise Order", "Withdrawal Order"
];

export default function CreateJudgmentPage() {
    useDocTitle("Create Judgment | Sajjad Husain Law Associates");
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [cases, setCases] = useState<any[]>([]);
    const [judges, setJudges] = useState<any[]>([]);
    const [selectedCaseData, setSelectedCaseData] = useState<any>(null);

    const [formData, setFormData] = useState<any>({
        // Section 1: Basic
        caseId: "",
        // Section 2: Judgment Details
        title: "",
        judgmentDate: "",
        judgmentType: "",
        outcome: "",
        isLandmark: false,
        neutralCitationHC: "",
        neutralCitationSC: "",
        legalPhrases: [] as string[],
        relevantSections: [] as string[],
        implementationDelivery: "",
        judgmentLink: "",
        // Section 3: SC (Conditional)
        benchStrength: "",
        judgeRole: "",
        petitionInfo: "",
        administrativeDetails: "",
        proceedingDetail: "",
        // Section 4: HC (Conditional)
        petitioner: "",
        petitionerPartyType: "",
        respondent: "",
        respondentPartyType: "",
        intervenors: "",
        amicusCuriae: "",
        natureOfCompliance: "",
        // Section 5: Counsel
        judgeIds: [] as string[], // Lead Judges
        coramIds: [] as string[], // Bench Judges
        counselDetails: {
            petitionerCounsel: "",
            respondentCounsel: "",
            intervenorCounsel: "",
            stateCounsel: "",
        },
        // Section 6: Citations
        reporterCitation: "",
        citations: [] as string[],
        caseNotes: "",
        historyLink: "",
        citationManagementSite: "",
        keyPoints: [] as string[],
        // Section 7: Admin
        articleCreator: "",
        discoverySocialInfo: "",
        isReserved: false,
        reservedDateFrom: "",
        reservedDuration: "",
        nextListDate: "",
        additionalNotes: "",
        // Section 8: Metadata
        summary: "",
        fullText: "",
        relatedNewsIds: [] as string[],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    // Temporary inputs for array fields
    const [newLegalPhrase, setNewLegalPhrase] = useState("");
    const [newSection, setNewSection] = useState("");
    const [newCitation, setNewCitation] = useState("");
    const [newKeyPoint, setNewKeyPoint] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Initial small batch of data
                const [casesRes, judgesRes] = await Promise.all([
                    casesService.getAll({ limit: 10 }),
                    judgesService.getAll({ limit: 10 })
                ]);

                const casesData = casesRes.data?.data?.data || casesRes.data?.data || [];
                const judgesData = judgesRes.data?.data?.data || judgesRes.data?.data || [];

                setCases(casesData);
                setJudges(judgesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                toast.error("Failed to load initial data");
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // Handle Case Selection & Auto-fill
    const handleCaseChange = async (caseId: string) => {
        setFormData((prev: any) => ({ ...prev, caseId }));
        if (errors.caseId) {
            setErrors((prev) => {
                const n = { ...prev };
                delete n.caseId;
                return n;
            });
        }

        if (caseId) {
            try {
                const res = await casesService.getById(caseId);
                const caseData = res.data?.data || res.data;
                setSelectedCaseData(caseData);

                // Auto-fill logic
                setFormData((prev: any) => {
                    const next = { ...prev };
                    // Safely remove any legacy flat fields that might be lingering in state
                    delete next.petitionerCounsel;
                    delete next.respondentCounsel;

                    return {
                        ...next,
                        petitioner: caseData.petitioner?.join(", ") || "",
                        respondent: caseData.respondent?.join(", ") || "",
                        counselDetails: {
                            ...prev.counselDetails,
                            petitionerCounsel: caseData.petitionerAdvocate?.join(", ") || "",
                            respondentCounsel: caseData.respondentAdvocate?.join(", ") || "",
                        }
                    };
                });
                toast.success("Case details auto-filled");
            } catch (error) {
                console.error("Auto-fill fail:", error);
            }
        } else {
            setSelectedCaseData(null);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

        setFormData((prev: any) => {
            if (name.includes('.')) {
                const [parent, child] = name.split('.');
                return {
                    ...prev,
                    [parent]: { ...prev[parent], [child]: val }
                };
            }
            return { ...prev, [name]: val };
        });

        if (errors[name]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleArrayAction = (field: string, action: 'add' | 'remove', value?: string, index?: number) => {
        setFormData((prev: any) => {
            const list = [...prev[field]];
            if (action === 'add' && value) {
                // Split by comma, trim, filter empty
                const newValues = value.split(',').map(v => v.trim()).filter(Boolean);
                newValues.forEach(val => {
                    if (!list.includes(val)) list.push(val);
                });
            } else if (action === 'remove' && index !== undefined) {
                list.splice(index, 1);
            }
            return { ...prev, [field]: list };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Basic Validation
        const req = [
            { key: 'caseId', label: 'Case' },
            { key: 'title', label: 'Title' },
            { key: 'judgmentDate', label: 'Date' },
            { key: 'judgmentType', label: 'Type' },
            { key: 'outcome', label: 'Outcome' },
            { key: 'summary', label: 'Summary' },
        ];

        const newErrors: Record<string, string> = {};
        req.forEach(f => {
            if (!formData[f.key] || formData[f.key].toString().trim() === '') {
                newErrors[f.key] = `${f.label} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // toast.error("Please fill required fields");

            // Scroll to the first error field
            const firstErrorField = req.find(f => newErrors[f.key]);
            if (firstErrorField) {
                const el = document.getElementsByName(firstErrorField.key)[0];
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Give a slight delay for smooth scroll before focusing
                    setTimeout(() => el.focus({ preventScroll: true }), 500);
                }
            }
            return;
        }

        setSubmitting(true);
        try {
            // Sanitize payload: Ensure no root-level counsel fields are sent
            const payload = { ...formData };
            delete (payload as any).petitionerCounsel;
            delete (payload as any).respondentCounsel;

            // Sanitize dates: empty strings must be null or deleted for ISO 8601 validation
            if (!payload.reservedDateFrom) delete (payload as any).reservedDateFrom;
            if (!payload.nextListDate) delete (payload as any).nextListDate;

            const formDataObj = new FormData();

            // Append all fields to FormData
            Object.keys(payload).forEach(key => {
                const value = (payload as any)[key];
                if (key === 'file') {
                    if (value) formDataObj.append('file', value);
                } else if (typeof value === 'object' && value !== null) {
                    formDataObj.append(key, JSON.stringify(value));
                } else if (value !== undefined && value !== null) {
                    formDataObj.append(key, value.toString());
                }
            });
            // console.log("[Judgment Create] Submitting FormData...");
            // for (let [key, value] of (formDataObj as any).entries()) {
            //     console.log(`${key}:`, value instanceof File ? `File [${value.name}, ${value.size} bytes]` : value);
            // }

            await judgmentsService.create(formDataObj);
            toast.success("Judgment created successfully");
            router.push("/admin/judgments");
        } catch (error: any) {
            console.error("Error creating judgment:", error);
            toast.error(error.message || "Failed to create judgment");
            setSubmitting(false);
        }
    };


    if (loadingData) return <CreateJudgmentSkeleton />;

    const inputClasses = (name: string) => `w-full px-4 py-2 border rounded-lg outline-none transition-all text-sm font-medium ${errors[name]
        ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/5"
        : "border-gray-200 focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] bg-gray-50/30 hover:bg-white"
        }`;

    const labelClasses = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1";

    const sectionHeader = (title: string, icon: React.ReactNode) => (
        <div className="flex items-center gap-3 py-4 border-b border-gray-100 mb-6 group">
            <div className="p-2 bg-gray-50 rounded-lg">
                {icon}
            </div>
            <h2 className="text-lg font-bold text-gray-800 tracking-tight">{title}</h2>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6">
            {submitting && <Loader fullScreen text="Saving Legal Record..." />}

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white rounded-lg transition-colors border border-gray-200"
                    >
                        <ArrowLeft size={18} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Create New Judgment</h1>
                        <p className="text-gray-500 text-sm">Fill in all sections to record a new judicial decision</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* BASIC INFORMATION */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sectionHeader("Basic Information", <Landmark size={20} className="text-[#C9A227]" />)}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <FormField label="Select Case" description="Link this judgment to an existing case file" error={errors.caseId} required>
                                    <InfiniteSearchableSelect
                                        name="caseId"
                                        value={formData.caseId}
                                        placeholder="Search by Case Number, Title or CNR..."
                                        onChange={handleCaseChange}
                                        onSearch={async (query, page) => {
                                            const res = query.trim()
                                                ? await casesService.searchCases(query, page, 10)
                                                : await casesService.getAll({ page, limit: 10 });
                                            const items = res.data?.data?.data || res.data?.data || [];
                                            return {
                                                options: items.map((c: any) => ({
                                                    value: c.id,
                                                    label: `${c.caseNumber || "N/A"} - ${c.title || "Untitled"}`,
                                                    subLabel: `${c.court || "Unknown Court"} | ${c.caseType || "Unknown Type"}`
                                                })),
                                                totalPages: res.data?.meta?.totalPages || res.data?.totalPages || 1
                                            };
                                        }}
                                    />
                                </FormField>
                            </div>

                            {selectedCaseData && (
                                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Case Number</p>
                                        <p className="text-sm font-bold text-gray-700">{selectedCaseData.caseNumber || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Case Type</p>
                                        <p className="text-sm font-bold text-gray-700">{selectedCaseData.caseType || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Court / Jurisdiction</p>
                                        <p className="text-sm font-bold text-gray-700">{selectedCaseData.court || "N/A"}</p>
                                    </div>
                                </div>
                            )}

                            <div className="md:col-span-2">
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <Scale size={18} className="text-amber-600 shrink-0" />
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            name="isLandmark"
                                            checked={formData.isLandmark}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-[#C9A227] rounded-lg border-gray-300 focus:ring-[#C9A227] transition-all"
                                        />
                                        <span className="text-sm font-bold text-amber-900">Mark as Landmark / Latest Significant Case?</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JUDGMENT DETAILS */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sectionHeader("Judgment Details", <Gavel size={20} className="text-[#0A2342]" />)}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2">
                                <FormField label="Judgment Title" error={errors.title} required>
                                    <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Descriptive title for identifying this legal record</p>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        className={inputClasses('title')}
                                        placeholder="Brief descriptive title (e.g. State vs. John Doe - Bail Order)"
                                        onChange={handleChange}
                                    />
                                </FormField>
                            </div>

                            <FormField label="Judgment Date" error={errors.judgmentDate} required>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">The date the judgment was officially delivered</p>
                                <input type="date" name="judgmentDate" value={formData.judgmentDate} className={inputClasses('judgmentDate')} onChange={handleChange} />
                            </FormField>

                            <FormField label="Judgment Type" required>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Select the nature of this judicial decision</p>
                                <CustomSelect
                                    name="judgmentType"
                                    options={JUDGMENT_TYPES.map(t => ({ value: t, label: t }))}
                                    value={formData.judgmentType}
                                    onChange={(val) => setFormData((prev: any) => ({ ...prev, judgmentType: val }))}
                                    placeholder="Select Type"
                                />
                            </FormField>

                            <FormField label="Decision / Result (Outcome)" error={errors.outcome} required>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Final legal result (Disposal Nature)</p>
                                <CustomSelect
                                    name="outcome"
                                    options={DISPOSAL_NATURES.map(d => ({ value: d, label: d }))}
                                    value={formData.outcome}
                                    onChange={(val) => setFormData((prev: any) => ({ ...prev, outcome: val }))}
                                    placeholder="Select Outcome"
                                    error={!!errors.outcome}
                                />
                            </FormField>

                            <FormField label="Neutral Citation (HC)">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Official High Court neutral citation</p>
                                <input type="text" name="neutralCitationHC" value={formData.neutralCitationHC} className={inputClasses('neutralCitationHC')} placeholder="HC Citation link/text" onChange={handleChange} />
                            </FormField>

                            <FormField label="Neutral Citation (SC/Other)">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Official Supreme Court/Other neutral citation</p>
                                <input type="text" name="neutralCitationSC" value={formData.neutralCitationSC} className={inputClasses('neutralCitationSC')} placeholder="SC Citation link/text" onChange={handleChange} />
                            </FormField>

                            <FormField label="Implementation / Delivery" description="Mode of judgment delivery">
                                <input type="text" name="implementationDelivery" value={formData.implementationDelivery} className={inputClasses('implementationDelivery')} placeholder="e.g. In-person, Virtual" onChange={handleChange} />
                            </FormField>

                            <FormField label="Upload Original PDF" description="Directly upload the official court PDF">
                                <div className="space-y-3">
                                    <div className="relative">
                                        <input
                                            type="file"
                                            id="pdf-upload"
                                            accept="application/pdf"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.size > 10 * 1024 * 1024) {
                                                        toast.error("File size exceeds 10MB limit");
                                                        e.target.value = ""; // clear input
                                                        return;
                                                    }
                                                    setFormData((prev: any) => ({ ...prev, file }));
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="pdf-upload"
                                            className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer group"
                                        >
                                            <FileText size={20} className="text-gray-400 group-hover:text-primary-500" />
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-primary-700">
                                                {formData.file ? 'Change PDF Document' : 'Click to Select PDF Judgment'}
                                            </span>
                                        </label>
                                    </div>

                                    {formData.file && (
                                        <div className="flex items-center justify-between p-3 bg-primary-50 border border-primary-100 rounded-lg animate-in fade-in slide-in-from-top-2">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-md shadow-sm">
                                                    <FileText size={18} className="text-primary-600" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
                                                        {formData.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData((prev: any) => {
                                                    const next = { ...prev };
                                                    delete next.file;
                                                    return next;
                                                })}
                                                className="p-1 hover:bg-primary-100 rounded-full text-primary-600 transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </FormField>
                        </div>

                        <div className="mt-8 space-y-6 pt-6 border-t border-gray-50">
                            {/* Legal Phrases */}
                            <div>
                                <p className={labelClasses}>Legal Phrases / Subject</p>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Add multiple by separating with commas or points</p>
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={newLegalPhrase}
                                        onChange={(e) => setNewLegalPhrase(e.target.value)}
                                        className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#C9A227] transition-all"
                                        placeholder="e.g. Negligence, Article 21, Damages..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAction('legalPhrases', 'add', newLegalPhrase), setNewLegalPhrase(""))}
                                    />
                                    <button type="button" onClick={() => { handleArrayAction('legalPhrases', 'add', newLegalPhrase); setNewLegalPhrase(""); }} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                        <Plus size={18} className="text-gray-700" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.legalPhrases.map((p: string, i: number) => (
                                        <span key={i} className="bg-[#0A2342]/5 text-[#0A2342] px-3 py-1.5 rounded-lg text-xs font-bold border border-[#0A2342]/10 flex items-center gap-2">
                                            {p}
                                            <button type="button" onClick={() => handleArrayAction('legalPhrases', 'remove', undefined, i)} className="hover:text-red-600 transition-colors"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Sections/Articles */}
                            <div>
                                <p className={labelClasses}>Section / Article Involved</p>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Enter sections separated by commas or points</p>
                                <div className="flex gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={newSection}
                                        onChange={(e) => setNewSection(e.target.value)}
                                        className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#C9A227] transition-all"
                                        placeholder="e.g. Section 302, Article 32, Section 144..."
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAction('relevantSections', 'add', newSection), setNewSection(""))}
                                    />
                                    <button type="button" onClick={() => { handleArrayAction('relevantSections', 'add', newSection); setNewSection(""); }} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                        <Plus size={18} className="text-gray-700" />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.relevantSections.map((s: string, i: number) => (
                                        <span key={i} className="bg-amber-50 text-amber-800 px-3 py-1.5 rounded-lg text-xs font-bold border border-amber-200 flex items-center gap-2">
                                            {s}
                                            <button type="button" onClick={() => handleArrayAction('relevantSections', 'remove', undefined, i)} className="hover:text-red-600 transition-colors"><X size={14} /></button>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* JUDICIAL PROCEEDING DETAILS */}
                    <div className="bg-blue-50/20 rounded-xl border border-blue-100/50 p-8 shadow-sm">
                        {sectionHeader("Judicial Proceeding Details", <div className="text-[#0A2342] font-black text-xs">SC</div>)}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField label="Bench Strength Type">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">e.g. Division Bench, Full Bench, Constitution Bench</p>
                                <input type="text" name="benchStrength" value={formData.benchStrength} onChange={handleChange} className={inputClasses('benchStrength')} placeholder="e.g. Division, Full, Constitution" />
                            </FormField>
                            <FormField label="Judge Role">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Role of the lead judge (Author/Coram)</p>
                                <input type="text" name="judgeRole" value={formData.judgeRole} onChange={handleChange} className={inputClasses('judgeRole')} placeholder="Author / Coram" />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Added Petition Info">
                                    <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Information about original petition or connected matters</p>
                                    <textarea name="petitionInfo" value={formData.petitionInfo} onChange={handleChange} rows={2} className={inputClasses('petitionInfo')} placeholder="Information about original petition..." />
                                </FormField>
                            </div>
                            <FormField label="Administrative Details">
                                <input type="text" name="administrativeDetails" value={formData.administrativeDetails} onChange={handleChange} className={inputClasses('administrativeDetails')} />
                            </FormField>
                            <FormField label="Proceeding Detail">
                                <input type="text" name="proceedingDetail" value={formData.proceedingDetail} onChange={handleChange} className={inputClasses('proceedingDetail')} />
                            </FormField>
                        </div>
                    </div>

                    {/* APPELLATE / PARTY DETAILS */}
                    <div className="bg-amber-50/20 rounded-xl border border-amber-100/50 p-8 shadow-sm">
                        {sectionHeader("Appellate & Party Details", <div className="text-[#C9A227] font-black text-xs">HC</div>)}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField label="Petitioner / Appellant Name">
                                <input type="text" name="petitioner" value={formData.petitioner} onChange={handleChange} className={inputClasses('petitioner')} />
                            </FormField>
                            <FormField label="Petitioner Party Type">
                                <input type="text" name="petitionerPartyType" value={formData.petitionerPartyType} onChange={handleChange} className={inputClasses('petitionerPartyType')} placeholder="e.g. State, Private" />
                            </FormField>
                            <FormField label="Respondent / Defendant Name">
                                <input type="text" name="respondent" value={formData.respondent} onChange={handleChange} className={inputClasses('respondent')} />
                            </FormField>
                            <FormField label="Respondent Party Type">
                                <input type="text" name="respondentPartyType" value={formData.respondentPartyType} onChange={handleChange} className={inputClasses('respondentPartyType')} />
                            </FormField>
                            <FormField label="Intervenors" description="Names of intervenors separated by commas">
                                <input type="text" name="intervenors" value={formData.intervenors} onChange={handleChange} className={inputClasses('intervenors')} />
                            </FormField>
                            <FormField label="Amicus Curiae" description="Names of amicus curiae separated by commas">
                                <input type="text" name="amicusCuriae" value={formData.amicusCuriae} onChange={handleChange} className={inputClasses('amicusCuriae')} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Nature of Compliance">
                                    <input type="text" name="natureOfCompliance" value={formData.natureOfCompliance} onChange={handleChange} className={inputClasses('natureOfCompliance')} />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* BENCH & COUNSEL DETAILS */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sectionHeader("Bench & Counsel Details", <Users size={20} className="text-blue-500" />)}
                        <div className="space-y-8">
                            {/* Bench / Coram */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField label="Lead / Authoring Judge" description="Add one or more lead judges for this judgment">
                                    <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Select the main judge(s) who authored the decision</p>
                                    <InfiniteSearchableMultiSelect
                                        selectedValues={formData.judgeIds}
                                        placeholder="Search for lead judge(s)..."
                                        onSearch={async (query, page) => {
                                            const res = query.trim()
                                                ? await judgesService.searchJudges(query, page, 10)
                                                : await judgesService.getAll({ page, limit: 10 });
                                            const items = res.data?.data?.data || res.data?.data || [];
                                            return {
                                                options: items.map((j: any) => ({
                                                    value: j.id, label: j.name || "Unknown Judge", subLabel: j.designation || "Judge"
                                                })),
                                                totalPages: res.data?.meta?.totalPages || res.data?.totalPages || 1
                                            };
                                        }}
                                        onChange={(vals) => setFormData((prev: any) => ({ ...prev, judgeIds: vals }))}
                                    />
                                </FormField>

                                <FormField label="Coram (Bench List)">
                                    <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">List of fellow judges presiding on the bench</p>
                                    <InfiniteSearchableMultiSelect
                                        selectedValues={formData.coramIds}
                                        placeholder="Add other judges in bench..."
                                        onSearch={async (query, page) => {
                                            const res = query.trim()
                                                ? await judgesService.searchJudges(query, page, 10)
                                                : await judgesService.getAll({ page, limit: 10 });
                                            const items = res.data?.data?.data || res.data?.data || [];
                                            return {
                                                options: items.map((j: any) => ({
                                                    value: j.id, label: j.name, subLabel: j.designation
                                                })),
                                                totalPages: res.data?.meta?.totalPages || res.data?.totalPages || 1
                                            };
                                        }}
                                        onChange={(vals) => setFormData((prev: any) => ({ ...prev, coramIds: vals }))}
                                    />
                                </FormField>
                            </div>

                            {/* Counsel Details (Text Entry) */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-gray-50">
                                <FormField
                                    label="Petitioner Counsel"
                                    description="Enter full names separated by commas (e.g. Adv. R.K. Sharma, Adv. S. Mittal)"
                                >
                                    <textarea
                                        name="counselDetails.petitionerCounsel"
                                        value={formData.counselDetails.petitionerCounsel}
                                        onChange={handleChange}
                                        className={inputClasses('counselDetails.petitionerCounsel')}
                                        rows={2}
                                        placeholder="Type petitioner counsel names..."
                                    />
                                </FormField>
                                <FormField
                                    label="Respondent Counsel"
                                    description="Enter full names separated by commas"
                                >
                                    <textarea
                                        name="counselDetails.respondentCounsel"
                                        value={formData.counselDetails.respondentCounsel}
                                        onChange={handleChange}
                                        className={inputClasses('counselDetails.respondentCounsel')}
                                        rows={2}
                                        placeholder="Type respondent counsel names..."
                                    />
                                </FormField>
                                <FormField
                                    label="Intervenor Counsel"
                                    description="Enter names separated by commas"
                                >
                                    <textarea
                                        name="counselDetails.intervenorCounsel"
                                        value={formData.counselDetails.intervenorCounsel}
                                        onChange={handleChange}
                                        className={inputClasses('counselDetails.intervenorCounsel')}
                                        rows={2}
                                        placeholder="Type intervenor counsel names..."
                                    />
                                </FormField>
                                <FormField
                                    label="State / Central Counsel"
                                    description="Enter govt. counsel names separated by commas"
                                >
                                    <textarea
                                        name="counselDetails.stateCounsel"
                                        value={formData.counselDetails.stateCounsel}
                                        onChange={handleChange}
                                        className={inputClasses('counselDetails.stateCounsel')}
                                        rows={2}
                                        placeholder="Type govt counsel names..."
                                    />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* CITATIONS & CASE LINKS */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sectionHeader("Citations & History", <FileText size={20} className="text-purple-500" />)}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField label="Reporter Citation">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Official citation (e.g. 2024 (1) SCC 456)</p>
                                <input type="text" name="reporterCitation" value={formData.reporterCitation} onChange={handleChange} className={inputClasses('reporterCitation')} placeholder="e.g. 2024 (1) SCC 456" />
                            </FormField>
                            <FormField label="Citation Management Site">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Portal or site managing this citation</p>
                                <input type="text" name="citationManagementSite" value={formData.citationManagementSite} onChange={handleChange} className={inputClasses('citationManagementSite')} />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Case Referring / History Link">
                                    <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Link to previous orders or internal case history</p>
                                    <div className="relative">
                                        <History size={16} className="absolute left-3 top-3 text-gray-400" />
                                        <input type="text" name="historyLink" value={formData.historyLink} onChange={handleChange} className={inputClasses('historyLink') + " pl-10"} placeholder="Link to previous orders/history..." />
                                    </div>
                                </FormField>
                            </div>
                            <div className="md:col-span-2">
                                <FormField label="Case Notes / Head Note">
                                    <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Summarized legal principles or editorial headnotes</p>
                                    <textarea name="caseNotes" value={formData.caseNotes} onChange={handleChange} rows={4} className={inputClasses('caseNotes')} placeholder="Internal or reporter specific headnotes..." />
                                </FormField>
                            </div>
                        </div>

                        <div className="mt-8">
                            <p className={labelClasses}>Key Legal Points</p>
                            <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Add specific legal observations as separate points</p>
                            <div className="flex gap-3 mb-3">
                                <input
                                    type="text"
                                    value={newKeyPoint}
                                    onChange={(e) => setNewKeyPoint(e.target.value)}
                                    className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-[#C9A227]"
                                    placeholder="Add key legal observation..."
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleArrayAction('keyPoints', 'add', newKeyPoint), setNewKeyPoint(""))}
                                />
                                <button type="button" onClick={() => { handleArrayAction('keyPoints', 'add', newKeyPoint); setNewKeyPoint(""); }} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                                    <Plus size={18} className="text-gray-700" />
                                </button>
                            </div>
                            <ul className="space-y-2">
                                {formData.keyPoints.map((point: string, i: number) => (
                                    <li key={i} className="flex items-start gap-4 text-sm text-gray-600 bg-gray-50/50 p-4 rounded-2xl group border border-gray-100">
                                        <div className="w-5 h-5 rounded-full bg-[#0A2342] text-white flex items-center justify-center text-[10px] shrink-0 mt-0.5">{i + 1}</div>
                                        <span className="flex-1 font-medium">{point}</span>
                                        <button type="button" onClick={() => handleArrayAction('keyPoints', 'remove', undefined, i)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={18} /></button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* ADMINISTRATIVE INFORMATION */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sectionHeader("Administrative Info", <Info size={20} className="text-green-500" />)}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <FormField label="Article Creator">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Name of the staff member creating this record</p>
                                <input type="text" name="articleCreator" value={formData.articleCreator} onChange={handleChange} className={inputClasses('articleCreator')} placeholder="Enter your name..." />
                            </FormField>
                            <FormField label="Discovery / Social Info">
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">Tags or notes for social media and search discovery</p>
                                <input type="text" name="discoverySocialInfo" value={formData.discoverySocialInfo} onChange={handleChange} className={inputClasses('discoverySocialInfo')} placeholder="e.g. Shared on FB, Twitter handle..." />
                            </FormField>

                            <div className="md:col-span-2">
                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                                    <label className="flex items-center gap-3 cursor-pointer mb-4">
                                        <input
                                            type="checkbox"
                                            name="isReserved"
                                            checked={formData.isReserved}
                                            onChange={handleChange}
                                            className="w-5 h-5 text-blue-600 rounded-lg border-gray-300 focus:ring-blue-500"
                                        />
                                        <span className="text-sm font-bold text-blue-900">Was Judgment Reserved?</span>
                                    </label>

                                    {formData.isReserved && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2">
                                            <FormField label="Reserved From Date">
                                                <input type="date" name="reservedDateFrom" value={formData.reservedDateFrom} onChange={handleChange} className={inputClasses('reservedDateFrom')} />
                                            </FormField>
                                            <FormField label="Reserved Duration">
                                                <input type="text" name="reservedDuration" value={formData.reservedDuration} onChange={handleChange} className={inputClasses('reservedDuration')} placeholder="e.g. 3 Months, 15 Days" />
                                            </FormField>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <FormField label="Next List / Mentioning Date">
                                <input type="date" name="nextListDate" value={formData.nextListDate} onChange={handleChange} className={inputClasses('nextListDate')} />
                            </FormField>

                            <div className="md:col-span-2">
                                <FormField label="Notes or Additional Detail">
                                    <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleChange} rows={3} className={inputClasses('additionalNotes')} />
                                </FormField>
                            </div>
                        </div>
                    </div>

                    {/* CONTENT & SUMMARY */}
                    <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                        {sectionHeader("Content & Summary", <ImageIcon size={20} className="text-pink-600" />)}
                        <div className="space-y-6">
                            <FormField label="Judgment Summary" error={errors.summary} required>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">A concise summary for quick review by legal portal users</p>
                                <textarea
                                    name="summary"
                                    value={formData.summary}
                                    rows={6}
                                    className={inputClasses('summary')}
                                    placeholder="Provide a concise, professional summary for the legal portal..."
                                    onChange={handleChange}
                                />
                            </FormField>

                            <FormField label="Full Judgment Text / Content" required>
                                <p className="text-[10px] text-gray-400 mb-2 px-1 uppercase font-bold">The complete verbatim text of the judgment decree</p>
                                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-gray-50 focus-within:ring-2 focus-within:ring-[#C9A227] focus-within:border-[#C9A227] transition-all">
                                    <RichTextEditor
                                        value={formData.fullText}
                                        onChange={(v) => setFormData((prev: any) => ({ ...prev, fullText: v }))}
                                        placeholder="Enter full judgment text here..."
                                    />
                                </div>
                            </FormField>
                        </div>
                    </div>

                    {/* FORM ACTIONS (At the end) */}
                    <div className="flex justify-end items-center gap-4 pt-8 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-6 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-8 py-2.5 bg-[#0A2342] text-white rounded-lg hover:bg-black font-bold transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                        >
                            {submitting ? "Processing..." : "Save Judgment"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}

function CreateJudgmentSkeleton() {
    return (
        <div className="min-h-screen bg-gray-50 py-12 px-6 animate-pulse">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div className="space-y-2">
                        <div className="h-8 w-64 bg-gray-200 rounded"></div>
                        <div className="h-4 w-96 bg-gray-100 rounded"></div>
                    </div>
                </div>

                <div className="space-y-6">
                    {[1, 2, 3].map((section) => (
                        <div key={section} className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
                            <div className="flex items-center gap-3 py-4 border-b border-gray-100 mb-6">
                                <div className="w-10 h-10 rounded-lg bg-gray-200 shrink-0"></div>
                                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                        <div className="h-3 w-48 bg-gray-100 rounded mb-2"></div>
                                        <div className="h-10 w-full bg-gray-50 rounded-lg border border-gray-100"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
