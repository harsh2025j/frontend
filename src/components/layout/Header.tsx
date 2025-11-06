"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import logo from "../../../public/logo.svg";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const navLinks = [
    "Home",
    "Latest News",
    "Judgments",
    "Interviews",
    "Explainers",
    "Business",
    "Innovation",
    "More ▾",
  ];

  return (
    <header className="w-full border-b border-gray-200 bg-white z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-20">
        <Link href="/" className="flex items-center">
          <Image
            src={logo}
            alt="Logo"
            className="object-contain"
            width={140}
            height={40}
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-base font-medium">
          {navLinks.map((label, i) => (
            <Link href="#" key={i} className="hover:text-black/70">
              {label}
            </Link>
          ))}
        </nav>

        {/* Auth Section */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm font-medium text-gray-800">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="rounded-full border border-black px-5 py-2 text-sm font-medium hover:bg-black hover:text-white"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin">
                <button className="rounded-full bg-black text-white px-5 py-2 hover:opacity-80 text-sm font-medium">
                  Sign in
                </button>
              </Link>
              <Link href="/auth/signup">
                <button className="rounded-full border border-black text-black px-5 py-2 hover:bg-black hover:text-white text-sm font-medium">
                  Sign up
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </header>
  );
}
