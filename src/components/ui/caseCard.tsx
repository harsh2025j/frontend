"use client";

import React, { useState } from "react";

interface CaseCardProps {
  title: string;
  court: string;
  advocate: string;
}

const CaseCard: React.FC<CaseCardProps> = ({
  title,
  court,
  advocate,
  
}) => {
  const [checked, setChecked] = useState(false);
  return (
    <div className="w-full border border-black rounded-md p-3 flex justify-between items-start gap-4">
      <div className="flex-1">
        <h2 className="text-md font-semibold leading-snug">
          {title}
        </h2>

        <div className="grid grid-cols-2 mt-4 text-[12px] leading-relaxed">
          <div className="text-gray-900">{court}</div>
          <div className="text-gray-900">{advocate}</div>
        </div>
      </div>

      <div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => setChecked(e.target.checked)}
          className="w-6 h-6 appearance-none rounded-full border-2 border-black checked:bg-black checked:shadow-[inset_0_0_0_3px_white]"
        />
      </div>
    </div>
  );
};

export default CaseCard;
