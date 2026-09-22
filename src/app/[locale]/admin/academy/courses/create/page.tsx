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
    originalPrice: "",
    thumbnailUrl: "",
  });

  const [categories, setCategories] = useState<{ label: string, value: string }[]>([]);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePriceChange = (field: 'price' | 'originalPrice', rawValue: string) => {
    // Only allow numbers and at most one decimal point
    let clean = rawValue.replace(/[^0-9.]/g, '');
    const parts = clean.split('.');
    if (parts.length > 2) {
      clean = parts[0] + '.' + parts.slice(1).join('');
    }
    setFormData(prev => ({ ...prev, [field]: clean }));
  };

  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !/[\d.]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'].includes(e.key) &&
      !e.ctrlKey && !e.metaKey
    ) {
      e.preventDefault();
    }
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
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        thumbnailUrl: formData.thumbnailUrl || undefined,
        instructorId: "admin-instructor-id", // TODO: Get from auth context
        status: "draft"
      };

      const response = await courseApi.createCourse(payload);

      toast.success("Course initialized successfully!");
      // Redirect to edit page
      router.push(`/admin/academy/courses/${response.data.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  const calculateDiscount = () => {
    const p = Number(formData.price);
    const op = Number(formData.originalPrice);
    if (op && p && op > p) {
      const diff = op - p;
      const pct = Math.round((diff / op) * 100);
      return { diff, pct };
    }
    return null;
  };

  const discountPreview = calculateDiscount();

  const isFormValid = formData.title.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-500 text-sm mt-0.5">Initialize a course shell. You can add syllabus and lessons next.</p>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 md:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Course Title *</label>
            <input
              type="text" name="title" value={formData.title} onChange={handleInputChange}
              placeholder="e.g. Masterclass on Corporate Law & Compliances"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition font-medium"
            />
          </div>

          {/* Category */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              name="category" value={formData.category} onChange={handleInputChange}
              disabled={loadingCategories}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Field 1: Full Price / MRP — crossed-out display price */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Full Price / MRP (₹)</label>
                <p className="text-[11px] text-gray-400 font-medium mt-0.5">Shown crossed-out ~~₹9999~~ as a sale strategy</p>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">₹</span>
              <input
                type="text"
                inputMode="decimal"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={(e) => handlePriceChange('originalPrice', e.target.value)}
                onKeyDown={handleNumericKeyDown}
                placeholder="9999"
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 focus:border-gray-400 transition font-medium text-gray-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Field 2: Discounted Price — what student actually pays, coupon base */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Discounted Price (₹) *</label>
                <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Student pays this · Coupons apply here</p>
              </div>
              {discountPreview && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  {discountPreview.pct}% cheaper than Full Price
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700 font-bold">₹</span>
              <input
                type="text"
                inputMode="decimal"
                name="price"
                value={formData.price}
                onChange={(e) => handlePriceChange('price', e.target.value)}
                onKeyDown={handleNumericKeyDown}
                placeholder="7999"
                className="w-full pl-9 pr-4 py-3 border-2 border-emerald-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-bold text-gray-900 bg-emerald-50/30 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Price Flow Diagram */}
          <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">How the price flow works for students</p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Step 1: Full Price crossed out */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-gray-400 font-semibold uppercase mb-1">Full Price</span>
                <span className="text-lg font-bold text-gray-300 line-through">
                  ₹{formData.originalPrice || "9999"}
                </span>
              </div>
              <span className="text-gray-300 text-xl">→</span>
              {/* Step 2: Discounted Price */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-emerald-600 font-semibold uppercase mb-1">Student Pays</span>
                <span className="text-xl font-extrabold text-[#C9A227]">
                  ₹{formData.price || "7999"}
                </span>
              </div>
              <span className="text-gray-300 text-xl">→</span>
              {/* Step 3: After coupon example */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] text-blue-600 font-semibold uppercase mb-1">After 20% Coupon</span>
                <span className="text-xl font-extrabold text-blue-600">
                  ₹{Math.round(Number(formData.price || 7999) * 0.8)}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-3 border-t border-slate-200 pt-2">
              💡 <strong>Coupons always apply on the Discounted Price (₹{formData.price || "7999"})</strong>, not the Full Price (₹{formData.originalPrice || "9999"}). The Full Price is only shown crossed-out as a marketing strategy.
            </p>
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
