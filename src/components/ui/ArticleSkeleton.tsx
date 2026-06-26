import React from 'react';

interface ArticleSkeletonProps {
  count?: number;
  isWide?: boolean;
  type?: "latest" | "judgement" | "hindi" | "wide" | "slider";
  noWrapper?: boolean;
  name?: string; // For slider label
}

const ContentSliderCardSkeleton: React.FC = () => (
  <div className="min-w-[260px] max-w-[260px] bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden animate-pulse">
    <div className="bg-gray-300 h-[160px] w-full"></div>
    <div className="p-3 h-[80px] flex items-center justify-center flex-col gap-2">
      <div className="h-3 bg-gray-300 w-full rounded"></div>
      <div className="h-3 bg-gray-200 w-3/4 rounded"></div>
    </div>
  </div>
);

const LatestNewsSkeleton: React.FC = () => (
  <div className="bg-white rounded-md overflow-hidden animate-pulse flex flex-col border border-gray-200 p-0 h-full">
    <div className="w-full aspect-video bg-gray-300 shrink-0"></div>
    <div className="flex flex-col p-3 sm:p-4 flex-grow">
      <div className="h-4 sm:h-5 bg-gray-300 w-full mb-2 rounded"></div>
      <div className="h-4 sm:h-5 bg-gray-300 w-3/4 mb-3 rounded"></div>
      
      <div className="flex gap-2 mb-3 mt-auto pt-2">
        <div className="h-3 sm:h-4 bg-gray-200 w-1/3 rounded"></div>
        <div className="h-3 sm:h-4 bg-gray-200 w-1/4 rounded"></div>
      </div>
      
      <div className="flex gap-3">
        <div className="h-9 bg-gray-300 w-[120px] rounded-md"></div>
      </div>
    </div>
  </div>
);

const JudgementSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl overflow-hidden animate-pulse flex flex-col border border-gray-100 h-full">
    <div className="bg-gray-300 w-full aspect-video flex-shrink-0"></div>
    <div className="flex flex-col p-4 flex-1">
      <div className="h-4 bg-gray-300 w-full mb-3 rounded"></div>
      <div className="h-4 bg-gray-300 w-3/4 mb-4 rounded"></div>
      
      <div className="h-3 bg-gray-200 w-full mb-2 rounded"></div>
      <div className="h-3 bg-gray-200 w-full mb-2 rounded"></div>
      <div className="h-3 bg-gray-200 w-4/5 mb-4 rounded"></div>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
        <div className="h-3 bg-gray-200 w-1/3 rounded"></div>
        <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
      </div>
    </div>
  </div>
);

const HindiNewsSkeleton: React.FC = () => (
  <div className="bg-white rounded-md animate-pulse flex flex-row gap-6 justify-between w-full h-auto border-1 my-5 border border-gray-200">
    <div className="bg-gray-300 rounded-l-md w-[25%] h-[120px] sm:h-[160px]"></div>
    <div className="flex flex-col w-[75%] pr-3 pt-3">
      <div className="h-6 bg-gray-300 w-full mb-4 rounded"></div>
      <div className="h-3 bg-gray-200 w-full mb-2 rounded"></div>
      <div className="h-3 bg-gray-200 w-full mb-2 rounded"></div>
      <div className="h-3 bg-gray-200 w-3/4 mb-2 rounded"></div>
    </div>
  </div>
);

const WideArticleSkeletonCard: React.FC = () => (
  <div className="p-4 bg-white rounded-md shadow-sm animate-pulse w-[300px] flex-shrink-0 border border-gray-100">
    <div className="h-20 bg-gray-300 w-full mb-3 rounded"></div>
    <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
    <div className="h-3 bg-gray-200 w-3/4 rounded"></div>
  </div>
);

const ArticleSkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-full p-4 border border-gray-100">
    <div className="bg-gray-300 h-40 w-full mb-3 rounded-md"></div>
    <div className="h-4 bg-gray-300 w-3/4 mb-2 rounded"></div>
    <div className="h-3 bg-gray-200 w-full mb-1 rounded"></div>
    <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
  </div>
);

const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ 
  count = 3, 
  isWide = false, 
  type, 
  noWrapper = false,
  name
}) => {
  const getSkeleton = () => {
    switch (type) {
      case "latest": return LatestNewsSkeleton;
      case "judgement": return JudgementSkeleton;
      case "hindi": return HindiNewsSkeleton;
      case "wide": return WideArticleSkeletonCard;
      case "slider": return ContentSliderCardSkeleton;
      default: return isWide ? WideArticleSkeletonCard : ArticleSkeletonCard;
    }
  };

  const SkeletonItem = getSkeleton();

  if (noWrapper) {
    return (
      <>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonItem key={index} />
        ))}
      </>
    );
  }

  // Entire Slider Layout
  if (type === "slider") {
    return (
      <div className="p-4 md:p-6 bg-[#f6f6f7] flex items-center justify-center relative my-4">
        <div className="w-full container bg-white rounded-md p-3 flex gap-4 relative">
          <div className="bg-[#1b3550] rounded-lg w-12 sm:w-24 md:w-40 flex items-center justify-center flex-shrink-0 animate-pulse">
            <span
              className="text-white text-lg sm:text-xl md:text-2xl font-medium tracking-wider whitespace-nowrap opacity-50"
              style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
            >
              {name || "CATEGORY"}
            </span>
          </div>
          <div className="flex gap-4 overflow-hidden py-3 flex-1">
            {Array.from({ length: 4 }).map((_, index) => (
              <ContentSliderCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const gridClass = {
    latest: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6",
    judgement: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6",
    hindi: "flex flex-col",
    wide: "flex gap-4 overflow-hidden",
  }[type || (isWide ? "wide" : "latest")] || "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6";

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonItem key={index} />
      ))}
    </div>
  );
};

export default ArticleSkeleton;