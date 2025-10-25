"use client";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import img from "../../assets/stories.jpeg";

const articles = [
  { img: img, title: "US visa bulletin for November released: Check for latest updates" },
  { img: img, title: "HDFC Life profit rises 3% to ₹447 crore" },
  { img: img, title: "RBL’s USP: No promoter overhang" },
  { img: img, title: "Govt reverses tax-free import policy for mis parts amid tax e" },
  { img: img, title: "Govt reverses tax-free import policy for mis parts amid tax e" },
  { img: img, title: "Govt reverses tax-free import policy for mis parts amid tax e" },
  { img: img, title: "Govt reverses tax-free import policy for mis parts amid tax e" },
];

export default function ContentSlider() {
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
    <div className="p-6 bg-gray-100 flex items-center justify-center relative">
      <div className="w-full max-w-7xl bg-white rounded-xl shadow-lg p-3 flex gap-4 relative">
        <div className="bg-[#1b3550] rounded-lg w-40 flex items-center justify-center px-4">
          <span
            className="text-white text-2xl rotate-180 font-medium"
            style={{ writingMode: "vertical-rl" }}
          >
            Finance articles
          </span>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth custom-scroll py-3 pr-2"
        >
          {articles.map((item, i) => (
            <div
              key={i}
              className="min-w-[260px] max-w-[260px] bg-white rounded-lg shadow-md overflow-hidden"
            >
              <Image
                src={item.img}
                width={260}
                height={160}
                alt={item.title}
                className="h-40 w-full object-cover"
              />
              <p className="text-center text-gray-800 font-medium px-2 py-4">
                {item.title}
              </p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
