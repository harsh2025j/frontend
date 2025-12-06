"use client";

import { useState, useEffect } from "react";
import {
  Ban,
  FolderOpen,
  Download,
  MapPin,
  Bell,
  FileText,
  X,
  Plus,
  Minus,
  Check,
  Loader2,
  CheckCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { subscriptionApi } from "@/data/services/subscription-service/subscription-service";
import { Plans, UserSubscription } from "@/data/features/subscription/subscription.types";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plans[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plans | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<number | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  // Fetch user's subscription status
  useEffect(() => {
    const fetchUserSubscription = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setSubscriptionLoading(false);
        return;
      }

      try {
        const response = await subscriptionApi.getMySubscription();
        if (response.data?.data) {
          setUserSubscription(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setSubscriptionLoading(false);
      }
    };

    fetchUserSubscription();
  }, []);

  // Fetch plans from API
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await subscriptionApi.fetchPlans();
        if (response.data?.data) {
          setPlans(response.data.data);
          // Set first plan as default selected
          if (response.data.data.length > 0) {
            setSelectedPlan(response.data.data[0]);
          }
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
        toast.error("Failed to load subscription plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const features = [
    { icon: Ban, text: "Ad free Content" },
    { icon: MapPin, text: "Access to weekly and monthly digests." },
    { icon: FolderOpen, text: "Unlimited access to our archives, orders and judgement copies, etc." },
    { icon: Bell, text: "Exclusive notifications on phone and via email. Weekly judgement text/video roundups." },
    { icon: Download, text: "Free copies of judgments with download facility." },
    { icon: FileText, text: "Special coverage on Tax, IBC, Arbitration." },
    { icon: FileText, text: "In-depth articles on current legal and constitutional issues." },
  ];

  const handleSubscribe = async (plan: Plans) => {
    if (!plan || processingPlanId) return;

    // Check if user is logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error("Please login to subscribe");
      router.push("/auth/login");
      return;
    }

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error("Payment gateway failed to load. Please refresh the page.");
      return;
    }

    setProcessingPlanId(plan.id);

    try {
      // Create order via backend
      console.log("Creating order for plan:", plan.id, plan.name);
      const orderResponse = await subscriptionApi.createOrder({ planId: plan.id });

      console.log("Order response received:", orderResponse);

      // Check if response is successful
      if (!orderResponse.data?.success || !orderResponse.data?.data) {
        console.error("Invalid response structure:", orderResponse);
        throw new Error(orderResponse.data?.message || "Failed to create order");
      }

      const orderData = orderResponse.data.data;
      console.log("Order data:", orderData);

      // Use orderId as the Razorpay order ID (backend returns orderId, not razorpayOrderId)
      const razorpayOrderId = orderData.razorpayOrderId || orderData.orderId;

      if (!razorpayOrderId) {
        console.error("No order ID in response:", orderData);
        throw new Error("Order ID missing in response");
      }

      // Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_RgsP9vGhuEYlfv",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Sajjad Husain Law Associates",
        description: `Subscription: ${plan.name}`,
        order_id: razorpayOrderId,
        handler: async function (response: any) {
          try {
            console.log("Payment successful, verifying...", response);
            const verifyData = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };

            const verifyResponse = await subscriptionApi.verifyPayment(verifyData);
            console.log("Verify response:", verifyResponse);

            if (verifyResponse.data?.success) {
              toast.success("Payment verified and subscription activated!");
              router.push("/profile");
            } else {
              throw new Error(verifyResponse.data?.message || "Payment verification failed");
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setProcessingPlanId(null);
          }
        },
        prefill: {
          name: "",
          email: "",
          contact: ""
        },
        notes: {
          planId: plan.id,
          planName: plan.name
        },
        theme: {
          color: "#0A2342"
        },
        modal: {
          ondismiss: function () {
            setProcessingPlanId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment Failed: ${response.error.description}`);
        setProcessingPlanId(null);
      });

      rzp.open();
    } catch (error: any) {
      console.error("Error creating order:", error);
      console.error("Error response:", error.response);

      const errorMessage = error.response?.data?.message || error.message || "Failed to initiate payment";
      toast.error(errorMessage);
      setProcessingPlanId(null);
    }
  };

  const formatPrice = (price: string | number) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(numPrice);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center pt-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C9A227] mx-auto mb-4" />
          <p className="text-gray-600">Loading subscription plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans pt-24 relative">
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <div className="container mx-auto px-4 pb-20">
        {/* Active Subscription Banner */}
        {subscriptionLoading ? (
          <div className="mb-8 bg-gradient-to-r from-[#0A2342] to-[#153a66] rounded-xl p-8 text-white">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>Loading your subscription...</span>
            </div>
          </div>
        ) : userSubscription && userSubscription.status === "active" ? (
          <div className="mb-12 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-8 text-white shadow-2xl mx-24">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2 mx">
                    <h2 className="text-2xl font-bold">You're a Premium Member!</h2>
                    <span className="bg-white/30 px-3 py-1 rounded-full text-sm font-semibold">
                      {userSubscription.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-white/90 text-lg mb-4">
                    Currently subscribed to: <span className="font-semibold">{userSubscription.planName || "My Plan"}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <p className="text-white/70 mb-1">Started On</p>
                      <p className="font-semibold text-lg">{new Date(userSubscription.startDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-white/70 mb-1">Valid Until</p>
                      <p className="font-semibold text-lg">{new Date(userSubscription.endDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <Link
                  href="/profile"
                  className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-white/90 transition text-center"
                >
                  Manage Subscription
                </Link>
                <button
                  onClick={() => {
                    // Scroll to plans section
                    const plansSection = document.getElementById("plans-section");
                    plansSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition text-center"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Get unlimited access to all contents of Sajjad Law
          </h1>
          <p className="text-gray-600 mt-2">Choose the perfect plan for you</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 mb-16 max-w-6xl mx-auto">
          {features.map((feature, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <feature.icon className="text-[#C9A227] flex-shrink-0 mt-1" size={20} />
              <p className="text-gray-700 text-sm leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>

        {/* Pricing Cards */}
        <div id="plans-section" className="scroll-mt-24">
          {plans.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No subscription plans available at the moment.</p>
              <p className="text-sm text-gray-500 mt-2">Please check back later or contact support.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto px-4">
              {plans.map((plan, idx) => {
                const isSelected = selectedPlan?.id === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`relative rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-300 cursor-pointer my-4
                    ${isSelected
                        ? "ring-4 ring-[#C9A227] scale-105 shadow-2xl z-20 bg-[#0A2342] text-white"
                        : "hover:scale-105 hover:shadow-xl bg-gray-50 text-gray-900 border border-gray-100"
                      }`}
                    style={{ transformOrigin: 'center' }}
                  >
                    {plan.discount && parseFloat(plan.discount) > 0 && (
                      <div className={`absolute -top-3 px-3 py-1 rounded-full text-xs font-bold ${isSelected ? "bg-white text-[#0A2342]" : "bg-[#C9A227] text-white"
                        }`}>
                        Save {plan.discount}%
                      </div>
                    )}

                    <h3 className="text-xl font-bold mb-2 mt-4">{plan.name}</h3>
                    {plan.description && (
                      <p className={`text-sm mb-4 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                        {plan.description}
                      </p>
                    )}

                    <div className="flex items-baseline gap-2 mb-1">
                      <span className={`text-4xl font-bold ${isSelected ? "text-[#C9A227]" : "text-[#0A2342]"}`}>
                        {formatPrice(plan.price)}
                      </span>
                    </div>
                    <p className={`text-sm mb-6 ${isSelected ? "text-gray-300" : "text-gray-500"}`}>
                      {plan.currency || "INR"} + GST
                    </p>

                    {/* Features List */}
                    {plan.features && plan.features.length > 0 && (
                      <div className="w-full space-y-2 mb-6 flex-grow">
                        {plan.features.map((feature, fIdx) => (
                          <div key={fIdx} className="flex items-start gap-2 text-left">
                            <Check className={`flex-shrink-0 mt-0.5 ${isSelected ? "text-[#C9A227]" : "text-green-600"}`} size={16} />
                            <span className={`text-sm ${isSelected ? "text-gray-200" : "text-gray-700"}`}>
                              {feature.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}


                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSubscribe(plan);
                      }}
                      disabled={processingPlanId === plan.id}
                      className={`w-full py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isSelected
                        ? "bg-[#C9A227] text-white hover:bg-[#b39022]"
                        : "bg-black text-white hover:bg-gray-800"
                        }`}
                    >
                      {processingPlanId === plan.id ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </span>
                      ) : (
                        "Subscribe Now"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="bg-[#0A2342]/5 border border-[#0A2342]/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md mt-4 mx-24">
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

        <div className="bg-[#0A2342]/5 border border-[#0A2342]/10 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md mt-4 mx-24">
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
                    For detailed information about this question, please contact our support team or refer to our help documentation.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Box */}
      <div className="max-w-7xl mx-auto bg-[#0A2342] rounded-xl p-8 text-center relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C9A227]/10 rounded-full -ml-12 -mb-12"></div>

        <div className="relative z-10">
          <span className="bg-[#C9A227] text-white text-xs font-bold px-3 py-1.5 rounded-full inline-block mb-4">
            HAVE MORE QUESTIONS?
          </span>
          <p className="text-white font-bold text-lg md:text-xl">
            For other queries, please write to us at <a href="mailto:sajjadhusainlawassociates@gmail.com" className="text-[#C9A227] hover:underline">sajjadhusainlawassociates@gmail.com</a> or Call/ WhatsApp us at <a href="tel:+917080909786" className="text-[#C9A227] hover:underline">+91 70809 09786</a>
          </p>
        </div>
      </div>
    </div>
  );
}
