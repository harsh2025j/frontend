"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";
import Loader from "@/components/ui/Loader";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import { PERMISSIONS } from "@/config/permissions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const { user: reduxUser, loading } = useProfileActions();
  const user = reduxUser as UserData;

  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // if (loading) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // 1. No Token? -> Go to Login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // 2. Authorization Check
    if (user && !loading) {
      // We now allow all logged-in users to access the /admin layout
      // Specific pages will handle additional permission checks if needed
      setIsAuthorized(true);
    }
  }, [user, loading, router]);

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
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className={`flex flex-col flex-1 transition-all duration-300 ${isSidebarOpen ? "lg:ml-72" : "lg:ml-20"} ml-0`}>
        <AdminNavbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 pt-24 p-8">{children}</main>
      </div>
    </div>
  );
}