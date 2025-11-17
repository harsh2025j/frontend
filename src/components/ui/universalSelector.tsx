import React, { useState } from "react";

interface UniversalSelectProps {
  name: string;
  options: string[];    
  className?: string;
}

const UniversalSelect: React.FC<UniversalSelectProps> = ({
  name,
  options,
  className = "",
}) => {
  const [selected, setSelected] = useState<string>(""); 
  return (
    <div className={`flex flex-col ${className}`}>

      <div className="h-[50px] w-[200px] border border-[#b5b9c0] rounded-2xl flex items-center px-5">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="w-full bg-transparent text-md font-medium focus:outline-none cursor-pointer"
        >
          <option value="">{name}</option>

          {options.map((opt, i) => (
            <option key={i} value={opt} className="text-black">
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UniversalSelect;
