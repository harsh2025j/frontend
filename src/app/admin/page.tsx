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
} from "lucide-react";
import ContentTable from "./components/ContentTable";
import StatCard from "./components/StatCard";
import DummyChart from "./components/charts/LineChart";
import RevenueChart from "./components/charts/RevenueChart";
import ContentApprovalPanel from "./components/UrgentTable";
import { Router } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";

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

export default function Page() {
  //   const router = useRouter();
  //   const {
  //     user: reduxProfileUser,
  //   } = useProfileActions();
  //   const user: UserData = reduxProfileUser || ({} as UserData);
  // const role = user.role?.name;
  // console.log(role);
  //   useEffect(() => {

  //   if (!user) return; 

  //   if (!role || role === "user") {
  //     router.replace("/auth/login");
  //   }
  // }, [user, router]);

  // if (!user.role ) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center">
  //         <Loader text="Loading Profile..." size="lg" />
  //       </div>
  //     );
  //   }


  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-gray-800">Overview</h1>

        <Link
          href="/admin/create-content"
          className="flex items-center gap-2 px-4 py-2 bg-[#C9A227] text-white rounded-md hover:bg-orange-600 transition"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Article
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {data.map((item, i) => (
          <div
            key={i}
          >
            <StatCard icon={item.icon} title={item.label} value={item.value} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">

        <DummyChart />
        <RevenueChart />
      </div>


      <div className="mt-8 space-y-6">
        {/* <ContentTable />
        <ContentApprovalPanel /> */}
      </div>
    </>
  );
}




