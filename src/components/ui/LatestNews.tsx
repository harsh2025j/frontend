"use client";
import React from "react";
import Link from "next/link";
import Image, { StaticImageData } from "next/image";
import { Clock } from "lucide-react";

interface LatestNewsProps {
  img: StaticImageData | string;
  title: string;
  button1Text: string;
  button2Text: string;
  slug?: string;
  date?: string;
  author?: string;
}

const LatestNews: React.FC<LatestNewsProps> = ({
  img,
  title,
  button1Text,
  button2Text,
  slug,
  date,
  author,
}) => {
  return (
    <div className="bg-white  rounded-md  overflow-hidden hover:border-blue-300 transition-all duration-300 flex flex-col justify-between border border-gray-200 p-0">

      <div className="relative w-full h-60 ">
        <Link href={`/news/${slug}`}>
          <Image
            src={img}
            alt={title}
            fill
            className="object-cover rounded-t-md"
          />
        </Link>
      </div>

      <div className="flex flex-col p-3 ">
        <Link href={`/news/${slug}`}>
          <h2 className="text-gray-900  font-merriweather font-semibold md:text-base text-[13px]  leading-snug">
            {title}
          </h2>
        </Link>

        <div className="text-gray-500 text-xs sm:text-sm  flex items-center gap-2 mb-3">
          {author && <span>Author: {author}</span>}
          {author && date && <span>•</span>}
          <Clock size={14} />
          {date && <span>{date}</span>}
        </div>

        <div className="flex gap-3">
          {slug ? (
            <Link href={`/news/${slug}`}>
              <button className="bg-[#d4af37] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#b8962f] transition-all duration-200">
                {button1Text}
              </button>
            </Link>
          ) : (
            <button className="bg-[#d4af37] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#b8962f] transition-all duration-200">
              {button1Text}
            </button>
          )}

          {/* <button className="bg-[#1a73e8] text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-[#1558b3] transition-all duration-200">
            {button2Text}
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
