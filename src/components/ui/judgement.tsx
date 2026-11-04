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
    <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:border-[#C9A227] transition-all duration-200 flex flex-col group">
      <Link href={`/news/${slug}`} className="flex flex-col h-full">
        {/* Optimized Image Container with Aspect-Video */}
        <div className="relative w-full aspect-video flex-shrink-0 overflow-hidden bg-gray-100 rounded-t-lg">
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
            <h3 className="font-heading font-semibold text-[15px] text-[#0B2242] line-clamp-2 mb-2 group-hover:text-[#C9A227] transition-colors leading-[1.3]">
              {title}
            </h3>
          )}

          <div
            className="line-clamp-3 text-[13px] text-gray-600 font-body leading-relaxed mb-4 flex-1"
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
