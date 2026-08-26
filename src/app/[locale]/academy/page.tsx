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
  Loader2
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchAllCourses } from '@/data/features/academy/course/courseThunks';

const COURSES = [
  {
    id: 1,
    title: "Certificate Course in Legal Research & Writing",
    desc: "Build strong research and writing skills for academic and professional success.",
    duration: "4 Weeks",
    mode: "Online",
    price: "₹4,999",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 2,
    title: "Diploma in Corporate Law",
    desc: "Understand corporate laws and regulations with practical insights.",
    duration: "3 Months",
    mode: "Online",
    price: "₹14,999",
    image: "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: 3,
    title: "Certificate Course in Contract Drafting",
    desc: "Learn to draft effective and enforceable contracts with confidence.",
    duration: "4 Weeks",
    mode: "Online",
    price: "₹4,999",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
  }
];

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
  const dispatch = useAppDispatch();
  const { courses, isLoading } = useAppSelector((state) => state.course);

  React.useEffect(() => {
    dispatch(fetchAllCourses());
  }, [dispatch]);

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  return (
    <div className="bg-white min-h-screen font-sans overflow-x-hidden">

      {/* ─────────────────────────────────────────────────────────────
          HERO SECTION
      ────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#FAFAFA] pt-10 pb-20 lg:pt-12 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Left Content */}
            <div className="w-full lg:w-[45%] pr-0 lg:pr-8 z-10">
              <p className="text-[#C9A227] font-bold text-[9px] tracking-widest uppercase mb-3">
                Empowering Future Legal Professionals
              </p>
              <h1 className="text-3xl lg:text-4xl xl:text-[42px] font-serif font-bold text-[#111827] leading-[1.15] mb-4">
                Achieve Legal Excellence with Sajjad Husain Legal Academy
              </h1>
              <p className="text-gray-600 mb-6 text-xs lg:text-sm leading-relaxed max-w-sm">
                Practical learning, expert mentorship, and real-world exposure to build a successful legal career.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/courses">
                  <button className="bg-[#C9A227] text-white px-6 py-2.5 rounded text-xs font-medium hover:bg-[#b39022] transition-colors w-full sm:w-auto shadow-sm">
                    Explore Courses
                  </button>
                </Link>
                <Link href="/courses/1">
                  <button className="bg-white text-gray-700 border border-gray-300 px-6 py-2.5 rounded text-xs font-medium hover:bg-gray-50 transition-colors w-full sm:w-auto">
                    Explore Internships
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Image Mask */}
            <div className="hidden lg:block w-[55%] absolute right-0 top-0 bottom-0">
              <div className="relative w-full h-full rounded-l-[12rem] overflow-hidden ml-4 shadow-inner">
                <Image
                  src="/academy-hero.jpg"
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
        <div className="absolute bottom-0 left-0 right-0 z-20 translate-y-1/2 px-4 sm:px-6 lg:px-8">
          <div className="max-w-[1100px] mx-auto bg-[#0a1628] rounded-xl shadow-2xl p-4 lg:p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 divide-x-0 lg:divide-x divide-white/10">

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
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
        <div className="flex flex-col sm:flex-row justify-between items-end mb-8 gap-4">
          <div>
            <p className="text-[#C9A227] font-bold text-[10px] uppercase tracking-widest mb-1.5">Our Courses</p>
            <h2 className="text-2xl md:text-[32px] font-serif font-bold text-gray-900 leading-tight">Learn. Practice. Excel.</h2>
          </div>
          <Link href="/courses">
            <button className="border border-gray-300 text-gray-700 px-5 py-2 rounded text-xs font-medium hover:bg-gray-50 transition-colors">
              View All Courses
            </button>
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#C9A227]" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.filter(c => c.status === 'published' && c.slug).slice(0, 3).map(course => (
              <Link href={`/courses/${course.slug}`} key={course.id} className="block group">
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:border-[#C9A227] transition-colors duration-300 flex flex-col h-full">
                  <div className="h-40 relative overflow-hidden bg-gray-100">
                    {course.thumbnailUrl ? (
                      <Image src={course.thumbnailUrl} alt={course.title} layout="fill" objectFit="cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300"><BookOpen size={32} /></div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-serif font-bold text-[15px] text-gray-900 mb-2 leading-tight group-hover:text-[#C9A227] transition-colors line-clamp-2">{course.title}</h3>
                    <p className="text-gray-500 text-xs mb-5 flex-grow leading-relaxed line-clamp-3">{course.subtitle || 'Learn from expert legal professionals with practical insights.'}</p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                      <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500">
                        <span>{course.level || 'Beginner'}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                        <span>{course.category || 'Online'}</span>
                      </div>
                      <span className="font-bold text-[#C9A227] text-sm">{course.price ? `₹${course.price}` : 'Free'}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
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

            <div className="w-full lg:w-[55%] bg-[#FAFAFA] rounded-xl p-8 lg:p-12 border border-gray-100/50">
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
      <section className="py-16 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-end mb-10 gap-4">
            <div>
              <p className="text-[#C9A227] font-bold text-[10px] uppercase tracking-widest mb-1.5">Internship Opportunities</p>
              <h2 className="text-2xl md:text-[32px] font-serif font-bold text-gray-900 mb-2 leading-tight">Gain Real-World Experience</h2>
              <p className="text-gray-600 text-sm max-w-lg leading-relaxed">
                Our internship programs are designed to provide practical exposure and mentorship from legal experts.
              </p>
            </div>
            <Link href="/courses/1">
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
                  <Link href="/courses/1" className="text-xs font-bold text-gray-900 flex items-center gap-1 group-hover:text-[#C9A227] transition-colors">
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
          <div className="bg-[#FAFAFA] rounded-xl border border-gray-100 p-8 flex flex-col md:flex-row items-center justify-between shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left mb-6 md:mb-0">
              <div className="w-12 h-12 rounded-full border border-[#C9A227] flex items-center justify-center flex-shrink-0 bg-white">
                <Image src="/logo-gold.png" alt="Logo" width={24} height={24} className="object-contain" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-xl text-gray-900 mb-1">Ready to Start Your Legal Journey?</h3>
                <p className="text-gray-500 text-xs">Join Sajjad Husain Legal Academy and take the first step towards a successful legal career.</p>
              </div>
            </div>
            <Link href="/courses">
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
