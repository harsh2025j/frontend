"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import img from "../../assets/img1.png"
import { useAppSelector } from "@/data/redux/hooks";
import { useRouter } from "next/navigation";

/**
 * Fully functional Profile page with:
 * - Preferences (language + toggles)
 * - Save / Cancel that persist to localStorage
 * - Reset password, logout modal, delete account (UI)
 *
 * NOTE:
 * - This is intentionally self-contained and stores settings in localStorage.
 * - Replace avatar path or adapt image handling to your backend when ready.
 */

type Prefs = {
  language: string;
  doNotDisturb: boolean;
  caseStatusAlerts: boolean;
};

export default function ProfilePage() {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [localUser, setLocalUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
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

  // Preferences (load default from localStorage or fallback)
  const [prefs, setPrefs] = useState<Prefs>({
    language: "english-ind",
    doNotDisturb: false,
    caseStatusAlerts: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("profile_prefs");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Prefs;
        setPrefs((p) => ({ ...p, ...parsed }));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  // Final user (prefer redux, fallback local)
  const user = reduxUser || localUser || {};

  const name = user?.name || "";
  const email = user?.email || "";
  const phone = user?.phone || "";
  const dob = user?.dob || "";
  const avatar = user?.avatar || "/mnt/data/ebd526a9-f568-4ae0-bb7e-1a75edb1e599.png";

  // Reset / Save
  const resetProfilePassword = () => {
    // email must be present to pre-fill the reset flow in your app
    router.push(`/auth/forgot-password?Step=reset&email=${email}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/auth/login");
  };

  const handleSave = () => {
    setSaving(true);
    // Simulate quick save (no backend call). Persist to localStorage.
    try {
      localStorage.setItem("profile_prefs", JSON.stringify(prefs));
      setDirty(false);
      // (Optionally) keep a copy of user display fields too
      const displayUser = {
        name,
        email,
        phone,
        dob,
        avatar,
      };
      // do not overwrite server user but store for offline display
      localStorage.setItem("user", JSON.stringify(displayUser));
    } catch (err) {
      console.error("Saving prefs failed", err);
    }

    // quick UI feedback
    setTimeout(() => setSaving(false), 600);
  };

  const handleCancel = () => {
    // restore from storage
    const raw = localStorage.getItem("profile_prefs");
    if (raw) {
      try {
        setPrefs(JSON.parse(raw));
      } catch {
        // ignore
      }
    } else {
      // fallback defaults
      setPrefs({
        language: "english-ind",
        doNotDisturb: false,
        caseStatusAlerts: true,
      });
    }
    setDirty(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Grid layout to match screenshot */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Details (left, spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-white rounded-lg  p-6">
            <h2 className="text-lg font-semibold mb-1">Personal Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              Manage how your personal information appears on your profile.
            </p>

            <div className="flex items-start gap-6">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {avatar ? (
                  // Next.js Image expects either remote domain config or local static import.
                  // Many projects accept a direct path — adjust if necessary.
                  <Image
                    // src={avatar}
                    src={img}
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
                <EditableField label="Full Name" value={name} readOnly={true} />
                <EditableField label="Email" value={email} readOnly={true} />
                <EditableField label="Phone Number" value={phone} readOnly={true} />
                <EditableField label="Date of Birth" value={dob} readOnly={true} />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm">
                Upload New
              </button>
              <button className="px-4 py-2 rounded-md border text-sm">Edit</button>
            </div>
          </div>

          {/* Preferences (right column on lg) */}
          <div className="bg-white rounded-lg  p-6">
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>

            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-2">
                  Language & Region
                </label>
                <CustomSelect
                  value={prefs.language}
                  onChange={(v) => {
                    setPrefs((p) => ({ ...p, language: v }));
                    setDirty(true);
                  }}
                  options={[
                    { value: "english-ind", label: "English (IND)" },
                    { value: "hindi-in", label: "हिन्दी (IN)" },
                    { value: "english-us", label: "English (US)" },
                    { value: "marathi-in", label: "मराठी (IN)" },
                  ]}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-3">Notifications</label>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                    <div className="text-sm text-gray-700">Do not disturb</div>
                    <ToggleSwitch
                      checked={prefs.doNotDisturb}
                      onChange={(val) => {
                        setPrefs((p) => ({ ...p, doNotDisturb: val }));
                        setDirty(true);
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                    <div className="text-sm text-gray-700">Case Status Alerts</div>
                    <ToggleSwitch
                      checked={prefs.caseStatusAlerts}
                      onChange={(val) => {
                        setPrefs((p) => ({ ...p, caseStatusAlerts: val }));
                        setDirty(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom area: Current Plan (left) + Quick Action (right) */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg  p-6">
            <h3 className="text-lg font-semibold mb-2">Current Plan</h3>

            <div className="grid gap-4 text-sm text-gray-700">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="bg-emerald-400 text-emerald-900 px-2 py-0.5 rounded-full text-xs">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member Since</span>
                  <span>12 Jan 2021</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span>02, Aug 2025</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Plan</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Expiry</span>
                  <span>01, Aug 2026</span>
                </div>
              </div>
            </div>

            <div className="mt-6 mx-auto">
              <Link
                className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm inline-block"
                href="/subscription"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg  p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Action</h3>

            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="block w-full text-center border rounded-md py-2 mb-3 hover:bg-gray-700 text-sm bg-primary text-white"
            >
              Logout
            </button>

            <button
              className="block w-full text-center border hover:bg-gray-50 rounded-md py-2 mb-3 text-sm"
              onClick={resetProfilePassword}
            >
              Reset Password
            </button>

            <button className="w-full bg-red-500 hover:bg-red-400 text-white rounded-md py-2 text-sm mb-4">
              Delete Account
            </button>

            
          </div>
          
        </div>
        <div className="flex items-center justify-end gap-3 mt-4 ">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-md border text-sm bg-white hover:bg-gray-50"
                disabled={!dirty}
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-md text-sm bg-[#C9A227] text-white disabled:opacity-60"
                disabled={!dirty || saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
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


function EditableField({
  label,
  value,
  readOnly = false,
}: {
  label: string;
  value: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500">{label}</label>
      <input
        className="mt-1 w-full border rounded-md px-3 py-2 text-sm bg-white"
        value={value}
        readOnly={readOnly}
      />
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-[#C9A227]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded-md px-3 py-2 text-sm appearance-none bg-white"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* chevron */}
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-gray-400">
          <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative z-[61] w-full max-w-sm">
        <div className="bg-white rounded-xl shadow-xl border p-6">
          <h3 className="text-base font-semibold">Log out?</h3>
          <p className="text-sm text-gray-600 mt-1">Are you sure you want to log out?</p>

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
