"use client";

import React, { useState } from "react";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import {
  Home,
  FolderOpen,
  Users,
  Settings,
  Crown,
  GitPullRequestArrow,
  UserCog
} from "lucide-react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/data/redux/hooks";
import { logoutUser } from "@/data/features/auth/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PERMISSIONS, ROLES } from "@/config/permissions";

const AdminSidebar = ({ isOpen }: { isOpen: boolean }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();
  const [activeNav, setActiveNav] = useState<string>("");

  const user = reduxProfileUser as UserData;

  const roles = user?.roles?.map((r) => r.name) || [];
  const permission = user?.permissions?.map((r) => r.name) || [];
  const hasAdminPrivileges = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPERADMIN);
  const isEditor =  roles.includes(ROLES.EDITOR);
  const hasPermissionsForContenEdit = permission.includes(PERMISSIONS.ARTICLE.EDIT);
  const hasDashboardAccess = roles.some((role) => role !== "user");

  const handleLogout = () => {
    dispatch(logoutUser());
    router.push("/auth/login");
  };

  const allNavItems = [
    {
      name: "Dashboard",
      icon: <Home size={18} />,
      href: "/admin",
      show: hasDashboardAccess
    },
    {
      name: "Content Management",
      icon: <FolderOpen size={18} />,
      href: "/admin/content-management",
      show: hasDashboardAccess && !isEditor
    },
    {
      name: "Create Roles & Permissions",
      icon: <UserCog size={18} />,
      href: "/admin/roles-permissions",
      show: hasAdminPrivileges 
    },
    {
      name: "Content Approval",
      icon: <GitPullRequestArrow size={18} />,
      href: "/admin/content-approval",
      show: hasAdminPrivileges  || ( isEditor  && hasPermissionsForContenEdit)
    },
    {
      name: "Team Management",
      icon: <Users size={18} />,
      href: "/admin/teams",
      show: hasAdminPrivileges
    },
    {
      name: "User Management",
      icon: <Users size={18} />,
      href: "/admin/users",
      show: hasAdminPrivileges
    },
    {
      name: "Premium",
      icon: <Crown size={18} />,
      href: "/admin/plans",
      show: hasAdminPrivileges
    },
    {
      name: "Settings",
      icon: <Settings size={18} />,
      href: "/admin/settings",
      show: hasAdminPrivileges
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
      <div className="flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = activeNav === item.name;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setActiveNav(item.name)}
                className={`
                  group flex items-center ${isOpen ? "gap-4" : ""} px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                  }
                  ${!isOpen ? "justify-center" : ""}
                `}
                title={!isOpen ? item.name : ""}
              >
                <span
                  className={`shrink-0 transition-colors duration-200 ${
                    isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-blue-600 dark:group-hover:text-orange-500"
                  }`}
                >
                  {item.icon}
                </span>

                <span
                  className={`
                    whitespace-nowrap text-base font-medium transition-all duration-300 origin-left
                    ${isOpen ? "opacity-100 translate-x-0 w-auto" : "opacity-0 -translate-x-4 w-0 overflow-hidden"}
                  `}
                >
                  {item.name}
                </span>

                {isActive && isOpen && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#0d2b4f]">
        <div className={`flex items-center ${isOpen ? "gap-3" : ""} ${!isOpen ? "justify-center" : ""}`}>
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 shrink-0 ring-2 ring-white dark:ring-gray-700 shadow-sm">
            {user?.profilePicture ? (
              <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-white font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>

          <div
            className={`
              flex-1 min-w-0 transition-all duration-300 overflow-hidden
              ${isOpen ? "opacity-100 w-auto ml-1" : "opacity-0 w-0 ml-0"}
            `}
          >
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
            <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate mt-0.5 capitalize">
              {user?.roles?.map((r) => r.name).join(" & ") || "User"}
            </p>
          </div>

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
