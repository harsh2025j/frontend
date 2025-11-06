"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface AiPoweredFeaturesProps {
  heading: string;
  description: string;
  img: StaticImageData;
}

const AiPoweredFeatures: React.FC<AiPoweredFeaturesProps> = ({
  heading,
  description,
  img,
}) => {
  return (
    <div className="bg-[#0b2242] text-white p-6 rounded-xl shadow-md flex flex-col items-start w-full sm:w-72  transform transition-all duration-300 hover:scale-99 hover:shadow-md h-[209px] pt-4 justify-between  max-w-full">

      <div className="bg-white p-2 rounded-full mb-4">
        <Image src={img} alt={heading} width={28} height={28} />
      </div>
      <h2 className="text-lg font-merriweather font-bold mb-2 ">{heading}</h2>
      <p className="text-sm text-gray-200 font-merriweather" >{description}</p>
    </div>
  );
};

export default AiPoweredFeatures;
