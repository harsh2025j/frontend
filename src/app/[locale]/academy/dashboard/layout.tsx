"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, BookOpen, Award, Settings, LogOut, Menu, X, Bell, Search, User, ClipboardList, Video, ChevronDown, AlertTriangle, Home } from 'lucide-react';
import { useAuth } from '@/data/features/auth/useAuthActions';
import { useAppDispatch } from '@/data/redux/hooks';
import { logoutUserAsync } from '@/data/features/auth/authThunks';

const SIDEBAR_NAV = [
  { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard size={20} /> },
  { name: 'My Courses', href: '/dashboard/courses', icon: <BookOpen size={20} /> },
  { name: 'Live Sessions', href: '/dashboard/live-sessions', icon: <Video size={20} /> },
  { name: 'Certificates', href: '/dashboard/certificates', icon: <Award size={20} /> },
  { name: 'Settings', href: '/dashboard/settings', icon: <Settings size={20} /> },
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
    return <div className="min-h-screen flex items-center justify-center bg-[#f0f2f5]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C9A227]"></div></div>;
  }

  return (
    <div className="bg-[#f0f2f5] min-h-[calc(100vh-64px)] font-sans flex flex-col md:flex-row">
      
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden bg-[#0a1628] text-white p-4 flex justify-between items-center shadow-md z-30 relative">
        <span className="font-bold tracking-wide">Student Portal</span>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-white hover:text-[#C9A227] transition-colors">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Premium Dark Sidebar */}
      <aside className={`
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-72 bg-[#0a1628] text-white border-r border-white/5 shrink-0 h-screen self-start
        fixed md:sticky top-0 left-0 z-20 shadow-2xl md:shadow-none flex flex-col
      `}>
        {/* Brand Logo - Fixed Height to match Top Navbar */}
        <div className="h-20 flex-shrink-0 flex items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 shadow-lg">
              <span className="text-[#C9A227] font-black text-sm tracking-tighter">SA</span>
            </div>
            <span className="font-extrabold text-white tracking-tight group-hover:text-[#C9A227] transition-colors text-xl">Academy</span>
          </Link>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col custom-scrollbar">
          <nav className="space-y-3 flex-1">
            <p className="text-[10px] uppercase tracking-widest text-blue-200/40 font-bold mb-4 px-2">Menu</p>
            {SIDEBAR_NAV.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-xl font-medium transition-all duration-200 group relative ${
                    isActive 
                      ? 'bg-gradient-to-r from-[#122340] to-transparent text-white border-l-2 border-[#C9A227]' 
                      : 'text-blue-100/60 hover:bg-white/5 hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <span className={`${isActive ? 'text-[#C9A227]' : 'text-blue-100/40 group-hover:text-[#C9A227]'} transition-colors`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-12 pt-6 border-t border-white/10">
            <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-4 px-4 py-3 rounded-xl font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full transition-colors group">
              <LogOut size={20} className="text-red-400/50 group-hover:text-red-400 transition-colors" />
              Logout Account
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow w-full relative">
        
        {/* Top Navbar for Dashboard */}
        <div className="hidden md:flex h-20 bg-white/80 backdrop-blur-md border-b border-[#122340]/5 items-center justify-end px-10 sticky top-0 z-10">
          <div className="flex items-center gap-6">
            <button className="relative text-[#122340]/60 hover:text-[#122340] transition-colors">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-[#122340]/10"></div>
            
            {/* User Profile - Top Right */}
            {user && (
              <div className="relative group cursor-pointer flex items-center gap-2">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full object-cover border border-[#C9A227] shadow-md group-hover:shadow-lg transition-all" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C9A227] to-yellow-600 flex items-center justify-center font-bold text-[#0a1628] shadow-md group-hover:shadow-lg transition-all text-sm">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-sm font-bold text-[#122340] leading-none hidden lg:block ml-1">{user.name}</span>
                <ChevronDown size={14} className="text-gray-500 group-hover:text-gray-800 transition-colors hidden lg:block" />
                
                {/* Dropdown Menu */}
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right translate-y-2 group-hover:translate-y-0">
                  <div className="p-4 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#C9A227] hover:bg-gray-50 rounded-lg transition-colors">
                      <Home size={16} /> Home
                    </Link>
                    <button onClick={() => setShowLogoutModal(true)} className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-[1400px] mx-auto min-h-[calc(100vh-152px)]">
          {children}
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-[#0a1628]/40 backdrop-blur-sm z-10 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-[#122340]/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          ></div>
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

    </div>
  );
}
