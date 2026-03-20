"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "@/components/ui/Loader";
import { profileApi } from "@/data/services/profie-service/profile-service";
import { UserData } from "@/data/features/profile/profile.types";
import { useDocTitle } from "@/hooks/useDocTitle";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  Briefcase, 
  Scale, 
  User as UserIcon,
  Globe,
  ArrowLeft
} from "lucide-react";
import { useRouter } from "@/i18n/routing";

export default function AdvocatePublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useDocTitle(user ? `${user.name} | Advocate Profile` : "Advocate Profile");

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const response = await profileApi.fetchPublicProfile(id);
        if (response.data.success) {
          setUser(response.data.data);
        } else {
          setError(response.data.message || "Failed to load profile");
        }
      } catch (err: any) {
        console.error("Error fetching public profile:", err);
        setError("Failed to load advocate profile. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <Loader text="Loading Advocate Profile..." size="lg" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-100 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Oops!</h2>
          <p>{error || "Advocate profile not found."}</p>
        </div>
      </div>
    );
  }

  const avatar = user.profilePicture || null;
  const initials = user.name ? user.name[0].toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero Header */}
      <div className="relative h-48 bg-[#0A2342] overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0 100 L100 0 L100 100 Z" fill="white" />
          </svg>
        </div>
        
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg border border-white/20 transition-all group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-8">
              <div className="p-8 flex flex-col items-center text-center">
                <div className="w-32 h-32 relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 border-4 border-white shadow-lg mb-6 flex items-center justify-center group">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt={user.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0A2342]/5">
                      <span className="text-4xl font-bold text-[#0A2342]/20">{initials}</span>
                    </div>
                  )}
                </div>
                
                <h1 className="text-2xl font-bold text-slate-900 mb-1">{user.name}</h1>
                <p className="text-[#C9A227] font-medium mb-4">{user.designation || "Advocate"}</p>
                
                <div className="w-full h-px bg-slate-100 my-4" />
                
                <div className="w-full space-y-4">
                  <div className="flex items-center gap-3 text-slate-600 text-sm">
                    <Mail size={18} className="text-slate-400 shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <Phone size={18} className="text-slate-400 shrink-0" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {(user.city || user.state) && (
                    <div className="flex items-center gap-3 text-slate-600 text-sm">
                      <MapPin size={18} className="text-slate-400 shrink-0" />
                      <span>{[user.city, user.state].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 w-full">
                  <button className="w-full bg-[#0A2342] text-white py-3 rounded-xl font-semibold hover:bg-[#153a66] transition shadow-md flex items-center justify-center gap-2">
                    <Mail size={18} />
                    Message Advocate
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Professional Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Professional Summary */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <UserIcon className="text-[#C9A227]" size={24} />
                <h2 className="text-xl font-bold text-slate-900">About</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {user.name} is a dedicated legal professional specializing in {user.specialization || "various areas of law"}. 
                With {user.yearsOfExperience || "many"} years of experience, they have established a reputation for diligent representation and expert counsel.
              </p>
            </div>

            {/* Experience & Credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="text-[#C9A227]" size={20} />
                  <h3 className="font-bold text-slate-900">Experience</h3>
                </div>
                <p className="text-2xl font-bold text-slate-700">{user.yearsOfExperience || "--"} Years</p>
                <p className="text-sm text-slate-500 mt-1">Professional Practice</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="text-[#C9A227]" size={20} />
                  <h3 className="font-bold text-slate-900">Registration</h3>
                </div>
                <p className="font-mono text-lg font-bold text-slate-700">{user.barRegistrationNumber || "N/A"}</p>
                <p className="text-sm text-slate-500 mt-1">Bar Council Registration</p>
              </div>
            </div>

            {/* Specializations */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Scale className="text-[#C9A227]" size={24} />
                <h2 className="text-xl font-bold text-slate-900">Practice Areas</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {user.specialization?.split(",").map((spec, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-slate-50 text-slate-700 rounded-lg text-sm border border-slate-100 hover:border-[#C9A227] hover:bg-white transition"
                  >
                    {spec.trim()}
                  </span>
                ) ) || (
                  <span className="text-slate-400 italic">No specialization specified</span>
                )}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-6">
                <Globe className="text-[#C9A227]" size={24} />
                <h2 className="text-xl font-bold text-slate-900">Languages</h2>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.preferredLanguage?.split(",").map((lang, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium"
                  >
                    {lang.trim()}
                  </span>
                )) || <span className="text-slate-400">Not specified</span>}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
