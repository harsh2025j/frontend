"use client";

import Image, { StaticImageData } from "next/image";
import image from "../../../public/stories.jpeg";
import Button from "./Button";

interface CategoryCardProps {
  src?: StaticImageData;
  categoryName?: string;
  postCount?: number;
  description?: string;
  date?: string;
  onClick?: () => void;
}

export default function CategoryCard({
  src = image,
  categoryName = "Uncategorized",
  postCount,
  description,
  date,
  onClick,
}: CategoryCardProps) {
  return (
   <div className=" ">
     <div className="flex flex-col w-full max-w-[300px] overflow-hidden bg-white rounded-lg border border-gray-200 hover:border-[#C9A227] transition-all duration-200 group">
      <div className="relative w-full h-48 sm:h-56">
        <Image
          src={src}
          alt={categoryName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 300px"
        />
      </div>
      <div className="flex flex-wrap p-4 space-y-3">
        <div className="flex items-center gap-2.5 text-gray-700 text-xs sm:text-sm">
          <span className="bg-gray-300 text-gray-900 px-3 py-1 rounded-sm font-medium">
            {categoryName}
          </span>
          {postCount !== undefined && (
            <span className="text-gray-600">{postCount} posts</span>
          )}
        </div>

        {description && (
          <p className="text-xs sm:text-sm text-gray-800 line-clamp-3">
            {description}
          </p>
        )}

        {date && (
          <p className="text-xs text-gray-500">
            Updated on <span className="font-medium">{date}</span>
          </p>
        )}
        <div className="pt-2 w-full">
          <Button
            lable="Explore Category"
            onClick={onClick}
            className="bg-gray-200 w-full px-4 py-2 rounded-md text-black text-xs sm:text-sm border border-gray-300 transition hover:bg-gray-300"
          />
        </div>
      </div>
    </div>
   </div>
  );
}
