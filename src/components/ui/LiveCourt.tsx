import CaseCard from "./caseCard";

export default function LiveCourt() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-[28px] bg-white rounded-md">

      <CaseCard
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
      />
    </div>
  );
}
