"use client";
import "./globals.css";
import { useDocTitle } from "@/hooks/useDocTitle";
import { Link } from "@/i18n/routing";
import { useEffect, useState } from "react";

export default function NotFound() {
  useDocTitle("Page Not Found");
  const [text, setText] = useState("");
  const fullText = "Something is missing...";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i));
      i++;
      if (i > fullText.length) clearInterval(interval);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <html>
      <body>
        <section className="bg-white flex items-center justify-center h-screen overflow-hidden animate-fadeIn">
          <div className="py-8 px-4 text-center">
            <h1 className="mb-4 text-[120px] lg:text-[180px] font-extrabold text-gray-300 animate-float">
              404
            </h1>

            <p className="mb-3 text-3xl md:text-4xl font-bold text-gray-800 h-10">
              {text}
            </p>

            <p className="text-lg font-light text-gray-600 max-w-md mx-auto">
              Sorry, this page does not exist or was moved somewhere else.
            </p>

            <Link
              href="/"
              className="inline-flex bg-blue-600 text-white px-6 py-3 text-sm font-medium rounded-lg transition transform hover:scale-105 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 mt-6"
            >
              Back to Homepage
            </Link>
          </div>
        </section>
      </body>
    </html>
  );
}
