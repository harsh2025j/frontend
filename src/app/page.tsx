// app/page.tsx OR pages/index.tsx
import Image from "next/image";
import NewsCard from "@/components/ui/NewsCard";
import logo from "../../public/logo.svg";
import Stores from "@/components/home/Stores";
import CategorySection from "@/components/home/CategorySection";
import LiveCourtUpdates from "@/components/home/LiveCourtUpdates";
import NewsSlider from "@/components/home/NewsSlider";
import ContentSlider from "@/components/home/ContentSlider";

export default function Home() {
  return (
    <>
      <div className=" ">
        <NewsSlider/>
      <Stores />
      {/* <CategorySection /> */}
      {/* <LiveCourtUpdates /> */}
      
      
      </div>
    </>
  );
}
