import { useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollProps {
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  rootMargin?: string;
}

export const useInfiniteScroll = ({
  isLoading,
  hasMore,
  onLoadMore,
  rootMargin = '100px',
}: UseInfiniteScrollProps) => {
  const observer = useRef<IntersectionObserver | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (isLoading) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            onLoadMore();
          }
        },
        { rootMargin }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore, rootMargin]
  );

  return { lastElementRef };
};
