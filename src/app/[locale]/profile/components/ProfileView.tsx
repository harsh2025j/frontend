"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter, usePathname, Link } from "@/i18n/routing";
import { useLocale } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Camera, ChevronDown, ArrowLeft,
  Briefcase, FileText, Settings, User,
  Heart, Calendar, MapPin, Award,
  MessageSquare, ExternalLink, Clock, BookOpen, Plus,
  Shield, Globe, Bell, LogOut, ChevronRight, Check, ShieldCheck, Key, Languages, Phone,
  Gavel, Loader2,
  BookmarkCheck, Lock
} from "lucide-react";

import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { profileApi } from "@/data/services/profile-service/profile-service";
import { casesService } from "@/data/services/cases-service/casesService";
import { articleApi } from "@/data/services/article-service/article-service";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import { UserData } from "@/data/features/profile/profile.types";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { getUserSubscription } from "@/data/features/subscription/subscriptionThunks";
import { useDocTitle } from "@/hooks/useDocTitle";
import { formatDate } from "@/utils/dateUtils";
import { isAdmin as checkIsAdmin, isAdvocate as checkIsAdvocate } from "@/utils/permissions";

import logo from "@/assets/logo.png";
import SavedPostsList from "./SavedPostsList";
import AppointmentsList from "./AppointmentsList";
import Loader from "@/components/ui/Loader";
import CourtSearchableDropdown from "@/components/ui/CourtSearchableDropdown";
import ImageCropperModal from "@/components/ui/ImageCropperModal";
import ConsultancyFormModal from "./ConsultancyFormModal";

interface ProfileViewProps {
  viewContext: "public" | "admin";
}

type TabType = "personal" | "saved" | "cases" | "articles" | "settings" | "appointments";

// --- REUSABLE BENTO COMPONENTS ---

const BentoStatCard = ({ label, value, icon: Icon, description, delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5 }}
    className="relative overflow-hidden group bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-sm"
  >
    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
      <Icon size={72} strokeWidth={1} />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-[#0A2342]/5 text-[#C9A227]">
          <Icon size={18} />
        </div>
        <span className="text-[9px] font-bold tracking-[0.2em] text-[#C9A227] uppercase">{label}</span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <h3 className="text-4xl font-serif text-[#0A2342] leading-none">{value}</h3>
      </div>
      <p className="text-[10px] text-gray-400 font-medium leading-relaxed max-w-[180px]">
        {description}
      </p>
    </div>
  </motion.div>
);

const BentoCard = ({ title, subtitle, children, className = "", delay = 0 }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay }}
    className={`group relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-white/20 shadow-sm ${className}`}
  >
    <div className="flex flex-col h-full relative z-10">
      <div className="mb-6">
        {subtitle && (
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#C9A227] uppercase mb-1.5 block leading-none">
            {subtitle}
          </span>
        )}
        <h4 className="text-2xl font-serif text-[#0A2342] tracking-tight">{title}</h4>
      </div>
      <div className="flex-grow">{children}</div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
  </motion.div>
);

// --- MAIN PROFILE VIEW ---

export default function ProfileView({ viewContext }: ProfileViewProps) {
  const params = useParams();
  const username = params.username as string;
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<TabType>("personal");

  // Authentication & Global State
  const { user: loggedInUser, loading: loggedInLoading, updateProfile: handleUpdateProfile } = useProfileActions();
  const subscription = useAppSelector((state) => state.subscription.currentSubscription);

  // Profile Specific State
  const [profileUser, setProfileUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- ROLE BASED LOGIC ---
  const isOwner = loggedInUser?.username === username;
  const isAdmin = checkIsAdmin(loggedInUser);
  const profileIsAdvocate = checkIsAdvocate(profileUser);
  const profileIsAdmin = checkIsAdmin(profileUser);

  // Professional Check: Strictly legal professionals (excludes pure admins)
  const isLegalProfessional = profileIsAdvocate || (profileUser?.roles?.some(r =>
    ['lawyer', 'law_student', 'legal_professional', 'advocate'].includes(r.slug?.toLowerCase() || r.name.toLowerCase())
  ));

  const isProfessional = isLegalProfessional;
  const showLegalSections = isProfessional || profileIsAdmin;
  const canSeeFullData = isOwner || (viewContext === "admin" && isAdmin);

  // Consolidated Role Label Logic
  const getRoleLabel = () => {
    if (!profileUser?.roles || profileUser.roles.length === 0) return "User";

    const roleNames = profileUser.roles.map(r => r.name.toLowerCase());

    const hasLegal = roleNames.some(r => ['lawyer', 'law_student', 'legal_professional', 'advocate'].includes(r));
    const hasAdmin = roleNames.includes('admin');

    if (hasLegal) {
      const legalNames = profileUser.roles
        .filter(r => ['lawyer', 'law_student', 'legal_professional', 'advocate'].includes(r.name.toLowerCase()))
        .map(r => r.name);
      if (hasAdmin) return `${legalNames[0]} | Admin`;
      return legalNames[0];
    }

    if (hasAdmin) return "Admin";
    return "User";
  };

  useDocTitle(profileUser ? `${profileUser.name}'s Profile` : "Profile");

  // Fetch Logic
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(username);
        const response = isMongoId
          ? await profileApi.fetchPublicProfile(username)
          : await profileApi.fetchProfileByUsername(username);

        if (response.data.success) {
          const fetchedUser = response.data.data as any;
          try {
            const userId = fetchedUser._id || fetchedUser.id;
            const isProfessionalUser = fetchedUser?.roles?.some((r: any) =>
              ['lawyer', 'law_student', 'legal_professional', 'advocate'].includes(r.slug?.toLowerCase() || r.name.toLowerCase())
            );

            const [casesRes, articlesRes] = await Promise.all([
              casesService.getAll({
                page: 1,
                limit: 12,
                createdBy: isProfessionalUser ? userId : undefined,
                clientEmail: !isProfessionalUser ? fetchedUser.email : undefined
              }).catch(() => ({ data: null })),
              articleApi.fetchArticles({ page: 1, limit: 12, authorId: userId }).catch(() => ({ data: null }))
            ]);

            const casesData = (casesRes?.data as any);
            fetchedUser.cases = casesData?.data?.data ?? casesData?.data ?? [];
            fetchedUser.totalCases = casesData?.data?.total_items ?? casesData?.total ?? fetchedUser.cases.length;

            const articlesData = (articlesRes?.data as any);
            fetchedUser.articles = articlesData?.data ?? [];
            fetchedUser.totalArticles = articlesData?.total ?? fetchedUser.articles.length;
          } catch (e) { console.error("Mapping error:", e); }
          setProfileUser(fetchedUser);
          setFormData(fetchedUser);
        } else { setError(response.data.message || "User not found."); }
      } catch (err) { setError("Connectivity lost."); } finally { setLoading(false); }
    }
    if (username) fetchProfile();
  }, [username]);

  useEffect(() => {
    if (isOwner || (viewContext === "admin" && isAdmin)) {
      dispatch(getUserSubscription());
    }
  }, [dispatch, isOwner, viewContext, isAdmin]);

  // Modals & Forms State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openEditModal = () => {
    // Convert specialization array to a comma-separated string for editing
    const editData = { ...profileUser };
    if (Array.isArray(editData.specialization)) {
      editData.specialization = editData.specialization.join(", ") as any;
    }
    setFormData(editData);
    setIsModalOpen(true);
  };
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prefs, setPrefs] = useState({ language: currentLocale, doNotDisturb: false, caseStatusAlerts: true });
  const [unreadAppointments, setUnreadAppointments] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const fetchUnreadAppointments = async () => {
    const userId = profileUser?.id || profileUser?._id;
    if (isOwner && isProfessional && userId) {
      try {
        const response = await appointmentsService.getUnreadCount(userId);
        const count = response.data?.data ?? response.data;
        setUnreadAppointments(typeof count === 'number' ? count : 0);
      } catch (error) {
        console.error("Failed to fetch unread appointments", error);
      }
    }
  };

  useEffect(() => {
    if (profileUser) {
      fetchUnreadAppointments();
    }
  }, [profileUser, isOwner, isProfessional]);

  const handleLanguageChange = (nextLocale: string) => {
    router.push(pathname, { locale: nextLocale as any });
  };

  const handleUpdate = async () => {
    setSaving(true);
    // Artificial delay to ensure loader is visible
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      // Final sanitization: convert specialization string back to a clean array
      let finalSpecialization = formData.specialization;
      if (typeof finalSpecialization === "string") {
        finalSpecialization = finalSpecialization.split(",").map((s: string) => s.trim()).filter((s: string) => s !== "");
      }

      const sanitizedData = {
        ...formData,
        specialization: finalSpecialization,
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : 0
      };
      const res = await handleUpdateProfile(sanitizedData);
      if (res.success) {
        setProfileUser({ ...profileUser, ...sanitizedData } as any);
        setIsModalOpen(false);
      }
    } finally { setSaving(false); }
  };

  const handleImageUpload = async (croppedFile: File) => {
    setSaving(true);
    try {
      const response = await profileApi.updateProfile({ avatar: croppedFile });
      if (response.data.success) {
        setProfileUser({ ...profileUser!, profilePicture: response.data.data.profilePicture });
        setImageToCrop(null);
      }
    } finally { setSaving(false); }
  };

  const handleLogout = () => { localStorage.clear(); window.location.href = "/"; };

  if (loading) return <BentoSkeleton />;
  if (error || !profileUser) return <BentoErrorView error={error} context={viewContext} router={router} />;

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 text-[#0A2342]">
      <div className="absolute top-0 inset-x-0 h-[60vh] bg-gradient-to-b from-[#0A2342]/10 to-transparent pointer-events-none" />

      {/* 0. FLOATING BACK BUTTON - Only show if not viewing own profile */}
      {!isOwner && (
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="absolute top-22 md:top-38 left-4 md:left-14 z-[45] flex items-center gap-3 px-5 py-3 bg-white/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl hover:shadow-[#C9A227]/10 group transition-all ring-1 ring-black/5 cursor-pointer"
        >
          <ArrowLeft size={16} className="text-[#0A2342] group-hover:-translate-x-1 transition-transform" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0A2342] hidden sm:inline">Return</span>
        </motion.button>
      )}

      {/* 1. HERO */}
      <section className="relative pt-24 pb-24 overflow-hidden text-center z-10">
        <div className="max-w-6xl mx-auto px-4 relative">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative inline-block mb-12">
            <div className="absolute inset-[-10px] bg-gradient-to-tr from-[#C9A227] via-[#0A2342]/10 to-[#C9A227] opacity-30 rounded-[50px] animate-[spin_12s_linear_infinite]" />
            <div className="w-56 h-56 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative group cursor-pointer" onClick={() => isOwner && fileInputRef.current?.click()}>
              {profileUser.profilePicture ? (
                <Image src={profileUser.profilePicture} alt="Avatar" fill className="object-cover  transition-transform duration-700" quality={100} sizes="500px" />
              ) : (
                <div className="w-full h-full bg-zinc-50 flex items-center justify-center text-6xl text-gray-300 font-serif">{profileUser.name?.[0].toUpperCase()}</div>
              )}
              {isOwner && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  {saving || loggedInLoading ? (
                    <Loader2 size={32} className="animate-spin" />
                  ) : (
                    <Camera size={32} strokeWidth={1} className="mb-2" />
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {saving || loggedInLoading ? "Uploading..." : "Update Portrait"}
                  </span>
                </div>
              )}
            </div>
            {profileIsAdvocate && (
              <motion.div initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1, transition: { delay: 0.6 } }} className="absolute -right-12 top-10 p-4 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                <ShieldCheck size={24} className="text-[#C9A227]" />
                <div className="absolute top-14 -right-2 bg-[#0A2342] text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-full">Verified</div>
              </motion.div>
            )}
          </motion.div>

          <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-6xl sm:text-8xl font-serif text-[#0A2342] mb-4">
            {profileUser.name}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-[#C9A227] tracking-[0.4em] uppercase mb-12">
            <span className="text-[#0A2342]">
              {getRoleLabel()} | </span>
            {Array.isArray(profileUser.specialization) && profileUser.specialization.length > 0
              ? profileUser.specialization.join(" • ")
              : (isProfessional ? "Jurisdiction Pending" : "Community Registry")}
          </motion.p>

          {/* Professional Narrative / Bio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto mt-2 text-[13px] md:text-sm text-gray-500 font-medium italic leading-relaxed px-6"
          >
            {profileUser.bio || "Professional narrative pending registry update."}
          </motion.div>

          {/* Consultancy Action */}
          {!isOwner && isProfessional && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-12"
            >
              <button
                onClick={() => {
                  if (loggedInUser) {
                    router.push(`/book-appointment?advocateId=${profileUser.id || profileUser._id}`);
                  } else {
                    setShowAuthModal(true);
                  }
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#0A2342] text-white rounded-2xl shadow-xl hover:shadow-[#C9A227]/20 transition-all hover:-translate-y-1 group"
              >
                {!loggedInUser ? (
                  <Lock size={18} className="text-[#C9A227]" />
                ) : (
                  <MessageSquare size={18} className="group-hover:rotate-12 transition-transform" />
                )}
                <span className="text-[11px] font-black uppercase tracking-widest">
                  Book Appointment
                </span>
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* 2. BENTO CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <aside className="lg:col-span-3 sticky top-20 md:top-24 z-20 -mx-4 sm:mx-0 px-4 sm:px-0">
            <div className="flex flex-row lg:flex-col gap-1 md:gap-2 p-1.5 bg-white/60 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg shadow-black/5 overflow-x-auto scrollbar-hide">
              {[
                { id: "personal", label: "Identity", icon: User, show: true },
                { id: "appointments", label: isProfessional ? "Appointments" : "My Bookings", icon: Calendar, show: isOwner, badge: unreadAppointments },
                { id: "saved", label: "Saved", icon: BookmarkCheck, show: isOwner },
                { id: "cases", label: "Cases", icon: Briefcase, show: showLegalSections },
                { id: "articles", label: "Articles", icon: FileText, show: showLegalSections },
                { id: "settings", label: "Account", icon: Settings, show: isOwner },
              ].filter(t => t.show).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`relative flex items-center gap-2 md:gap-4 px-4 md:px-6 py-2.5 md:py-4 rounded-full lg:rounded-2xl transition-all duration-500 whitespace-nowrap flex-shrink-0 group ${activeTab === tab.id ? "text-[#0A2342]" : "text-gray-400 hover:text-gray-600"
                    }`}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <div className={`relative z-10 p-1.5 rounded-xl transition-colors duration-500 ${activeTab === tab.id ? "bg-[#C9A227] text-white" : "bg-transparent group-hover:bg-gray-100"}`}>
                    <tab.icon size={14} className="md:w-4 md:h-4" />
                  </div>
                  <span className="relative z-10 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute top-2 right-2 md:top-3 md:right-3 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full shadow-lg border-2 border-white z-20">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </aside>

          <div className="lg:col-span-9 pb-20">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                {activeTab === "personal" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* STATS: Professionals only */}
                    {isProfessional && (
                      <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 mb-4">
                        <BentoStatCard label={profileIsAdvocate ? "Litigation" : "Contributions"} value={profileUser.totalCases || 0} icon={Briefcase} description="Resolution metrics." delay={0.1} />
                        <BentoStatCard label="Insights" value={profileUser.totalArticles || 0} icon={FileText} description="Published research." delay={0.2} />
                        <BentoStatCard label="Tenure" value={profileUser.yearsOfExperience || "Admin"} icon={Clock} description="Registry time." delay={0.3} />
                      </div>
                    )}

                    <BentoCard title="Identity & Access" subtitle="Personal" className="md:col-span-1">
                      <div className="space-y-6 mt-6">
                        <TonalField label="Full Legal Name" value={profileUser.name} />
                        <TonalField
                          label="Professional Title"
                          value={(profileUser.designation && profileUser.designation !== "null" && profileUser.designation !== "NULL")
                            ? profileUser.designation
                            : getRoleLabel()}
                          icon={Award}
                        />
                        <TonalField label="Mobile Contact" value={profileUser.phone || "Not Set"} icon={Phone} />
                        {/* Only show Expertise Network for professionals or if data exists */}
                        {(isProfessional || (Array.isArray(profileUser.specialization) && profileUser.specialization.length > 0)) && (
                          <div className="space-y-2">
                            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block mb-4">Expertise Network</span>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(profileUser.specialization) && profileUser.specialization.length > 0 ? (
                                profileUser.specialization.map((s: string) => (
                                  <span key={s} className="px-3 py-1.5 bg-[#C9A227]/10 text-[#C9A227] text-[8px] font-black uppercase rounded-xl border border-[#C9A227]/10 shadow-sm">
                                    {s}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs italic text-gray-400">Jurisdiction Pending</span>
                              )}
                            </div>
                          </div>
                        )}

                        <TonalField label="Location" value={profileUser.city && profileUser.state ? `${profileUser.city}, ${profileUser.state}` : (profileUser.state || profileUser.city || "Registry Pending")} icon={MapPin} />

                        {/* Private DOB - Owner Only */}
                        {isOwner && profileUser.dob && (
                          <div className="p-4 bg-[#C9A227]/5 border border-[#C9A227]/20 rounded-2xl">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Shield size={12} className="text-[#C9A227]" />
                                <span className="text-[10px] text-[#C9A227] uppercase font-black tracking-widest">DOB</span>
                              </div>
                              <span className="text-xs font-bold text-[#0A2342]">
                                {!isNaN(new Date(profileUser.dob).getTime())
                                  ? new Date(profileUser.dob).toLocaleDateString()
                                  : "Registry Pending"}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </BentoCard>

                    {isProfessional && (
                      <BentoCard title="Professional Reach" subtitle="Jurisdictions">
                        <div className="space-y-8 mt-6">
                          {/* {!profileIsAdvocate && <TonalField label="Associated Court" value={profileUser.court} icon={Gavel} />} */}
                          <TonalField label="Active Registry" value={`${profileUser.city ?? ''}, ${profileUser.state ?? ''}`} icon={MapPin} />
                          {profileIsAdvocate && <TonalField label="Bar Membership" value={`Ref #${profileUser.barRegistrationNumber}`} icon={ShieldCheck} />}
                        </div>
                      </BentoCard>
                    )}

                    {isOwner && (
                      <div className="md:col-span-2">
                        <button onClick={openEditModal} className="w-full py-8 bg-[#0A2342] text-white rounded-2xl shadow-lg text-[11px] font-bold tracking-widest uppercase flex items-center justify-center gap-4 hover:bg-[#153a66] transition-all">
                          Update Credentials <ChevronRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "appointments" && isOwner && (
                  <div className="space-y-8">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-[0.3em]">Management Console</span>
                      <h2 className="text-4xl font-serif text-[#0A2342]">Appointments</h2>
                    </div>
                    <AppointmentsList
                      advocateId={isProfessional ? profileUser.id || profileUser._id : undefined}
                      clientEmail={!isProfessional ? (loggedInUser?.email || profileUser.email) : undefined}
                      onUpdateUnread={fetchUnreadAppointments}
                      hideCalendar={true}
                    />
                  </div>
                )}

                {activeTab === "saved" && isOwner && <SavedPostsList />}

                {activeTab === "cases" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {profileUser.cases?.map((c: any, i: number) => (
                      <CaseBentoLink key={c.id} caseData={c} delay={i * 0.1} />
                    ))}
                    {(!profileUser.cases || profileUser.cases.length === 0) && <EmptyState icon={Briefcase} message="No case records found." />}
                  </div>
                )}

                {activeTab === "articles" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {profileUser.articles?.map((a: any, i: number) => (
                      <ArticleBentoLink key={a.id} articleData={a} delay={i * 0.1} logo={logo} />
                    ))}
                    {(!profileUser.articles || profileUser.articles.length === 0) && <EmptyState icon={FileText} message="No published insights." />}
                  </div>
                )}

                {/* 2.5 ACCOUNT SETTINGS (NEW REDESIGN) */}
                {activeTab === "settings" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* A. Notifications */}
                    <BentoCard title="Notifications" subtitle="Communication Prefs">
                      <p className="text-[10px] text-gray-400 mb-6 font-serif italic">Manage case alerts and communication preferences.</p>
                      <div className="space-y-4">
                        <ToggleItem
                          label="Do not disturb"
                          checked={prefs.doNotDisturb}
                          onChange={(v: any) => setPrefs({ ...prefs, doNotDisturb: v })}
                          icon={Shield}
                        />
                        <ToggleItem
                          label="Case Status Alerts"
                          checked={prefs.caseStatusAlerts}
                          onChange={(v: any) => setPrefs({ ...prefs, caseStatusAlerts: v })}
                          icon={Bell}
                        />
                      </div>
                    </BentoCard>

                    {/* B. Languages */}
                    <BentoCard title="Languages" subtitle="Localization">
                      <p className="text-[10px] text-gray-400 mb-6 font-serif italic">Choose your preferred interface language.</p>
                      <div className="space-y-3">
                        {/* English Selector */}
                        <button
                          onClick={() => handleLanguageChange("en")}
                          className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all ${currentLocale === "en" ? "bg-[#C9A227]/5 border-[#C9A227]/20 shadow-sm" : "bg-transparent border-gray-100 hover:border-gray-200"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-colors ${currentLocale === "en" ? "bg-[#C9A227] text-white" : "bg-gray-100 text-gray-400"}`}>
                              <Languages size={18} />
                            </div>
                            <span className="text-xs font-bold text-[#0A2342]">English</span>
                          </div>
                          {currentLocale === "en" && (
                            <span className="px-3 py-1 bg-[#C9A227] text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Active</span>
                          )}
                        </button>

                        {/* Hindi Selector */}
                        <button
                          onClick={() => handleLanguageChange("hi")}
                          className={`w-full p-5 rounded-2xl flex items-center justify-between border transition-all ${currentLocale === "hi" ? "bg-[#C9A227]/5 border-[#C9A227]/20 shadow-sm" : "bg-transparent border-gray-100 hover:border-gray-200"
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg transition-colors ${currentLocale === "hi" ? "bg-[#C9A227] text-white" : "bg-gray-100 text-gray-400"}`}>
                              <Languages size={18} />
                            </div>
                            <span className="text-xs font-bold text-[#0A2342]">Hindi</span>
                          </div>
                          {currentLocale === "hi" && (
                            <span className="px-3 py-1 bg-[#C9A227] text-white text-[8px] font-black rounded-full uppercase tracking-tighter">Active</span>
                          )}
                        </button>
                      </div>
                    </BentoCard>

                    {/* C. Subscription Plans */}
                    <BentoCard title="Subscription Plans" subtitle="Membership Status">
                      <p className="text-[10px] text-gray-400 mb-6 font-serif italic">Manage your current membership and upgrades.</p>
                      
                      {subscription && (subscription.status === "active" || subscription.status === "expired" || subscription.status === "canceled") ? (
                        <div className="space-y-4 p-6 bg-gray-50 rounded-2xl">
                          {subscription.status === "expired" ? (
                            <div className="p-3 rounded-xl border border-red-100 bg-red-50 text-red-600 text-center text-[10px] font-bold uppercase tracking-wider">
                              Your plan is expired
                            </div>
                          ) : subscription.status === "canceled" ? (
                            <div className="p-3 rounded-xl border border-amber-100 bg-amber-50 text-amber-600 text-center text-[10px] font-bold uppercase tracking-wider">
                              Your subscription is CANCELED
                            </div>
                          ) : null}

                          <div className="flex justify-between items-center group">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Plan Name</span>
                            <span className="text-xs font-black text-[#0A2342]">{subscription?.planName}</span>
                          </div>

                          {subscription.status === "expired" ? (
                            <div className="flex justify-between items-center pb-2">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expired Date</span>
                              <span className="text-xs font-semibold text-red-600">{formatDate(subscription?.endDate)}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center group">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Starting Date</span>
                                <span className="text-xs font-semibold">{formatDate(subscription?.startDate)}</span>
                              </div>
                              <div className="flex justify-between items-center pb-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ending Date</span>
                                <span className="text-xs font-semibold">{formatDate(subscription?.endDate)}</span>
                              </div>
                            </>
                          )}

                          <Link href="/subscription" className="block w-full py-4 bg-[#0A2342] text-white text-center rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md shadow-[#0A2342]/10 hover:bg-[#1a3a5f] transition-all">
                            {subscription.status === "active" ? "Upgrade" : "Renew Subscription"}
                          </Link>
                        </div>
                      ) : (
                        <div className="p-6 bg-red-50/50 border border-red-100 rounded-2xl text-center mb-4">
                          <p className="text-xs font-bold text-red-600 mb-2">No Active Subscription</p>
                          <p className="text-[10px] text-gray-500 mb-4">Subscribe to access our exclusive legal services and documents.</p>
                          <Link href="/subscription" className="inline-block px-6 py-3 bg-[#0A2342] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1a3a5f] transition-all">
                            Subscribe Now
                          </Link>
                        </div>
                      )}
                    </BentoCard>

                    {/* D. Security & Auth */}
                    <BentoCard title="Security & Auth" subtitle="Access Control">
                      <p className="text-[10px] text-gray-400 mb-6 font-serif italic">Reset password or sign out of your account.</p>
                      <div className="space-y-3">
                        <Link
                          href="/auth/forgot-password"
                          className="w-full flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl group hover:border-[#C9A227]/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <Key size={18} className="text-[#0A2342]" />
                            <span className="text-xs font-bold text-[#0A2342]">Reset Password</span>
                          </div>
                          <ChevronRight size={16} className="text-gray-300 group-hover:text-[#C9A227] transition-colors" />
                        </Link>
                        <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all">
                          <div className="flex items-center gap-4">
                            <LogOut size={18} />
                            <span className="text-xs font-bold">Sign Out</span>
                          </div>
                        </button>
                      </div>
                    </BentoCard>

                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* 3. MODALS */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => {
          if (e.target.files?.[0]) {
            setImageToCrop(e.target.files[0]);
          }
        }}
        accept="image/*"
        className="hidden"
      />
      <AnimatePresence>
        {isModalOpen && (
          <EditProfileModal onClose={() => setIsModalOpen(false)} formData={formData} setFormData={setFormData} onSave={handleUpdate} saving={saving || loggedInLoading} isProfessional={isProfessional} />
        )}
        {imageToCrop && (
          <ImageCropperModal
            imageFile={imageToCrop}
            onClose={() => setImageToCrop(null)}
            onCrop={handleImageUpload}
            aspect={1 / 1}
            title="Adjust Profile Photo"
            description="Drag and zoom to center your portrait (1:1 ratio)"
            loading={saving || loggedInLoading}
          />
        )}
        {showLogoutConfirm && (
          <LogoutOverlay onCancel={() => setShowLogoutConfirm(false)} onConfirm={handleLogout} />
        )}
        {showAuthModal && (
          <AuthPromptModal onClose={() => setShowAuthModal(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function TonalField({ label, value, icon: Icon }: any) {
  const display = Array.isArray(value) ? value.join(", ") : value;
  return (
    <div className="group">
      <div className="flex items-center gap-2 mb-2 opacity-50">
        {Icon && <Icon size={12} className="text-[#C9A227]" />}
        <label className="text-[9px] font-extrabold uppercase tracking-widest">{label}</label>
      </div>
      <div className="text-sm font-semibold border-b border-gray-100 pb-3 group-hover:border-[#C9A227]/30 transition-all">{display || "---"}</div>
    </div>
  );
}

function CaseBentoLink({ caseData, delay }: any) {
  return (
    <Link href={`/cases/${caseData.id}`}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="h-full bg-white/70 p-8 rounded-2xl border border-white/20 group hover:border-[#C9A227]/20 transition-all">
        <div className="flex justify-between items-start mb-6">
          <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-widest">{caseData.caseType || "Case"}</span>
          <div className="p-2 rounded-xl bg-gray-50"><Briefcase size={16} /></div>
        </div>
        <h3 className="text-2xl font-serif mb-4 line-clamp-2">{caseData.title}</h3>
        <p className="text-xs text-black/40 line-clamp-2 italic">Registry: {caseData.court}</p>
      </motion.div>
    </Link>
  );
}

function ArticleBentoLink({ articleData, delay, logo }: any) {
  return (
    <Link href={`/news/${articleData.slug}`}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="group">
        <div className="aspect-video rounded-[10px] overflow-hidden relative mb-6  border-2 border-white/10 group hover:border-[#C9A227]/50 transition-all duration-700">
          <Image src={articleData.thumbnail || logo} alt="Insight" fill className="object-cover transition-transform duration-1000" quality={90} sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 500px" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A2342]/90 to-transparent pt-10  pl-2 flex flex-col justify-end">
            <span className="text-[10px] font-black text-[#C9A227] uppercase tracking-widest mb-1">{articleData.category?.name || "Editorial"}</span>
            <h3 className="text-xl font-serif text-white leading-snug line-clamp-3 mb-1">{articleData.title}</h3>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

function ToggleItem({ label, checked, onChange, icon: Icon }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
      <div className="flex items-center gap-4">
        <Icon size={18} className="text-[#0A2342]" />
        <span className="text-xs font-bold">{label}</span>
      </div>
      <button onClick={() => onChange(!checked)} className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'bg-[#C9A227]' : 'bg-gray-200'}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}

function EditProfileModal({ onClose, formData, setFormData, onSave, saving, isProfessional }: any) {
  return (
    <div className="fixed inset-0 z-[690] flex items-center justify-center p-6 bg-[#0A2342]/60 backdrop-blur-md">
      <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-2xl hover:bg-gray-50"><X size={24} /></button>
        <div className="p-12 pb-4">
          <h2 className="text-4xl font-serif text-[#0A2342] mb-2">Edit Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[60vh] overflow-y-auto px-1 pr-6 custom-scrollbar">
            <InputField label={isProfessional ? "Full Legal Name" : "Full Name"} value={formData.name} onChange={(v: any) => setFormData({ ...formData, name: v })} />
            <InputField label="Professional Designation" value={formData.designation} onChange={(v: any) => setFormData({ ...formData, designation: v })} />
            <InputField label="Mobile Number" value={formData.phone} onChange={(v: any) => setFormData({ ...formData, phone: v })} />
            <InputField label="Date of Birth" type="date" value={formData.dob} onChange={(v: any) => setFormData({ ...formData, dob: v })} />
            <InputField label={isProfessional ? "Registry State" : "State"} value={formData.state} onChange={(v: any) => setFormData({ ...formData, state: v })} />
            <InputField label="City" value={formData.city} onChange={(v: any) => setFormData({ ...formData, city: v })} />
            {isProfessional && (
              <InputField
                label="Years of Professional Experience"
                type="number"
                value={formData.yearsOfExperience}
                onChange={(v: any) => setFormData({ ...formData, yearsOfExperience: v })}
              />
            )}
            {/* {isProfessional && !checkIsAdvocate({ designation: formData.designation, roles: [] }) && (
              <div className="md:col-span-1 space-y-1.5 flex flex-col">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Associated Court</label>
                <CourtSearchableDropdown
                  value={formData.court}
                  onChange={(v) => setFormData({ ...formData, court: v })}
                />
              </div>
            )} */}
            {isProfessional && (
              <InputField
                label="Expertise Area (Comma separated)"
                value={formData.specialization}
                onChange={(v: any) => setFormData({ ...formData, specialization: v })}
              />
            )}
            <TextAreaField label="Professional Bio" value={formData.bio} onChange={(v: any) => setFormData({ ...formData, bio: v })} className="md:col-span-2" />
            {isProfessional && formData.barRegistrationNumber && (
              <InputField label="Bar Registration #" value={formData.barRegistrationNumber} onChange={(v: any) => setFormData({ ...formData, barRegistrationNumber: v })} className="md:col-span-2" />
            )}
          </div>
        </div>
        <div className="p-12 flex gap-4 bg-gray-50/50">
          <button onClick={onClose} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest border border-gray-100 rounded-2xl">Cancel</button>
          <button onClick={onSave} disabled={saving} className="flex-[2] py-4 bg-[#0A2342] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-4 min-h-[56px]">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>Commit Update</span>
                <Check size={16} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}



function LogoutOverlay({ onCancel, onConfirm }: any) {
  return (
    <div className="fixed inset-0 z-[610] flex items-center justify-center p-6 bg-[#0A2342]/80 backdrop-blur-md">
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }} className="bg-white rounded-3xl p-12 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8"><LogOut size={40} /></div>
        <h3 className="text-3xl font-serif text-[#0A2342] mb-4">Logout?</h3>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 py-4 text-[10px] font-black uppercase border border-gray-100 rounded-2xl">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-4 bg-red-500 text-white rounded-2xl shadow-xl shadow-red-500/20">Sign Out</button>
        </div>
      </motion.div>
    </div>
  );
}

function AuthPromptModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl p-10 md:p-14 max-w-lg w-full text-center relative overflow-hidden shadow-2xl border border-black/5"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0A2342]/5 rounded-full -ml-12 -mb-12" />

        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-[#0A2342]"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-[#C9A227]/10 text-[#C9A227] rounded-[24px] flex items-center justify-center mx-auto mb-8 relative border border-[#C9A227]/20">
          <Lock size={32} strokeWidth={1.5} />
        </div>

        <h3 className="text-4xl font-serif text-[#0A2342] mb-4 tracking-tight">Identity Required</h3>
        <p className="text-gray-500 mb-10 text-sm leading-relaxed font-medium">
          To facilitate a secure professional consultation, please authenticate your profile. This ensures both parties have verified credentials for the appointment.
        </p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push(`/auth/login`)}
            className="w-full py-5 bg-[#0A2342] text-white rounded-2xl shadow-xl shadow-[#0A2342]/10 text-[11px] font-black uppercase tracking-widest hover:bg-[#153a66] transition-all flex items-center justify-center gap-3"
          >
            <User size={16} />
            Continue to Login
          </button>

          <button
            onClick={() => router.push(`/auth/signup`)}
            className="w-full py-5 bg-[#C9A227] text-white rounded-2xl shadow-xl shadow-[#C9A227]/10 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
          >
            Create New Profile
          </button>
        </div>

        <button
          onClick={onClose}
          className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A2342] transition-colors"
        >
          Maybe Later
        </button>
      </motion.div>
    </div >
  );
}

function InputField({ label, value, onChange, className = "", type = "text" }: any) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <input type={type} value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] rounded-2xl outline-none transition-all text-sm font-semibold" />
    </div>
  );
}

function TextAreaField({ label, value, onChange, className = "" }: any) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{label}</label>
      <textarea value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-[#C9A227] rounded-2xl outline-none transition-all text-sm font-semibold min-h-[120px] resize-none" />
    </div>
  );
}

function EmptyState({ icon: Icon, message }: any) {
  return (
    <div className="col-span-full py-32 flex flex-col items-center justify-center bg-white/50 rounded-3xl border-2 border-dashed border-gray-200">
      <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 mb-8"><Icon size={40} /></div>
      <p className="text-gray-400 font-serif italic text-lg">{message}</p>
    </div>
  );
}

function BentoSkeleton() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-32 animate-pulse">
      {/* 1. HERO SKELETON */}
      <section className="relative pt-24 pb-24 overflow-hidden text-center z-10">
        <div className="max-w-6xl mx-auto px-4 relative">
          {/* Avatar Circle */}
          <div className="relative inline-block mb-12">
            <div className="w-56 h-56 rounded-[40px] bg-gray-200" />
          </div>

          {/* Name Pulse */}
          <div className="h-20 w-3/4 max-w-2xl bg-gray-200 mx-auto mb-6 rounded-3xl" />

          {/* Role/Spec Pulse */}
          <div className="h-4 w-1/2 max-w-md bg-gray-200 mx-auto mb-12 rounded-lg" />

          {/* Bio Pulse */}
          <div className="h-16 w-full max-w-2xl bg-gray-100 mx-auto rounded-3xl" />
        </div>
      </section>

      {/* 2. BENTO CONTENT SKELETON */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Sidebar Skeleton */}
          <aside className="lg:col-span-3">
            <div className="flex flex-col gap-2 p-2 bg-gray-100 rounded-[32px]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-14 w-full bg-gray-200 rounded-2xl" />
              ))}
            </div>
          </aside>

          {/* Main Content Area Skeleton */}
          <div className="lg:col-span-9 pb-20">
            {/* Stats Row Pulse */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-gray-100 rounded-[32px]" />
              ))}
            </div>

            {/* Content Grid Pulse */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="h-[500px] bg-gray-100 rounded-[40px]" />
              <div className="h-[500px] bg-gray-100 rounded-[40px]" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function BentoErrorView({ error, context, router }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-[#F8F9FA] text-center">
      <div className="max-w-md w-full bg-white p-12 rounded-[56px] shadow-2xl">
        <h2 className="text-3xl font-serif text-[#0A2342] mb-4">Profile Not Found</h2>
        <p className="text-gray-500 mb-12 text-sm">{error || "Access restricted."}</p>
        <button onClick={() => router.push(context === "admin" ? "/admin" : "/")} className="w-full py-5 bg-[#0A2342] text-white rounded-2xl font-black uppercase text-xs">Return Home</button>
      </div>
    </div>
  );
}
