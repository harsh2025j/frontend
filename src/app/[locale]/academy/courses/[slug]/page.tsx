"use client";

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, Star, Share2, CalendarDays, Clock, Globe,
  Users, GraduationCap, Sparkles, CheckCircle2, Heart,
  PlayCircle, Video, BarChart, Infinity, Award, FileText,
  Plus, Minus, ChevronDown, ChevronUp, MonitorPlay, Loader2, ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchCourseById } from '@/data/features/academy/course/courseThunks';
import { clearCurrentCourse } from '@/data/features/academy/course/courseSlice';
import { createCoursePaymentOrder, verifyCoursePayment, fetchMyEnrollments } from '@/data/features/academy/enrollments/enrollmentsThunks';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// ── Mock Data ───────────────────────────────────────────────────

const LIVE_HYBRID_COURSE = {
  type: "video",
  title: "Core Criminal Law Course Package (Live + Recorded)",
  subtitle: "A structured reading of India's substantive and procedural criminal law. Build a strong foundation through interactive live sessions.",
  instructor: {
    name: "Dr. Rajesh Nair",
    title: "Senior Criminal Litigator & Educator",
    bio: "Dr. Nair is a renowned legal educator and former practicing advocate with over 20 years of experience in criminal litigation.",
    image: "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=200&auto=format&fit=crop"
  },
  price: "₹8,499",
  originalPrice: "₹12,000",
  image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
  tags: ["Live Sessions", "Recordings Included", "Certificate Included"],
  schedule: {
    startDate: "15th November, 2026",
    endDate: "20th December, 2026",
    timings: "Sat & Sun: 6:00 PM - 8:30 PM (IST)",
    note: "Missed a class? No problem. All live classes are recorded and made available for revision within 24 hours on your dashboard."
  },
  whoShouldEnrol: ["Law Students (LL.B & LL.M)", "Junior Advocates", "Judiciary Aspirants", "Police Officers"],
  whatYouWillLearn: [
    "In-depth understanding of Bharatiya Nyaya Sanhita (BNS) provisions.",
    "Mastering the investigative procedures and trial stages.",
    "Appreciation of electronic and documentary evidence.",
    "Drafting of criminal complaints, bail applications."
  ],
  modules: [
    { title: "Module 1: Introduction to Bharatiya Nyaya Sanhita (BNS)", lectures: 5, duration: "2h 30m" },
    { title: "Module 2: Key changes in investigative procedures under BNSS", lectures: 8, duration: "4h 15m" },
  ],
  features: [
    { icon: <Video size={18} />, text: "Live Interactive Weekend Classes" },
    { icon: <MonitorPlay size={18} />, text: "Recordings available for revision" },
    { icon: <FileText size={18} />, text: "25 downloadable resources & drafts" },
    { icon: <Infinity size={18} />, text: "Full lifetime access to recordings" },
    { icon: <Award size={18} />, text: "Certificate of completion" },
  ],
  glance: [
    { label: "Duration", value: "40+ Hours" },
    { label: "Format", value: "Live Classes + Recorded Video" },
    { label: "Language", value: "English" },
    { label: "Validity", value: "Lifetime Access" },
  ],
  faqs: [
    { q: "What if I miss a live session?", a: "All live sessions are recorded and uploaded to your dashboard within 24 hours so you can revise at your own pace." },
    { q: "Is the course material accessible on mobile?", a: "Yes, you can access all video lectures via our mobile platform." },
  ]
};

const RECORDED_COURSE = {
  type: "video",
  title: "Previous Year Question (PYQ) Discussion Masterclass",
  subtitle: "Self-paced complete discussion and analysis of previous year questions for judiciary aspirants. Available immediately.",
  instructor: {
    name: "Adv. Priya Mehta",
    title: "Judiciary Preparation Expert",
    bio: "Adv. Mehta has mentored thousands of students to success in various state judicial service examinations.",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
  },
  price: "₹2,999",
  originalPrice: "₹5,000",
  image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop",
  tags: ["Pre-Recorded", "Self-Paced", "PYQ Discussion"],
  schedule: null, // No schedule for recorded courses
  whoShouldEnrol: ["Judiciary Aspirants", "Law Students preparing for competitive exams"],
  whatYouWillLearn: [
    "Pattern analysis of previous year papers across 5 major states.",
    "Techniques to eliminate wrong options in objective questions.",
    "Structuring perfect answers for subjective mains questions.",
    "Time management during the examination."
  ],
  modules: [
    { title: "Module 1: Constitutional Law PYQs (2018-2023)", lectures: 10, duration: "8h 00m" },
    { title: "Module 2: Criminal Procedure Code PYQs", lectures: 12, duration: "9h 30m" },
  ],
  features: [
    { icon: <MonitorPlay size={18} />, text: "Start instantly, learn anywhere" },
    { icon: <Clock size={18} />, text: "Learn at your own pace" },
    { icon: <FileText size={18} />, text: "Downloadable PDF notes of solutions" },
    { icon: <Infinity size={18} />, text: "Full lifetime access" },
  ],
  glance: [
    { label: "Duration", value: "25+ Hours" },
    { label: "Format", value: "Pre-recorded Video (Self-paced)" },
    { label: "Language", value: "English & Hindi Mix" },
    { label: "Validity", value: "Lifetime Access" },
  ],
  faqs: [
    { q: "Are there any live classes?", a: "No, this course is entirely pre-recorded so you can start studying immediately at your own pace." },
    { q: "Can I ask questions if I have doubts?", a: "Yes, you can post questions in the course discussion forum, and our mentors will reply within 48 hours." },
  ]
};

const TEST_SERIES = {
  type: "test",
  title: "Judiciary Prep Booster Test 3rd Edition : Constitution of India",
  instructor: "Sajjad Husain Legal Academy",
  language: "English",
  validity: "180 days",
  price: "₹199",
  originalPrice: null,
  image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
  description: `
    <p>The Judiciary Prep Booster Test - 3rd Edition by Sajjad Husain Legal Academy is a specialized, examination-oriented test program designed for judiciary aspirants.</p>
    <br/>
    <h3 class="font-bold">COURSE HIGHLIGHTS</h3>
    <ul class="list-disc pl-5 mt-2 space-y-1">
      <li>Comprehensive Objective & Subjective testing</li>
      <li>Coverage of Landmark and Recent Constitutional Developments</li>
      <li>Live Open House Discussion Sessions</li>
      <li>Model Answers & Strategy Discussions</li>
    </ul>
    <br/>
    <h3 class="font-bold">TEST PATTERN</h3>
    <p class="mt-2 font-semibold">Objective Test</p>
    <ul class="list-disc pl-5">
      <li>Total Marks: 200</li>
      <li>Total Questions: 100</li>
      <li>Negative Marking: ¼ deduction</li>
    </ul>
  `,
  otherCourses: [
    { id: 1, title: "Judiciary Prep Booster Test 3rd Edition: Criminal Law", price: "₹199", img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=150&auto=format&fit=crop" },
    { id: 2, title: "Judiciary Prep Booster Test 3rd Edition: Civil Law-I", price: "₹199", img: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=150&auto=format&fit=crop" },
    { id: 3, title: "Judiciary Prep Booster Test 3rd Edition: Family Law", price: "₹199", img: "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=150&auto=format&fit=crop" },
  ]
};

// ── Layout Components ───────────────────────────────────────────

export function VideoCourseLayout({ course }: { course: any }) {
  const router = useRouter();
  const [openModules, setOpenModules] = useState<number[]>([0]);

  const toggleModule = (index: number) => {
    setOpenModules(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const toggleAllModules = () => {
    if (course.modules && openModules.length === course.modules.length) {
      setOpenModules([]);
    } else {
      setOpenModules(course.modules?.map((_: any, i: number) => i) || []);
    }
  };

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { myEnrollments } = useAppSelector(state => state.enrollments);

  const isEnrolled = myEnrollments?.some(e => e.course?.slug === course.slug || e.courseId === course.id);

  // Load Razorpay checkout.js script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayNow = async () => {
    if (!user) {
      toast('Please log in to enroll in a course.');
      router.push(`/auth/login?returnUrl=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    if (!course.id) {
      toast.error('Invalid course.');
      return;
    }

    setIsPaying(true);
    try {
      const res = await dispatch(createCoursePaymentOrder(course.id)).unwrap();
      const orderData = res.data || res;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please check your internet connection.');
        setIsPaying(false);
        return;
      }

      const options: any = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Sajjad Husain Legal Academy',
        description: `Enrollment for ${course.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#0B1B3D' },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
            toast.error('Payment cancelled.');
          },
        },
        handler: async (response: any) => {
          try {
            await dispatch(verifyCoursePayment({
              courseId: course.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            })).unwrap();

            toast.success('Payment successful! You are now enrolled.');
            // Optionally redirect to student dashboard
            router.push('/dashboard');
          } catch (err: any) {
            toast.error(err || 'Payment verification failed. Please contact support.');
          } finally {
            setIsPaying(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast.error(error || 'Failed to initiate payment.');
      setIsPaying(false);
    }
  };

  // Ratings dummy
  const rating = course.rating || 0;
  const reviews = course.reviews || 0;

  // Instructors
  const instructors = course.instructors || [];

  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* ── BREADCRUMB ── */}
      <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 font-medium">
        <ArrowLeft size={16} /> Back
      </button>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 lg:space-y-8">

          {/* Header Info */}
          <div>
            {course.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {course.tags.map((tag: string, i: number) => (
                  <span key={i} className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <h1 className="text-4xl font-extrabold text-[#0B1B3D] mb-3">
              {course.title || "Title not available"}
            </h1>
            <p className="text-gray-600 text-lg mb-4">
              {course.subtitle || course.description || "Description not available"}
            </p>
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex text-[#F59E0B]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} fill={i < Math.floor(rating) ? "currentColor" : "none"} strokeWidth={i < Math.floor(rating) ? 0 : 2} className={i >= Math.floor(rating) ? "text-gray-300" : ""} />
                  ))}
                </div>
                <span className="font-bold text-[#0B1B3D]">{rating}</span>
                <span className="text-gray-500 text-sm">({reviews} reviews)</span>
              </div>
              <button className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm font-medium">
                <Share2 size={16} /> Share
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              {instructors.length > 0 ? instructors.map((inst: any, idx: number) => (
                <div key={idx} className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                  {inst.image ? (
                    <img src={inst.image} alt={inst.name} className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                      <Users size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="font-bold text-[#0B1B3D] truncate text-sm">{inst.name || "Instructor not available"}</p>
                    {(inst.title || inst.bio) && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed" title={inst.title || inst.bio}>{inst.title || inst.bio}</p>
                    )}
                  </div>
                </div>
              )) : (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl bg-white shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0 border border-gray-100">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-[#0B1B3D] text-sm">Instructor not available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Batch Schedule */}
          {course.schedule && (
            <div className="border border-gray-200 rounded-2xl p-6 relative overflow-hidden bg-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="text-red-500 bg-red-50 p-2 rounded-lg">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                    <circle cx="12" cy="12" r="4" fill="currentColor" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-[#0B1B3D]">Live Batch Schedule</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6">
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <CalendarDays size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Timeline</p>
                      <p className="text-sm font-semibold text-[#0B1B3D]">
                        {course.schedule?.startDate ? `${course.schedule.startDate} – ${course.schedule.endDate || 'TBD'}` : 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <Clock size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Live Timing</p>
                      <p className="text-sm font-semibold text-[#0B1B3D]">
                        {course.schedule?.timings || 'Not available'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <Globe size={20} className="text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Language</p>
                      <p className="text-sm font-semibold text-[#0B1B3D]">
                        {course.language || 'English'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-[#0B1B3D] font-medium pt-2">Check course modules for details</p>
                </div>

                <div className="h-full">
                  <div className="bg-[#FFF9E6] rounded-xl p-6 h-full flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4AF37]"></div>
                    <div className="flex items-center gap-2 mb-3 font-bold text-[#0B1B3D] text-[15px]">
                      <Video size={20} className="text-[#D4AF37]" fill="currentColor" /> Recordings Included
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{course.schedule?.note || 'Recordings and assignments are included.'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3 Info Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Who should enroll */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <h3 className="font-bold text-lg text-[#0B1B3D] mb-5 flex items-center gap-2">
                <Users size={20} className="text-[#D4AF37]" /> Who should enroll
              </h3>
              {course.whoShouldEnrol?.length > 0 ? (
                <ul className="space-y-4">
                  {course.whoShouldEnrol.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-gray-700">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      <span className="leading-snug break-words max-w-full overflow-hidden">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Not available</p>
              )}
            </div>

            {/* What you will learn */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white">
              <h3 className="font-bold text-lg text-[#0B1B3D] mb-5 flex items-center gap-2">
                <GraduationCap size={20} className="text-[#D4AF37]" /> What you will learn
              </h3>
              {course.whatYouWillLearn?.length > 0 ? (
                <ul className="space-y-4">
                  {course.whatYouWillLearn.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-gray-700">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      <span className="leading-snug break-words max-w-full overflow-hidden">{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Not available</p>
              )}
            </div>

            {/* Course features */}
            <div className="border border-gray-200 rounded-xl p-6 bg-white md:col-span-2">
              <h3 className="font-bold text-lg text-[#0B1B3D] mb-5 flex items-center gap-2">
                <Sparkles size={20} className="text-[#D4AF37]" /> Course features
              </h3>
              {course.features?.length > 0 ? (
                <ul className="space-y-4">
                  {course.features.map((item: any, i: number) => (
                    <li key={i} className="flex gap-3 items-start text-sm text-gray-700">
                      <CheckCircle2 size={18} className="text-green-500 shrink-0" />
                      <span className="leading-snug break-words max-w-full overflow-hidden">{typeof item === 'string' ? item : item.text}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Not available</p>
              )}
            </div>

          </div>

          {/* Course Curriculum */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#FFF9E6] p-2.5 rounded-lg">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-[#0B1B3D]">Course Curriculum</h3>
                  <p className="text-xs text-gray-500">{course.modules?.length || 4} Modules</p>
                </div>
              </div>
              <button onClick={toggleAllModules} className="text-sm font-semibold text-[#0B1B3D] hover:text-black">
                {course.modules && openModules.length === course.modules.length && course.modules.length > 0 ? "Collapse All" : "Expand All"}
              </button>
            </div>

            {course.modules?.length > 0 ? (
              <div className="space-y-3">
                {course.modules.map((mod: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => toggleModule(i)} className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-[#0B1B3D] text-sm">{mod.title}</span>
                      <div className="flex items-center gap-4 text-gray-500 text-xs">
                        <span>{mod.lectures} Lectures{mod.duration ? ` • ${mod.duration}` : ''}</span>
                        {openModules.includes(i) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>
                    {openModules.includes(i) && (
                      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
                        <ul className="space-y-3">
                          {mod.subModules?.length > 0 && mod.subModules.map((sub: any, subIdx: number) => (
                            <div key={subIdx} className="mb-4 last:mb-0">
                              <h5 className="font-bold text-sm text-gray-800 mb-2">{sub.title}</h5>
                              <ul className="space-y-2 pl-4 border-l-2 border-gray-200 ml-1">
                                {sub.items?.length > 0 ? sub.items.map((item: any, idx: number) => (
                                  <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                                    {item.type === 'video' ? <PlayCircle size={16} className="text-indigo-500 shrink-0" /> :
                                      item.type === 'document' ? <FileText size={16} className="text-emerald-500 shrink-0" /> :
                                        item.type === 'live' ? <MonitorPlay size={16} className="text-red-500 shrink-0" /> :
                                          item.type === 'assignment' ? <CheckCircle2 size={16} className="text-orange-500 shrink-0" /> :
                                            <PlayCircle size={16} className="text-gray-400 shrink-0" />}
                                    <span>{item.title}</span>
                                  </li>
                                )) : (
                                  <li className="text-sm italic text-gray-400">No lessons in this sub-section.</li>
                                )}
                              </ul>
                            </div>
                          ))}

                          {/* Direct items in root module */}
                          {mod.items?.length > 0 && mod.items.map((item: any, idx: number) => (
                            <li key={idx} className="flex items-center gap-3 text-sm text-gray-600">
                              {item.type === 'video' ? <PlayCircle size={16} className="text-indigo-500 shrink-0" /> :
                                item.type === 'document' ? <FileText size={16} className="text-emerald-500 shrink-0" /> :
                                  item.type === 'live' ? <MonitorPlay size={16} className="text-red-500 shrink-0" /> :
                                    item.type === 'assignment' ? <CheckCircle2 size={16} className="text-orange-500 shrink-0" /> :
                                      <PlayCircle size={16} className="text-gray-400 shrink-0" />}
                              <span>{item.title}</span>
                            </li>
                          ))}

                          {(!mod.items?.length && !mod.subModules?.length) && (
                            <li className="text-sm italic text-gray-400">No lessons in this module.</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-4">Curriculum not available.</p>
            )}
          </div>

          {/* FAQs */}
          <div className="border border-gray-200 rounded-xl p-6 bg-white">
            <h3 className="font-bold text-xl text-[#0B1B3D] mb-6 flex items-center gap-3">
              <div className="bg-[#FFF9E6] p-2.5 rounded-lg">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M9 9h6" />
                  <path d="M9 13h6" />
                </svg>
              </div>
              Frequently Asked Questions
            </h3>
            {course.faqs?.length > 0 ? (
              <div className="space-y-3">
                {course.faqs.map((faq: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full px-5 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-[#0B1B3D] text-sm">{faq.q}</span>
                      {openFaq === i ? <Minus size={16} className="text-gray-500" /> : <Plus size={16} className="text-gray-500" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic mt-4">FAQs not available.</p>
            )}
          </div>

        </div>

        {/* ── RIGHT COLUMN (Sticky Card) ── */}
        <div>
          <div className="sticky top-24 space-y-6 pt-0">

            {/* Main Buy Card */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm">
              <div className="relative aspect-video bg-gray-100 flex items-center justify-center">
                {course.image ? (
                  <img src={course.image} alt="Course Cover" className="w-full h-full object-cover" />
                ) : (
                  <Video size={48} className="text-gray-300" />
                )}
                <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-2 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                    <PlayCircle size={36} className="text-[#0B1B3D]" fill="white" strokeWidth={1} />
                  </div>
                  <span className="text-white font-bold text-sm">Preview this course</span>
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-3xl font-extrabold text-[#0B1B3D] mb-5">{course.price || "Free"}</h2>
                <div className="space-y-3 mb-6">
                  {isEnrolled ? (
                    <Link href={`/dashboard/learn/${course.slug}`}>
                      <button className="w-full bg-[#122340] text-white py-3.5 rounded-lg font-bold hover:bg-[#0a1628] transition-colors text-[15px] flex justify-center items-center gap-2">
                        <CheckCircle2 size={18} className="text-green-400" /> Already Enrolled • Go to Course
                      </button>
                    </Link>
                  ) : (
                    <button 
                      onClick={handlePayNow}
                      disabled={isPaying}
                      className="w-full bg-[#D4AF37] text-white py-3.5 rounded-lg font-bold hover:bg-[#c4a132] transition-colors text-[15px] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                      {isPaying ? <Loader2 size={18} className="animate-spin" /> : "Enroll Now"}
                    </button>
                  )}
                  {!isEnrolled && (
                    <button className="w-full bg-white border border-gray-300 text-[#0B1B3D] py-3.5 rounded-lg font-bold hover:bg-gray-50 transition-colors text-[15px] flex items-center justify-center gap-2">
                      <Heart size={18} /> Add to Wishlist
                    </button>
                  )}
                </div>

                <h4 className="font-bold text-[#0B1B3D] mb-4 text-sm">This programme includes:</h4>
                {course.inclusions?.length > 0 ? (
                  <ul className="space-y-4">
                    {course.inclusions.map((item: string, i: number) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                        <CheckCircle2 size={18} className="text-[#D4AF37]" /> {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">Not available</p>
                )}
              </div>
            </div>

            {/* Info Boxes */}
            {course.glance?.find((g: any) => g.label === 'Level')?.value && course.glance.find((g: any) => g.label === 'Level').value !== "All Levels" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-center shadow-sm">
                <div className="text-gray-500 p-1">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                    <polyline points="4 14 12 4 18 10 22 2" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">{course.glance.find((g: any) => g.label === 'Level').value} Level</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Designed for new learners</p>
                </div>
              </div>
            )}

            {course.glance?.find((g: any) => g.label === 'Teaching Hours')?.value && course.glance.find((g: any) => g.label === 'Teaching Hours').value !== "Self-paced" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-center shadow-sm">
                <div className="text-gray-500 p-1"><CalendarDays size={28} strokeWidth={1.5} /></div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">{course.glance.find((g: any) => g.label === 'Teaching Hours').value}</h4>
                  {course.schedule?.startDate ? (
                    <p className="text-xs text-gray-500 mt-0.5">Start: {course.schedule.startDate}</p>
                  ) : (
                    <p className="text-xs text-gray-500 mt-0.5">Self-paced</p>
                  )}
                </div>
              </div>
            )}

            {course.glance?.find((g: any) => g.label === 'Teaching Hours')?.value && course.glance.find((g: any) => g.label === 'Teaching Hours').value !== "Self-paced" && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-center shadow-sm">
                <div className="text-gray-500 p-1"><Clock size={28} strokeWidth={1.5} /></div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Live & Recorded</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Interactive sessions</p>
                </div>
              </div>
            )}

            {course.hasCertificate && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-center shadow-sm">
                <div className="text-gray-500 p-1">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="12" cy="10" r="3" />
                    <path d="M12 13v4" />
                    <path d="M9 17h6" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Certificate</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Shareable certificate</p>
                </div>
              </div>
            )}

            {course.hasLifetimeAccess && (
              <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 items-center shadow-sm">
                <div className="text-gray-500 p-1"><Infinity size={28} strokeWidth={1.5} /></div>
                <div>
                  <h4 className="font-bold text-sm text-[#0B1B3D]">Lifetime Access</h4>
                  <p className="text-xs text-gray-500 mt-0.5">Learn at your own pace</p>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

function TestSeriesLayout({ course }: { course: typeof TEST_SERIES }) {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div className="space-y-10">

      {/* ── BREADCRUMBS ── */}
      <div className="text-sm text-[#122340]/60">
        <Link href="/" className="hover:text-[#122340]">Academy</Link> <span className="mx-2">/</span>
        <Link href="/courses" className="hover:text-[#122340]">Courses</Link> <span className="mx-2">/</span>
        <span className="text-[#122340] font-medium">Judiciary Preparation</span>
      </div>

      {/* ── HERO BANNER ── */}
      <div className="bg-white border border-[#122340]/10 rounded-xl p-6 sm:p-10 flex flex-col md:flex-row gap-10 shadow-sm">
        {/* Cover Image */}
        <div className="w-full md:w-1/3 shrink-0">
          <img src={course.image} alt={course.title} className="w-full h-auto rounded-lg shadow-md border border-[#122340]/5 object-cover" />
        </div>

        {/* Details */}
        <div className="w-full md:w-2/3 flex flex-col justify-center">
          <h1 className="text-3xl font-extrabold text-[#122340] mb-4 leading-snug">{course.title}</h1>
          <div className="space-y-2 mb-8 text-sm text-[#122340]/70">
            <p><span className="font-medium text-[#122340]">Instructor:</span> {course.instructor}</p>
            <p><span className="font-medium text-[#122340]">Language:</span> {course.language}</p>
            <p><span className="font-medium text-[#122340]">Validity Period:</span> {course.validity}</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-6 mt-auto">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#C9A227]">{course.price}</span>
              <span className="text-xs text-[#122340]/50 uppercase tracking-widest font-semibold">Including 18% GST</span>
            </div>
            <button className="bg-[#122340] text-white px-8 py-3.5 rounded-lg font-bold hover:bg-[#0a1628] transition-colors shadow-md text-sm whitespace-nowrap">
              Buy now for {course.price}
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM TWO COLUMNS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

        {/* Left Col (Tabs & Content) */}
        <div className="lg:col-span-3">

          {/* Tabs */}
          <div className="flex border-b border-[#122340]/10 mb-8 overflow-x-auto">
            {['Description', 'Course Content', 'How to Use'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase())}
                className={`px-8 py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.toLowerCase() ? 'border-[#C9A227] text-[#C9A227]' : 'border-transparent text-[#122340]/60 hover:text-[#122340]'}`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white p-8 rounded-xl border border-[#122340]/10 shadow-sm text-[#122340]/80 leading-relaxed text-sm">
            {activeTab === 'description' && (
              <div dangerouslySetInnerHTML={{ __html: course.description }} className="prose prose-sm max-w-none text-[#122340]/80 prose-headings:text-[#122340]" />
            )}
            {activeTab === 'course content' && (
              <p>Course content index goes here.</p>
            )}
            {activeTab === 'how to use' && (
              <p>Instructions on how to access and take the tests.</p>
            )}
          </div>
        </div>

        {/* Right Col (Other Courses) */}
        <div className="lg:col-span-1 space-y-6">
          <h3 className="font-bold text-[#122340] border-b border-[#122340]/10 pb-2">Other Courses</h3>

          <div className="flex flex-col gap-4">
            {course.otherCourses.map((oc) => (
              <div key={oc.id} className="bg-white rounded-lg border border-[#122340]/10 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <img src={oc.img} alt={oc.title} className="w-full h-24 object-cover border-b border-[#122340]/5" />
                <div className="p-3">
                  <h4 className="font-bold text-xs text-[#122340] mb-2 leading-tight">{oc.title}</h4>
                  <p className="text-[#122340]/60 text-[10px] mb-2">Sajjad Husain Legal Academy</p>
                  <p className="font-bold text-[#C9A227] text-sm">{oc.price}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Skeleton Loader Component ─────────────────────────────────────

function CourseSkeletonLayout() {
  return (
    <div className="max-w-[1200px] mx-auto py-8">
      {/* ── BREADCRUMB ── */}
      <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-6"></div>

      {/* ── MAIN CONTENT GRID ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-6 lg:space-y-8">

          {/* Header Info */}
          <div>
            <div className="flex gap-2 mb-4">
              <div className="w-20 h-6 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-6 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="w-3/4 h-10 bg-gray-200 rounded animate-pulse mb-3"></div>
            <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-4"></div>

            <div className="flex items-center gap-6 mb-6">
              <div className="w-32 h-5 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>

            <div className="flex items-center gap-6 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div>
                  <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Batch Schedule */}
          <div className="border border-gray-100 rounded-2xl p-6 bg-gray-50 animate-pulse">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
              <div className="w-48 h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1.3fr] gap-6">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="w-16 h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="w-24 h-3 bg-gray-200 rounded mb-2"></div>
                    <div className="w-40 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-200 rounded-xl p-5 h-24"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50 animate-pulse h-48"></div>
            <div className="border border-gray-100 rounded-xl p-6 bg-gray-50 animate-pulse h-48"></div>
          </div>
          <div className="border border-gray-100 rounded-xl p-6 bg-gray-50 animate-pulse h-32"></div>
          <div className="border border-gray-100 rounded-xl p-6 bg-gray-50 animate-pulse h-64"></div>
        </div>

        {/* ── RIGHT COLUMN (Sticky Card) ── */}
        <div>
          <div className="sticky top-24 space-y-6 pt-0">
            <div className="border border-gray-100 rounded-2xl overflow-hidden bg-gray-50 shadow-sm animate-pulse h-[400px]"></div>
            <div className="grid gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-5 h-20 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ─────────────────────────────────────────

export default function CourseDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = React.use(params);
  const slug = resolvedParams.slug?.toLowerCase() || '';

  const dispatch = useAppDispatch();
  const { currentCourse, isLoading, error } = useAppSelector((state) => state.course);
  const { user } = useAppSelector((state) => state.auth);
  const { myEnrollments } = useAppSelector((state) => state.enrollments);

  useEffect(() => {
    if (slug) {
      dispatch(fetchCourseById(slug));
    }
    
    // Fetch enrollments if user is logged in and they haven't been fetched yet
    if (user && (!myEnrollments || myEnrollments.length === 0)) {
      dispatch(fetchMyEnrollments());
    }

    return () => {
      dispatch(clearCurrentCourse());
    };
  }, [dispatch, slug, user]);

  if (isLoading || (!currentCourse && !error)) {
    return (
      <div className="bg-[#fcfcfa] min-h-screen font-sans pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <CourseSkeletonLayout />
      </div>
    );
  }

  if (error || !currentCourse) {
    return (
      <div className="bg-[#fcfcfa] min-h-screen font-sans pt-32 pb-20 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Course not found</h2>
        <p className="text-gray-500 mb-6">{error || "The course you are looking for does not exist."}</p>
        <Link href="/courses">
          <button className="bg-[#C9A227] text-white px-6 py-2.5 rounded hover:bg-[#b39022] transition-colors">
            Browse All Courses
          </button>
        </Link>
      </div>
    );
  }

  // Map backend Course entity to the VideoCourseLayout format
  // Fallbacks are provided for fields that might be missing from the backend yet
  const mappedCourse = {
    id: currentCourse.id,
    slug: currentCourse.slug,
    type: "video",
    title: currentCourse.title || "",
    subtitle: currentCourse.subtitle || currentCourse.description?.substring(0, 100),
    instructors: (currentCourse.instructors && currentCourse.instructors.length > 0) ? currentCourse.instructors : [],
    price: currentCourse.price ? `₹${currentCourse.price}` : null,
    originalPrice: null,
    image: currentCourse.thumbnailUrl || "",
    tags: currentCourse.tags?.length ? currentCourse.tags : [currentCourse.level, currentCourse.category].filter(Boolean),
    schedule: (currentCourse.startDate || currentCourse.endDate || currentCourse.timings) ? {
      startDate: currentCourse.startDate,
      endDate: currentCourse.endDate,
      timings: currentCourse.timings,
      note: currentCourse.scheduleNote
    } : null,
    whoShouldEnrol: currentCourse.targetAudience?.length ? currentCourse.targetAudience : [],
    whatYouWillLearn: currentCourse.whatYouWillLearn?.length ? currentCourse.whatYouWillLearn : [],
    modules: (() => {
      if (!currentCourse.modules?.length) return [];

      const moduleMap = new Map();
      currentCourse.modules.forEach((m: any) => {
        moduleMap.set(m.id, {
          ...m,
          subModules: [],
          lectures: m.items?.length || 0,
          duration: m.duration || null,
          items: m.items?.map((item: any) => ({ title: item.title, type: item.type })) || []
        });
      });

      const rootModules: any[] = [];
      currentCourse.modules.forEach((m: any) => {
        const mod = moduleMap.get(m.id);
        if (m.parentId) {
          const parent = moduleMap.get(m.parentId);
          if (parent) {
            parent.subModules.push(mod);
            parent.lectures += mod.lectures; // Aggregate lectures count
          } else {
            rootModules.push(mod);
          }
        } else {
          rootModules.push(mod);
        }
      });

      // Sort subModules and rootModules by orderIndex
      rootModules.forEach(rm => {
        rm.subModules.sort((a: any, b: any) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });
      return rootModules.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    })(),
    features: currentCourse.features?.length ? currentCourse.features : [],
    inclusions: currentCourse.inclusions?.length ? currentCourse.inclusions : [],
    hasCertificate: currentCourse.hasCertificate || false,
    hasLifetimeAccess: currentCourse.hasLifetimeAccess || false,
    glance: [
      { label: "Teaching Hours", value: currentCourse.teachingHours || currentCourse.duration || "Self-paced" },
      { label: "Language", value: currentCourse.language || "English" },
      { label: "Level", value: currentCourse.level || "All Levels" },
    ],
    faqs: currentCourse.faqs || []
  };

  return (
    <div className="bg-[#fcfcfa] min-h-screen font-sans pt-4 pb-20">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <VideoCourseLayout course={mappedCourse as any} />
      </div>
    </div>
  );
}
