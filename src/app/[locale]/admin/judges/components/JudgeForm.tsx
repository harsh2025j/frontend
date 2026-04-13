"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
    User,
    Gavel,
    BookOpen,
    Upload,
    X,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    Check,
    Calendar
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import RichTextEditor from "@/components/ui/RichTextEditor";
import FormField from "@/components/ui/FormField";
import CourtSearchableDropdown from "@/components/ui/CourtSearchableDropdown";
import { judgesService } from "@/data/services/judges-service/judgesService";
import { Judge } from "@/data/services/judges-service/judges.types";

interface JudgeFormProps {
    initialData?: Judge;
}

export default function JudgeForm({ initialData }: JudgeFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("identity");
    const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photoUrl || null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        prefix: initialData?.prefix || "",
        gender: initialData?.gender || "",
        dob: initialData?.dob || "",
        nationality: initialData?.nationality || "Indian",
        designation: initialData?.designation || "",
        court: initialData?.court || "",
        courtType: initialData?.courtType || "",
        benchLocation: initialData?.benchLocation || "",
        state: initialData?.state || "",
        appointmentDate: initialData?.appointmentDate || "",
        appointmentType: initialData?.appointmentType || "",
        isServing: initialData?.isServing ?? true,
        retirementDate: initialData?.retirementDate || "",
        departureReason: initialData?.departureReason || "",
        seniorityNumber: initialData?.seniorityNumber ?? "",
        officialEmail: initialData?.officialEmail || "",
        officialPhone: initialData?.officialPhone || "",
        officialAddress: initialData?.officialAddress || "",
        educationalQualifications: initialData?.educationalQualifications || "",
        barEnrollment: initialData?.barEnrollment || "",
        yearsOfPractice: initialData?.yearsOfPractice ?? "",
        priorJudicialPositions: initialData?.priorJudicialPositions || "",
        specialization: initialData?.specialization || [] as string[],
        biography: initialData?.biography || "",
        status: initialData?.status || "published",
        isVerified: initialData?.isVerified ?? false,
        dataSource: {
            label: initialData?.dataSource?.label || "",
            url: initialData?.dataSource?.url || ""
        }
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Image size must be less than 5MB");
                return;
            }
            setPhotoFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const validateTab = (tabId: string) => {
        const newErrors: Record<string, string> = {};

        if (tabId === "identity") {
            if (!formData.name.trim()) newErrors.name = "Full Name is required";
        }

        if (tabId === "position") {
            if (!formData.designation.trim()) newErrors.designation = "Designation is required";
            if (!formData.court.trim()) newErrors.court = "Court Name is required";
            if (!formData.courtType.trim()) newErrors.courtType = "Court Type is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePublish = async () => {
        // Final validation before API call
        if (!validateTab("identity") || !validateTab("position")) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);

        try {
            // Clean the payload: convert empty strings to null for date/number fields
            // judgesService will skip these null values, ensuring they aren't sent to the backend
            const cleanedData: any = { ...formData };
            const fieldsToClean = [
                'dob',
                'appointmentDate',
                'retirementDate',
                'seniorityNumber',
                'yearsOfPractice'
            ];

            fieldsToClean.forEach(field => {
                if (cleanedData[field] === "") {
                    cleanedData[field] = null;
                }
            });

            console.log('[PHOTO DEBUG] photoFile state:', photoFile, 'isFile:', photoFile instanceof File, 'type:', typeof photoFile);

            const payload = { ...cleanedData, photo: photoFile };

            if (initialData) {
                await judgesService.update(initialData.id, payload);
                toast.success("Judge profile updated successfully!");
            } else {
                await judgesService.create(payload);
                toast.success("Judge profile created successfully!");
            }

            router.push("/admin/judges");
            router.refresh();
        } catch (error: any) {
            console.error("[DEBUG] JudgeForm Submission Error:", {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config,
                error
            });
            const serverMsg = error.response?.data?.message;
            const displayMsg = Array.isArray(serverMsg) ? serverMsg.join(", ") : serverMsg;
            toast.error(displayMsg || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: "identity", label: "Identity", icon: User },
        { id: "position", label: "Position & Service", icon: Gavel },
        { id: "background", label: "Background", icon: Briefcase },
        { id: "records", label: "Biography", icon: BookOpen },
    ];

    const currentTabIndex = tabs.findIndex(t => t.id === activeTab);
    const isFirstTab = currentTabIndex === 0;
    const isLastTab = currentTabIndex === tabs.length - 1;

    const navToNext = () => {
        if (validateTab(activeTab)) {
            if (!isLastTab) setActiveTab(tabs[currentTabIndex + 1].id);
        } else {
            // toast.error("Please fill all required fields before proceeding");
        }
    };

    const navToPrev = () => {
        setActiveTab(tabs[currentTabIndex - 1].id);
    };

    const handleTabClick = (tabId: string) => {
        // Only allow clicking to tabs already validated or previous tabs
        const targetIndex = tabs.findIndex(t => t.id === tabId);
        if (targetIndex < currentTabIndex) {
            setActiveTab(tabId);
        } else if (validateTab(activeTab)) {
            setActiveTab(tabId);
        }
    };

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
        >
            <div className="flex border-b border-gray-100 bg-gray-50/50">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => handleTabClick(tab.id)}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${activeTab === tab.id
                            ? "text-blue-600 bg-white border-b-2 border-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                            {idx + 1}
                        </div>
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-8 min-h-[500px]">
                {activeTab === "identity" && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <section className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-full md:w-1/3">
                                <FormField label="Profile Photo">
                                    <div className="relative group aspect-square rounded-2xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-200 hover:border-blue-400 transition-colors cursor-pointer">
                                        {photoPreview ? (
                                            <>
                                                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="text-white" />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setPhotoPreview(null); setPhotoFile(null); }}
                                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-2">
                                                <Upload size={32} />
                                                <span className="text-xs">Click to upload photo</span>
                                            </div>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handlePhotoChange}
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </FormField>
                            </div>

                            <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="md:col-span-2">
                                    <FormField label="Full Name" required error={errors.name}>
                                        <input
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g. Justice DY Chandrachud"
                                            className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                    </FormField>
                                </div>
                                <FormField label="Prefix / Title">
                                    <select
                                        name="prefix"
                                        value={formData.prefix}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    >
                                        <option value="">Select Prefix</option>
                                        <option value="Justice">Justice</option>
                                        <option value="Chief Justice">Chief Justice</option>
                                        <option value="Retd. Justice">Retd. Justice</option>
                                        <option value="Hon'ble">Hon'ble</option>
                                        <option value="Shri / Shrimati">Shri / Shrimati</option>
                                        <option value="Dr.">Dr.</option>
                                        <option value="Justice (Retd.)">Justice (Retd.)</option>
                                        <option value="Mr. Justice">Mr. Justice</option>
                                        <option value="Mrs. Justice">Mrs. Justice</option>
                                    </select>
                                </FormField>
                                <FormField label="Gender">
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </FormField>
                                <FormField label="Date of Birth">
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </FormField>
                                <FormField label="Nationality">
                                    <input
                                        name="nationality"
                                        value={formData.nationality}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </FormField>
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "position" && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
                        <section>
                            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-5 border-l-4 border-blue-500 pl-3">Current Assignment</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="Designation" required error={errors.designation}>
                                    <input
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Chief Justice"
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.designation ? 'border-red-500' : 'border-gray-200'}`}
                                    />
                                </FormField>
                                <FormField label="Court Name" required error={errors.court}>
                                    <CourtSearchableDropdown
                                        value={formData.court}
                                        onChange={(val) => {
                                            setFormData(prev => ({ ...prev, court: val }));
                                            if (errors.court) {
                                                setErrors(prev => {
                                                    const newErrors = { ...prev };
                                                    delete newErrors.court;
                                                    return newErrors;
                                                });
                                            }
                                        }}
                                        error={errors.court}
                                    />
                                </FormField>
                                <FormField label="Court Type" required error={errors.courtType}>
                                    <select
                                        name="courtType"
                                        value={formData.courtType}
                                        onChange={handleInputChange}
                                        className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none ${errors.courtType ? 'border-red-500' : 'border-gray-200'}`}
                                    >
                                        <option value="">Select Category</option>
                                        <option value="Supreme Court">Supreme Court</option>
                                        <option value="High Court">High Court</option>
                                        <option value="District Court">District Court</option>
                                        <option value="Tribunal">Tribunal</option>
                                        <option value="Special Court">Special Court</option>
                                        <option value="Fast Track Court">Fast Track Court</option>
                                        <option value="Family Court">Family Court</option>
                                        <option value="Consumer Court">Consumer Court</option>
                                        <option value="Revenue Court">Revenue Court</option>
                                        <option value="Lok Adalat">Lok Adalat</option>
                                    </select>
                                </FormField>
                                <FormField label="Bench Location">
                                    <input
                                        name="benchLocation"
                                        value={formData.benchLocation}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Lucknow Bench"
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </FormField>
                            </div>
                        </section>

                        <section className="p-6 bg-orange-50/30 rounded-2xl border border-orange-100">
                            <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                                <Calendar size={18} /> Service Timeline
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <FormField label="Appointment Date">
                                    <input
                                        type="date"
                                        name="appointmentDate"
                                        value={formData.appointmentDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white"
                                    />
                                </FormField>
                                <FormField label="Appointment Type">
                                    <select
                                        name="appointmentType"
                                        value={formData.appointmentType}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white"
                                    >
                                        <option value="">Select Type</option>
                                        <option value="Direct">Direct</option>
                                        <option value="Elevated from Bar (Advocate)">Elevated from Bar (Advocate)</option>
                                        <option value="Elevated from District Judiciary">Elevated from District Judiciary</option>
                                        <option value="Transferred">Transferred</option>
                                        <option value="Acting">Acting</option>
                                        <option value="Ad-hoc">Ad-hoc</option>
                                        <option value="Re-appointed">Re-appointed</option>
                                        <option value="Designated">Designated</option>
                                    </select>
                                </FormField>
                                <div className="flex items-center gap-3 py-4">
                                    <div
                                        onClick={() => setFormData(prev => ({ ...prev, isServing: !prev.isServing }))}
                                        className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${formData.isServing ? "bg-blue-600" : "bg-gray-300"}`}
                                    >
                                        <div className={`bg-white w-4 h-4 rounded-full shadow-md transition-transform ${formData.isServing ? "translate-x-6" : ""}`} />
                                    </div>
                                    <span className="text-sm font-semibold text-gray-800">Currently Serving</span>
                                </div>

                                <FormField label="Retirement/Departure Date">
                                    <input
                                        type="date"
                                        name="retirementDate"
                                        value={formData.retirementDate}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:border-blue-500 bg-white"
                                    />
                                </FormField>

                                {!formData.isServing && (
                                    <div className="md:col-span-2">
                                        <FormField label="Departure Reason">
                                            <select
                                                name="departureReason"
                                                value={formData.departureReason}
                                                onChange={handleInputChange}
                                                className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none bg-white"
                                            >
                                                <option value="">Select Reason</option>
                                                <option value="Retired">Retired</option>
                                                <option value="Resigned">Resigned</option>
                                                <option value="Elevated">Elevated</option>
                                                <option value="Deceased (in office)">Deceased (in office)</option>
                                                <option value="Deceased (post-retirement)">Deceased (post-retirement)</option>
                                                <option value="Transferred">Transferred</option>
                                                <option value="Removed">Removed</option>
                                                <option value="Term Ended">Term Ended</option>
                                            </select>
                                        </FormField>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {activeTab === "background" && (
                    <div className="space-y-6 animate-in slide-in-from-left-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <FormField label="Educational Qualifications (LLB, LLM, etc.)">
                                    <textarea
                                        name="educationalQualifications"
                                        rows={2}
                                        value={formData.educationalQualifications}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </FormField>
                            </div>
                            <FormField label="Bar Enrollment Details">
                                <input
                                    name="barEnrollment"
                                    value={formData.barEnrollment}
                                    onChange={handleInputChange}
                                    placeholder="e.g. State Bar Council 1995"
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </FormField>
                            <FormField label="Years of Practice">
                                <input
                                    type="number"
                                    name="yearsOfPractice"
                                    value={formData.yearsOfPractice}
                                    onChange={handleInputChange}
                                    className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                />
                            </FormField>
                            <div className="md:col-span-2">
                                <FormField label="Prior Judicial Positions">
                                    <textarea
                                        name="priorJudicialPositions"
                                        rows={3}
                                        value={formData.priorJudicialPositions}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                    />
                                </FormField>
                            </div>
                            <div className="md:col-span-2 p-5 bg-gray-50 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField label="Official Email">
                                    <input placeholder="judge@registry.gov" name="officialEmail" value={formData.officialEmail} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg bg-white" />
                                </FormField>
                                <FormField label="Official Phone">
                                    <input placeholder="+91..." name="officialPhone" value={formData.officialPhone} onChange={handleInputChange} className="w-full p-2.5 border border-gray-200 rounded-lg bg-white" />
                                </FormField>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "records" && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        <FormField label="Detailed Professional Biography">
                            <RichTextEditor
                                value={formData.biography}
                                onChange={(val) => setFormData(prev => ({ ...prev, biography: val }))}
                            />
                        </FormField>
                        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                            <div className="p-2 bg-white rounded-lg text-blue-600">
                                <BookOpen size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">Final Review</h4>
                                <p className="text-xs text-blue-700 mt-1">Please ensure all judicial data and service timelines are accurate before publishing this profile to the public database.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Cancel
                </button>

                <div className="flex items-center gap-3">
                    {!isFirstTab && (
                        <button
                            type="button"
                            onClick={navToPrev}
                            className="px-6 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all flex items-center gap-2"
                        >
                            <ChevronLeft size={18} /> Previous
                        </button>
                    )}

                    {!isLastTab ? (
                        <button
                            type="button"
                            onClick={navToNext}
                            className="px-8 py-2.5 text-sm font-bold text-white bg-[#0A2342] hover:bg-[#153a66] rounded-xl shadow-lg transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={loading}
                            className="px-10 py-2.5 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-100 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading ? <Loader size="sm" color="white" /> : (
                                <>
                                    <Check size={18} />
                                    {initialData ? "Update Profile" : "Publish Profile"}
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </form>
    );
}
