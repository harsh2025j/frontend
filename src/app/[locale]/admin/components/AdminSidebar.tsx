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
  UserCircle,
  Calendar,
  History,
  CheckCircle,
  Wallet,
  MessageSquare,
  GraduationCap,
  PlaySquare,
  Award,
  BookOpen,
  FileQuestion
} from "lucide-react";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import { Link, usePathname, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/data/redux/hooks";
import { logoutUserAsync } from "@/data/features/auth/authThunks";
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
  canAccessAppointmentsPage,
  canAccessPayoutsPage,
  canAccessMyEarningsPage,
  isAdmin as checkIsAdmin,
  getUserRoles,
  canSeeAcademySection,
  canAccessAcademyFinancesPage
} from "@/utils/permissions";

const AdminSidebarContent = ({ isOpen, onClose, onOpen }: { isOpen: boolean; onClose: () => void; onOpen: () => void }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [activeNav, setActiveNav] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [unreadAppointments, setUnreadAppointments] = useState(0);

  const fetchUnread = async () => {
    if (reduxProfileUser?.id || reduxProfileUser?._id) {
      try {
        const res = await appointmentsService.getUnreadCount(reduxProfileUser.id || reduxProfileUser._id);
        const count = res.data?.data ?? res.data;
        setUnreadAppointments(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error(e);
      }
    }
  };

  React.useEffect(() => {
    fetchUnread();
    const interval = setInterval(fetchUnread, 60000); // Poll every minute
    return () => clearInterval(interval);
  }, [reduxProfileUser]);

  // Context-aware logic: Detect if we are viewing a specific case
  // Match UUID or MongoDB ID in paths like /cases/[id] or /admin/cases/[id]
  const caseIdMatch = pathname.match(/(?:\/admin)?\/cases\/([a-f0-9-]{36}|[0-9a-fA-F]{24})/);
  const activeCaseId = caseIdMatch ? caseIdMatch[1] : null;

  const user = reduxProfileUser as UserData;

  // Extreme Granular Access Checks
  const userType = getUserType(user);
  const isAdmin = checkIsAdmin(user);

  // Sections
  const showDashboard = canAccessAdminDashboardPage(user);
  const showAccessControlSection = canSeeAccessControlSection(user);
  const showContentSection = canSeeContentSection(user);
  const showAcademySection = canSeeAcademySection(user);
  const showAcademyFinances = canAccessAcademyFinancesPage(user);

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
  const showAppointments = canAccessAppointmentsPage(user);

  const isAdminPath = pathname.startsWith("/admin");
  const isCaseContext = !!activeCaseId && !pathname.includes("/admin/cases/create");

  const handleLogout = async () => {
    await dispatch(logoutUserAsync());
    window.location.href = "/";
  };

  const handleItemClick = (name: string) => {
    setActiveNav(name);
    if (window.innerWidth < 1024) onClose();
  };

  const allNavItems: any[] = [
    {
      name: "Dashboard",
      icon: <Home size={18} />,
      href: "/admin",
      show: showDashboard
    },
    {
      name: "Appointments",
      icon: <Calendar size={18} />,
      isDropdown: true,
      show: showAppointments,
      children: [
        {
          name: "Current Requests",
          icon: <Calendar size={16} />,
          href: "/admin/appointments",
          show: showAppointments,
          badge: unreadAppointments
        },
        {
          name: "Confirmed",
          icon: <CheckCircle size={16} />,
          href: "/admin/appointments/confirmed",
          show: showAppointments
        },
        {
          name: "History",
          icon: <History size={16} />,
          href: "/admin/appointments/history",
          show: showAppointments
        }
      ]
    },
    {
      name: "Payouts & Settlements",
      icon: <Wallet size={18} />,
      href: "/admin/payouts",
      show: canAccessPayoutsPage(user)
    },
    {
      name: "My Earnings",
      icon: <Wallet size={18} />,
      href: "/admin/my-earnings",
      show: canAccessMyEarningsPage(user)
    },
    {
      name: "Messages",
      icon: <MessageSquare size={18} />,
      href: "/admin/messages",
      show: getUserRoles(user).some(role => role !== "user")
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
    {
      name: "Academy",
      icon: <GraduationCap size={18} />,
      isDropdown: true,
      show: showAcademySection,
      children: [
        {
          name: "Dashboard",
          icon: <BarChart size={18} />,
          href: "/admin/academy",
          show: showAcademySection
        },
        {
          name: "Courses",
          icon: <BookOpen size={18} />,
          href: "/admin/academy/courses",
          show: showAcademySection
        },
        {
          name: "Assessments & Tests",
          icon: <FileQuestion size={18} />,
          href: "/admin/academy/tests",
          show: showAcademySection
        },
        {
          name: "Live Sessions",
          icon: <PlaySquare size={18} />,
          href: "/admin/academy/live-sessions",
          show: showAcademySection
        },
        {
          name: "Students",
          icon: <Users size={18} />,
          href: "/admin/academy/students",
          show: showAcademySection
        },
        // {
        //   name: "Enrollments",
        //   icon: <CheckCircle size={18} />,
        //   href: "/admin/academy/enrollments",
        //   show: showAcademySection
        // },
        {
          name: "Payments & Revenue",
          icon: <Wallet size={18} />,
          href: "/admin/academy/payments",
          show: showAcademyFinances
        },
        {
          name: "Assignments",
          icon: <ClipboardList size={18} />,
          href: "/admin/academy/assignments",
          show: showAcademySection
        },
        {
          name: "Certificates",
          icon: <Award size={18} />,
          href: "/admin/academy/certificates",
          show: showAcademyFinances
        },
        {
          name: "Coupons",
          icon: <Bookmark size={18} />,
          href: "/admin/academy/coupons",
          show: showAcademyFinances
        },
        {
          name: "Notifications",
          icon: <Bell size={18} />,
          href: "/admin/academy/notifications",
          show: showAcademyFinances
        }
      ]
    }
  ];


  const navItems = allNavItems.filter((item) => item.show);

  const isLinkActive = (href?: string) => {
    if (!href || href === "#") return false;

    // SPECIAL CASE: Approval mode preview
    if (mode === 'approval' && pathname.includes('/admin/content-management/preview/')) {
      if (href === '/admin/content-approval') return true;
      if (href === '/admin/content-management') return false;
    }

    // Priority 1: Exact Match
    if (pathname === href) return true;

    // Priority 2: Admin Dashboards exact match
    if (href === "/admin" && pathname !== "/admin") return false;
    if (href === "/admin/academy" && pathname !== "/admin/academy") return false;

    // Priority 3: Prefix matching with exclusion for overlapping siblings
    if (pathname.startsWith(`${href}/`)) {
      // Prevent /admin/appointments from highlighting when on /admin/appointments/history etc.
      if (href === "/admin/appointments" && (
        pathname.includes("/admin/appointments/confirmed") ||
        pathname.includes("/admin/appointments/history")
      )) {
        return false;
      }
      return true;
    }

    return false;
  };

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
                const isChildActive = item.children?.some((child: any) => isLinkActive(child.href));

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
                            const isItemActive = isLinkActive(child.href);
                            return (
                              <Link
                                key={child.name}
                                href={child.href}
                                prefetch={true}
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


              const isActive = isLinkActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href || "#"}
                  prefetch={true}
                  onClick={() => handleItemClick(item.name)}
                  className={`
                  group flex items-center ${isOpen ? "gap-4" : "lg:justify-center"} px-3 py-2 rounded-xl transition-all duration-200
                  ${isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
                    }
                  ${(item as any).indent && isOpen ? "ml-6 border-l-2 border-gray-100 pl-4" : ""}
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

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`
                      absolute ${isOpen ? "right-4" : "top-1 right-1"} 
                      bg-red-500 text-white text-[10px] font-black 
                      w-5 h-5 flex items-center justify-center rounded-full 
                      border-2 border-white shadow-sm z-10
                    `}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

const AdminSidebar = (props: { isOpen: boolean; onClose: () => void; onOpen: () => void }) => {
  return (
    <React.Suspense fallback={null}>
      <AdminSidebarContent {...props} />
    </React.Suspense>
  );
};

export default AdminSidebar;
