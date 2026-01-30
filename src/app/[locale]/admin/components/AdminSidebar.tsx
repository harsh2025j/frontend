"use client";

import React, { useState } from "react";
import { UserData } from "@/data/features/profile/profile.types";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import {
  Home,
  FolderOpen,
  Users,
  // Settings,
  Crown,
  GitPullRequestArrow,
  UserCog,
  Gavel,
  Scale,
  FileText,
  Monitor,
  BarChart,
  Bell,
  ShieldCheck,
  ChevronDown,
  Building2,
  Briefcase,
  Shield,
  Grid3x3,
  ClipboardList,
  BriefcaseMedical,
  ClipboardCheck,
  Bookmark,
  UserCircle
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/data/redux/hooks";
import { logoutUser } from "@/data/features/auth/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PERMISSIONS, ROLES } from "@/config/permissions";
import { getUserType, hasDashboardAccess as hasAccess, isAdmin as checkIsAdmin } from "@/utils/permissions";

const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();
  const [activeNav, setActiveNav] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const user = reduxProfileUser as UserData;

  // Use unified permission helper
  const userType = getUserType(user);
  const hasDashboardAccess = hasAccess(user);
  const hasAdminPrivileges = checkIsAdmin(user);

  // Keep granular permission checks for specific features
  const permission = user?.permissions?.map((r) => r.name) || [];
  const roles = user?.roles?.map((r) => r.name) || [];
  const isCreator = roles.includes(ROLES.CREATOR);
  const isEditor = roles.includes(ROLES.EDITOR);
  const hasPermissionsForContenEdit = permission.includes(PERMISSIONS.ARTICLE.EDIT);
  const hasPermissionsForCategories = permission.includes(PERMISSIONS.MANAGE.CATEGORIES);
  const hasPermissionsForApproval = permission.includes(PERMISSIONS.ARTICLE.PUBLISH);
  const hasPermissionsForCreate = permission.includes(PERMISSIONS.ARTICLE.CREATE);
  const hasPermissionsForDelete = permission.includes(PERMISSIONS.ARTICLE.DELETE);
  const hasPermissionsForContentManagement = hasPermissionsForCreate || hasPermissionsForContenEdit || hasPermissionsForDelete;

  const handleLogout = () => {
    dispatch(logoutUser());
    window.location.href = "/";
  };

  const handleItemClick = (name: string) => {
    setActiveNav(name);
    if (window.innerWidth < 1024) onClose();
  };

  const allNavItems = [
    {
      name: "Dashboard",
      icon: <Home size={18} />,
      href: "/admin",
      show: hasDashboardAccess // Only show to staff users
    },

    // 🔽 ACCESS CONTROL SECTION
    {
      name: "Access Control",
      icon: <Shield size={18} />,
      isDropdown: true,
      show: hasAdminPrivileges,
      children: [
        {
          name: "Users",
          icon: <Users size={18} />,
          href: "/admin/users",
          show: hasAdminPrivileges
        },
        {
          name: "Teams",
          icon: <Users size={18} />,
          href: "/admin/teams",
          show: hasAdminPrivileges
        },
        {
          name: "Roles & Permissions",
          icon: <UserCog size={18} />,
          href: "/admin/roles-permissions",
          show: hasAdminPrivileges
        },
        {
          name: "Permission Matrix",
          icon: <Grid3x3 size={18} />,
          href: "/admin/permission-matrix",
          show: hasAdminPrivileges
        },
        {
          name: "Offices",
          icon: <Building2 size={18} />,
          href: "/admin/offices",
          show: hasAdminPrivileges
        },
        {
          name: "Practice Areas",
          icon: <Briefcase size={18} />,
          href: "/admin/practice-areas",
          show: hasAdminPrivileges
        },
        {
          show: hasAdminPrivileges
        }
      ]
    },

    {
      name: "Membership",
      icon: <BriefcaseMedical size={18} />,
      href: "/admin/membership",
      show: userType === 'user' // Only show to normal users
    },
    {
      name: "Permission Requests",
      icon: <ClipboardCheck size={18} />,
      href: "/admin/requests",
      show: hasAdminPrivileges
    },
    {
      name: "My Profile",
      icon: <UserCircle size={18} />,
      href: "/admin/profile",
      show: true
    },
    {
      name: "Saved Posts",
      icon: <Bookmark size={18} />,
      href: "/admin/saved-posts",
      show: true
    },

    // 🔽 CONTENT SECTION
    {
      name: "Content",
      icon: <ShieldCheck size={18} />,
      isDropdown: true,
      show: hasDashboardAccess, // If they have any related permission, show the section
      children: [
        {
          name: "Content Management",
          icon: <FolderOpen size={18} />,
          href: "/admin/content-management",
          show: hasAdminPrivileges || isCreator || hasPermissionsForContentManagement
        },
        {
          name: "Category Management",
          icon: <FolderOpen size={18} />,
          href: "/admin/categories",
          show: hasAdminPrivileges || hasPermissionsForCategories
        },
        {
          name: "Content Approval",
          icon: <GitPullRequestArrow size={18} />,
          href: "/admin/content-approval",
          show: hasAdminPrivileges || hasPermissionsForApproval
        }
      ]
    },

    {
      name: "Plan Management",
      icon: <Crown size={18} />,
      href: "/admin/plans",
      show: hasAdminPrivileges
    },
    {
      name: "Legal Cases",
      icon: <FileText size={18} />,
      href: "/admin/cases",
      show: hasAdminPrivileges
    },
    {
      name: "Judgments",
      icon: <Gavel size={18} />,
      href: "/admin/judgments",
      show: hasAdminPrivileges
    },
    {
      name: "Judges",
      icon: <Scale size={18} />,
      href: "/admin/judges",
      show: hasAdminPrivileges
    },
    {
      name: "Reports",
      icon: <BarChart size={18} />,
      href: "/admin/reports",
      show: hasAdminPrivileges
    },
    {
      name: "Display Boards",
      icon: <Monitor size={18} />,
      href: "/admin/display-boards",
      show: hasAdminPrivileges
    },
    {
      name: "Notification",
      icon: <Bell size={18} />,
      href: "/admin/broadcast",
      show: hasAdminPrivileges
    },
    // {
    //   name: "Settings",
    //   icon: <Settings size={18} />,
    //   href: "/admin/settings",
    //   show: hasAdminPrivileges
    // }
  ];

  const navItems = allNavItems.filter((item) => item.show);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
        fixed left-0 top-16
        h-[calc(100vh-4rem)]
        bg-white dark:bg-[#0A2342]
        border-r border-gray-200 dark:border-gray-800
        shadow-sm flex flex-col justify-between z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-20"}
      `}
      >
        <div className="flex-1 overflow-y-auto py-3 px-3">
          <nav className="space-y-1">

            {navItems.map((item) => {

              // 🔽 TREE ITEM (NESTED)
              if (item.isDropdown) {
                const isExpanded = openDropdown === item.name;
                const isChildActive = item.children?.some((child: any) => activeNav === child.name);

                return (
                  <div key={item.name} className="space-y-1">
                    <div
                      onClick={() => setOpenDropdown(isExpanded ? null : item.name)}
                      className={`
                        flex items-center w-full ${isOpen ? "gap-4" : "lg:justify-center"} 
                        px-3 py-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800
                        cursor-pointer transition-all duration-200 select-none
                        ${isChildActive ? "bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400" : ""}
                      `}
                    >
                      <span className="shrink-0">{item.icon}</span>
                      {isOpen && (
                        <>
                          <span className="flex-1 text-[13px] font-medium">{item.name}</span>
                          <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                        </>
                      )}
                    </div>

                    {(isExpanded || (!isOpen && isChildActive)) && (
                      <div className={`${isOpen ? "ml-4 border-l-2 border-gray-100 dark:border-gray-800 pl-2" : "hidden"} space-y-1`}>
                        {item.children
                          .filter((child: any) => child.show)
                          .map((child: any) => {
                            const isItemActive = activeNav === child.name;
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                onClick={() => handleItemClick(child.name)}
                                className={`
                                  group flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all duration-200
                                  ${isItemActive
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                                  }
                                `}
                              >
                                <span className="shrink-0 opacity-70 group-hover:opacity-100">{child.icon}</span>
                                <span className="text-[12px] font-medium">{child.name}</span>
                              </Link>
                            );
                          })}
                      </div>
                    )}
                  </div>
                );
              }

              // 🔹 NORMAL ITEM (UNCHANGED)
              const isActive = activeNav === item.name;

              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  onClick={() => handleItemClick(item.name)}
                  className={`
                  group flex items-center ${isOpen ? "gap-4" : "lg:justify-center"} px-3 py-2 rounded-xl transition-all duration-200
                  ${isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
                    }
                `}
                  title={!isOpen ? item.name : ""}
                >
                  <span
                    className={`shrink-0 transition-colors duration-200 ${isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-blue-600 dark:group-hover:text-orange-500"
                      }`}
                  >
                    {item.icon}
                  </span>

                  <span
                    className={`
                    whitespace-nowrap text-[13px] font-medium transition-all duration-300 origin-left
                    ${isOpen ? "opacity-100 translate-x-0 w-auto" : "hidden lg:block lg:opacity-0 lg:-translate-x-4 lg:w-0 lg:overflow-hidden"}
                  `}
                  >
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;

