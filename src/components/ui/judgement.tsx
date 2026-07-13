"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
// import Link from "next/link";
import { Link } from "@/i18n/routing";
import { Clock } from "lucide-react";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

interface JudgementProps {
  img: StaticImageData | string;
  title?: string;
  description: string;
  slug?: string;
  author?: string;
  date?: string;
}

const Judgement: React.FC<JudgementProps> = ({ img, title, description, slug, author, date }) => {
  return (
    <div className="bg-white rounded-xl overflow-hidden border-1 border-gray-300/10 hover:border-blue-300 transition-all duration-300 flex flex-col border border-gray-100 group">
      <Link href={`/news/${slug}`} className="flex flex-col h-full">
        {/* Optimized Image Container with Aspect-Video */}
        <div className="relative w-full aspect-video flex-shrink-0 overflow-hidden bg-gray-100">
          <Image
            src={getSafeImageUrl(typeof img === 'string' ? img : img.src)}
            alt={title || "Judgement Image"}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            quality={90}
            className="object-cover transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className="bg-[#0A2342] text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              Judgment
            </span>
          </div>
        </div>

        {/* Text Content Area */}
        <div className="flex flex-col p-4 flex-1">
          {title && (
            <h3 className="text-sm font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors leading-tight">
              {title}
            </h3>
          )}

          <div
            className="line-clamp-3 text-xs text-gray-600 font-merriweather mb-4 flex-1"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(description) }}
          />

          <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="text-[#C9A227]">By</span>
              <span className="text-gray-600 truncate max-w-[100px]">{author || "Anonymous"}</span>
            </div>

            <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
              <Clock size={12} className="text-[#C9A227]" />
              {date && <span>{date}</span>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Judgement;
