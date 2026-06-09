"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2, Info, Monitor, Upload } from "lucide-react";
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
    adType: "IMAGE" as const, // Always custom image — Google AdSense not used
    priority: 0,
    isActive: initialData?.isActive ?? true,
  });

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(initialData?.imageUrl || "");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageToCrop(file);
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

  const previewHeight =
    formData.slotId === "HOME_FEED_1" ? "150px" :
      selectedSlot?.type === "BANNER" || formData.slotId.includes("BANNER") || formData.slotId.includes("FOOTER") ? "90px" :
        "250px";

  const cropAspect =
    formData.slotId === "HOME_FEED_1" ? 728 / 150 :
      selectedSlot?.type === "BANNER" || formData.slotId.includes("BANNER") || formData.slotId.includes("FOOTER") ? 728 / 90 :
        selectedSlot?.type === "SIDEBAR" || formData.slotId.includes("SIDEBAR") ? 300 / 250 :
          1;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {isEdit ? `Edit: ${selectedSlot?.name}` : "Configure Ad Template"}
          </h1>
          <p className="text-sm text-gray-500">Add content to this advertisement slot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Display Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g. Premium Legal Service"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Target Slot *</label>
                <select
                  required
                  disabled={isEdit || !!initialData?.slotId}
                  value={formData.slotId}
                  onChange={(e) => setFormData({ ...formData, slotId: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50"
                >
                  {AD_SLOTS.map(slot => (
                    <option key={slot.id} value={slot.id}>
                      {slot.name} ({slot.dimensions})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Redirect URL *</label>
              <input
                type="url"
                required
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Admin Notes</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none"
                rows={3}
                placeholder="e.g. Campaign ends May 30th"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Ad Image *</label>
              <label className="relative flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl p-8 hover:border-blue-300 hover:bg-blue-50/20 transition-colors cursor-pointer">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Preview" className="h-14 object-contain rounded" />
                    <span className="text-xs text-blue-600 font-medium">Click to replace image</span>
                  </>
                ) : (
                  <>
                    <Upload size={22} className="text-gray-400" />
                    <span className="text-sm text-gray-500">Click to upload ad banner</span>
                    <span className="text-xs text-gray-400">{selectedSlot?.dimensions} recommended</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </label>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Publish immediately</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
            >
              {loading ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
              {isEdit ? "Save Changes" : "Publish to Slot"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <Monitor size={16} className="text-blue-600" />
            Preview
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6 space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
              <Info size={13} className="text-gray-400 shrink-0" />
              <span>{selectedSlot?.name} · {selectedSlot?.dimensions}</span>
            </div>
            <div className="flex justify-center bg-gray-50 rounded-lg p-3 border border-gray-100 overflow-hidden">
              <div className="w-full">
                <BaseAd
                  slotId={formData.slotId}
                  width="100%"
                  height={previewHeight}
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
          aspect={cropAspect}
        />
      )}
    </div>
  );
}
