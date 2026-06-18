"use client";
import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useCreateArticleActions } from "@/data/features/article/useArticleActions";
import { Advocate } from "@/data/features/article/article.types";
import MultiSelectAdvocate from "@/components/ui/MultiSelectAdvocate";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { articleApi } from "@/data/services/article-service/article-service";
import { useDocTitle } from "@/hooks/useDocTitle";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp, X, Cloud, Loader2, CloudCheck, CloudOff } from "lucide-react";
import { useAutoSave } from "@/hooks/useAutoSave";
import CategorySelect from "@/components/ui/CategorySelect";
import FormField from "@/components/ui/FormField";
import { useState, useRef } from "react";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import TagInputWithSuggestions from "../components/TagInputWithSuggestions";



const CreateUpdatePage: React.FC = () => {
  useDocTitle("Create Article | Sajjad Husain Law Associates");
  const {
    formData,
    handleChange,
    handleContentChange,
    handleDocumentUpload,
    handleFileUpload,
    handleCreateArticle,
    handleAddTag,
    handleRemoveTag,
    handleRemoveDocument,
    loading,
    error,
    message,
    setFormData,
    handleAddTimelineUpdate,
    handleUpdateTimelineUpdate,
    handleRemoveTimelineUpdate,
  } = useCreateArticleActions();

  const [expandedUpdates, setExpandedUpdates] = React.useState<string[]>([]);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageToCrop(file);
    }
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile: File) => {
    setFormData((prev: any) => ({ ...prev, thumbnail: croppedFile }));
    setImageToCrop(null);
  };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [createdArticleId, setCreatedArticleId] = useState<string | null>(null);
  const createdArticleIdRef = useRef<string | null>(null);
  const createPromiseRef = useRef<Promise<any> | null>(null);

  const toggleUpdateExpansion = (id: string) => {
    setExpandedUpdates(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleAddNewTimelineUpdate = () => {
    const newId = handleAddTimelineUpdate();
    if (newId) setExpandedUpdates(prev => [...prev, newId as string]);
  };

  const router = useRouter();
  const { user } = useProfileActions();

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    handleChange(e);
    const { name } = e.target;
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleLocalContentChange = (content: string) => {
    handleContentChange(content);
    if (errors.content) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.content;
        return next;
      });
    }
  };

  const inputClasses = (name: string) => `w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base outline-none transition-all ${errors[name]
    ? "border-red-500 ring-2 ring-red-500/10 bg-red-50/5 placeholder:text-red-300"
    : "border-gray-200 focus:ring-2 focus:ring-[#C9A227] focus:border-[#C9A227]"
    }`;


  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, message]);

  useEffect(() => {
    if (user?.name && !formData.author) {
      setFormData(prev => ({ ...prev, author: user.name }));
    }
  }, [user, formData.author, setFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    const requiredFields = [
      { key: 'category', label: 'Category' },
      { key: 'title', label: 'Headline' },
      { key: 'location', label: 'Location' },
      { key: 'content', label: 'Main Content' }
    ];

    for (const field of requiredFields) {
      const value = formData[field.key as keyof typeof formData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        newErrors[field.key] = `${field.label} is required`;
      }
    }

    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    };

    if (!newErrors.content && stripHtml(formData.content).trim() === '') {
      newErrors.content = "Main Content cannot be empty";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
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

    try {
      await handleCreateArticle("pending");
      toast.success("Article requested for publishing successfully");
      router.push("/admin/content-management");
    } catch (error: any) {
      toast.error(error?.message || "Failed to create article");
    }
  };

  const handleSaveDraft = async () => {
    try {
      await handleCreateArticle("draft");
      toast.success("Draft saved successfully");
      router.push("/admin/content-management");
    } catch (error: any) {
      toast.error(error?.message || "Failed to save draft");
    }
  };

  // Don't auto-save if both title and content are completely empty
  const isFormEmpty = !formData.title?.trim() && !formData.content?.trim();

  const { status: autoSaveStatus } = useAutoSave(formData, async () => {
    if (!formData.title && !formData.content) return; // Skip saving completely empty forms

    if (createdArticleIdRef.current) {
      await articleApi.updateArticle(createdArticleIdRef.current, { ...formData, status: "draft" });
    } else if (createPromiseRef.current) {
      // It's already in the process of being created. Wait for it to finish, then update it.
      const result = await createPromiseRef.current;
      await articleApi.updateArticle(result.data.id, { ...formData, status: "draft" });
    } else {
      createPromiseRef.current = handleCreateArticle("draft");
      const result = await createPromiseRef.current;

      if (result && result.data && result.data.id) {
        createdArticleIdRef.current = result.data.id;
        setCreatedArticleId(result.data.id);

        // Reconstruct URL safely without appending duplicates
        const segments = window.location.pathname.split('/create-content');
        const basePath = segments[0] + '/create-content';

        if (!window.location.pathname.includes(result.data.id)) {
          window.history.replaceState(null, '', `${basePath}/${result.data.id}`);
        }
      }
    }
  }, 3000, {
    enabled: !isFormEmpty
  });

  const previewUrl = useMemo(() => {
    return formData.thumbnail ? URL.createObjectURL(formData.thumbnail) : null;
  }, [formData.thumbnail]);

  const flattenCategories = (cats: Category[], prefix = ""): { id: string; name: string }[] => {
    let options: { id: string; name: string }[] = [];
    cats.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        options = options.concat(flattenCategories(cat.children, prefix + cat.name + " > "));
      } else {
        options.push({ id: cat.id, name: prefix + cat.name });
      }
    });
    return options;
  };

  const categoryOptions = useMemo(() => {
    return flattenCategories(categories || []);
  }, [categories]);

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {imageToCrop && (
        <ImageCropperModal
          imageFile={imageToCrop}
          onClose={() => setImageToCrop(null)}
          onCrop={handleCropComplete}
        />
      )}
      <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8">
        {/* Floating WhatsApp-Style Auto-Save Indicator */}
        {autoSaveStatus !== 'idle' && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm border text-sm text-gray-700 font-medium transition-all duration-300">

              {autoSaveStatus === 'unsaved' && (
                <>
                  <div className="relative inline-flex items-center justify-center">
                    <Cloud size={16} className="text-gray-500" />
                    <span className="absolute top-[4px] text-[12px] font-bold text-gray-700">*</span>
                  </div>
                  <span>Unsaved changes</span>
                </>
              )}

              {autoSaveStatus === 'saving' && (
                <>
                  <div className="relative inline-flex items-center justify-center">
                    <Cloud size={16} className="text-blue-500" />
                    <Loader2 size={10} className="absolute animate-spin text-blue-700" />
                  </div>
                  <span>Saving...</span>
                </>
              )}

              {autoSaveStatus === 'saved' && (
                <>
                  <CloudCheck size={16} className="text-green-500" />
                  <span>Saved</span>
                </>
              )}

              {autoSaveStatus === 'error' && (
                <>
                  <CloudOff size={16} className="text-red-500" />
                  <span className="text-red-500">Failed</span>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-4 mb-4 sm:mb-6 px-2">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold">Create New Content</h1>
        </div>
        <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

            {/* Category + Advocate Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <FormField label="Category" error={errors.category} required>
                <input type="hidden" name="category" value={formData.category} />
                <CategorySelect
                  value={formData.category}
                  onChange={(id) => {
                    setFormData((prev) => ({ ...prev, category: id }));
                    if (errors.category) {
                      setErrors((prev: Record<string, string>) => {
                        const next = { ...prev };
                        delete next.category;
                        return next;
                      });
                    }
                  }}
                  options={categoryOptions}
                />
              </FormField>

              <FormField label="Advocate Name" error={errors.advocates}>
                <input type="hidden" name="advocates" value={JSON.stringify(formData.advocates)} />
                <MultiSelectAdvocate
                  selectedAdvocates={formData.advocates}
                  onChange={(advocates: Advocate[]) => {
                    setFormData(prev => ({ ...prev, advocates }));
                    if (errors.advocates) {
                      setErrors((prev: Record<string, string>) => {
                        const next = { ...prev };
                        delete next.advocates;
                        return next;
                      });
                    }
                  }}
                  placeholder="Search or type advocate name..."
                />
              </FormField>
            </div>

            {/* Headline */}
            <FormField label="Headline" error={errors.title} required>
              <input
                type="text"
                name="title"
                placeholder="Enter article headline..."
                value={formData.title}
                onChange={handleLocalChange}
                className={inputClasses('title')}
              />
            </FormField>

            {/* Sub Headline */}
            <FormField label="Sub Headline" error={errors.subHeadline}>
              <input
                type="text"
                name="subHeadline"
                placeholder="Enter article sub headline..."
                value={formData.subHeadline}
                onChange={handleLocalChange}
                className={inputClasses('subHeadline')}
              />
            </FormField>



            {/* Tags + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Tags</label>
                <TagInputWithSuggestions
                  selectedTags={formData.tags as string[]}
                  onChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                />
              </div>
              <FormField label="Location" error={errors.location} required>
                <input type="text"
                  name="location"
                  placeholder="Enter Location"
                  value={formData.location}
                  onChange={handleLocalChange}
                  className={inputClasses('location')}
                />
              </FormField>
            </div>

            {/* Language + Author + Paywalled */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <FormField label="Language" error={errors.language}>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleLocalChange}
                  className={inputClasses('language')}
                >
                  <option value="English/हिन्दी">English/हिन्दी</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </FormField>

              <div className="hidden">
                <label className="block text-sm font-medium mb-1.5">Authors</label>
                <input
                  type="text"
                  name="author"
                  placeholder="Enter author Name..."
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-4">Paywalled</label>
                <div className="flex items-center gap-3 mt-2 ml-4">
                  <span className={`text-sm font-medium transition-colors ${!formData.isPaywalled ? 'text-gray-900' : 'text-gray-500'}`}>
                    No
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.isPaywalled}
                    onClick={() => setFormData(prev => ({ ...prev, isPaywalled: !prev.isPaywalled }))}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
                                            transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                                            ${formData.isPaywalled ? 'bg-blue-600' : 'bg-gray-200'} `}
                  >
                    <span
                      aria-hidden="true"
                      className={`
                                                pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0
                                                transition duration-200 ease-in-out
                                                ${formData.isPaywalled ? 'translate-x-5' : 'translate-x-0'}
                                            `}
                    />
                  </button>
                  <span className={`text-sm font-medium transition-colors ${formData.isPaywalled ? 'text-gray-900' : 'text-gray-500'}`}>
                    Yes
                  </span>
                </div>
              </div>

            </div>

            {/* Thumbnail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="relative border rounded-lg bg-gray-50 flex items-center justify-center aspect-video order-2 md:order-1 overflow-hidden">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData((prev) => ({ ...prev, thumbnail: null }));
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow hover:bg-red-600 transition-colors"
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">Preview Thumbnail</span>
                )}
              </div>

              <label className="border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center flex-col aspect-video order-1 md:order-2">
                <input
                  type="file"
                  name="thumbnail"
                  className="hidden"
                  onChange={handleThumbnailSelect}
                  accept="image/*"
                />
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-500 text-sm text-center">Click to upload thumbnail (ratio 16:9)</span>

                {formData.thumbnail && (
                  <p className="text-xs text-blue-500 mt-2 text-center truncate max-w-full px-2">{formData.thumbnail.name}</p>
                )}
              </label>
            </div>

            {/* Content Editor */}
            <FormField label="Main Content" error={errors.content} required>
              <div className={`border rounded-lg transition-all ${errors.content ? "border-red-500 ring-2 ring-red-500/10" : "border-gray-200"
                }`}>
                <RichTextEditor
                  value={formData.content}
                  onChange={handleLocalContentChange}
                  placeholder="Write your content here..."
                />
              </div>
              <input type="text" name="content" className="sr-only" readOnly />
            </FormField>

            {/* Document Uploader */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Related Documents (Images, PDF, DOCX, etc.)</label>
              <label className="border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center flex-col h-32 sm:h-40">
                <input
                  type="file"
                  name="documents"
                  className="hidden"
                  onChange={handleDocumentUpload}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar"
                  multiple
                />
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2
                    M12 4v10
                    m0-10l-3 3
                    m3-3l3 3"
                  />
                </svg>

                <span className="text-gray-500 text-sm text-center">Click to upload images or documents</span>

                {(formData.documents || []).length > 0 && (
                  <p className="text-xs text-blue-500 mt-2 text-center">{(formData.documents || []).length} files selected</p>
                )}
              </label>

              {/* Selected Documents List */}
              {(formData.documents || []).length > 0 && (
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formData.documents || []).map((doc, index) => {
                    const isImage = doc.type.startsWith('image/');
                    return (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg gap-2">
                        <div className="flex items-center gap-2 overflow-hidden flex-1">
                          {isImage ? (
                            <div className="w-10 h-10 relative flex-shrink-0 bg-gray-200 rounded overflow-hidden">
                              <img
                                src={URL.createObjectURL(doc)}
                                alt={doc.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <svg className="w-8 h-8 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-medium text-gray-700 truncate">{doc.name}</span>
                            <span className="text-[10px] text-gray-500">{(doc.size / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveDocument(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors p-1 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Timeline Updates Section */}
            <div className="space-y-4">

              {(formData.updates || []).length > 0 && (
                <div className="space-y-6 mt-4">
                  {(formData.updates || []).map((update, index) => {
                    const isExpanded = expandedUpdates.includes(update._localId as string);
                    return (
                      <div key={update._localId || index} className="border border-gray-200 rounded-xl p-5 bg-white relative shadow-sm transition-all">
                        <div
                          className="flex justify-between items-center cursor-pointer"
                          onClick={() => toggleUpdateExpansion(update._localId as string)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-800">{update.title || `Timeline Update ${index + 1}`}</span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {typeof update.updateDate === 'string' ? update.updateDate : (update.updateDate as Date).toISOString().split('T')[0]}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveTimelineUpdate(update._localId as string);
                              }}
                              className="text-red-500 hover:text-red-700 p-1 flex items-center justify-center rounded transition-colors"
                              title="Remove update"
                            >
                              <Trash2 size={16} />
                            </button>
                            {isExpanded ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Update Date</label>
                                <input
                                  type="date"
                                  value={typeof update.updateDate === 'string' ? update.updateDate : (update.updateDate as Date).toISOString().split('T')[0]}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleUpdateTimelineUpdate(update._localId as string, 'updateDate', e.target.value)}
                                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wider">Title (Optional)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Trial Commences Today"
                                  value={update.title || ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleUpdateTimelineUpdate(update._localId as string, 'title', e.target.value)}
                                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>

                            <div onClick={(e) => e.stopPropagation()}>
                              <label className="block text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Update Content details</label>
                              <div className="border rounded-lg overflow-hidden shadow-inner">
                                <RichTextEditor
                                  value={update.content}
                                  onChange={(content) => handleUpdateTimelineUpdate(update._localId as string, 'content', content)}
                                  placeholder="Write the timeline update..."
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Developing Story Timeline</h3>
                  <p className="text-sm text-gray-500">Add chronological updates to this article (optional).</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddNewTimelineUpdate}
                  className="flex items-center gap-2 bg-[#0B2149] hover:bg-[#0a1a3a] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  <Plus size={16} /> Add Timeline Update
                </button>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 border-t">
              {/* <button
                type="button"
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSaveDraft}
                disabled={loading}
              >
                Save Draft
              </button> */}

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#0B2149] hover:bg-[#0a1a3a] text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Submitting..." : "Request To Publish"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateUpdatePage;
