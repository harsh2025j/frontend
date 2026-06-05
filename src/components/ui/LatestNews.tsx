"use client";
import React from "react";
// import Link from "next/link";
import { Link } from "@/i18n/routing";
import Image, { StaticImageData } from "next/image";
import { Clock } from "lucide-react";
import { getSafeImageUrl } from "@/utils/imageUtils";

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
    <div className="bg-white rounded-md overflow-hidden hover:border-blue-300 transition-all duration-300 flex flex-col border border-gray-200 p-0 h-full">

      <div className="relative w-full aspect-video shrink-0">
        <Link href={`/news/${slug}`} className="relative block w-full h-full">
          <Image
            src={getSafeImageUrl(typeof img === 'string' ? img : (img as StaticImageData)?.src || '')}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 500px"
            quality={90}
            className="object-cover"
          />
        </Link>
      </div>

      <div className="flex flex-col p-3 sm:p-4 flex-grow">
        <Link href={`/news/${slug}`}>
          <h2 className="text-gray-900 font-merriweather font-semibold md:text-base text-[13px] leading-snug line-clamp-3 mb-2 hover:text-blue-600 transition-colors">
            {title}
          </h2>
        </Link>

        <div className="text-gray-500 text-xs sm:text-sm flex items-center gap-2 mb-3 mt-auto pt-2">
          <span className="truncate">Author: {author || "Anonymous"}</span>
          {date && <span>•</span>}
          {date && (
            <span className="flex items-center gap-1 shrink-0">
              <Clock size={14} />
              {date}
            </span>
          )}
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
