"use client";

import { useState } from "react";

export default function subscription() {
  const [billing, setBilling] = useState("MONTHLY"); // MONTHLY | YEARLY

  const features = [
    "Daily News Feed",
    "Latest News",
    "Weekly Digest Email",
    "AI Summaries",
    "Ad-Free",
    "Basic Archive",
    "AI Verdict Analysis",
    "AI Recommendation",
    "Multi-User Access",
  ];

  const premiumMonthly = 499;
  const premiumYearly = premiumMonthly * 12;
  const premiumDiscountYearly = Math.round(premiumYearly * 0.8);

  const proMonthly = 199;
  const proYearly = proMonthly * 12;
  const proDiscountYearly = Math.round(proYearly * 0.85);

  const handlePlan = () => {

  }

  return (
    <div className="min-h-screen bg-[#f3f3f3] flex flex-col items-center py-16 font-sans">

      <h2 className="text-3xl font-semibold text-center mb-2">
        <span className="text-[#1A73E8] font-bold">Powerful AI</span>{" "}
        <span className="text-[#1d2a57]">Perfected by the Latest Legal Standards</span>
      </h2>
      <p className="text-gray-600 mb-10 text-center">
        Choose a plan that’s right for you
      </p>


      <div className="relative bg-[#e9edf3] rounded-full flex w-40 justify-between mb-14 p-1">

        <div
          className={`absolute top-1 bottom-1 w-[50%] rounded-full bg-[#122340] transition-transform duration-400 ease-out ${billing === "MONTHLY" ? "translate-x-0" : "translate-x-full"
            }`}
        ></div>


        <button
          onClick={() => setBilling("MONTHLY")}
          className={`w-1/2 py-2 text-sm font-semibold text-center relative z-10 transition-colors duration-400 ${billing === "MONTHLY" ? "text-white" : "text-[#122340]"
            }`}
        >
          MONTHLY
        </button>

        <button
          onClick={() => setBilling("YEARLY")}
          className={`w-1/2 py-2 text-sm font-semibold text-center relative z-10 transition-colors duration-300 ${billing === "YEARLY" ? "text-white" : "text-[#122340]"
            }`}
        >
          YEARLY
        </button>
      </div>



      <div className="bg-white p-5 rounded-2xl container">
        <div className="flex justify-between gap-10 px-8 items-start relative">

          <div className="bg-white rounded-2xl w-[300px] px-8 py-10 flex flex-col border border-transparent hover:border-2 hover:border-blue-300 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#1d2a57] mb-1 items-start">Free Plan</h3>
            {billing === "MONTHLY" ? (
              <p className="text-sm text-gray-500 mb-4">
                ₹{0} <span className="text-xs text-gray-400">/month<br />billed monthly</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                <span className="font-sm text-[#1d2a57]">₹{0}</span>
                <span className="text-xs text-gray-400 block">/Year<br />billed yearly</span>
              </p>
            )}

            <ul className="space-y-2 mb-6 text-sm">
              {features.map((item, i) => (
                <li key={i} className="flex items-center">
                  <span
                    className={`w-4 h-4 mr-2 rounded-full border flex items-center justify-center text-[10px] font-bold ${i < 3
                      ? "bg-[#122340] border-[#122340] text-white"
                      : "border-gray-300 text-transparent"
                      }`}
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button className="hover:bg-gray-100 transition-colors duration-300 border border-[#122340] text-[#122340] font-semibold rounded-full py-2 px-6 mt-auto">
              Choose Plan
            </button>
          </div>

          <div className="relative bg-gradient-to-b from-[#9747FF] to-[#1959A8] text-white rounded-2xl w-[320px] px-8 py-12 flex flex-col items-start scale-105 shadow-lg -mt-10 z-10 border border-transparent hover:border-blue-300 transition-all duration-300">
            <div className="absolute top-4 right-4 bg-white text-[#2D0FD4] text-xs font-semibold rounded-full px-3 py-2">
              MOST POPULAR
            </div>

            <h3 className="text-lg font-semibold mb-1">Jurist Premium</h3>


            {billing === "MONTHLY" ? (
              <p className="text-sm mb-4 text-white/90">
                ₹{premiumMonthly}
                <span className="text-xs block">/month<br />billed monthly</span>
              </p>
            ) : (
              <p className="text-sm mb-4 text-white/90">
                <span className="line-through text-red-400">₹{premiumYearly}</span>{" "}
                <span className="font-sm">&nbsp;₹{premiumDiscountYearly}</span>
                <span className="text-xs block">/Year<br />billed yearly (20% off)</span>
              </p>
            )}

            <ul className="space-y-2 mb-6 text-sm">
              {features.map((item, i) => (
                <li key={i} className="flex items-center">
                  <span className="w-4 h-4 mr-2 rounded-full bg-white flex items-center justify-center text-[#122340] text-[10px] font-bold">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button className="bg-white hover:bg-gray-100 transition-colors duration-300 text-[#2D0FD4] font-semibold rounded-full w-full py-2 px-6 mt-auto" onClick={handlePlan}>
              Choose Plan
            </button>
          </div>
          <div className="bg-white rounded-2xl w-[300px] px-8 py-10 flex flex-col border border-transparent hover:border-2 hover:border-blue-300 transition-all duration-300">
            <h3 className="text-lg font-semibold text-[#1d2a57] mb-1">Jurist Pro</h3>
            {billing === "MONTHLY" ? (
              <p className="text-sm text-gray-500 mb-4">
                ₹{proMonthly} <span className="text-xs text-gray-400">/month<br />billed monthly</span>
              </p>
            ) : (
              <p className="text-sm text-gray-500 mb-4">
                <span className="line-through text-red-400">₹{proYearly} </span>{" "}
                <span className="font-sm text-[#1d2a57]">&nbsp; ₹{proDiscountYearly}</span>
                <span className="text-xs text-gray-400 block">/Year<br />billed yearly (15% off)</span>
              </p>
            )}

            <ul className="space-y-2 mb-6 text-sm text-[#122340]">
              {features.map((item, i) => (
                <li key={i} className="flex items-center">
                  <span className="w-4 h-4 mr-2 rounded-full bg-[#122340] flex items-center justify-center text-white text-[10px] font-bold">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <button className="hover:bg-gray-100 transition-colors duration-300 border border-[#122340] text-[#122340] font-semibold rounded-full py-2 px-6 mt-auto" onClick={handlePlan}>
              Choose Plan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
