// Neutral page-height holder.
//
// Only for pages that have no skeleton of their own: the auth forms, the
// academy join page and the course player. Every other page uses its own
// skeleton instead (CourseSkeletonLayout, ArticleSkeleton, CategoryLoading,
// TagLoading, the CategorySection layouts, and so on).
//
// Why anything is needed here at all: pages that read the query string are
// excluded from the prerender, so React leaves a hole at that position in the
// static HTML and streams the real markup in afterwards. A zero-height hole
// pulls the footer up under the header on first paint.
//
// This deliberately draws nothing. These are forms, not data views, so there
// is no content shape worth faking: inventing card or table placeholders would
// just flash the wrong layout before the real form arrives. It only reserves
// height so the page keeps its proportions.

export default function RouteFallback() {
  return <div className="min-h-[70vh] w-full" aria-hidden="true" />;
}
