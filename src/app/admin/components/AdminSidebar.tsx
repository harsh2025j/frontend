"use client";

import { Home, FolderOpen, Users, FileText, Settings, Pen, Brain, Crown, BarChart3, GitPullRequestArrow, UserCog } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const AdminSidebar = ({ isOpen }: { isOpen: boolean }) => {
  const navItems = [
    { name: "Dashboard", icon: <Home size={18} />, href: "/admin" },
    { name: "Content Management", icon: <FolderOpen size={18} />, href: "/admin/content-management" },
    { name: "Roles & Permissions", icon: <UserCog size={18} />, href: "/admin/roles-permissions" },
    { name: "Content Approval", icon: <GitPullRequestArrow size={18} />, href: "/admin/content-approval" },
    { name: "AI Summaries", icon: <Brain size={18} />, href: "/admin/ai-summaries" },
    { name: "Team Management", icon: <Users size={18} />, href: "/admin/teams" },
    { name: "Premium", icon: <Crown size={18} />, href: "/admin/plans" },
    { name: "Analytics", icon: <BarChart3 size={18} />, href: "/admin/analytics" },
    { name: "Settings", icon: <Settings size={18} />, href: "/admin/settings" },];


  return (
    <aside
      className={`
        fixed left-0 top-16
        h-[calc(100vh-4rem)]
        bg-[#0A2342]
        shadow-md flex flex-col justify-between z-20
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-0 overflow-hidden"}
      `}
    >
      {/* Sidebar main content */}
      <div className="p-6">


        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 text-gray-200 hover:text-orange-500 hover:bg-gray-800 rounded-lg px-3 py-2 transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-700 p-4 text-center text-sm text-gray-400">
        © 2025 LawStream
      </div>
    </aside>
  );
};

export default AdminSidebar;
