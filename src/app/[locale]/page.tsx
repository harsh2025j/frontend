"use client"
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import CategorySection from "@/components/home/CategorySection";
import NewsSlider from "@/components/home/NewsSlider";
import Stores from "@/components/home/Stores";
import { AdBanner, AdSidebar } from "@/components/ads/StandardAds";
import { useDocTitle } from "@/hooks/useDocTitle";

export default function Home() {
  useDocTitle("Sajjad Husain Law Associates");
  const t = useTranslations('Home');

  return (
    <>
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section - NewsSlider */}
        <NewsSlider />

        {/* Stores Section */}
        <Stores />

        {/* Top Banner Ads */}
        <div className="container mx-auto px-4 py-8 space-y-4">
          {/* <AdBanner slotId="HOME_BANNER_TOP_1" /> */}
          <AdBanner slotId="HOME_BANNER_TOP_2" />
        </div>

        {/* Supreme Court Section */}
        <CategorySection
          title={t('supreme_court')}
          slug="supreme-court"
          layout="featured"
          limit={5}
        />

        {/* High Court Section */}
        <CategorySection
          title={t('high_court')}
          slug="high-court"
          layout="list"
          limit={6}
        />

        {/* Main Content Grid with Sidebar */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Column */}
            <div className="lg:col-span-2 space-y-12">
              <CategorySection
                title={t('business')}
                slug="business-article"
                layout="grid"
                limit={4}
              />

              <CategorySection
                title={t('crime')}
                slug="crime-news"
                layout="list"
                limit={4}
              />
            </div>

            {/* Sidebar Column */}
            <div className="space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Sponsored Ad */}
                <AdSidebar slotId="HOME_SIDEBAR_1" withContainer />

                {/* Trending Ad */}
                <AdSidebar slotId="HOME_SIDEBAR_2" withContainer />
              </div>
            </div>
          </div>
        </div>



        {/* Judgments Section */}
        <CategorySection
          title={t('judgments')}
          slug="judgments-content"
          layout="grid"
          limit={8}
        />

        {/* Hindi News Section */}
        <CategorySection
          title={t('hindi_news')}
          slug="hindi-news"
          layout="slider"
          limit={8}
        />

        {/* More Latest News Section */}
        <CategorySection
          title={t('more_latest_news')}
          slug="latest-news"
          layout="grid"
          limit={8}
        />
      </div>
    </>
  );
}
