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
    <div className="bg-white rounded-lg flex flex-row w-full transition-all duration-200 hover:border-[#C9A227] border border-gray-200 my-4 overflow-hidden group">
      {/* Left - Image */}
      <Link href={`/news/${slug}`} className="relative w-[35%] sm:w-[30%] md:w-[280px] lg:w-[320px] xl:w-[340px] md:aspect-video shrink-0 overflow-hidden rounded-l-lg">
        <Image
          src={getSafeImageUrl(typeof img === 'string' ? img : img.src)}
          alt={title}
          fill
          sizes="(max-width: 640px) 35vw, (max-width: 768px) 30vw, 340px"
          quality={90}
          className="object-cover"
        />
      </Link>

      <div className="flex flex-col justify-center flex-1 min-w-0 p-3 sm:p-4 md:p-5">
        <Link href={`/news/${slug}`}>
          <h2 className="font-heading sm:text-xl text-base font-semibold line-clamp-2 text-[#0B2242] hover:text-[#C9A227] transition-colors leading-[1.3]">
            {title}
          </h2>
        </Link>
        <div className="mt-1 sm:mt-2 text-[11px] sm:text-xs text-gray-500 font-medium font-body">
          Author: {author || "Anonymous"}
        </div>
        <Link href={`/news/${slug}`} className="mt-2 block">
          <p
            className="font-body text-gray-600 text-xs sm:text-[14px] leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />
        </Link>
      </div>
    </div>
  );
}

export default HindiNews;