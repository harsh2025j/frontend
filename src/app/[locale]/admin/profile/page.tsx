"use client";

import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { UserData } from "@/data/features/profile/profile.types";
import Loader from "@/components/ui/Loader";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, X, Mail, Phone, Calendar, Shield, Save } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AdminProfilePage() {
    const { user: reduxUser, loading, updateProfile } = useProfileActions();
    const user = reduxUser as UserData;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        dob: "",
    });

    const [uploading, setUploading] = useState(false);

    // Synchronize formData with user when user loads or isEditing changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                phone: user.phone || "",
                dob: user.dob ? user.dob.split('T')[0] : "",
            });
        }
    }, [user, isEditing]);

    if (loading && !user) return <Loader />;

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploading(true);
            try {
                await updateProfile({ avatar: e.target.files[0] });
                toast.success("Profile picture updated!");
            } catch (err) {
                toast.error("Failed to update profile picture");
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSave = async () => {
        setUploading(true);
        try {
            await updateProfile(formData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
        } catch (err: any) {
            // Error handled by apiClient/redux error state usually, 
            // but we can add specific handling here if needed.
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsEditing(false)}
                            className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={uploading}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            {uploading ? "Saving..." : <><Save size={18} /> Save Changes</>}
                        </button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Avatar & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-50 bg-gray-100 relative">
                                {user?.profilePicture ? (
                                    <Image src={user.profilePicture} alt={user.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                        {(user?.name?.[0] || "U").toUpperCase()}
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader color="white" size="sm" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md group-hover:scale-110 transition-transform">
                                <Camera size={14} />
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>
                        <h2 className="mt-4 text-xl font-bold text-gray-900">{user?.name}</h2>
                        <p className="text-gray-500 text-sm capitalize">{user?.roles?.map(r => r.name).join(", ") || "User"}</p>
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Details</h3>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Mail size={18} className="text-blue-500" />
                            <span className="text-sm truncate" title={user?.email}>{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Calendar size={18} className="text-indigo-500" />
                            <span className="text-sm">Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-700">
                            <Shield size={18} className="text-orange-500" />
                            <span className="text-sm">{user?.isVerified ? "Verified Account" : "Unverified Account"}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Detailed Form */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Personal Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                type="text"
                                value={isEditing ? formData.name : user?.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+1234567890"
                                value={isEditing ? formData.phone : (user?.phone || "")}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                            <input
                                type="date"
                                value={isEditing ? formData.dob : (user?.dob?.split('T')[0] || "")}
                                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                disabled={!isEditing}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50 disabled:text-gray-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Security</h2>
                        <p className="text-sm text-gray-500 mb-6">Need to change your password? You can request a reset link below.</p>
                        <button className="px-6 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium text-gray-700">
                            Request Password Reset
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
