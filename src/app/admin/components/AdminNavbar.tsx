"use client";

import Image from "next/image";
import { Bell, Search, UserCircle, Menu } from "lucide-react";
import logo from "../../../assets/logo.png";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const AdminNavbar = ({ onToggleSidebar }: NavbarProps) => {
  return (
    <header className="w-full h-16 bg-[#0A2342] text-white flex items-center justify-between px-6 fixed top-0 left-0 z-40 shadow-md">
      {/* Left section: Logo + Menu + Search */}
      <div className="flex items-center gap-4 w-full max-w-xl">
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md hover:bg-[#132b53] transition"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>

        {/* Logo */}
        <div className="flex items-center">
          <Image
            src={logo}
            alt="Logo"
            className="w-58 h-auto object-contain"
            priority
          />
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-2 w-full bg-[#132b53] rounded-md px-3 py-1">
          <Search className="text-gray-300" size={18} />
          <input
            type="text"
            placeholder="Search cases, clients..."
            className="w-full text-white bg-transparent focus:outline-none text-sm placeholder-gray-300"
          />
        </div>
      </div>

      {/* Right section: Notifications + User */}
      <div className="flex items-center gap-5">
        <Bell
          className="text-white cursor-pointer hover:text-orange-400 transition"
          size={20}
        />
        <div className="flex items-center gap-2">
          <UserCircle className="text-white" size={24} />
          <span className="text-sm font-medium">Riya Sharma</span>
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
