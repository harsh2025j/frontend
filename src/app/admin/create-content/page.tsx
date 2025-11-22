"use client";
import React, { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useCreateArticleActions } from "@/data/features/article/useArticleActions";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";

const CreateUpdatePage: React.FC = () => {
  const {
    formData,
    handleChange,
    handleFileUpload,
    handleCreateArticle,
    loading,
    error,
    message,
  } = useCreateArticleActions();

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
    handleCreateArticle();
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
      <main className="flex-1 p-6">
        <h1 className="text-2xl font-semibold mb-6">Create New Content</h1>
        <div className="mx-auto bg-white rounded-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>

            {/* Category + Priority */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
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
                <label className="block text-sm font-medium mb-1">Advocate Name</label>
                {/* <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  required
                >
                  <option value="">Select Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select> */}
                <input type="text"
                  name="advocateName"
                  placeholder="Enter Advocate Name"
                  value={formData.advocateName}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  required
                />
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium mb-1">Headline</label>
              <input
                type="text"
                name="title"
                placeholder="Enter article headline..."
                value={formData.title}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                required
              />
            </div>

            {/* Sub Headline */}
            <div>
              <label className="block text-sm font-medium mb-1">Sub Headline</label>
              <input
                type="text"
                name="subHeadline"
                placeholder="Enter article sub headline..."
                value={formData.subHeadline}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                type="text"
                name="slug"
                placeholder="Enter slug of article"
                value={formData.slug}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                required
              />
            </div>

            {/* Tags + Language */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 pt-2">
                  {formData.tags.map((tag, i) => (
                    <span key={i} className="bg-gray-200 text-sm px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input type="text"
                  name="location"
                  placeholder="Enter Location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  required
                />

              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  required
                >
                  <option value="English/हिन्दी">English/हिन्दी</option>
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium mb-1">Authers</label>
                <input
                  type="text"
                  name="author"
                  placeholder="Enter auther Name..."
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                  required
                />
              </div>
            </div>
            {/* Thumbnail */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6 bg-gray-50 flex items-center justify-center h-48">
                {previewUrl ? (
                  <img src={previewUrl} className="max-h-full max-w-full object-contain" />
                ) : (
                  "Preview Thumbnail"
                )}
              </div>

              <label className="border rounded-lg p-6 cursor-pointer bg-gray-50 hover:bg-gray-100 flex items-center justify-center flex-col h-48">
                <input
                  type="file"
                  name="thumbnail"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*"
                />
                <span className="text-gray-500">Click to upload thumbnail</span>

                {formData.thumbnail && (
                  <p className="text-xs text-blue-500 mt-2">{formData.thumbnail.name}</p>
                )}

                {/* After cloudanary setup */}
                {/* {formData.thumbnailUrl && (
                  <p className="text-xs text-blue-500 mt-2">{formData.thumbnailUrl}</p>
                )} */}

              </label>
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium mb-2">Main Content Editor</label>
              <textarea
                name="content"
                placeholder="Write your content here..."
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50"
                required
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-8">
              <button type="button" className="bg-yellow-500 text-white px-6 py-2 rounded-md">
                Save Draft
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-[#0B2149] text-white px-6 py-2 rounded-md disabled:opacity-50"
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
