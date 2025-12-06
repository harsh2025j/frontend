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
import UniversalSelect from "../ui/universalSelector";
import TopAdvocate from "../ui/TopAdvocate"
import LiveCourt from "../ui/LiveCourt"
import HindiNews from "../ui/HindiNews";
import CustomInput from "../ui/CustomInput"
import StateJudgement from "../ui/stateJudgement";
import HighCourtsModal from "../ui/HighCourtsModal";
import Loader from "../ui/Loader"; // ✅ IMPORTED LOADER
import icon1 from '../../assets/icon1.png';
import icon2 from '../../assets/icon2.png';
import icon3 from '../../assets/icon3.png';
import icon4 from '../../assets/icon4.png';
// import img1 from '../../assets/img1.png'; 
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { highCourts } from "@/data/highCourts";
import { Article, Category } from "@/data/features/article/article.types";
import ArticleSkeleton from "../ui/ArticleSkeleton";
import Link from "next/link";
import { useGoogleTranslate } from "@/hooks/useGoogleTranslate";
import { useLocale } from "next-intl";


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
  const router = useRouter();
  const [SearchData, setSearchData] = useState({ Search: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);


  const [isNavigating, setIsNavigating] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (e.target instanceof HTMLInputElement) {
      setSearchData({ ...SearchData, [e.target.name]: e.target.value });
    }
  };


  const handleSearchClick = () => {
    setIsNavigating(true);
    router.push('/ai-assistant');
  };


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
        setTypingSpeed(2000);
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      } else {
        setTypingSpeed(isDeleting ? 30 : 50);
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum, displayHeadlines, typingSpeed]);

  return (
    <div className="bg-[#f6f6f7]">
      {/* ✅ NEW: Full Screen Loader when navigating */}
      {isNavigating && <Loader fullScreen text="Loading..." />}

      <div className="w-full">

        {/* Live News Banner */}
        <div className="border-2 border-dotted border-[#000000] min-h-14 my-3 md:my-5 flex flex-col sm:flex-row bg-white">
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

        {/* Universal Selectors */}
        <div className="container mx-auto px-4 mb-3 md:mb-5">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <UniversalSelect name="Case Status" options={[]} />
            <UniversalSelect name="Case List" options={[]} />
            <UniversalSelect name="Reports" options={[]} />
            <UniversalSelect name="Judgment" options={[]} />
            <UniversalSelect name="Display Boards" options={[]} />
            <UniversalSelect name="Judges" options={[]} />
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white w-full flex justify-center mb-6 md:mb-10">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">

            {/* Search Bar */}
            <div className="w-full flex justify-center items-center mb-8 md:mb-10">
              <div className="relative w-full max-w-[700px]">
                <CustomInput
                  name="Search"
                  value={SearchData.Search}
                  onChange={handleSearchChange}
                  placeholder="Search any Legal question or track a case..."
                  className="bg-[#f6f6f7] w-full pl-10 sm:pl-12 pr-12 sm:pr-14 py-2 sm:py-3 text-sm sm:text-base md:text-lg rounded-xl"
                />

                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-[#f6f6f7] text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* High Courts Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
              {highCourts.slice(0, 8).map((court) => (
                <StateJudgement key={court.id} img={court.image} state={court.name} />
              ))}
            </div>

            {/* Show More Button */}
            <div className="flex justify-center mt-6 md:mt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#0A2342] text-white text-sm sm:text-base rounded-lg hover:bg-[#1a3a75] transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Show All High Courts
              </button>
            </div>

          </div>
        </div>

        <HighCourtsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        {/* Live Court & Top Advocate */}
        <div className="flex justify-center px-4 mb-6 md:mb-10">
          <div className="container flex flex-col lg:flex-row gap-4 md:gap-6">
            <div className="flex flex-col gap-3 md:gap-4 w-full lg:flex-1">
              <div className="flex justify-between items-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-merriweather">
                  Live Court
                </h1>
              </div>
              <LiveCourt />
            </div>

            <div className="flex flex-col gap-3 md:gap-4 w-full lg:max-w-[600px]">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-merriweather">
                  Top Advocate
                </h1>
              </div>
              <div className="flex flex-col p-4 sm:p-5 bg-white justify-evenly transition-all duration-300 rounded-sm h-full gap-3">
                <h1>
                  For now we are collecting Advocate data from showing here
                </h1>
                {/* <TopAdvocate img={icon1} title="Mr. Sunil Prajapati," description="Senior Advocate " /> */}
              </div>
            </div>
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