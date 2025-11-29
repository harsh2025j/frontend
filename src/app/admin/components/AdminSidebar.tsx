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
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/data/redux/hooks";
import { logoutUser } from "@/data/features/auth/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";

const AdminSidebar = ({ isOpen }: { isOpen: boolean }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();

  const user = reduxProfileUser as UserData;

  const userRole = user?.role?.name || "user";

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/auth/login");
  };

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
        bg-white dark:bg-[#0A2342]
        border-r border-gray-200 dark:border-gray-800
        shadow-sm flex flex-col justify-between z-20
        transition-all duration-300 ease-in-out
        ${isOpen ? "w-72" : "w-20"}
      `}
    >
      {/* Sidebar main content */}
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            // Determine if active (simple check, can be improved with usePathname)
            // For now, assuming exact match or starts with for sub-routes if needed
            // But href is simple here.
            // Let's use a simple check for demo purposes or if usePathname was imported.
            // Since usePathname is not imported, I'll stick to basic styling but add hover effects.
            // Ideally, we should use usePathname.

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200
                  text-gray-600 dark:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white
                  ${!isOpen ? "justify-center" : ""}
                `}
                title={!isOpen ? item.name : ""}
              >
                <span className="shrink-0 transition-colors duration-200 group-hover:text-blue-600 dark:group-hover:text-orange-500">
                  {React.cloneElement(item.icon as any, { size: 22 })}
                </span>

                <span
                  className={`
                    whitespace-nowrap text-base font-medium transition-all duration-300 origin-left
                    ${isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0 overflow-hidden"}
                  `}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Profile Section */}
      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#0d2b4f]">
        <div className={`flex items-center gap-3 ${!isOpen ? "justify-center" : ""}`}>
          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 shrink-0 ring-2 ring-white dark:ring-gray-700 shadow-sm">
            {user?.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={user.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          {/* User Info & Logout (Visible only when open) */}
          <div
            className={`
                flex-1 min-w-0 transition-all duration-300 overflow-hidden
                ${isOpen ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}
              `}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`
                text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
                ${isOpen ? "block" : "hidden"}
              `}
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>

        {/* Logout for closed state */}
        {!isOpen && (
          <button
            onClick={handleLogout}
            className="mt-4 w-full flex justify-center text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;