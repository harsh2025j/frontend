"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Article {
  slug: string;
  img: StaticImageData | string;
  title: string;
}

interface ContentSliderProps {
  name: string;
  slug: string;
  FilteredData: Article[];
}

export default function ContentSlider({ name, FilteredData, slug }: ContentSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftBtn, setShowLeftBtn] = useState(false);
  const [showRightBtn, setShowRightBtn] = useState(true);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const scrollAmount = 300;
    const targetScroll = el.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);

    el.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  const checkScrollButtons = () => {
    const el = scrollRef.current;
    if (!el) return;

    setShowLeftBtn(el.scrollLeft > 0);

    setShowRightBtn(
      Math.ceil(el.scrollLeft + el.clientWidth) < el.scrollWidth
    );
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollButtons);
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);

    return () => {
      el.removeEventListener("scroll", checkScrollButtons);
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [FilteredData]);

  return (
    <div className="p-4 md:p-6 bg-[#f6f6f7] flex items-center justify-center relative">
      <div className="w-full container bg-white rounded-md  p-3 flex gap-4 relative group">

        {/* Left Label (Category Name) */}
        <Link href={`/category/${slug}`} className="bg-[#1b3550] rounded-lg w-12 sm:w-24 md:w-40 flex items-center justify-center flex-shrink-0 transition-all duration-300">

          <span
            className="text-white text-lg sm:text-xl md:text-2xl font-medium tracking-wider whitespace-nowrap"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            {name}
          </span>
        </Link>

        {/* Left Navigation Button */}
        {showLeftBtn && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-14 sm:left-28 md:left-44 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-200 hidden sm:flex items-center justify-center"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Right Navigation Button */}
        {showRightBtn && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-200 p-2 rounded-full shadow-lg hover:bg-gray-100 hover:scale-110 transition-all duration-200 hidden sm:flex items-center justify-center"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth custom-scroll py-3 pr-2 flex-1"
        >
          {FilteredData.map((item, i) => (
            <div
              key={i}
              className="min-w-[260px] max-w-[260px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative w-full h-[160px] overflow-hidden bg-gray-200">
                <Link href={`/news/${item.slug}`}>
                  <Image
                    src={item.img}
                    alt={item.title || "Article Image"}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                  />
                </Link>
              </div>
              <Link href={`/news/${item.slug}`}>
                <div className="p-3 h-[80px] flex items-center justify-center">
                  <p className="text-center text-gray-800 font-medium text-sm line-clamp-2 leading-relaxed hover:text-blue-600 transition-colors">
                    {item.title}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}