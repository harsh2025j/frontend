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
import { useDocTitle } from "@/hooks/useDocTitle";
import { ArrowLeft, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import CategorySelect from "@/components/ui/CategorySelect";



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

  const [tagInput, setTagInput] = React.useState("");
  const [expandedUpdates, setExpandedUpdates] = React.useState<string[]>([]);

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


  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
    // Reset tagInput when form is successfully submitted
    if (message) {
      setTagInput("");
    }
  }, [error, message]);

  useEffect(() => {
    if (user?.name && !formData.author) {
      setFormData(prev => ({ ...prev, author: user.name }));
    }
  }, [user, formData.author, setFormData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Manual validation
    const requiredFields = [
      { key: 'category', label: 'Category' },
      { key: 'title', label: 'Headline' },
      { key: 'location', label: 'Location' },
      { key: 'content', label: 'Main Content' }
    ];

    for (const field of requiredFields) {
      const value = formData[field.key as keyof typeof formData];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        toast.error(`${field.label} is required`);
        return;
      }
    }

    // Additional check for RichTextEditor
    const stripHtml = (html: string) => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      return doc.body.textContent || "";
    };

    if (stripHtml(formData.content).trim() === '') {
      toast.error("Main Content cannot be empty");
      return;
    }

    handleCreateArticle("pending");
  };

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
      <main className="flex-1 w-full p-3 sm:p-4 md:p-6 lg:p-8">
        <div className="flex">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors mb-4"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <span className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 px-2">Create New Content</span>
        </div>
        <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

            {/* Category + Advocate Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Category <span className="text-red-500">*</span></label>
                <CategorySelect
                  value={formData.category}
                  onChange={(id) => setFormData((prev) => ({ ...prev, category: id }))}
                  options={categoryOptions}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Advocate Name</label>
                <MultiSelectAdvocate
                  selectedAdvocates={formData.advocates}
                  onChange={(advocates: Advocate[]) => setFormData(prev => ({ ...prev, advocates }))}
                  placeholder="Search or type advocate name..."
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Headline <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="title"
                placeholder="Enter article headline..."
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Sub Headline */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Sub Headline</label>
              <input
                type="text"
                name="subHeadline"
                placeholder="Enter article sub headline..."
                value={formData.subHeadline}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>



            {/* Tags + Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Tags</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (tagInput.trim()) {
                            handleAddTag(tagInput);
                            setTagInput("");
                          }
                        }
                      }}
                      placeholder="Type tag and press Enter..."
                      className="flex-1 border rounded-lg px-3 py-2 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (tagInput.trim()) {
                          handleAddTag(tagInput);
                          setTagInput("");
                        }
                      }}
                      className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-gray-50">
                      {formData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-700 text-xs sm:text-sm px-3 py-1.5 rounded-full flex items-center gap-2 group hover:bg-blue-200 transition-colors"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-blue-600 hover:text-red-600 font-bold transition-colors"
                            aria-label={`Remove ${tag}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Location <span className="text-red-500">*</span></label>
                <input type="text"
                  name="location"
                  placeholder="Enter Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Language + Author + Paywalled */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="English/हिन्दी">English/हिन्दी</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>

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
              <div className="border rounded-lg p-4 sm:p-6 bg-gray-50 flex items-center justify-center h-40 sm:h-48 order-2 md:order-1">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain rounded" />
                ) : (
                  <span className="text-gray-400 text-sm">Preview Thumbnail</span>
                )}
              </div>

              <label className="border-2 border-dashed rounded-lg p-4 sm:p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-center flex-col h-40 sm:h-48 order-1 md:order-2">
                <input
                  type="file"
                  name="thumbnail"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-gray-500 text-sm text-center">Click to upload thumbnail</span>

                {formData.thumbnail && (
                  <p className="text-xs text-blue-500 mt-2 text-center truncate max-w-full px-2">{formData.thumbnail.name}</p>
                )}
              </label>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium mb-2">Main Content Editor <span className="text-red-500">*</span></label>
              <div className="border rounded-lg overflow-hidden">
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your content here..."
                />
              </div>
            </div>

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
              <button
                type="button"
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleCreateArticle("draft")}
                disabled={loading}
              >
                Save Draft
              </button>

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
