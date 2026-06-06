"use client"
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";
import { isAdmin as checkIsAdmin } from "@/utils/permissions";
import CategorySection from "@/components/home/CategorySection";
import NewsSlider from "@/components/home/NewsSlider";
import Stores from "@/components/home/Stores";
import { AdBanner, AdSidebar, useAdvertisement } from "@/components/ads/StandardAds";
import { useDocTitle } from "@/hooks/useDocTitle";

export default function Home() {
  useDocTitle("Sajjad Husain Law Associates");
  const t = useTranslations('Home');

  // Ad Sidebar Visibility Logic
  const { currentSubscription } = useSelector((state: RootState) => state.subscription);
  const { user } = useSelector((state: RootState) => state.auth);
  const isPremiumOrAdmin = currentSubscription?.status === 'active' || checkIsAdmin(user as any);

  const { ad: sidebar1, loading: loading1 } = useAdvertisement("HOME_SIDEBAR_1");
  const { ad: sidebar2, loading: loading2 } = useAdvertisement("HOME_SIDEBAR_2");

  const showSidebar = !isPremiumOrAdmin && (
    (sidebar1 && sidebar1.isActive) || 
    (sidebar2 && sidebar2.isActive) || 
    loading1 || 
    loading2
  );

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
            <div className={`space-y-12 ${showSidebar ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
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
            {showSidebar && (
              <div className="space-y-6 lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Sponsored Ad */}
                  <AdSidebar slotId="HOME_SIDEBAR_1" withContainer />

                  {/* Trending Ad */}
                  <AdSidebar slotId="HOME_SIDEBAR_2" withContainer />
                </div>
              </div>
            )}
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
