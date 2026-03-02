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
import { PERMISSIONS, ROLES } from "@/config/permissions";
import { getUserType, hasDashboardAccess } from "@/utils/permissions";
import apiClient from "@/data/services/apiConfig/apiClient";



const Page = () => {
  useDocTitle("Admin Dashboard | Sajjad Husain Law Associates");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { articles } = useAppSelector((state) => state.article);
  const { users } = useAppSelector((state) => state.users);

  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    dispatch(fetchArticles({}));
    dispatch(fetchUsers({}));

    const fetchDashboard = async () => {
      try {
        setLoadingStats(true);
        const { data } = await apiClient.get('/users/dashboard-stats');
        setDashboardStats(data?.data || data);
        console.log(data?.data || data);
      } catch (error) {
        console.error('Failed to fetch dynamic dashboard stats', error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboard();
  }, [dispatch]);

  // --- Chart Data: Passed directly to component for processing ---

  const stats = dashboardStats ? [
    {
      label: "Total Articles",
      value: dashboardStats.totalArticles?.value?.toLocaleString() ?? "N/A",
      icon: <TrendingUp className="w-5 h-5" />,
      trend: dashboardStats.totalArticles?.trend ?? null,
      trendUp: dashboardStats.totalArticles?.trendUp ?? true,
      sparklineData: dashboardStats.totalArticles?.sparklineData ?? [],
    },
    {
      label: "Published Articles",
      value: dashboardStats.publishedArticles?.value?.toLocaleString() ?? "N/A",
      icon: <Star className="w-5 h-5" />,
      trend: dashboardStats.publishedArticles?.trend ?? null,
      trendUp: dashboardStats.publishedArticles?.trendUp ?? true,
      sparklineData: dashboardStats.publishedArticles?.sparklineData ?? [],
    },
    {
      label: "Pending Articles",
      value: dashboardStats.pendingArticles?.value?.toLocaleString() ?? "N/A",
      icon: <Clock className="w-5 h-5" />,
      trend: dashboardStats.pendingArticles?.trend ?? null,
      trendUp: dashboardStats.pendingArticles?.trendUp ?? false,
      sparklineData: dashboardStats.pendingArticles?.sparklineData ?? [],
    },
    {
      label: "Active Users",
      value: dashboardStats.activeUsers?.value?.toLocaleString() ?? "N/A",
      icon: <UserCheck className="w-5 h-5" />,
      trend: dashboardStats.activeUsers?.trend ?? null,
      trendUp: dashboardStats.activeUsers?.trendUp ?? true,
      sparklineData: dashboardStats.activeUsers?.sparklineData ?? [],
    },
    {
      label: "Total Users",
      value: dashboardStats.totalUsers?.value?.toLocaleString() ?? "N/A",
      path: "/admin/users",
      icon: <Users className="w-5 h-5" />,
      trend: dashboardStats.totalUsers?.trend ?? null,
      trendUp: dashboardStats.totalUsers?.trendUp ?? true,
      sparklineData: dashboardStats.totalUsers?.sparklineData ?? [],
    },
    {
      label: "Most Active Category",
      value: dashboardStats.mostActiveCategory?.value ?? "—",
      icon: <Eye className="w-5 h-5" />,
      trend: dashboardStats.mostActiveCategory?.trend ?? null,
      trendUp: dashboardStats.mostActiveCategory?.trendUp ?? true,
      sparklineData: dashboardStats.mostActiveCategory?.sparklineData ?? [],
    },
    {
      label: "Premium Subscribers",
      value: dashboardStats.premiumSubscribers?.value?.toLocaleString() ?? "N/A",
      icon: <CircleDollarSign className="w-5 h-5" />,
      trend: dashboardStats.premiumSubscribers?.trend ?? null,
      trendUp: dashboardStats.premiumSubscribers?.trendUp ?? true,
      sparklineData: dashboardStats.premiumSubscribers?.sparklineData ?? [],
    },
    {
      label: "Free Users",
      value: dashboardStats.freeUsers?.value?.toLocaleString() ?? "N/A",
      icon: <Users className="w-5 h-5" />,
      trend: dashboardStats.freeUsers?.trend ?? null,
      trendUp: dashboardStats.freeUsers?.trendUp ?? true,
      sparklineData: dashboardStats.freeUsers?.sparklineData ?? [],
    },
  ] : [];

  // --- Authorization Check for View ---
  const { user: reduxUser, loading: profileLoading } = useProfileActions();
  const userData = reduxUser as UserData;

  const userType = getUserType(userData);
  const hasStaffAccess = hasDashboardAccess(userData);

  if (profileLoading) return <Loader />;

  // Redirect normal users with no privileges to the membership page immediately
  if (userType === 'user' && typeof window !== "undefined") {
    router.replace("/admin/membership");
    return <Loader />;
  }

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

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
        <div className="lg:col-span-2">
          <DummyChart articles={articles} />
        </div>
        <div className="lg:col-span-1">
          <RevenueChart />
        </div>
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

