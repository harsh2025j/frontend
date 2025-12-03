// app/page.tsx OR pages/index.tsx
import Image from "next/image";
import NewsCard from "@/components/ui/NewsCard";
import logo from "../../public/logo.png";
import CategorySection from "@/components/home/CategorySection";
import NewsSlider from "@/components/home/NewsSlider";
import Stores from "@/components/home/Stores";
import AdBanner from "@/components/ads/AdBanner";
import AdSidebar from "@/components/ads/AdSidebar";
import NewsletterSubscription from "@/components/home/NewsletterSubscription";
import LegalTimeline from "@/components/home/LegalTimeline";
// import LiveCourtUpdates from "@/components/home/LiveCourtUpdates";

export default function Home() {
  return (
    <>
      <div className="bg-gray-50 min-h-screen pb-0">
        <NewsSlider />
        <Stores />

        <div className="container mx-auto px-4 mt-8 mb-4">
          <AdBanner size="medium" />
        </div>

        <CategorySection
          title="Supreme Court"
          slug="supreme-court"
          layout="featured"
          limit={5}
        />

        <CategorySection
          title="High Court"
          slug="high-court"
          layout="list"
          limit={6}
        />

        <div className="container mx-auto px-4 my-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <div className="lg:col-span-2 space-y-12">
              <CategorySection
                title="Business"
                slug="business-article"
                layout="grid"
                limit={4}
              />

              <CategorySection
                title="Crime"
                slug="crime-news"
                layout="list"
                limit={4}
              />
            </div>

            {/* Sidebar Column */}
            <div className="space-y-8">
              <div className="sticky top-24">
                <div className=" p-4 rounded-md border border-gray-100  mb-6">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Sponsored</h3>
                  <AdSidebar />
                </div>

                <div className=" p-4 rounded-xl border border-gray-100 ">
                  <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wider">Trending</h3>
                  <AdSidebar />
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="container mx-auto px-4 my-8">
          <AdBanner size="large" />
        </div>

        <CategorySection
          title="Judgments"
          slug="judgments-content"
          layout="grid"
          limit={6}
        />

        {/* <LegalTimeline /> */}

        <CategorySection
          title="Hindi News"
          slug="hindi-news"
          layout="slider"
          limit={8}
        />

        <CategorySection
          title="More Latest News"
          slug="latest-news"
          layout="grid"
          limit={9}
        />

        <NewsletterSubscription />
      </div>
    </>
  );
}
