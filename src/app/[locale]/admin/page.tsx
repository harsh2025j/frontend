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
import { Router } from "next/router";
import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";
import { useDocTitle } from "@/hooks/useDocTitle";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { fetchArticles } from "@/data/features/article/articleThunks";
import { fetchUsers } from "@/data/features/users/usersThunks";


const data = [
  { label: "Total Articles", value: "12,450", icon: <TrendingUp className="w-8 h-8 text-blue-500" /> },
  { label: "AI Summaries", value: "6,320", icon: <Star className="w-8 h-8 text-yellow-500" /> },
  { label: "Active Users", value: "8,911", icon: <UserCheck className="w-8 h-8 text-green-500" /> },
  { label: "Total Users", value: "1,51,254", icon: <Users className="w-8 h-8 text-indigo-500" /> },
  { label: "Premium Subscribers", value: "1,450", icon: <CircleDollarSign className="w-8 h-8 text-orange-500" /> },
  { label: "Most Viewed Category", value: "1,450", icon: <Eye className="w-8 h-8 text-blue-500" /> },
  { label: "Most Search City", value: "1,450", icon: <MapPin className="w-8 h-8 text-red-500" /> },
  { label: "Free Users", value: "10,520", icon: <Users className="w-8 h-8 text-gray-400" /> },
]

const Page = () => {
  useDocTitle("Admin Dashboard | Sajjad Husain Law Associates");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { articles } = useAppSelector((state) => state.article);
  const { users } = useAppSelector((state) => state.users);

  useEffect(() => {
    dispatch(fetchArticles({}));
    dispatch(fetchUsers({}));
  }, [dispatch]);

  // --- Stats Calculation ---
  // 1. Total Articles
  const totalArticles = articles.length;

  // 2. Active Users (Verified)
  const activeUsers = users.filter(u => u.isVerified).length;

  // 3. Total Users
  const totalUsers = users.length;

  // 4. AI Summaries (Placeholder or derived if available, reusing dummy for now if no field exists, 
  //    or perhaps counting articles that have content length > X? Let's use a dummy or separate count if needed.
  //    For now, I'll calculate "Published Articles" as a proxy or just keep it 0 if unknown)
  const publishedArticles = articles.filter(a => a.status === 'published').length;
  const pendingArticles = articles.filter(a => a.status === 'pending').length;

  // 5. Most Active Category
  const categoryCounts: Record<string, number> = {};
  articles.forEach((article) => {
    if (article.category?.name) {
      categoryCounts[article.category.name] = (categoryCounts[article.category.name] || 0) + 1;
    }
  });

  let mostActiveCategory = "N/A";
  let maxCount = 0;

  Object.entries(categoryCounts).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostActiveCategory = category;
    }
  });


  // --- Chart Data: Passed directly to component for processing ---

  const stats = [
    { label: "Total Articles", value: totalArticles.toLocaleString(), icon: <TrendingUp className="w-8 h-8 text-blue-500" /> },
    { label: "Published Articles", value: publishedArticles.toLocaleString(), icon: <Star className="w-8 h-8 text-yellow-500" /> },
    { label: "Pending Articles", value: pendingArticles.toLocaleString(), icon: <Clock className="w-8 h-8 text-orange-500" /> },
    { label: "Active Users", value: activeUsers.toLocaleString(), icon: <UserCheck className="w-8 h-8 text-green-500" /> },
    { label: "Total Users", value: totalUsers.toLocaleString(), icon: <Users className="w-8 h-8 text-indigo-500" /> },
    { label: "Most Active Category", value: mostActiveCategory, icon: <Eye className="w-8 h-8 text-blue-500" /> },
    // Keeping placeholders for data we don't have yet but reducing confusion
    // { label: "Premium Subscribers", value: "0", icon: <CircleDollarSign className="w-8 h-8 text-orange-500" /> }, 
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((item, i) => (
          <div key={i}>
            <StatCard icon={item.icon} title={item.label} value={item.value} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <DummyChart articles={articles} />
        <RevenueChart />
      </div>

      <div className="mt-8 space-y-6">
        {/* <ContentTable /> 
            <ContentApprovalPanel /> */}
      </div>
    </>
  );
}

export default Page;




