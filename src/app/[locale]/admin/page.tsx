"use client";
import {
  PlusCircle,
  TrendingUp,
  UserCheck,
  Users,
  Star,
  Eye,
  MapPin,
  CircleDollarSign,
  Clock,
} from "lucide-react";
import ContentTable from "./components/ContentTable";
import StatCard from "./components/StatCard";
import DummyChart from "./components/charts/LineChart";
import RevenueChart from "./components/charts/RevenueChart";
import ContentApprovalPanel from "./components/UrgentTable";
import RecentActivity from "./components/RecentActivity";
import { Router } from "next/router";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchArticles } from "@/data/features/article/articleThunks";
import { fetchUsers } from "@/data/features/users/usersThunks";
import {
  canAccessAdminDashboardPage,
  getUserType,
  canAccessManageUserPage,
  canAccessPlanManagementPage,
  canAccessContentManagementPage,
  canAccessCategoryManagementPage,
  isAdmin,
  canAccessMyEarningsPage
} from "@/utils/permissions";
import apiClient from "@/data/services/apiConfig/apiClient";
import { fetchDashboardStats } from "@/data/features/dashboard/dashboardThunks";




const Page = () => {
  useDocTitle("Admin Dashboard | Sajjad Husain Law Associates");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { articles } = useAppSelector((state) => state.article);
  const { users } = useAppSelector((state) => state.users);

  const { stats: dashboardStats, loading: loadingStats } = useAppSelector((state) => state.dashboard);
  const { user: reduxUser } = useProfileActions();

  useEffect(() => {
    dispatch(fetchArticles({}));
    dispatch(fetchUsers({}));
    dispatch(fetchDashboardStats());
  }, [dispatch]);


  // --- Authorization Check for View ---
  const userData = reduxUser as UserData;


  const userType = getUserType(userData);
  const canAccessDashboard = canAccessAdminDashboardPage(userData);
  const canManageUsers = canAccessManageUserPage(userData);
  const canManagePlans = canAccessPlanManagementPage(userData);
  const canManageContent = canAccessContentManagementPage(userData);
  const canManageCategories = canAccessCategoryManagementPage(userData);

  // --- Chart Data: Passed directly to component for processing ---

  const stats = useMemo(() => {
    // We remove the !dashboardStats guard to allow rendering initial state (Fetching...)

    const allStats = [
      {
        label: "Total Articles",
        value: dashboardStats?.totalArticles?.value?.toLocaleString() ?? "Fetching...",
        icon: <TrendingUp className="w-5 h-5" />,
        trend: dashboardStats?.totalArticles?.trend ?? null,
        trendUp: dashboardStats?.totalArticles?.trendUp ?? true,
        sparklineData: dashboardStats?.totalArticles?.sparklineData ?? [],
        show: canManageContent
      },
      {
        label: "Published Articles",
        value: dashboardStats?.publishedArticles?.value?.toLocaleString() ?? "Fetching...",
        icon: <Star className="w-5 h-5" />,
        trend: dashboardStats?.publishedArticles?.trend ?? null,
        trendUp: dashboardStats?.publishedArticles?.trendUp ?? true,
        sparklineData: dashboardStats?.publishedArticles?.sparklineData ?? [],
        show: canManageContent
      },
      {
        label: "Pending Articles",
        value: dashboardStats?.pendingArticles?.value?.toLocaleString() ?? "Fetching...",
        icon: <Clock className="w-5 h-5" />,
        trend: dashboardStats?.pendingArticles?.trend ?? null,
        trendUp: dashboardStats?.pendingArticles?.trendUp ?? false,
        sparklineData: dashboardStats?.pendingArticles?.sparklineData ?? [],
        show: canManageContent
      },
      {
        label: "Active Users",
        value: dashboardStats?.activeUsers?.value?.toLocaleString() ?? "Fetching...",
        icon: <UserCheck className="w-5 h-5" />,
        trend: dashboardStats?.activeUsers?.trend ?? null,
        trendUp: dashboardStats?.activeUsers?.trendUp ?? true,
        sparklineData: dashboardStats?.activeUsers?.sparklineData ?? [],
        show: canManageUsers
      },
      {
        label: "Total Users",
        value: dashboardStats?.totalUsers?.value?.toLocaleString() ?? "Fetching...",
        path: "/admin/users",
        icon: <Users className="w-5 h-5" />,
        trend: dashboardStats?.totalUsers?.trend ?? null,
        trendUp: dashboardStats?.totalUsers?.trendUp ?? true,
        sparklineData: dashboardStats?.totalUsers?.sparklineData ?? [],
        show: canManageUsers
      },
      {
        label: "Most Active Category",
        value: dashboardStats?.mostActiveCategory?.value ?? "Fetching...",
        icon: <Eye className="w-5 h-5" />,
        trend: dashboardStats?.mostActiveCategory?.trend ?? null,
        trendUp: dashboardStats?.mostActiveCategory?.trendUp ?? true,
        sparklineData: dashboardStats?.mostActiveCategory?.sparklineData ?? [],
        show: canManageCategories
      },
      {
        label: "Premium Subscribers",
        value: dashboardStats?.premiumSubscribers?.value?.toLocaleString() ?? "Fetching...",
        icon: <CircleDollarSign className="w-5 h-5" />,
        trend: dashboardStats?.premiumSubscribers?.trend ?? null,
        trendUp: dashboardStats?.premiumSubscribers?.trendUp ?? true,
        sparklineData: dashboardStats?.premiumSubscribers?.sparklineData ?? [],
        show: canManagePlans
      },
      {
        label: "Free Users",
        value: dashboardStats?.freeUsers?.value?.toLocaleString() ?? "Fetching...",
        icon: <Users className="w-5 h-5" />,
        trend: dashboardStats?.freeUsers?.trend ?? null,
        trendUp: dashboardStats?.freeUsers?.trendUp ?? true,
        sparklineData: dashboardStats?.freeUsers?.sparklineData ?? [],
        show: canManagePlans
      },
    ];

    return allStats.filter(s => s.show);
  }, [dashboardStats, canManageUsers, canManagePlans, canManageContent, canManageCategories]);



  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Only show the full-page skeleton if we have NO data to display at all.
  // If we have cached data (dashboardStats exists), we skip the skeleton and show the cached data instantly.
  const { error: dashboardError } = useAppSelector((state) => state.dashboard);
  if (!dashboardStats && !dashboardError) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-12">
        {/* Header Section Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pt-4 px-2">
          <div>
            <div className="h-9 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Top Stats Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((_, i) => (
            <div key={i} className="h-[140px] bg-[#0B2149] p-6 rounded-2xl shadow-[0_4px_20px_-4px_rgba(11,33,73,0.4)] border border-[#0B2149]/80 flex flex-col justify-between animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="h-[46px] w-[46px] bg-white/10 rounded-xl"></div>
                <div className="h-[22px] w-[50px] bg-white/10 rounded-full"></div>
              </div>
              <div className="flex items-end justify-between mt-2">
                <div>
                  <div className="h-[32px] w-[80px] bg-white/20 rounded mb-2.5"></div>
                  <div className="h-[14px] w-[110px] bg-[#C9A227]/30 rounded"></div>
                </div>
                <div className="h-[24px] w-[60px] bg-white/10 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid Layers Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {canManageContent && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div className="h-6 w-48 bg-gray-200 rounded"></div>
                  <div className="h-9 w-64 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="h-16 bg-gray-50 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          {(canManagePlans || isAdmin(userData) || canAccessMyEarningsPage(userData)) && (
            <div className="lg:col-span-1">
              <div className="h-[480px] bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col animate-pulse">
                <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
                <div className="flex-1 bg-gray-50 rounded-xl border border-gray-100"></div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {canManageContent && (
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                  <div className="h-6 w-40 bg-gray-200 rounded"></div>
                  <div className="h-9 w-24 bg-gray-100 rounded-lg"></div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-20 bg-gray-50 rounded-xl"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden animate-pulse h-full">
              <div className="p-6 border-b border-gray-100">
                <div className="h-6 w-36 bg-gray-200 rounded"></div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex gap-4">
                      <div className="h-10 w-10 bg-gray-100 rounded-full shrink-0"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                        <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 animate-fadeIn pt-4 px-2">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Overview</h1>
          <p className="text-gray-500 mt-1 font-medium">{currentDate}</p>
        </div>
        {/* <div className="mt-4 md:mt-0 flex flex-col items-end gap-3">
          <div className="flex gap-3">
            <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
              Export Report
            </button>
            <button className="bg-[#0B2149] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-[#0B2149]/90 transition-colors">
              + Create
            </button>
          </div>
        </div> */}
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((item, i) => (
          <div
            key={i}
            onClick={() => item.path && router.push(item.path)}
            className={item.path ? "cursor-pointer h-full" : "h-full"}
          >
            <StatCard
              icon={item.icon}
              title={item.label}
              value={item.value}
              trend={item.trend}
              trendUp={item.trendUp}
              sparklineData={item.sparklineData}
            />
          </div>
        ))}
      </div>

      {/* Main Content Grid Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {canManageContent && (
          <div className="lg:col-span-2">
            <DummyChart articles={articles} />
          </div>
        )}
        {(canManagePlans || isAdmin(userData) || canAccessMyEarningsPage(userData)) && (
          <div className="lg:col-span-1">
            <RevenueChart 
              user={userData} 
              isAdmin={isAdmin(userData) || canManagePlans} 
              isAdvocate={canAccessMyEarningsPage(userData)} 
            />
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Placeholders for original tables or newly styled tables */}
          {/* <ContentTable /> 
               <ContentApprovalPanel /> */}
          {/* <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400 font-medium">
            Data Tables Area...
          </div> */}
        </div>
        {/* <div className="lg:col-span-1">
          <RecentActivity />
        </div> */}
      </div>
    </div>
  );
};

export default Page;
