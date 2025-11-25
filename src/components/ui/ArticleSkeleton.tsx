// components/ui/ArticleSkeleton.tsx

import React from 'react';

// This is a placeholder for a single card in a grid (like LatestNews or Judgement)
interface ArticleSkeletonProps {
  count?: number; // Number of skeleton cards to render
  isWide?: boolean; // For horizontal lists like ContentSlider
}

const ArticleSkeletonCard: React.FC = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse h-full p-4 border border-gray-100">
    {/* Image placeholder */}
    <div className="bg-gray-300 h-40 w-full mb-3 rounded-md"></div>
    {/* Title placeholder */}
    <div className="h-4 bg-gray-300 w-3/4 mb-2 rounded"></div>
    {/* Description lines */}
    <div className="h-3 bg-gray-200 w-full mb-1 rounded"></div>
    <div className="h-3 bg-gray-200 w-full mb-1 rounded"></div>
    <div className="h-3 bg-gray-200 w-1/2 rounded"></div>
  </div>
);

// This is a placeholder for a single card in a horizontal slider
const WideArticleSkeletonCard: React.FC = () => (
    <div className="p-4 bg-white rounded-md shadow-sm animate-pulse w-[300px] flex-shrink-0 border border-gray-100">
        <div className="h-20 bg-gray-300 w-full mb-3 rounded"></div>
        <div className="h-4 bg-gray-300 w-full mb-2 rounded"></div>
        <div className="h-3 bg-gray-200 w-3/4 rounded"></div>
    </div>
);


const ArticleSkeleton: React.FC<ArticleSkeletonProps> = ({ count = 3, isWide = false }) => {
    const SkeletonItem = isWide ? WideArticleSkeletonCard : ArticleSkeletonCard;

    return (
        <div className={isWide ? "flex gap-4 overflow-hidden" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </div>
    );
};

export default ArticleSkeleton;