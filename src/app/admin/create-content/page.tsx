"use client";
import React, { useState } from "react";

const CreateUpdatePage: React.FC = () => {
  const [formData, setFormData] = useState({
    category: "",
    headline: "",
    subHeadline: "",
    tags: ["Legal", "Constitution"],
    priority: "",
    language: "English/हिन्दी",
    owner: "",
    thumbnail: null as File | null,
    content: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, thumbnail: e.target.files[0] });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
     

      <main className="flex-1 p-6">
          <h1 className="text-2xl font-semibold mb-6">Create New Update</h1>
        <div className=" mx-auto bg-white rounded-2xl  p-8">

          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B2149]/40 bg-gray-50"
                >
                  <option value="">Latest News & Judgments</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#0B2149]/40 bg-gray-50"
                >
                  <option value="">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-sm font-medium mb-1">Headline</label>
              <input
                type="text"
                name="headline"
                placeholder="Enter article headline..."
                value={formData.headline}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Sub Headline</label>
              <input
                type="text"
                name="subHeadline"
                placeholder="Enter article sub headline..."
                value={formData.subHeadline}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none bg-gray-50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Tag</label>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-200 text-sm px-3 py-1 rounded-full text-gray-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Language</label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none bg-gray-50"
                >
                  <option value="English/हिन्दी">English/हिन्दी</option>
                </select>
              </div>
            </div>

            {/* Owner */}
            <div>
              <label className="block text-sm font-medium mb-1">Owner</label>
              <input
                type="text"
                name="owner"
                placeholder="Enter Your Name..."
                value={formData.owner}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none bg-gray-50"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="border rounded-lg p-6 text-center text-gray-400 bg-gray-50">
                Preview Thumbnail
              </div>
              <label className="border rounded-lg p-6 text-center cursor-pointer bg-gray-50 hover:bg-gray-100">
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <span className="text-gray-500">
                  ⬆️ Drag & drop image or click to upload
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Main Content Editor</label>
              <textarea
                name="content"
                placeholder="Write your content here..."
                value={formData.content}
                onChange={handleChange}
                rows={8}
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              />
              <div className="flex justify-end space-x-3 mt-2">
                <button
                  type="button"
                  className="px-4 py-1 border rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Upload
                </button>
                <button
                  type="button"
                  className="px-4 py-1 border rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200"
                >
                  Download
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <button
                type="button"
                className="bg-yellow-500 text-white px-6 py-2 rounded-md font-medium hover:bg-yellow-600"
              >
                Saved Draft
              </button>
              <button
                type="submit"
                className="bg-[#0B2149] text-white px-6 py-2 rounded-md font-medium hover:bg-[#122d66]"
              >
                Request To Publish
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateUpdatePage;
