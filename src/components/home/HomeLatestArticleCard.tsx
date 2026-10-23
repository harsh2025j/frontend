"use client";

import React from "react";
import { Link } from "@/i18n/routing";
import Image, { StaticImageData } from "next/image";
import { User, Calendar, ArrowRight, ChevronRight } from "lucide-react";
import { getSafeImageUrl } from "@/utils/imageUtils";

interface HomeLatestArticleCardProps {
  img: StaticImageData | string;
  title: string;
  button1Text?: string;
  slug?: string;
  date?: string;
  author?: string;
  category?: string;
}

const HomeLatestArticleCard: React.FC<HomeLatestArticleCardProps> = ({
  img,
  title,
  button1Text = "Read Full Case",
  slug = "",
  date,
  author = "Super admin",
  category = "LATEST CASE"
}) => {
  const imageUrl = getSafeImageUrl(typeof img === "string" ? img : (img as StaticImageData)?.src || "");
  const newsLink = slug ? `/news/${slug}` : "#";

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex flex-col justify-between h-full group">
      {/* Thumbnail with Category Pill */}
      <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-slate-100">
        <Link href={newsLink} className="relative block w-full h-full">
          <Image
            src={imageUrl}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            quality={90}
            className="object-cover group-hover:scale-102 transition-transform duration-300"
          />
        </Link>
        {/* Category Pill Tag */}
        <span className="absolute top-2.5 left-2.5 bg-[#C9A227] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm z-10 pointer-events-none">
          {category}
        </span>
      </div>

      {/* Card Body */}
      <div className="flex flex-col p-4 flex-grow justify-between">
        <div>
          <Link href={newsLink}>
            <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 hover:text-[#0B2242] transition-colors mb-2">
              {title}
            </h3>
          </Link>

          {/* Meta Details */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-3 pt-1">
            <div className="flex items-center gap-1.5 truncate pr-2">
              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">Author: {author || "Super admin"}</span>
            </div>
            {date && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mt-auto">
          <Link
            href={newsLink}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C9A227] hover:bg-[#b08d1f] text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
          >
            <span>{button1Text}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={newsLink}
            className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:border-slate-400 group-hover:text-slate-700 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomeLatestArticleCard;
