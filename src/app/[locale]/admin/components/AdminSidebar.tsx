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
  ClipboardList
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { LogOut } from "lucide-react";
import { useAppDispatch } from "@/data/redux/hooks";
import { logoutUser } from "@/data/features/auth/authSlice";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PERMISSIONS, ROLES } from "@/config/permissions";

const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user: reduxProfileUser } = useProfileActions();
  const [activeNav, setActiveNav] = useState<string>("");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const user = reduxProfileUser as UserData;

  const roles = user?.roles?.map((r) => r.name) || [];
  const permission = user?.permissions?.map((r) => r.name) || [];
  const hasAdminPrivileges = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPERADMIN);
  const isEditor = roles.includes(ROLES.EDITOR);
  const isCreator = roles.includes(ROLES.CREATOR);
  const hasPermissionsForContenEdit = permission.includes(PERMISSIONS.ARTICLE.EDIT);
  const hasDashboardAccess = roles.some((role) => role !== "user");

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
      show: hasDashboardAccess
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
          name: "Audit Logs",
          icon: <ClipboardList size={18} />,
          href: "/admin/audit-logs",
          show: hasAdminPrivileges
        }
      ]
    },

    // 🔽 CONTENT SECTION
    {
      name: "Content",
      icon: <ShieldCheck size={18} />,
      isDropdown: true,
      show: hasDashboardAccess && (hasAdminPrivileges || isCreator || isEditor),
      children: [
        {
          name: "Content Management",
          icon: <FolderOpen size={18} />,
          href: "/admin/content-management",
          show: hasDashboardAccess && (isCreator || hasAdminPrivileges)
        },
        {
          name: "Category Management",
          icon: <FolderOpen size={18} />,
          href: "/admin/categories",
          show: hasAdminPrivileges || isCreator || isEditor
        },
        {
          name: "Content Approval",
          icon: <GitPullRequestArrow size={18} />,
          href: "/admin/content-approval",
          show: hasAdminPrivileges || (isEditor && hasPermissionsForContenEdit)
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
    {
      name: "Settings",
      icon: <Settings size={18} />,
      href: "/admin/settings",
      show: hasAdminPrivileges
    }
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
                  href={item.href}
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


// "use client";

// import React, { useState } from "react";
// import { UserData } from "@/data/features/profile/profile.types";
// import { useProfileActions } from "@/data/features/profile/useProfileActions";
// import {
//   Home,
//   FolderOpen,
//   Users,
//   Settings,
//   Crown,
//   GitPullRequestArrow,
//   UserCog,
//   Gavel,
//   Scale,
//   FileText,
//   Monitor,
//   BarChart,
//   Bell
// } from "lucide-react";
// // import Link from "next/link";
// import { Link } from "@/i18n/routing"
// import { LogOut } from "lucide-react";
// import { useAppDispatch } from "@/data/redux/hooks";
// import { logoutUser } from "@/data/features/auth/authSlice";
// import { useRouter } from "next/navigation";
// import Image from "next/image";
// import { PERMISSIONS, ROLES } from "@/config/permissions";

// const AdminSidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
//   const dispatch = useAppDispatch();
//   const router = useRouter();
//   const { user: reduxProfileUser } = useProfileActions();
//   const [activeNav, setActiveNav] = useState<string>("");

//   const user = reduxProfileUser as UserData;

//   const roles = user?.roles?.map((r) => r.name) || [];
//   const permission = user?.permissions?.map((r) => r.name) || [];
//   const hasAdminPrivileges = roles.includes(ROLES.ADMIN) || roles.includes(ROLES.SUPERADMIN);
//   const isEditor = roles.includes(ROLES.EDITOR);
//   const isCreator = roles.includes(ROLES.CREATOR);
//   const hasPermissionsForContenEdit = permission.includes(PERMISSIONS.ARTICLE.EDIT);
//   const hasDashboardAccess = roles.some((role) => role !== "user");


//   const handleLogout = () => {
//     dispatch(logoutUser());
//     window.location.href = "/"; // Force full page reload
//   };

//   const handleItemClick = (name: string) => {
//     setActiveNav(name);
//     // Auto-close on mobile/tablet when an item is clicked
//     if (window.innerWidth < 1024) {
//       onClose();
//     }
//   };

//   const allNavItems = [
//     {
//       name: "Dashboard",
//       icon: <Home size={18} />,
//       href: "/admin",
//       show: hasDashboardAccess
//     },
//     {
//       name: "Content Management",
//       icon: <FolderOpen size={18} />,
//       href: "/admin/content-management",
//       show: hasDashboardAccess && (isCreator || hasAdminPrivileges)
//     },
//     {
//       name: "Content Approval",
//       icon: <GitPullRequestArrow size={18} />,
//       href: "/admin/content-approval",
//       show: hasAdminPrivileges || (isEditor && hasPermissionsForContenEdit)
//     },
//     {
//       name: "Create Roles & Permissions",
//       icon: <UserCog size={18} />,
//       href: "/admin/roles-permissions",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Team Management",
//       icon: <Users size={18} />,
//       href: "/admin/teams",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "User Management",
//       icon: <Users size={18} />,
//       href: "/admin/users",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Plan Management",
//       icon: <Crown size={18} />,
//       href: "/admin/plans",
//       show: hasAdminPrivileges
//     },
    
//     {
//       name: "Legal Cases",
//       icon: <FileText size={18} />,
//       href: "/admin/cases",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Judgments",
//       icon: <Gavel size={18} />,
//       href: "/admin/judgments",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Judges",
//       icon: <Scale size={18} />,
//       href: "/admin/judges",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Reports",
//       icon: <BarChart size={18} />,
//       href: "/admin/reports",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Display Boards",
//       icon: <Monitor size={18} />,
//       href: "/admin/display-boards",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Broadcast",
//       icon: <Bell size={18} />, // Need to import Bell
//       href: "/admin/broadcast",
//       show: hasAdminPrivileges
//     },
//     {
//       name: "Settings",
//       icon: <Settings size={18} />,
//       href: "/admin/settings",
//       show: hasAdminPrivileges
//     },
//   ];

//   const navItems = allNavItems.filter((item) => item.show);

//   return (
//     <>
//       {/* Mobile/Tablet Backdrop */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 z-30 lg:hidden"
//           onClick={onClose}
//           aria-hidden="true"
//         />
//       )}

//       <aside
//         className={`
//         fixed left-0 top-16
//         h-[calc(100vh-4rem)]
//         bg-white dark:bg-[#0A2342]
//         border-r border-gray-200 dark:border-gray-800
//         shadow-sm flex flex-col justify-between z-40
//         transition-all duration-300 ease-in-out
//         ${isOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0 lg:w-20"}
//       `}
//       >
//         <div className="flex-1 overflow-y-auto py-6 px-3">
//           <nav className="space-y-1">
//             {navItems.map((item) => {
//               const isActive = activeNav === item.name;

//               return (
//                 <Link
//                   key={item.name}
//                   href={item.href}
//                   onClick={() => handleItemClick(item.name)}
//                   className={`
//                   group flex items-center ${isOpen ? "gap-4" : "lg:justify-center"} px-3 py-3 rounded-xl transition-all duration-200
//                   ${isActive
//                       ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
//                       : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-white"
//                     }
//                 `}
//                   title={!isOpen ? item.name : ""}
//                 >
//                   <span
//                     className={`shrink-0 transition-colors duration-200 ${isActive ? "text-blue-600 dark:text-blue-400" : "group-hover:text-blue-600 dark:group-hover:text-orange-500"
//                       }`}
//                   >
//                     {item.icon}
//                   </span>

//                   <span
//                     className={`
//                     whitespace-nowrap text-base font-medium transition-all duration-300 origin-left
//                     ${isOpen ? "opacity-100 translate-x-0 w-auto" : "hidden lg:block lg:opacity-0 lg:-translate-x-4 lg:w-0 lg:overflow-hidden"}
//                   `}
//                   >
//                     {item.name}
//                   </span>

//                   {isActive && isOpen && (
//                     <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></div>
//                   )}
//                 </Link>
//               );
//             })}
//           </nav>
//         </div>

//         {/* <div className="border-t border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-[#0d2b4f]">
//           <div className={`flex items-center ${isOpen ? "gap-3" : "lg:justify-center"}`}>
//             <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 shrink-0 ring-2 ring-white dark:ring-gray-700 shadow-sm">
//               {user?.profilePicture ? (
//                 <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
//               ) : (
//                 <div className="w-full h-full flex items-center justify-center text-gray-600 dark:text-white font-bold text-lg">
//                   {user?.name?.charAt(0).toUpperCase() || "U"}
//                 </div>
//               )}
//             </div>

//             <div
//               className={`
//               flex-1 min-w-0 transition-all duration-300 overflow-hidden
//               ${isOpen ? "opacity-100 w-auto ml-1" : "hidden lg:block lg:opacity-0 lg:w-0 lg:ml-0"}
//             `}
//             >
//               <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name || "User"}</p>
//               <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
//               <p className="text-xs font-medium text-blue-600 dark:text-blue-400 truncate mt-0.5 capitalize">
//                 {user?.roles?.map((r) => r.name).join(" & ") || "User"}
//               </p>
//             </div>

//             <button
//               onClick={handleLogout}
//               className={`
//               text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700
//               ${isOpen ? "block" : "hidden"}
//             `}
//               title="Logout"
//             >
//               <LogOut size={20} />
//             </button>
//           </div>

//           {!isOpen && (
//             <button
//               onClick={handleLogout}
//               className="mt-4 w-full justify-center text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 hidden lg:flex"
//               title="Logout"
//             >
//               <LogOut size={20} />
//             </button>
//           )}
//         </div> */}
//       </aside>
//     </>
//   );
// };

// export default AdminSidebar;
