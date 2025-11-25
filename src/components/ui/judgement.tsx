"use client";
import React from "react";
import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";

interface JudgementProps {
  img: StaticImageData | string;
  description: string;
  slug?: string;
  author?: string;
  date?: string;
}

const Judgement: React.FC<JudgementProps> = ({ img, description, slug, author, date }) => {
  return (
    <div className="bg-white rounded-md shadow-lg overflow-hidden hover:border-blue-300 transition-all duration-300 flex flex-col sm:flex-row justify-between border border-gray-200 py-5 gap-5">
      <Link href={`/news/${slug}`} className="flex flex-col sm:flex-row gap-5 w-full">
        <div className="relative w-full sm:w-[150px] h-[150px] flex-shrink-0 ml-2">
          <Image
            src={img}
            alt="Judgement Image"
            fill
            className="object-cover rounded-md"
          />
        </div>
        <div className="flex flex-col  w-full">
          <div
            className="line-clamp-6 sm:text-base md:text-xs font-merriweather mb-2"
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <div className="text-gray-500 text-xs sm:text-sm mt-2">
            {author && <span className="mr-3">Author: {author}</span>}
            <div className="flex items-center gap-1 text-gray-600">
              <Clock size={14} />
              {date && <span>{date}</span>}
            </div>

          </div>
        </div>
      </Link>
    </div>
  );
};

export default Judgement;
