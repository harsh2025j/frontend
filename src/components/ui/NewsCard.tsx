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
    <div className="w-full rounded-[4px] bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
      {/* Image — 16:9 ratio */}
      <div className="relative aspect-video w-full flex-shrink-0">
        <Image
          src={validSrc}
          fill
          alt={title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
          quality={85}
          className="object-cover"
        />
      </div>

      {/* Content — grows to fill remaining card space */}
      <div className="p-4 flex flex-col gap-2 flex-1">

        {/* Court + Time */}
        <div className="flex flex-wrap gap-2 items-center text-xs">
          {court ? (
            <span className="bg-gray-200 text-gray-900 px-3 py-1 rounded-full font-medium truncate max-w-[140px]">
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
          className="text-sm font-semibold text-gray-900 leading-snug"
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
