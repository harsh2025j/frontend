"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Award, LayoutTemplate } from "lucide-react";
import IssuedTab from "./IssuedTab";
import TemplatesTab from "./TemplatesTab";

type Tab = "issued" | "templates";

function CertificatesContent() {
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab") as Tab | null;

  const [tab, setTab] = useState<Tab>("issued");

  /* Restore tab from URL or localStorage */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const tabQuery = urlParams.get("tab") as Tab | null;
      const storedTab = localStorage.getItem("admin_certificates_active_tab") as Tab | null;
      const targetTab =
        tabQuery === "templates" || tabQuery === "issued"
          ? tabQuery
          : storedTab === "templates" || storedTab === "issued"
          ? storedTab
          : "issued";
      setTab(targetTab);
      if (!tabQuery || tabQuery !== targetTab) {
        urlParams.set("tab", targetTab);
        window.history.replaceState(null, "", `?${urlParams.toString()}`);
      }
    }
  }, []);

  /* Keep tab state in sync with URL */
  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === "templates" || tabFromUrl === "issued") && tabFromUrl !== tab) {
      setTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_certificates_active_tab", newTab);
      const p = new URLSearchParams(window.location.search);
      p.set("tab", newTab);
      window.history.replaceState(null, "", `?${p.toString()}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* ══════════════════════════════════════════
          SLEEK EXECUTIVE HEADER
         ══════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
        {/* Left: Clean title, subtitle & segmented tabs */}
        <div className="space-y-4">
          <div>
            <h1 className="text-[28px] font-bold text-[#1a2b49] tracking-tight font-serif">Certificates</h1>
            <p className="text-sm text-gray-500 mt-1">
              Issue, track credentials, and manage course certificate templates.
            </p>
          </div>

          {/* Segmented Pill Tabs */}
          <div className="inline-flex gap-2">
            <button
              type="button"
              onClick={() => handleTabChange("issued")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer border ${
                tab === "issued"
                  ? "bg-[#162a4a] text-white border-[#162a4a] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Award size={16} className={tab === "issued" ? "text-white" : "text-gray-400"} />
              Issued Certificates
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("templates")}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all cursor-pointer border ${
                tab === "templates"
                  ? "bg-[#162a4a] text-white border-[#162a4a] shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <LayoutTemplate size={16} className={tab === "templates" ? "text-white" : "text-gray-400"} />
              Templates
            </button>
          </div>
        </div>

        {/* Right: Info Banner */}
        <div className="bg-[#fcf9f2] rounded-2xl p-5 border border-[#f0e6d2] max-w-sm flex items-start gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm border border-[#f0e6d2] shrink-0 text-[#d4af37]">
            <Award size={24} />
          </div>
          <div>
            <h3 className="font-bold text-[#1a2b49] text-base">Recognize Achievements</h3>
            <p className="text-sm text-gray-600 mt-1 leading-relaxed">
              Create professional certificates for your students and track their progress.
            </p>
          </div>
        </div>
      </div>

      {/* ── Active Tab Content ── */}
      <div>{tab === "issued" ? <IssuedTab /> : <TemplatesTab />}</div>
    </div>
  );
}

export default function AcademyCertificatesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Loading certificates…
        </div>
      }
    >
      <CertificatesContent />
    </Suspense>
  );
}
