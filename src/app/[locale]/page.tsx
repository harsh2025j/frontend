"use client"
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState, useEffect } from "react";
import NewsCard from "@/components/ui/NewsCard";
import logo from "../../public/logo.png";
import CategorySection from "@/components/home/CategorySection";
import NewsSlider from "@/components/home/NewsSlider";
import Stores from "@/components/home/Stores";
import AdBanner from "@/components/ads/AdBanner";
import AdSidebar from "@/components/ads/AdSidebar";
// import AdsPopup from "@/components/ads/AdsPopup";
import NewsletterSubscription from "@/components/home/NewsletterSubscription";
import LegalTimeline from "@/components/home/LegalTimeline";
import { useDocTitle } from "@/hooks/useDocTitle";

// import LiveCourtUpdates from "@/components/home/LiveCourtUpdates";

export default function Home() {
  useDocTitle("Sajjad Husain Law Associates");

  const t = useTranslations('Home');


  // const [showAdPopup, setShowAdPopup] = useState(false);

  // useEffect(() => {
  //   // Show popup after 3 seconds
  //   const timer = setTimeout(() => {
  //     setShowAdPopup(true);
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <>
      {/* {showAdPopup && (
        <AdsPopup
          onClose={() => setShowAdPopup(false)}
          imageUrl="/sajjad-husain-ad.png"
          linkUrl="#"
        />
      )} */}
      <div className="bg-gray-50 min-h-screen">
        {/* Hero Section - NewsSlider */}
        <NewsSlider />

        {/* Stores Section */}
        <Stores />

        {/* Top Banner Ad */}
        <div className="container mx-auto px-4 py-8">
          <AdBanner
            size="large"
            imageUrl=""   //    /banner-top.png
            linkUrl="#"
          />
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
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">{t('sponsored')}</h3>
                  <AdSidebar
                    imageUrl=""   // /banner-expert-legal.jpg
                    linkUrl="#"
                  />
                </div>

                {/* Trending Ad */}
                <div className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">{t('trending')}</h3>
                  <AdSidebar
                    imageUrl=""   //   /banner-dream-explore.jpg
                    linkUrl="#"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner Ad */}
        <div className="container mx-auto px-4 py-8">
          <AdBanner
            size="large"
            imageUrl=""   //    /banner-bottom.png
            linkUrl="#"
          />
        </div>

        {/* Judgments Section */}
        <CategorySection
          title={t('judgments')}
          slug="judgments-content"
          layout="grid"
          limit={8}
        />

        {/* Legal Timeline - Commented */}
        {/* <LegalTimeline /> */}

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

        {/* Newsletter Subscription */}
        <div className="mt-12">
          <NewsletterSubscription />
        </div>
      </div>
    </>
  );
}
