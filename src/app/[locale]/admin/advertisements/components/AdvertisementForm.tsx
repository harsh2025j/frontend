"use client";

import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Image as ImageIcon, Loader2, Info, Monitor } from "lucide-react";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import { BaseAd } from "@/components/ads/StandardAds";
import { AD_SLOTS } from "@/data/features/advertisement/advertisement.types";

interface AdvertisementFormProps {
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function AdvertisementForm({ initialData, isEdit = false, onSuccess }: AdvertisementFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    link: initialData?.link || "",
    slotId: initialData?.slotId || "HOME_BANNER_TOP_1",
    adType: initialData?.adType || "IMAGE",
    priority: 0, // Simplified: always 0
    isActive: initialData?.isActive ?? true,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageToCrop(file);
    }
  };

  const handleCropComplete = (croppedFile: File) => {
    setThumbnail(croppedFile);
    setPreviewUrl(URL.createObjectURL(croppedFile));
    setImageToCrop(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = { ...formData, thumbnail: thumbnail || undefined };
      
      if (isEdit && initialData?._id) {
        await advertisementApi.updateAdvertisement(initialData._id, data);
        if (onSuccess) onSuccess();
        else router.push(`/admin/advertisements/show/${initialData._id}`);
      } else {
        const response = await advertisementApi.createAdvertisement(data);
        const newAd = response.data.data;
        toast.success("Advertisement published to slot");
        if (onSuccess) onSuccess();
        else router.push(`/admin/advertisements/show/${newAd._id}`);
      }
    } catch (error) {
      toast.error(isEdit ? "Failed to update template" : "Failed to publish advertisement");
    } finally {
      setLoading(false);
    }
  };

  const selectedSlot = AD_SLOTS.find(s => s.id === formData.slotId);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? `Edit ${selectedSlot?.name}` : "Configure Ad Template"}
          </h1>
          <p className="text-gray-500">Add content to this advertisement slot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Section */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Display Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Premium Legal Service"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Target Template (Slot) *</label>
                <select
                  required
                  disabled={isEdit || !!initialData?.slotId}
                  value={formData.slotId}
                  onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-70"
                >
                  {AD_SLOTS.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.name} ({slot.dimensions})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Redirect Link (URL) *</label>
              <input
                type="url"
                required
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Admin Notes / Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                rows={3}
                placeholder="e.g. Campaign ends on May 30th"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Publish immediately
              </label>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 block">Ad Image *</label>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors cursor-pointer relative group">
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600 font-medium text-sm">Click to upload ad banner</p>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isEdit ? "Update Template" : "Publish to Slot"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Live Preview Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-900 font-bold">
            <Monitor size={20} className="text-blue-600" />
            <h2>Template Preview</h2>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sticky top-6">
            <div className="mb-4 flex items-start gap-3 bg-blue-50 p-3 rounded-lg border border-blue-100">
              <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-800 leading-relaxed">
                Slot: <strong>{selectedSlot?.name}</strong><br/>
                Expected Size: <strong>{selectedSlot?.dimensions}</strong>
              </p>
            </div>
            
            <div className="flex justify-center bg-white p-4 rounded-lg border border-gray-100 shadow-sm overflow-hidden">
              <div className="w-full">
                <BaseAd 
                  width="100%"
                  height={
                    formData.slotId === "HOME_FEED_1" ? "150px" :
                    selectedSlot?.type === "BANNER" || formData.slotId.includes("BANNER") || formData.slotId.includes("FOOTER") ? "90px" : 
                    "250px"
                  }
                  label={formData.title || "Template Slot"}
                  imageUrl={previewUrl}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {imageToCrop && (
        <ImageCropperModal
          imageFile={imageToCrop}
          onClose={() => setImageToCrop(null)}
          onCrop={handleCropComplete}
          aspect={
            formData.slotId === "HOME_FEED_1" ? 728 / 150 :
            selectedSlot?.type === "BANNER" || formData.slotId.includes("BANNER") || formData.slotId.includes("FOOTER") ? 728 / 90 : 
            selectedSlot?.type === "SIDEBAR" || formData.slotId.includes("SIDEBAR") ? 300 / 250 : 
            1
          }
        />
      )}
    </div>
  );
}
