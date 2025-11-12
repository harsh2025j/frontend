"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppSelector } from "@/data/redux/hooks";
import { useRouter } from "next/navigation";

export default function ProfilePage() {

  const router=useRouter();
  useEffect(() => {
      if (!(localStorage.getItem("token"))){ 
         router.replace("/auth/login");
      }  
  }, []);
  const reduxUser = useAppSelector((s) => s.auth.user);
  const [localUser, setLocalUser] = useState<any>(null);

  
    const resetProfilePassword=()=>{

      router.push(`/auth/forgot-password?Step="reset"&email=${email}`)
      
   }

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined" && stored !== "null") {
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === "object") {
            setLocalUser(parsed);
          }
        } catch {
          localStorage.removeItem("user");

          setLocalUser(null);
        }
      }
    } catch {}
  }, []);

  const user = useMemo(() => reduxUser || localUser || {}, [reduxUser, localUser]);

  const name = user?.name || "";
  const email = user?.email || "";
  const phone = user?.phone || ""; // not in type; backend may return; fallback blank
  const dob = user?.dob || ""; // not in type; fallback blank
  const avatar = user?.avatar || "";
 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Personal Details */}
          <div className="col-span-2 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-1">Personal Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              Manage how your personal information appears on your profile.
            </p>

            <div className="flex items-start gap-6">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" width={112} height={112} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl text-gray-400">{name ? name[0] : "U"}</span>
                )}
              </div>
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    value={name}
                    placeholder=" "
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    value={email}
                    placeholder=" "
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone Number</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    value={phone}
                    placeholder=" "
                    readOnly
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Date of Birth</label>
                  <input
                    className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                    value={dob}
                    placeholder=" "
                    readOnly
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm">Upload New</button>
              <button className="px-4 py-2 rounded-md border text-sm">Edit</button>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Action</h3>
            <button className="block w-full text-center border rounded-md py-2 mb-3 hover:bg-gray-50 text-sm" onClick={resetProfilePassword}>Reset Password</button>
            {/* <Link
              href="/auth/forgot-password"
              className="block w-full text-center border rounded-md py-2 mb-3 hover:bg-gray-50 text-sm"
            >
              Reset Password
            </Link> */}
            <button className="w-full bg-red-500 text-white rounded-md py-2 text-sm">Delete Account</button>
          </div>
        </div>

        {/* Current Plan (placeholder/dummy) */}
        <div className="mt-6 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">Current Plan</h3>
          <div className="text-sm text-gray-600">No plan data available.</div>
          <div className="mt-4">
            <button className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm">Choose Plan</button>
          </div>
        </div>
      </div>
    </div>
  );
}


