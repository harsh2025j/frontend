"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useArticleListActions } from "@/data/features/article/useArticleActions"; // ✅ Use Shared Hook
import Link from "next/link";
import Loader from "../ui/Loader";
import img1 from '../../assets/slider/image.svg';
import img2 from '../../assets/slider/mask.svg';
import img3 from '../../assets/slider/maskgroup.svg';
import headerBg from '../../assets/svgimage/header.png';

import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";
import { StaticImageData } from "next/image";

interface Slide {
  image: string | StaticImageData;
  title: string;
  description: string;
  link: string;
}

export default function NewsSlider() {
  // ✅ Use the hook. It won't re-fetch if data exists.
  const { articles, loading } = useArticleListActions();
  const locale = useLocale();

  const [current, setCurrent] = useState(0);
  const [fade, setFade] = useState(true);

  // ✅ Memoize slides to prevent re-calculation re-renders
  const baseSlides: Slide[] = useMemo(() => {
    const latestArticles = articles.slice(0, 6);
    return latestArticles.length > 0
      ? latestArticles.map((article: any) => ({
        image: article.thumbnail || img1,
        title: article.title,
        description: article.content.replace(/<[^>]*>/g, '').substring(0, 150) + "...",
        link: `/news/${article.slug}`,
      }))
      : [
        {
          image: img1,
          title: "Breaking News: AI Revolutionizing Industries",
          description: "Artificial Intelligence is transforming how businesses operate across healthcare, finance, and education.",
          link: "#",
        },
        {
          image: img2,
          title: "Tech Giants Invest in Clean Energy",
          description: "Major technology companies are committing billions toward sustainable energy solutions.",
          link: "#",
        },
        {
          image: img3,
          title: "Startups Driving Innovation in 2025",
          description: "New startups are redefining traditional industries with cutting-edge solutions and AI-powered tools.",
          link: "#",
        },
      ];
  }, [articles]);

  // Translate slides
  const [textsToTranslate, setTextsToTranslate] = useState<string[]>([]);

  useEffect(() => {
    if (baseSlides.length > 0 && locale !== 'en') {
      const texts: string[] = [];
      baseSlides.forEach((s: Slide) => {
        texts.push(s.title);
        texts.push(s.description);
      });
      setTextsToTranslate(texts);
    }
  }, [baseSlides, locale]);

  const { translatedText, loading: translating } = useGoogleTranslate(
    locale !== 'en' && textsToTranslate.length > 0 ? textsToTranslate : null
  );

  const slides = useMemo(() => {
    if (locale === 'en' || !translatedText || !Array.isArray(translatedText)) return baseSlides;

    return baseSlides.map((slide: Slide, index: number) => {
      const titleIdx = index * 2;
      const descIdx = index * 2 + 1;
      return {
        ...slide,
        title: translatedText[titleIdx] || slide.title,
        description: translatedText[descIdx] || slide.description
      };
    });
  }, [baseSlides, translatedText, locale]);

  const changeSlide = (newIndex: number) => {
    setFade(false);
    setTimeout(() => {
      setCurrent(newIndex);
      setFade(true);
    }, 300);
  };

  const nextSlide = () => changeSlide((current + 1) % slides.length);
  const prevSlide = () => changeSlide((current - 1 + slides.length) % slides.length);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [current, slides.length]);

  // Only show loader if we have NO data and are actually loading
  if (loading && articles.length === 0) {
    return (
      <div className="w-full h-[500px] bg-[#0A2342] flex items-center justify-center">
        <Loader size="lg" text="Loading Latest News..." />
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#0A2342] sm:mt-20 border-y border-gray-700 overflow-hidden">
      {/* Background Image */}
      <div className="absolute bottom-0 right-0  z-0">
        <Image
          src={headerBg}
          alt="Background"

          className=" opacity-40" // Adjust opacity as needed for readability
          priority
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-16 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Image Section */}
            <div className="relative order-2 md:order-1">
              <div className="relative h-[350px] md:h-[450px] overflow-hidden shadow-2xl group">
                <Image
                  src={slides[current].image}
                  alt={slides[current].title}
                  fill
                  className={`object-cover transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
                    } group-hover:scale-105`}
                  priority // Keeps priority for LCP
                />
              </div>
            </div>

            {/* Text Section */}
            <div className="order-1 md:order-2 space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-red-500 font-bold tracking-wider text-sm uppercase animate-pulse">
                  Latest News
                  {translating && <span className="ml-2 text-xs text-white font-normal">Translating...</span>}
                </span>
              </div>

              <div className="space-y-4">
                <h2
                  className={`text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight line-clamp-3 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
                    }`}
                >
                  {slides[current].title}
                </h2>
                <p
                  className={`text-gray-300 text-base md:text-lg leading-relaxed line-clamp-3 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
                    }`}
                >
                  {slides[current].description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  href={slides[current].link}
                  className={`inline-flex items-center text-sm font-semibold text-white hover:text-gray-300 transition-opacity duration-500 ${fade ? "opacity-100" : "opacity-0"
                    }`}
                >
                  Read Article
                  <svg
                    className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Navigation */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex gap-3">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full border border-gray-600 hover:border-white hover:bg-white/10 transition-all"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full border border-gray-600 hover:border-white hover:bg-white/10 transition-all"
                    aria-label="Next slide"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </div>

                {/* Indicators */}
                <div className="flex gap-2">
                  {slides.map((_: any, index: any) => (
                    <button
                      key={index}
                      onClick={() => changeSlide(index)}
                      className="group"
                      aria-label={`Go to slide ${index + 1}`}
                    >
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${current === index ? "w-8 bg-white" : "w-6 bg-gray-600 group-hover:bg-gray-400"
                          }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Counter */}
                <div className="text-sm text-gray-400 font-medium">
                  <span className="text-white">{String(current + 1).padStart(2, "0")}</span>
                  <span className="mx-1">/</span>
                  <span>{String(slides.length).padStart(2, "0")}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}