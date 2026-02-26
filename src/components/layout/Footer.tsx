"use client";

// import Link from "next/link";
import { Link } from "@/i18n/routing";
import logo from "../../../public/logo-gold.png";
import apple from "../../../public/applestore.jpeg";
import google from "../../../public/playbutton.jpeg";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaTelegramPlane,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { Mail, Phone, MapPin, Scale } from "lucide-react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { AppDispatch, RootState } from "@/data/redux/store";
import { fetchCategories } from "@/data/features/category/categoryThunks";
import { Category } from "@/data/features/category/category.types";

export default function Footer() {
  const dispatch = useDispatch<AppDispatch>();
  const { categories } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Helper to get all descendants (subcategories)
  const getAllSubCategories = (cats: Category[]): Category[] => {
    if (!cats) return [];
    let subs: Category[] = [];
    cats.forEach((cat) => {
      if (cat.children && cat.children.length > 0) {
        subs = [...subs, ...cat.children];
        subs = [...subs, ...getAllSubCategories(cat.children)];
      }
    });
    return subs;
  };

  const subCategories = getAllSubCategories(categories);

  const socialLinks = [
    { icon: FaFacebookF, href: "https://www.facebook.com/advocatesajjadofficial", color: "hover:bg-blue-600", label: "Facebook" },
    { icon: FaInstagram, href: "https://www.instagram.com/sajjad_husain_law_associates/?hl=en", color: "hover:bg-pink-600", label: "Instagram" },
    { icon: FaXTwitter, href: "https://x.com/advocatesajjad", color: "hover:bg-black", label: "X (Twitter)" },
    { icon: FaTelegramPlane, href: "https://t.me/sajjadhusainlaw", color: "hover:bg-blue-600", label: "Telegram" },
    { icon: FaLinkedinIn, href: "https://www.linkedin.com/in/sajjad-husain-associates-law-31715675/", color: "hover:bg-blue-700", label: "LinkedIn" },
    { icon: FaYoutube, href: "https://www.youtube.com/@SajjadHusainLawAssociates", color: "hover:bg-red-600", label: "YouTube" },
  ];

  const resourceLinks = [
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Advertise With Us", href: "/advertise" },
    { name: "Careers", href: "/careers" },
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Conditions", href: "/terms" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-[#0a1628] via-[#122340] to-[#1a2f4d] text-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="transform p-2 rounded-sm hover:scale-105 transition-transform duration-300 -ml-2">
              <Link href="/" className="flex items-center gap-3 group text-decoration-none">
                <div className="relative">
                  <Image src={logo} alt="Sajjad Husain Law Associates" className="object-contain" width={50} height={50} />
                  <div className="absolute -inset-1 bg-white/10 rounded-full blur-sm opacity-0 "></div>
                </div>
                <div className="block">
                  <h1 className="text-base sm:text-xl font-bold text-white leading-tight">
                    Sajjad Husain Law Associates
                  </h1>
                  <p className="flex text-[10px] sm:text-xs text-blue-200 items-center gap-1 mt-1">
                    <Scale size={12} className="text-[#C9A227]" />
                    Excellence in Legal Services
                  </p>
                </div>
              </Link>
            </div>

            <p className="text-blue-100 leading-relaxed text-sm">
              Dedicated to providing exceptional legal services with integrity, expertise, and commitment to justice.
            </p>

            {/* App Download Buttons */}
            <div className="flex gap-3">
              <a
                href="https://play.google.com/store/apps/details?id=com.sajjadhusainlawassociates.sajjadlaw"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg bg-white rounded-md px-2 py-1 flex items-center"
              >
                <Image src={google} alt="Get it on Google Play" className="h-10 w-auto" />
              </a>
              {/* <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <svg
                  width="180"
                  height="60"
                  viewBox="0 0 220 60"
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-auto"
                >
                  <g fill="white">

                    <path d="M38.3 30.2c-.1-5.3 4.3-7.9 4.5-8-2.4-3.5-6.1-4-7.4-4.1-3.1-.3-6 1.8-7.6 1.8-1.5 0-3.9-1.8-6.4-1.7-3.3 0-6.3 1.9-8 4.9-3.4 5.8-.9 14.4 2.4 19.1 1.6 2.3 3.5 4.8 6.1 4.7 2.4-.1 3.4-1.6 6.3-1.6s3.8 1.6 6.4 1.6c2.7 0 4.4-2.3 6-4.6 1.8-2.6 2.6-5.2 2.7-5.3-.1-.1-5.1-2-5.1-7.8z" />
                    <path d="M33.6 15.2c1.3-1.6 2.2-3.9 2-6.1-1.9.1-4.3 1.3-5.7 2.9-1.2 1.4-2.3 3.7-2 5.9 2.1.2 4.3-1.1 5.7-2.7z" />


                    <text
                      x="65"
                      y="26"
                      fontSize="12"
                      fontFamily="Arial, Helvetica, sans-serif"
                    >
                      Download on the
                    </text>
                    <text
                      x="65"
                      y="44"
                      fontSize="20"
                      fontWeight="bold"
                      fontFamily="Arial, Helvetica, sans-serif"
                    >
                      App Store
                    </text>
                  </g>
                </svg>
              </a> */}


              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg bg-white rounded-md px-2 py-1 flex items-center"
              >


                <Image src={apple} alt="Download on App Store" className="h-10 w-auto" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5 group-hover:text-[#C9A227]/90 transition-colors" />
                <p className="text-blue-100 group-hover:text-white transition-colors">
                  Block-C, High Court,Advocates Chamber.515,<br />
                  Lucknow - Ayodhya Rd, Gomti Nagar, Lucknow 226010<br />
                </p>
              </div>

              <a href="tel:+917080909786" className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
                <Phone className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5 group-hover:text-[#C9A227]/90 transition-colors" />
                <span className="text-blue-100 group-hover:text-white transition-colors">+91 70809 09786</span>
              </a>

              <a href="mailto:sajjadhusainlawassociates@gmail.com" className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
                <Mail className="w-5 h-5 text-[#C9A227] flex-shrink-0 mt-0.5 group-hover:text-[#C9A227]/90 transition-colors" />
                <span className="text-blue-100 group-hover:text-white transition-colors break-all">
                  sajjadhusainlawassociates@gmail.com
                </span>
              </a>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-semibold mb-4 text-lg">Follow Us</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={index}
                      target="_blank"
                      rel="noopener noreferrer"
                      href={social.href}
                      aria-label={social.label}
                      className={`bg-white/10 backdrop-blur-sm p-3 rounded-lg ${social.color} transition-all duration-300 transform hover:scale-110 hover:shadow-lg border border-white/20`}
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Categories (Roots) */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white relative inline-block">
                Categories
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></span>
              </h3>
              <ul className="space-y-2.5">
                {categories.slice(0, 13).map((category: Category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-blue-100 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm group"
                    >
                      <span className="group-hover:underline underline-offset-4">{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sub Categories */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white relative inline-block">
                Sub Categories
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></span>
              </h3>
              <ul className="space-y-2.5">
                {subCategories.slice(0, 13).map((category: Category) => (
                  <li key={category.id}>
                    <Link
                      href={`/category/${category.slug}`}
                      className="text-blue-100 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm group"
                    >
                      <span className="group-hover:underline underline-offset-4">{category.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-white relative inline-block">
                Resources
                <span className="absolute bottom-0 left-0 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-transparent"></span>
              </h3>
              <ul className="space-y-2.5">
                {resourceLinks.slice(0, 13).map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.href}
                      className="text-blue-100 hover:text-white hover:translate-x-1 inline-block transition-all duration-300 text-sm group"
                    >
                      <span className="group-hover:underline underline-offset-4">{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-blue-200">
            © {new Date().getFullYear()} Sajjad Husain Law Associates. All Rights Reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy-policy" className="text-blue-200 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-blue-200 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-blue-200 hover:text-white transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}