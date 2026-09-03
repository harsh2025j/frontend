"use client";

// import Link from "next/link";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useCategoryArticles } from "@/hooks/useCategoryArticles";
import Loader from "../ui/Loader";
import { useMemo } from "react";
import { getSafeImageUrl } from "@/utils/imageUtils";
import { formatDate } from "@/utils/dateUtils";
import { useHomeData } from "@/context/HomeDataContext";


interface CategorySectionProps {
  title: string;
  slug: string;
  layout: "grid" | "list" | "featured" | "slider";
  limit?: number;
  showViewMoreButton?: boolean;
  page?: number;
}

export default function CategorySection({ title, slug, layout, limit = 6, showViewMoreButton = false, page = 1 }: CategorySectionProps) {
  const homeData = useHomeData();
  const { articles: reduxArticles, loading: reduxLoading } = useCategoryArticles(slug, limit, false, page);

  // Use server articles if available for this specific category
  const initialArticles = useMemo(() => {
    if (page > 1 || !homeData) return [];
    if (slug === 'finance-articles') return Array.isArray(homeData.financeArticles) ? homeData.financeArticles : [];
    if (slug === 'legal-articles') return Array.isArray(homeData.legalArticles) ? homeData.legalArticles : [];
    if (slug === 'hindi-news') return Array.isArray(homeData.hindiArticles) ? homeData.hindiArticles : [];
    if (slug === 'latest-news') return Array.isArray(homeData.latestArticles) ? homeData.latestArticles : [];
    return [];
  }, [homeData, slug, page]);


  const articles = useMemo(() => {
    const base = (Array.isArray(reduxArticles) && reduxArticles.length > 0) ? reduxArticles : initialArticles;
    return Array.isArray(base) ? base.filter((a: any) => a && a.status === 'published') : [];
  }, [reduxArticles, initialArticles]);

  const loading = reduxLoading && reduxArticles.length === 0 && initialArticles.length === 0;

  if (loading) {
    return (
      <section className="py-8 border-b border-gray-100 last:border-0">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 relative pl-4">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C9A227] rounded-full"></span>
              {title}
            </h2>
          </div>
          {layout === "grid" && <GridSkeleton limit={limit} />}
          {layout === "list" && <ListLayoutSkeleton limit={limit} />}
          {layout === "featured" && <FeaturedLayoutSkeleton />}
          {layout === "slider" && <SliderLayoutSkeleton limit={limit} />}
        </div>
      </section>
    );
  }
  // Hide section if no articles
  if (!articles || articles.length === 0) return null;

  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C9A227] rounded-full"></span>
            {title}
          </h2>
          {!showViewMoreButton && (
            <Link
              href={`/category/${slug}`}
              className="flex items-center text-sm font-semibold text-[#C9A227] hover:text-[#b39022] transition-colors group"
            >
              View All <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Layouts - Using articles directly */}
        {layout === "grid" && <GridLayout articles={articles} />}
        {layout === "list" && <ListLayout articles={articles} />}
        {layout === "featured" && <FeaturedLayout articles={articles} />}
        {layout === "slider" && <SliderLayout articles={articles} slug={slug} />}

        {/* Bottom View More Button */}
        {showViewMoreButton && (
          <div className="mt-8 flex justify-center">
            <Link
              href={`/category/${slug}`}
              className="px-6 py-2 border border-gray-400 rounded-md text-sm font-medium text-gray-800 hover:bg-gray-50 hover:text-[#C9A227] hover:border-[#C9A227] transition-all"
            >
              View More
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

const ArticleCard = ({ article, compact = false }: { article: any; compact?: boolean }) => (
  <Link href={`/news/${article.slug}`} className="group block h-full">
    <div className="bg-white rounded-md overflow-hidden border border-gray-100 hover:shadow-md transition-all duration-300 h-full flex flex-col">
      <div className="relative overflow-hidden aspect-video">
        <Image
          src={getSafeImageUrl(article.thumbnail)}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 500px"
          quality={90}
          className="object-cover transition-transform duration-500 "
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-[#C9A227] bg-[#C9A227]/10 px-2 py-0.5 rounded-full">
            {article.category?.name || "News"}
          </span>
          <span className="text-xs text-gray-400">
            {formatDate(article.createdAt)}
          </span>
        </div>

        <h3 className={`font-bold text-gray-900 group-hover:text-[#C9A227] transition-colors line-clamp-2 ${compact ? "text-base" : "text-lg"}`}>
          {article.title}
        </h3>

        {!compact && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {article.subHeadline || (article.content || "").replace(/<[^>]*>/g, "").substring(0, 100)}...
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">
            Author: {article.authors || article.advocateName || "Anonymous"}
          </span>
        </div>
      </div>
    </div>
  </Link>
);

const ArticleCardSkeleton = ({ compact = false }: { compact?: boolean }) => (
  <div className="bg-white rounded-md overflow-hidden border border-gray-100 h-full flex flex-col animate-pulse">
    <div className="w-full aspect-video bg-gray-200" />
    <div className="p-4 flex flex-col flex-grow">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
      <div className="h-5 w-full bg-gray-200 rounded mb-2" />
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-3" />
      {!compact && (
        <>
          <div className="h-3 w-full bg-gray-200 rounded mb-2" />
          <div className="h-3 w-4/5 bg-gray-200 rounded mb-3" />
        </>
      )}
      <div className="mt-auto pt-2">
        <div className="h-3 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const GridLayout = ({ articles }: { articles: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {articles.slice(0, 8).map((article) => (
      <ArticleCard key={article.id} article={article} />
    ))}
  </div>
);

const GridSkeleton = ({ limit }: { limit: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {Array.from({ length: limit }).map((_, i) => (
      <ArticleCardSkeleton key={i} compact={false} />
    ))}
  </div>
);

const ListLayout = ({ articles }: { articles: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {articles.map((article) => (
      <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-4 items-stretch md:items-start bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all overflow-hidden">
        <div className="relative flex-shrink-0 w-28 min-h-[112px] md:w-40 md:min-h-0 md:h-auto md:aspect-video lg:w-48 bg-gray-50 overflow-hidden md:rounded-lg md:m-3 md:mr-0">
          <Image
            src={getSafeImageUrl(article.thumbnail)}
            alt={article.title}
            fill
            sizes="(max-width: 768px) 112px, (max-width: 1024px) 160px, 192px"
            quality={100}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex-grow py-2 pr-3">
          <h2 className="font-bold text-gray-900 group-hover:text-[#C9A227] transition-colors line-clamp-2 mb-1">
            {article.title}
          </h2>
          <p className="text-xs text-gray-500 line-clamp-1">
            {article.subHeadline || (article.content || "").replace(/<[^>]*>/g, "").substring(0, 80)}...
          </p>
          <div className="flex flex-col gap-0.5 mt-2">
            <span className="text-[10px] text-gray-500">
              Author: {article.authors || article.advocateName || "Anonymous"}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatDate(article.createdAt)}
            </span>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

const ListLayoutSkeleton = ({ limit }: { limit: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {Array.from({ length: limit }).map((_, i) => (
      <div key={i} className="flex gap-4 items-stretch md:items-start bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="w-28 min-h-[112px] md:w-40 md:min-h-0 md:h-auto md:aspect-video lg:w-48 bg-gray-200 flex-shrink-0 md:rounded-lg md:m-3 md:mr-0" />
        <div className="flex-grow py-2 pr-3">
          <div className="h-4 sm:h-5 w-full bg-gray-200 rounded mb-1" />
          <div className="h-4 sm:h-5 w-3/4 bg-gray-200 rounded mb-2" />
          <div className="h-3 w-full bg-gray-200 rounded mt-2 mb-1" />
          <div className="h-3 w-5/6 bg-gray-200 rounded mb-2" />
          <div className="flex flex-col gap-1 mt-3">
            <div className="h-2.5 w-1/3 bg-gray-200 rounded" />
            <div className="h-2.5 w-1/4 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const FeaturedLayout = ({ articles }: { articles: any[] }) => {
  const featured = articles[0];
  const others = articles.slice(1, 5);

  if (!featured) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Main Featured Article */}
      <div className="lg:col-span-7">
        <Link href={`/news/${featured.slug}`} className="group block relative aspect-video w-full rounded-2xl overflow-hidden shadow-lg">
          <Image
            src={getSafeImageUrl(featured.thumbnail)}
            alt={featured.title}
            fill
            sizes="(max-width: 1024px) 100vw, 900px"
            quality={100}
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
            <span className="inline-block bg-[#C9A227] text-white text-[10px] md:text-xs font-bold px-2 py-1 md:px-3 rounded-full mb-2">
              FEATURED
            </span>
            <h3 className="text-lg md:text-2xl font-bold text-white mb-2 leading-snug group-hover:text-[#C9A227] transition-colors line-clamp-2">
              {featured.title}
            </h3>
            <span className="text-[10px] md:text-xs text-gray-400 font-medium tracking-wide block mt-1">
              Author: {featured.authors || featured.advocateName || "Anonymous"}
            </span>
          </div>
        </Link>
      </div>

      {/* Side List */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {others.map((article) => (
          <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all">
            <div className="relative flex-shrink-0 rounded-lg overflow-hidden w-20 h-20 md:w-32 md:h-auto md:aspect-video lg:w-36">
              <Image
                src={getSafeImageUrl(article.thumbnail)}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 80px, (max-width: 1024px) 128px, 144px"
                quality={100}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm group-hover:text-[#C9A227] transition-colors line-clamp-2">
                {article.title}
              </h3>
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-[10px] text-gray-500">
                  Author: {article.authors || article.advocateName || "Anonymous"}
                </span>
                <span className="text-[10px] text-gray-400">
                  {formatDate(article.createdAt)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const FeaturedLayoutSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
    <div className="lg:col-span-7">
      <div className="aspect-video w-full rounded-2xl bg-gray-200 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
           <div className="h-5 w-20 bg-gray-300 rounded-full mb-3" />
           <div className="h-7 w-full bg-gray-300 rounded mb-2" />
           <div className="h-7 w-3/4 bg-gray-300 rounded mb-4" />
           <div className="h-3 w-1/3 bg-gray-300 rounded" />
        </div>
      </div>
    </div>
    <div className="lg:col-span-5 flex flex-col gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100">
          <div className="w-20 h-20 md:w-32 md:h-auto md:aspect-video lg:w-36 bg-gray-200 rounded-lg flex-shrink-0" />
          <div className="flex-grow">
             <div className="h-4 w-full bg-gray-200 rounded mb-2" />
             <div className="h-4 w-3/4 bg-gray-200 rounded mb-3" />
             <div className="h-2 w-1/3 bg-gray-200 rounded mb-1" />
             <div className="h-2 w-1/4 bg-gray-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SliderLayout = ({ articles, slug }: { articles: any[], slug: string }) => (
  <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
    {articles.map((article) => (
      <div key={article.id} className="min-w-[280px] md:min-w-[320px] snap-start">
        <ArticleCard article={article} compact />
      </div>
    ))}
    <Link 
      href={`/category/${slug}`} 
      className="min-w-[160px] md:min-w-[200px] snap-start flex flex-col items-center justify-center bg-gray-50/50 rounded-md border-2 border-dashed border-gray-200 hover:border-[#C9A227] hover:bg-gray-50 transition-all group"
    >
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform mb-3">
        <ChevronRight className="w-6 h-6 text-[#C9A227]" />
      </div>
      <span className="font-semibold text-gray-600 group-hover:text-[#C9A227]">View All</span>
    </Link>
  </div>
);

const SliderLayoutSkeleton = ({ limit }: { limit: number }) => (
  <div className="flex overflow-hidden pb-6 gap-6">
    {Array.from({ length: limit }).map((_, i) => (
      <div key={i} className="min-w-[280px] md:min-w-[320px]">
        <ArticleCardSkeleton compact={true} />
      </div>
    ))}
  </div>
);