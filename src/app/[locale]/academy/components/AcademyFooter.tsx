"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Calendar,
  Scale,
  BookOpen,
  HelpCircle,
  Linkedin,
  Facebook,
  Instagram,
  Youtube
} from 'lucide-react';

export default function AcademyFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#07172C] text-white pt-12 pb-8 border-t border-white/10 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.1fr_1.4fr] gap-10 lg:gap-8 pb-10">
          
          {/* Column 1: Brand & Socials */}
          <div className="flex flex-col">
            <Link href="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-12 h-12 flex-shrink-0 relative">
                <Image
                  src="/logo-gold.png"
                  alt="Sajjad Husain Legal Academy Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-serif font-bold text-base sm:text-lg uppercase tracking-wider leading-tight group-hover:text-[#C9A227] transition-colors">
                  Sajjad Husain
                </span>
                <span className="text-[#C9A227] font-serif italic text-xs sm:text-sm font-semibold leading-tight mt-0.5">
                  Legal Academy
                </span>
              </div>
            </Link>

            <p className="text-gray-300/80 text-xs sm:text-[13px] leading-relaxed mb-6 max-w-sm font-normal">
              Empowering future legal professionals with quality education, practical exposure, and ethical values.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:border-[#C9A227] hover:bg-[#C9A227]/20 transition-all cursor-pointer"
                aria-label="LinkedIn"
              >
                <Linkedin size={15} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:border-[#C9A227] hover:bg-[#C9A227]/20 transition-all cursor-pointer"
                aria-label="Facebook"
              >
                <Facebook size={15} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:border-[#C9A227] hover:bg-[#C9A227]/20 transition-all cursor-pointer"
                aria-label="Instagram"
              >
                <Instagram size={15} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-white/80 hover:text-white hover:border-[#C9A227] hover:bg-[#C9A227]/20 transition-all cursor-pointer"
                aria-label="YouTube"
              >
                <Youtube size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-serif font-bold text-white text-[15px] mb-4 tracking-wide">
              Quick Links
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-[13px]">
              <li>
                <Link
                  href="/"
                  className="text-[#C9A227] underline decoration-[#C9A227] underline-offset-4 font-semibold hover:text-[#e0b738] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="text-white/75 hover:text-white transition-colors"
                >
                  Courses
                </Link>
              </li>
              <li>
                <Link
                  href="/academy/certificates/verify"
                  className="text-white/75 hover:text-white transition-colors"
                >
                  Verify Certificate
                </Link>
              </li>
              <li>
                <Link
                  href="/internships"
                  className="text-white/75 hover:text-white transition-colors"
                >
                  Internships
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-white/75 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white/75 hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="font-serif font-bold text-white text-[15px] mb-4 tracking-wide">
              Resources
            </h3>
            <ul className="space-y-3 text-xs sm:text-[13px]">
              <li>
                <Link
                  href="/academy/certificates/verify"
                  className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors group"
                >
                  <ShieldCheck size={16} className="text-[#C9A227] group-hover:scale-105 transition-transform flex-shrink-0" />
                  <span>Verify Certificate</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/competitions"
                  className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors group"
                >
                  <Calendar size={16} className="text-[#C9A227] group-hover:scale-105 transition-transform flex-shrink-0" />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors group"
                >
                  <Scale size={16} className="text-[#C9A227] group-hover:scale-105 transition-transform flex-shrink-0" />
                  <span>Legal Updates</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/notes"
                  className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors group"
                >
                  <BookOpen size={16} className="text-[#C9A227] group-hover:scale-105 transition-transform flex-shrink-0" />
                  <span>Study Materials</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/contact#faq"
                  className="inline-flex items-center gap-2 text-white/75 hover:text-white transition-colors group"
                >
                  <HelpCircle size={16} className="text-[#C9A227] group-hover:scale-105 transition-transform flex-shrink-0" />
                  <span>FAQs</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h3 className="font-serif font-bold text-white text-[15px] mb-4 tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-3.5 text-xs sm:text-[13px]">
              <li>
                <a
                  href="mailto:sajjad.husainlawassociates@gmail.com"
                  className="flex items-start gap-2.5 text-white/80 hover:text-white transition-colors group"
                >
                  <Mail size={16} className="text-[#C9A227] mt-0.5 flex-shrink-0 group-hover:scale-105 transition-transform" />
                  <span className="break-all">sajjad.husainlawassociates@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+917089009786"
                  className="flex items-center gap-2.5 text-white/80 hover:text-white transition-colors group"
                >
                  <Phone size={16} className="text-[#C9A227] flex-shrink-0 group-hover:scale-105 transition-transform" />
                  <span>+91 70890 09786</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-white/80">
                <MapPin size={16} className="text-[#C9A227] mt-0.5 flex-shrink-0" />
                <address className="not-italic leading-relaxed text-gray-300/90">
                  Block C, High Court, Advocates Chamber-315, Lucknow - Ayodhya Rd, Gomti Nagar, Lucknow 226010
                </address>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-5 mt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p className="order-2 md:order-1 text-center md:text-left">
            © {currentYear} Sajjad Husain Legal Academy. All Rights Reserved.
          </p>
          
          <div className="order-1 md:order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-white/75">
            <Link
              href="/academy/certificates/verify"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ShieldCheck size={14} className="text-[#C9A227]" />
              <span>Verify Certificate</span>
            </Link>
            <span className="text-white/20 select-none">|</span>
            <Link
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <span className="text-white/20 select-none">|</span>
            <Link
              href="/terms"
              className="hover:text-white transition-colors"
            >
              Terms &amp; Conditions
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
