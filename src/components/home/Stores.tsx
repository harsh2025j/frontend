'use client'
import React, { useState } from "react";
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
import { items, LLS } from "@/lib/dummy";
import icon1 from '../../assets/icon1.png';
import icon2 from '../../assets/icon2.png';
import icon3 from '../../assets/icon3.png';
import icon4 from '../../assets/icon4.png';
import img1 from '../../assets/img1.png';
import newsImage1 from '../../assets/newsImage1.png';
import { useLoginActions } from "@/data/features/auth/useAuthActions";
import { Article } from "@/data/features/article/article.types";
import { useArticleListActions } from "@/data/features/article/useArticleActions";





export default function Stores() {
  const [SearchData, setSearchData] = useState({ Search: "" });

  const handleSearchChange = (e: any) => {
    setSearchData({ ...SearchData, [e.target.name]: e.target.value });
  };

  //fetching data from backend
  const { articles } = useArticleListActions();

  //for latest news
  const filteredLatestNews = articles
    .filter((item: any) => item.category?.name === "LatestNews") // filter by category
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());



  return (
    <div className="bg-[#f6f6f7]">
      <div className="w-[100vw] ">

        <div className="border-2 border-dotted border-[#000000] h-14  my-5 flex ">
          <div className=" w-40 h-full flex justify-center items-center   bg-[#0A2342]  text-white text-md ">
            Live News
          </div>
          <div className="flex justify-center items-center px-5 ">
            <p className="line-clamp-1 sm:text-md text-xs ">
              JP Morgan's Jamie Dimon said he was "far more worried than others"
              about the potential for a stock market correction.
            </p>

          </div>
        </div>
        <div className="container justify-center  mx-auto flex mb-5 ">
          <div className=" justify-center gap-2 flex">
            <UniversalSelect
              name="Case Status"
              options={[]}
            />
            <UniversalSelect
              name="Case List"
              options={[]} />
            <UniversalSelect
              name="Reports"
              options={[]} />

            <UniversalSelect
              name="Judgment"
              options={[]} />

            <UniversalSelect
              name="Display Boards"
              options={[]} />

            <UniversalSelect
              name="Judges"
              options={[]} />

          </div>
        </div>


        <div className="bg-white w-full  flex justify-center mb-10">
          <div className="sm:mx-30 sm:my-10 py-4">

            {/* Search Bar Centered */}
            <div className="w-full flex justify-center items-center px-4">
              <div className="relative w-full max-w-[700px]">

                <CustomInput
                  name="Search"
                  value={SearchData.Search}
                  onChange={handleSearchChange}
                  placeholder="Search any Legal question or track a case..."
                  className="
                            bg-[#f6f6f7] 
                            w-full 
                            pl-12 pr-5 
                            py-2 sm:py-3 
                            text-sm sm:text-base md:text-lg
                            rounded-xl
                          "
                />

                <button
                  type="button"
                  onClick={() => console.log('Search clicked')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-[#f6f6f7] text-gray-600"
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



            <div className="mt-10 grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-8 gap-6">
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
              <StateJudgement img={img1} state="Lucknow" />
            </div>

          </div>
        </div>


        {/* ########################## */}
        <div className="flex justify-center h-auto">

          <div className="container gap-4  justify-center flex sm:flex-row flex-col  ">

            <div className="flex flex-col gap-4 ">
              <div className="flex justify-between items-center">
                <h1 className="text-xl md:text-2xl font-extrabold font-merriweather">
                  Live Court
                </h1>
              </div>
              {/* <NewsScroller items={items} /> */}
              <LiveCourt />


            </div>

            <div className="flex flex-col gap-4 w-full max-w-[600px]">
              <div >
                <h1 className="text-xl md:text-2xl  font-extrabold font-merriweather">
                  Top Advocate
                </h1>
              </div>

              <div className={`flex flex-col p-5 bg-white justify-evenly transition-all duration-300 rounded-sm h-full`}>
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

                {/* <table className="w-full border-collapse"> */}
                {/* <thead>
                    <tr className=" border-b border-gray-400">
                      <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">Name</th>
                      <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">Price</th>
                      <th className="px-4 py-2 text-left font-semibold border-r border-gray-300">Changes</th>
                      <th className="px-4 py-2 text-left font-semibold">High</th>
                    </tr>
                  </thead> */}

                {/* <tbody>
                    {LLS.map((data) => (
                      <tr key={data.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-r border-gray-300">{data.name}</td>
                        <td className="px-4 py-2 border-r border-gray-300">{data.price}</td>
                        <td
                          className={`px-4 py-2 border-r border-gray-300 ${data.changes.includes("+") ? "text-green-400" : "text-red-400"
                            }`}
                        >
                          {data.changes}
                        </td>
                        <td className="px-4 py-2">{data.high}</td>
                      </tr>
                    ))}
                  </tbody> */}
                {/* </table> */}
              </div>
            </div>

          </div>
        </div>

        {/* ######## Ai features ########### */}
        <div className=" w-full ">
          <div className="flex items-center justify-center my-10">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-4 text-xl font-merriweather font-semibold text-black">
              AI Powered Features
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="bg-white flex justify-center">
            <div className=" container mx-auto flex flex-wrap justify-between   gap-8  my-10 py-15">


              <AiPoweredFeatures heading="AI LEGAL Summarizer" description="Convert lengthy case file into digestible 2-minute brifs without loosing context " img={icon1} />

              <AiPoweredFeatures heading="Real Time Court News" description="Verified updates aggregated from trust judicial and legal sources." img={icon2} />

              <AiPoweredFeatures heading="Smart Law Library" description="Search case by topic, year, bench, act with precision filters. " img={icon3} />

              <AiPoweredFeatures heading="AI Suggestions" description="Gen related precedents and judgments automatically, trailered to your query." img={icon4} />
            </div>
          </div>
        </div>

        {/* ########## latest news & judgements ########### */}
        <div className="w-full">
          <div className="flex items-center justify-center my-10">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-4 text-xl font-merriweather font-semibold text-black">
              Latest News & Judgments
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>

          <div className="flex justify-center ">
            <div className="container sm:flex-row flex-col flex gap-6" >
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
              {/* <LatestNews
                img={newsImage1}
                title="Karnataka Becomes First State to Introduce Menstrual Leave Policy for Women in Govt & Private Sectors"
                button1Text="Read Full Case"
                button2Text="AI Summary"
              />
              <LatestNews
                img={newsImage1}
                title="Karnataka Becomes First State to Introduce Menstrual Leave Policy for Women in Govt & Private Sectors"
                button1Text="Read Full Case"
                button2Text="AI Summary"
              />
              <LatestNews
                img={newsImage1}
                title="Karnataka Becomes First State to Introduce Menstrual Leave Policy for Women in Govt & Private Sectors"
                button1Text="Read Full Case"
                button2Text="AI Summary"
              /> */}
            </div>
          </div>

        </div>


        <div className="flex justify-center">

          <div className="container flex   items-center mx-auto  py-12 gap-6 sm:flex-row flex-col">
            <Judgement img={img1} description="In a development with significant ramifications in Kerala and Tamil Nadu (TN), the Supreme Court on Monday issued notice to the Central government....." />
            <Judgement img={img1} description="In a development with significant ramifications in Kerala and Tamil Nadu (TN), the Supreme Court on Monday issued notice to the Central government....." />
            <Judgement img={img1} description="In a development with significant ramifications in Kerala and Tamil Nadu (TN), the Supreme Court on Monday issued notice to the Central government....." />

          </div>
        </div>
        <div className="flex justify-center ">
          <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 py-1" />
        </div>

        <div className=" w-full ">
          <div className="flex items-center justify-center mt-10 mb-5">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-4 text-xl font-merriweather font-semibold text-black">
              Hindi News
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>
          <div className="flex justify-center ">
            <div className="container flex-col">
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है, हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है,हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है,हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />
              <HindiNews img={img1} title="सुप्रीम कोर्ट ने सोनम वांगचुक की रिहाई के लिए उनकी पत्नी की याचिका पर केंद्र सरकार से जवाब मांगा" description="अदालत के आदेश में कहा गया है,हमारा मानना ​​है कि इस मामले की जाँच के लिए सर्वोच्च निष्ठावान अधिकारियों की एक विशेष टीम की आवश्यकता है। केरल पुलिस में कानून एवं व्यवस्था के अतिरिक्त पुलिस महानिदेशक (एडीजीपी) श्री एच वेंकटेश आईपीएस को मामले के सभी पहलुओं की जाँच के लिए विशेष जाँच दल का प्रमुख नियुक्त किया जा सकता हैअदालत ने यह आदेश तब पारित किया जब यह पता चला कि जिस व्यक्ति को सोने की परत चढ़ाने का काम सौंपा गया था, उसने त्रावणकोर देवस्वोम बोर्ड (टीडीबी) के अध्यक्ष को एक ईमेल भेजकर पूछा था कि क्या वह काम के बाद बचे हुए सोने का इस्तेमाल किसी शादी में कर सकते हैं। " />

            </div>
          </div>
        </div>
        <div className="flex justify-center ">
          <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 py-1 mt-5" />
        </div>
        {/* ################Latest Judgments In your State####### */}
        {/* <div className=" w-full ">
          <div className="flex items-center justify-center mt-10 my-10">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-4 text-xl font-merriweather font-semibold text-black">
              Latest Judgments In your State
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>
          <div className="bg-white w-full  py-10 flex justify-center">
            <div className="mx-30 my-10">
              <div className="flex gap-10">
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
                <StateJudgement img={img1} state="Lucknow" />
              </div>

              <div className="flex gap-20 mt-10">
                <CustomInput name="City" value={CityData.City} onChange={handleChange} placeholder="Search by City" className="bg-[#f6f6f7]"/>
                <CustomInput name="Court" value={CourtData.Court} onChange={handleChange1} placeholder="Search by Court" className="bg-[#f6f6f7]"/>
                

                <Button lable="Search" className="bg-[#C9A227] border-1 hover:border-blue-300 transition-all duration-300 rounded-md px-20 py-2" />

              </div>
            </div>

          </div>
          </div> */}


        <div>
          <div className="flex items-center justify-center mt-10 mb-5">
            <div className="flex-1 h-px bg-gray-400"></div>
            <h2 className="px-4 text-xl font-merriweather font-semibold text-black">
              Article
            </h2>
            <div className="flex-1 h-px bg-gray-400"></div>
          </div>
          <ContentSlider />
          <ContentSlider />
        </div>
        <div className="flex justify-center ">
          <Button lable="View More" className="bg-transparent border-1 hover:border-blue-300 transition-all duration-300 border-black rounded-md px-4 py-1 mt-5 mb-20" />
        </div>


      </div>
    </div>
  );
}