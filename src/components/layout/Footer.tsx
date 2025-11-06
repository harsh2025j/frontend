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
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8">
      <div className="container mx-auto px-6 ">

        <div className="flex flex-col md:flex-row md:justify-between md:items-start border-b border-gray-700 pb-10">
          <div className="mb-8 flex justify-between flex-col md:mb-0 text-center md:text-left">
            <div className="mb-8 md:mb-0 ">
              <Image
                src={logo}
                alt="MediaTech Logo"
                className="h-12 w-auto mx-auto md:mx-0"
              />
            </div>
            <div className="flex justify-center md:justify-start gap-4">
              <Image src={google} alt="Google Play" className="h-20 w-36" />
              <Image src={apple} alt="App Store" className="h-20 w-36" />
            </div>

            <p className="text-sm leading-relaxed font-merriweather font-bold text-white mb-4">
              Address: XXXXXXXX, Lucknow, India <br />
              Support: +91-123456789 <br />
              Email: info@yournewswebsite.com
            </p>

            <div className="flex justify-center items-center md:justify-start gap-4">
              <h4 className="" >Folllow us.</h4>
              <FaFacebookF className="h-5 w-5 hover:text-blue-500 cursor-pointer" />
              <FaInstagram className="h-5 w-5 hover:text-pink-500 cursor-pointer" />
              <FaWhatsapp className="h-5 w-5 hover:text-green-500 cursor-pointer" />
              <FaTwitter className="h-5 w-5 hover:text-sky-500 cursor-pointer" />
              <FaTelegramPlane className="h-5 w-5 hover:text-blue-400 cursor-pointer" />
              <FaLinkedinIn className="h-5 w-5 hover:text-blue-600 cursor-pointer" />
              <FaYoutube className="h-5 w-5 hover:text-red-600 cursor-pointer" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-8 text-center md:text-left">
            <div>
              <h3 className="font-semibold mb-3">Products</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#">Top Stories</Link>
                </li>
                <li>
                  <Link href="#">Supreme Court</Link>
                </li>
                <li>
                  <Link href="#">High Court</Link>
                </li>
                <li>
                  <Link href="#">Tax</Link>
                </li>
                <li>
                  <Link href="#">Know the law</Link>
                </li>
                <li>
                  <Link href="#">International</Link>
                </li>
                <li>
                  <Link href="#">Environment</Link>
                </li>
                {/* <li>
                  <Link href="#">Digests</Link>
                </li>
                <li>
                  <Link href="#">Arbitration</Link>
                </li>
                <li>
                  <Link href="#">Law Schools</Link>
                </li>
                <li>
                  <Link href="#">Events Corner</Link>
                </li>
                <li>
                  <Link href="#">Job Updates</Link>
                </li>
                <li>
                  <Link href="#">Book Review</Link>
                </li>
                <li>
                  <Link href="#">Podcasts</Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Services</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#">Law Schools Corner</Link>
                </li>
                <li>
                  <Link href="#">Call For Papers</Link>
                </li>
                <li>
                  <Link href="#">Competitions</Link>
                </li>
                <li>
                  <Link href="#">Internships</Link>
                </li>
                <li>
                  <Link href="#">Law School Articles</Link>
                </li>
                <li>
                  <Link href="#">Scholarships/Fellowships</Link>
                </li>
                <li>
                  <Link href="#">School Admission</Link>
                </li>
                {/* <li>
                  <Link href="#">Events</Link>
                </li>
                <li>
                  <Link href="#">Job Updates</Link>
                </li>
                <li>
                  <Link href="#">Law Firm Articles</Link>
                </li> */}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#">Who We Are</Link>
                </li>
                <li>
                  <Link href="#">Contact Us</Link>
                </li>
                <li>
                  <Link href="#">Advertise With Us</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#">Who We Are</Link>
                </li>
                <li>
                  <Link href="#">Contact Us</Link>
                </li>
                <li>
                  <Link href="#">Advertise With Us</Link>
                </li>
                <li>
                  <Link href="#">Careers</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
                <li>
                  <Link href="#">Terms & Conditions</Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-400">
          2025 © All Rights Reserved @DIFMO Pvt. Ltd.
        </div>
      </div>
    </footer>
  );
}
