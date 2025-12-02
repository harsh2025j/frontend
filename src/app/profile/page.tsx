"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
// import img from "../../assets/img1.png" // Unused import removed
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

// import { rolesApi } from "@/data/services/roles-service/roles-service"; // Unused import removed
import { UserData } from "@/data/features/profile/profile.types";
import { X, Upload, Camera } from "lucide-react";

type Prefs = {
  language: string;
  doNotDisturb: boolean;
  caseStatusAlerts: boolean;
};

export default function ProfilePage() {
  // --- NEW PROFILE STATE MANAGEMENT ---
  const {
    user: reduxProfileUser,
    loading: profileLoading,
    updateProfile: handleUpdateProfile,
  } = useProfileActions();
  const user: UserData = reduxProfileUser || ({} as UserData);
  const router = useRouter();

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // --- LOCAL/UI STATE ---
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

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


  const name = user?.name || "";
  const email = user?.email || "";
  const phone = user?.phone || "";
  const dob = user?.dob || "";
  const avatar = user?.profilePicture || null;

  const resetProfilePassword = () => {
    router.push(`/auth/forgot-password?Step=reset&email=${email}`);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }
      else if (!user) {
        router.replace("/auth/login")
        return;
      }

    }
  }, [user, router]);

  const handleLogout = () => {
    localStorage.clear();
    
    router.push("/auth/login");
  };

  const handleSave = () => {
    setSaving(true);

    // 1. Persist local preferences (language, toggles) to localStorage
    try {
      localStorage.setItem("profile_prefs", JSON.stringify(prefs));
    } catch (err) {
      console.error("Saving prefs failed", err);
    }
    setDirty(false);

    setTimeout(() => setSaving(false), 600);
  };

  const handleCancelPreferences = () => {
    const raw = localStorage.getItem("profile_prefs");
    if (raw) {
      try {
        setPrefs(JSON.parse(raw));
      } catch { }
    } else {
      setPrefs({
        language: "english-ind",
        doNotDisturb: false,
        caseStatusAlerts: true,
      });
    }
    setDirty(false);
  };
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsImageModalOpen(true);
    }
  };

  const handleConfirmImageUpload = async () => {
    if (selectedFile) {
      await handleUpdateProfile({ avatar: selectedFile });
      handleCloseImageModal();
    }
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- EDIT PROFILE LOGIC ---
  const handleOpenEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveProfileData = async (data: { name: string; phone: string; dob: string }) => {
    await handleUpdateProfile(data);
    setIsEditModalOpen(false);
  };
  // --- LOADING RENDER ---
  if (!user.email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading Profile..." size="lg" />
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={onFileSelect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Details (left, spans 2 columns on lg) */}
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-1">Personal Details</h2>
            <p className="text-sm text-gray-500 mb-6">
              Manage how your personal information appears on your profile.
            </p>

            {/* Changed flex-row to flex-col on mobile for stacking */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-28 h-28 shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-3 border-primary">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt="Avatar"
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <span className="text-2xl text-gray-400">
                    {name ? name[0].toUpperCase() : "U"}
                  </span>
                )}
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditableField label="Full Name" value={name} readOnly={true} />
                <EditableField label="Email" value={email} readOnly={true} />
                <EditableField label="Phone Number" value={phone} readOnly={true} />
                <EditableField label="Date of Birth" value={dob} readOnly={true} />
              </div>
            </div>

            {/* Buttons responsive stacking */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm w-full sm:w-auto" 
                onClick={triggerFileUpload} 
              >
                Upload New Picture
              </button>
              <button 
                className="px-4 py-2 rounded-md border text-sm border-primary w-full sm:w-auto" 
                onClick={handleOpenEditProfile} 
              >
                Edit Info
              </button>
            </div>
          </div>

          {/* Preferences (right column on lg) */}
          <div className="bg-white rounded-lg p-6">
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
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
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
                className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm inline-block w-full sm:w-auto text-center"
                href="/subscription"
              >
                Upgrade Plan
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
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
        
        {/* Save/Cancel Buttons responsive alignment */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-4">
          <button
            onClick={handleCancelPreferences}
            className="px-4 py-2 rounded-md border text-sm bg-white hover:bg-gray-50 w-full sm:w-auto"
            disabled={!dirty}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md text-sm bg-[#C9A227] text-white disabled:opacity-60 w-full sm:w-auto"
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
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-fadeIn">
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Preview Image</h3>
              <button onClick={handleCloseImageModal} className="text-gray-500 hover:text-red-500 transition">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner mb-6 relative">
                {previewUrl && (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={triggerFileUpload}
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                >
                  Choose Another
                </button>
                <button
                  onClick={handleConfirmImageUpload}
                  className="flex-1 px-4 py-2.5 bg-[#C9A227] text-white rounded-lg font-medium hover:bg-[#b08d21] transition shadow-md text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={{ name, phone, dob }}
          onSave={handleSaveProfileData}
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
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; phone: string; dob: string };
  onSave: (data: { name: string; phone: string; dob: string }) => void;
}

function EditProfileModal({ isOpen, onClose, currentUser, onSave }: EditProfileModalProps) {
  const [formData, setFormData] = useState(currentUser);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-fadeIn">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] outline-none transition text-sm"
              placeholder="Enter your name"
            />
          </div>
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] outline-none transition text-sm"
              placeholder="+91 XXXXX XXXXX"
            />
          </div> 
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#C9A227]/20 focus:border-[#C9A227] outline-none transition text-sm"
            />
          </div> */}
        </div>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-white transition text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            className="px-4 py-2 rounded-lg bg-[#0A2342] text-white font-medium hover:bg-[#153a66] transition shadow-md text-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${checked ? "bg-[#C9A227]" : "bg-gray-300"
        }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"
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

      <div className="relative z-[61] w-full max-w-sm m-4"> {/* Added margin for mobile safety */}
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