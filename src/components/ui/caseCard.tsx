"use client";

import React from "react";

interface CaseCardProps {
  title: string;
  court: string;
  advocate: string;
}

const CaseCard: React.FC<CaseCardProps> = ({ title, court, advocate }) => {
  return (
    <div className="w-full border border-black rounded-md p-3 flex justify-between items-start gap-4">
      <div className="flex-1">
        <h2 className="text-md font-semibold leading-snug">{title}</h2>

        <div className="grid grid-cols-2 mt-4 text-[12px] leading-relaxed">
          <div className="text-gray-900">{court}</div>
          <div className="text-gray-900">{advocate}</div>
        </div>
      </div>

      <div className="relative flex items-center justify-center w-4 h-4">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
      </div>
    </div>
  );
};

export default CaseCard;
