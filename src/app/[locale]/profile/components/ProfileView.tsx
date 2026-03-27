"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import Loader from "@/components/ui/Loader";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { casesService } from "@/data/services/cases-service/casesService";
import { articleApi } from "@/data/services/article-service/article-service";
import { UserData } from "@/data/features/profile/profile.types";
import logo from "@/assets/logo.png"
import {
  X, Camera, ChevronDown, ArrowLeft,
  Briefcase, FileText, Settings, User,
  Heart, Calendar, MapPin, Award,
  MessageSquare, ExternalLink, Clock, BookOpen, Plus
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { getUserSubscription } from "@/data/features/subscription/subscriptionThunks";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import { isAdmin as checkIsAdmin, isAdvocate as checkIsAdvocate } from "@/utils/permissions";
import SavedPostsModal from "./SavedPostsModal";
import SavedPostsList from "./SavedPostsList";
import toast from "react-hot-toast";

interface ProfileViewProps {
  viewContext: "public" | "admin";
}

// Dummy data removed. Real data fetched from backend.

type TabType = "personal" | "saved" | "cases" | "articles" | "settings";

export default function ProfileView({ viewContext }: ProfileViewProps) {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<TabType>("personal");

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
  const isAdmin = checkIsAdmin(loggedInUser);
  const isAdvocate = checkIsAdvocate(loggedInUser);
  const profileIsAdvocate = checkIsAdvocate(profileUser);
  const profileIsAdmin = checkIsAdmin(profileUser);
  const showLegalSections = profileIsAdvocate || profileIsAdmin;
  const canSeeFullData = isOwner || (viewContext === "admin" && isAdmin);

  useDocTitle(profileUser ? `${profileUser.name}'s Profile` : "Profile");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await profileApi.fetchProfileByUsername(username);
        if (response.data.success) {
          const fetchedUser = response.data.data;

          try {
            // Fetch recent cases and articles concurrently
            const userId = fetchedUser._id || fetchedUser.id;
            const [casesRes, articlesRes] = await Promise.all([
              casesService.getAll({ page: 1, limit: 12, createdBy: userId }).catch(e => { console.error("Cases Error:", e); return { data: null }; }),
              articleApi.fetchArticles({ page: 1, limit: 12, authorId: userId }).catch(e => { console.error("Articles Error:", e); return { data: null }; })
            ]);

            const casesRespData = casesRes.data as any;
            const casesData = casesRespData?.data?.data ?? casesRespData?.data ?? [];
            const casesTotal = casesRespData?.data?.total ?? casesRespData?.total ?? 0;

            const articlesRespData = articlesRes.data as any;
            const articlesData = articlesRespData?.data?.data ?? articlesRespData?.data ?? [];
            const articlesTotal = articlesRespData?.meta?.total_items ?? articlesRespData?.meta?.totalItems ?? articlesRespData?.data?.meta?.totalItems ?? articlesRespData?.data?.total ?? articlesRespData?.total ?? 0;

            fetchedUser.cases = Array.isArray(casesData) ? casesData : [];
            fetchedUser.totalCases = casesTotal;

            fetchedUser.articles = Array.isArray(articlesData) ? articlesData : [];
            fetchedUser.totalArticles = articlesTotal;
          } catch (e) {
            console.error("Failed to load extra profile data", e);
          }

          setProfileUser(fetchedUser);
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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && (isOwner || (viewContext === "admin" && isAdmin))) {
      dispatch(getUserSubscription());
    }
  }, [dispatch, isOwner, viewContext, isAdmin]);

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
      <div className="min-h-screen flex items-center justify-center bg-[#fdfdfd]">
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
          <button onClick={() => router.push(viewContext === "admin" ? "/admin" : "/")} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            {viewContext === "admin" ? "Go to Dashboard" : "Go Home"}
          </button>
        </div>
      </div>
    );
  }

  const name = profileUser.name || "";
  const email = profileUser.email || "";
  const avatar = profileUser.profilePicture || null;

  const getDisplayRoles = () => {
    if (!profileUser?.roles || profileUser.roles.length === 0) return "User";
    const roleNames = profileUser.roles.map(r => r.name.toLowerCase());

    const categories: string[] = [];
    if (roleNames.some(r => ["admin", "superadmin", "creator", "editor"].includes(r))) {
      categories.push("Admin");
    }

    const legalRolesMap: Record<string, string> = {
      "advocate": "Advocate",
      "lawyer": "Lawyer",
      "legal_advisor": "Legal Advisor",
      "law_student": "Law Student"
    };

    let legalRoleLabel = "";
    for (const r of roleNames) {
      if (legalRolesMap[r]) {
        legalRoleLabel = legalRolesMap[r];
        break;
      }
    }

    if (legalRoleLabel) {
      categories.push(legalRoleLabel);
    }

    if (categories.length === 0) return "User";
    return categories.join(" + ");
  };

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
    <div className="min-h-screen bg-[#fdfdfd] font-sans">
      {/* 1. HERO HEADER AREA */}
      <section className="relative pt-12 pb-16 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center">
          {/* Back Button */}
          {!isOwner && (
            <button
              onClick={() => router.back()}
              className="absolute left-4 top-4 sm:left-8 sm:top-8 flex items-center gap-2 text-gray-400 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft size={20} />
              <span className="text-sm font-medium">Back</span>
            </button>
          )}

          {/* Profile Picture with Gold Border */}
          <div className="relative mb-8 pt-8">
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-2xl overflow-hidden border-[6px] border-[#C9A227]/20 shadow-xl relative group">
              <div className="absolute inset-0 border-[2px] border-[#C9A227] rounded-2xl z-10 pointer-events-none" />
              {avatar ? (
                <Image src={avatar} alt="Avatar" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-5xl text-gray-300 ">{name ? name[0].toUpperCase() : "U"}</span>
                </div>
              )}
              {isOwner && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white cursor-pointer z-20" onClick={triggerFileUpload}>
                  <Camera size={24} />
                </div>
              )}
            </div>
            {/* Status Badge */}
            {/* <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#C9A227] text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-lg z-30 flex items-center gap-1.5">
              <Award size={12} className="shrink-0" />
              BOARD CERTIFIED
            </div> */}
          </div>

          {/* User Details */}
          <h1 className="text-4xl sm:text-5xl  text-[#0A2342] mb-3 tracking-tight">{name}</h1>
          <p className="text-sm sm:text-base font-medium text-[#C9A227] tracking-[0.2em] uppercase mb-8">
            {getDisplayRoles()}
            {profileIsAdvocate && (
              <>
                {profileUser.designation && !getDisplayRoles().toLowerCase().includes(profileUser.designation.toLowerCase()) && (
                  <> &bull; {profileUser.designation}</>
                )}
                {!profileUser.designation && (
                  <> &bull; LEGAL COUNSEL</>
                )}
                {" "} &bull; {profileUser.specialization && Array.isArray(profileUser.specialization) && profileUser.specialization.length > 0 ? profileUser.specialization.join(", ") : (typeof profileUser.specialization === 'string' ? profileUser.specialization : "JURISPRUDENCE")}
              </>
            )}
          </p>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {profileIsAdvocate && profileUser.barRegistrationNumber && (
              <div className="flex items-center gap-2 bg-[#0A2342] text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow-md">
                <FileText size={14} className="text-[#C9A227]" />
                Bar Registration #{profileUser.barRegistrationNumber}
              </div>
            )}
            {profileIsAdvocate && profileUser.yearsOfExperience !== undefined && (
              <div className="flex items-center gap-2 bg-[#0A2342] text-white px-4 py-2.5 rounded-md text-xs font-semibold shadow-md">
                <Clock size={14} className="text-[#C9A227]" />
                {profileUser.yearsOfExperience}+ Years of Experience
              </div>
            )}
          </div>

          {/* Bio/Quote */}
          {profileUser.bio ? (
            <blockquote className="max-w-2xl text-lg  text-gray-500  mb-10 leading-relaxed italic">
              "{profileUser.bio}"
            </blockquote>
          ) : profileIsAdvocate ? (
            <blockquote className="max-w-2xl text-lg  text-gray-500  mb-10 leading-relaxed italic">
              "Advocacy is not merely the interpretation of statutes, but the guardianship of fundamental liberties. Every case is a testament to the pursuit of absolute justice."
            </blockquote>
          ) : null}
        </div>
      </section>

      {/* 2. TAB NAVIGATION */}
      <section className="sticky top-0 z-10 bg-white border-y border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
          <div className="flex items-center justify-center whitespace-nowrap py-4 gap-2 sm:gap-8 min-w-max">
            <TabButton active={activeTab === "personal"} onClick={() => setActiveTab("personal")} label="Personal Info" icon={<User size={18} />} />
            {isOwner && <TabButton active={activeTab === "saved"} onClick={() => setActiveTab("saved")} label="Saved Content" icon={<Heart size={18} />} />}
            {showLegalSections && <TabButton active={activeTab === "cases"} onClick={() => setActiveTab("cases")} label="Legal Portfolio" icon={<Briefcase size={18} />} />}
            {showLegalSections && <TabButton active={activeTab === "articles"} onClick={() => setActiveTab("articles")} label="Articles" icon={<FileText size={18} />} />}
            {isOwner && <TabButton active={activeTab === "settings"} onClick={() => setActiveTab("settings")} label="Settings" icon={<Settings size={18} />} />}
          </div>
        </div>
      </section>

      {/* 3. MODULAR CONTENT AREA */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        {/* PERSONAL INFO TAB */}
        {activeTab === "personal" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl  text-[#0A2342] mb-6">Biographical details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <DataField label="Full Name" value={name} />
                    <DataField label="Email Address" value={canSeeFullData ? email : email.replace(/(.{3})(.*)(?=@)/, '$1***')} />
                    {profileUser.phone && <DataField label="Contact Phone" value={canSeeFullData ? profileUser.phone : profileUser.phone.replace(/.(?=.{4})/g, '*')} />}
                    {profileUser.dob && <DataField label="Date of Birth" value={formatDate(profileUser.dob)} />}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl  text-[#0A2342] mb-6">Geographic Reach</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
                    <DataField label={profileIsAdvocate ? "Primary City" : "City"} value={profileUser.city || "Not Specified"} />
                    <DataField label={profileIsAdvocate ? "Jurisdiction State" : "State"} value={profileUser.state || "Not Specified"} />
                  </div>
                  {isOwner && !profileIsAdvocate && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="mt-6 w-full py-4 border-2 border-[#1d4ed8] text-[#1d4ed8] font-bold rounded-xl hover:bg-white transition-all text-sm tracking-widest uppercase"
                    >
                      Update Profile Info
                    </button>
                  )}
                </div>
              </div>

              {profileIsAdvocate && (
                <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl  text-[#0A2342] mb-4">Professional Overview</h3>
                    <div className="space-y-6 mb-8">
                      <DataField label="Official Designation" value={profileUser.designation} />
                      <DataField label="Core Specialization" value={profileUser.specialization} />
                      <DataField label="Cumulative Experience" value={profileUser.yearsOfExperience ? `${profileUser.yearsOfExperience} Years` : null} />
                    </div>
                  </div>
                  {isOwner && (
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="w-full py-4 border-2 border-[#1d4ed8] text-[#1d4ed8] font-bold rounded-xl hover:bg-white transition-all text-sm tracking-widest uppercase"
                    >
                      Edit Professional Profile
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* SAVED CONTENT TAB */}
        {activeTab === "saved" && isOwner && (
          <SavedPostsList />
        )}

        {/* CASES TAB */}
        {activeTab === "cases" && showLegalSections && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-12">
              <h4 className="text-[#C9A227] text-xs font-bold tracking-widest uppercase mb-2">Legal Portfolio</h4>
              <div className="flex items-end justify-between">
                <h2 className="text-4xl  text-[#0A2342]">Significant Jurisprudence & Case Resolutions</h2>
                {profileUser.totalCases !== undefined && (
                  <div className="text-right">
                    <div className="text-2xl font-serif text-[#C9A227]">{profileUser.totalCases}</div>
                    <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Total Matters</div>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profileUser.cases && profileUser.cases.length > 0 ? (
                profileUser.cases.map(item => (
                  <CaseCard
                    key={item.id}
                    id={item.id}
                    category={item.caseType?.toUpperCase() || "MATTER"}
                    title={item.title}
                    court={`${item.court} • No: ${item.caseNumber}`}
                    icon={<Briefcase size={16} />}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <Briefcase size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 text-sm italic">No litigation records found in the current portfolio.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ARTICLES TAB */}
        {activeTab === "articles" && showLegalSections && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-4xl  text-[#0A2342]">Editorial Insights & Legal Analysis</h2>
              {profileUser.totalArticles !== undefined && (
                <div className="text-right">
                  <div className="text-2xl font-serif text-[#C9A227]">{profileUser.totalArticles}</div>
                  <div className="text-[10px] font-bold tracking-widest uppercase text-gray-400">Publications</div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {profileUser.articles && profileUser.articles.length > 0 ? (
                profileUser.articles.map(item => (
                  <ArticleCard
                    key={item.id}
                    slug={item.slug}
                    category={item.category?.name?.toUpperCase() || "ARTICLE"}
                    readTime={`${item.readTime || 5} min read`}
                    title={item.title}
                    image={item.thumbnail || logo}
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-100 rounded-3xl">
                  <FileText size={40} className="mx-auto text-gray-200 mb-4" />
                  <p className="text-gray-400 text-sm italic">No editorial insights have been published yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && isOwner && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SettingsCard
                title="Notifications"
                icon={<MessageSquare size={20} />}
                description="Manage case alerts and communication preferences"
              >
                <div className="space-y-4 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Do not disturb</span>
                    <ToggleSwitch checked={prefs.doNotDisturb} onChange={(val) => { setPrefs(p => ({ ...p, doNotDisturb: val })); setDirty(true); }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Case Status Alerts</span>
                    <ToggleSwitch checked={prefs.caseStatusAlerts} onChange={(val) => { setPrefs(p => ({ ...p, caseStatusAlerts: val })); setDirty(true); }} />
                  </div>
                </div>
              </SettingsCard>

              <SettingsCard
                title="Languages"
                icon={<BookOpen size={20} />}
                description="Choose your preferred interface language"
              >
                <div className="pt-4">
                  <CustomSelect
                    value={prefs.language}
                    onChange={(v) => { setPrefs(p => ({ ...p, language: v })); setDirty(true); }}
                    options={[{ value: "en", label: "English" }, { value: "hi", label: "हिन्दी (Hindi)" }, { value: "mr", label: "मराठी (Marathi)" }]}
                  />
                </div>
              </SettingsCard>

              <SettingsCard
                title="Subscription Plans"
                icon={<Award size={20} />}
                description="Manage your current membership and upgrades"
                badge={subscription ? (
                  <div className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${subscription.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                    {subscription.status}
                  </div>
                ) : null}
              >
                <div className="pt-4">
                  {subscriptionLoading ? (
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <div className="w-3 h-3 border-2 border-gray-200 border-t-[#C9A227] rounded-full animate-spin" />
                      Loading details...
                    </div>
                  ) : subscription ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Plan name :</div>
                        <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest ${subscription.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {subscription.planName || "PREMIUM PLAN"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Starting date:</div>
                        <div className="text-sm text-[#0A2342] font-semibold">{formatDate(subscription.startDate)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Ending date:</div>
                        <div className="text-sm text-[#0A2342] font-semibold">{formatDate(subscription.endDate)}</div>
                      </div>
                      <div className="flex justify-end pt-2">
                        <Link href="/subscription" className="text-xs font-bold text-[#C9A227] !no-underline bg-[#C9A227]/10 px-4 py-2 rounded-lg hover:bg-[#C9A227]/20 transition-all">Upgrade</Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-bold px-3 py-1 bg-gray-100 text-gray-500 rounded-full uppercase tracking-widest">
                        FREE TIER — NO ACTIVE PLAN
                      </div>
                      <Link href="/subscription" className="text-xs font-bold text-[#C9A227] !no-underline">UPGRADE</Link>
                    </div>
                  )}
                </div>
              </SettingsCard>

              <SettingsCard
                title="Security & Auth"
                icon={<Settings size={20} />}
                description="Reset password or sign out of your account"
              >
                <div className="space-y-3 pt-4">
                  <button
                    onClick={() => router.push(`/auth/forgot-password?Step=reset&email=${email}`)}
                    className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 group"
                  >
                    Reset Password
                    <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="w-full flex items-center justify-between text-sm text-red-500 font-medium hover:text-red-700 group"
                  >
                    Sign Out
                    <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </SettingsCard>
            </div>

            {dirty && (
              <div className="mt-12 flex justify-center gap-4">
                <button onClick={handleCancelPreferences} className="px-8 py-3 rounded-full border border-gray-200 text-sm font-bold tracking-widest uppercase hover:bg-white transition-all">Revert</button>
                <button onClick={handleSavePreferences} disabled={saving} className="px-8 py-3 rounded-full bg-[#C9A227] text-white text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-[#C9A227]/20 transition-all">{saving ? "Applying..." : "Save Preferences"}</button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 4. FOOTER CTA SECTION */}
      {/* <section className="bg-[#0A2342] py-24 mt-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl sm:text-5xl  text-white mb-6 tracking-tight">Experience Matters. Excellence Prevails.</h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed   max-w-2xl mx-auto">
            Retain the counsel of one of the most distinguished legal minds in the sector for your corporate or private legal requirements.
          </p>
          <button className="bg-[#C9A227] text-[#0A2342] px-12 py-5 rounded-md text-sm font-bold tracking-[0.2em] uppercase hover:bg-[#b08d21] transition-all shadow-2xl flex items-center gap-3 mx-auto">
            Secure Legal Consultation
            <Calendar size={18} />
          </button>
        </div>
      </section> */}

      {/* MODALS */}
      {showLogoutConfirm && <LogoutModal onCancel={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />}
      {isImageModalOpen && (
        <ImagePreviewModal
          url={previewUrl}
          onClose={handleCloseImageModal}
          onChange={triggerFileUpload}
          onSave={handleConfirmImageUpload}
        />
      )}
      {isEditModalOpen && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          currentUser={profileUser}
          onSave={handleSaveProfileData}
          isAdvocate={isAdvocate}
        />
      )}
      {/* Redundant modal removed as per user request for inline view */}

      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
}

// SUB-COMPONENTS

function TabButton({ active, onClick, label, icon }: { active: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${active
        ? "bg-[#0A2342] text-[#C9A227] shadow-lg shadow-[#0A2342]/10"
        : "text-gray-400 hover:text-gray-900 hover:bg-gray-50"
        }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function DataField({ label, value }: { label: string; value: string | string[] | undefined | null }) {
  const displayValue = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</label>
      <div className="text-base text-[#0A2342] font-medium border-b border-gray-100 pb-2">
        {displayValue || <span className="text-gray-300 ">Not Disclosed</span>}
      </div>
    </div>
  );
}

function CaseCard({ id, category, title, court, icon }: { id: string; category: string; title: string; court: string; icon: React.ReactNode }) {
  return (
    <Link href={`/cases/${id}`}>
      <div className="bg-white border border-gray-100 p-6 rounded-xl hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer h-full">
        <div className="flex justify-between items-start mb-6">
          <span className="text-[9px] font-bold tracking-widest text-[#C9A227] uppercase">{category}</span>
          <div className="text-gray-300 group-hover:text-[#0A2342] transition-colors">{icon}</div>
        </div>
        <h3 className="text-lg  text-[#0A2342] mb-3 leading-tight font-serif group-hover:text-[#C9A227] transition-colors">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed font-sans">{court}</p>
      </div>
    </Link>
  );
}

function ArticleCard({ slug, category, readTime, title, image }: { slug: string; category: string; readTime: string; title: string; image: string }) {
  return (
    <Link href={`/news/${slug}`} className="group">
      <div className="cursor-pointer">
        <div className="aspect-[4/3] rounded-2xl overflow-hidden mb-4 relative shadow-md">
          <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
        </div>
        <div className="flex items-center gap-3 mb-2.5">
          <span className="text-[9px] font-bold tracking-widest text-[#C9A227] uppercase">{category}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span className="text-[9px] font-bold tracking-widest text-gray-400 uppercase">{readTime}</span>
        </div>
        <h3 className="text-sm  text-[#0A2342] leading-snug group-hover:text-[#C9A227] transition-colors font-serif">{title}</h3>
      </div>
    </Link>
  );
}

function SettingsCard({ title, icon, description, children, badge }: { title: string; icon: React.ReactNode; description: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <div className="bg-white p-8 rounded-2xl border-2 border-gray-50 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          {badge}
        </div>
      )}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-[#0A2342]">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#0A2342]">{title}</h4>
          <p className="text-[10px] text-gray-400">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function ImagePreviewModal({ url, onClose, onChange, onSave }: { url: string | null; onClose: () => void; onChange: () => void; onSave: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2342]/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100">
          <h3 className="text-lg  text-[#0A2342]">Portrait Preview</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 flex flex-col items-center">
          <div className="w-56 h-56 rounded-3xl overflow-hidden border-[6px] border-gray-50 shadow-inner mb-8 relative">
            {url && <Image src={url} alt="Preview" fill className="object-cover" />}
          </div>
          <div className="flex gap-4 w-full">
            <button onClick={onChange} className="flex-1 px-4 py-3.5 border border-gray-200 rounded-xl text-gray-600 font-bold text-xs tracking-widest uppercase hover:bg-gray-50 transition-all">Change</button>
            <button onClick={onSave} className="flex-1 px-4 py-3.5 bg-[#C9A227] text-white rounded-xl font-bold text-xs tracking-widest uppercase shadow-lg hover:shadow-[#C9A227]/20 transition-all">Set Portrait</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditProfileModal({ isOpen, onClose, currentUser, onSave, isAdvocate }: { isOpen: boolean; onClose: () => void; currentUser: UserData; onSave: (data: any) => Promise<void>; isAdvocate: boolean }) {
  const [formData, setFormData] = useState<Partial<UserData>>(currentUser);
  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast.error("Full Name is required");
      return;
    }
    if (isAdvocate) {
      if (formData.yearsOfExperience !== undefined && (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0 || Number(formData.yearsOfExperience) > 100)) {
        toast.error("Please enter a valid number for Experience (0-100)");
        return;
      }
      if (!formData.designation) {
        toast.error("Professional Designation is required");
        return;
      }
      if (!formData.specialization || (Array.isArray(formData.specialization) && formData.specialization.length === 0)) {
        toast.error("At least one Core Specialization is required");
        return;
      }
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A2342]/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full animate-in slide-in-from-bottom-8 duration-500 overflow-hidden">
        <div className="flex justify-between items-center px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-xl  text-[#0A2342]">Administrative Profile Update</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InputField label="Full Legal Name" value={formData.name} onChange={(val) => setFormData({ ...formData, name: val })} />
            <InputField label="Primary Contact Number" value={formData.phone} onChange={(val) => setFormData({ ...formData, phone: val })} />
            <InputField label="Date of Birth" type="date" value={formData.dob} onChange={(val) => setFormData({ ...formData, dob: val })} />
            <InputField label={checkIsAdvocate(currentUser) ? "Resident City" : "City"} value={formData.city} onChange={(val) => setFormData({ ...formData, city: val })} />
            <InputField label={checkIsAdvocate(currentUser) ? "Jurisdiction State" : "State"} value={formData.state} onChange={(val) => setFormData({ ...formData, state: val })} />
            <div className="md:col-span-2">
              <TextAreaField label="Professional Biography (Bio)" value={formData.bio} onChange={(val) => setFormData({ ...formData, bio: val })} />
            </div>

            {isAdvocate && (
              <>
                <InputField label="Professional Designation" value={formData.designation} onChange={(val) => setFormData({ ...formData, designation: val })} />
                <InputField label="Experience (Years)" type="number" value={formData.yearsOfExperience} onChange={(val) => setFormData({ ...formData, yearsOfExperience: val ? Number(val) : undefined })} />
                <InputField label="Bar Registration Number" value={formData.barRegistrationNumber} onChange={(val) => setFormData({ ...formData, barRegistrationNumber: val })} />
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Core Specialization</label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50/30 border-2 border-gray-50 rounded-xl">
                    {Array.isArray(formData.specialization) ? formData.specialization?.map((spec, idx) => (
                      <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-[#C9A227] border border-gray-100 shadow-sm">
                        {spec}
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = [...(formData.specialization || [])];
                            newSpecs.splice(idx, 1);
                            setFormData({ ...formData, specialization: newSpecs });
                          }}
                          className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    )) : (typeof formData.specialization === 'string' && formData.specialization ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white text-[#C9A227] border border-gray-100 shadow-sm">
                        {formData.specialization}
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, specialization: [] })}
                          className="ml-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ) : null)}
                    <input
                      type="text"
                      placeholder="Add specialization and press Enter..."
                      className="flex-1 bg-transparent border-none outline-none text-xs font-medium min-w-[120px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value.trim();
                          if (val && (!Array.isArray(formData.specialization) || !formData.specialization.includes(val))) {
                            const currentSpecs = Array.isArray(formData.specialization) ? formData.specialization : (formData.specialization ? [formData.specialization] : []);
                            setFormData({
                              ...formData,
                              specialization: [...currentSpecs, val]
                            });
                            (e.target as HTMLInputElement).value = "";
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-bold tracking-widest uppercase hover:bg-white transition-all">Cancel</button>
          <button onClick={handleSave} className="px-8 py-2.5 rounded-lg bg-[#0A2342] text-white text-sm font-bold tracking-widest uppercase shadow-lg hover:bg-[#153a66] transition-all">Commit Changes</button>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = "text" }: { label: string; value: any; onChange: (val: string) => void; type?: string }) {
  return (
    <div className="space-y-1.5 focus-within:text-[#C9A227] transition-colors">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3 border-2 border-gray-50 bg-gray-50/30 rounded-xl text-sm text-[#0A2342] font-medium focus:border-[#C9A227] focus:bg-white outline-none transition-all placeholder:text-gray-300"
        placeholder={`Enter ${label.toLowerCase()}...`}
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange }: { label: string; value: any; onChange: (val: string) => void }) {
  return (
    <div className="space-y-1.5 focus-within:text-[#C9A227] transition-colors">
      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <textarea
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-5 py-3 border-2 border-gray-50 bg-gray-50/30 rounded-xl text-sm text-[#0A2342] font-medium focus:border-[#C9A227] focus:bg-white outline-none transition-all placeholder:text-gray-300 min-h-[120px] resize-none"
        placeholder={`Write your ${label.toLowerCase()} here...`}
      />
    </div>
  );
}

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors duration-300 ${checked ? "bg-[#C9A227]" : "bg-gray-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-300 ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

function CustomSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <div className="relative group">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full border-2 border-gray-50 bg-gray-50/50 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 appearance-none focus:border-[#C9A227] focus:bg-white outline-none transition-all">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400 group-focus-within:text-[#C9A227] transition-colors">
        <ChevronDown size={14} />
      </div>
    </div>
  );
}

function LogoutModal({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0A2342]/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-300 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <X size={32} />
        </div>
        <h3 className="text-xl  text-[#0A2342] mb-2 tracking-tight">Security Sign-out</h3>
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">Are you certain you wish to conclude your current session? You will need to re-authenticate to regain access.</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 px-4 py-3 text-xs font-bold tracking-widest uppercase border border-gray-100 rounded-xl hover:bg-gray-50 transition-all">Cancel</button>
          <button onClick={onConfirm} className="flex-1 px-4 py-3 text-xs font-bold tracking-widest uppercase bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all">Sign Out</button>
        </div>
      </div>
    </div>
  );
}
