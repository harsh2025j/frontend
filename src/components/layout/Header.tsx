// components/layout/Header.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

export default function Header() {
  const [search, setSearch] = useState("");

  return (
    <header className="w-full border-b border-gray-200">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-12 w-12 rounded-full"
            />
            <span className="text-xs tracking-widest">MEDIATECH</span>
          </Link>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-2xl px-6">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-sm border border-gray-300 py-2 pl-4 pr-10 text-sm focus:border-black focus:outline-none"
            />
            <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button className="rounded-full bg-black px-6 py-2 text-white text-sm font-medium hover:opacity-80">
            SIGN IN
          </button>
          <button className="rounded-full border border-black px-6 py-2 text-sm font-medium hover:bg-black hover:text-white">
            SUBSCRIBE TO PREMIUM
          </button>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="bg-[#2F2F2F] text-white">
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-6 px-6 py-3 text-sm font-medium">
          <Link href="#">MediaTech Hindi</Link>
          <Link href="#">Top Stories</Link>
          <Link href="#">Supreme Court ▾</Link>
          <Link href="#">High Court ▾</Link>
          <Link href="#">News Updates</Link>
          <Link href="#">Articles</Link>
          <Link href="#">Law Schools ▾</Link>
          <Link href="#">Videos</Link>
          <Link href="#">Know The Law</Link>
          <Link href="#">Digests</Link>
          <Link href="#">Law Firms</Link>
          <Link href="#">More</Link>
        </div>
      </nav>
    </header>
  );
}
