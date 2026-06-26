"use client"
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/data/redux/store";
import { isAdmin as checkIsAdmin } from "@/utils/permissions";
import CategorySection from "@/components/home/CategorySection";
import NewsSlider from "@/components/home/NewsSlider";
import Stores from "@/components/home/Stores";
import { AdBanner, AdSidebar, useAdvertisement, useSlotVisibility } from "@/components/ads/StandardAds";
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

  const { isSlotEnabled: sidebar1Enabled, settingsLoading: settingsLoading1 } = useSlotVisibility("HOME_SIDEBAR_1");
  const { isSlotEnabled: sidebar2Enabled, settingsLoading: settingsLoading2 } = useSlotVisibility("HOME_SIDEBAR_2");

  const showSidebar = !isPremiumOrAdmin && (
    (sidebar1 && sidebar1.isActive) ||
    (sidebar2 && sidebar2.isActive) ||
    sidebar1Enabled ||
    sidebar2Enabled ||
    loading1 ||
    loading2 ||
    settingsLoading1 ||
    settingsLoading2
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

        {/* Allahabad High Court Section */}
        <CategorySection
          title={t('allahabad_high_court') || "Allahabad High Court"}
          slug="allahabad-high-court"
          layout="grid"
          limit={8}
        />

        {/* Delhi High Court Section */}
        <CategorySection
          title={t('delhi_high_court') || "Delhi High Court"}
          slug="delhi-high-court"
          layout="grid"
          limit={8}
        />

        {/* Bombay High Court Section */}
        <CategorySection
          title={t('bombay_high_court') || "Bombay High Court"}
          slug="bombay-high-court"
          layout="grid"
          limit={8}
        />

        {/* Kerala High Court Section */}
        <CategorySection
          title={t('kerala_high_court') || "Kerala High Court"}
          slug="kerala-high-court"
          layout="grid"
          limit={8}
        />

        {/* Andhra Pradesh High Court Section */}
        <CategorySection
          title={t('andhra_pradesh_high_court') || "Andhra Pradesh High Court"}
          slug="andhra-pradesh-high-court"
          layout="grid"
          limit={8}
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
                limit={8}
              />

              <CategorySection
                title={t('crime')}
                slug="crime-news"
                layout="list"
                limit={6}
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
          slug="judgments"
          layout="grid"
          limit={8}
          page={2}
        />

        {/* Hindi News Section */}
        <CategorySection
          title={t('hindi_news')}
          slug="hindi-news"
          layout="slider"
          limit={8}
          page={2}
        />

        {/* More Latest News Section */}
        <CategorySection
          title={t('more_latest_news')}
          slug="latest-news"
          layout="grid"
          limit={8}
          showViewMoreButton={true}
          page={2}
        />

        {/* More Legal News Section */}
        <CategorySection
          title={t('more_legal_news') || "More Legal News"}
          slug="legal-articles"
          layout="grid"
          limit={8}
          showViewMoreButton={true}
          page={2}
        />

        {/* More Judgments Section */}
        <CategorySection
          title={t('more_judgments') || "More Judgments"}
          slug="judgments"
          layout="grid"
          limit={8}
          showViewMoreButton={true}
          page={3}
        />
      </div>
    </>
  );
}
