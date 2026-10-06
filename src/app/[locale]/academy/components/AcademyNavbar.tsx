"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, LayoutDashboard, LogOut, ChevronDown, AlertTriangle, Heart, Loader2, ChevronRight, Facebook, Linkedin, Instagram, Search } from 'lucide-react';
import Image from 'next/image';
import logo from "../../../../../public/logo.png";
import { useAuth } from '@/data/features/auth/useAuthActions';
import { useAppDispatch } from '@/data/redux/hooks';
import { logoutUserAsync } from '@/data/features/auth/authThunks';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import AcademySearch from './AcademySearch';
import AcademyNotificationDropdown from './AcademyNotificationDropdown';

export default function AcademyNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { wishlist, openWishlist } = useWishlist();

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await dispatch(logoutUserAsync());
      router.push('/auth/login');
    } finally {
      setIsLoggingOut(false);
      setIsMenuOpen(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <header className="w-full border-b border-[#122340]/10 bg-[#F7F3EA] z-[100] sticky top-0 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-gold.png" alt="Sajjad Husain Logo" width={40} height={40} className="object-contain" priority />
            <div className="flex flex-col hidden lg:flex">
              <span className="text-[#122340] font-serif font-bold text-base leading-none tracking-wider uppercase">Sajjad Husain</span>
              <span className="text-[#C9A227] font-serif italic text-xs leading-none mt-1">Legal Academy</span>
            </div>
          </Link>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8 max-w-lg mx-auto">
            <AcademySearch />
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-6 h-full">
            {/* 1. Courses Navigation */}
            <Link
              href="/courses"
              className="flex items-center gap-1.5 h-full hover:text-[#C9A227] whitespace-nowrap transition-colors text-[#122340]/80 font-medium text-sm"
            >
              <BookOpen size={18} />
              <span>Courses</span>
            </Link>

            {/* 2. Wishlist Button */}
            <button
              onClick={openWishlist}
              className="group relative flex items-center gap-1.5 h-full hover:text-[#C9A227] whitespace-nowrap transition-colors text-[#122340]/80 font-medium text-sm py-2"
              aria-label="View Wishlist"
            >
              <div className="relative flex items-center justify-center mr-1">
                <Heart
                  size={18}
                  className="transition-colors group-hover:text-[#C9A227]"
                />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#122340] text-white text-[9px] font-bold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs border border-white">
                    {wishlist.length}
                  </span>
                )}
              </div>
              <span className="group-hover:text-[#C9A227] transition-colors">Wishlist</span>
            </button>

            {/* Notifications */}
            {user && (user._id || (user as any).id) && (
              <AcademyNotificationDropdown userId={user._id || (user as any).id} />
            )}

            <div className="flex items-center gap-4 relative">
            {user ? (
              <div className="relative group cursor-pointer flex items-center gap-2">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-9 h-9 rounded-full object-cover border border-[#122340]/10" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#C9A227] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-semibold text-[#122340]">{user.name}</span>
                <ChevronDown size={14} className="text-[#122340]/50 group-hover:text-[#122340] transition-colors" />

                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#C9A227] hover:bg-gray-50 rounded-lg transition-colors">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-[#122340]/80 hover:text-[#C9A227] text-sm font-medium transition-colors"
                >
                  LOGIN
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-[#C9A227] text-white px-5 py-2 hover:bg-[#b39022] text-sm font-bold transition-colors shadow-sm"
                >
                  START LEARNING
                </Link>
              </>
            )}
            </div>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (isMenuOpen) setIsMenuOpen(false);
              }}
              className="p-1.5 text-[#122340] hover:text-[#C9A227] transition-colors"
              aria-label="Toggle Search"
            >
              <Search size={22} />
            </button>
            {user && (user._id || (user as any).id) && (
              <AcademyNotificationDropdown userId={user._id || (user as any).id} />
            )}
            <button
              onClick={openWishlist}
              className="relative p-1.5 text-[#122340] hover:text-[#C9A227] transition-colors"
              aria-label="View Wishlist"
            >
              <Heart size={22} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#122340] text-white text-[9px] font-semibold h-4 min-w-4 px-1 rounded-full flex items-center justify-center shadow-xs border border-white">
                  {wishlist.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                if (isSearchOpen) setIsSearchOpen(false);
              }} 
              className="text-[#122340] hover:text-[#C9A227] transition-colors"
            >
              {isMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="md:hidden w-full bg-[#F7F3EA] border-t border-gray-200/60 p-4 absolute top-16 left-0 z-40 shadow-md animate-in slide-in-from-top-2 duration-200">
            <AcademySearch onSelectCourse={() => setIsSearchOpen(false)} />
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#F7F3EA] border-t border-gray-200/60 w-full h-[calc(100vh-64px)] overflow-y-auto shadow-lg absolute top-16 left-0 z-40 flex flex-col">
            <div className="flex-1 py-4">
              <Link href="/" className="block px-6 py-4 text-[15px] font-medium text-gray-800 border-b border-black/5" onClick={() => setIsMenuOpen(false)}>
                Home
              </Link>
              <Link href="/courses" className="flex items-center justify-between px-6 py-4 text-[15px] font-medium text-gray-800 border-b border-black/5 hover:text-[#C9A227]" onClick={() => setIsMenuOpen(false)}>
                Courses <ChevronRight size={16} className="text-gray-400" />
              </Link>
              <Link href="/about" className="flex items-center justify-between px-6 py-4 text-[15px] font-medium text-gray-800 border-b border-black/5 hover:text-[#C9A227]" onClick={() => setIsMenuOpen(false)}>
                About Us <ChevronRight size={16} className="text-gray-400" />
              </Link>
              <Link href="/contact" className="flex items-center justify-between px-6 py-4 text-[15px] font-medium text-gray-800 border-b border-black/5 hover:text-[#C9A227]" onClick={() => setIsMenuOpen(false)}>
                Contact Us <ChevronRight size={16} className="text-gray-400" />
              </Link>
            </div>
            
            <div className="p-6 pb-20 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full py-3.5 bg-[#C9A227] text-white text-[15px] font-bold rounded shadow-sm hover:bg-[#b39022] transition-colors">
                      My Dashboard
                    </button>
                  </Link>
                  <button onClick={() => setShowLogoutModal(true)} className="w-full py-3.5 bg-transparent border border-red-200 text-red-600 text-[15px] font-bold rounded shadow-sm hover:bg-red-50 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full py-3.5 bg-transparent border border-[#C9A227] text-[#C9A227] text-[15px] font-bold rounded hover:bg-[#C9A227] hover:text-white transition-colors">
                      Login
                    </button>
                  </Link>
                  <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                    <button className="w-full py-3.5 bg-[#C9A227] text-white text-[15px] font-bold rounded shadow-sm hover:bg-[#b39022] transition-colors">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#122340]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          ></div>

          {/* Modal Content */}
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <AlertTriangle className="text-red-500" size={28} />
              </div>
              <h3 className="text-xl font-extrabold text-gray-900 mb-2">Confirm Logout</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Are you sure you want to log out of the Academy? You will need to log in again to access your courses.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all hover:-translate-y-0.5 disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Logging out...</span>
                  </>
                ) : (
                  <span>Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
