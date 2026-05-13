"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import { Briefcase } from "lucide-react";

interface CaseLinkedBadgeProps {
  caseId?: string | null;
  caseTitle?: string;
  caseNumber?: string;
}

/**
 * Renders a clickable badge when an appointment is linked to a case.
 * Deep-links to the case detail page. Shows nothing if no caseId.
 */
export default function CaseLinkedBadge({ caseId, caseTitle, caseNumber }: CaseLinkedBadgeProps) {
  if (!caseId) return null;

  const displayText = caseNumber || caseTitle || "Linked Case";

  return (
    <Link
      href={`/cases/${caseId}`}
      onClick={(e: React.MouseEvent) => e.stopPropagation()}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg text-[10px] font-bold hover:bg-indigo-100 hover:border-indigo-200 transition-all group"
      title={`View Case: ${displayText}`}
    >
      <Briefcase size={11} className="group-hover:scale-110 transition-transform" />
      <span className="max-w-[120px] truncate">{displayText}</span>
    </Link>
  );
}
