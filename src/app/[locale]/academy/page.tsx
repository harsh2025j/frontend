"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  GraduationCap,
  Briefcase,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Scale,
  Users,
  Award,
  Star,
  Heart,
  FileText,
  Landmark,
  Compass,
  Quote
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchAllCourses } from '@/data/features/academy/course/courseThunks';
import { useWishlist } from '@/context/WishlistContext';

function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="relative w-full aspect-video bg-slate-200/90 shrink-0" />

      {/* Content Skeleton */}
      <div className="p-3 md:p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="space-y-2 mb-2">
          <div className="h-4 bg-slate-200 rounded-md w-5/6" />
          <div className="h-4 bg-slate-200 rounded-md w-3/5" />
        </div>

        {/* Subtitle */}
        <div className="space-y-1.5 mb-3">
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
        </div>

        {/* Rating & Reviews Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-3.5 w-16 bg-slate-200/80 rounded" />
          <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>

        {/* Bottom meta row */}
        <div className="md:border-t border-gray-100 md:pt-3 mt-auto">
          {/* Level / Category pills */}
          <div className="flex items-center gap-2 mb-2">
            <div className="h-3 w-14 bg-slate-100 rounded" />
            <div className="w-1 h-1 rounded-full bg-slate-200" />
            <div className="h-3 w-16 bg-slate-100 rounded" />
          </div>

          {/* Price & Discount */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <div className="h-4 w-14 bg-slate-200 rounded" />
              <div className="h-3 w-10 bg-slate-100 rounded" />
            </div>
            <div className="h-4 w-16 bg-slate-100 rounded-full hidden sm:block" />
          </div>
        </div>
      </div>
    </div>
  );
}

const INTERNSHIPS = [
  {
    id: 1,
    title: "Legal Research Internship",
    desc: "Work on live projects and strengthen research skills.",
    icon: <BookOpen className="text-[#122340]" size={20} />
  },
  {
    id: 2,
    title: "Litigation Internship",
    desc: "Assist in case preparation and court proceedings.",
    icon: <Scale className="text-[#122340]" size={20} />
  },
  {
    id: 3,
    title: "Corporate Law Internship",
    desc: "Explore corporate advisory and compliance work.",
    icon: <Briefcase className="text-[#122340]" size={20} />
  }
];

const TESTIMONIALS = [
  {
    id: 1,
    quote: "The academy provides excellent guidance and practical exposure. The faculty is supportive and the learning experience is outstanding.",
    name: "Ayesha Khan",
    role: "Student, Legal Research Course",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 2,
    quote: "Sajjad Husain Legal Academy transformed my career path. The moot court sessions gave me the exact real-world confidence I needed.",
    name: "Rohan Sharma",
    role: "Alumni, Corporate Law Diploma",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop"
  },
  {
    id: 3,
    quote: "The contract drafting course was phenomenal. I learned nuances of drafting that aren't taught in traditional law schools.",
    name: "Priya Desai",
    role: "Student, Contract Drafting",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
  }
];

export default function AcademyLandingPage() {
  const [activeTestimonial, setActiveTestimonial] = React.useState(0);
  const [isInitialLoading, setIsInitialLoading] = React.useState(true);
  const dispatch = useAppDispatch();
  const { courses, isLoading } = useAppSelector((state) => state.course);
  const { isInWishlist, toggleWishlist } = useWishlist();

  React.useEffect(() => {
    let isMounted = true;
    dispatch(fetchAllCourses()).finally(() => {
      if (isMounted) {
        setIsInitialLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const publishedCourses = React.useMemo(() => {
    return (courses || []).filter((c: any) => c.status === 'published' && c.slug);
  }, [courses]);

  const showSkeleton = isLoading || (isInitialLoading && publishedCourses.length === 0);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="ac-student bg-[color:var(--sa-cream)] min-h-screen font-sans overflow-x-hidden">

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[color:var(--sa-cream)] pt-2 sm:pt-4 lg:pt-5 pb-6 sm:pb-8 md:pb-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Hero */}
          <div className="sm:hidden mb-8">
            <div className="relative mb-6">
              <p className="text-[#C9A227] font-bold text-xs uppercase tracking-widest mb-2.5">
                EMPOWERING FUTURE LEGAL PROFESSIONALS
              </p>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B2242] leading-[1.18] mb-3">
                Achieve Legal Excellence with Sajjad Husain Legal Academy
              </h1>
              <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-5">
                Practical learning, expert mentorship, and real-world exposure to build a successful legal career.
              </p>

              {/* Mobile Hero Image Card */}
              <div className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-lg mb-5">
                <Image
                  src="/academy-hero-study.jpg"
                  alt="Sajjad Husain Legal Academy Study"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="flex flex-col gap-3">
                <Link href="/courses" className="w-full">
                  <button className="w-full bg-[#C9A227] hover:bg-[#b39022] text-white py-3 px-6 rounded-md text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <span>Explore Courses</span>
                    <ArrowRight size={14} />
                  </button>
                </Link>
                <Link href="#internships" className="w-full">
                  <button className="w-full bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 hover:border-[#0B2242] py-3 px-6 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <span>Explore Internships</span>
                    <ArrowRight size={14} className="text-gray-400" />
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Desktop Hero */}
          <div className="hidden sm:flex flex-row items-center justify-between min-h-[440px] lg:min-h-[480px] relative">
            {/* Left Content */}
            <div className="w-[58%] lg:w-[54%] pr-4 sm:pr-6 lg:pr-8 z-10 pt-1 pb-4 sm:pt-2">
              <p className="text-[#C9A227] font-bold text-xs uppercase tracking-widest mb-3">
                EMPOWERING FUTURE LEGAL PROFESSIONALS
              </p>
              <h1 className="text-3xl sm:text-4xl md:text-[44px] lg:text-[50px] xl:text-[54px] font-serif font-bold text-[#0B2242] leading-[1.12] mb-4">
                Achieve Legal Excellence <br className="hidden sm:inline" />with Sajjad Husain Legal Academy
              </h1>
              <p className="text-gray-600 mb-8 text-sm md:text-base lg:text-[17px] leading-relaxed max-w-xl font-normal">
                Practical learning, expert mentorship, and real-world exposure to build a successful legal career.
              </p>
              <div className="flex flex-row items-center gap-4">
                <Link href="/courses">
                  <button className="bg-[#C9A227] hover:bg-[#b39022] text-white px-7 py-3.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer hover:shadow-md">
                    <span>Explore Courses</span>
                    <ArrowRight size={15} />
                  </button>
                </Link>
                <Link href="#internships">
                  <button className="bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 hover:border-[#0B2242] px-7 py-3.5 rounded-lg text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-all cursor-pointer">
                    <span>Explore Internships</span>
                    <ArrowRight size={15} className="text-gray-400" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Image Mask */}
            <div className="w-[48%] lg:w-[50%] absolute right-0 top-0 bottom-0">
              <div className="relative w-full h-full rounded-l-[9rem] sm:rounded-l-[11rem] lg:rounded-l-[14rem] overflow-hidden shadow-xl">
                <Image
                  src="/academy-hero-study.jpg"
                  alt="Sajjad Husain Legal Academy Study"
                  fill
                  className="object-cover rounded-l-[9rem] sm:rounded-l-[11rem] lg:rounded-l-[14rem]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Features Bar */}
        <div className="relative md:absolute md:bottom-0 left-0 right-0 z-30 md:translate-y-1/2 px-4 sm:px-6 lg:px-8 mt-6 md:mt-0">
          <div className="max-w-7xl mx-auto bg-[#0A1A30] rounded-xl shadow-sm p-5 lg:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6 gap-y-8 divide-x-0 md:divide-x divide-white/10">

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                    <GraduationCap size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px] tracking-wide">Expert Faculty</h3>
                </div>
                <p className="text-blue-100/75 text-[11px] leading-relaxed">
                  Learn from experienced legal professionals and academicians.
                </p>
              </div>

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px] tracking-wide">Practical Learning</h3>
                </div>
                <p className="text-blue-100/75 text-[11px] leading-relaxed">
                  Case studies, moot courts & real-world legal exposure.
                </p>
              </div>

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                    <Briefcase size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px] tracking-wide">Career Focused</h3>
                </div>
                <p className="text-blue-100/75 text-[11px] leading-relaxed">
                  Internships and placement support for career growth.
                </p>
              </div>

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                    <ShieldCheck size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px] tracking-wide">Trusted by Students</h3>
                </div>
                <p className="text-blue-100/75 text-[11px] leading-relaxed">
                  A community of driven learners and achievers.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          OUR COURSES
      ────────────────────────────────────────────────────────────── */}
      <section className="pt-4 sm:pt-6 md:pt-20 lg:pt-24 pb-10 lg:pb-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#FDF6E2] text-[#8A6100] border border-[#E8CD82] text-[11px] font-black uppercase tracking-wider mb-2">
              OUR COURSES
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B2242] leading-tight">Learn. Practice. Excel.</h2>
          </div>
          <Link href="/courses">
            <button className="border-2 border-slate-300 bg-white text-[#0B2242] hover:border-[#8A6100] hover:text-[#8A6100] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold hover:bg-slate-50 transition-all inline-flex items-center gap-1.5 shadow-2xs cursor-pointer w-full sm:w-auto justify-center">
              <span>View All Courses</span>
              <ArrowRight size={14} />
            </button>
          </Link>
        </div>

        {showSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((key) => (
              <CourseCardSkeleton key={key} />
            ))}
          </div>
        ) : publishedCourses.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#BFD5EA] p-10 sm:p-14 text-center w-full shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF5E6] border border-[#EADBBD] flex items-center justify-center mx-auto mb-3 text-[#8A6100]">
              <BookOpen size={24} strokeWidth={1.75} />
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#0B2242] mb-1.5">No Courses Available Yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-5 leading-relaxed font-medium">
              We are preparing new comprehensive legal courses. Check back soon or browse our full catalogue.
            </p>
            <Link href="/courses">
              <button className="bg-[#0B2242] hover:bg-[#07172C] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm cursor-pointer">
                <span>Browse Courses</span>
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.slice(0, 3).map((course: any) => {
              const reviewsCount = Number(course.totalReviews || 0);
              const avgScore = Number(course.averageRating || 0);
              const isRecent = Boolean(
                course.isNew ||
                (course.createdAt && (Date.now() - new Date(course.createdAt).getTime()) < 30 * 24 * 60 * 60 * 1000)
              );

              return (
                <Link href={`/courses/${course.slug}`} key={course.id || (course as any)._id || course.slug} className="block group">
                  <div className="bg-white rounded-2xl  border-2 border-slate-200/90 overflow-hidden hover:border-[#B8860B] hover:shadow-sm transition-all duration-300 flex flex-col h-full items-stretch">
                    <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-slate-100 block">
                      {course.thumbnailUrl ? (
                        <Image src={course.thumbnailUrl} alt={course.title} layout="fill" objectFit="cover" className="group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><BookOpen size={32} /></div>
                      )}
                      {course.category && (
                        <span className="absolute top-2.5 left-2.5 bg-[#08172D]/95 backdrop-blur-md text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-white/20 shadow-md">
                          {course.category}
                        </span>
                      )}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist({
                            id: String(course.id || (course as any)._id || course.slug),
                            slug: course.slug,
                            title: course.title,
                            thumbnailUrl: course.thumbnailUrl,
                            price: course.price,
                            originalPrice: course.originalPrice,
                            instructor: course.instructor || course.instructors?.[0]?.name || "Legal Academy",
                          });
                        }}
                        className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/95 hover:bg-white border border-slate-200 shadow-md transition-all text-slate-400 hover:text-red-500 z-10 cursor-pointer"
                        aria-label="Wishlist course"
                      >
                        <Heart
                          size={15}
                          className={isInWishlist(course.slug) ? "fill-red-500 text-red-500" : ""}
                        />
                      </button>
                    </div>

                    <div className="p-4 sm:p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1.5">
                        <h3 className="font-serif font-bold text-base md:text-[17px] text-[#08172D] leading-snug group-hover:text-[#8A6100] transition-colors line-clamp-2 pr-2">
                          {course.title}
                        </h3>
                        {isRecent && (
                          <span className="hidden md:inline-block bg-blue-100 text-blue-800 border border-blue-200 text-[10px] font-black px-2 py-0.5 rounded-md ml-1 shrink-0 uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 font-medium text-xs md:text-[13px] mb-3 leading-relaxed line-clamp-2">
                        {course.subtitle || 'Learn from expert legal professionals with practical insights.'}
                      </p>

                      {/* Course Rating & Review Count */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs">
                        {reviewsCount > 0 ? (
                          <>
                            <div className="flex items-center text-[#D97706]">
                              <Star size={13} className="fill-[#D97706] text-[#D97706]" />
                              <span className="font-black ml-1 text-slate-900">
                                {avgScore.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-slate-600 font-medium text-[11px]">
                              ({reviewsCount} {reviewsCount === 1 ? "review" : "reviews"})
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center text-slate-500 text-[11px] font-medium">
                            <Star size={12} className="text-slate-400 mr-1" />
                            <span>New Course</span>
                          </div>
                        )}
                      </div>

                      <div className="border-t-2 border-slate-100 pt-3 mt-auto">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 mb-2">
                          <span className="text-slate-600">{course.level || 'Beginner'}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8A6100]"></span>
                          <span className="text-[#08172D]">{course.category || 'Online'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-2">
                            <span className="font-black text-[#08172D] text-lg sm:text-xl tracking-tight">
                              {course.price ? `₹${course.price}` : 'Free'}
                            </span>
                            {course.originalPrice && (
                              <span className="text-slate-500 line-through text-xs font-semibold">
                                ₹{course.originalPrice}
                              </span>
                            )}
                          </div>
                          {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                            <span className="inline-block text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                              {Math.round(((Number(course.originalPrice) - Number(course.price)) / Number(course.originalPrice)) * 100)}% OFF
                            </span>
                          )}
                          <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#08172D] flex items-center justify-center transition-colors ml-2">
                            <ChevronRight size={14} className="text-[#08172D] group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─────────────────────────────────────────────────────────────
          WHY CHOOSE US & STATS
      ────────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            <div className="w-full lg:w-[48%]">
              <p className="text-[#C9A227] font-bold text-xs uppercase tracking-widest mb-1.5">WHY CHOOSE US</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B2242] mb-3 leading-snug">Shaping Legal Minds for Tomorrow</h2>
              <p className="text-gray-600 mb-6 text-xs sm:text-sm leading-relaxed max-w-md">
                We are committed to delivering quality legal education with practical exposure and ethical values to create competent legal professionals.
              </p>
              <Link href="/about">
                <button className="bg-[#0B2242] hover:bg-[#07172C] text-white px-5 py-2.5 rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition-all cursor-pointer">
                  <span>Know More About Us</span>
                  <ArrowRight size={14} />
                </button>
              </Link>
            </div>

            <div className="w-full lg:w-[52%] bg-[#FAF7F0] rounded-2xl border border-[#EFE8D8] p-6 sm:p-8 shadow-xs">
              <div className="grid grid-cols-2 divide-x divide-y divide-[#E6DEC8] text-center">

                <div className="flex flex-col items-center pb-6 sm:pb-8 pr-4">
                  <Users className="text-[#C9A227] mb-2" size={26} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-[#0B2242] mb-0.5">500+</span>
                  <span className="text-gray-500 text-xs font-medium">Students Enrolled</span>
                </div>

                <div className="flex flex-col items-center pb-6 sm:pb-8 pl-4">
                  <Award className="text-[#C9A227] mb-2" size={26} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-[#0B2242] mb-0.5">20+</span>
                  <span className="text-gray-500 text-xs font-medium">Expert Faculty</span>
                </div>

                <div className="flex flex-col items-center pt-6 sm:pt-8 pr-4">
                  <BookOpen className="text-[#C9A227] mb-2" size={26} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-[#0B2242] mb-0.5">50+</span>
                  <span className="text-gray-500 text-xs font-medium">Courses & Programs</span>
                </div>

                <div className="flex flex-col items-center pt-6 sm:pt-8 pl-4">
                  <Briefcase className="text-[#C9A227] mb-2" size={26} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-2xl sm:text-3xl text-[#0B2242] mb-0.5">100+</span>
                  <span className="text-gray-500 text-xs font-medium">Internship Opportunities</span>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          INTERNSHIP OPPORTUNITIES
      ────────────────────────────────────────────────────────────── */}
      <section id="internships" className="py-14 sm:py-16 bg-[#F7F3EA] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
            <div>
              <p className="text-[#C9A227] font-bold text-xs uppercase tracking-widest mb-1.5">INTERNSHIP OPPORTUNITIES</p>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B2242] mb-2 leading-tight">Gain Real-World Experience</h2>
              <p className="text-gray-600 text-xs sm:text-sm max-w-lg leading-relaxed">
                Our internship programs are designed to provide practical exposure and mentorship from legal experts.
              </p>
            </div>
            <Link href="/internships">
              <button className="border border-gray-300 bg-white text-gray-700 hover:border-[#0B2242] hover:text-[#0B2242] px-4 py-2 rounded-md text-xs font-semibold hover:bg-white transition-colors inline-flex items-center gap-1.5 shadow-2xs cursor-pointer w-full sm:w-auto justify-center">
                <span>View All Internships</span>
                <ArrowRight size={13} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            {INTERNSHIPS.map(internship => (
              <div key={internship.id} className="bg-white rounded-xl shadow-xs border border-gray-100 p-5 sm:p-6 hover:shadow-md transition-shadow group flex items-start gap-4">
                <div className="w-11 h-11 border border-gray-200/80 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#FAF8F5] text-[#0B2242]">
                  {internship.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-[#0B2242] text-[15px] mb-1.5 leading-snug">{internship.title}</h3>
                  <p className="text-gray-500 text-xs mb-3.5 leading-relaxed pr-1">{internship.desc}</p>
                  <Link href="/auth/signup" className="text-xs font-bold text-[#C9A227] hover:text-[#b39022] inline-flex items-center gap-1 transition-colors">
                    <span>Apply Now</span>
                    <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          TESTIMONIALS
      ────────────────────────────────────────────────────────────── */}
      <section className="py-14 md:py-16 bg-[#0B1F3F] relative overflow-hidden">
        {/* Background Image: Balanced Scales on books on the right */}
        <div className="absolute right-0 top-0 bottom-0 w-[50%] lg:w-[48%] pointer-events-none hidden md:block">
          <Image
            src="/scale-bg-2.png"
            alt="Scale of Justice"
            fill
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F3F] via-[#0B1F3F]/40 to-transparent z-10" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <p className="text-[#C9A227] font-bold text-xs uppercase tracking-widest mb-1.5">TESTIMONIALS</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-6">What Our Students Say</h2>

          <div className="relative bg-[#07172C]/75 border border-white/20 rounded-2xl p-6 sm:p-7 max-w-2xl backdrop-blur-md shadow-xl">
            {/* Navigation Arrows on border */}
            <button
              onClick={prevTestimonial}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors bg-[#0B1F3F] text-gray-300 hover:text-white z-20 shadow-md"
              aria-label="Previous Testimonial"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors bg-[#0B1F3F] text-gray-300 hover:text-white z-20 shadow-md"
              aria-label="Next Testimonial"
            >
              <ChevronRight size={16} />
            </button>

            <div className="flex gap-4 min-h-[120px]">
              <div className="flex-shrink-0 pt-0.5">
                <Quote className="text-[#C9A227] fill-[#C9A227]" size={26} />
              </div>

              <div className="flex flex-col justify-between flex-1">
                <p className="text-gray-200 text-xs sm:text-sm leading-relaxed mb-4 font-light">
                  {TESTIMONIALS[activeTestimonial].quote}
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <img
                    src={TESTIMONIALS[activeTestimonial].image}
                    alt={TESTIMONIALS[activeTestimonial].name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A227] shadow-xs"
                  />
                  <div>
                    <h4 className="text-white font-semibold text-xs sm:text-sm leading-tight">{TESTIMONIALS[activeTestimonial].name}</h4>
                    <p className="text-gray-400 text-[11px] leading-tight mt-0.5">{TESTIMONIALS[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Pagination Dots */}
          <div className="flex gap-2.5 mt-5 max-w-2xl justify-center">
            {TESTIMONIALS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2.5 h-2.5 rounded-full cursor-pointer transition-all ${activeTestimonial === index ? 'bg-white' : 'border border-gray-400/80 bg-transparent'}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CTA BANNER
      ────────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-14 bg-white">
        <div className="max-w-5xl lg:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FAF7F0] rounded-2xl border border-[#E9DFCA] p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 rounded-full border-2 border-[#C9A227] flex items-center justify-center flex-shrink-0 bg-white text-[#C9A227] shadow-2xs">
                <Compass size={24} className="text-[#C9A227]" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg sm:text-xl text-[#0B2242] mb-0.5">Ready to Start Your Legal Journey?</h3>
                <p className="text-gray-500 text-xs sm:text-[13px] leading-relaxed">Join Sajjad Husain Legal Academy and take the first step towards a successful legal career.</p>
              </div>
            </div>
            <Link href="/auth/signup">
              <button className="bg-[#C9A227] hover:bg-[#B38F1E] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 whitespace-nowrap cursor-pointer">
                <span>Apply Now</span>
                <ArrowRight size={14} />
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
