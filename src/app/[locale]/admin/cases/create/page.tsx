"use client";

import React, { useEffect, useState } from "react";
import { casesService } from "@/data/services/cases-service/casesService";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Loader from "@/components/ui/Loader";
import { ArrowLeft, Save, Info, Gavel, Scale, Users, FileText, Calendar, Building, ShieldCheck, AlertCircle } from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import CaseTypeSearchableDropdown from "@/components/ui/CaseTypeSearchableDropdown";
import InfiniteSearchableMultiSelect from "@/components/ui/InfiniteSearchableMultiSelect";
import CourtSearchableDropdown from "@/components/ui/CourtSearchableDropdown";
import StateSearchableDropdown from "@/components/ui/StateSearchableDropdown";
import FormField from "@/components/ui/FormField";
import CustomSelect from "@/components/ui/CustomSelect";

// --- Options Constants ---

const COURT_LEVELS = [
    "Supreme Court", "High Court", "District Court", "Sessions Court", "Civil Court",
    "Family Court", "Tribunal", "Commission", "Consumer Forum", "Revenue Court",
    "Rent Court", "Labour Court", "Cooperative Court"
];

const BENCH_TYPES = ["Single Bench", "Division Bench", "Full Bench", "Constitution Bench", "Special Bench"];

const CASE_ORIGIN_TYPES = ["Original Filing", "Appeal", "Revision", "Reference", "Transfer", "Suo Motu"];

const CASE_CATEGORIES = [
    "Regular", "Urgent", "Very Urgent", "Senior Citizen", "Woman", "Child", "Divyang",
    "PIL", "Government Matter", "Constitutional Matter", "Suo Motu",
    "Old Case Above 10 Years", "Old Case Above 20 Years",
    "Undertrial Prisoner", "Ex Serviceman"
];

const CASE_STAGES = [
    "Fresh Filing", "Registration", "Defect Stage", "Service of Notice", "Return of Notice",
    "Appearance Stage", "Written Statement Stage", "Replication Stage", "Framing of Issues",
    "Evidence Stage", "Petitioner Evidence", "Respondent Evidence", "Argument Stage",
    "Part Heard", "Final Hearing", "Judgment Reserved", "Pronouncement", "Remand Stage",
    "Compliance Stage", "Execution Stage", "Closed"
];

const CASE_STATUSES = [
    "Fresh", "Registered", "Defective", "Defect Removed", "Pending", "Listed", "Part Heard",
    "Adjourned", "Stayed", "Remanded", "Disposed", "Decreed", "Dismissed", "Allowed",
    "Partially Allowed", "Withdrawn", "Compromised", "Settled", "Abated", "Transferred",
    "Recalled", "Restored", "Null and Void"
];

const DEFECT_STATUSES = ["No Defect", "Defective", "Defect Removed", "Defect Pending", "Permanently Defective"];

const DELAY_CONDONATION_OPTIONS = ["Not Applicable", "Applied and Pending", "Condoned", "Refused"];

const HEARING_PURPOSES = [
    "First Hearing", "Notice", "Service Verification", "Appearance", "Written Statement",
    "Replication", "Framing of Issues", "Evidence", "Cross Examination", "Argument",
    "Final Argument", "Judgment", "Order", "Compliance", "Bail Hearing", "Stay Hearing",
    "Surety Verification", "Remand Hearing", "Surrender Hearing", "Sentence Hearing",
    "Charge Framing", "Bail Renewal", "Interlocutory Application", "Misc Application",
    "Any Other Purpose"
];

const INTERIM_RELIEF_STATUSES = ["Not Applied", "Applied and Pending", "Granted", "Refused", "Vacated", "Modified", "Extended"];

const STAY_STATUSES = ["Not Applied", "Applied and Pending", "Granted", "Refused", "Vacated", "Modified", "Conditional Stay", "Extended"];

const NOTICE_STATUSES = ["Not Issued", "Issued", "Served", "Unserved", "Returned", "Ex Parte"];

const CONNECTION_TYPES = [
    "Tagged", "Clubbed", "Amalgamated", "Related", "Cross Case", "Transferred From",
    "Transferred To", "Appeal Of", "Review Of", "Execution Of"
];

const DISPOSAL_NATURES = [
    "Allowed", "Partially Allowed", "Dismissed", "Dismissed in Default", "Withdrawn",
    "Compromised", "Settled Out of Court", "Abated", "Transferred", "Decreed",
    "Decree on Compromise", "Remanded", "Null and Void", "Recalled and Restored",
    "Acquitted", "Convicted", "Compounded"
];

const PRACTICE_AREAS = [
    "Civil", "Criminal", "Constitutional", "Family", "Matrimonial", "Tax", "Corporate",
    "Commercial", "Arbitration", "Labour and Employment", "Consumer", "Real Estate",
    "Intellectual Property", "Environmental", "Election", "Revenue", "Writ",
    "Service Matter", "Insurance", "Banking and Finance", "Cyber Law", "Media and Entertainment"
];

const CONFIDENTIALITY_LEVELS = [
    { label: "1 - Public", value: "Public" },
    { label: "2 - Internal", value: "Internal" },
    { label: "3 - Confidential", value: "Confidential" },
    { label: "4 - Highly Confidential", value: "Highly Confidential" },
    { label: "5 - Top Secret", value: "Top Secret" }
];

export default function CreateCasePage() {
    useDocTitle("Create Case | Sajjad Husain Law Associates");
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isRestoring, setIsRestoring] = useState(true);
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    // Helper to convert simple string arrays to CustomSelect options
    const mapToOptions = (arr: string[]) => arr.map(item => ({ value: item, label: item }));

    const [formData, setFormData] = useState({
        // Section 1
        caseNumber: "",
        diaryNumber: "",
        cnrNumber: "",
        title: "",
        description: "",
        clientEmail: "",
        // Section 2
        courtLevel: "District Court",
        court: "",
        benchLocation: "",
        benchType: "",
        courtHallNumber: "",
        state: "",
        districtOfOrigin: "",
        // Section 3
        caseType: "",
        caseOriginType: "",
        category: "",
        stageOfCase: "Fresh Filing",
        status: "Fresh",
        filingDate: "",
        registrationDate: "",
        defectStatus: "No Defect",
        defectRemovedDate: "",
        limitationDate: "",
        delayCondonation: "Not Applicable",
        // Section 4
        firstHearingDate: "",
        lastHearingDate: "",
        lastOrderSummary: "",
        nextHearingDate: "",
        nextHearingPurpose: "",
        // Section 5
        acts: "",
        underSections: "",
        prayerReliefSought: "",
        interimRelief: "Not Applied",
        stayStatus: "Not Applied",
        noticeStatus: "Not Issued",
        connectedCases: "",
        connectionType: "",
        previousCaseReference: "",
        // Section 6
        firNumber: "",
        policeStation: "",
        firDate: "",
        // Section 7
        petitioner: "",
        respondent: "",
        thirdPartyIntervenor: "",
        amicusCuriae: "",
        // Section 8
        petitionerAdvocate: "",
        respondentAdvocate: "",
        judgeIds: [] as string[],
        // Section 9
        judgmentDate: "",
        judgmentSummary: "",
        disposalNature: "",
        // Section 10
        officeId: "",
        practiceArea: "",
        confidentialityLevel: "Internal",
    });

    // Handle initial draft restoration
    useEffect(() => {
        const savedDraft = localStorage.getItem("case_creation_draft");
        if (savedDraft) {
            try {
                const parsed = JSON.parse(savedDraft);
                setFormData(prev => ({ ...prev, ...parsed }));
                toast.success("Case draft restored", {
                    icon: '📝',
                    duration: 3000,
                });
            } catch (error) {
                console.error("Error restoring draft:", error);
                localStorage.removeItem("case_creation_draft");
            }
        }
        setIsRestoring(false);
    }, []);

    // Debounced Auto-save to localStorage
    useEffect(() => {
        if (isRestoring) return;

        setSaveStatus("saving");
        const timeoutId = setTimeout(() => {
            localStorage.setItem("case_creation_draft", JSON.stringify(formData));
            setSaveStatus("saved");
            // Reset to idle after 2 seconds of showing "saved"
            const idleTimeout = setTimeout(() => setSaveStatus("idle"), 2000);
            return () => clearTimeout(idleTimeout);
        }, 1000); // 1 second debounce

        return () => clearTimeout(timeoutId);
    }, [formData, isRestoring]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (errors[name]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const inputClasses = (name: string) => `w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors[name]
        ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/5 placeholder:text-red-300"
        : "border-gray-300 focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227] bg-white"
        }`;

    const extractTotalPages = (response: any) => {
        const meta = response.data?.meta ?? response.data?.data?.meta;
        if (meta?.totalPages) return meta.totalPages;
        const total = response.data?.data?.total ?? response.data?.total ?? 0;
        const limit = response.data?.data?.limit ?? response.data?.limit ?? 12;
        return total > 0 ? Math.ceil(total / limit) : 1;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Required fields mapping
        const requiredFields = [
            { key: 'title', label: 'Title' },
            { key: 'courtLevel', label: 'Court Level' },
            { key: 'court', label: 'Court Name' },
            { key: 'state', label: 'State' },
            { key: 'caseType', label: 'Case Type' },
            { key: 'stageOfCase', label: 'Stage of Case' },
            { key: 'status', label: 'Status' },
            { key: 'filingDate', label: 'Filing Date' },
        ];

        const newErrors: Record<string, string> = {};
        let firstErrorKey: string | null = null;

        for (const field of requiredFields) {
            if (!formData[field.key as keyof typeof formData]) {
                newErrors[field.key] = `${field.label} is required`;
                if (!firstErrorKey) firstErrorKey = field.key;
            }
        }

        // Custom validation: Either Case Number or Diary Number
        if (!formData.caseNumber && !formData.diaryNumber) {
            newErrors['caseNumber'] = 'Either Case Number or Diary Number is required';
            newErrors['diaryNumber'] = 'Either Case Number or Diary Number is required';
            if (!firstErrorKey) firstErrorKey = 'caseNumber';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            // toast.error("Please fill all required fields");

            if (firstErrorKey) {
                setTimeout(() => {
                    const element = document.getElementById(`field-${firstErrorKey}`);
                    if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // Focus the interactive element within the field
                        const input = element.querySelector('input, select, textarea, button') as HTMLElement;
                        if (input) input.focus();
                    }
                }, 100);
            }
            return;
        }

        setSubmitting(true);
        try {
            const dataToSubmit: any = {
                ...formData,
                acts: formData.acts.split(',').map(s => s.trim()).filter(Boolean),
                underSections: formData.underSections.split(',').map(s => s.trim()).filter(Boolean),
                petitioner: formData.petitioner.split(',').map(s => s.trim()).filter(Boolean),
                respondent: formData.respondent.split(',').map(s => s.trim()).filter(Boolean),
                thirdPartyIntervenor: formData.thirdPartyIntervenor.split(',').map(s => s.trim()).filter(Boolean),
                petitionerAdvocate: formData.petitionerAdvocate.split(',').map(s => s.trim()).filter(Boolean),
                respondentAdvocate: formData.respondentAdvocate.split(',').map(s => s.trim()).filter(Boolean),
                connectedCases: formData.connectedCases.split(',').map(s => s.trim()).filter(Boolean),
            };

            // Remove empty fields to avoid validation errors
            Object.keys(dataToSubmit).forEach(key => {
                if (dataToSubmit[key] === "" || (Array.isArray(dataToSubmit[key]) && dataToSubmit[key].length === 0)) {
                    delete dataToSubmit[key];
                }
            });

            await casesService.create(dataToSubmit);
            localStorage.removeItem("case_creation_draft");
            toast.success("Case created successfully");
            router.push("/admin/cases");
        } catch (error: any) {
            toast.error(error.message || "Failed to create case");
            setSubmitting(false);
        }
    };

    const SectionHeader = ({ icon: Icon, title, description }: any) => (
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-6 mt-10 first:mt-0">
            <div className="w-10 h-10 rounded-xl bg-[#0A2342]/5 text-[#0A2342] flex items-center justify-center shrink-0">
                <Icon size={20} />
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h2>
                {description && <p className="text-xs text-gray-500">{description}</p>}
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            {submitting && <Loader fullScreen text="Creating Case..." />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Add New Case</h1>
                        <div className="flex items-center gap-2">
                            <p className="text-gray-500 text-sm font-medium">Drafting a new legal matter</p>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-1.5 min-w-[100px]">
                                {saveStatus === "saving" ? (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">Saving...</span>
                                    </>
                                ) : saveStatus === "saved" ? (
                                    <>
                                        <ShieldCheck size={12} className="text-green-500" />
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-green-500">Auto-saved</span>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                                        <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Safe in Draft</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-bold transition-all"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2.5 bg-[#0A2342] text-white rounded-xl hover:bg-[#153a66] text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-blue-900/10"
                    >
                        <Save size={18} /> Finish & Save
                    </button>
                </div> */}
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12 space-y-6">

                {/* SECTION 1 - Basic Information */}
                <SectionHeader icon={Info} title="Basic Information" description="Vital identifiers for the case" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField id="field-caseNumber" label="Case Number" error={errors.caseNumber} description="Required if Diary Number is missing">
                        <input name="caseNumber" value={formData.caseNumber} className={inputClasses('caseNumber')} placeholder="WP/1234/2024" onChange={handleChange} />
                    </FormField>
                    <FormField id="field-diaryNumber" label="Diary Number" error={errors.diaryNumber} description="Required if Case Number is missing">
                        <input name="diaryNumber" value={formData.diaryNumber} className={inputClasses('diaryNumber')} placeholder="Entry diary sequence" onChange={handleChange} />
                    </FormField>
                    <FormField label="CNR Number" description="16-digit unique Case Record Number">
                        <input name="cnrNumber" value={formData.cnrNumber} maxLength={16} className={inputClasses('cnrNumber')} placeholder="Unique ID for e-courts" onChange={handleChange} />
                    </FormField>
                    <FormField id="field-title" label="Title" error={errors.title} required description="Party vs Party naming">
                        <input name="title" value={formData.title} className={inputClasses('title')} placeholder="e.g. State vs John Doe" onChange={handleChange} />
                    </FormField>
                </div>
                <FormField label="Description">
                    <textarea name="description" value={formData.description} rows={3} className={inputClasses('description')} placeholder="Provide a brief context of the matter..." onChange={handleChange} />
                </FormField>

                {/* SECTION 2 - Court Details */}
                <SectionHeader icon={Building} title="Court Details" description="Jurisdiction and Bench information" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField id="field-courtLevel" label="Court Level" error={errors.courtLevel} required>
                        <CustomSelect
                            name="courtLevel"
                            options={mapToOptions(COURT_LEVELS)}
                            value={formData.courtLevel}
                            onChange={(val) => setFormData({ ...formData, courtLevel: val })}
                            error={!!errors.courtLevel}
                        />
                    </FormField>
                    <FormField id="field-court" label="Court Name" error={errors.court} required>
                        <CourtSearchableDropdown name="court" value={formData.court} onChange={(val) => setFormData({ ...formData, court: val })} />
                    </FormField>
                    <FormField id="field-state" label="Bench State" error={errors.state} required>
                        <StateSearchableDropdown name="state" value={formData.state} onChange={(val) => setFormData({ ...formData, state: val })} />
                    </FormField>
                    <FormField label="Bench Location" description="e.g. Principal Bench / Lucknow">
                        <input name="benchLocation" value={formData.benchLocation} className={inputClasses('benchLocation')} placeholder="Specific location" onChange={handleChange} />
                    </FormField>
                    <FormField label="Bench Type">
                        <CustomSelect
                            name="benchType"
                            options={mapToOptions(BENCH_TYPES)}
                            value={formData.benchType}
                            onChange={(val) => setFormData({ ...formData, benchType: val })}
                            placeholder="Select Bench Type"
                        />
                    </FormField>
                    <FormField label="Court Hall Number">
                        <input name="courtHallNumber" value={formData.courtHallNumber} className={inputClasses('courtHallNumber')} placeholder="Room #" onChange={handleChange} />
                    </FormField>
                    <FormField label="District of Origin">
                        <input name="districtOfOrigin" value={formData.districtOfOrigin} className={inputClasses('districtOfOrigin')} placeholder="Originating district" onChange={handleChange} />
                    </FormField>
                </div>

                {/* SECTION 3 - Case Details */}
                <SectionHeader icon={Scale} title="Case Filing & Status" description="Lifecycle and filing progression" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField id="field-caseType" label="Case Type" required>
                        <CaseTypeSearchableDropdown name="caseType" value={formData.caseType} onChange={(val) => setFormData({ ...formData, caseType: val })} />
                    </FormField>
                    <FormField label="Origin Type">
                        <CustomSelect
                            name="caseOriginType"
                            options={mapToOptions(CASE_ORIGIN_TYPES)}
                            value={formData.caseOriginType}
                            onChange={(val) => setFormData({ ...formData, caseOriginType: val })}
                            placeholder="Select Origin"
                        />
                    </FormField>
                    <FormField label="Category">
                        <CustomSelect
                            name="category"
                            options={mapToOptions(CASE_CATEGORIES)}
                            value={formData.category}
                            onChange={(val) => setFormData({ ...formData, category: val })}
                            placeholder="Select Category"
                        />
                    </FormField>
                    <FormField id="field-stageOfCase" label="Stage of Case" required>
                        <CustomSelect
                            name="stageOfCase"
                            options={mapToOptions(CASE_STAGES)}
                            value={formData.stageOfCase}
                            onChange={(val) => setFormData({ ...formData, stageOfCase: val })}
                        />
                    </FormField>
                    <FormField id="field-status" label="Status" required>
                        <CustomSelect
                            name="status"
                            options={mapToOptions(CASE_STATUSES)}
                            value={formData.status}
                            onChange={(val) => setFormData({ ...formData, status: val })}
                        />
                    </FormField>
                    <FormField label="Defect Status">
                        <CustomSelect
                            name="defectStatus"
                            options={mapToOptions(DEFECT_STATUSES)}
                            value={formData.defectStatus}
                            onChange={(val) => setFormData({ ...formData, defectStatus: val })}
                        />
                    </FormField>
                    <FormField id="field-filingDate" label="Filing Date" required>
                        <input type="date" name="filingDate" value={formData.filingDate} className={inputClasses('filingDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Registration Date">
                        <input type="date" name="registrationDate" value={formData.registrationDate} className={inputClasses('registrationDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Defect Removed Date">
                        <input type="date" name="defectRemovedDate" value={formData.defectRemovedDate} className={inputClasses('defectRemovedDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Limitation Date">
                        <input type="date" name="limitationDate" value={formData.limitationDate} className={inputClasses('limitationDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Delay Condonation">
                        <CustomSelect
                            name="delayCondonation"
                            options={mapToOptions(DELAY_CONDONATION_OPTIONS)}
                            value={formData.delayCondonation}
                            onChange={(val) => setFormData({ ...formData, delayCondonation: val })}
                        />
                    </FormField>
                </div>

                {/* SECTION 4 - Hearing Details */}
                <SectionHeader icon={Calendar} title="Hearing Timeline" description="Past and upcoming hearing schedules" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="First Hearing Date">
                        <input type="date" name="firstHearingDate" value={formData.firstHearingDate} className={inputClasses('firstHearingDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Last Hearing Date">
                        <input type="date" name="lastHearingDate" value={formData.lastHearingDate} className={inputClasses('lastHearingDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Next Hearing Date">
                        <input type="date" name="nextHearingDate" value={formData.nextHearingDate} className={inputClasses('nextHearingDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Next Hearing Purpose">
                        <CustomSelect
                            name="nextHearingPurpose"
                            options={mapToOptions(HEARING_PURPOSES)}
                            value={formData.nextHearingPurpose}
                            onChange={(val) => setFormData({ ...formData, nextHearingPurpose: val })}
                            placeholder="Select Purpose"
                        />
                    </FormField>
                </div>
                <FormField label="Last Order Summary">
                    <textarea name="lastOrderSummary" value={formData.lastOrderSummary} rows={2} className={inputClasses('lastOrderSummary')} placeholder="Briefly describe the outcome of the last hearing..." onChange={handleChange} />
                </FormField>

                {/* SECTION 5 - Legal Details */}
                <SectionHeader icon={Gavel} title="Legal Grounds" description="Acts, Sections and Relief sought" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Under Acts" description="Comma separated e.g. IPC, CrPC">
                        <input name="acts" value={formData.acts} className={inputClasses('acts')} placeholder="IPC, Constitution, etc." onChange={handleChange} />
                    </FormField>
                    <FormField label="Under Sections" description="Comma separated e.g. 302, 420">
                        <input name="underSections" value={formData.underSections} className={inputClasses('underSections')} placeholder="302, 307, 120B" onChange={handleChange} />
                    </FormField>
                    <FormField label="Interim Relief">
                        <CustomSelect
                            name="interimRelief"
                            options={mapToOptions(INTERIM_RELIEF_STATUSES)}
                            value={formData.interimRelief}
                            onChange={(val) => setFormData({ ...formData, interimRelief: val })}
                        />
                    </FormField>
                    <FormField label="Stay Status">
                        <CustomSelect
                            name="stayStatus"
                            options={mapToOptions(STAY_STATUSES)}
                            value={formData.stayStatus}
                            onChange={(val) => setFormData({ ...formData, stayStatus: val })}
                        />
                    </FormField>
                    <FormField label="Notice Status">
                        <CustomSelect
                            name="noticeStatus"
                            options={mapToOptions(NOTICE_STATUSES)}
                            value={formData.noticeStatus}
                            onChange={(val) => setFormData({ ...formData, noticeStatus: val })}
                        />
                    </FormField>
                    <FormField label="Connection Type">
                        <CustomSelect
                            name="connectionType"
                            options={mapToOptions(CONNECTION_TYPES)}
                            value={formData.connectionType}
                            onChange={(val) => setFormData({ ...formData, connectionType: val })}
                            placeholder="Select Connection"
                        />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Connected Case Numbers" description="Comma separated list">
                        <input name="connectedCases" value={formData.connectedCases} className={inputClasses('connectedCases')} placeholder="e.g. CA/45/2023, SLP/89/22" onChange={handleChange} />
                    </FormField>
                    <FormField label="Previous Case Reference" description="Lower court case number if appeal">
                        <input name="previousCaseReference" value={formData.previousCaseReference} className={inputClasses('previousCaseReference')} placeholder="Ref lower court #" onChange={handleChange} />
                    </FormField>
                </div>
                <FormField label="Prayer / Relief Sought">
                    <textarea name="prayerReliefSought" value={formData.prayerReliefSought} rows={3} className={inputClasses('prayerReliefSought')} placeholder="What is the primary relief being asked for?" onChange={handleChange} />
                </FormField>

                {/* SECTION 6 - Criminal Case Specific */}
                {formData.caseType.toLowerCase().includes('criminal') && (
                    <>
                        <SectionHeader icon={ShieldCheck} title="Criminal Case Specific" description="FIR and Police Station records" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-300">
                            <FormField label="FIR Number">
                                <input name="firNumber" value={formData.firNumber} className={inputClasses('firNumber')} placeholder="FIR #" onChange={handleChange} />
                            </FormField>
                            <FormField label="Police Station">
                                <input name="policeStation" value={formData.policeStation} className={inputClasses('policeStation')} placeholder="Station name" onChange={handleChange} />
                            </FormField>
                            <FormField label="FIR Date">
                                <input type="date" name="firDate" value={formData.firDate} className={inputClasses('firDate')} onChange={handleChange} />
                            </FormField>
                        </div>
                    </>
                )}

                {/* SECTION 7 - Parties Details */}
                <SectionHeader icon={Users} title="Parties & Envoys" description="Litigants and stakeholders" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField id="field-petitioner" label="Petitioners" description="Multiple allowed (comma separated)">
                        <input name="petitioner" value={formData.petitioner} className={inputClasses('petitioner')} placeholder="Petitioner name(s)..." onChange={handleChange} />
                    </FormField>
                    <FormField label="Respondents" description="Multiple allowed (comma separated)">
                        <input name="respondent" value={formData.respondent} className={inputClasses('respondent')} placeholder="Respondent name(s)..." onChange={handleChange} />
                    </FormField>
                    <FormField label="Third Party / Intervenor" description="Additional parties">
                        <input name="thirdPartyIntervenor" value={formData.thirdPartyIntervenor} className={inputClasses('thirdPartyIntervenor')} placeholder="Intervenors if any..." onChange={handleChange} />
                    </FormField>
                    <FormField label="Amicus Curiae" description="Friend of the Court">
                        <input name="amicusCuriae" value={formData.amicusCuriae} className={inputClasses('amicusCuriae')} placeholder="Court appointed counsel..." onChange={handleChange} />
                    </FormField>
                    <FormField label="Client Email Address" description="Used for private dashboard access">
                        <input type="email" name="clientEmail" value={formData.clientEmail} className={inputClasses('clientEmail')} placeholder="client@example.com" onChange={handleChange} />
                    </FormField>
                </div>

                {/* SECTION 8 - Counsel & Presiding Officer */}
                <SectionHeader icon={FileText} title="Advocate Details" description="Representation for both sides" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField label="Petitioner Advocates" description="Multiple allowed (comma separated)">
                        <input name="petitionerAdvocate" value={formData.petitionerAdvocate} className={inputClasses('petitionerAdvocate')} placeholder="Advocate name(s)..." onChange={handleChange} />
                    </FormField>
                    <FormField label="Respondent Advocates" description="Multiple allowed (comma separated)">
                        <input name="respondentAdvocate" value={formData.respondentAdvocate} className={inputClasses('respondentAdvocate')} placeholder="Advocate name(s)..." onChange={handleChange} />
                    </FormField>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Presiding Judge" description="Select from registered judges">
                        <InfiniteSearchableMultiSelect
                            name="judgeIds"
                            selectedValues={formData.judgeIds}
                            onChange={(vals) => setFormData({ ...formData, judgeIds: vals })}
                            placeholder="Search and add judges..."
                            onSearch={async (query: string, page: number) => {
                                const res = query.trim()
                                    ? await judgesService.searchJudges(query, page, 10)
                                    : await judgesService.getAll({ page, limit: 10 });
                                const items = res.data?.data?.data || res.data?.data || [];
                                return {
                                    options: items.map((j: any) => ({
                                        value: j.id,
                                        label: j.name,
                                        subLabel: j.designation
                                    })),
                                    totalPages: extractTotalPages(res)
                                };
                            }}
                        />
                    </FormField>
                </div>

                {/* SECTION 9 - Judgment Details */}
                <SectionHeader icon={AlertCircle} title="Final Disposition" description="Final judgment and disposal details" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label="Judgment Date">
                        <input type="date" name="judgmentDate" value={formData.judgmentDate} className={inputClasses('judgmentDate')} onChange={handleChange} />
                    </FormField>
                    <FormField label="Disposal Nature">
                        <CustomSelect
                            name="disposalNature"
                            options={mapToOptions(DISPOSAL_NATURES)}
                            value={formData.disposalNature}
                            onChange={(val) => setFormData({ ...formData, disposalNature: val })}
                            placeholder="Select Disposition"
                        />
                    </FormField>
                </div>
                <FormField label="Judgment Summary">
                    <textarea name="judgmentSummary" value={formData.judgmentSummary} rows={3} className={inputClasses('judgmentSummary')} placeholder="Main operative part of the judgment..." onChange={handleChange} />
                </FormField>

                {/* SECTION 10 - internal Management */}
                <SectionHeader icon={ShieldCheck} title="Law Firm Specific" description="Internal classification and access" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField label="Office ID" description="Internal file ref">
                        <input name="officeId" value={formData.officeId} className={inputClasses('officeId')} placeholder="OFF-2024-XXXX" onChange={handleChange} />
                    </FormField>
                    <FormField label="Practice Area" description="Subject of law">
                        <CustomSelect
                            name="practiceArea"
                            options={mapToOptions(PRACTICE_AREAS)}
                            value={formData.practiceArea}
                            onChange={(val) => setFormData({ ...formData, practiceArea: val })}
                            placeholder="Select Area"
                        />
                    </FormField>
                    <FormField label="Confidentiality" description="Access control level">
                        <CustomSelect
                            name="confidentialityLevel"
                            options={CONFIDENTIALITY_LEVELS}
                            value={formData.confidentialityLevel}
                            onChange={(val) => setFormData({ ...formData, confidentialityLevel: val })}
                        />
                    </FormField>
                </div>

                <div className="flex justify-end gap-3 pt-12 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-8 py-3 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-10 py-3 bg-[#0A2342] text-white rounded-2xl hover:bg-[#153a66] font-bold transition-all shadow-xl shadow-blue-900/10 disabled:opacity-50 flex items-center gap-3"
                    >
                        {submitting ? <Loader size="sm" /> : <Save size={20} />}
                        Save Case Details
                    </button>
                </div>
            </form>
        </div>
    );
}
