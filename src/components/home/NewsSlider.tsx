"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import img1 from '../../assets/slider/image.svg'
import img2 from '../../assets/slider/mask.svg'
import img3 from '../../assets/slider/maskgroup.svg'

export default function NewsSlider() {
  const slides = [
    {
      image: img1,
      title: "Breaking News: AI Revolutionizing Industries",
      description:
        "Artificial Intelligence is transforming how businesses operate across healthcare, finance, and education.",
      link: "#",
    },
    {
      image:img2,
      title: "Tech Giants Invest in Clean Energy",
      description:
        "Major technology companies are committing billions toward sustainable energy solutions.",
      link: "#",
    },
    {
      image: img3,
      title: "Startups Driving Innovation in 2025",
      description:
        "New startups are redefining traditional industries with cutting-edge solutions and AI-powered tools.",
      link: "#",
    },
  ];

  const [current, setCurrent] = useState(0);

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <div className="relative bg-[#0A2342] text-white py-10 px-4 md:px-8 flex flex-col items-center">
      <div className="container w-full flex flex-col md:flex-row items-center justify-between gap-8 transition-all duration-500">
        {/* Left arrow */}
        <button
          onClick={prevSlide}
          className="hidden md:flex p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <ChevronLeft size={30} />
        </button>

        {/* Image */}
        <div className="relative w-full md:w-1/2 h-[250px] sm:h-[350px] md:h-[400px] lg:h-[420px] overflow-hidden">
          <Image
            src={slides[current].image}
            alt={slides[current].title}
            fill
            className="object-cover transition-all duration-700"
          />
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 space-y-4 text-center md:text-left px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-snug">
            {slides[current].title}
          </h2>
          <p className="text-gray-300 text-sm sm:text-base">
            {slides[current].description}
          </p>
          <a
            href={slides[current].link}
            className="text-blue-400 hover:underline font-medium"
          >
            Read more →
          </a>
        </div>

        {/* Right arrow */}
        <button
          onClick={nextSlide}
          className="hidden md:flex p-3 rounded-full bg-white/10 hover:bg-white/20 transition"
        >
          <ChevronRight size={30} />
        </button>
      </div>

      {/* Dots */}
      <div className="flex gap-2 mt-6">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === index ? "bg-white scale-110" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
