"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Search, Menu, LogOut, User as UserIcon, Home } from "lucide-react";
import logo from "../../../../assets/logo.png";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Redux & Actions
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { useAppDispatch } from "@/data/redux/hooks";
import { logoutUser } from "@/data/features/auth/authSlice";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const AdminNavbar = ({ onToggleSidebar }: NavbarProps) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user: reduxProfileUser } = useProfileActions();

  // State for dropdown & modal
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const user = reduxProfileUser as UserData;
  const avatar = user?.profilePicture || null;


  const confirmLogout = () => {

    dispatch(logoutUser());
    localStorage.clear();
    setIsProfileOpen(false);
    setShowLogoutConfirm(false);
    router.replace("/auth/login");
  };

  return (
    <>
      <header className="w-full h-16 bg-white dark:bg-[#0A2342] text-gray-800 dark:text-white flex items-center justify-between px-4 fixed top-0 left-0 z-40 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">

        {/* Left section: Logo + Menu + Search */}
        <div className="flex items-center gap-4 w-full max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center">
            <Link href="/">
              <Image
                src={logo}
                alt="Logo"
                className="w-40 h-auto object-contain"
                priority
              />
            </Link>
          </div>
          {/* 
          <div className="hidden md:flex items-center gap-2 w-full max-w-md bg-gray-100 dark:bg-[#132b53] rounded-lg px-4 py-2 transition-colors duration-300">
            <Search className="text-gray-500 dark:text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search cases, clients..."
              className="w-full bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div> */}
        </div>

        {/* Right section: Notifications + User Dropdown */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
            <Bell className="text-gray-600 dark:text-gray-300" size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0A2342]"></span>
          </button>

          {/* User Dropdown */}
          <div
            className="relative pl-2 border-l border-gray-200 dark:border-gray-700"
            onMouseEnter={() => setIsProfileOpen(true)}
            onMouseLeave={() => setIsProfileOpen(false)}
          >
            <button className="flex items-center gap-3 focus:outline-none py-2 mr-5">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center 
                    text-sm font-semibold text-gray-700 dark:text-gray-200 overflow-hidden ring-2 ring-white dark:ring-gray-800">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar"
                    width={40}
                    height={40}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  (user?.name?.[0] || "U").toUpperCase()
                )}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
                  {user?.name || "Profile"}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 top-full w-48 bg-white dark:bg-[#0d2b4f] border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg transition-all duration-200 transform origin-top-right z-50 ${isProfileOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}
            >
              <div className="py-2">
                <Link
                  href="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <UserIcon size={16} /> Profile
                </Link>

                {/* <Link 
                  href="/" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Home size={16} /> Home
                </Link> */}

                <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setShowLogoutConfirm(true);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>


      {showLogoutConfirm && (
        <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={confirmLogout} />
      )}
    </>
  );
};


function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn">

      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onCancel} />


      <div className="relative z-10 w-full max-w-sm bg-white dark:bg-[#0d2b4f] rounded-xl shadow-2xl p-6 border border-gray-100 dark:border-gray-700 transform transition-all scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
            <LogOut className="text-red-600 dark:text-red-400" size={24} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Logout?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
            Are you sure you want to Logout? You will need to login again to access the dashboard.
          </p>

          <div className="flex gap-3 w-full">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-md shadow-red-600/20 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;