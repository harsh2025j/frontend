"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Camera, Shield, CreditCard, CheckCircle2,
  AlertCircle, Lock, Eye, EyeOff, Loader2, BookOpen, Award, Check, RefreshCw,
  Printer, X, Copy, ExternalLink, Download, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { updateAuthUser } from '@/data/features/auth/authSlice';
import { profileApi } from '@/data/services/profile-service/profile-service';
import { authApi } from '@/data/services/auth-service/auth-service';
import { fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import { certificateApi } from '@/data/services/academy-service/certificate.service';
import ImageCropperModal from '@/components/ui/ImageCropperModal';

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { myEnrollments } = useAppSelector(state => state.enrollments);

  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'billing'>('profile');

  // Profile Form State
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Student Metrics State
  const [certificatesCount, setCertificatesCount] = useState<number>(0);

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Invoice Modal State (for screenshot / preview)
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfileImage(user.profilePicture || null);
    }
  }, [user]);

  useEffect(() => {
    dispatch(fetchMyEnrollments());
    (async () => {
      try {
        const res: any = await certificateApi.mine();
        const list = (res?.data ?? res) || [];
        setCertificatesCount(Array.isArray(list) ? list.length : 0);
      } catch {
        setCertificatesCount(0);
      }
    })();
  }, [dispatch]);

  // Derived Metrics (100% Real Data)
  const totalEnrolled = myEnrollments.length;
  const completedCourses = myEnrollments.filter(e => e.progress === 100 || e.status === 'completed' || e.status === 'Completed').length;
  const remainingCourses = myEnrollments.filter(e => (e.progress || 0) < 100 && e.status !== 'completed' && e.status !== 'Completed').length;

  // Handle Photo Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImageToCrop(file);
    }
  };

  // Upload Cropped Photo (1:1 Aspect Ratio)
  const handleCropComplete = async (croppedFile: File) => {
    setImageToCrop(null);
    setIsUpdatingProfile(true);
    try {
      const res = await profileApi.updateProfile({
        name: name.trim() || user?.name || '',
        avatar: croppedFile
      });

      const updatedData = res.data?.data || res.data;
      const newPicUrl = updatedData?.profilePicture || URL.createObjectURL(croppedFile);
      setProfileImage(newPicUrl);
      dispatch(updateAuthUser({ profilePicture: newPicUrl }));
      toast.success('Profile avatar updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload avatar');
    } finally {
      setIsUpdatingProfile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Name & Profile details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      await profileApi.updateProfile({
        name: name.trim()
      });
      dispatch(updateAuthUser({ name: name.trim() }));
      toast.success('Profile name updated successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Change Password API Call
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!oldPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await authApi.changePassword({
        oldPassword,
        newPassword
      });
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Could not change password. Please check your current password.';
      setPasswordError(msg);
      toast.error(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Price helper: reads course.price or enrollment.amount
  const getEnrollmentPrice = (enrollment: any) => {
    const rawPrice = enrollment?.amount ?? enrollment?.course?.price;
    if (rawPrice === undefined || rawPrice === null || rawPrice === '') {
      return 'Free';
    }
    const num = Number(rawPrice);
    if (isNaN(num) || num <= 0) return 'Free';
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Print invoice helper using hidden iframe for perfect isolation
  const handlePrintInvoice = () => {
    const printContent = document.getElementById('invoice-screenshot-container');
    if (!printContent) {
      toast.error('Could not find invoice content to print');
      return;
    }

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    const styleElements = document.querySelectorAll('style, link[rel="stylesheet"]');
    let stylesHtml = '';
    styleElements.forEach(el => {
      stylesHtml += el.outerHTML;
    });

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice - ${selectedInvoice?.razorpayOrderId || 'Receipt'}</title>
          ${stylesHtml}
          <style>
            @page { size: auto; margin: 0mm; }
            body { 
              background: white; 
              margin: 0; 
              padding: 40px; 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            #invoice-screenshot-container { 
              box-shadow: none !important; 
              border: none !important; 
              max-height: none !important;
              overflow: visible !important;
            }
          </style>
        </head>
        <body>
          ${printContent.outerHTML}
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 1000);
    }, 500);
  };

  const handleCopyOrderId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedOrderId(true);
    toast.success('Order ID copied to clipboard');
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 ease-out">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[#122340] mb-1 tracking-tight">Account Settings</h1>
        <p className="text-sm text-[#122340]/65">Manage your student profile, login security credentials, and official billing invoices.</p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#122340]/8 p-6 md:p-8 lg:p-10">

        {/* Top Horizontal Navigation Tabs (Wide & Un-cramped) */}
        <div className="flex items-center gap-2 border-b border-[#122340]/10 pb-4 mb-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'profile', label: 'Student Profile', icon: <Camera size={18} /> },
            { id: 'password', label: 'Security & Password', icon: <Shield size={18} /> },
            { id: 'billing', label: 'Billing History', icon: <CreditCard size={18} />, badge: myEnrollments.length > 0 ? myEnrollments.length : undefined },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === 'password') setPasswordSuccess(false);
                }}
                className={`inline-flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${isActive
                  ? 'bg-[#122340] text-white shadow-md'
                  : 'text-[#122340]/65 hover:bg-[#FAF7F2] hover:text-[#122340]'
                  }`}
              >
                <span className={isActive ? 'text-[#C9A227]' : 'text-[#122340]/40'}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${isActive ? 'bg-[#C9A227] text-[#122340]' : 'bg-[#122340]/8 text-[#122340]/70'
                    }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ──────────────── TAB 1: STUDENT PROFILE ──────────────── */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl space-y-10 animate-in fade-in duration-300">

            {/* Profile Avatar & Details Card */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-7 pb-8 border-b border-[#122340]/8">
              <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#C9A227] to-amber-600 flex items-center justify-center font-black text-3xl text-white shadow-md overflow-hidden relative border-4 border-white">
                  {profileImage ? (
                    <img src={profileImage} alt={name || "Student"} className="w-full h-full object-cover" />
                  ) : (
                    name?.charAt(0).toUpperCase() || 'S'
                  )}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs">
                    <Camera size={22} className="mb-1 text-[#C9A227]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Change 1:1</span>
                  </div>
                </div>
                {isUpdatingProfile && (
                  <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center text-white">
                    <Loader2 size={24} className="animate-spin text-[#C9A227]" />
                  </div>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp,image/jpg"
                className="hidden"
              />

              <div className="text-center sm:text-left space-y-2 flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                  <h3 className="font-extrabold text-2xl text-[#122340]">{name || 'Legal Scholar'}</h3>
                  <span className="bg-amber-100 text-[#966b16] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/60">
                    Active Student
                  </span>
                </div>
                <p className="text-xs text-[#122340]/65 max-w-xl leading-relaxed">
                  Upload your student photo. You will be prompted to crop your picture to a clean <strong>1:1 square ratio</strong> before saving.
                </p>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-800 hover:bg-amber-500/20 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera size={14} className="text-[#C9A227]" /> Upload portrait photo &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Student Academic Summary Ribbon (100% Real Data) */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#122340]/40 mb-3">Academic Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-[#FAF7F2] border border-[#122340]/8">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#122340]/60">
                    <BookOpen size={14} className="text-[#C9A227]" />
                    <span>Enrolled</span>
                  </div>
                  <p className="text-2xl font-black text-[#122340]">{totalEnrolled}</p>
                  <p className="text-[11px] text-[#122340]/45 font-medium">Total Courses</p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#122340]/8 sm:pl-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={14} className="text-emerald-600" />
                    <span>Completed</span>
                  </div>
                  <p className="text-2xl font-black text-emerald-700">{completedCourses}</p>
                  <p className="text-[11px] text-[#122340]/45 font-medium">100% Finished</p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#122340]/8 sm:pl-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                    <RefreshCw size={14} className="text-amber-600" />
                    <span>In Progress</span>
                  </div>
                  <p className="text-2xl font-black text-amber-700">{remainingCourses}</p>
                  <p className="text-[11px] text-[#122340]/45 font-medium">Ongoing Classes</p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-[#122340]/8 sm:pl-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#C9A227]">
                    <Award size={14} className="text-[#C9A227]" />
                    <span>Certificates</span>
                  </div>
                  <Link href="/dashboard/certificates" className="hover:underline">
                    <p className="text-2xl font-black text-[#C9A227]">{certificatesCount}</p>
                  </Link>
                  <p className="text-[11px] text-[#122340]/45 font-medium">Earned Credentials</p>
                </div>
              </div>
            </div>

            {/* Personal Details Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6 pt-2">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/60">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-[#FAF7F2] border border-[#122340]/12 rounded-xl px-4 py-3.5 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-semibold text-[#122340] text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/60">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="w-full bg-slate-100/70 border border-[#122340]/10 rounded-xl px-4 py-3.5 outline-none text-[#122340]/60 font-semibold cursor-not-allowed text-sm"
                    disabled
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-[#122340]/40 font-medium">Email address is tied to your institutional authentication credentials.</p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isUpdatingProfile}
                  className="bg-[#122340] hover:bg-[#1b3560] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isUpdatingProfile ? <Loader2 size={16} className="animate-spin text-[#C9A227]" /> : <Check size={16} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ──────────────── TAB 2: SECURITY & PASSWORD ──────────────── */}
        {activeTab === 'password' && (
          <div className="max-w-xl space-y-6 animate-in fade-in duration-300">

            {passwordSuccess ? (
              /* Success Screen State */
              <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-extrabold text-[#122340]">Password Updated!</h3>
                <p className="text-sm text-[#122340]/60 max-w-sm mx-auto leading-relaxed">
                  Your password has been changed successfully. You can now use your new credentials for future logins.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setPasswordSuccess(false)}
                    className="bg-[#122340] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1b3560] transition-colors cursor-pointer shadow-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Password Change Form */
              <>
                <div className="mb-6">
                  <h3 className="font-extrabold text-2xl text-[#122340] mb-1">Update Security Password</h3>
                  <p className="text-xs text-[#122340]/60 leading-relaxed">
                    Enter your current password followed by your new password. Must be at least 6 characters long.
                  </p>
                </div>

                {passwordError && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                    <AlertCircle size={16} className="shrink-0 text-rose-600" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/60">Current Password</label>
                    <div className="relative">
                      <input
                        type={showOldPass ? "text" : "password"}
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter your current password"
                        className="w-full bg-[#FAF7F2] border border-[#122340]/12 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340] text-sm pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPass(!showOldPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showOldPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/60">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full bg-[#FAF7F2] border border-[#122340]/12 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340] text-sm pr-11"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#122340]/60">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-type new password"
                        className="w-full bg-[#FAF7F2] border border-[#122340]/12 rounded-xl px-4 py-3 outline-none focus:bg-white focus:border-[#C9A227] focus:ring-4 focus:ring-[#C9A227]/10 transition-all font-medium text-[#122340] text-sm pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      >
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="bg-[#122340] hover:bg-[#1b3560] text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUpdatingPassword ? <Loader2 size={16} className="animate-spin text-[#C9A227]" /> : <Lock size={15} />}
                      Update Password
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}

        {/* ──────────────── TAB 3: BILLING HISTORY (100% REAL DATA + EYE INVOICE BUTTON) ──────────────── */}
        {activeTab === 'billing' && (
          <div className="animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-2xl text-[#122340] mb-1">Billing & Course Invoices</h3>
                <p className="text-xs text-[#122340]/60">Official records of your enrolled courses, transaction identifiers, and tax receipts.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#122340]/50 bg-[#FAF7F2] px-3 py-1.5 rounded-lg border border-[#122340]/8">
                  {myEnrollments.length} {myEnrollments.length === 1 ? 'Record' : 'Records'} Total
                </span>
              </div>
            </div>

            {myEnrollments.length === 0 ? (
              <div className="border border-[#122340]/8 rounded-2xl p-12 text-center bg-[#FAF7F2]">
                <CreditCard size={36} className="mx-auto text-[#122340]/30 mb-3" />
                <h4 className="font-extrabold text-base text-[#122340] mb-1">No Billing Records Yet</h4>
                <p className="text-xs text-[#122340]/60 max-w-sm mx-auto mb-4">
                  When you enroll in courses, your order records, invoice identifiers, and payment receipts will appear here automatically.
                </p>
                <Link href="/courses">
                  <button className="bg-[#C9A227] hover:bg-[#b5901f] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm">
                    Browse Academy Courses &rarr;
                  </button>
                </Link>
              </div>
            ) : (
              <div className="border border-[#122340]/8 rounded-2xl overflow-hidden shadow-xs bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse min-w-[760px]">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#122340]/8 text-[#122340]/65 text-[11px] uppercase tracking-wider font-bold">
                        <th className="py-4 px-5">Invoice / Order ID</th>
                        <th className="py-4 px-5">Course Title</th>
                        <th className="py-4 px-5">Date</th>
                        <th className="py-4 px-5">Amount</th>
                        <th className="py-4 px-5">Status</th>
                        <th className="py-4 px-4 text-center">Invoice</th>
                        <th className="py-4 px-5 text-right">Access</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#122340] divide-y divide-[#122340]/6">
                      {myEnrollments.map((enrollment: any, i: number) => {
                        const orderId = enrollment.razorpayOrderId || `ORD-${(enrollment.id || '').substring(0, 8).toUpperCase()}`;
                        const dateStr = enrollment.createdAt
                          ? new Date(enrollment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                          : 'Confirmed';
                        const courseTitle = enrollment.course?.title || 'Legal Academy Course';
                        const priceDisplay = getEnrollmentPrice(enrollment);

                        return (
                          <tr key={enrollment.id || i} className="hover:bg-[#FAF7F2]/50 transition-colors">
                            {/* Order ID */}
                            <td className="py-4 px-5">
                              <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
                                {orderId}
                              </span>
                            </td>

                            {/* Course Title */}
                            <td className="py-4 px-5 font-semibold text-xs text-[#122340] max-w-xs">
                              <div className="truncate font-bold text-sm" title={courseTitle}>
                                {courseTitle}
                              </div>
                              {enrollment.course?.category && (
                                <span className="text-[10px] text-[#122340]/50 font-medium">
                                  {enrollment.course.category}
                                </span>
                              )}
                            </td>

                            {/* Date */}
                            <td className="py-4 px-5 text-xs text-[#122340]/70 font-medium whitespace-nowrap">
                              {dateStr}
                            </td>

                            {/* Amount */}
                            <td className="py-4 px-5 font-extrabold text-sm text-[#122340] whitespace-nowrap">
                              {priceDisplay}
                            </td>

                            {/* Status */}
                            <td className="py-4 px-5 whitespace-nowrap">
                              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                Paid / Active
                              </span>
                            </td>

                            {/* Eye Button to Preview Invoice & Take Screenshot */}
                            <td className="py-4 px-4 text-center whitespace-nowrap">
                              <button
                                onClick={() => setSelectedInvoice(enrollment)}
                                title="View Official Invoice / Screenshot Receipt"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-[#C9A227] text-amber-800 hover:text-white font-bold text-xs transition-all cursor-pointer border border-amber-300/40 hover:shadow-xs group"
                              >
                                <Eye size={14} className="text-[#C9A227] group-hover:text-white" />
                                <span>Invoice</span>
                              </button>
                            </td>

                            {/* Course Access Link */}
                            <td className="py-4 px-5 text-right whitespace-nowrap">
                              <Link
                                href={`/dashboard/learn/${enrollment.course?.slug || ''}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-[#C9A227] hover:text-[#b5901f] hover:underline"
                              >
                                <span>Open Course</span>
                                <ExternalLink size={12} />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ──────────────── OFFICIAL INVOICE MODAL (SCREENSHOT & PRINT READY, MAX-H 95VH) ──────────────── */}
      {selectedInvoice && (
        <>
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              #invoice-screenshot-container, #invoice-screenshot-container * {
                visibility: visible !important;
              }
              #invoice-screenshot-container {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 20px !important;
                box-shadow: none !important;
                background: white !important;
              }
            }
          `}</style>
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200 print:bg-transparent print:backdrop-blur-none">
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#122340]/10 overflow-hidden max-h-[95vh] flex flex-col my-auto print:shadow-none print:border-none print:max-h-none print:overflow-visible">

              {/* Modal Top Control Bar (Hidden when printing) */}
              <div className="bg-[#122340] text-white px-6 py-3.5 flex items-center justify-between shrink-0 print:hidden">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-[#C9A227]" />
                  <span className="font-extrabold text-sm tracking-wide">Official Enrollment Invoice</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    title="Print or Save as PDF"
                  >
                    <Printer size={14} className="text-[#C9A227]" />
                    <span>Print / PDF</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Printable & Screenshot-Ready Receipt Container (Scrollable within max-h-[95vh]) */}
              <div id="invoice-screenshot-container" className="p-6 sm:p-9 bg-white space-y-5 text-[#122340] overflow-y-auto flex-1">

                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#122340]/10">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <img src="/logo-gold.png" alt="Academy Logo" className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                      <h2 className="text-xl font-black text-[#122340] tracking-tight">SAMVIDHA ACADEMY</h2>
                    </div>
                    <p className="text-xs text-[#122340]/60 font-medium">Premier Institute for Advanced Legal Education</p>
                    <p className="text-[11px] text-[#122340]/45">GSTIN: 07AAACS1429B1Z • education@samvidha.legal</p>
                  </div>

                  <div className="text-left sm:text-right space-y-1">
                    <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-300">
                      TAX INVOICE • PAID
                    </span>
                    <p className="text-xs font-mono font-bold text-[#122340] pt-1">
                      INV-{selectedInvoice.razorpayOrderId ? selectedInvoice.razorpayOrderId.replace('order_', '') : (selectedInvoice.id || '').substring(0, 10).toUpperCase()}
                    </p>
                    <p className="text-xs text-[#122340]/60">
                      Date: {selectedInvoice.createdAt
                        ? new Date(selectedInvoice.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                        : new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                      }
                    </p>
                  </div>
                </div>

                {/* Student & Order Reference Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-[#FAF7F2] border border-[#122340]/8 text-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#122340]/40 mb-1">Billed To (Student)</p>
                    <p className="font-extrabold text-[#122340] text-sm">{user?.name || selectedInvoice.studentName || 'Enrolled Student'}</p>
                    <p className="text-[#122340]/70 font-mono text-[11px]">{user?.email || selectedInvoice.studentEmail || 'student@samvidha.legal'}</p>
                    <p className="text-[#122340]/50 text-[11px] mt-0.5">Student ID: STU-{(user?._id || (user as any)?.id || selectedInvoice.userId || 'VERIFIED').substring(0, 8).toUpperCase()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#122340]/40 mb-1">Payment Details</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[#122340]">Order ID:</span>
                      <span className="font-mono font-bold text-slate-800">{selectedInvoice.razorpayOrderId || `ORD-${(selectedInvoice.id || '').substring(0, 8)}`}</span>
                      <button
                        onClick={() => handleCopyOrderId(selectedInvoice.razorpayOrderId || selectedInvoice.id)}
                        className="text-slate-400 hover:text-slate-700 cursor-pointer ml-1"
                        title="Copy Order ID"
                      >
                        {copiedOrderId ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      </button>
                    </div>
                    <p className="text-[#122340]/70 mt-1">Payment Method: Online Gateway (Razorpay)</p>
                    <p className="text-[#122340]/70">Transaction Status: <span className="text-emerald-700 font-bold">Authorized & Captured</span></p>
                  </div>
                </div>

                {/* Course Item Line Table */}
                <div className="border border-[#122340]/10 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#FAF7F2] border-b border-[#122340]/10 text-[#122340]/60 uppercase tracking-wider font-bold text-[10px]">
                        <th className="py-3 px-4">Item & Description</th>
                        <th className="py-3 px-3 text-center">Category</th>
                        <th className="py-3 px-3 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#122340]/5 font-medium">
                      <tr>
                        <td className="py-4 px-4">
                          <p className="font-bold text-sm text-[#122340]">
                            {selectedInvoice.course?.title || 'Advanced Legal Academy Course'}
                          </p>
                          <p className="text-[11px] text-[#122340]/55 mt-0.5">
                            Lifetime Student Enrollment & Certification Access
                          </p>
                        </td>
                        <td className="py-4 px-3 text-center text-[#122340]/70">
                          {selectedInvoice.course?.category || 'Law Curriculum'}
                        </td>
                        <td className="py-4 px-3 text-center font-bold text-[#122340]">
                          1
                        </td>
                        <td className="py-4 px-4 text-right font-black text-sm text-[#122340]">
                          {getEnrollmentPrice(selectedInvoice)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Total Calculation Card */}
                <div className="flex justify-end pt-1">
                  <div className="w-64 space-y-2 text-xs">
                    <div className="flex justify-between text-[#122340]/70">
                      <span>Course Subtotal:</span>
                      <span className="font-bold text-[#122340]">{getEnrollmentPrice(selectedInvoice)}</span>
                    </div>
                    <div className="flex justify-between text-[#122340]/70">
                      <span>Applicable Taxes (GST):</span>
                      <span className="text-emerald-700 font-semibold">Included</span>
                    </div>
                    <div className="border-t border-[#122340]/10 pt-2 flex justify-between font-black text-base text-[#122340]">
                      <span>Total Paid:</span>
                      <span className="text-[#C9A227]">{getEnrollmentPrice(selectedInvoice)}</span>
                    </div>
                  </div>
                </div>

                {/* Official Seal / Signature Footer */}
                {/* */}

              </div>

              {/* Modal Bottom Tip Bar (Hidden when printing) */}
              <div className="bg-[#FAF7F2] border-t border-[#122340]/8 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#122340]/60 print:hidden">
                <span className="flex items-center gap-1.5 font-medium">
                  {/* <span>📸</span> Tip: Take a screenshot or click <strong>Print / PDF</strong> to keep your official record. */}
                </span>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="bg-[#122340] text-white px-5 py-1.5 rounded-lg font-bold text-xs hover:bg-[#1b3560] transition-colors cursor-pointer "
                >
                  Close Invoice
                </button>
              </div>

            </div>
          </div>
        </>
      )}

      {/* 1:1 Aspect Ratio Image Cropper Modal */}
      {imageToCrop && (
        <ImageCropperModal
          imageFile={imageToCrop}
          onClose={() => {
            setImageToCrop(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
          onCrop={handleCropComplete}
          aspect={1 / 1}
          title="Adjust Profile Portrait (1:1 Ratio)"
          description="Drag and zoom to perfectly center your portrait photo before uploading"
          loading={isUpdatingProfile}
        />
      )}

    </div>
  );
}
