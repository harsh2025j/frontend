"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";

interface LatestNewsProps {
  img: StaticImageData;
  title: string;
  button1Text: string;
  button2Text: string;
}

const LatestNews: React.FC<LatestNewsProps> = ({
  img,
  title,
  button1Text,
  button2Text,
}) => {
  return (
    <div className="bg-white  rounded-md shadow-lg overflow-hidden hover:border-blue-300 transition-all duration-300 flex flex-col justify-between border border-gray-200 p-6">
      <Image src={img} alt={title}  className="object-cover rounded-md" />
      <div className="pt-4 flex flex-col justify-between h-full">
        <h2 className="text-gray-900  font-merriweather font-semibold md:text-base text-[13px] mb-4 leading-snug">
          {title}
        </h2>
        <div className="flex gap-3 ">
          <button className="bg-[#d4af37] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#b8962f] transition-all duration-200">
            {button1Text}
          </button>
          <button className="bg-[#1a73e8] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1558b3] transition-all duration-200">
            {button2Text}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
