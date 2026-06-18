"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AdvertisementForm from "../../components/AdvertisementForm";
import { advertisementApi } from "@/data/services/advertisement-service/advertisement-service";
import { Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function EditAdvertisementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      advertisementApi.fetchAdvertisementById(id)
      .then((res) => {
        setAd(res.data.data);
      })
      .catch(err => {
        console.error("Failed to load ad data", err);
        toast.error("Failed to load advertisement");
      })
      .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <EditAdvertisementSkeleton />;

  if (!ad) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
      <p>Advertisement not found.</p>
      <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go Back</button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <AdvertisementForm 
        initialData={ad} 
        isEdit={true} 
        onSuccess={() => {
          toast.success("Advertisement updated successfully");
          router.push(`/admin/advertisements/show/${id}`);
        }}
      />
    </div>
  );
}

function EditAdvertisementSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 pb-20 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="h-4 w-64 bg-gray-100 rounded"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-10 w-full bg-gray-100 rounded-lg"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-24 w-full bg-gray-100 rounded-lg"></div>
            </div>
            <div className="space-y-1.5">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-32 w-full border-2 border-dashed border-gray-200 rounded-xl"></div>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-100 rounded"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-10 w-24 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-5 w-24 bg-gray-200 rounded"></div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6 space-y-3">
            <div className="h-8 w-full bg-gray-50 rounded-lg"></div>
            <div className="h-48 w-full bg-gray-50 rounded-lg border border-gray-100"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
