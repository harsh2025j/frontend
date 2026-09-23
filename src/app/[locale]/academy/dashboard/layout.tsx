"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Award, Settings, Menu, X, Bell, Video, ChevronDown, Home, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '@/data/features/auth/useAuthActions';
import { useAppDispatch } from '@/data/redux/hooks';
import { logoutUserAsync } from '@/data/features/auth/authThunks';

const SIDEBAR_NAV = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { name: 'My Courses', href: '/dashboard/courses', icon: <BookOpen size={18} /> },
  { name: 'Live Sessions', href: '/dashboard/live-sessions', icon: <Video size={18} /> },
  { name: 'Certificates', href: '/dashboard/certificates', icon: <Award size={18} /> },
  { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={18} /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const { user } = useAuth();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/login");
    } else if (user) {
      const isStudent = user.roles?.some((r: any) => r.slug === 'student' || r.name === 'student');
      if (!isStudent) {
        router.push('/join');
      } else {
        setIsAuthChecking(false);
      }
    }
  }, [router, user]);

  const handleLogout = async () => {
    await dispatch(logoutUserAsync());
    router.push('/auth/login');
    setIsSidebarOpen(false);
    setShowLogoutModal(false);
  };


  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[color:var(--sa-cream)] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs text-[color:var(--sa-ink-3)] font-mono uppercase tracking-wider">
          <Loader2 size={16} className="animate-spin text-[color:var(--sa-gold)]" />
          Verifying session...
        </div>
      </div>
    );
  }

  return (
    <div className="ac-student bg-[color:var(--sa-cream)] min-h-screen font-sans flex flex-col md:flex-row">

      {/* Mobile Top Navbar with Logo and Hamburger (h-20 aligned) */}
      <div className="md:hidden bg-[color:var(--sa-navy)] text-[color:var(--sa-cream)] px-5 h-20 flex justify-between items-center border-b border-white/10 z-30 relative">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-gold.png"
            alt="Sajjad Husain Academy Logo"
            width={36}
            height={36}
            className="object-contain shrink-0"
            priority
          />
          <div className="flex flex-col">
            <span className="font-serif font-bold text-sm tracking-wider text-[#C9A227] uppercase leading-tight">
              Sajjad Husain
            </span>
            <span className="text-[9px] tracking-[0.16em] text-[color:var(--sa-cream)]/60 uppercase font-medium mt-0.5">
              Legal Academy
            </span>
          </div>
        </Link>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-[color:var(--sa-cream)] hover:text-[#C9A227] transition-colors p-2 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Editorial Navy Sidebar (264px desktop) */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-[264px] bg-[color:var(--sa-navy)] text-[color:var(--sa-cream)] border-r border-white/10 shrink-0 h-screen self-start
        fixed md:sticky top-0 left-0 z-40 flex flex-col
      `}>
        {/* Brand Header with Logo (h-20 = 80px, exactly matches top rail height & border) */}
        <div className="h-20 flex-shrink-0 flex items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo-gold.png"
              alt="Sajjad Husain Academy Logo"
              width={38}
              height={38}
              className="object-contain shrink-0"
              priority
            />
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base tracking-wider text-[#C9A227] uppercase leading-tight group-hover:text-yellow-400 transition-colors">
                Sajjad Husain
              </span>
              <span className="text-[10px] tracking-[0.18em] text-[color:var(--sa-cream)]/60 uppercase font-medium mt-0.5">
                Legal Academy
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Nav Menu */}
        <div className="flex-1 overflow-y-auto flex flex-col py-6">


          <nav className="space-y-1 flex-1">
            {SIDEBAR_NAV.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-6 py-3 text-sm font-medium transition-colors relative group ${isActive
                    ? 'text-[color:var(--sa-cream)] font-semibold border-l-2 border-[#C9A227] bg-white/[0.04]'
                    : 'text-[color:var(--sa-cream)]/60 hover:text-[color:var(--sa-cream)] border-l-2 border-transparent'
                    }`}
                >
                  <span className={`${isActive ? 'text-[#C9A227]' : 'text-[color:var(--sa-cream)]/55 group-hover:text-[color:var(--sa-cream)]'} transition-colors`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Block & Sign Out */}
          <div className="mt-auto pt-6 border-t border-white/10 px-6 space-y-3">
            {user && (
              <div className="flex items-center gap-3 py-1">
                <div className="w-8 h-8 rounded-full bg-[#C9A227]/20 border border-[#C9A227]/40 flex items-center justify-center text-xs font-bold text-[#C9A227] shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[color:var(--sa-cream)] truncate leading-tight">
                    {user.name}
                  </p>
                  <p className="text-[11px] text-[color:var(--sa-cream)]/50 truncate font-mono">
                    {user.email}
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowLogoutModal(true)}
              className="text-xs font-medium text-rose-300 hover:text-rose-200 transition-colors flex items-center gap-2 py-1 cursor-pointer w-full text-left"
            >
              <LogOut size={14} className="text-rose-400" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Column */}
      <div className="flex-grow w-full min-w-0 flex flex-col">

        {/* Top Header Rail (h-20 = 80px, solid non-translucent background, matches sidebar header position) */}
        <header className="h-20 bg-[color:var(--sa-cream)] border-b border-[color:var(--sa-line)] flex items-center justify-end px-6 sm:px-8 md:px-10 sticky top-0 z-30">
          <div className="flex items-center gap-5">
            {/* Notification Bell */}
            <button
              className="relative text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-black/5 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Vertical Hairline Divider */}
            <div className="w-px h-6 bg-slate-200"></div>

            {/* User Dropdown Cluster */}
            {user && (
              <div className="relative group">
                <button
                  type="button"
                  className="flex items-center gap-2.5 py-1 px-2 rounded-full hover:bg-black/5 transition-colors cursor-pointer text-left focus:outline-none"
                >
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt={user.name || "Profile"}
                      className="w-8 h-8 rounded-full object-cover border border-[#C9A227]/40 shadow-xs"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A227] to-amber-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                      {user.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-slate-800 leading-none hidden lg:block">
                    {user.name}
                  </span>
                  <ChevronDown
                    size={14}
                    className="text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-y-0.5 hidden lg:block"
                  />
                </button>

                {/* Dropdown Card */}
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-[0_12px_40px_-8px_rgba(0,0,0,0.18)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 transform origin-top-right translate-y-1 group-hover:translate-y-0 z-50 overflow-hidden divide-y divide-slate-100">
                  <div className="px-4 py-3 bg-slate-50/70">
                    <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                      {user.email}
                    </p>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <Link
                      href="/"
                      className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-[#C9A227] hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <Home size={15} className="text-slate-400" />
                      <span>Academy Home</span>
                    </Link>
                    <button
                      onClick={() => setShowLogoutModal(true)}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50/80 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut size={15} className="text-red-500" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-grow w-full min-w-0">
          <div className="px-6 sm:px-8 md:px-12 lg:px-16 py-10 max-w-[1240px] mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-[#0B1220]/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0B1220]/50 backdrop-blur-xs transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          />
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-7 w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[11px] font-mono uppercase tracking-widest text-red-600 font-semibold mb-1">
              Sign Out
            </p>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Sign out of the Academy?
            </h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              You&apos;ll need to sign in again to reach your courses. Any saved progress on your current lessons remains intact.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-sm"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
