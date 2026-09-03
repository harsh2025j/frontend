"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight, ArrowRight, MousePointer2 } from "lucide-react";
import Image from "next/image";
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { Link } from "@/i18n/routing";
import Loader from "../ui/Loader";
import { useHomeData } from "@/context/HomeDataContext";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import { getSafeImageUrl } from "@/utils/imageUtils";

import headerBg from '../../assets/svgimage/header.png';

export default function NewsSlider() {
  const homeData = useHomeData();
  const { articles: reduxArticles, loading: reduxLoading } = useArticleListActions();

  const articles = useMemo(() => {
    const rawLatest = homeData?.latestArticles;
    const base = (Array.isArray(reduxArticles) && reduxArticles.length > 0)
      ? reduxArticles
      : (Array.isArray(rawLatest) ? rawLatest : []);

    return base.filter((a: any) => a && a.status === 'published');
  }, [reduxArticles, homeData?.latestArticles]);

  const loading = reduxLoading && reduxArticles.length === 0 && (!homeData || homeData.latestArticles.length === 0);

  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);

  // ─── 3D PERSPECTIVE PHYSICS ──────────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(y, [0, 1], [10, -10]), { stiffness: 150, damping: 20 });
  const rotateY = useSpring(useTransform(x, [0, 1], [-10, 10]), { stiffness: 150, damping: 20 });
  const shimmerX = useTransform(x, [0, 1], ["-20%", "120%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0.5);
    y.set(0.5);
  };

  const slides = useMemo(() => {
    const latestArticles = articles.slice(0, 5);
    if (latestArticles.length > 0) {
      return latestArticles.map((article: any) => ({
        image: getSafeImageUrl(article.thumbnail),
        title: article.title,
        category: article.category?.name || "Premium Insight",
        description: (article.content || "").replace(/<[^>]*>/g, '').substring(0, 150) + "...",
        link: `/news/${article.slug}`,
      }));
    }
    return [
      {
        image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=2070",
        title: "Advancing Global Legal Standards in the Digital Era",
        category: "Corporate Evolution",
        description: "Exploring the critical intersection of decentralized technology and international trade jurisprudence.",
        link: "#",
      },
      {
        image: "https://images.unsplash.com/photo-1505664194779-8beaceb93744?q=80&w=2070",
        title: "Sustainability and the Future of International Trade",
        category: "Green Economy",
        description: "How new regulatory frameworks are shaping the green economy and cross-border commerce globally.",
        link: "#",
      }
    ];
  }, [articles]);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const timer = setInterval(nextSlide, 8000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  if (loading && articles.length === 0) {
    return (
      <div className="w-full h-[600px] bg-[#0A2342] flex items-center justify-center">
        <Loader size="lg" text="Loading articles..." />
      </div>
    );
  }

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-auto min-h-[700px] md:min-h-[570px] lg:h-[570px] bg-[#0A2342] overflow-hidden group perspective-[1500px]"
    >
      {/* ─── ATMOSPHERE LAYER ─── */}
      <div className="absolute inset-0 z-0">
        {/* <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.15, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 bg-cover bg-center blur-2xl scale-110"
            style={{ backgroundImage: `url(${typeof slides[current].image === 'string' ? slides[current].image : (slides[current].image as any).src})` }}
          />
        </AnimatePresence> */}
        <Image
          src={headerBg}
          alt=""
          className="absolute bottom-1 right-1 opacity-40 object-cover mix-blend-overlay pointer-events-none"
        />
      </div>

      {/* ─── MAIN CONTENT CONTAINER ─── */}
      <div className="container relative z-10 mx-auto h-full px-2 md:px-3 flex items-center py-6 md:py-10 lg:py-0">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-20 items-center">

          {/* IMAGE BLOCK */}
          <div className="order-1 lg:order-1 relative flex justify-center lg:justify-start transition-all duration-700">
            <motion.div
              style={{ rotateX, rotateY, backfaceVisibility: "hidden" }}
              className="relative w-full mx-[-20px] max-w-[100vw] md:max-w-[90vw] lg:min-h-[400px] aspect-[16/9] rounded-[15px] md:rounded-[20px] lg:rounded-[20px] overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)] border border-white/10 group/card isolation-isolate transform-gpu [mask-image:linear-gradient(white,white)]"
            >
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={current}
                  initial={{ opacity: 0, x: direction * -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * 30 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0"
                >

                  <Image
                    src={slides[current].image}
                    alt={slides[current].title}
                    fill
                    className="relative z-10 object-fill"
                    priority={true}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 900px"
                    quality={100}
                  />

                  {/* ─── Background Preloading (Ensures 'Next' image is ready) ─── */}
                  {slides[(current + 1) % slides.length] && (
                    <div className="hidden" aria-hidden="true" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
                      <Image
                        src={slides[(current + 1) % slides.length].image}
                        alt=""
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 900px"
                        priority={false}
                        quality={100}
                      />
                    </div>
                  )}

                  <motion.div
                    style={{ left: shimmerX }}
                    className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-25deg] pointer-events-none z-20"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342]/60 via-transparent to-transparent opacity-80 z-20" />
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* CONTENT BLOCK - FIXED GEOMETRY ONLY ON LAPTOP */}
          <div className="order-2 lg:order-2 flex flex-col h-full lg:min-h-[550px] justify-center lg:justify-start lg:py-16 text-center lg:text-left">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex flex-col"
              >
                {/* 1. Category Indicator */}
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4 lg:mb-6">
                  <span className="text-[#C9A227] font-black tracking-[0.25em] text-[10px] lg:text-xs uppercase drop-shadow-sm">
                    {slides[current].category}
                  </span>
                  <div className="hidden lg:block flex-1 h-[1px] bg-white/10" />
                </div>

                {/* 2. Heading Reservoir */}
                <div className="min-h-0 lg:min-h-[170px] flex items-start mb-4 lg:mb-0">
                  <h1 className="text-2xl md:text-4xl lg:text-[45px] font-black text-white leading-[1.3] md:leading-[1.25] tracking-tight line-clamp-3 py-2">
                    {slides[current].title}
                  </h1>
                </div>

                {/* 3. Description Reservoir */}
                <div className="min-h-0 lg:min-h-[80px] mb-2 lg:mb-6">
                  <p className="text-gray-400 text-sm md:text-lg leading-relaxed font-medium max-w-xl mx-auto lg:mx-0 line-clamp-3">
                    {slides[current].description}
                  </p>
                </div>

                {/* 4. PINNED BOTTOM ACTION GROUP */}
                <div className="mt-2 lg:mt-auto pt-6 lg:pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-center lg:justify-between gap-6">
                  <Link
                    href={slides[current].link}
                    className="group/btn inline-flex items-center gap-3 bg-[#C9A227] hover:bg-[#b39022] text-[#0A2342] px-8 lg:px-10 py-3.5 lg:py-4 rounded-full font-bold text-[10px] lg:text-xs tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
                  >
                    <span className="!text-white">READ FULL ARTICLE</span>
                    {/* <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" /> */}
                  </Link>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={prevSlide}
                      className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full border border-white/10 transition-all hover:bg-white/5 group/nav"
                    >
                      <ChevronLeft size={20} className="text-white transition-transform group-hover/nav:-translate-x-0.5" />
                    </button>
                    <button
                      onClick={nextSlide}
                      className="w-12 h-12 lg:w-14 lg:h-14 flex items-center justify-center rounded-full border border-white/10 transition-all hover:bg-white/5 group/nav"
                    >
                      <ChevronRight size={20} className="text-white transition-transform group-hover/nav:translate-x-0.5" />
                    </button>
                  </div>
                </div>

                {/* 5. Fixed Progress Position */}
                <div className="mt-8 lg:mt-8">
                  <div className="flex items-center justify-between mb-3 text-[10px] font-black tracking-widest uppercase">
                    <span className="text-[#C9A227]">{String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')} Insights</span>
                    <MousePointer2 className="w-3 h-3 text-white/20" />
                  </div>
                  <div className="h-[2px] lg:h-[1px] bg-white/5 w-full rounded-full overflow-hidden">
                    <motion.div
                      key={current}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 8, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-[#C9A227] to-white origin-left"
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}