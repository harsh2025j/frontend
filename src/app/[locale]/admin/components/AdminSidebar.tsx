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
import {
  getUserType,
  canAccessAdminDashboardPage,
  canAccessManageUserPage,
  canAccessTeamsPage,
  canAccessRolePermissionPage,
  canAccessPermissionMatrixPage,
  canAccessOfficeManagementPage,
  canAccessPracticeAreaManagementPage,
  canSeeAccessControlSection,
  canAccessMembershipApplicationPage,
  canAccessPermissionRequestPage,
  canSeeContentSection,
  canAccessContentManagementPage,
  canAccessCategoryManagementPage,
  canAccessContentApprovalPage,
  canAccessPlanManagementPage,
  canAccessCasesPage,
  canAccessJudgmentsPage,
  canAccessJudgesPage,
  canAccessReportsPage,
  canAccessDisplayBoardPage,
  canAccessBroadcastPage,
  canAccessProfilePage,
  canAccessSavedPostsPage,
  canAccessAdvertisementsPage,
  isAdmin as checkIsAdmin
} from "@/utils/permissions";

const AdminSidebar = ({ isOpen, onClose, onOpen }: { isOpen: boolean; onClose: () => void; onOpen: () => void }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();
  const [activeNav, setActiveNav] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const user = reduxProfileUser as UserData;

  // Extreme Granular Access Checks
  const userType = getUserType(user);
  const isAdmin = checkIsAdmin(user);

  // Sections
  const showDashboard = canAccessAdminDashboardPage(user);
  const showAccessControlSection = canSeeAccessControlSection(user);
  const showContentSection = canSeeContentSection(user);

  // Individual Pages
  const showManageUsers = canAccessManageUserPage(user);
  const showTeams = canAccessTeamsPage(user);
  const showRolesPermissions = canAccessRolePermissionPage(user);
  const showPermissionMatrix = canAccessPermissionMatrixPage(user);
  const showOffices = canAccessOfficeManagementPage(user);
  const showPracticeAreas = canAccessPracticeAreaManagementPage(user);

  const showMembership = canAccessMembershipApplicationPage(user);
  const showPermissionRequests = canAccessPermissionRequestPage(user);

  const showContentManagement = canAccessContentManagementPage(user);
  const showCategoryManagement = canAccessCategoryManagementPage(user);
  const showContentApproval = canAccessContentApprovalPage(user);

  const showPlanManagement = canAccessPlanManagementPage(user);
  const showLegalCases = canAccessCasesPage(user);
  const showJudgments = canAccessJudgmentsPage(user);
  const showJudges = canAccessJudgesPage(user);
  const showReports = canAccessReportsPage(user);
  const showDisplayBoards = canAccessDisplayBoardPage(user);
  const showBroadcast = canAccessBroadcastPage(user);
  const showProfile = canAccessProfilePage(user);
  const showSavedPosts = canAccessSavedPostsPage(user);
  const showAdvertisements = canAccessAdvertisementsPage(user);

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
      show: showDashboard
    },

    // 🔽 ACCESS CONTROL SECTION
    {
      name: "Access Control",
      icon: <Shield size={18} />,
      isDropdown: true,
      show: showAccessControlSection,
      children: [
        {
          name: "Users",
          icon: <Users size={18} />,
          href: "/admin/users",
          show: showManageUsers
        },
        {
          name: "Teams",
          icon: <Users size={18} />,
          href: "/admin/teams",
          show: showTeams
        },
        {
          name: "Roles & Permissions",
          icon: <UserCog size={18} />,
          href: "/admin/roles-permissions",
          show: showRolesPermissions
        },
        {
          name: "Permission Matrix",
          icon: <Grid3x3 size={18} />,
          href: "/admin/permission-matrix",
          show: showPermissionMatrix
        },
        {
          name: "Offices",
          icon: <Building2 size={18} />,
          href: "/admin/offices",
          show: showOffices
        },
        {
          name: "Practice Areas",
          icon: <Briefcase size={18} />,
          href: "/admin/practice-areas",
          show: showPracticeAreas
        }
      ]
    },

    {
      name: "Membership",
      icon: <BriefcaseMedical size={18} />,
      href: "/admin/membership",
      show: showMembership
    },
    {
      name: "Permission Requests",
      icon: <ClipboardCheck size={18} />,
      href: "/admin/requests",
      show: showPermissionRequests
    },
    // {
    //   name: "My Profile",
    //   icon: <UserCircle size={18} />,
    //   href: user?.username ? `/admin/profile/${user.username}` : "#",
    //   show: showProfile
    // },
    // {
    //   name: "Saved Posts",
    //   icon: <Bookmark size={18} />,
    //   href: "/admin/saved-posts",
    //   show: showSavedPosts
    // },

    // 🔽 CONTENT SECTION
    {
      name: "Content",
      icon: <ShieldCheck size={18} />,
      isDropdown: true,
      show: showContentSection,
      children: [
        {
          name: "Content Management",
          icon: <FolderOpen size={18} />,
          href: "/admin/content-management",
          show: showContentManagement
        },
        {
          name: "Category Management",
          icon: <FolderOpen size={18} />,
          href: "/admin/categories",
          show: showCategoryManagement
        },
        {
          name: "Content Approval",
          icon: <GitPullRequestArrow size={18} />,
          href: "/admin/content-approval",
          show: showContentApproval
        }
      ]
    },
    {
      name: "Plan Management",
      icon: <Crown size={18} />,
      href: "/admin/plans",
      show: showPlanManagement
    },
    {
      name: "Legal Cases",
      icon: <FileText size={18} />,
      href: "/admin/cases",
      show: showLegalCases
    },
    {
      name: "Judgments",
      icon: <Gavel size={18} />,
      href: "/admin/judgments",
      show: showJudgments
    },
    {
      name: "Judges",
      icon: <Scale size={18} />,
      href: "/admin/judges",
      show: showJudges
    },
    {
      name: "Reports",
      icon: <BarChart size={18} />,
      href: "/admin/reports",
      show: showReports
    },
    {
      name: "Display Boards",
      icon: <Monitor size={18} />,
      href: "/admin/display-boards",
      show: showDisplayBoards
    },
    {
      name: "Notification",
      icon: <Bell size={18} />,
      href: "/admin/broadcast",
      show: showBroadcast
    },
    {
      name: "Advertisements",
      icon: <Monitor size={18} />,
      href: "/admin/advertisements",
      show: showAdvertisements
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
        bg-white
        border-r border-gray-200
        shadow-sm flex flex-col justify-between z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-20"}
      `}
      >
        <div className="flex-1 overflow-y-auto py-3 px-3 custom-scrollbar">
          <nav className="space-y-1">

            {navItems.map((item) => {

              // 🔽 TREE ITEM (NESTED)
              if (item.isDropdown) {
                const isExpanded = openDropdown === item.name;
                const isChildActive = item.children?.some((child: any) => activeNav === child.name);

                return (
                  <div key={item.name} className="space-y-1">
                    <div
                      onClick={() => {
                        if (!isOpen) {
                          onOpen();
                          setOpenDropdown(item.name);
                        } else {
                          setOpenDropdown(isExpanded ? null : item.name);
                        }
                      }}
                      className={`
                        flex items-center w-full ${isOpen ? "gap-4" : "lg:justify-center"} 
                        px-3 py-2 rounded-xl text-gray-600 hover:bg-gray-100
                        cursor-pointer transition-all duration-200 select-none
                        ${isChildActive ? "bg-blue-50 text-blue-600" : ""}
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
                      <div className={`${isOpen ? "ml-4 border-l-2 border-gray-100 pl-2" : "hidden"} space-y-1`}>
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
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
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


              const isActive = activeNav === item.name;

              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  onClick={() => handleItemClick(item.name)}
                  className={`
                  group flex items-center ${isOpen ? "gap-4" : "lg:justify-center"} px-3 py-2 rounded-xl transition-all duration-200
                  ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                    }
                `}
                  title={!isOpen ? item.name : ""}
                >
                  <span
                    className={`shrink-0 transition-colors duration-200 ${isActive ? "text-blue-600" : "group-hover:text-blue-600"
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

