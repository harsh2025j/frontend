"use client";

import { useState, useEffect } from "react";
import {
  Ban,
  FolderOpen,
  Download,
  MapPin,
  Bell,
  FileText,
  Gift,
  X,
  Plus,
  Minus
} from "lucide-react";
import toast from "react-hot-toast";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "../../assets/logo.png";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

import Footer from "../../components/layout/Footer";

export default function SubscriptionPage() {
  const [showGiftBanner, setShowGiftBanner] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);

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
      id: "plan_6_months",
      duration: "6 Months",
      monthlyPrice: 183,
      originalPrice: 1249,
      price: 1099,
      save: 12,
      highlighted: false,
    },
    {
      id: "plan_1_year",
      duration: "1 Year",
      monthlyPrice: 154,
      originalPrice: 2499,
      price: 1849,
      save: 26,
      highlighted: true, // This will be the featured plan
    },
    {
      id: "plan_2_years",
      duration: "2 Years",
      monthlyPrice: 121,
      originalPrice: 3999,
      price: 2899,
      save: 28,
      highlighted: false,
    },
    {
      id: "plan_3_years",
      duration: "3 Years",
      monthlyPrice: 111,
      originalPrice: 7499,
      price: 3999,
      save: 55,
      highlighted: false,
    },
  ];

  useEffect(() => {
    // Set default selected plan to the highlighted one
    const defaultPlan = plans.find(p => p.highlighted);
    if (defaultPlan) {
      setSelectedPlan(defaultPlan);
    }
  }, []);

  const router = useRouter();

  const handleSubscribe = async (plan: any) => {
    if (!plan) return;

    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error("Please login to subscribe");
      router.push("/auth/login");
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error("Razorpay SDK failed to load. Please check your internet connection.");
      return;
    }

    // This is where you would typically call your backend to create an order
    // const res = await fetch('/api/create-order', { method: 'POST', body: JSON.stringify({ planId: plan.id }) });
    // const data = await res.json();

    // Since we don't have a backend, we'll mock the options
    const options = {
      key: "rzp_test_RgsP9vGhuEYlfv", // Enter the Key ID generated from the Dashboard
      amount: plan.price * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "Sajjad Husain Law Associates",
      description: `Subscription for ${plan.duration}`,
      image: "https://example.com/your_logo", // You can use the logo url here
      // order_id: "order_9A33XWu170g81s", // This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response: any) {
        toast.success(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
        // Handle success (e.g., update user subscription status)
      },
      prefill: {
        name: "Dinesh Kumar",
        email: "dinesh@example.com",
        contact: "9999999999"
      },
      notes: {
        address: "Razorpay Corporate Office"
      },
      theme: {
        color: "#0A2342"
      }
    };

    const rzp1 = new window.Razorpay(options);
    rzp1.on('payment.failed', function (response: any) {
      toast.error(`Payment Failed: ${response.error.description}`);
    });
    rzp1.open();
  };

  return (
    <div className="min-h-screen bg-white font-sans pt-24 relative">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      {/* Logo */}
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-50">
        <Link href="/">
          <Image
            src={logo}
            alt="Sajjad Husain Law Associates Logo"
            className="h-12 w-auto md:h-16"
          />
        </Link>
      </div>

      {/* Gift Banner */}
      {/* {showGiftBanner && (
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
      )} */}

      <div className="container mx-auto px-4 pb-20">
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
          {plans.map((plan, idx) => {
            const isSelected = selectedPlan?.id === plan.id;
            const isHighlighted = plan.highlighted;

            return (
              <div
                key={idx}
                onClick={() => setSelectedPlan(plan)}
                className={`relative rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 cursor-pointer 
                ${isSelected
                    ? "ring-4 ring-[#C9A227] scale-105 shadow-2xl z-20"
                    : "hover:scale-105 hover:shadow-xl"
                  }
                ${isHighlighted
                    ? "bg-[#0A2342] text-white shadow-xl scale-105 z-10"
                    : "bg-gray-50 text-gray-900 border border-gray-100"
                  }`}
              >
                <div className={`absolute -top-3 px-3 py-1 rounded-full text-xs font-bold ${isHighlighted ? "bg-white text-[#0A2342]" : "bg-[#C9A227] text-white"
                  }`}>
                  Save {plan.save}%
                </div>

                <h3 className="text-lg font-medium mb-1 mt-4">For {plan.duration}</h3>
                <p className={`text-sm mb-6 ${isHighlighted ? "text-gray-300" : "text-gray-500"}`}>
                  (₹{plan.monthlyPrice} per month)
                </p>

                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-lg line-through ${isHighlighted ? "text-gray-400" : "text-gray-400"}`}>
                    ₹{plan.originalPrice}
                  </span>
                  <span className={`text-3xl font-bold ${isHighlighted ? "text-[#C9A227]" : "text-[#0A2342]"}`}>
                    ₹{plan.price}
                  </span>
                </div>
                <p className={`text-sm mb-8 ${isHighlighted ? "text-gray-300" : "text-gray-500"}`}>
                  + GST
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click
                    handleSubscribe(plan);
                  }}
                  className={`w-full py-3 rounded-lg font-bold transition-colors ${isHighlighted
                    ? "bg-[#C9A227] text-white hover:bg-[#b39022]"
                    : "bg-black text-white hover:bg-gray-800"
                    }`}
                >
                  Subscribe
                </button>
              </div>
            );
          })}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 mb-12 text-xs text-gray-500 text-justify leading-relaxed max-w-7xl mx-auto">
          By confirming your subscription, you allow Sajjad Law to charge you for future payments in accordance with our terms & conditions. Subscription will auto renew based on the subscription plan you have purchased, through your account till you cancel your subscription. You can always cancel your subscription.
        </div>

        {/* Support Cards */}
        <div className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto mb-16">
          {/* Organisation Card */}
          <div className="bg-[#0A2342]/5 border border-[#0A2342]/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
            <div className="space-y-3">
              <span className="bg-[#C9A227] text-white text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                Bulk Subscription Query Form
              </span>
              <h3 className="text-xl font-bold text-[#0A2342]">
                For Organisations and Law Schools
              </h3>
            </div>
            <Link href="/contact">
              <button className="whitespace-nowrap px-6 py-2.5 border border-[#0A2342] text-[#0A2342] rounded-lg font-medium hover:bg-[#0A2342] hover:text-white transition-colors text-sm">
                Inquire Now
              </button>
            </Link>
          </div>

          {/* Assistance Card */}
          <div className="bg-[#0A2342]/5 border border-[#0A2342]/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md">
            <div className="space-y-3">
              <span className="bg-[#C9A227] text-white text-xs font-bold px-3 py-1.5 rounded-full inline-block">
                Need more assistance?
              </span>
              <h3 className="text-xl font-bold text-[#0A2342]">
                We are here to help you!
              </h3>
            </div>
            <Link href="/contact">
              <button className="whitespace-nowrap px-6 py-2.5 border border-[#0A2342] text-[#0A2342] rounded-lg font-medium hover:bg-[#0A2342] hover:text-white transition-colors text-sm">
                Get In Touch
              </button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-7xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-[#0A2342] mb-8 border-b-2 border-[#C9A227] pb-2 inline-block">
            Frequently asked questions
          </h2>

          <div className="space-y-4">
            {[
              "WILL MY CREDIT CARD DETAILS AND OTHER PAYMENT DETAILS BE SAFE?",
              "I DON'T HAVE AN INDIAN CARD; HOW CAN I PURCHASE A SAJJAD LAW SUBSCRIPTION?",
              "HOW DO I GET AN INVOICE FOR SUBSCRIPTION?",
              "HOW DO I CHANGE MY PASSWORD?",
              "WHY IS THE AMOUNT REFUNDED BY THE BANK IS LESSER THAN THE AMOUNT I PAID?",
              "WHAT CAN I DO IN CASE I HAVE FORGOTTEN MY PASSWORD?"
            ].map((question, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
                <button
                  onClick={() => setSelectedFaq(selectedFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
                >
                  <span className={`font-medium pr-8 ${selectedFaq === idx ? "text-[#0A2342]" : "text-gray-700"}`}>{question}</span>
                  {selectedFaq === idx ? (
                    <Minus className="text-[#C9A227] flex-shrink-0" size={20} />
                  ) : (
                    <Plus className="text-[#C9A227] flex-shrink-0" size={20} />
                  )}
                </button>
                {selectedFaq === idx && (
                  <div className="px-6 pb-4 text-gray-600 text-sm">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Box */}
        <div className="max-w-7xl mx-auto bg-[#0A2342] rounded-xl p-8 text-center relative overflow-hidden shadow-xl">
          {/* Decorative circle */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C9A227]/10 rounded-full -ml-12 -mb-12"></div>

          <div className="relative z-10">
            <span className="bg-[#C9A227] text-white text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-4">
              HAVE MORE QUESTIONS?
            </span>
            <p className="text-white font-bold text-lg md:text-xl">
              For other queries, please write to us at <a href="mailto:subscription@sajjadlaw.in" className="text-[#C9A227] hover:underline">sajjadhusainlawassociates@gmail.com</a> or Call/ WhatsApp us at <a href="tel:+917080909786" className="text-[#C9A227] hover:underline">+91 70809 09786</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
