"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/data/redux/hooks";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);

  const router = useRouter();
  const reduxUser = useAppSelector((s) => s.auth.user);

  // Redirect if no token
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) router.replace("/auth/login");
    }
  }, [router]);

  // Load localStorage user
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined" && stored !== "null") {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") setLocalUser(parsed);
      }
    } catch (err) {
      console.error("User parsing failed:", err);
      localStorage.removeItem("user");
      setLocalUser(null);
    }
  }, []);

  // Final user
  const user = reduxUser || localUser || {};

  const name = user?.name || "";
  const email = user?.email || "";
  const phone = user?.phone || "";
  const dob = user?.dob || "";
  const avatar = user?.avatar || "";

  // FIXED — email is available here
  const resetProfilePassword = () => {
    router.push(`/auth/forgot-password?Step=reset&email=${email}`);
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Details */}
          <div className="col-span-2 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-1">Personal Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              Manage how your personal information appears on your profile.
            </p>

            <div className="flex items-start gap-6">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl text-gray-400">{name ? name[0] : "U"}</span>
                )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField label="Full Name" value={name} />
                <InputField label="Email" value={email} />
                <InputField label="Phone Number" value={phone} />
                <InputField label="Date of Birth" value={dob} />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm">
                Upload New
              </button>
              <button className="px-4 py-2 rounded-md border text-sm">Edit</button>
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Action</h3>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="block w-full text-center border rounded-md py-2 mb-3 hover:bg-gray-600 text-sm bg-gray-800 text-white"
            >
              Logout
            </button>

            <button
              className="block w-full text-center border rounded-md py-2 mb-3 hover:bg-gray-50 text-sm mt-20"
              onClick={resetProfilePassword}
            >
              Reset Password
            </button>

            <button className="w-full bg-red-500 text-white rounded-md py-2 text-sm">
              Delete Account
            </button>
            
          </div>
        </div>

        {/* Current Plan */}
        <div className="mt-6 bg-white rounded-lg border p-6">
          <h3 className="text-lg font-semibold mb-2">Current Plan</h3>
          <div className="text-sm text-gray-600">No plan data available.</div>

          <div className="mt-4">
            <Link
              className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm"
              href="/subscription"
            >
              Choose Plan
            </Link>
          </div>
        </div>
      </div>

      {showLogoutConfirm && (
        <LogoutModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={() => {
            setShowLogoutConfirm(false);
            handleLogout();
          }}
        />
      )}
    </div>
  );
}


function InputField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
        value={value}
        readOnly
      />
    </div>
  );
}

function LogoutModal({
  onCancel,
  onConfirm,
}: {
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onCancel}
      />

      <div className="relative z-[61] w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-xl border p-6">
          <h3 className="text-base font-semibold">Log out?</h3>
          <p className="text-sm text-gray-600 mt-1">
            Are you sure you want to log out?
          </p>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm rounded-md border hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm rounded-md bg-black text-white hover:opacity-90"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
