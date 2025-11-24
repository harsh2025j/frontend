'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import NewsCard from "../ui/NewsCard";
import Image from "next/image";
import img from "../../../public/stories.jpeg";
import Button from "../ui/Button";
import NewsScroller from "../ui/NewsScroller";
import AiPoweredFeatures from "../ui/AiPoweredFeatures";
import ContentSlider from "@/components/home/ContentSlider";
import LatestNews from "../ui/LatestNews";
import Judgement from "../ui/judgement";
import UniversalSelect from "../ui/universalSelector";
import TopAdvocate from "../ui/TopAdvocate"
import LiveCourt from "../ui/LiveCourt"
import HindiNews from "../ui/HindiNews";
import CustomInput from "../ui/CustomInput"
import StateJudgement from "../ui/stateJudgement";
import HighCourtsModal from "../ui/HighCourtsModal";
import icon1 from '../../assets/icon1.png';
import icon2 from '../../assets/icon2.png';
import icon3 from '../../assets/icon3.png';
import icon4 from '../../assets/icon4.png';
import img1 from '../../assets/img1.png';
import { useArticleListActions } from "@/data/features/article/useArticleActions";
import { highCourts } from "@/data/highCourts";




export default function Stores() {
  const router = useRouter();
  const [SearchData, setSearchData] = useState({ Search: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchChange = (e: any) => {
    setSearchData({ ...SearchData, [e.target.name]: e.target.value });
  };

  const handleSearchClick = () => {
    router.push('/ai-assistant');
  };

  //fetching data from backend
  const { articles } = useArticleListActions();

  //for latest news
  const filteredLatestNews = articles
    .filter((item: any) => item.category?.name === "LatestNews") // filter by category
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  // Typewriter Logic
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(100);

  const newsHeadlines = articles.length > 0
    ? articles.map((a: any) => a.title)
    : [
      "JP Morgan's Jamie Dimon said he was 'far more worried than others' about the potential for a stock market correction.",
      "Breaking: AI Revolutionizing Legal Tech Industry in 2025",
      "Supreme Court issues new guidelines for digital evidence submission"
    ];

  React.useEffect(() => {
    const handleType = () => {
      const i = loopNum % newsHeadlines.length;
      const fullText = newsHeadlines[i];

      setCurrentText(isDeleting
        ? fullText.substring(0, currentText.length - 1)
        : fullText.substring(0, currentText.length + 1)
      );

      if (!isDeleting && currentText === fullText) {
        setTypingSpeed(2000); // Pause at end
        setIsDeleting(true);
      } else if (isDeleting && currentText === "") {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500); // Pause before start
      } else {
        setTypingSpeed(isDeleting ? 30 : 50); // Typing speeds
      }
    };

    const timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, loopNum, newsHeadlines, typingSpeed]);

  return (
    <div className="bg-[#f6f6f7]">
      <div className="w-full">

        {/* Live News Banner */}
        <div className="border-2 border-dotted border-[#000000] min-h-14 my-3 md:my-5 flex flex-col sm:flex-row bg-white">
          <div className="w-full sm:w-40 h-full min-h-14 flex justify-center items-center bg-[#0A2342] text-white text-sm md:text-md py-2 sm:py-0 shrink-0">
            Live News
          </div>
          <div className="flex items-center px-3 sm:px-5 py-2 sm:py-0 w-full overflow-hidden">
            <p className="text-xs sm:text-sm md:text-base text-center sm:text-left font-medium text-gray-800 whitespace-nowrap">
              {currentText}
              <span className="animate-pulse">|</span>
            </p>
          </div>
        </div>

        {/* Universal Selectors */}
        <div className="container mx-auto px-4 mb-3 md:mb-5">
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            <UniversalSelect name="Case Status" options={[]} />
            <UniversalSelect name="Case List" options={[]} />
            <UniversalSelect name="Reports" options={[]} />
            <UniversalSelect name="Judgment" options={[]} />
            <UniversalSelect name="Display Boards" options={[]} />
            <UniversalSelect name="Judges" options={[]} />
          </div>
        </div>


        {/* Search Section with High Courts */}
        <div className="bg-white w-full flex justify-center mb-6 md:mb-10">
          <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-10">

            {/* Search Bar */}
            <div className="w-full flex justify-center items-center mb-8 md:mb-10">
              <div className="relative w-full max-w-[700px]">
                <CustomInput
                  name="Search"
                  value={SearchData.Search}
                  onChange={handleSearchChange}
                  placeholder="Search any Legal question or track a case..."
                  className="
                    bg-[#f6f6f7] 
                    w-full 
                    pl-10 sm:pl-12 pr-12 sm:pr-14
                    py-2 sm:py-3 
                    text-sm sm:text-base md:text-lg
                    rounded-xl
                  "
                />

                <button
                  type="button"
                  onClick={handleSearchClick}
                  className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 cursor-pointer hover:scale-110 transition-transform"
                >
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 bg-[#f6f6f7] text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35m1.35-5.65a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* High Courts Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-4 md:gap-6">
              {highCourts.slice(0, 8).map((court) => (
                <StateJudgement key={court.id} img={court.image} state={court.name} />
              ))}
            </div>

            {/* Show More Button */}
            <div className="flex justify-center mt-6 md:mt-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-[#0A2342] text-white text-sm sm:text-base rounded-lg hover:bg-[#1a3a75] transition-all duration-300 font-medium shadow-md hover:shadow-lg transform hover:scale-105"
              >
                Show All High Courts
              </button>
            </div>

          </div>
        </div>

        {/* High Courts Modal */}
        <HighCourtsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />


        {/* Live Court & Top Advocate Section */}
        <div className="flex justify-center px-4 mb-6 md:mb-10">
          <div className="container flex flex-col lg:flex-row gap-4 md:gap-6">

            {/* Live Court */}
            <div className="flex flex-col gap-3 md:gap-4 w-full lg:flex-1">
              <div className="flex justify-between items-center">
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-merriweather">
                  Live Court
                </h1>
              </div>
              <LiveCourt />
            </div>

            {/* Top Advocate */}
            <div className="flex flex-col gap-3 md:gap-4 w-full lg:max-w-[600px]">
              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold font-merriweather">
                  Top Advocate
                </h1>
              </div>

              <div className="flex flex-col p-4 sm:p-5 bg-white justify-evenly transition-all duration-300 rounded-sm h-full gap-3">
                <TopAdvocate
                  img={icon1}
                  title="Mr. Gopal Sankaranarayanan,"
                  description="Senior Advocate (For Petitioners)"
                />
                <TopAdvocate
                  img={icon1}
                  title="Mr. Gopal Sankaranarayanan,"
                  description="Senior Advocate (For Petitioners)"
                />
                <TopAdvocate
                  img={icon1}
                  title="Mr. Gopal Sankaranarayanan,"
                  description="Senior Advocate (For Petitioners)"
                />
              </div>
            </div>

          </div>
        </div>

        {/* AI Powered Features */}
        <div className="w-full">
          <div className="flex items-center justify-center my-6 md:my-10 px-4">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black text-center">
              AI Powered Features
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="bg-white flex justify-center px-4">
            <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 my-6 md:my-10 py-6 md:py-10">
              <AiPoweredFeatures heading="AI LEGAL Summarizer" description="Convert lengthy case file into digestible 2-minute brifs without loosing context " img={icon1} />
              <AiPoweredFeatures heading="Real Time Court News" description="Verified updates aggregated from trust judicial and legal sources." img={icon2} />
              <AiPoweredFeatures heading="Smart Law Library" description="Search case by topic, year, bench, act with precision filters. " img={icon3} />
              <AiPoweredFeatures heading="AI Suggestions" description="Gen related precedents and judgments automatically, trailered to your query." img={icon4} />
            </div>
          </div>
        </div>

        {/* Latest News & Judgments */}
        <div className="w-full px-4">
          <div className="flex items-center justify-center my-6 md:my-10">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black text-center whitespace-nowrap">
              Latest News & Judgments
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="flex justify-center">
            <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredLatestNews.slice(0, 3).map((data: any) => (
                <LatestNews
                  key={data.id}
                  img={data.thumbnail}
                  title={data.title}
                  slug={data.slug}
                  button1Text="Read Full Case"
                  button2Text="AI Summary"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Judgments Grid */}
        <div className="flex justify-center px-4 my-6 md:my-12">
          <div className="container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Judgement img={img1} description="In a development with significant ramifications in Kerala and Tamil Nadu (TN), the Supreme Court on Monday issued notice to the Central government....." />
            <Judgement img={img1} description="In a development with significant ramifications in Kerala and Tamil Nadu (TN), the Supreme Court on Monday issued notice to the Central government....." />
            <Judgement img={img1} description="In a development with significant ramifications in Kerala and Tamil Nadu (TN), the Supreme Court on Monday issued notice to the Central government....." />
          </div>
        </div>

        <div className="flex justify-center mb-6 md:mb-10">
          <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base" />
        </div>

        {/* Hindi News */}
        <div className="w-full px-4">
          <div className="flex items-center justify-center mt-6 md:mt-10 mb-4 md:mb-5">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black">
              Hindi News
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="flex justify-center">
            <div className="container flex flex-col gap-4 sm:gap-6">
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है, हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है,हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है,हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है,हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
            </div>
          </div>
        </div>

        <div className="flex justify-center mb-6 md:mb-10">
          <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base mt-4 md:mt-5" />
        </div>

        {/* Articles */}
        <div className="px-4">
          <div className="flex items-center justify-center mt-6 md:mt-10 mb-4 md:mb-5">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-3 sm:px-4 text-base sm:text-lg md:text-xl font-merriweather font-semibold text-black">
              Article
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>
          <ContentSlider />
          <ContentSlider />
        </div>

        <div className="flex justify-center mb-10 md:mb-20">
          <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 sm:px-6 py-1 sm:py-2 text-sm sm:text-base mt-4 md:mt-5" />
        </div>

      </div>
    </div>
  );
}