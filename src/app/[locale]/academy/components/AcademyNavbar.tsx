"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, BookOpen, LayoutDashboard, LogOut, ChevronDown, AlertTriangle, Search, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import logo from "../../../../../public/logo.png";
import { useAuth } from '@/data/features/auth/useAuthActions';
import { useAppDispatch } from '@/data/redux/hooks';
import { logoutUserAsync } from '@/data/features/auth/authThunks';
import { useRouter } from 'next/navigation';

export default function AcademyNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logoutUserAsync());
    router.push('/auth/login');
    setIsMenuOpen(false);
    setShowLogoutModal(false);
  };

  return (
    <>
      <header className="w-full border-b border-gray-100 bg-white z-[100] fixed top-0 left-0 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-gold.png" alt="Sajjad Husain Logo" width={40} height={40} className="object-contain" priority />
            <div className="flex flex-col hidden sm:flex">
              <span className="text-[#122340] font-serif font-bold text-base leading-none tracking-wider uppercase">Sajjad Husain</span>
              <span className="text-[#C9A227] font-serif italic text-xs leading-none mt-1">Legal Academy</span>
            </div>
          </Link>

          {/* Center Search Bar */}
          <div className="hidden md:flex flex-1 justify-center px-8">
            <div className="relative w-full max-w-md hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search for courses..."
                className="w-full pl-9 pr-4 py-2 rounded-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C9A227]/50 focus:border-[#C9A227] transition-all text-sm text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>

          {/* Desktop Right Side */}
          <div className="hidden md:flex items-center gap-8 h-full">
            <Link
              href="/courses"
              className="flex items-center gap-2 h-full hover:text-[#C9A227] whitespace-nowrap transition-colors text-[#122340]/80 font-medium"
            >
              <ShoppingCart size={20} />
              Courses
            </Link>

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

          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-[#122340] hover:text-[#C9A227] transition-colors">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 w-full h-[calc(100vh-64px)] overflow-y-auto shadow-lg absolute top-16 left-0 z-40 pb-20">
            <div className="flex flex-col p-5 gap-2">
              {user && (
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#122340] text-white flex items-center justify-center font-bold text-lg">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
              )}
              <Link href="/courses" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 hover:text-[#C9A227]" onClick={() => setIsMenuOpen(false)}>
                <BookOpen size={16} /> Browse Courses
              </Link>
              <Link href="/dashboard" className="flex items-center gap-2 py-3 text-sm font-medium text-gray-700 hover:text-[#C9A227]" onClick={() => setIsMenuOpen(false)}>
                <LayoutDashboard size={16} /> My Learning
              </Link>

              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-gray-200">
                {user ? (
                  <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center justify-center gap-2 rounded-full border border-red-200 text-red-600 px-5 py-2.5 text-sm font-medium hover:bg-red-50 transition-colors">
                    <LogOut size={16} /> Logout
                  </button>
                ) : (
                  <div className="flex gap-4">
                    <Link href="/auth/login" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-full border border-[#C9A227] text-[#C9A227] px-5 py-2 text-sm font-medium hover:bg-[#C9A227] hover:text-white transition-colors">
                        LOGIN
                      </button>
                    </Link>
                    <Link href="/auth/signup" className="flex-1" onClick={() => setIsMenuOpen(false)}>
                      <button className="w-full rounded-full bg-[#C9A227] text-white px-5 py-2 text-sm font-medium hover:bg-[#b39022] transition-colors">
                        START LEARNING
                      </button>
                    </Link>
                  </div>
                )}
              </div>
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
                className="flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 shadow-[0_4px_12px_rgba(220,38,38,0.3)] transition-all hover:-translate-y-0.5"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
