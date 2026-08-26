"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UploadCloud, Loader2, Save, Image as ImageIcon } from "lucide-react";
import { courseApi } from "@/data/services/academy-service/course.service";
import toast from "react-hot-toast";
import { uploadToS3 } from "@/lib/uploadToS3";
import CreatableSelect from 'react-select/creatable';

export default function CreateCoursePage() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    price: "",
    thumbnailUrl: "",
  });

  const [categories, setCategories] = useState<{label: string, value: string}[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

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

  const handleCategoryCreate = async (inputValue: string) => {
    try {
      setLoadingCategories(true);
      const res = await courseApi.createCategory({ name: inputValue });
      const newOption = { label: res.data.name, value: res.data.name };
      setCategories(prev => [...prev, newOption]);
      setFormData(prev => ({ ...prev, category: res.data.name }));
    } catch (err) {
      console.error("Failed to create category", err);
      toast.error("Failed to create category");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    try {
      setUploadingImage(true);
      const url = await uploadToS3(file);
      setFormData(prev => ({ ...prev, thumbnailUrl: url }));
      toast.success("Image uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      setLoading(true);

      const payload = {
        title: formData.title,
        description: "Course description goes here...", // Default placeholder, editable later
        category: formData.category || undefined,
        price: Number(formData.price) || 0,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        instructorId: "admin-instructor-id", // TODO: Get from auth context
        status: "draft"
      };

      const response = await courseApi.createCourse(payload);
      
      toast.success("Course initialized successfully!");
      // Redirect to edit page
      router.push(`/admin/academy/courses/${response.data.id}`);
    } catch (error: any) {
      console.error("Failed to create course", error);
      toast.error(error?.response?.data?.message || "Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.title.trim().length > 0;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-12 mt-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/academy/courses" className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Create New Course</h1>
            <p className="text-gray-500 mt-1">Start by adding the basic details. You can build the rest later.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title <span className="text-red-500">*</span></label>
          <input 
            type="text" name="title" value={formData.title} onChange={handleInputChange}
            placeholder="e.g. Masterclass in Legal Research" 
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <CreatableSelect
              isClearable
              isDisabled={loadingCategories}
              isLoading={loadingCategories}
              onChange={(newValue) => setFormData(prev => ({ ...prev, category: newValue?.value || "" }))}
              onCreateOption={handleCategoryCreate}
              options={categories}
              value={categories.find(c => c.value === formData.category) || null}
              placeholder="Select or type to create..."
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  padding: '4px',
                  borderRadius: '0.75rem',
                  borderColor: '#e5e7eb',
                  boxShadow: 'none',
                  '&:hover': {
                    borderColor: '#3b82f6'
                  }
                })
              }}
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
              <input 
                type="number" name="price" value={formData.price} onChange={handleInputChange}
                placeholder="2999" 
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium" 
              />
            </div>
          </div>
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Course Thumbnail</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition relative aspect-video w-full max-w-lg mx-auto overflow-hidden bg-gray-50/50">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploadingImage}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" 
            />
            
            {uploadingImage ? (
              <div className="flex flex-col items-center py-4">
                <Loader2 size={24} className="animate-spin text-blue-600 mb-2" />
                <p className="text-sm font-medium text-gray-600">Uploading to secure storage...</p>
              </div>
            ) : formData.thumbnailUrl ? (
              <div className="w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={formData.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover rounded-lg absolute inset-0" />
              </div>
            ) : (
              <div className="flex flex-col items-center py-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-3">
                  <ImageIcon size={24} />
                </div>
                <p className="text-sm font-bold text-gray-900">Upload Image</p>
                <p className="text-xs text-gray-500 mt-1">16:9 ratio recommended</p>
              </div>
            )}
          </div>
          {formData.thumbnailUrl && (
            <div className="mt-3 max-w-lg mx-auto">
              <label className="block text-xs font-semibold text-gray-500 mb-1">Or paste image URL directly:</label>
              <input 
                type="text" name="thumbnailUrl" value={formData.thumbnailUrl} onChange={handleInputChange}
                placeholder="https://..." 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition" 
              />
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
          <Link href="/admin/academy/courses">
            <button className="px-5 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
              Cancel
            </button>
          </Link>
          <button 
            onClick={handleCreateCourse}
            disabled={!isFormValid || loading || uploadingImage}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save & Continue to Builder
          </button>
        </div>

      </div>
    </div>
  );
}
