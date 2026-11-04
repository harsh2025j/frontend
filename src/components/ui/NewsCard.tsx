import Image, { StaticImageData } from "next/image";
import { Clock, User } from "lucide-react";
import logo from "../../../public/logo.png";
import { getSafeImageUrl } from "@/utils/imageUtils";

interface NewsCardProps {
  src?: StaticImageData | string;
  title: string;
  court?: string;
  time?: string;
  views?: string;
  likes?: string;
  content?: string;
  author?: string | null;
}

export default function NewsCard({
  src = logo,
  title,
  court,
  time,
  author,
}: NewsCardProps) {
  const validSrc = getSafeImageUrl(src as string);

  return (
    <div className="w-full rounded-lg bg-white border border-gray-200 overflow-hidden hover:border-[#C9A227] transition-all duration-200 flex flex-col h-full group">
      {/* Image — 16:9 ratio */}
      <div className="relative aspect-video w-full flex-shrink-0 overflow-hidden rounded-t-lg">
        <Image
          src={validSrc}
          fill
          alt={title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          quality={85}
          className="object-cover transition-transform duration-300 group-hover:scale-102"
        />
      </div>

      {/* Content — grows to fill remaining card space */}
      <div className="p-4 flex flex-col gap-2 flex-1">

        {/* Court + Time */}
        <div className="flex flex-wrap gap-2 items-center text-xs font-body">
          {court ? (
            <span className="bg-gray-100 text-[#0B2242] border border-gray-200 px-2.5 py-0.5 rounded-full font-medium truncate max-w-[140px]">
              {court}
            </span>
          ) : (
            <span className="text-gray-400 italic">—</span>
          )}

          <div className="flex items-center gap-1 text-gray-500 ml-auto">
            <Clock size={12} />
            <span>{time ?? "—"}</span>
          </div>
        </div>

        {/* Title — max 2 lines, then ellipsis */}
        <p
          className="font-heading text-[15px] font-semibold text-[#0B2242] leading-[1.3] group-hover:text-[#C9A227] transition-colors"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </p>

        {/* Spacer pushes author to bottom */}
        <div className="flex-1" />

        {/* Author */}
        <div className="flex items-center gap-1 text-xs text-gray-500 pt-2 border-t border-gray-100">
          <User size={12} className="flex-shrink-0" />
          <span className="truncate">
            {author && author.trim() ? author : "Anonymous"}
          </span>
        </div>
      </div>
    </div>
  );
}
