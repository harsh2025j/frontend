"use client";

import React from "react";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { 
  Home, 
  FolderOpen, 
  Users, 
  Settings, 
  Crown, 
  GitPullRequestArrow, 
  UserCog, 
  Airplay,
  Pen,
  PenBox
} from "lucide-react";
import Link from "next/link";
import CreateUpdatePage from "../create-content/page";

const AdminSidebar = ({ isOpen }: { isOpen: boolean }) => {
 
  const { user: reduxProfileUser } = useProfileActions();
  
  const user = reduxProfileUser  as UserData;
  
  const userRole = user?.role?.name || "user"; 

  const allNavItems = [
    { 
      name: "Dashboard", 
      icon: <Home size={18} />, 
      href: "/admin",
      show: userRole !== "user" 
    },
    { 
      name: "Create New Article", 
      icon: <PenBox size={18} />, 
      href: "/admin/create-content",
      show: userRole !== "user" 
    },
    { 
      name: "Content Management", 
      icon: <FolderOpen size={18} />, 
      href: "/admin/content-management",
      show: userRole !== "user"
    },
    { 
      name: "Create Roles & Permissions", 
      icon: <UserCog size={18} />, 
      href: "/admin/roles-permissions",
      show: ["admin", "super_admin"].includes(userRole || "") 
    },
    { 
      name: "Content Approval", 
      icon: <GitPullRequestArrow size={18} />, 
      href: "/admin/content-approval",
      show: ["admin", "super_admin"].includes(userRole || "")
    },
    // { name: "AI Summaries", icon: <Brain size={18} />, href: "/admin/ai-summaries", show: userRole !== "user" },
    { 
      name: "Team Management", 
      icon: <Users size={18} />, 
      href: "/admin/teams",
      show: ["admin", "super_admin"].includes(userRole || "")
    },
    { 
      name: "Premium", 
      icon: <Crown size={18} />, 
      href: "/admin/plans",
      show: ["admin", "super_admin"].includes(userRole || "")
    },
    // { name: "Analytics", icon: <BarChart3 size={18} />, href: "/admin/analytics", show: userRole !== "user" },
    { 
      name: "Settings", 
      icon: <Settings size={18} />, 
      href: "/admin/settings",
      show: ["admin", "super_admin"].includes(userRole || "") 
    },
  ];

  
  const navItems = allNavItems.filter((item) => item.show);

  return (
   <aside
      className={`
        fixed left-0 top-16
        h-[calc(100vh-4rem)]
        bg-[#0A2342]
        shadow-md flex flex-col justify-between z-20
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-66" : "w-0 overflow-hidden"}
      `}
    >
      {/* Sidebar main content */}
      <div className="p-2 pt-4 ">
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 text-gray-200 hover:text-orange-500 hover:bg-gray-800 rounded-lg px-3 py-2 transition"
            >
              {item.icon}
              <span className="whitespace-nowrap">{item.name}</span>
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