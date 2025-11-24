import Image, { StaticImageData } from "next/image";
import { Eye, Heart, Clock } from "lucide-react"; // 👈 Lucide icons
import logo from "../../../public/logo.png";

interface NewsCardProps {
  src?: StaticImageData | string;
  title: string;
  court?: string;
  time?: number;
  views?: string;
  likes?: string;
}

export default function NewsCard({
  src = logo,
  title,
  court,
  time,
  views,
  likes,
}: NewsCardProps) {
  const validSrc =
    typeof src === "string" &&
      (src.startsWith("http") || src.startsWith("/"))
      ? src
      : typeof src === "object"
        ? src
        : logo;

  return (
    <div className="w-full max-w-[600px] rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden hover:shadow-lg transition">
      {/* Image */}
      <div className="relative h-[200px] w-full">
        <Image
          src={validSrc}
          width={600}
          height={200}
          alt={title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-3">

        {/* Court + Time */}
        <div className="flex flex-wrap gap-3 items-center text-xs">

          {court ? (
            <span className="bg-gray-200 text-gray-900 px-3 py-1 rounded-full font-medium">
              {court}
            </span>
          ) : (
            <span className="text-gray-400 italic">Court not available</span>
          )}

          <div className="flex items-center gap-1 text-gray-600">
            <Clock size={14} />
            {time !== undefined ? (
              <span>{time} mins ago</span>
            ) : (
              <span className="text-gray-400 italic">No time</span>
            )}
          </div>
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          {title}
        </p>

        {/* Views + Likes */}
        <div className="flex items-center gap-6 text-xs text-gray-700">

          <div className="flex items-center gap-1">
            <Eye size={14} />
            {views ? <span>{views}</span> : <span className="text-gray-400 italic">0</span>}
          </div>

          <div className="flex items-center gap-1">
            <Heart size={14} />
            {likes ? <span>{likes}</span> : <span className="text-gray-400 italic">0</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
