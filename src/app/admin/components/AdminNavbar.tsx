"use client";

import Image from "next/image";
import { Bell, Search, UserCircle, Menu } from "lucide-react";
import logo from "../../../assets/logo.png";
import Link from "next/link";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const AdminNavbar = ({ onToggleSidebar }: NavbarProps) => {
  const { user: reduxProfileUser } = useProfileActions();

  const user = reduxProfileUser as UserData;
  const avatar = user?.profilePicture || null;

  return (
    <header className="w-full h-16 bg-white dark:bg-[#0A2342] text-gray-800 dark:text-white flex items-center justify-between px-4 fixed top-0 left-0 z-40 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* Left section: Logo + Menu + Search */}
      <div className="flex items-center gap-4 w-full max-w-xl">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
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

        {/* Search bar */}
        <div className="hidden md:flex items-center gap-2 w-full max-w-md bg-gray-100 dark:bg-[#132b53] rounded-lg px-4 py-2 transition-colors duration-300">
          <Search className="text-gray-500 dark:text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search cases, clients..."
            className="w-full bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right section: Notifications + User */}
      <div className="flex items-center gap-4">
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
          <Bell
            className="text-gray-600 dark:text-gray-300"
            size={20}
          />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#0A2342]"></span>
        </button>

        <Link href="/profile" className="flex items-center gap-3 pl-2 border-l border-gray-200 dark:border-gray-700">
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
            {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {user?.roles[0].name|| "User"}
            </p> */}
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AdminNavbar;
