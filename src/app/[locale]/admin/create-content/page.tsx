"use client";
import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useCreateArticleActions } from "@/data/features/article/useArticleActions";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";

const CreateUpdatePage: React.FC = () => {
  const {
    formData,
    handleChange,
    handleContentChange,
    handleFileUpload,
    handleCreateArticle,
    handleAddTag,
    handleRemoveTag,
    loading,
    error,
    message,
  } = useCreateArticleActions();

  const [tagInput, setTagInput] = React.useState("");

  const router = useRouter();
  const { user: reduxUser } = useProfileActions();
  const user = reduxUser as UserData;
  useEffect(() => {
    // if (loading) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 1. No Token? -> Go to Login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // 2. Role Check
    if (user?.roles?.length) {
      const hasAccess = user.roles.some((r) => r.name !== "user");
      if (!hasAccess) {
        router.replace("/auth/login");
      }
    }
  }, [user, router]);


  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((state) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (error) toast.error(error);
  }, [error, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCreateArticle("publish");
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
        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 px-2">Create New Content</h1>
        <div className="max-w-6xl mx-auto bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm">
          <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>

            {/* Category + Advocate Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.name} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Advocate Name</label>
                <input type="text"
                  name="advocateName"
                  placeholder="Enter Advocate Name"
                  value={formData.advocateName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2.5 bg-gray-50 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium mb-1.5">Headline</label>
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
                <label className="block text-sm font-medium mb-1.5">Location</label>
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

            {/* Language + Author */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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

              <div>
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
              <label className="block text-sm font-medium mb-2">Main Content Editor</label>
              <div className="border rounded-lg overflow-hidden">
                <RichTextEditor
                  value={formData.content}
                  onChange={handleContentChange}
                  placeholder="Write your content here..."
                />
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
