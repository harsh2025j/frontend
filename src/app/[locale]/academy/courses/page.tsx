"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Filter, ChevronLeft, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/data/redux/hooks';
import { fetchAllCourses } from '@/data/features/academy/course/courseThunks';
import { useRouter } from 'next/navigation';

// ── Mock Data for 16 Courses ───────────────────────────────────────────────

const ALL_COURSES = [
  {
    slug: "contract-drafting-live",
    title: "Comprehensive Contract Drafting & Negotiation",
    instructor: "Adv. Priya Mehta",
    price: "₹4,999",
    originalPrice: "₹8,999",
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop",
    category: "Corporate"
  },
  {
    slug: "criminal-law-recorded",
    title: "Core Criminal Law Course Package (BNSS, BNS & BSA)",
    instructor: "Dr. Rajesh Nair",
    price: "₹5,499",
    originalPrice: "₹10,000",
    image: "https://images.unsplash.com/photo-1505664177922-9283892047d6?q=80&w=600&auto=format&fit=crop",
    category: "Criminal Law"
  },
  {
    slug: "bail-jurisprudence-live",
    title: "Bail Jurisprudence: Complete Practice Guide",
    instructor: "Sr. Adv. Vikram Desai",
    price: "₹3,499",
    originalPrice: "₹6,000",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
    category: "Litigation"
  },
  {
    slug: "intellectual-property-test",
    title: "Intellectual Property Rights: Booster Test Series",
    instructor: "Sajjad Husain Legal Academy",
    price: "₹299",
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=600&auto=format&fit=crop",
    category: "IPR"
  },
  {
    slug: "arbitration-discussion",
    title: "Arbitration and Dispute Resolution PYQ Discussion",
    instructor: "Adv. Neha Sharma",
    price: "₹1,999",
    originalPrice: "₹3,000",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=600&auto=format&fit=crop",
    category: "Litigation"
  },
  {
    slug: "family-law-recorded",
    title: "Family Law & Matrimonial Disputes",
    instructor: "Sajjad Husain Legal Academy",
    price: "₹3,999",
    originalPrice: "₹5,500",
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&auto=format&fit=crop",
    category: "Civil Law"
  },
  {
    slug: "cyber-law-live",
    title: "Cyber Law and Data Privacy",
    instructor: "Sanjay Kumar (Cyber Expert)",
    price: "₹4,499",
    originalPrice: "₹8,000",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
    category: "Technology Law"
  },
  {
    slug: "taxation-law-test",
    title: "Taxation Law: Objective Mock Test",
    instructor: "CA. Ramesh Iyer",
    price: "₹199",
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=600&auto=format&fit=crop",
    category: "Corporate"
  },
  {
    slug: "constitutional-law-discussion",
    title: "Constitutional Law: Landmark Judgments Discussion",
    instructor: "Justice (Retd.) K. Singh",
    price: "₹2,499",
    originalPrice: "₹4,000",
    image: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?q=80&w=600&auto=format&fit=crop",
    category: "Constitutional Law"
  },
  {
    slug: "mergers-recorded",
    title: "Mergers & Acquisitions (M&A) Due Diligence",
    instructor: "Sajjad Husain Legal Academy",
    price: "₹8,999",
    originalPrice: "₹15,000",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop",
    category: "Corporate"
  },
  {
    slug: "environmental-law-live",
    title: "Environmental Law & Policy in India",
    instructor: "Adv. R. K. Pachauri",
    price: "₹1,999",
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop",
    category: "Civil Law"
  },
  {
    slug: "labor-law-test",
    title: "Labor Law & Employment Compliance Test Series",
    instructor: "Sajjad Husain Legal Academy",
    price: "₹499",
    originalPrice: "₹1,000",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=600&auto=format&fit=crop",
    category: "Corporate"
  },
  {
    slug: "ibc-live",
    title: "Insolvency and Bankruptcy Code (IBC)",
    instructor: "Adv. Suresh Menon",
    price: "₹5,499",
    originalPrice: "₹9,000",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop",
    category: "Corporate"
  },
  {
    slug: "rera-recorded",
    title: "Real Estate (RERA) Regulations",
    instructor: "Sajjad Husain Legal Academy",
    price: "₹2,999",
    originalPrice: "₹5,000",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=600&auto=format&fit=crop",
    category: "Civil Law"
  },
  {
    slug: "writs-discussion",
    title: "Drafting Writs and PILs Masterclass",
    instructor: "Sr. Adv. Meenakshi Arora",
    price: "₹4,999",
    originalPrice: null,
    image: "https://images.unsplash.com/photo-1589994965851-a8f479c573a9?q=80&w=600&auto=format&fit=crop",
    category: "Litigation"
  },
  {
    slug: "media-law-live",
    title: "Media & Entertainment Law",
    instructor: "Sajjad Husain Legal Academy",
    price: "₹3,999",
    originalPrice: "₹7,000",
    image: "https://images.unsplash.com/photo-1603739903239-8b6e64c3b185?q=80&w=600&auto=format&fit=crop",
    category: "Technology Law"
  }
];

import { courseApi } from '@/data/services/academy-service/course.service';

// ── Component ───────────────────────────────────────────────
export default function CoursesPage() {
  const router = useRouter();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  const [categories, setCategories] = useState<string[]>(["All Categories"]);

  const dispatch = useAppDispatch();
  const { courses, isLoading, error } = useAppSelector((state) => state.course);

  useEffect(() => {
    dispatch(fetchAllCourses());
    
    const fetchCats = async () => {
      try {
        const res = await courseApi.fetchCategories();
        if (res.data && Array.isArray(res.data)) {
          setCategories(["All Categories", ...res.data.map((c: any) => c.name)]);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCats();
  }, [dispatch]);

  const mappedCourses = courses
    .filter(course => course.status === 'published' && course.slug)
    .map(course => ({
      slug: course.slug as string,
      title: course.title,
      instructor: course.instructors?.[0]?.name || "Sajjad Husain Legal Academy",
      price: `₹${course.price}`,
      originalPrice: null,
      image: course.thumbnailUrl || "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=600&auto=format&fit=crop",
      category: course.category || "General"
    }));

  const filteredCourses = mappedCourses.filter(course =>
    selectedCategory === "All Categories" || course.category === selectedCategory
  );

  return (
    <div className="bg-[#fcfcfa] min-h-screen font-sans pt-10 pb-20">

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back Button */}
        <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#122340]/60 hover:text-[#C9A227] mb-8 transition-colors group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        {/* Toolbar: Category Horizontal List */}
        <div className="mb-10 overflow-x-auto hide-scrollbar whitespace-nowrap flex gap-3 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat 
                  ? 'bg-[#C9A227] text-white shadow-md' 
                  : 'bg-white text-[#122340]/70 hover:bg-gray-50 border border-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-[#C9A227]" size={48} />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-[#122340]/50">
            <p>No courses found for this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
            <Link href={`/courses/${course.slug}`} key={course.slug} className="group block">
              <div className="bg-white rounded-lg overflow-hidden shadow-[0_2px_8px_rgb(0,0,0,0.06)] border border-[#122340]/10 flex flex-col h-full hover:border-[#C9A227] transition-colors duration-300">

                {/* Image */}
                <div className="h-44 relative overflow-hidden bg-[#122340]/5">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  {course.category === 'Criminal Law' && (
                    <span className="absolute top-2 left-2 bg-[#122340] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                      Package
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-[15px] text-[#122340] mb-2 leading-snug line-clamp-3">
                    {course.title}
                  </h3>

                  <p className="text-[#122340]/60 text-xs mb-4">
                    {course.instructor}
                  </p>

                  <div className="mt-auto pt-4 border-t border-[#122340]/5 flex items-center gap-2">
                    <span className="text-[#C9A227] font-bold text-lg">{course.price}</span>
                    {course.originalPrice && (
                      <span className="text-[#122340]/40 line-through text-xs font-medium">
                        {course.originalPrice}
                      </span>
                    )}
                  </div>
                </div>

              </div>
            </Link>
          ))}
          </div>
        )}

      </div>
    </div>
  );
}
