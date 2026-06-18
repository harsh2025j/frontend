"use client";

import { useSearchParams } from "next/navigation";
import AdvertisementForm from "../components/AdvertisementForm";
import React from "react";

function CreateAdvertisementPageContent() {
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slotId");

  return <AdvertisementForm initialData={slotId ? { slotId } : undefined} />;
}

export default function CreateAdvertisementPage() {
  return (
    <React.Suspense fallback={<div className="p-6">Loading form...</div>}>
      <CreateAdvertisementPageContent />
    </React.Suspense>
  );
}
