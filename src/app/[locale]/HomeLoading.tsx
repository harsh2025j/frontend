"use client";

// Home page skeleton.
//
// NOT named loading.tsx on purpose. A loading.tsx at [locale] is the route-level
// loading UI for EVERY nested route, so the home skeleton leaked onto admin,
// academy and everything else. It is a plain component used only as the
// Suspense fallback in this segment page.tsx.
//
// Built from the SAME section skeletons the home page itself uses
// (GridSkeleton / ListLayoutSkeleton / FeaturedLayoutSkeleton from
// CategorySection), so the placeholder matches the real layout instead of
// being a separate approximation that drifts out of sync.
//
// Used in two places:
//  1. Next.js route-level loading UI for `/[locale]`.
//  2. The Suspense fallback around <HomeClient /> in page.tsx.
//
// (2) is the one that matters. HomeClient reads the query string, so it is
// excluded from the prerender: React leaves a hole at that position in the
// static HTML and streams the real markup in afterwards. With an empty
// fallback that hole had zero height and the footer slid up under the header
// on first paint.

import {
  GridSkeleton,
  ListLayoutSkeleton,
  FeaturedLayoutSkeleton,
} from "@/components/home/CategorySection";

function SectionShell({
  width = "w-52",
  children,
}: {
  width?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-8 border-b border-gray-100 last:border-0">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold relative pl-4">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#C9A227] rounded-full" />
            <span className={`block h-7 ${width} bg-gray-200 rounded animate-pulse`} />
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function HomeLoading() {
  return (
    <div className="bg-gray-50 min-h-screen" aria-hidden="true">

      {/* NewsSlider hero.
          Mirrors the real slider: navy #0A2342 band, same heights, same
          1.2fr/1fr grid, image left and article text right. Placeholder blocks
          are white-on-navy so the band reads as the finished hero rather than
          a grey box that repaints dark a moment later. */}
      <section className="relative w-full min-h-[700px] md:min-h-[570px] lg:h-[570px] bg-[#0A2342] overflow-hidden">
        <div className="container relative z-10 mx-auto h-full px-2 md:px-3 flex items-center py-6 md:py-10 lg:py-0">
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 lg:gap-20 items-center animate-pulse">

            {/* Article image */}
            <div className="relative flex justify-center lg:justify-start">
              <div className="w-full max-w-[100vw] md:max-w-[90vw] lg:min-h-[400px] aspect-[16/9] rounded-[15px] md:rounded-[20px] bg-white/10 border border-white/10" />
            </div>

            {/* Article text */}
            <div className="flex flex-col h-full lg:min-h-[550px] justify-center lg:justify-start lg:py-16">
              <div className="flex items-center gap-4 mb-4 lg:mb-6">
                <div className="h-3 w-28 rounded bg-[#C9A227]/40" />
                <div className="hidden lg:block flex-1 h-px bg-white/10" />
              </div>

              {/* Headline */}
              <div className="lg:min-h-[170px] space-y-3 mb-4 lg:mb-3">
                <div className="h-8 lg:h-10 w-full rounded bg-white/15" />
                <div className="h-8 lg:h-10 w-11/12 rounded bg-white/15" />
                <div className="h-8 lg:h-10 w-2/3 rounded bg-white/15" />
              </div>

              {/* Standfirst */}
              <div className="lg:min-h-[80px] space-y-2 mb-2 lg:mb-6">
                <div className="h-3.5 w-full rounded bg-white/10" />
                <div className="h-3.5 w-10/12 rounded bg-white/10" />
              </div>

              {/* CTA + arrows */}
              <div className="mt-2 lg:mt-auto pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-center lg:justify-between gap-6">
                <div className="h-12 lg:h-14 w-48 rounded-full bg-[#C9A227]/40" />
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-white/10 bg-white/5" />
                  <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full border border-white/10 bg-white/5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top banner ad slot */}
      <div className="container mx-auto px-4 py-6 animate-pulse">
        <div className="mx-auto h-[90px] w-full max-w-[728px] rounded-lg bg-gray-100 border border-gray-200" />
      </div>

      {/* Supreme Court — featured layout, matches the real section */}
      <SectionShell width="w-56">
        <FeaturedLayoutSkeleton />
      </SectionShell>

      {/* High Court — list layout */}
      <SectionShell width="w-48">
        <ListLayoutSkeleton limit={6} />
      </SectionShell>

      {/* Court sections — grid layout */}
      <SectionShell width="w-64">
        <GridSkeleton limit={4} />
      </SectionShell>

      <SectionShell width="w-52">
        <GridSkeleton limit={4} />
      </SectionShell>
    </div>
  );
}
