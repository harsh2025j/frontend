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

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
      <Loader2 className="animate-spin text-blue-600" size={40} />
      <p className="text-gray-500 font-medium">Loading advertisement...</p>
    </div>
  );

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
