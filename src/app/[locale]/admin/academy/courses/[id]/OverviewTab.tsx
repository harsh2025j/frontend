import React, { useState } from "react";
import { Edit2, X, CheckCircle, UploadCloud, Loader2, Award } from "lucide-react";
import toast from "react-hot-toast";
import { courseApi } from "@/data/services/academy-service/course.service";
import apiClient from "@/data/services/apiConfig/apiClient";
import { uploadToS3 } from "@/lib/uploadToS3";
import CreatableSelect from 'react-select/creatable';
import Cropper from 'react-easy-crop';
import { getCroppedImg } from '@/lib/cropImage';

interface OverviewTabProps {
  course: any;
  setCourse: (course: any) => void;
  mockStats: any;
}

export default function OverviewTab({ course, setCourse, mockStats }: OverviewTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Cropper state
  const [cropData, setCropData] = useState<{ src: string | null; pixelCrop: any }>({ src: null, pixelCrop: null });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Instructor Cropper state
  const [instructorCropData, setInstructorCropData] = useState<{ index: number | null; src: string | null; pixelCrop: any }>({ index: null, src: null, pixelCrop: null });

  React.useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoadingCategories(true);
        const res = await courseApi.fetchCategories();
        if (res.data && Array.isArray(res.data)) {
          setCategories(res.data.map((c: any) => ({ label: c.name, value: c.name })));
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCats();
  }, []);

  const [courseTests, setCourseTests] = useState<any[]>([]);

  React.useEffect(() => {
    if (course?.id) {
      apiClient.get("/academy/assessments", { params: { courseId: course.id } })
        .then((res) => {
          const data = res.data?.data || res.data || [];
          setCourseTests(Array.isArray(data) ? data : []);
        })
        .catch((err) => console.error("Failed to load assessments in OverviewTab:", err));
    }
  }, [course?.id]);

  const handleCategoryCreate = async (inputValue: string) => {
    try {
      setLoadingCategories(true);
      const res = await courseApi.createCategory({ name: inputValue });
      const newOption = { label: res.data.name, value: res.data.name };
      setCategories(prev => [...prev, newOption]);
      setForm((prev: any) => ({ ...prev, category: res.data.name }));
    } catch (err) {
      toast.error("Failed to create category");
    } finally {
      setLoadingCategories(false);
    }
  };

  // Form State
  const [form, setForm] = useState<any>({});
  const [arrays, setArrays] = useState({
    requirements: [] as string[],
    whatYouWillLearn: [] as string[],
    features: [] as string[],
    targetAudience: [] as string[],
    inclusions: [] as string[],
    faqs: [] as { q: string, a: string }[],
    instructors: [] as { name: string, bio: string, image: string }[]
  });

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[\d.]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      e.preventDefault();
    }
  };

  const sanitizeNumericValue = (val: string) => {
    let clean = val.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    return clean;
  };

  const startEditing = (section: string) => {
    setForm({
      title: course.title || "",
      subtitle: course.subtitle || "",
      description: course.description || "",
      price: course.price || 0,
      originalPrice: course.originalPrice || "",
      language: course.language || "English",
      level: course.level || "Beginner",
      category: course.category || "",
      duration: course.duration || "",
      teachingHours: course.teachingHours || "",
      timings: course.timings || "",
      scheduleNote: course.scheduleNote || "",
      hasCertificate: course.hasCertificate || false,
      hasLifetimeAccess: course.hasLifetimeAccess || false,
      startDate: course.startDate || "",
      endDate: course.endDate || "",
      thumbnailUrl: course.thumbnailUrl || "",
      finalAssessmentUnlockPct: course.finalAssessmentUnlockPct !== undefined && course.finalAssessmentUnlockPct !== null
        ? course.finalAssessmentUnlockPct
        : 100,
      certificateRules: {
        requireCourseComplete: course.certificateRules?.requireCourseComplete !== undefined
          ? Boolean(course.certificateRules.requireCourseComplete)
          : true,
        minProgressPct: course.certificateRules?.minProgressPct !== undefined && course.certificateRules?.minProgressPct !== null
          ? course.certificateRules.minProgressPct
          : 100,
        requireFinalAssessmentPass: course.certificateRules?.requireFinalAssessmentPass !== undefined
          ? Boolean(course.certificateRules.requireFinalAssessmentPass)
          : true,
        finalAssessmentId: course.certificateRules?.finalAssessmentId || (courseTests.length > 0 ? courseTests[0].id : ""),
        minAssessmentScorePct: course.certificateRules?.minAssessmentScorePct !== undefined && course.certificateRules?.minAssessmentScorePct !== null
          ? course.certificateRules.minAssessmentScorePct
          : (courseTests.length > 0 ? (courseTests[0].passingPercentage || 50) : 50),
      },
    });
    setArrays({
      requirements: course.requirements?.length ? course.requirements : [""],
      whatYouWillLearn: course.whatYouWillLearn?.length ? course.whatYouWillLearn : [""],
      features: course.features?.length ? course.features : [""],
      targetAudience: course.targetAudience?.length ? course.targetAudience : [""],
      inclusions: course.inclusions?.length ? course.inclusions : [""],
      faqs: course.faqs?.length ? course.faqs : [{ q: "", a: "" }],
      instructors: course.instructors?.length ? course.instructors : [{ name: "", bio: "", image: "" }]
    });
    setEditingSection(section);
  };

  const cancelEditing = () => setEditingSection(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...form,
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
        requirements: arrays.requirements.filter(r => r.trim() !== ""),
        whatYouWillLearn: arrays.whatYouWillLearn.filter(w => w.trim() !== ""),
        features: arrays.features.filter(f => f.trim() !== ""),
        targetAudience: arrays.targetAudience.filter(t => t.trim() !== ""),
        inclusions: arrays.inclusions.filter(i => i.trim() !== ""),
        hasCertificate: Boolean(form.hasCertificate),
        hasLifetimeAccess: Boolean(form.hasLifetimeAccess),
        finalAssessmentUnlockPct: form.finalAssessmentUnlockPct !== undefined ? Number(form.finalAssessmentUnlockPct) : 100,
        certificateRules: {
          requireCourseComplete: form.certificateRules?.requireCourseComplete !== undefined
            ? Boolean(form.certificateRules.requireCourseComplete)
            : true,
          minProgressPct: form.certificateRules?.minProgressPct !== undefined
            ? Number(form.certificateRules.minProgressPct)
            : 100,
          requireFinalAssessmentPass: form.certificateRules?.requireFinalAssessmentPass !== undefined
            ? Boolean(form.certificateRules.requireFinalAssessmentPass)
            : true,
          finalAssessmentId: form.certificateRules?.finalAssessmentId || null,
          minAssessmentScorePct: form.certificateRules?.minAssessmentScorePct !== undefined
            ? Number(form.certificateRules.minAssessmentScorePct)
            : 50,
        },
        faqs: arrays.faqs.filter(f => f.q.trim() !== "" && f.a.trim() !== ""),
        instructors: arrays.instructors.filter(i => i.name.trim() !== ""),
      };
      if (editingSection === 'rules' && form.certificateRules?.finalAssessmentId && form.certificateRules?.minAssessmentScorePct) {
        try {
          await apiClient.put(`/academy/assessments/${form.certificateRules.finalAssessmentId}`, {
            passingPercentage: Number(form.certificateRules.minAssessmentScorePct),
          });
          setCourseTests(prev => prev.map(t => t.id === form.certificateRules.finalAssessmentId ? { ...t, passingPercentage: Number(form.certificateRules.minAssessmentScorePct) } : t));
        } catch (tErr) {
          console.error("Could not update assessment passing percentage:", tErr);
        }
      }
      await courseApi.updateCourse(course.id, payload);
      setCourse({ ...course, ...payload });
      toast.success("Section updated successfully!");
      setEditingSection(null);
    } catch (error) {
      toast.error("Failed to update section");
    } finally {
      setIsSaving(false);
    }
  };

  const handleArrayChange = (field: keyof typeof arrays, index: number, value: string) => {
    setArrays(prev => {
      const arr = [...(prev[field] as any[])];
      if (field === 'faqs') {
        // Not used directly here, handled separately
      } else {
        arr[index] = value;
      }
      return { ...prev, [field]: arr };
    });
  };

  const addArrayItem = (field: keyof typeof arrays) => {
    setArrays(prev => {
      let newItem: any = "";
      if (field === 'faqs') newItem = { q: "", a: "" };
      if (field === 'instructors') newItem = { name: "", bio: "", image: "" };
      return { ...prev, [field]: [...(prev[field] as any[]), newItem] };
    });
  };

  const removeArrayItem = (field: keyof typeof arrays, index: number) => {
    setArrays(prev => ({ ...prev, [field]: (prev[field] as any[]).filter((_, i) => i !== index) }));
  };

  const handleFaqChange = (index: number, key: 'q' | 'a', value: string) => {
    setArrays(prev => {
      const newFaqs = [...prev.faqs];
      newFaqs[index][key] = value;
      return { ...prev, faqs: newFaqs };
    });
  };

  const handleInstructorChange = (index: number, key: 'name' | 'bio' | 'image', value: string) => {
    setArrays(prev => {
      const newInst = [...prev.instructors];
      newInst[index] = { ...newInst[index], [key]: value };
      return { ...prev, instructors: newInst };
    });
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setCropData({ src: reader.result as string, pixelCrop: null }));
      reader.readAsDataURL(e.target.files[0]);
    }
    // reset input value so selecting the same file works
    e.target.value = '';
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCropData(prev => ({ ...prev, pixelCrop: croppedAreaPixels }));
  };

  const handleCropSave = async () => {
    if (!cropData.src || !cropData.pixelCrop) return;
    try {
      setUploadingImage(true);
      const croppedImageFile = await getCroppedImg(cropData.src, cropData.pixelCrop);
      const url = await uploadToS3(croppedImageFile);
      setForm((prev: any) => ({ ...prev, thumbnailUrl: url }));
      setCropData({ src: null, pixelCrop: null });
      toast.success("Image cropped and uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  const onInstructorFileSelect = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => setInstructorCropData({ index, src: reader.result as string, pixelCrop: null }));
      reader.readAsDataURL(e.target.files[0]);
    }
    e.target.value = '';
  };

  const onInstructorCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setInstructorCropData(prev => ({ ...prev, pixelCrop: croppedAreaPixels }));
  };

  const handleInstructorCropSave = async () => {
    if (!instructorCropData.src || !instructorCropData.pixelCrop || instructorCropData.index === null) return;
    try {
      setUploadingImage(true);
      const croppedImageFile = await getCroppedImg(instructorCropData.src, instructorCropData.pixelCrop);
      const url = await uploadToS3(croppedImageFile);
      handleInstructorChange(instructorCropData.index, 'image', url);
      setInstructorCropData({ index: null, src: null, pixelCrop: null });
      toast.success("Instructor image uploaded!");
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm font-medium">Total Students</p>
              {mockStats.externalCount > 0 && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                  {mockStats.externalCount} Certs
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2">{mockStats.studentsCount}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500 font-medium">
            {mockStats.externalCount > 0 ? (
              <span>Course Students: {mockStats.platformCount ?? (mockStats.studentsCount - mockStats.externalCount)} • Certification Only: {mockStats.externalCount}</span>
            ) : (
              <span>All platform enrolled</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Avg Progress</p>
            <p className="text-3xl font-bold text-blue-600 mt-2">{mockStats.completionRate}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500 font-medium">
            Across all enrolled candidates
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-gray-500 text-sm font-medium">Pending Assignments</p>
            <p className="text-3xl font-bold text-orange-600 mt-2">{mockStats.assignmentsPending}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500 font-medium">
            Awaiting instructor review
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Platform Paid
              </span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{mockStats.revenue}</p>
          </div>
          <div className="mt-3 pt-2.5 border-t border-gray-100 text-xs text-gray-500 font-medium">
            From {mockStats.platformCount ?? mockStats.studentsCount} platform paid enrollment{(mockStats.platformCount ?? mockStats.studentsCount) === 1 ? '' : 's'}
          </div>
        </div>
      </div>

      {/* SECTION 1: BASIC INFO */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Basic Information</h2>
          {editingSection !== 'basic' ? (
            <button onClick={() => startEditing('basic')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {editingSection === 'basic' ? (
          <div className="space-y-4">
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Title</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Subtitle</label><input type="text" value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Description</label><textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" /></div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <h3 className="font-bold text-xl text-gray-900 break-words">{course?.title}</h3>
            <p className="text-gray-500 text-sm mt-1 break-words">{course?.subtitle || "No subtitle provided"}</p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 whitespace-pre-wrap break-words">{course?.description || "No description provided"}</div>
          </div>
        )}
      </div>

      {/* SECTION 2: MEDIA */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Course Media</h2>
          {editingSection !== 'media' ? (
            <button onClick={() => startEditing('media')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving || uploadingImage} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">Save</button>
            </div>
          )}
        </div>

        {editingSection === 'media' ? (
          <div className="space-y-4">
            {cropData.src ? (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-900 w-full max-w-2xl mx-auto flex flex-col relative h-[450px]">
                <div className="flex-1 relative">
                  <Cropper
                    image={cropData.src}
                    crop={crop}
                    zoom={zoom}
                    aspect={16 / 9}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="bg-white p-4 border-t border-gray-200 flex justify-end gap-3 z-10 shrink-0">
                  <button onClick={() => setCropData({ src: null, pixelCrop: null })} className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">Cancel</button>
                  <button onClick={handleCropSave} disabled={uploadingImage} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
                    {uploadingImage ? <Loader2 className="animate-spin" size={16} /> : null} Save Crop
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center relative hover:bg-gray-50 transition aspect-video w-full max-w-lg mx-auto overflow-hidden bg-gray-50/50">
                <input type="file" accept="image/*" onChange={onSelectFile} disabled={uploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {uploadingImage ? (
                  <Loader2 className="animate-spin text-blue-600" size={24} />
                ) : form.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.thumbnailUrl} alt="Preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud className="text-blue-600 mb-2" size={24} />
                    <p className="text-sm font-bold">Upload New Thumbnail</p>
                    <p className="text-xs text-gray-500 mt-1">16:9 ratio recommended</p>
                  </div>
                )}
              </div>
            )}
            <div className="max-w-lg mx-auto">
              <label className="block text-xs font-bold text-gray-700 mb-1">Image URL</label>
              <input type="text" value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            {course?.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={course.thumbnailUrl} alt="Thumbnail" className="aspect-video w-full max-w-lg object-cover rounded-xl border border-gray-100 shadow-sm" />
            ) : (
              <div className="aspect-video w-full max-w-lg bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 text-sm shadow-inner">
                No thumbnail uploaded
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: LOGISTICS */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Logistics & Details</h2>
          {editingSection !== 'logistics' ? (
            <button onClick={() => startEditing('logistics')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {editingSection === 'logistics' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
              <CreatableSelect
                isClearable
                isDisabled={loadingCategories}
                isLoading={loadingCategories}
                onChange={(newValue) => setForm((prev: any) => ({ ...prev, category: newValue?.value || "" }))}
                onCreateOption={handleCategoryCreate}
                options={categories}
                value={categories.find(c => c.value === form.category) || null}
                placeholder="Select or type..."
                className="text-sm"
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '2px',
                    borderRadius: '0.5rem',
                    borderColor: '#e5e7eb',
                    boxShadow: 'none',
                    '&:hover': { borderColor: '#3b82f6' }
                  })
                }}
              />
            </div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Level</label><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option></select></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Language</label><select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 bg-white"><option>English</option><option>Hindi</option><option>Hinglish</option></select></div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5">Full Price / MRP (₹)</label>
              <p className="text-[10px] text-gray-400 font-medium mb-1">Shown crossed-out ~~₹9999~~ as a sale strategy</p>
              <input
                type="text"
                inputMode="decimal"
                value={form.originalPrice ?? ""}
                onChange={(e) => setForm({ ...form, originalPrice: sanitizeNumericValue(e.target.value) })}
                onKeyDown={handleNumericKeyDown}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 text-gray-700 font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="e.g. 9999"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-0.5">Discounted Price (₹) *</label>
              <p className="text-[10px] text-emerald-600 font-semibold mb-1">Student pays this · Coupons apply here</p>
              <input
                type="text"
                inputMode="decimal"
                value={form.price ?? ""}
                onChange={(e) => setForm({ ...form, price: sanitizeNumericValue(e.target.value) })}
                onKeyDown={handleNumericKeyDown}
                className="w-full border-2 border-emerald-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-bold text-gray-900 bg-emerald-50/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="e.g. 7999"
              />
            </div>
            {/* Price Flow Diagram — always visible */}
            <div className="col-span-2 md:col-span-3 bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Price flow for students</p>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-gray-400 font-semibold uppercase mb-0.5">Full Price</span>
                  <span className="font-bold text-gray-300 line-through">₹{form.originalPrice || "9999"}</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-emerald-600 font-semibold uppercase mb-0.5">Student Pays</span>
                  <span className="font-extrabold text-[#C9A227]">₹{form.price || "7999"}</span>
                </div>
                <span className="text-gray-300">→</span>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] text-blue-600 font-semibold uppercase mb-0.5">After 20% Coupon</span>
                  <span className="font-extrabold text-blue-600">₹{Math.round(Number(form.price || 7999) * 0.8)}</span>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 border-t border-slate-200 pt-2">
                💡 Coupons apply on <strong>Discounted Price (₹{form.price || "7999"})</strong>, not the Full Price. Full Price is marketing only.
              </p>
            </div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Duration</label><input type="text" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Start Date</label><input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">End Date</label><input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Teaching Hours</label><input type="text" value={form.teachingHours} onChange={(e) => setForm({ ...form, teachingHours: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Live Timings</label><input type="text" value={form.timings} onChange={(e) => setForm({ ...form, timings: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 7:00 PM - 9:00 PM" /></div>
            <div><label className="block text-xs font-bold text-gray-700 mb-1">Schedule Note</label><input type="text" value={form.scheduleNote} onChange={(e) => setForm({ ...form, scheduleNote: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. Recordings included" /></div>
            <div className="flex flex-col gap-2 justify-center col-span-2 md:col-span-3 pt-2 border-t border-gray-100 mt-2">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" checked={form.hasCertificate} onChange={(e) => setForm({ ...form, hasCertificate: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span className="text-sm font-bold text-gray-700">Certificate Provided</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <input type="checkbox" checked={form.hasLifetimeAccess} onChange={(e) => setForm({ ...form, hasLifetimeAccess: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-gray-300" />
                <span className="text-sm font-bold text-gray-700">Lifetime Access</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div><p className="text-sm text-gray-500">Category</p><p className="font-semibold text-gray-900 mt-1">{course?.category || "N/A"}</p></div>
            <div><p className="text-sm text-gray-500">Level</p><p className="font-semibold text-gray-900 mt-1">{course?.level || "Beginner"}</p></div>
            <div><p className="text-sm text-gray-500">Language</p><p className="font-semibold text-gray-900 mt-1">{course?.language || "English"}</p></div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-semibold text-gray-900">₹{course?.price || 0}</span>
                {course?.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                  <>
                    <span className="text-xs text-gray-400 line-through">₹{course.originalPrice}</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {Math.round(((Number(course.originalPrice) - Number(course.price)) / Number(course.originalPrice)) * 100)}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>
            <div><p className="text-sm text-gray-500">Duration</p><p className="font-semibold text-gray-900 mt-1">{course?.duration || "N/A"}</p></div>
            <div><p className="text-sm text-gray-500">Start Date</p><p className="font-semibold text-gray-900 mt-1">{course?.startDate || "TBA"}</p></div>
            <div><p className="text-sm text-gray-500">End Date</p><p className="font-semibold text-gray-900 mt-1">{course?.endDate || "TBA"}</p></div>
            <div><p className="text-sm text-gray-500">Teaching Hours</p><p className="font-semibold text-gray-900 mt-1">{course?.teachingHours || "N/A"}</p></div>
            <div><p className="text-sm text-gray-500">Live Timings</p><p className="font-semibold text-gray-900 mt-1">{course?.timings || "N/A"}</p></div>
            <div><p className="text-sm text-gray-500">Schedule Note</p><p className="font-semibold text-gray-900 mt-1">{course?.scheduleNote || "N/A"}</p></div>
            <div><p className="text-sm text-gray-500">Certificate</p><p className="font-semibold text-gray-900 mt-1">{course?.hasCertificate ? "Yes" : "No"}</p></div>
            <div><p className="text-sm text-gray-500">Lifetime Access</p><p className="font-semibold text-gray-900 mt-1">{course?.hasLifetimeAccess ? "Yes" : "No"}</p></div>
          </div>
        )}
      </div>

      {/* SECTION: ASSESSMENT UNLOCK & CERTIFICATE ROLLOUT RULES */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Award size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Assessment Unlock & Certificate Rollout Rules</h2>
              <p className="text-xs text-gray-500">Configure prerequisites to unlock the final assessment and conditions required for automatic certificate generation.</p>
            </div>
          </div>
          {editingSection !== 'rules' ? (
            <button onClick={() => startEditing('rules')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {editingSection === 'rules' ? (
          <div className="space-y-6">
            {/* Rule 1: Final Assessment Unlock Percentage */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Final Assessment Unlock Threshold ({form.finalAssessmentUnlockPct ?? 100}%)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Students must complete this percentage of all prerequisite lessons, documents, assignments, and tests before the final assessment is unlocked. Default is 100%.
              </p>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={form.finalAssessmentUnlockPct ?? 100}
                  onChange={(e) => setForm({ ...form, finalAssessmentUnlockPct: Number(e.target.value) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
                <div className="flex items-center gap-1 min-w-[70px]">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.finalAssessmentUnlockPct ?? 100}
                    onChange={(e) => {
                      const val = Math.max(0, Math.min(100, Number(e.target.value) || 0));
                      setForm({ ...form, finalAssessmentUnlockPct: val });
                    }}
                    className="w-16 border border-gray-300 rounded-lg px-2 py-1 text-sm font-semibold text-center focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-sm font-bold text-gray-600">%</span>
                </div>
              </div>
            </div>

            {/* Rule 2: Certificate Rollout Criteria */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/80">
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Certificate Rollout Criteria
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select the requirements needed to automatically issue a verified certificate to the student. If unconfigured, both rules are required by default.
              </p>
              <div className="space-y-4">
                {/* 1. Course Complete */}
                <div className="p-3 bg-white rounded-lg border border-gray-200">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.certificateRules?.requireCourseComplete ?? true}
                      onChange={(e) => setForm({
                        ...form,
                        certificateRules: {
                          ...form.certificateRules,
                          requireCourseComplete: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">Require Course Progress / Completion</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Student must complete the required percentage of course curriculum.</span>
                    </div>
                  </label>

                  {form.certificateRules?.requireCourseComplete && (
                    <div className="ml-7 mt-3 flex items-center gap-3">
                      <label className="text-xs font-bold text-gray-600">Minimum Progress (%):</label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={form.certificateRules?.minProgressPct ?? 100}
                        onChange={(e) => setForm({
                          ...form,
                          certificateRules: {
                            ...form.certificateRules,
                            minProgressPct: Math.max(1, Math.min(100, Number(e.target.value) || 1))
                          }
                        })}
                        className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold text-center focus:outline-none focus:border-blue-500"
                      />
                      <span className="text-xs text-gray-400 font-medium">% required for certificate</span>
                    </div>
                  )}
                </div>

                {/* 2. Final Assessment Pass */}
                <div className="p-3 bg-white rounded-lg border border-gray-200 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.certificateRules?.requireFinalAssessmentPass ?? true}
                      onChange={(e) => setForm({
                        ...form,
                        certificateRules: {
                          ...form.certificateRules,
                          requireFinalAssessmentPass: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 mt-0.5"
                    />
                    <div>
                      <span className="text-sm font-bold text-gray-800 block">Require Final Assessment Passed</span>
                      <span className="text-xs text-gray-500 block mt-0.5">Student must achieve the passing percentage on the assigned course test.</span>
                    </div>
                  </label>

                  {form.certificateRules?.requireFinalAssessmentPass && (
                    <div className="ml-7 space-y-3 pt-2 border-t border-gray-100">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Select Final Assessment Test</label>
                        {courseTests.length === 0 ? (
                          <div className="p-2.5 bg-amber-50 text-amber-800 text-xs rounded-lg border border-amber-200">
                            No tests found for this course. Create one in the Tests & Final Assessment tab.
                          </div>
                        ) : (
                          <select
                            value={form.certificateRules?.finalAssessmentId || ""}
                            onChange={(e) => {
                              const aid = e.target.value;
                              const chosen = courseTests.find(t => t.id === aid);
                              setForm({
                                ...form,
                                certificateRules: {
                                  ...form.certificateRules,
                                  finalAssessmentId: aid,
                                  minAssessmentScorePct: chosen?.passingPercentage || form.certificateRules?.minAssessmentScorePct || 50,
                                }
                              });
                            }}
                            className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm bg-white font-medium text-gray-800 focus:outline-none focus:border-blue-500"
                          >
                            <option value="">-- Select Course Test --</option>
                            {courseTests.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title} ({t.questions?.length || 0} Qs • Pass: {t.passingPercentage || 50}%)
                              </option>
                            ))}
                          </select>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-600">Final Assessment Pass Score (%):</label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={form.certificateRules?.minAssessmentScorePct ?? 50}
                          onChange={(e) => setForm({
                            ...form,
                            certificateRules: {
                              ...form.certificateRules,
                              minAssessmentScorePct: Math.max(1, Math.min(100, Number(e.target.value) || 1))
                            }
                          })}
                          className="w-20 border border-gray-300 rounded-lg px-2 py-1 text-sm font-bold text-center focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-xs text-gray-400 font-medium">% required on final exam</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Final Assessment Unlock Rule</span>
              <p className="text-xl font-extrabold text-gray-900">
                {course?.finalAssessmentUnlockPct !== undefined && course?.finalAssessmentUnlockPct !== null ? course.finalAssessmentUnlockPct : 100}% Course Completion
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {(course?.finalAssessmentUnlockPct ?? 100) === 100
                  ? "Students must complete 100% of prior course content before taking the final assessment."
                  : (course?.finalAssessmentUnlockPct === 0)
                    ? "Final assessment is immediately unlocked upon enrollment."
                    : `Students can attempt the final exam once they reach ${course?.finalAssessmentUnlockPct}% progress.`
                }
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Certificate Rollout Requirements</span>
              <div className="flex flex-col gap-1.5 mt-2">
                {(() => {
                  const assignedTest = courseTests.find(t => t.id === course?.certificateRules?.finalAssessmentId);
                  const passScoreToDisplay = assignedTest?.passingPercentage || course?.certificateRules?.minAssessmentScorePct || 50;
                  const reqProgress = course?.certificateRules?.minProgressPct !== undefined && course?.certificateRules?.minProgressPct !== null ? course.certificateRules.minProgressPct : 100;

                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${course?.certificateRules?.requireCourseComplete !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-semibold text-gray-800">
                          Course {reqProgress}% Completed: <span className={course?.certificateRules?.requireCourseComplete !== false ? "text-emerald-600 font-bold" : "text-gray-400"}>{course?.certificateRules?.requireCourseComplete !== false ? "Required" : "Optional"}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${course?.certificateRules?.requireFinalAssessmentPass !== false ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className="text-sm font-semibold text-gray-800">
                          Final Assessment Passed {assignedTest ? `(${assignedTest.title} • ${passScoreToDisplay}% pass)` : `(${passScoreToDisplay}% pass)`}: <span className={course?.certificateRules?.requireFinalAssessmentPass !== false ? "text-emerald-600 font-bold" : "text-gray-400"}>{course?.certificateRules?.requireFinalAssessmentPass !== false ? "Required" : "Optional"}</span>
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: LEARNING & REQUIREMENTS */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Learning Objectives & Requirements</h2>
          {editingSection !== 'objectives' ? (
            <button onClick={() => startEditing('objectives')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {editingSection === 'objectives' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">What you will learn</label>
              <div className="space-y-2">
                {arrays.whatYouWillLearn.map((item, i) => (
                  <div key={i} className="flex gap-2"><input type="text" value={item} onChange={(e) => handleArrayChange('whatYouWillLearn', i, e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" /><button onClick={() => removeArrayItem('whatYouWillLearn', i)} className="text-red-400 hover:text-red-600"><X size={16} /></button></div>
                ))}
                <button onClick={() => addArrayItem('whatYouWillLearn')} className="text-xs text-blue-600 font-medium">+ Add Objective</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Requirements</label>
              <div className="space-y-2">
                {arrays.requirements.map((item, i) => (
                  <div key={i} className="flex gap-2"><input type="text" value={item} onChange={(e) => handleArrayChange('requirements', i, e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" /><button onClick={() => removeArrayItem('requirements', i)} className="text-red-400 hover:text-red-600"><X size={16} /></button></div>
                ))}
                <button onClick={() => addArrayItem('requirements')} className="text-xs text-blue-600 font-medium">+ Add Requirement</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Program Inclusions</label>
              <div className="space-y-2">
                {arrays.inclusions.map((item, i) => (
                  <div key={i} className="flex gap-2"><input type="text" value={item} onChange={(e) => handleArrayChange('inclusions', i, e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" placeholder="e.g. 40 hrs on-demand video" /><button onClick={() => removeArrayItem('inclusions', i)} className="text-red-400 hover:text-red-600"><X size={16} /></button></div>
                ))}
                <button onClick={() => addArrayItem('inclusions')} className="text-xs text-blue-600 font-medium">+ Add Inclusion</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 mb-2">What you will learn</p>
              {course?.whatYouWillLearn?.length ? <ul className="list-disc pl-5 space-y-1">{course.whatYouWillLearn.map((x: string, i: number) => <li key={i} className="text-sm break-words">{x}</li>)}</ul> : <p className="text-sm italic text-gray-400">None</p>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 mb-2">Requirements</p>
              {course?.requirements?.length ? <ul className="list-disc pl-5 space-y-1">{course.requirements.map((x: string, i: number) => <li key={i} className="text-sm break-words">{x}</li>)}</ul> : <p className="text-sm italic text-gray-400">None</p>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 mb-2">Program Inclusions</p>
              {course?.inclusions?.length ? <ul className="list-disc pl-5 space-y-1">{course.inclusions.map((x: string, i: number) => <li key={i} className="text-sm break-words">{x}</li>)}</ul> : <p className="text-sm italic text-gray-400">None</p>}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 5: AUDIENCE & FEATURES */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Audience & Features</h2>
          {editingSection !== 'features' ? (
            <button onClick={() => startEditing('features')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {editingSection === 'features' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Target Audience</label>
              <div className="space-y-2">
                {arrays.targetAudience.map((item, i) => (
                  <div key={i} className="flex gap-2"><input type="text" value={item} onChange={(e) => handleArrayChange('targetAudience', i, e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" /><button onClick={() => removeArrayItem('targetAudience', i)} className="text-red-400 hover:text-red-600"><X size={16} /></button></div>
                ))}
                <button onClick={() => addArrayItem('targetAudience')} className="text-xs text-blue-600 font-medium">+ Add Audience</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-2">Features</label>
              <div className="space-y-2">
                {arrays.features.map((item, i) => (
                  <div key={i} className="flex gap-2"><input type="text" value={item} onChange={(e) => handleArrayChange('features', i, e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500" /><button onClick={() => removeArrayItem('features', i)} className="text-red-400 hover:text-red-600"><X size={16} /></button></div>
                ))}
                <button onClick={() => addArrayItem('features')} className="text-xs text-blue-600 font-medium">+ Add Feature</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 mb-2">Target Audience</p>
              {course?.targetAudience?.length ? <ul className="list-disc pl-5 space-y-1">{course.targetAudience.map((x: string, i: number) => <li key={i} className="text-sm break-words">{x}</li>)}</ul> : <p className="text-sm italic text-gray-400">None</p>}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 mb-2">Features</p>
              {course?.features?.length ? <ul className="list-disc pl-5 space-y-1">{course.features.map((x: string, i: number) => <li key={i} className="text-sm break-words">{x}</li>)}</ul> : <p className="text-sm italic text-gray-400">None</p>}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: INSTRUCTOR & FAQS */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Instructor & FAQs</h2>
          {editingSection !== 'instructor' ? (
            <button onClick={() => startEditing('instructor')} className="text-sm flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition font-medium"><Edit2 size={14} /> Edit</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={cancelEditing} className="text-sm px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="text-sm px-4 py-1.5 font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">{isSaving ? "Saving..." : "Save"}</button>
            </div>
          )}
        </div>

        {editingSection === 'instructor' ? (
          <div className="space-y-6">

            {/* Instructors List (Dynamic Array) */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Course Instructors</label>
              <div className="space-y-6">
                {arrays.instructors.map((inst, i) => (
                  <div key={i} className="p-5 border border-gray-200 rounded-xl bg-gray-50/50 relative">
                    {arrays.instructors.length > 1 && (
                      <button onClick={() => removeArrayItem('instructors', i)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
                        <X size={16} />
                      </button>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Instructor Image Cropper / Preview */}
                      <div className="shrink-0">
                        {instructorCropData.src && instructorCropData.index === i ? (
                          <div className="w-32 h-32 border border-gray-300 rounded-lg overflow-hidden bg-gray-900 flex flex-col relative z-20">
                            <div className="flex-1 relative">
                              <Cropper
                                image={instructorCropData.src}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onInstructorCropComplete}
                                onZoomChange={setZoom}
                              />
                            </div>
                            <div className="bg-white p-1 flex justify-center gap-1 z-10 shrink-0">
                              <button onClick={() => setInstructorCropData({ index: null, src: null, pixelCrop: null })} className="px-2 py-1 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200">Cancel</button>
                              <button onClick={handleInstructorCropSave} disabled={uploadingImage} className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 flex items-center gap-1">
                                {uploadingImage ? <Loader2 className="animate-spin" size={12} /> : null} Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-white flex flex-col items-center justify-center relative hover:bg-gray-50 transition cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => onInstructorFileSelect(e, i)} disabled={uploadingImage} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            {uploadingImage && inst.image === '' ? (
                              <Loader2 className="animate-spin text-blue-600" size={24} />
                            ) : inst.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={inst.image} alt="Instructor" className="w-full h-full object-cover absolute inset-0" />
                            ) : (
                              <div className="flex flex-col items-center p-2 text-center">
                                <UploadCloud className="text-gray-400 mb-1" size={20} />
                                <p className="text-[10px] font-bold text-gray-500">Upload Image</p>
                                <p className="text-[9px] text-gray-400 mt-0.5">1:1 Ratio</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Instructor Details */}
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                          <input type="text" placeholder="e.g. John Doe" value={inst.name} onChange={(e) => handleInstructorChange(i, 'name', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">Bio</label>
                          <textarea rows={3} placeholder="Instructor background..." value={inst.bio} onChange={(e) => handleInstructorChange(i, 'bio', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addArrayItem('instructors')} className="text-sm text-blue-600 font-medium flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50">
                  + Add Another Instructor
                </button>
              </div>
            </div>

            {/* FAQs Section */}
            <div className="pt-6 border-t border-gray-100">
              <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wider">Course FAQs</label>
              <div className="space-y-3">
                {arrays.faqs.map((faq, i) => (
                  <div key={i} className="flex flex-col gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg relative">
                    <button onClick={() => removeArrayItem('faqs', i)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><X size={16} /></button>
                    <input type="text" placeholder="Question" value={faq.q} onChange={(e) => handleFaqChange(i, 'q', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 outline-none" />
                    <textarea rows={2} placeholder="Answer" value={faq.a} onChange={(e) => handleFaqChange(i, 'a', e.target.value)} className="px-3 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-500 outline-none resize-none" />
                  </div>
                ))}
                <button onClick={() => addArrayItem('faqs')} className="text-xs text-blue-600 font-medium">+ Add FAQ</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">Instructors</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {course?.instructors?.length > 0 ? course.instructors.map((inst: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 border border-gray-100 rounded-xl bg-white shadow-sm overflow-hidden">
                    <div className="w-16 h-16 shrink-0 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                      {inst.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={inst.image} alt={inst.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-400 text-xs">No img</span>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <p className="font-bold text-gray-900 break-words">{inst.name || "Unnamed Instructor"}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2 break-words">{inst.bio || "No bio provided"}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm italic text-gray-400">No instructors added</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 overflow-hidden">
              <p className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">FAQs</p>
              {course?.faqs?.length ? (
                <div className="space-y-3">
                  {course.faqs.map((faq: any, i: number) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100"><p className="font-bold text-sm text-gray-900 break-words">Q: {faq.q}</p><p className="text-sm mt-1.5 text-gray-600 break-words line-clamp-3">A: {faq.a}</p></div>
                  ))}
                </div>
              ) : <p className="text-sm italic text-gray-400">No FAQs</p>}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
