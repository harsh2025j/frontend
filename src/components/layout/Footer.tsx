"use client";

import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/data/redux/store";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";

import logo from "../../../public/logo-gold.png";
import google from "../../../public/playbutton.jpeg";
import apple from "../../../public/applestore.jpeg";

import {
  MapPin,
  Phone,
  Mail,
  Scale,
  ChevronRight,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaTelegram,
  FaLinkedinIn,
  FaYoutube,
  FaWhatsapp,
} from "react-icons/fa6";

export default function Footer() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);

  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories]);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setIsSubscribed(true);
      setNewsletterEmail("");
    }
  };

  const currentYear = new Date().getFullYear();

  // Social Profiles
  const socialLinks = [
    {
      icon: FaFacebookF,
      href: "https://www.facebook.com/advocatesajjadofficial",
      color: "hover:bg-[#1877F2]",
      label: "Facebook",
    },
    {
      icon: FaInstagram,
      href: "https://www.instagram.com/sajjad_husain_law_associates/?hl=en",
      color: "hover:bg-[#E4405F]",
      label: "Instagram",
    },
    {
      icon: FaXTwitter,
      href: "https://x.com/advocatesajjad",
      color: "hover:bg-black",
      label: "X (Twitter)",
    },
    {
      icon: FaTelegram,
      href: "https://t.me/sajjadhusainlaw",
      color: "hover:bg-[#229ED9]",
      label: "Telegram",
    },
    {
      icon: FaLinkedinIn,
      href: "https://www.linkedin.com/in/sajjad-husain-associates-law-31715675/",
      color: "hover:bg-[#0A66C2]",
      label: "LinkedIn",
    },
    {
      icon: FaYoutube,
      href: "https://www.youtube.com/@SajjadHusainLawAssociates",
      color: "hover:bg-[#FF0000]",
      label: "YouTube",
    },
    {
      icon: FaWhatsapp,
      href: "https://wa.me/917080909786",
      color: "hover:bg-[#25D366]",
      label: "WhatsApp",
    },
  ];

  // 1. Courts & Judgments (LiveLaw Model)
  const courtLinks = [
    { name: "Supreme Court of India", href: "/supreme-court" },
    { name: "High Courts Registry (25 Courts)", href: "/high-court" },
    { name: "Landmark Judgments & Orders", href: "/judgments" },
    { name: "Cause Lists & Case Tracker", href: "/cases" },
    { name: "Live Court Display Boards", href: "/display-boards" },
    { name: "Top Legal Stories & News", href: "/top-stories" },
    { name: "Judicial Bench Directory", href: "/judges" },
    { name: "Hindi Legal News (हिंदी)", href: "/hi/top-stories" },
  ];

  // 2. Legislation & Knowledge (LiveLaw Bare Acts Model)
  const legislationLinks = [
    { name: "Bare Acts & Central Statutes", href: "/legal-documents" },
    { name: "Know The Law (Legal Guides)", href: "/know-the-law" },
    { name: "Corporate, Tax & GST Laws", href: "/tax" },
    { name: "Environmental & NGT Orders", href: "/environment" },
    { name: "International Law & Treaties", href: "/international" },
    { name: "Legal Document Templates", href: "/tools/documents" },
    { name: "Legal Drafting Assistant", href: "/tools/drafting" },
    { name: "Legal Research Portal", href: "/tools/research" },
  ];

  // 3. Opportunities & Student Hub (Lawctopus Model)
  const studentLinks = [
    { name: "Legal Internships & Clerks", href: "/internships" },
    { name: "Call for Papers & Journals", href: "/call-for-papers" },
    { name: "Moot Court Competitions", href: "/competitions" },
    { name: "Law School Admissions & CLAT", href: "/law-schools" },
    { name: "Legal Fellowships & Grants", href: "/scholarships" },
    { name: "Sajjad Husain Legal Academy", href: "/academy" },
    { name: "Online Certificate Courses", href: "/academy/courses" },
    { name: "Verify Student Certificate", href: "/academy/verify-certificate" },
  ];

  // 4. Chambers, Tools & Firm
  const chamberLinks = [
    { name: "Legal Tools Directory", href: "/tools" },
    { name: "Dispute Settlement Portal", href: "/tools/settlement" },
    { name: "Document Health Check", href: "/tools/health-check" },
    { name: "Schedule Consultation", href: "/book-appointment" },
    { name: "About Chambers & Founder", href: "/about" },
    { name: "Editorial & Fact-Check Policy", href: "/editorial-policy" },
    { name: "Chamber Careers & Hiring", href: "/careers" },
    { name: "Advertise & Media Kit", href: "/advertise" },
  ];

  // Fallback legal categories if Redux is loading
  const fallbackCategories = [
    { name: "Constitution Bench", slug: "constitution-bench" },
    { name: "Bail Jurisprudence", slug: "bail-jurisprudence" },
    { name: "Criminal Law", slug: "criminal-law" },
    { name: "Arbitration & ADR", slug: "arbitration" },
    { name: "Insolvency (IBC)", slug: "ibc" },
    { name: "Cyber Law", slug: "cyber-law" },
    { name: "Taxation & GST", slug: "taxation" },
    { name: "Intellectual Property", slug: "ipr" },
    { name: "Environmental Law", slug: "environmental-law" },
    { name: "Service & Labour Laws", slug: "service-laws" },
  ];

  const popularCategories =
    categories && categories.length > 0
      ? categories.slice(0, 10)
      : fallbackCategories;

  return (
    <footer className="bg-[#07172C] text-white border-t-4 border-[#C9A227] font-body selection:bg-[#C9A227] selection:text-[#07172C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* =========================================================================
            NEWSLETTER SUBSCRIPTION (LiveLaw Style: font-size 18px / 14px)
            ========================================================================= */}
        <div className="bg-[#0A2342] border border-[#C9A227]/30 rounded-lg p-6 sm:p-8 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-xl">
              <h3 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight leading-snug">
                Subscribe to Daily Legal Updates
              </h3>
              <p className="text-slate-300 text-[14px] mt-1.5 leading-relaxed">
                Receive authentic Supreme Court & High Court judgments, daily cause lists, legal explainers, and verified internship opportunities directly in your inbox.
              </p>
            </div>

            <div className="w-full lg:w-auto shrink-0">
              {isSubscribed ? (
                <div className="px-5 py-3 rounded-lg bg-emerald-900/40 border border-emerald-500/50 text-emerald-300 text-[14px] font-medium">
                  Thank you for subscribing to daily legal updates!
                </div>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex flex-col sm:flex-row gap-2.5 max-w-md w-full"
                >
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    placeholder="Enter your email address..."
                    className="w-full px-4 py-2.5 rounded-lg bg-white/10 border border-white/20 text-white placeholder-slate-400 text-[14px] focus:outline-none focus:border-[#C9A227] transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B89220] active:bg-[#A6821C] text-[#07172C] font-semibold text-[14px] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
              <p className="text-[12px] text-slate-400 mt-2">
                Editorial updates only. No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>

        {/* =========================================================================
            MAIN 5-COLUMN DIRECTORY GRID (LiveLaw Typography: 16px headings, 14px links)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Column 1: Chambers Masthead & Contact */}
          <div className="sm:col-span-2 md:col-span-12 lg:col-span-4 flex flex-col justify-between pr-0 lg:pr-4">
            <div>
              {/* Brand Header */}
              <Link href="/" className="inline-flex items-center gap-3.5 group mb-4">
                <div className="relative w-12 h-12 shrink-0">
                  <Image
                    src={logo}
                    alt="Sajjad Husain Law Associates"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-[18px] sm:text-[20px] font-bold text-white leading-tight tracking-tight group-hover:text-[#C9A227] transition-colors">
                    Sajjad Husain Law Associates
                  </h2>
                  <p className="flex items-center gap-1.5 text-[12px] sm:text-[13px] text-[#C9A227] font-medium mt-0.5 tracking-wide">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Advocates & Legal Technology Portal</span>
                  </p>
                </div>
              </Link>

              {/* Chamber Mission */}
              <p className="text-slate-300 text-[13px] sm:text-[14px] leading-relaxed mb-6 font-normal">
                India&apos;s premier legal technology and court reporting platform. Delivering authentic Supreme Court and High Court judgments, case intelligence, legal education, and professional drafting tools with editorial integrity.
              </p>

              {/* Verified Contact Details (LiveLaw: 14px) */}
              <div className="space-y-3 text-[14px] mb-6">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#C9A227] shrink-0 mt-0.5" />
                  <address className="not-italic leading-relaxed text-slate-300">
                    Chamber No. 515, Block-C, High Court Advocates Chamber,<br />
                    Lucknow – Ayodhya Road, Gomti Nagar, Lucknow, UP – 226010
                  </address>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <a
                    href="tel:+917080909786"
                    className="hover:text-[#C9A227] transition-colors font-medium text-slate-200"
                  >
                    +91 70809 09786
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-[#C9A227] shrink-0" />
                  <a
                    href="mailto:sajjadhusainlawassociates@gmail.com"
                    className="hover:text-[#C9A227] transition-colors text-slate-200 break-all"
                  >
                    sajjadhusainlawassociates@gmail.com
                  </a>
                </div>
              </div>
            </div>

            {/* Social Channels & Real App Store Badges */}
            <div className="space-y-4 pt-2">
              <div>
                <span className="text-[12px] font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
                  Connect With Chambers
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {socialLinks.map((social, idx) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={idx}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-slate-200 ${social.color} hover:text-white transition-all duration-200 border border-white/10`}
                        title={social.label}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Official Mobile App Badges (LiveLaw Style) */}
              <div className="pt-2">
                <span className="text-[12px] font-semibold text-slate-300 uppercase tracking-wider block mb-2">
                  Download Official App
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="https://play.google.com/store/apps/details?id=com.sajjadhusainlawassociates.sajjadlaw"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-2 py-1 flex items-center hover:scale-105 transition-transform"
                    title="Get it on Google Play"
                  >
                    <Image
                      src={google}
                      alt="Get it on Google Play"
                      className="h-8 w-auto object-contain"
                    />
                  </a>

                  <a
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white rounded-lg px-2 py-1 flex items-center hover:scale-105 transition-transform"
                    title="Download on the App Store"
                  >
                    <Image
                      src={apple}
                      alt="Download on App Store"
                      className="h-8 w-auto object-contain"
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: Courts & Judgments (LiveLaw: Heading 16px, Links 14px, line-height 2) */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-2">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide mb-3 pb-2 border-b-2 border-[#C9A227]">
              Courts & Law
            </h3>
            <ul className="space-y-1">
              {courtLinks.map((link, idx) => (
                <li key={idx} className="leading-[2]">
                  <Link
                    href={link.href}
                    className="text-[14px] text-slate-200 hover:text-[#C9A227] transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9A227]/70 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Legislation & Knowledge (LiveLaw: Heading 16px, Links 14px, line-height 2) */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-2">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide mb-3 pb-2 border-b-2 border-[#C9A227]">
              Legislation
            </h3>
            <ul className="space-y-1">
              {legislationLinks.map((link, idx) => (
                <li key={idx} className="leading-[2]">
                  <Link
                    href={link.href}
                    className="text-[14px] text-slate-200 hover:text-[#C9A227] transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9A227]/70 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Opportunities & Student Hub (LiveLaw: Heading 16px, Links 14px, line-height 2) */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-2">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide mb-3 pb-2 border-b-2 border-[#C9A227]">
              Opportunities
            </h3>
            <ul className="space-y-1">
              {studentLinks.map((link, idx) => (
                <li key={idx} className="leading-[2]">
                  <Link
                    href={link.href}
                    className="text-[14px] text-slate-200 hover:text-[#C9A227] transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9A227]/70 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Legal Tools & Firm (LiveLaw: Heading 16px, Links 14px, line-height 2) */}
          <div className="sm:col-span-1 md:col-span-3 lg:col-span-2">
            <h3 className="text-[15px] sm:text-[16px] font-semibold text-white tracking-wide mb-3 pb-2 border-b-2 border-[#C9A227]">
              Tools & Firm
            </h3>
            <ul className="space-y-1">
              {chamberLinks.map((link, idx) => (
                <li key={idx} className="leading-[2]">
                  <Link
                    href={link.href}
                    className="text-[14px] text-slate-200 hover:text-[#C9A227] transition-colors flex items-center gap-1.5 group"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#C9A227]/70 group-hover:text-[#C9A227] group-hover:translate-x-0.5 transition-all shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* =========================================================================
            TRENDING TOPICS STRIP (LiveLaw Style: 13px tag pills)
            ========================================================================= */}
        <div className="py-6 border-b border-white/10 flex flex-wrap items-center gap-2.5 sm:gap-3 text-[13px]">
          <span className="text-[#C9A227] font-semibold uppercase tracking-wider text-[12px] shrink-0">
            Trending Topics:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {popularCategories.map((cat: Category | { name: string; slug: string }, idx: number) => (
              <Link
                key={"id" in cat ? cat.id : idx}
                href={`/category/${cat.slug}`}
                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#C9A227]/20 border border-white/10 hover:border-[#C9A227] text-slate-200 hover:text-white transition-all text-[13px] font-medium"
              >
                {cat.name}
              </Link>
            ))}
            <Link
              href="/top-stories"
              className="text-[#C9A227] hover:underline underline-offset-4 text-[13px] font-semibold ml-1 flex items-center gap-1"
            >
              <span>Explore all</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            BAR COUNCIL OF INDIA (BCI) STATUTORY DISCLAIMER (LiveLaw Style: 13px)
            ========================================================================= */}
        <div className="py-6 border-b border-white/10 text-[13px] sm:text-[13.5px] text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white font-semibold">Bar Council of India Disclaimer: </strong>
            As per the rules of the Bar Council of India, advocates and law firms are not permitted to solicit work or advertise in any manner. Sajjad Husain Law Associates maintains this website solely for court reporting, legal news dissemination, legal education, and judicial research for public benefit. By accessing this platform, you acknowledge that you are seeking information of your own accord and that no advocate-client relationship is created.
          </p>
        </div>

        {/* =========================================================================
            BOTTOM COPYRIGHT & MANDATORY POLICY LINKS (LiveLaw Style: 14px / 12px)
            ========================================================================= */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] sm:text-[14px] text-slate-300">
          <p className="text-center md:text-left">
            <span suppressHydrationWarning>© {currentYear}</span>{" "}
            <strong className="text-white font-medium">Sajjad Husain Law Associates</strong>. All rights reserved.
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-[13px] sm:text-[14px] text-slate-200">
            <Link href="/privacy-policy" className="hover:text-[#C9A227] transition-colors">
              Privacy Policy
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/terms" className="hover:text-[#C9A227] transition-colors">
              Terms & Conditions
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/disclaimer" className="hover:text-[#C9A227] transition-colors">
              Legal Disclaimer
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/cookie-policy" className="hover:text-[#C9A227] transition-colors">
              Cookie Policy
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/editorial-policy" className="hover:text-[#C9A227] transition-colors">
              Editorial Policy
            </Link>
            <span className="text-slate-600">·</span>
            <Link href="/contact" className="hover:text-[#C9A227] transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
