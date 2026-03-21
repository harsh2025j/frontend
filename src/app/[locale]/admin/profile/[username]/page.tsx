"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, usePathname } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Loader from "@/components/ui/Loader";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { profileApi } from "@/data/services/profie-service/profile-service";
import { UserData } from "@/data/features/profile/profile.types";
import { X, Camera, ChevronDown } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { getUserSubscription } from "@/data/features/subscription/subscriptionThunks";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import SavedPostsModal from "@/app/[locale]/profile/components/SavedPostsModal";

export default function AdminUnifiedProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const dispatch = useAppDispatch();

  // Logged in user state (from Redux)
  const {
    user: loggedInUser,
    loading: loggedInLoading,
    updateProfile: handleUpdateProfile,
  } = useProfileActions();

  const subscription = useAppSelector((state) => state.subscription.currentSubscription);
  const subscriptionLoading = useAppSelector((state) => state.subscription.loading);

  // Target profile state (from API by username)
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isOwner = loggedInUser?.username === username;

  useDocTitle(profileUser ? `${profileUser.name} 's Profile` : "Profile");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await profileApi.fetchProfileByUsername(username);
        if (response.data.success) {
          setProfileUser(response.data.data);
        } else {
          setError(response.data.message || "Failed to load profile");
        }
      } catch (err: any) {
        console.error("Error fetching profile by username:", err);
        setError("Failed to load profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (username) {
      fetchProfile();
    }
  }, [username]);

  // Fetch subscription if owner
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && isOwner) {
      dispatch(getUserSubscription());
    }
  }, [dispatch, isOwner]);

  // UI State
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavedPostsModalOpen, setIsSavedPostsModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [prefs, setPrefs] = useState({
    language: currentLocale,
    doNotDisturb: false,
    caseStatusAlerts: true,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("profile_prefs");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setPrefs((p) => ({ ...p, ...parsed }));
      } catch { }
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader text="Loading Profile..." size="lg" />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || "Profile not found."}</p>
          <button onClick={() => router.push("/admin")} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const name = profileUser.name || "";
  const email = profileUser.email || "";
  const phone = profileUser.phone || "";
  const dob = profileUser.dob || "";
  const avatar = profileUser.profilePicture || null;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  const handleSavePreferences = () => {
    setSaving(true);
    try {
      localStorage.setItem("profile_prefs", JSON.stringify(prefs));
      if (prefs.language !== currentLocale) {
        router.replace(pathname, { locale: prefs.language });
      }
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
      setProfileUser(prev => prev ? { ...prev, profilePicture: URL.createObjectURL(selectedFile) } : null);
    }
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
    setPreviewUrl(null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSaveProfileData = async (data: any) => {
    await handleUpdateProfile(data);
    setIsEditModalOpen(false);
    setProfileUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={onFileSelect} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-1">{isOwner ? "Personal Details" : "Profile Details"}</h2>
            <p className="text-sm text-gray-500 mb-6">Manage how your personal information appears on your profile.</p>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-28 h-28 shrink-0 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center border-[3px] border-[#C9A227] relative group">
                {avatar ? (
                  <Image src={avatar} alt="Avatar" width={112} height={112} className="object-cover w-full h-full" />
                ) : (
                  <span className="text-2xl text-gray-400">{name ? name[0].toUpperCase() : "U"}</span>
                )}
                {isOwner && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer" onClick={triggerFileUpload}>
                    <Camera size={20} />
                  </div>
                )}
              </div>

              <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
                <EditableField label="Full Name" value={name} readOnly={true} />
                <EditableField label="Email" value={isOwner ? email : email.replace(/(.{3})(.*)(?=@)/, '$1***')} readOnly={true} />
                
                {profileUser.phone && <EditableField label="Phone" value={isOwner ? profileUser.phone : profileUser.phone.replace(/.(?=.{4})/g, '*')} readOnly={true} />}
                {profileUser.dob && <EditableField label="Date of Birth" value={formatDate(profileUser.dob)} readOnly={true} />}
                {profileUser.city && <EditableField label="City" value={profileUser.city} readOnly={true} />}
                {profileUser.state && <EditableField label="State" value={profileUser.state} readOnly={true} />}
                {profileUser.designation && <EditableField label="Designation" value={profileUser.designation} readOnly={true} />}
                {profileUser.specialization && <EditableField label="Specialization" value={profileUser.specialization} readOnly={true} />}
                {profileUser.yearsOfExperience && <EditableField label="Experience (Years)" value={String(profileUser.yearsOfExperience)} readOnly={true} />}
                {profileUser.barRegistrationNumber && <EditableField label="Bar Registration #" value={profileUser.barRegistrationNumber} readOnly={true} />}
                
                {isOwner && (
                  <div className="flex flex-wrap gap-2 mt-4 sm:col-span-2">
                    <button className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm w-full sm:w-auto" onClick={triggerFileUpload}>Upload New Picture</button>
                    <button className="px-4 py-2 rounded-md border text-sm border-[#1d4ed8] w-full sm:w-auto" onClick={() => setIsEditModalOpen(true)}>Edit Info</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{isOwner ? "Quick Action" : "Contact Information"}</h3>
            <div className="space-y-3">
              {isOwner ? (
                <>
                  <button onClick={() => setShowLogoutConfirm(true)} className="block w-full text-center border rounded-md py-2 mb-3 hover:bg-gray-700 text-sm bg-primary text-white">Logout</button>
                  <button className="block w-full text-center border hover:bg-gray-50 rounded-md py-2 mb-3 text-sm" onClick={() => router.push(`/auth/forgot-password?Step=reset&email=${email}`)}>Reset Password</button>
                  <Link href={`/profile/${username}`} className="block w-full text-center border border-[#C9A227] text-[#C9A227] hover:bg-amber-50 font-medium rounded-md py-2 mb-3 text-sm flex items-center justify-center gap-2 transition-colors">View Public Profile</Link>
                  <button className="block w-full text-center border border-blue-600 bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium rounded-md py-2 mb-3 text-sm flex items-center justify-center gap-2 transition-colors" onClick={() => setIsSavedPostsModalOpen(true)}>View Saved Posts</button>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">Email: {email.replace(/(.{3})(.*)(?=@)/, '$1***')}</div>
                  {phone && <div className="text-sm text-gray-600">Phone: {phone.replace(/.(?=.{4})/g, '*')}</div>}
                  <Link href={`/profile/${username}`} className="block w-full text-center border border-[#C9A227] text-[#C9A227] hover:bg-amber-50 font-medium rounded-md py-2 mb-3 text-sm flex items-center justify-center gap-2 transition-colors">View Public Profile</Link>
                  <button className="w-full bg-[#0A2342] text-white rounded-md py-3 text-sm font-semibold hover:bg-[#153a66] transition">Message User</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">Current Plan</h3>
              {subscriptionLoading ? (
                <Loader text="Loading subscription..." size="sm" />
              ) : subscription ? (
                <div className="grid gap-4 text-sm text-gray-700">
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${subscription.status === "active" ? "bg-emerald-400 text-emerald-900" : "bg-red-400 text-red-900"}`}>{subscription.status.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Plan Name</span>
                    <span className="font-medium">{subscription.planName || "Premium Plan"}</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">Valid Until</span>
                    <span>{formatDate(subscription.endDate)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No active subscription</p>
                </div>
              )}
              <div className="mt-6">
                <Link className="px-4 py-2 rounded-md bg-[#C9A227] text-white text-sm inline-block w-full sm:w-auto text-center hover:bg-[#b39022] transition" href="/subscription">
                  {subscription ? "Upgrade Plan" : "Subscribe Now"}
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-2">Language & Region</label>
                  <CustomSelect value={prefs.language} onChange={(v: string) => { setPrefs(p => ({ ...p, language: v })); setDirty(true); }} options={[{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी (Hindi)" }, { value: "zh", label: "中文 (Chinese)" }, { value: "mr", label: "मराठी (Marathi)" }]} />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-gray-700 block">Notifications</label>
                  <div className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                    <div className="text-sm text-gray-700">Do not disturb</div>
                    <ToggleSwitch checked={prefs.doNotDisturb} onChange={(val: boolean) => { setPrefs(p => ({ ...p, doNotDisturb: val })); setDirty(true); }} />
                  </div>
                  <div className="flex items-center justify-between bg-gray-100 rounded-full px-4 py-2">
                    <div className="text-sm text-gray-700">Case Status Alerts</div>
                    <ToggleSwitch checked={prefs.caseStatusAlerts} onChange={(val: boolean) => { setPrefs(p => ({ ...p, caseStatusAlerts: val })); setDirty(true); }} />
                  </div>
                </div>
              </div>

              {dirty && (
                <div className="flex justify-end gap-3 mt-4">
                  <button onClick={handleCancelPreferences} className="px-3 py-1 text-xs border rounded-md hover:bg-gray-50">Cancel</button>
                  <button onClick={handleSavePreferences} disabled={saving} className="px-3 py-1 text-xs bg-[#C9A227] text-white rounded-md">{saving ? "..." : "Save"}</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />}
      {isImageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Preview Image</h3>
              <button onClick={handleCloseImageModal} className="text-gray-500 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col items-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-gray-100 shadow-inner mb-6 relative">
                {previewUrl && <Image src={previewUrl} alt="Preview" fill className="object-cover" />}
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={triggerFileUpload} className="flex-1 px-4 py-2.5 border rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition text-sm">Change</button>
                <button onClick={handleConfirmImageUpload} className="flex-1 px-4 py-2.5 bg-[#C9A227] text-white rounded-lg font-medium hover:bg-[#b08d21] transition text-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <EditProfileModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} currentUser={profileUser} onSave={handleSaveProfileData} />
      )}
      {isSavedPostsModalOpen && <SavedPostsModal onClose={() => setIsSavedPostsModalOpen(false)} />}
    </div>
  );
}

function EditableField({ label, value }: { label: string; value: string | undefined | null; readOnly?: boolean }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="w-full border border-gray-100 rounded-lg px-3 py-2.5 text-sm bg-gray-50 text-gray-700 font-medium">
        {value || "Not provided"}
      </div>
    </div>
  );
}

function EditProfileModal({ isOpen, onClose, currentUser, onSave }: { isOpen: boolean; onClose: () => void; currentUser: UserData; onSave: (data: any) => Promise<void> }) {
  const [formData, setFormData] = useState<Partial<UserData>>(currentUser);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Edit Profile</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 transition"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input value={formData.city || ""} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input value={formData.state || ""} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
              <input value={formData.designation || ""} onChange={(e) => setFormData({ ...formData, designation: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience (Years)</label>
                <input type="number" value={formData.yearsOfExperience || ""} onChange={(e) => setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
              <input value={formData.specialization || ""} onChange={(e) => setFormData({ ...formData, specialization: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3 rounded-b-xl">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
          <button onClick={() => onSave(formData)} className="px-4 py-2 rounded-lg bg-[#0A2342] text-white text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-[#C9A227]" : "bg-gray-300"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm appearance-none bg-white">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
        <ChevronDown size={14} className="text-gray-400" />
      </div>
    </div>
  );
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative z-10 bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
        <h3 className="text-base font-semibold">Log out?</h3>
        <p className="text-sm text-gray-600 mt-1">Are you sure you want to log out?</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-sm rounded-md border">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm rounded-md bg-black text-white">Logout</button>
        </div>
      </div>
    </div>
  );
}
