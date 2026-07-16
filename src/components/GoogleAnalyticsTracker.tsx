"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only track if gtag is initialized
    if (pathname && typeof (window as any).gtag === "function") {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      
      // Send the pageview event to Google Analytics
      (window as any).gtag("config", "G-88RRSP2L7E", {
        page_path: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export default function GoogleAnalyticsTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
