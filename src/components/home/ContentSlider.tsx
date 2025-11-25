"use client";

import Image, { StaticImageData } from "next/image";
import { useRef, useEffect, useState } from "react";

interface Article {
  img: StaticImageData | string;
  title: string;
}

interface ContentSliderProps {
  name: string;
  FilteredData: Article[];
}

export default function ContentSlider({ name, FilteredData }: ContentSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const prog = (el.scrollLeft / (el.scrollWidth - el.clientWidth)) * 100;
    setScrollProgress(prog);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="p-6 bg-[#f6f6f7] flex items-center justify-center relative">
      <div className="w-full container bg-white rounded-xl shadow-lg p-3 flex gap-4 relative">

        {/* Left Label */}
        <div className="bg-[#1b3550] rounded-lg w-40 flex items-center justify-center px-4">
          <span
            className="text-white text-2xl rotate-180 font-medium"
            style={{ writingMode: "vertical-rl" }}
          >
            {name}
          </span>
        </div>

        {/* Scrollable Articles */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth custom-scroll py-3 pr-2"
        >
          {FilteredData.map((item, i) => (
            <div
              key={i}
              className="min-w-[260px] max-w-[260px] bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative w-[260px] h-[160px] overflow-hidden rounded-lg">
                <Image
                  src={item.img}
                  alt={item.title || "Image not found"}
                  fill
                  className="object-cover"
                />
              </div>

              <p className="text-center text-gray-800 font-medium px-2 py-4">
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {/* Optional Scroll Progress Indicator */}
        {/* <div className="absolute bottom-1 left-0 h-1 bg-gray-200 w-full rounded">
          <div
            className="h-full bg-blue-500 rounded"
            style={{ width: `${scrollProgress}%` }}
          ></div>
        </div> */}
      </div>
    </div>
  );
}
