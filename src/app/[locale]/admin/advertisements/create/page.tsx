"use client";

import { useSearchParams } from "next/navigation";
import AdvertisementForm from "../components/AdvertisementForm";

export default function CreateAdvertisementPage() {
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slotId");

  return <AdvertisementForm initialData={slotId ? { slotId } : undefined} />;
}
