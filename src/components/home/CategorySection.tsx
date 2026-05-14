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
}

export default function CategorySection({ title, slug, layout, limit = 6 }: CategorySectionProps) {
  const homeData = useHomeData();
  const { articles: reduxArticles, loading: reduxLoading } = useCategoryArticles(slug, limit);

  // Use server articles if available for this specific category
  const initialArticles = useMemo(() => {
    if (!homeData) return [];
    if (slug === 'finance-articles') return Array.isArray(homeData.financeArticles) ? homeData.financeArticles : [];
    if (slug === 'legal-articles') return Array.isArray(homeData.legalArticles) ? homeData.legalArticles : [];
    if (slug === 'hindi-news') return Array.isArray(homeData.hindiArticles) ? homeData.hindiArticles : [];
    if (slug === 'latest-news') return Array.isArray(homeData.latestArticles) ? homeData.latestArticles : [];
    return [];
  }, [homeData, slug]);


  const articles = useMemo(() => {
    const base = (Array.isArray(reduxArticles) && reduxArticles.length > 0) ? reduxArticles : initialArticles;
    return Array.isArray(base) ? base.filter((a: any) => a && a.status === 'published') : [];
  }, [reduxArticles, initialArticles]);

  const loading = reduxLoading && reduxArticles.length === 0 && initialArticles.length === 0;


  if (loading) return <div className="py-10 flex justify-center"><Loader /></div>;

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
          <Link
            href={`/category/${slug}`}
            className="flex items-center text-sm font-semibold text-[#C9A227] hover:text-[#b39022] transition-colors group"
          >
            View All <ChevronRight size={16} className="ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Layouts - Using articles directly */}
        {layout === "grid" && <GridLayout articles={articles} />}
        {layout === "list" && <ListLayout articles={articles} />}
        {layout === "featured" && <FeaturedLayout articles={articles} />}
        {layout === "slider" && <SliderLayout articles={articles} />}
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
            {article.subHeadline || article.content.replace(/<[^>]*>/g, "").substring(0, 100)}...
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

const GridLayout = ({ articles }: { articles: any[] }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
    {articles.slice(0, 8).map((article) => (
      <ArticleCard key={article.id} article={article} />
    ))}
  </div>
);

const ListLayout = ({ articles }: { articles: any[] }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {articles.map((article) => (
      <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-4 items-start bg-white rounded-xl border border-gray-100 hover:shadow-md transition-all">
        <div className="relative w-27 h-27 flex-shrink-0 rounded-l-lg overflow-hidden">
          <div className="w-28 h-28 relative">
            <Image
              src={getSafeImageUrl(article.thumbnail)}
              alt={article.title}
              fill
              sizes="112px"
              quality={100}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </div>
        <div className="flex-grow py-2 pr-3">
          <h2 className="font-bold text-gray-900 group-hover:text-[#C9A227] transition-colors line-clamp-2 mb-1">
            {article.title}
          </h2>
          <p className="text-xs text-gray-500 line-clamp-1">
            {article.subHeadline || article.content.replace(/<[^>]*>/g, "").substring(0, 80)}...
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
            <span className="inline-block bg-[#C9A227] text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
              FEATURED
            </span>
            <h3 className="text-2xl md:text-4xl font-bold text-white mb-3 leading-tight group-hover:text-[#C9A227] transition-colors">
              {featured.title}
            </h3>
            <p className="text-gray-300 text-sm md:text-base line-clamp-2 max-w-2xl mb-2">
              {featured.subHeadline || featured.content.replace(/<[^>]*>/g, "").substring(0, 150)}...
            </p>
            <span className="text-xs text-gray-400 font-medium tracking-wide">
              Author: {featured.authors || featured.advocateName || "Anonymous"}
            </span>
          </div>
        </Link>
      </div>

      {/* Side List */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        {others.map((article) => (
          <Link key={article.id} href={`/news/${article.slug}`} className="group flex gap-4 items-center bg-white p-3 rounded-xl border border-gray-100 hover:shadow-md transition-all">
            <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
              <Image
                src={getSafeImageUrl(article.thumbnail)}
                alt={article.title}
                fill
                sizes="120px"
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

const SliderLayout = ({ articles }: { articles: any[] }) => (
  <div className="flex overflow-x-auto pb-6 gap-6 snap-x scrollbar-hide">
    {articles.map((article) => (
      <div key={article.id} className="min-w-[280px] md:min-w-[320px] snap-start">
        <ArticleCard article={article} compact />
      </div>
    ))}
  </div>
);