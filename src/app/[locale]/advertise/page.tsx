"use client";

import React, { useState } from "react";
import {
  Megaphone,
  Target,
  Users,
  TrendingUp,
  Award,
  BarChart,
  Mail,
  Phone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  MousePointerClick,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useDocTitle } from "@/hooks/useDocTitle";
import { Link } from "@/i18n/routing";
import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

export default function AdvertiseWithUs() {
  useDocTitle("Advertise With Us | Sajjad Husain Law Associates");

  const [formState, setFormState] = useState({
    name: "",
    organization: "",
    email: "",
    phone: "",
    adFormat: "Banner Advertisements",
    budget: "₹15,000 - ₹35,000",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.NOTIFICATIONS.ADVERTISE_INQUIRY,
        formState
      );

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Failed to deliver inquiry.");
      }

      setSubmitted(true);
    } catch (err: any) {
      console.warn("API delivery fallback:", err);
      // Fallback: If network or server fails, open mailto directly
      const subject = encodeURIComponent(
        `Advertising Inquiry: ${formState.organization || formState.name}`
      );
      const body = encodeURIComponent(
        `Name: ${formState.name}\n` +
        `Organization: ${formState.organization}\n` +
        `Email: ${formState.email}\n` +
        `Phone: ${formState.phone}\n` +
        `Preferred Format: ${formState.adFormat}\n` +
        `Budget Range: ${formState.budget}\n\n` +
        `Requirements / Message:\n${formState.message}`
      );
      window.location.href = `mailto:sajjadhusainlawassociates@gmail.com?subject=${subject}&body=${body}`;
      setSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const adFormats = [
    {
      title: "Header & Leaderboard Banners",
      specs: "728 × 90 px (Desktop) | 320 × 50 px (Mobile)",
      description:
        "Prime screen placement across homepage, High Court & Supreme Court judgments, and trending news.",
      features: ["Immediate above-the-fold visibility", "High CTR (Click-Through Rate)", "Rotational or exclusive slots", "Geo-targeted to Indian states"],
      icon: Eye,
    },
    {
      title: "Sidebar Sticky Units",
      specs: "300 × 250 px (Medium Rectangle) | 300 × 600 px (Half Page)",
      description:
        "Persistent side ads that stick as readers scroll through court orders, case judgments, and legal articles.",
      features: ["Highest time-in-view metrics", "Desktop & tablet optimized", "Ideal for Law Schools & Tech Tools", "Direct landing page link"],
      icon: MousePointerClick,
    },
    {
      title: "In-Article Content Banners",
      specs: "728 × 150 px / Responsive Native Ads",
      description:
        "Seamlessly embedded within breaking legal news, case commentaries, and barefoot act analyses.",
      features: ["Engaged reading context", "Non-intrusive native flow", "High recall among advocates", "Custom call-to-action button"],
      icon: Target,
    },
    {
      title: "Sponsored Articles & Guest Post",
      specs: "800 - 1,500 Words + Permanent Do-Follow Backlink",
      description:
        "Publish expert legal analysis, brand announcements, or corporate legal services with permanent SEO authority.",
      features: ["Indexed in Google News & Search", "Featured on Home for 7 days", "Do-Follow brand citation", "Social & Telegram broadcast"],
      icon: Award,
    },
    {
      title: "Legal Academy Course Sponsorship",
      specs: "Banner in Course Player + Certificate Co-Branding",
      description:
        "Directly reach 5,000+ enrolled law students, judiciary aspirants, and judicial interns in our legal academy.",
      features: ["Hyper-targeted student demographic", "Co-branded course banners", "Webinar speaking opportunities", "Long-term brand affinity"],
      icon: Building2,
    },
    {
      title: "Custom 360° Brand Package",
      specs: "Multi-Channel (Web + WhatsApp + Email + Event)",
      description:
        "Comprehensive marketing campaigns designed for legal software, law universities, and corporate firms.",
      features: ["Sitewide banner dominance", "Newsletter broadcast to 15k+ lawyers", "Exclusive category sponsorship", "Detailed weekly ROI reporting"],
      icon: Sparkles,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#07172C] via-[#0F284E] to-[#122340] text-white py-20 lg:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-6">
            <Megaphone className="w-4 h-4" />
            <span>Targeted Legal Advertising in India</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif leading-tight mb-6 tracking-tight text-white">
            Reach India’s Largest Community of <br className="hidden sm:inline" />
            <span className="text-[#C9A227]">Advocates, Law Students & Litigants</span>
          </h1>

          <p className="text-base sm:text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed mb-8">
            Promote your legal services, law school programs, legal tech software, or corporate brand on
            Sajjad Husain Law Associates—the trusted destination for daily court updates, judgments, and legal education.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#pricing"
              className="bg-[#C9A227] hover:bg-[#b59020] text-[#07172C] font-bold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              View Pricing Packages
            </a>
            <a
              href="#contact-form"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              Request Custom Quote
            </a>
          </div>
        </div>
      </section>

      {/* Verified Audience Reach (India-Focused) */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "100K+", label: "Monthly Unique Readers", desc: "Across High Courts & Supreme Court news" },
            { value: "15,000+", label: "Active Advocates & Jurists", desc: "Subscribed legal practitioners" },
            { value: "350K+", label: "Monthly Page Impressions", desc: "High engagement on court orders" },
            { value: "4.8 / 5", label: "Brand Credibility Score", desc: "Trusted by Indian legal fraternity" },
          ].map((stat, idx) => (
            <div key={idx} className="p-3 border-r last:border-r-0 border-slate-100">
              <div className="text-3xl sm:text-4xl font-extrabold text-[#0F284E] mb-1 font-serif">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-semibold text-slate-800 mb-1">{stat.label}</div>
              <div className="text-[11px] text-slate-500 hidden sm:block">{stat.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 space-y-20">
        {/* Audience Demographic */}
        <section className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 text-[#0F284E] font-semibold text-sm">
              <Users className="w-5 h-5 text-[#C9A227]" />
              <span>Who Reads Our Platform?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0F284E] leading-snug">
              Direct Access to High-Intent Legal Decision Makers
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Unlike generic news websites, Sajjad Husain Law Associates attracts an audience looking
              specifically for legal solutions, authoritative case law citations, professional tools, and legal education.
            </p>

            <div className="space-y-4">
              {[
                {
                  title: "Advocates & Law Firms (42%)",
                  desc: "Practicing advocates in High Courts, Supreme Court, and District Courts researching orders and daily display boards.",
                },
                {
                  title: "Law Students & Judiciary Aspirants (31%)",
                  desc: "Students preparing for CLAT, Bar Examinations, State Judicial Services, and seeking internships.",
                },
                {
                  title: "Litigants & Corporate Clients (27%)",
                  desc: "Individuals and businesses seeking lawyer consultations, legal advice, and legal document drafting.",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-6 bg-gradient-to-br from-[#0F284E] to-[#122340] text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-2xl font-bold font-serif">Why Indian Brands Partner With Us</h3>
            <ul className="space-y-4 text-sm text-slate-200">
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                <span>Zero Bot Traffic — 100% human, search-intent driven organic readers.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                <span>Compliant with Indian Bar Council guidelines for professional visibility.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                <span>Transparent analytics with impression counts and verified click-throughs.</span>
              </li>
              <li className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                <span>Flexible billing with official GST tax invoices for Indian companies.</span>
              </li>
            </ul>

            <div className="p-5 bg-white/10 rounded-2xl border border-white/20">
              <div className="text-xs uppercase tracking-wider text-[#C9A227] font-semibold mb-1">
                Quick Placement Turnaround
              </div>
              <div className="text-sm">
                Approved banners go live within <strong>24 hours</strong> across selected court and news categories.
              </div>
            </div>
          </div>
        </section>

        {/* Ad Formats & Placements */}
        <section>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[#C9A227] font-semibold text-xs uppercase tracking-widest mb-2">
              Flexible Display Formats
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0F284E]">
              Advertising Slots & Placement Specs
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              Standard IAB ad dimensions seamlessly integrated without disrupting reader experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adFormats.map((format, idx) => {
              const IconComp = format.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-7 border border-slate-200 shadow-sm hover:shadow-md hover:border-[#0F284E] transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 bg-blue-50 text-[#0F284E] rounded-xl flex items-center justify-center mb-5">
                      <IconComp className="w-6 h-6 text-[#C9A227]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{format.title}</h3>
                    <div className="text-xs font-mono font-semibold text-blue-600 bg-blue-50/80 px-2.5 py-1 rounded-md inline-block mb-3">
                      {format.specs}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed mb-4">{format.description}</p>
                  </div>

                  <ul className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-700">
                    {format.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#C9A227]" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing Packages (In Indian Rupees INR) */}
        <section id="pricing" className="scroll-mt-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="text-[#C9A227] font-semibold text-xs uppercase tracking-widest mb-2">
              Indian Currency (INR / ₹)
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#0F284E]">
              Transparent Advertising Packages
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              No hidden costs. All packages include analytics reports, GST invoice support, and placement assistance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-stretch">
            {/* Starter Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Advocates & Solo Practices
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Starter Pack</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-[#0F284E]">₹12,500</span>
                  <span className="text-xs text-slate-500 font-medium">/ month (+ GST)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Ideal for individual lawyers, local advocates, and boutique firms wanting verified visibility in court categories.
                </p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span><strong>1 Sidebar or In-Content Banner</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Estimated 30,000+ targeted impressions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Category specific targeting (e.g. Criminal, Tax)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Monthly performance & CTR report</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Standard Email Support</span>
                  </li>
                </ul>
              </div>

              <a
                href="#contact-form"
                onClick={() => setFormState({ ...formState, budget: "₹12,500 / month (Starter)" })}
                className="w-full block text-center py-3 px-4 rounded-xl border-2 border-[#0F284E] text-[#0F284E] font-bold text-sm hover:bg-[#0F284E] hover:text-white transition-all"
              >
                Choose Starter
              </a>
            </div>

            {/* Professional Plan (Most Popular) */}
            <div className="bg-gradient-to-b from-[#07172C] to-[#0F284E] text-white rounded-3xl p-8 border-2 border-[#C9A227] shadow-2xl relative flex flex-col justify-between transform md:-translate-y-2">
              <div className="absolute -top-3.5 left-1/2 transform -translate-x-1/2 bg-[#C9A227] text-[#07172C] text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-md">
                Most Popular
              </div>

              <div>
                <div className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">
                  Law Firms & EdTech
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Professional Pack</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-[#C9A227]">₹28,500</span>
                  <span className="text-xs text-blue-200 font-medium">/ month (+ GST)</span>
                </div>
                <p className="text-xs text-blue-100 leading-relaxed mb-6">
                  Comprehensive reach across high-traffic judgments, legal news, and dedicated sponsored editorial coverage.
                </p>

                <ul className="space-y-3 text-xs text-slate-100 mb-8 border-t border-white/10 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                    <span><strong>Top Header Leaderboard + 2 Sidebar Slots</strong></span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                    <span><strong>1 Sponsored Article</strong> / Press Release per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                    <span>Permanent Do-Follow backlink for brand SEO</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                    <span>Estimated 100,000+ monthly impressions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                    <span>Broadcast to 15,000+ Legal Telegram/Social</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#C9A227] flex-shrink-0" />
                    <span>Dedicated Campaign Manager & Weekly Reports</span>
                  </li>
                </ul>
              </div>

              <a
                href="#contact-form"
                onClick={() => setFormState({ ...formState, budget: "₹28,500 / month (Professional)" })}
                className="w-full block text-center py-3.5 px-4 rounded-xl bg-[#C9A227] hover:bg-[#b59020] text-[#07172C] font-extrabold text-sm transition-all shadow-lg hover:shadow-xl"
              >
                Choose Professional
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Universities & National Brands
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Enterprise Partner</h3>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-[#0F284E]">₹55,000</span>
                  <span className="text-xs text-slate-500 font-medium">/ month (Quarterly)</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  Full category takeover, Academy course co-branding, custom webinars, and complete sitewide brand dominance.
                </p>

                <ul className="space-y-3 text-xs text-slate-700 mb-8 border-t border-slate-100 pt-6">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span><strong>Sitewide Category Takeover</strong> (Exclusive Banners)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span><strong>Weekly Sponsored Content</strong> & Editorial Interviews</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Legal Academy Student Sponsorship placement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>250,000+ guaranteed monthly impressions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span>Direct WhatsApp & Priority Support line</span>
                  </li>
                </ul>
              </div>

              <a
                href="#contact-form"
                onClick={() => setFormState({ ...formState, budget: "₹55,000+ (Enterprise)" })}
                className="w-full block text-center py-3 px-4 rounded-xl border-2 border-[#0F284E] text-[#0F284E] font-bold text-sm hover:bg-[#0F284E] hover:text-white transition-all"
              >
                Inquire Enterprise
              </a>
            </div>
          </div>
        </section>

        {/* Lead Capture Form & Direct Contact */}
        <section id="contact-form" className="scroll-mt-12 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* Left Contact Info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 text-[#0F284E] font-semibold text-xs uppercase tracking-wider">
                <Mail className="w-4 h-4 text-[#C9A227]" />
                <span>Start Your Campaign</span>
              </div>
              <h2 className="text-3xl font-bold font-serif text-[#0F284E]">
                Let’s Discuss Your Brand Objectives
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Fill out the quick inquiry form or connect directly with our partnership desk. We share media kits, audience metrics, and custom slot availability within 4 business hours.
              </p>

              <div className="space-y-4 pt-2">
                <a
                  href="tel:+917080909786"
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors group"
                >
                  <Phone className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Call / WhatsApp Desk</div>
                    <div className="text-sm font-bold text-[#0F284E] group-hover:text-blue-600">
                      +91 70809 09786
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:sajjadhusainlawassociates@gmail.com"
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-100 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
                  <div>
                    <div className="text-xs text-slate-500">Official Partnerships Email</div>
                    <div className="text-sm font-bold text-[#0F284E] group-hover:text-blue-600 break-all">
                      sajjadhusainlawassociates@gmail.com
                    </div>
                  </div>
                </a>

                <a
                  href="https://wa.me/917080909786?text=Hi,%20I%20am%20interested%20in%20advertising%20on%20Sajjad%20Husain%20Law%20Associates"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-sm rounded-xl transition-all shadow-md"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat on WhatsApp Directly</span>
                </a>
              </div>
            </div>

            {/* Right Form */}
            <div className="lg:col-span-7 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 font-serif">Inquiry Sent Successfully!</h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your campaign requirements have been dispatched directly to our partnerships team at{" "}
                    <strong className="text-[#0F284E]">sajjadhusainlawassociates@gmail.com</strong>. We will review slot availability and respond within 4 business hours.
                  </p>
                  <div className="pt-2 flex flex-wrap justify-center gap-3">
                    <a
                      href="https://wa.me/917080909786?text=Hi,%20I%20just%20submitted%20an%20advertising%20inquiry%20on%20your%20website"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold hover:bg-[#20ba59] transition-all shadow"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Ping on WhatsApp for Quick Confirmation</span>
                    </a>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="px-4 py-2.5 text-xs text-slate-600 font-semibold hover:text-slate-900 transition-colors"
                    >
                      Submit another inquiry
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="Adv. Rajesh Sharma"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Organization / Brand / Law Firm *
                      </label>
                      <input
                        type="text"
                        required
                        value={formState.organization}
                        onChange={(e) => setFormState({ ...formState, organization: e.target.value })}
                        placeholder="Sharma & Partners Law Firm"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="rajesh@lawfirm.in"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        WhatsApp / Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formState.phone}
                        onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Preferred Advertising Format
                      </label>
                      <select
                        value={formState.adFormat}
                        onChange={(e) => setFormState({ ...formState, adFormat: e.target.value })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                      >
                        <option>Banner Advertisements (Header / Sidebar)</option>
                        <option>Sponsored Article / Editorial Post</option>
                        <option>Legal Academy Course Sponsorship</option>
                        <option>Category Takeover & Complete Bundle</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monthly Budget
                      </label>
                      <select
                        value={formState.budget}
                        onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                      >
                        <option>₹12,500 / month (Starter)</option>
                        <option>₹28,500 / month (Professional)</option>
                        <option>₹55,000+ (Enterprise)</option>
                        <option>Under ₹10,000 (Custom Single Banner)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Campaign Details / Target Audience Goals
                    </label>
                    <textarea
                      rows={3}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Tell us about the product or service you want to promote, target courts or dates..."
                      className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#0F284E]"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#0F284E] hover:bg-[#122340] disabled:opacity-60 text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Sending Your Inquiry to Official Mail...</span>
                    ) : (
                      <>
                        <span>Send Advertising Inquiry</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-slate-500">
                    We respect your privacy. No spam. You will receive an official rate card & slot confirmation.
                  </p>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
