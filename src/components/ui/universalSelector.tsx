import React, { useState } from "react";

interface UniversalSelectProps {
  name: string;
  options: string[];
  className?: string;
  onSelect?: (value: string) => void;
}

const UniversalSelect: React.FC<UniversalSelectProps> = ({
  name,
  options,
  className = "",
  onSelect
}) => {
  const [selected, setSelected] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelected(val);
    if (onSelect) {
      onSelect(val);
    }
  };

  return (
    <div className={`flex flex-col ${className}`}>
      <div
        className="
          h-[35px] md:h-[40px]
          w-full sm:w-[150px] md:w-[160px] lg:w-[190px]
          border border-[#b5b9c0]
          rounded-xl
          flex items-center
          px-2   /* reduce padding so arrow is visible */
        "
      >
        <select
          value={selected}
          onChange={handleChange}
          className="
            w-full 
            bg-transparent 
            text-sm md:text-base 
            focus:outline-none 
            cursor-pointer
            appearance-auto   /* ensures default arrow shows */
          "
        >
          <option value="" disabled hidden>{name}</option>

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
