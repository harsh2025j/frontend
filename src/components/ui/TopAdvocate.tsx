"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface AdvocateProps {
  img: StaticImageData;
  title: string;
  description: string;
}

const TopAdvocate: React.FC<AdvocateProps> = ({ img, title, description }) => {
  return (
    
    <div className="flex items-center gap-4 bg-[#e5e5e5] p-5 rounded-xl w-full max-w-2xl m-2  h-auto">
      <div className="w-14 h-14 relative rounded-full overflow-hidden">
        <Image src={img} alt={title} fill className="object-cover" />
      </div>

      <div className="flex flex-col">
        <h3 className="text-md font-semibold">{title}</h3>
        <p className="text-sm text-gray-700">{description}</p>
      </div>
    </div>
  );
};

export default TopAdvocate;
