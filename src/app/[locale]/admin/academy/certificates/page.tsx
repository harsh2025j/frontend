"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, LayoutGrid } from "lucide-react";
import IssuedTab from "./IssuedTab";
import TemplatesTab from "./TemplatesTab";

type Tab = "issued" | "templates";

function CertificatesContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>("issued");

  // Restore tab on mount from URL query or localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabQuery = urlParams.get("tab") as Tab | null;
      const storedTab = localStorage.getItem("admin_certificates_active_tab") as Tab | null;
      const targetTab = (tabQuery === "templates" || tabQuery === "issued")
        ? tabQuery
        : (storedTab === "templates" || storedTab === "issued")
          ? storedTab
          : "issued";

      setTab(targetTab);
      if (!tabQuery || tabQuery !== targetTab) {
        urlParams.set("tab", targetTab);
        window.history.replaceState(null, "", `?${urlParams.toString()}`);
      }
    }
  }, []);

  // Sync if URL search params change externally
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === "templates" || tabFromUrl === "issued") && tabFromUrl !== tab) {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_certificates_active_tab", newTab);
      const currentParams = new URLSearchParams(window.location.search);
      currentParams.set("tab", newTab);
      window.history.replaceState(null, "", `?${currentParams.toString()}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500 text-sm mt-1">
            View issued certificates, configure per-course templates, and manage generation rules.
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 flex gap-2">
        <TabButton active={tab === "issued"} onClick={() => handleTabChange("issued")} icon={<FileText size={16} />}>
          Issued Certificates
        </TabButton>
        <TabButton active={tab === "templates"} onClick={() => handleTabChange("templates")} icon={<LayoutGrid size={16} />}>
          Templates
        </TabButton>
      </div>

      {tab === "issued" ? <IssuedTab /> : <TemplatesTab />}
    </div>
  );
}

export default function AcademyCertificatesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading certificates...</div>}>
      <CertificatesContent />
    </Suspense>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition cursor-pointer ${
        active
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-gray-500 hover:text-gray-800"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
