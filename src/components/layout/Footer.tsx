"use client";

import Link from "next/link";
import logo from "../../assets/logo.png";
import apple from "../../../public/apple-button.svg";
import google from "../../../public/playbutton.svg";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaTwitter,
  FaTelegramPlane,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { Mail, Phone, MapPin } from "lucide-react";
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
    { icon: FaWhatsapp, href: "#", color: "hover:bg-green-600", label: "WhatsApp" },
    { icon: FaTwitter, href: "#", color: "hover:bg-sky-500", label: "Twitter" },
    { icon: FaLinkedinIn, href: "https://www.linkedin.com/in/sajjad-husain/", color: "hover:bg-blue-700", label: "LinkedIn" },
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
            <div className="transform bg-white p-2 rounded-sm hover:scale-105 transition-transform duration-300">
              <Image
                src={logo}
                alt="Sajjad Husain Law Associates Logo"
                className="h-14 w-auto"
              />
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
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <Image src={google} alt="Get it on Google Play" className="h-12 w-auto" />
              </a>
              <a
                href="#"
                target="_blank"
                rel="noopener noreferrer"
                className="transform hover:scale-105 transition-all duration-300 hover:shadow-lg"
              >
                <Image src={apple} alt="Download on App Store" className="h-12 w-auto" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3 group">
                <MapPin className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 group-hover:text-blue-300 transition-colors" />
                <p className="text-blue-100 group-hover:text-white transition-colors">
                  Block-C, High Court, Sajjad Husain, Advocates Chamber.515,<br />
                  Lucknow - Ayodhya Rd, Gomti Nagar,<br />
                  Lucknow, Faizabad, Uttar Pradesh 226010
                </p>
              </div>

              <a href="tel:07080909786" className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
                <Phone className="w-5 h-5 text-blue-400 flex-shrink-0 group-hover:text-blue-300 transition-colors" />
                <span className="text-blue-100 group-hover:text-white transition-colors">070809 09786</span>
              </a>

              <a href="mailto:sajjadhusainlawassociates@gmail.com" className="flex items-start gap-3 group hover:translate-x-1 transition-transform">
                <Mail className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5 group-hover:text-blue-300 transition-colors" />
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
                {categories.map((category: Category) => (
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
                {subCategories.map((category: Category) => (
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
                {resourceLinks.map((link, index) => (
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
