"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/routing";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";
import Loader from "@/components/ui/Loader";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { ROUTE_PROTECTION_MAP, canAccessAdminPanelPage, isAdmin } from "@/utils/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user: reduxUser, loading } = useProfileActions();
  const user = reduxUser as UserData;

  const [isAuthorized, setIsAuthorized] = useState(false);


  useEffect(() => {
    // Reset authorization when path changes to re-verify
    setIsAuthorized(false);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 1. No Token? -> Go to Login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // 2. Wait for profile to load
    if (loading) return;

    // 3. Authorization Check
    if (user) {
      // Normalize path to match map (remove locale prefix)
      const cleanPath = pathname.replace(/^\/[a-z]{2}(\/|$)/, '$1').replace(/\/$/, '') || "/";
      const adminPath = cleanPath.startsWith('/admin') ? cleanPath : `/admin${cleanPath === '/' ? '' : cleanPath}`;

      // Find the best match (longest prefix)
      const sortedProtections = Object.keys(ROUTE_PROTECTION_MAP).sort((a, b) => b.length - a.length);
      const matchedKey = sortedProtections.find(key => adminPath === key || adminPath.startsWith(key + '/'));

      //If it can't find a rule for a page, it defaults to isAdmin .This means if you forget to add a rule, the page is locked for everyone except Admins.
      const permissionCheck = matchedKey ? ROUTE_PROTECTION_MAP[matchedKey] : isAdmin;

      if (permissionCheck(user)) {
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
        // Redirection based on user type and current path
        if (adminPath === "/admin") {
          // Normal users go to membership, staff go to admin (infinite loop prevention)
          router.replace("/admin/membership");
        } else {
          // If accessing a restricted page, kick back to dashboard/root
          router.replace("/admin");
        }
      }
    } else if (!loading) {
      // Token exists but no user data? Force refresh or re-login
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token && !user) {
        // This might happen if API failed. 
        // Optional: router.replace("/auth/login");
      }
    }
  }, [user, loading, router, pathname]);

  useEffect(() => {
    const handleResize = () => {
      // On mobile/tablet (< 1024), default to closed
      if (window.innerWidth < 1024) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader size="lg" text="Checking Permissions..." />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onOpen={() => setIsSidebarOpen(true)} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"} ml-0`}>
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 pt-24 p-8">{children}</main>
      </div>
    </div>
  );
}