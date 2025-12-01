"use client";

import { useState } from "react";
import {
  Ban,
  FolderOpen,
  Download,
  MapPin,
  Bell,
  FileText,
  Gift,
  X
} from "lucide-react";
import toast from "react-hot-toast";

export default function SubscriptionPage() {
  const [showGiftBanner, setShowGiftBanner] = useState(true);

  const features = [
    { icon: Ban, text: "Ad free Content" },
    { icon: MapPin, text: "Access to weekly and monthly digests." },
    { icon: FolderOpen, text: "Unlimited access to our archives, orders and judgement copies, etc." },
    { icon: Bell, text: "Exclusive notifications on phone and via email. Weekly judgement text/video roundups." },
    { icon: Download, text: "Free copies of judgments with download facility." },
    { icon: FileText, text: "Special coverage on Tax, IBC, Arbitration." },
    { icon: FileText, text: "In-depth articles on current legal and constitutional issues." },
  ];

  const plans = [
    {
      duration: "6 Months",
      monthlyPrice: 183,
      originalPrice: 1249,
      price: 1099,
      save: 12,
      highlighted: false,
    },
    {
      duration: "1 Year",
      monthlyPrice: 154,
      originalPrice: 2499,
      price: 1849,
      save: 26,
      highlighted: true, // This will be the featured plan
    },
    {
      duration: "2 Years",
      monthlyPrice: 121,
      originalPrice: 3999,
      price: 2899,
      save: 28,
      highlighted: false,
    },
    {
      duration: "3 Years",
      monthlyPrice: 111,
      originalPrice: 7499,
      price: 3999,
      save: 55,
      highlighted: false,
    },
  ];

  const handleSubscribe = (plan: any) => {
    toast.success(`Selected ${plan.duration} plan`);
    // Add payment logic here
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-24 pb-20">

      {/* Gift Banner */}
      {showGiftBanner && (
        <div
          className="container mx-auto px-4 mb-8"
        >
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center justify-between text-red-700">
            <div className="flex items-center gap-2">
              <Gift size={20} />
              <span className="font-medium text-sm sm:text-base">Your Loved One Deserves the Best in Law: Gift Sajjad Law Premium!</span>
              <a href="#" className="underline font-bold text-sm sm:text-base ml-1">Click here</a>
            </div>
            <button onClick={() => setShowGiftBanner(false)} className="text-red-400 hover:text-red-600">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4">
        {/* Header */}
        <div
          className="text-center mb-12"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Get unlimited access to all contents of Sajjad Law just at Rs <span className="text-[#C9A227]">111 / Month</span>
          </h1>
        </div>

        {/* Features Grid */}
        <div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mb-16 max-w-6xl mx-auto"
        >
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <feature.icon className="text-[#C9A227] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700 text-sm leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto"
        >
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-6 flex flex-col items-center text-center transition-transform hover:scale-105 duration-300 ${plan.highlighted
                ? "bg-[#0A2342] text-white shadow-xl scale-105 z-10"
                : "bg-gray-50 text-gray-900 border border-gray-100"
                }`}
            >
              <div className={`absolute -top-3 px-3 py-1 rounded-full text-xs font-bold ${plan.highlighted ? "bg-white text-[#0A2342]" : "bg-[#C9A227] text-white"
                }`}>
                Save {plan.save}%
              </div>

              <h3 className="text-lg font-medium mb-1 mt-4">For {plan.duration}</h3>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                (₹{plan.monthlyPrice} per month)
              </p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className={`text-lg line-through ${plan.highlighted ? "text-gray-400" : "text-red-400"}`}>
                  ₹{plan.originalPrice}
                </span>
                <span className={`text-3xl font-bold ${plan.highlighted ? "text-[#C9A227]" : "text-[#0A2342]"}`}>
                  ₹{plan.price}
                </span>
              </div>
              <p className={`text-sm mb-8 ${plan.highlighted ? "text-gray-300" : "text-gray-500"}`}>
                + GST
              </p>

              <button
                onClick={() => handleSubscribe(plan)}
                className={`w-full py-3 rounded-lg font-bold transition-colors ${plan.highlighted
                  ? "bg-[#C9A227] text-white hover:bg-[#b39022]"
                  : "bg-black text-white hover:bg-gray-800"
                  }`}
              >
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
