'use client'
import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import NewsCard from "../ui/NewsCard";
import Image from "next/image";
// import img from "../../../public/stories.jpeg"; 
import Button from "../ui/Button";
// import NewsScroller from "../ui/NewsScroller"; 
import AiPoweredFeatures from "../ui/AiPoweredFeatures";
import ContentSlider from "@/components/home/ContentSlider";
import LatestNews from "../ui/LatestNews";
import Judgement from "../ui/judgement";

import TopJudges from "../ui/TopJudgesSection";
import TopAdvocateSection from "../ui/TopAdvocateSection";
import HindiNews from "../ui/HindiNews";
import CustomInput from "../ui/CustomInput"
import StateJudgement from "../ui/stateJudgement";
import HighCourtsModal from "../ui/HighCourtsModal";
import Loader from "../ui/Loader";
import SearchWithDropdown from "../ui/SearchWithDropdown";
import icon2 from '../../assets/icon2.png';
import icon3 from '../../assets/icon3.png';
import icon4 from '../../assets/icon4.png';
// import img1 from '../../assets/img1.png';

import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { highCourts } from "@/data/highCourts";
import { Article, Category } from "@/data/features/article/article.types";
import ArticleSkeleton from "../ui/ArticleSkeleton";
// import Link from "next/link";
import { Link } from "@/i18n/routing";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";
import { useDocTitle } from "@/hooks/useDocTitle";
import LiveCourtSection from "../ui/LiveCourtSection";
import LatestInformationSection from "../ui/LatestInformationSection";
// import AdsPopup from "../ads/AdsPopup";


export function getArticlesBySlugs(articles: Article[], slugs: string[]) {
  const matchSlugs = slugs.map(s => s.toLowerCase());

  return articles.filter(article => {
    // Helper to collect current slug and all parent slugs
    const collectSlugs = (cat: Category | null | undefined): string[] => {
      if (!cat) return [];
      const arr: string[] = [];

      // 1. Add current slug
      if (cat.slug) arr.push(cat.slug.toLowerCase());

      // 2. Only traverse UP (Parents) to find inheritance. 
      if (cat.parent) {
        arr.push(...collectSlugs(cat.parent));
      }
      return arr;
    };

    const allSlugs = collectSlugs(article.category);
    return allSlugs.some(s => matchSlugs.includes(s));
  });
}

export default function Stores() {
  useDocTitle("Sajjad Husain Law Associates");
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isNavigating, setIsNavigating] = useState(false);


  const handleNavClick = () => {
    setIsNavigating(true);
  };


  const { articles: allArticles, loading, error } = useArticleListActions();
  const articles = useMemo(() => allArticles.filter((a: { status: string; }) => a.status === 'published'), [allArticles]);


  const LatestNewsData = useMemo(() => getArticlesBySlugs(articles, ["latest-news"]), [articles]);
  const JudgementNewsData = useMemo(() => getArticlesBySlugs(articles, ["judgments-content"]), [articles]);
  const HindiNewsData = useMemo(() => getArticlesBySlugs(articles, ["hindi-news"]), [articles]);
  const FinanceArticleData = useMemo(() => getArticlesBySlugs(articles, ["finance-articles"]), [articles]);
  const LegalArticleData = useMemo(() => getArticlesBySlugs(articles, ["legal-articles"]), [articles]);

  // ... inside Stores component ...
  const locale = useLocale();

  // ... (existing memos for filtered data) ...

  // Typewriter Logic
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const newsHeadlines = useMemo(() => {
    return articles.length > 0
      ? articles.map((a: Article) => a.title)
      : [
        "JP Morgan's Jamie Dimon said he was 'far more worried than others' about the potential for a stock market correction.",
        "Breaking: AI Revolutionizing Legal Tech Industry in 2025",
        "Supreme Court issues new guidelines for digital evidence submission"
      ];
  }, [articles]);

  // --- Translation Logic ---
  const [textsToTranslate, setTextsToTranslate] = useState<string[]>([]);

  // We need to track the counts to map back correctly
  const [counts, setCounts] = useState({ headlines: 0, latest: 0, judgments: 0, hindi: 0 });

  useEffect(() => {
    if (locale === 'en') return;

    const texts: string[] = [];

    // 1. Headlines
    newsHeadlines.forEach((h: string) => texts.push(h));

    // 2. Latest News (Title) - Slice 4
    const latest = LatestNewsData.slice(0, 4);
    latest.forEach(a => texts.push(a.title));

    // 3. Judgments (Content/Description) - Slice 3
    // Note: Judgement component uses 'content' as description
    const judgments = JudgementNewsData.slice(0, 3);
    judgments.forEach(a => texts.push(a.content.replace(/<[^>]*>/g, "").substring(0, 150) + "..."));

    // 4. Hindi News (Title + Content) - Slice 3
    const hindi = HindiNewsData.slice(0, 3);
    hindi.forEach(a => {
      texts.push(a.title);
      texts.push(a.content.replace(/<[^>]*>/g, "").substring(0, 150) + "...");
    });

    setCounts({
      headlines: newsHeadlines.length,
      latest: latest.length,
      judgments: judgments.length,
      hindi: hindi.length
    });
    setTextsToTranslate(texts);

  }, [newsHeadlines, LatestNewsData, JudgementNewsData, HindiNewsData, locale]);

  const { translatedText } = useGoogleTranslate(
    locale !== 'en' && textsToTranslate.length > 0 ? textsToTranslate : null
  );

  // --- Derived Display Data ---
  const displayHeadlines = useMemo(() => {
    if (locale === 'en' || !translatedText || !Array.isArray(translatedText)) return newsHeadlines;
    return translatedText.slice(0, counts.headlines);
  }, [newsHeadlines, translatedText, counts, locale]);

  const displayLatestNews = useMemo(() => {
    const base = LatestNewsData.slice(0, 4);
    if (locale === 'en' || !translatedText || !Array.isArray(translatedText)) return base;

    const start = counts.headlines;
    return base.map((item, i) => ({
      ...item,
      title: translatedText[start + i] || item.title
    }));
  }, [LatestNewsData, translatedText, counts, locale]);

  const displayJudgments = useMemo(() => {
    const base = JudgementNewsData.slice(0, 3);
    if (locale === 'en' || !translatedText || !Array.isArray(translatedText)) return base;

    const start = counts.headlines + counts.latest;
    return base.map((item, i) => ({
      ...item,
      content: translatedText[start + i] || item.content
    }));
  }, [JudgementNewsData, translatedText, counts, locale]);

  const displayHindiNews = useMemo(() => {
    const base = HindiNewsData.slice(0, 3);
    if (locale === 'en' || !translatedText || !Array.isArray(translatedText)) return base;

    const start = counts.headlines + counts.latest + counts.judgments;
    return base.map((item, i) => ({
      ...item,
      title: translatedText[start + i * 2] || item.title,
      content: translatedText[start + i * 2 + 1] || item.content
    }));
  }, [HindiNewsData, translatedText, counts, locale]);


  React.useEffect(() => {
    const handleType = () => {
      const i = loopNum % displayHeadlines.length;
      const fullText = displayHeadlines[i];

      setCurrentText(isDeleting
        ? fullText.substring(0, currentText.length - 1)
        : fullText.substring(0, currentText.length + 1)
      );

      if (!isDeleting && currentText === fullText) {
        setTypingSpeed(1000);
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(200);
      } else {
        setTypingSpeed(isDeleting ? 10 : 15);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum, displayHeadlines, typingSpeed]);




  return (
    <div className="bg-[#f6f6f7]">

      {isNavigating && <Loader fullScreen text="Loading..." />}

      <div className="w-full">

        {/* Live News Banner */}
        <div className="border-2 border-dotted border-[#000000] min-h-14 my-3 md:my-5 flex flex-col sm:flex-row bg-white mb-20 md:mb-24">
          <div className="w-full sm:w-40 h-full min-h-14 flex justify-center items-center bg-[#0A2342] text-white text-sm md:text-md py-2 sm:py-0 shrink-0">
            Live News
          </div>
          <div className="flex items-center px-3 sm:px-5 py-2 sm:py-0 w-full overflow-hidden">
            <p className="text-xs sm:text-sm md:text-base text-center sm:text-left font-medium text-gray-800 whitespace-nowrap">
              {currentText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
        </div>


        {/* Quick Access Section - Overlapping Cards */}
        <div className="container mx-auto px-4 -mt-16 md:-mt-20 mb-8 md:mb-10 relative z-10">

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
            <button
              onClick={() => router.push('/cases')}
              className="flex flex-col items-center justify-center p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg shadow-md hover:border-[#C9A227] hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mb-3 bg-[#0A2342] rounded-full flex items-center justify-center group-hover:bg-[#C9A227] transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-[#C9A227] transition-colors">
                Case Status
              </span>
            </button>

            <button
              onClick={() => router.push('/')}
              className="flex flex-col items-center justify-center p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg shadow-md hover:border-[#C9A227] hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mb-3 bg-[#0A2342] rounded-full flex items-center justify-center group-hover:bg-[#C9A227] transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-[#C9A227] transition-colors">
                Case List
              </span>
            </button>

            <button
              onClick={() => router.push('/reports')}
              className="flex flex-col items-center justify-center p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg shadow-md hover:border-[#C9A227] hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mb-3 bg-[#0A2342] rounded-full flex items-center justify-center group-hover:bg-[#C9A227] transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-[#C9A227] transition-colors">
                Reports
              </span>
            </button>

            <button
              onClick={() => router.push('/judgments')}
              className="flex flex-col items-center justify-center p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg shadow-md hover:border-[#C9A227] hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mb-3 bg-[#0A2342] rounded-full flex items-center justify-center group-hover:bg-[#C9A227] transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-[#C9A227] transition-colors">
                Judgments
              </span>
            </button>

            <button
              onClick={() => router.push('/display-boards')}
              className="flex flex-col items-center justify-center p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg shadow-md hover:border-[#C9A227] hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mb-3 bg-[#0A2342] rounded-full flex items-center justify-center group-hover:bg-[#C9A227] transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-[#C9A227] transition-colors">
                Display Boards
              </span>
            </button>

            <button
              onClick={() => router.push('/judges')}
              className="flex flex-col items-center justify-center p-4 md:p-5 bg-gradient-to-br from-white to-gray-50 border-2 border-gray-200 rounded-lg shadow-md hover:border-[#C9A227] hover:shadow-xl transition-all group"
            >
              <div className="w-12 h-12 md:w-14 md:h-14 mb-3 bg-[#0A2342] rounded-full flex items-center justify-center group-hover:bg-[#C9A227] transition-colors">
                <svg className="w-6 h-6 md:w-7 md:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-[#C9A227] transition-colors">
                Judges
              </span>
            </button>
          </div>
        </div>

        {/* High Courts Section */}
        <div className="bg-gradient-to-b from-white to-gray-50 w-full mb-8 md:mb-12 py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-10">

            {/* Section Title */}
            <div className="text-center mb-10 md:mb-14">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 md:mb-4">
                High Courts of India
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-[#C9A227] to-[#b39022] mx-auto mb-4"></div>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Access judgments and legal information from courts across India
              </p>
            </div>

            {/* High Courts Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 sm:gap-8 md:gap-10 mb-10 md:mb-14">
              {highCourts.slice(0, 8).map((court) => (
                <Link key={court.id} href={`category/${court.slug}`} className="transform hover:scale-110 transition-transform duration-300">
                  <StateJudgement img={court.image} state={court.name} />
                </Link>
              ))}
            </div>

            {/* Show More Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-10 py-4 bg-[#0A2342] text-white text-sm md:text-base rounded-full hover:bg-[#1a3a75] transition-all duration-300 font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  View All High Courts
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#C9A227] to-[#b39022] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

          </div>
        </div>

        <HighCourtsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />


        {/* Live Streaming & Latest Information - SCI Style */}
        <div className="bg-gradient-to-b from-gray-50 to-white py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-start">

              {/* Live Streaming & Live Court Section (Merged) */}
              <LiveCourtSection />

              {/* Latest Information Section */}
              <LatestInformationSection />

            </div>
          </div>
        </div>

        {/* Top Judges & Top Advocate */}
        <div className="flex justify-center px-4 mb-6 md:mb-10 pt-8">
          <div className="container flex flex-col lg:flex-row gap-4 md:gap-6">
            <TopJudges />
            <TopAdvocateSection />
          </div>
        </div>

        {/* AI Powered Features */}
        {/* <div className="w-full">
          <div className="flex items-center justify-center my-6 md:my-10 px-4">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black text-center">
              AI Powered Features
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="bg-white flex justify-center px-4">
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 my-6 md:my-10 py-6 md:py-10">
              <AiPoweredFeatures heading="AI LEGAL Summarizer" description="Convert lengthy case file into digestible 2-minute brifs without loosing context " img={icon1} />
              <AiPoweredFeatures heading="Real Time Court News" description="Verified updates aggregated from trust judicial and legal sources." img={icon2} />
              <AiPoweredFeatures heading="Smart Law Library" description="Search case by topic, year, bench, act with precision filters. " img={icon3} />
              <AiPoweredFeatures heading="AI Suggestions" description="Gen related precedents and judgments automatically, trailered to your query." img={icon4} />
            </div>
          </div>
        </div> */}

        {/* Latest News & Judgments */}
        <div className="w-full px-4">
          <div className="flex items-center justify-center my-6 md:my-10">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black text-center whitespace-nowrap">
              Latest News & Judgments
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="flex justify-center">
            <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                <ArticleSkeleton count={3} />
              ) : (
                displayLatestNews.map((data: any) => (
                  <LatestNews
                    key={data.id}
                    img={data.thumbnail}
                    title={data.title}
                    slug={data.slug}
                    author={data.authors}
                    date={new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    button1Text="Read Full Case"
                    button2Text="AI Summary"
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Judgments Grid */}
        <div className="flex justify-center px-4 my-6 md:my-12">
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {loading ? (
              <ArticleSkeleton count={3} />
            ) : (
              displayJudgments.map((data: any) => (
                <Judgement
                  key={data.id}
                  img={data.thumbnail}
                  description={data.content}
                  date={new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  author={data.authors}
                  slug={data.slug}
                />
              ))
            )}
          </div>
        </div>

        {/* ✅ UPDATED: View More for Judgments */}
        <div className="flex justify-center mb-6 md:mb-10">
          <Link href="/category/judgments" onClick={handleNavClick}>
            <button className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base">
              View More
            </button>
          </Link>
        </div>

        {/* Hindi News */}
        <div className="w-full px-4">
          <div className="flex items-center justify-center mt-6 md:mt-10 mb-4 md:mb-5">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black">
              Hindi News
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="flex justify-center">
            <div className="container flex flex-col gap-4 sm:gap-6">
              {loading ? (
                <ArticleSkeleton count={3} />
              ) : (
                displayHindiNews.map((data: any) => (
                  <HindiNews
                    key={data.id}
                    img={data.thumbnail}
                    title={data.title}
                    description={data.content}
                    slug={data.slug}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: View More for Hindi News */}
        <div className="flex justify-center mb-6 md:mb-10">
          <Link href={`/category/${"hindi-news"}`} onClick={handleNavClick}>
            <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base mt-4 md:mt-5" />
          </Link>
        </div>

        {/* Articles */}
        <div className="px-4">
          <div className="flex items-center justify-center mt-6 md:mt-10 mb-4 md:mb-5">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black">
              Article
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          {/* Finance Articles ContentSlider */}
          {/* Note: ContentSlider links need to handle navigation internally or accept an onClick prop if we want loader there too. For now, handled main page buttons. */}
          {loading ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Finance Articles</h3>
              <ArticleSkeleton count={4} isWide={true} />
            </div>
          ) : (
            <ContentSlider name="Finance Articles" slug={"finance-articles"} FilteredData={FinanceArticleData.map((article) => ({
              ...article,
              img: article.thumbnail || "",
            }))} />
          )}

          {/* Legal Articles ContentSlider */}
          {loading ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Legal Articles</h3>
              <ArticleSkeleton count={4} isWide={true} />
            </div>
          ) : (
            <ContentSlider
              name="Legal Articles"
              slug={"legal-articles"}
              FilteredData={LegalArticleData.map((article) => ({
                ...article,
                img: article.thumbnail || "",
              }))}
            />
          )}
        </div>
      </div>
    </div>

  );
}