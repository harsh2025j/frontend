"use client";
import { useMemo } from "react";
import CaseCard from "./caseCard";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { getArticlesBySlugs } from "@/components/home/Stores";

export default function LiveCourt() {
  const { articles, loading } = useArticleListActions();

  // Fetch articles tagged with "live-court" category
  const liveCourtData = useMemo(
    () => getArticlesBySlugs(articles, ["live-court"]),
    [articles]
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-[28px] bg-white rounded-md">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  // If no data from backend, show hardcoded fallback
  if (liveCourtData.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-[28px] bg-white rounded-md">

        <h1>
          There are no live court cases available at the moment. So, we will get back to you as soon as possible.
        </h1>
        {/* <CaseCard
          title="DINESH KUMARI vs. M/S SUNCITY HI-TECH INFRASTRUCTURE PVT. LTD. C.A. No. 13005/2025"
          court="Supreme Court of India"
          advocate="Advocate:- Ms. Aishwarya Bhati (ASG)"
        />

        <CaseCard
          title="CHHAYA PAL vs. CHHATRAPAL BEGHEL SLP(C) No. 4414/2023"
          court="Supreme Court of India"
          advocate="Advocate:- Ms. Aishwarya Bhati (ASG)"
        />

        <CaseCard
          title="PRABHU vs. SHRIRAM GENERAL INSURANCE BRANCH MANAGER SLP(C) No. 6548/2019"
          court="Supreme Court of India"
          advocate="Advocate:- Ms. Aishwarya Bhati (ASG)"
        />

        <CaseCard
          title="HALDIA DOCK COMPLEX CONTRACTORS WORKERS UNION vs. UNION OF INDIA W.P.(C) No. 506/2024"
          court="Supreme Court of India"
          advocate="Advocate:- Ms. Aishwarya Bhati (ASG)"
        /> */}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-[28px] bg-white rounded-md">
      {liveCourtData.slice(0, 4).map((caseData) => (
        <CaseCard
          key={caseData.id}
          title={caseData.title}
          court={caseData.location || "Supreme Court of India"}
          advocate={caseData.advocateName || "Advocate"}
        />
      ))}
    </div>
  );
}
