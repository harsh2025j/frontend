"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
// import Link from "next/link";
import { Link } from "@/i18n/routing";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface HindiNews {
  img: StaticImageData | string;
  title: string;
  description: string;
  slug: string;
  author?: string | null;
}

const HindiNews: React.FC<HindiNews> = ({
  img,
  title,
  description,
  slug,
  author,
}) => {
  return (
    <div className="bg-white rounded-md flex flex-row w-full transition-all duration-300 hover:border-blue-300 border border-gray-200 my-4 overflow-hidden shadow-sm">
      {/* Left - Image */}
      <Link href={`/news/${slug}`} className="relative w-[35%] sm:w-[30%] md:w-[25%] lg:w-[20%] shrink-0">
        <Image
          src={getSafeImageUrl(typeof img === 'string' ? img : img.src)}
          alt={title}
          fill
          sizes="(max-width: 640px) 35vw, (max-width: 768px) 30vw, 25vw"
          quality={90}
          className="object-cover"
        />
      </Link>

      <div className="flex flex-col w-[65%] sm:w-[70%] md:w-[75%] lg:w-[80%] p-3 sm:p-4">
        <Link href={`/news/${slug}`}>
          <h2 className="font-merriweather sm:text-xl text-sm font-semibold line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors">
            {title}
          </h2>
        </Link>
        <div className="mt-1 sm:mt-2 text-[10px] sm:text-xs text-gray-500 font-medium">
          Author: {author || "Anonymous"}
        </div>
        <Link href={`/news/${slug}`} className="mt-2 block">
          <p
            className="font-sans text-gray-600 text-xs sm:text-sm line-clamp-3 sm:line-clamp-4"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        </Link>
      </div>
    </div>
  );
}

export default HindiNews;