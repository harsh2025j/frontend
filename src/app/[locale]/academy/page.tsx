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
  Heart
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
      <section className="relative bg-[color:var(--sa-cream)] pt-6 sm:pt-12 pb-8 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mobile Hero */}
          <div className="flex justify-between items-start sm:hidden mb-6">
            <div className="w-[60%] pt-2 z-10 pr-2">
              <p className="text-[#C9A227] font-bold text-[8px] tracking-widest uppercase mb-2">Empowering Future Legal Professionals</p>
              <h1 className="text-[26px] font-serif font-bold text-[#111827] leading-[1.15] mb-3">
                Achieve Legal Excellence with Sajjad Husain Legal Academy
              </h1>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Practical learning, expert mentorship, and real-world exposure to build a successful legal career.
              </p>
            </div>
            <div className="w-[45%] absolute right-[-1rem] top-0 h-[220px]">
              <div className="w-full h-full relative rounded-l-full overflow-hidden shadow-inner">
                <Image src="/academy-hero.png" alt="Students" layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:hidden relative z-10 w-full mb-6">
            <Link href="/courses" className="w-full">
              <button className="w-full bg-[#C9A227] text-white py-3.5 rounded text-[13px] font-bold shadow-sm hover:bg-[#b39022] transition-colors">Explore Courses</button>
            </Link>
            <Link href="#internships" className="w-full">
              <button className="w-full bg-transparent border border-gray-400 text-gray-700 py-3.5 rounded text-[13px] font-bold hover:bg-white hover:border-gray-300 transition-colors">Explore Internships</button>
            </Link>
          </div>

          {/* Desktop Hero */}
          <div className="hidden sm:flex flex-row items-center justify-between">
            {/* Left Content */}
            <div className="w-[45%] pr-8 z-10">
              <p className="text-[#C9A227] font-bold text-[9px] tracking-widest uppercase mb-3">
                Empowering Future Legal Professionals
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-serif font-bold text-[#111827] leading-[1.15] mb-4">
                Achieve Legal Excellence with Sajjad Husain Legal Academy
              </h1>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-sm">
                Practical learning, expert mentorship, and real-world exposure to build a successful legal career.
              </p>
              <div className="flex flex-row gap-3">
                <Link href="/courses">
                  <button className="bg-[#C9A227] text-white px-6 py-2.5 rounded text-xs font-medium hover:bg-[#b39022] transition-colors shadow-sm">
                    Explore Courses
                  </button>
                </Link>
                <Link href="#internships">
                  <button className="bg-white text-gray-700 border border-gray-300 px-6 py-2.5 rounded text-xs font-medium hover:bg-gray-50 transition-colors">
                    Explore Internships
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Image Mask */}
            <div className="w-[55%] absolute right-0 top-0 bottom-0">
              <div className="relative w-full h-full rounded-l-[12rem] overflow-hidden ml-4 shadow-inner">
                <Image
                  src="/academy-hero.png"
                  alt="Legal Academy Students"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-l-[12rem]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Floating Features Bar */}
        <div className="relative md:absolute md:bottom-0 left-0 right-0 z-20 md:translate-y-1/2 px-4 sm:px-6 md:px-8 mt-2 md:mt-0">
          <div className="max-w-[1100px] mx-auto bg-[#0a1628] rounded-xl shadow-2xl p-5 lg:p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-6 gap-y-8 divide-x-0 md:divide-x divide-white/10">

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center">
                    <GraduationCap className="text-white" size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px]">Expert Faculty</h3>
                </div>
                <p className="text-blue-200 text-[11px] leading-relaxed">
                  Learn from experienced legal professionals and academicians.
                </p>
              </div>

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center">
                    <BookOpen className="text-white" size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px]">Practical Learning</h3>
                </div>
                <p className="text-blue-200 text-[11px] leading-relaxed">
                  Case studies, moot courts & real-world legal exposure.
                </p>
              </div>

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center">
                    <Briefcase className="text-white" size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px]">Career Focused</h3>
                </div>
                <p className="text-blue-200 text-[11px] leading-relaxed">
                  Internships and placement support for career growth.
                </p>
              </div>

              <div className="flex flex-col items-start px-2 lg:px-4">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="w-8 h-8 rounded border border-white/20 flex items-center justify-center">
                    <ShieldCheck className="text-white" size={16} />
                  </div>
                  <h3 className="text-white font-bold text-[13px]">Trusted by Students</h3>
                </div>
                <p className="text-blue-200 text-[11px] leading-relaxed">
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
      <section className="py-10 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-10 md:mt-28 lg:mt-28">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <p className="text-[#C9A227] font-bold text-[10px] uppercase tracking-widest mb-1.5">Our Courses</p>
            <h2 className="text-2xl md:text-[32px] font-serif font-bold text-gray-900 leading-tight">Learn. Practice. Excel.</h2>
          </div>
          <Link href="/courses">
            <button className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-xs font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto">
              View All Courses
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
          <div className="bg-white rounded-xl border border-dashed border-gray-200 p-12 text-center shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#122340]/5 flex items-center justify-center mx-auto mb-3 text-[#C9A227]">
              <BookOpen size={24} />
            </div>
            <h3 className="text-base font-serif font-bold text-gray-900 mb-1">No Courses Available Yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
              We are preparing new comprehensive legal courses. Check back soon or browse our full catalogue.
            </p>
            <Link href="/courses">
              <button className="bg-[#122340] text-white px-5 py-2 rounded text-xs font-medium hover:bg-[#0a1628] transition-colors">
                Browse Courses
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
                  <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:border-[#C9A227] transition-colors duration-300 flex flex-col h-full items-stretch">
                    <div className="relative w-full aspect-video shrink-0 overflow-hidden bg-gray-100 block">
                      {course.thumbnailUrl ? (
                        <Image src={course.thumbnailUrl} alt={course.title} layout="fill" objectFit="cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={32} /></div>
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
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition text-gray-400 hover:text-red-500 z-10"
                        aria-label="Wishlist course"
                      >
                        <Heart
                          size={15}
                          className={isInWishlist(course.slug) ? "fill-red-500 text-red-500" : ""}
                        />
                      </button>
                    </div>

                    <div className="p-3 md:p-5 flex flex-col flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className="font-serif font-bold text-[14px] md:text-[15px] text-gray-900 mb-1.5 md:mb-2 leading-tight group-hover:text-[#C9A227] transition-colors line-clamp-2 pr-2">{course.title}</h3>
                        {isRecent && (
                          <span className="hidden md:inline-block bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded ml-1 shrink-0">New</span>
                        )}
                      </div>
                      <p className="text-gray-500 text-[11px] md:text-xs mb-2 md:mb-3 leading-relaxed line-clamp-2 md:line-clamp-2">{course.subtitle || 'Learn from expert legal professionals with practical insights.'}</p>

                      {/* Course Rating & Review Count */}
                      <div className="flex items-center gap-1.5 mb-3 text-xs">
                        {reviewsCount > 0 ? (
                          <>
                            <div className="flex items-center text-[#C9A227]">
                              <Star size={13} className="fill-[#C9A227] text-[#C9A227]" />
                              <span className="font-bold ml-1 text-slate-800">
                                {avgScore.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px]">
                              ({reviewsCount} {reviewsCount === 1 ? "review" : "reviews"})
                            </span>
                          </>
                        ) : (
                          <div className="flex items-center text-slate-400 text-[11px]">
                            <Star size={12} className="text-slate-300 mr-1" />
                            <span>New (0 reviews)</span>
                          </div>
                        )}
                      </div>

                      <div className="md:border-t border-gray-100 md:pt-3 mt-auto">
                        <div className="flex flex-wrap items-center gap-1.5 text-[10px] md:text-[11px] font-medium text-gray-400 md:text-gray-500 mb-1 md:mb-2">
                          <span>{course.level || 'Beginner'}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                          <span>{course.category || 'Online'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-[#C9A227] text-[13px] md:text-sm">
                              {course.price ? `₹${course.price}` : 'Free'}
                            </span>
                            {course.originalPrice && (
                              <span className="text-gray-400 line-through text-[10px] md:text-xs font-medium">
                                ₹{course.originalPrice}
                              </span>
                            )}
                          </div>
                          {course.originalPrice && Number(course.originalPrice) > Number(course.price) && (
                            <span className="hidden sm:inline-block text-[9px] md:text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full">
                              {Math.round(((Number(course.originalPrice) - Number(course.price)) / Number(course.originalPrice)) * 100)}% OFF
                            </span>
                          )}
                          <ChevronRight size={14} className="text-gray-300 md:hidden ml-auto" />
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
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

            <div className="w-full lg:w-[45%]">
              <p className="text-[#C9A227] font-bold text-[10px] uppercase tracking-widest mb-1.5">Why Choose Us</p>
              <h2 className="text-2xl md:text-[32px] font-serif font-bold text-gray-900 mb-4 leading-tight">Shaping Legal Minds for Tomorrow</h2>
              <p className="text-gray-600 mb-6 text-sm leading-relaxed max-w-sm">
                We are committed to delivering quality legal education with practical exposure and ethical values to create competent legal professionals.
              </p>
              <Link href="/about">
                <button className="bg-[#122340] text-white px-5 py-2.5 rounded text-xs font-medium hover:bg-[#0a1628] transition-colors shadow-sm">
                  Know More About Us
                </button>
              </Link>
            </div>

            <div className="w-full lg:w-[55%] bg-[color:var(--sa-cream)] rounded-xl p-8 lg:p-12 border border-gray-100/50">
              <div className="grid grid-cols-2 gap-y-10 gap-x-6 text-center">

                <div className="flex flex-col items-center">
                  <Users className="text-[#C9A227] mb-3" size={28} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-3xl text-gray-900 mb-1">500+</span>
                  <span className="text-gray-500 text-xs font-medium">Students Enrolled</span>
                </div>

                <div className="flex flex-col items-center">
                  <Award className="text-[#C9A227] mb-3" size={28} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-3xl text-gray-900 mb-1">20+</span>
                  <span className="text-gray-500 text-xs font-medium">Expert Faculty</span>
                </div>

                <div className="flex flex-col items-center">
                  <BookOpen className="text-[#C9A227] mb-3" size={28} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-3xl text-gray-900 mb-1">50+</span>
                  <span className="text-gray-500 text-xs font-medium">Courses & Programs</span>
                </div>

                <div className="flex flex-col items-center">
                  <Briefcase className="text-[#C9A227] mb-3" size={28} strokeWidth={1.5} />
                  <span className="font-serif font-bold text-3xl text-gray-900 mb-1">100+</span>
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
      <section id="internships" className="py-16 bg-[color:var(--sa-cream)] scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <p className="text-[#C9A227] font-bold text-[10px] uppercase tracking-widest mb-1.5">Internship Opportunities</p>
              <h2 className="text-2xl md:text-[32px] font-serif font-bold text-gray-900 mb-2 leading-tight">Gain Real-World Experience</h2>
              <p className="text-gray-600 text-sm max-w-lg leading-relaxed">
                Our internship programs are designed to provide practical exposure and mentorship from legal experts.
              </p>
            </div>
            <Link href="/auth/signup">
              <button className="border border-gray-300 bg-white text-gray-700 px-5 py-2 rounded text-xs font-medium hover:bg-gray-50 transition-colors">
                View All Internships
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {INTERNSHIPS.map(internship => (
              <div key={internship.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow group flex items-start gap-4">
                <div className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center flex-shrink-0 bg-gray-50">
                  {internship.icon}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-gray-900 text-[15px] mb-1.5">{internship.title}</h3>
                  <p className="text-gray-500 text-xs mb-4 leading-relaxed pr-2">{internship.desc}</p>
                  <Link href="/auth/signup" className="text-xs font-bold text-gray-900 flex items-center gap-1 group-hover:text-[#C9A227] transition-colors">
                    Apply Now <ArrowRight size={14} />
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
      <section className="py-10 md:py-12 bg-[#0a1628] relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute right-0 top-0 bottom-0 w-[60%] lg:w-1/2 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a1628] via-[#0a1628]/80 to-transparent z-10" />
          <Image
            src="/scale-bg-2.png"
            alt="Scale of Justice"
            layout="fill"
            objectFit="cover"
            className="object-right"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
          <p className="text-[#C9A227] font-bold text-[10px] uppercase tracking-widest mb-1.5">Testimonials</p>
          <h2 className="text-2xl md:text-[32px] font-serif font-bold text-white mb-6">What Our Students Say</h2>

          <div className="bg-[#0a1628]/40 border border-white/20 rounded-xl p-5 md:p-6 relative max-w-3xl backdrop-blur-md">

            <div className="flex gap-4 min-h-[140px]">
              <div className="flex-shrink-0 pt-1">
                <svg className="w-8 h-8 text-[#C9A227]/60" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>

              <div className="pt-1 flex flex-col justify-between">
                <p className="text-gray-300 text-sm md:text-[14px] leading-relaxed mb-4 font-light max-w-xl">
                  {TESTIMONIALS[activeTestimonial].quote}"
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <img
                    src={TESTIMONIALS[activeTestimonial].image}
                    alt={TESTIMONIALS[activeTestimonial].name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#C9A227]"
                  />
                  <div>
                    <h4 className="text-white font-semibold text-[13px]">{TESTIMONIALS[activeTestimonial].name}</h4>
                    <p className="text-gray-400 text-[11px]">{TESTIMONIALS[activeTestimonial].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Arrows */}
            <div
              onClick={prevTestimonial}
              className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors bg-[#0a1628] z-20 shadow-sm"
            >
              <ChevronLeft className="text-gray-400" size={14} />
            </div>
            <div
              onClick={nextTestimonial}
              className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors bg-[#0a1628] z-20 shadow-sm"
            >
              <ChevronRight className="text-gray-400" size={14} />
            </div>
          </div>

          <div className="flex gap-2.5 mt-4 max-w-3xl justify-center ml-0 md:ml-4">
            {TESTIMONIALS.map((_, index) => (
              <div
                key={index}
                onClick={() => setActiveTestimonial(index)}
                className={`w-2 h-2 rounded-full cursor-pointer transition-colors ${activeTestimonial === index ? 'bg-white' : 'border border-gray-400'}`}
              ></div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          CTA BANNER
      ────────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[color:var(--sa-cream)] rounded-xl border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-full border border-[#C9A227] flex items-center justify-center flex-shrink-0 bg-white">
                <Image src="/logo-gold.png" alt="Logo" width={24} height={24} className="object-contain" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-1">Ready to Start Your Legal Journey?</h3>
                <p className="text-gray-500 text-xs">Join Sajjad Husain Legal Academy and take the first step towards a successful legal career.</p>
              </div>
            </div>
            <Link href="/auth/signup">
              <button className="bg-[#C9A227] text-white px-6 py-2.5 rounded text-xs font-medium hover:bg-[#b39022] transition-colors whitespace-nowrap shadow-sm">
                Apply Now
              </button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
