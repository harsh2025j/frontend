"use client";

import Image from "next/image";
import { Link } from "@/i18n/routing";
import { useDocTitle } from "@/hooks/useDocTitle";
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Building2,
  Scale,
  Clock,
  Briefcase,
  FileText,
  GraduationCap,
} from "lucide-react";
import {
  FaWhatsapp,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
  FaFacebookF,
} from "react-icons/fa6";

const OFFICIAL_MAPS_LINK = "https://maps.app.goo.gl/PQFrHWHK5VCjTLEv7";
const WHATSAPP_URL =
  "https://wa.me/917080909786?text=Hello%20Sajjad%20Husain%20Law%20Associates%2C%20I%20would%20like%20to%20inquire%20about%20a%20legal%20consultation.";

const PRACTICE_AREAS = [
  {
    category: "Constitutional & Writ Jurisdiction",
    description:
      "Writ petitions under Article 226 before the High Court of Judicature at Allahabad and Article 32 before the Supreme Court of India for protection of fundamental rights and review of executive decisions.",
  },
  {
    category: "Criminal Defense & Statutory Quashing",
    description:
      "Regular and anticipatory bail petitions, statutory quashing under Section 482 of the Code of Criminal Procedure and Bharatiya Nagarik Suraksha Sanhita (BNSS 2023), criminal revisions, and trial representation.",
  },
  {
    category: "Supreme Court Appellate Litigation",
    description:
      "Drafting and arguing Special Leave Petitions (SLPs), Civil Appeals, and Criminal Appeals before the Supreme Court of India in New Delhi.",
  },
  {
    category: "Civil Litigation & Property Disputes",
    description:
      "Original suits, Regular First Appeals (RFA), Second Appeals, injunction suits, title disputes, and specific performance of contracts across district and appellate courts.",
  },
  {
    category: "Land & Revenue Board Jurisprudence",
    description:
      "Representation in land tenure, consolidation, ceiling disputes, and compensation claims before the Board of Revenue, Divisional Commissioners, and UP RERA.",
  },
  {
    category: "Commercial Arbitration & Dispute Mediation",
    description:
      "Section 9 interim relief, Section 11 arbitrator appointments, Section 34 arbitral award challenges under the Arbitration and Conciliation Act 1996, and settlements under the Mediation Act 2023.",
  },
  {
    category: "Service Law & Government Inquiries",
    description:
      "Litigation concerning civil servants and public employees, including seniority disputes, departmental inquiries, suspension challenges, and pensions before High Courts and the Central Administrative Tribunal (CAT).",
  },
  {
    category: "Insolvency, Banking & Debt Recovery",
    description:
      "Proceedings before the National Company Law Tribunal (NCLT), National Company Law Appellate Tribunal (NCLAT), Debt Recovery Tribunal (DRT), and under the SARFAESI Act.",
  },
  {
    category: "Public Interest & Human Rights Advocacy",
    description:
      "Public interest litigation (PIL) on governance, environmental accountability, civil liberties, and defense under the Scheduled Castes and Scheduled Tribes (Prevention of Atrocities) Act.",
  },
];

export default function AboutUs() {
  useDocTitle("Who We Are | Sajjad Husain Law Associates");

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans pb-16">
      {/* ── Breadcrumb Bar (LiveLaw Standard) ── */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 font-semibold">
            <Link
              href="/"
              className="hover:text-[#0A2342] hover:underline transition-colors"
            >
              Home
            </Link>
            <span className="text-gray-300 font-normal">/</span>
            <span className="text-[#0A2342] font-bold" aria-current="page">
              Who We Are
            </span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 space-y-12">
        {/* ── Page Header: Real, Direct & Extra Bold ── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-200 pb-6">
            <div className="space-y-2">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#C9A227] font-heading block">
                Chambers of Sajjad Husain &amp; Associates &bull; Est. 2008
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0A2342] font-heading tracking-tight leading-none">
                Who We Are
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-4xl leading-relaxed pt-2">
                Sajjad Husain Law Associates is an Indian law practice based at the High Court of Judicature at Allahabad, Lucknow Bench. The chambers represent individuals, institutions, and businesses in appellate, constitutional, criminal, and commercial litigation.
              </p>
            </div>

            <div className="bg-white border border-gray-300 p-4 sm:p-5 rounded-lg shrink-0 text-left space-y-1 min-w-[240px]">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#C9A227] block">
                Primary Seat of Practice
              </span>
              <p className="text-sm sm:text-base font-bold text-[#0A2342]">
                Chamber No. 515, Block-C
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                High Court Campus, Lucknow
              </p>
            </div>
          </div>
        </div>

        {/* ── Real High Court Photography (No Dark Overlays, Authentic View) ── */}
        <div className="rounded-lg overflow-hidden border border-gray-300 bg-white">
          <div className="relative h-64 sm:h-80 md:h-[420px] w-full bg-gray-100">
            <Image
              src="/high-courts/allahabad.jpg"
              alt="High Court of Judicature at Allahabad, Lucknow Bench"
              fill
              priority
              sizes="(max-width: 1536px) 100vw, 1536px"
              className="object-cover"
            />
          </div>
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="space-y-0.5">
              <span className="font-extrabold text-[#0A2342] block">
                High Court of Judicature at Allahabad &mdash; Lucknow Bench
              </span>
              <span className="text-gray-600 block">
                Advocates Chamber Complex, Block-C, Lucknow &ndash; Ayodhya Road, Gomti Nagar, Lucknow, UP &ndash; 226010
              </span>
            </div>
            <a
              href={OFFICIAL_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-[#0A2342] hover:text-[#C9A227] hover:underline shrink-0"
            >
              <span>View Location on Map</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* ── Editorial Policy & Institutional Commitment (LiveLaw Standard) ── */}
        <div className="bg-[#F8F9FA] rounded-lg border border-gray-300 p-6 sm:p-10 space-y-5">
          <div className="border-b border-gray-200 pb-3">
            <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#C9A227] font-heading block">
              Editorial Policy &amp; Public Legal Access
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0A2342] font-heading mt-1 tracking-tight">
              Constitutional Ideals &amp; Open Legal Information
            </h2>
          </div>

          <div className="text-base sm:text-lg text-gray-800 leading-relaxed space-y-4 font-normal">
            <p>
              The foundational charter of <strong className="font-extrabold text-[#0A2342]">Sajjad Husain Law Associates</strong> is anchored in the ideals of the <strong className="font-extrabold text-[#0A2342]">Constitution of India</strong>: justice, liberty, equality, and the rule of law. A strong and independent judiciary is the foundation of a fair, meaningful, and informed democracy. An independent judiciary, in turn, creates a vibrant constitutional order.
            </p>
            <p>
              In addition to active courtroom practice, the chambers maintain an unpaywalled digital legal resource. Court judgments, cause lists, statutory amendments, and procedural guides should be freely accessible to citizens, advocates, and students. We believe factual, objective legal information is essential to transparency in the administration of justice.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 pt-4 border-t border-gray-200 text-xs sm:text-sm">
            <div className="space-y-1">
              <span className="font-black text-[#0A2342] uppercase tracking-wide block">
                Primary-Source Verification
              </span>
              <p className="text-gray-600 leading-relaxed">
                Case reports and statutory commentary are verified against certified court orders, the Official Gazette, and High Court and Supreme Court Law Reports.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-black text-[#0A2342] uppercase tracking-wide block">
                Bilingual Reporting (English &amp; Hindi)
              </span>
              <p className="text-gray-600 leading-relaxed">
                Legal information in India should not be confined to English. We publish verified case digests in both English and Hindi.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-black text-[#0A2342] uppercase tracking-wide block">
                Bar Council Rules &amp; Privilege
              </span>
              <p className="text-gray-600 leading-relaxed">
                All legal engagements comply strictly with the rules of the Bar Council of India. Client communications are protected under advocate-client privilege.
              </p>
            </div>
          </div>
        </div>

        {/* ── Chamber Practice & Organizational Overview ── */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg border border-gray-300 p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-2 text-[#0A2342]">
              <Scale className="w-5 h-5 text-[#C9A227]" />
              <h3 className="text-lg font-black text-[#0A2342] font-heading">
                Courtroom Advocacy
              </h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Active litigation before the High Court of Judicature at Allahabad (Lucknow and Prayagraj Benches) and the Supreme Court of India. Representation across constitutional writs, quashing petitions, criminal bail, and civil appeals.
            </p>
            <div className="pt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Chamber No. 515, High Court Lucknow
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-300 p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-2 text-[#0A2342]">
              <FileText className="w-5 h-5 text-[#C9A227]" />
              <h3 className="text-lg font-black text-[#0A2342] font-heading">
                Legal Repository &amp; News
              </h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              A public archive of over 50,000 indexed judgments, daily cause list tracking, and unbiased court reporting in English and Hindi. Available to all legal practitioners, litigants, and researchers without paywalls.
            </p>
            <div className="pt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              50,000+ Judgments &bull; Open Access
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-300 p-6 sm:p-7 space-y-3">
            <div className="flex items-center gap-2 text-[#0A2342]">
              <GraduationCap className="w-5 h-5 text-[#C9A227]" />
              <h3 className="text-lg font-black text-[#0A2342] font-heading">
                Sajjad Husain Legal Academy
              </h3>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              Professional education in judicial drafting, practical courtroom procedure, case research, and structured chamber internships for law students at the Lucknow High Court Bench.
            </p>
            <div className="pt-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              Internships &bull; Procedural Courses
            </div>
          </div>
        </div>

        {/* ── Areas of Legal Practice (Clean Editorial Directory) ── */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 sm:p-10 space-y-6">
          <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#C9A227] font-heading block">
                Litigation Portfolio
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0A2342] font-heading mt-1 tracking-tight">
                Areas of Legal Practice
              </h2>
            </div>
            <Link
              href="/contact"
              className="text-xs sm:text-sm font-bold text-[#0A2342] hover:text-[#C9A227] hover:underline flex items-center gap-1.5 transition-colors shrink-0"
            >
              <span>Contact Chamber Registry</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PRACTICE_AREAS.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0A2342] leading-snug">
                  {item.category}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Managing Counsel & Leadership Profile ── */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 sm:p-10">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Full Biography & Practice Profile */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#C9A227] font-heading block">
                  Managing Counsel
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0A2342] font-heading tracking-tight mt-1">
                  Advocate Sajjad Husain
                </h2>
                <p className="text-xs sm:text-sm font-bold text-gray-600 mt-1">
                  Advocate, High Court of Judicature at Allahabad (Lucknow Bench) &bull; Supreme Court of India
                </p>
              </div>

              <div className="text-sm sm:text-base text-gray-700 leading-relaxed space-y-3 font-normal">
                <p>
                  Advocate Sajjad Husain was enrolled with the Bar Council of Uttar Pradesh in 2008. Over more than 16 years of continuous litigation practice, he has briefed and argued hundreds of cases before the High Court of Judicature at Allahabad (both Lucknow and Prayagraj Benches) and regularly appears before the Supreme Court of India.
                </p>
                <p>
                  His courtroom focus includes constitutional writ petitions under Article 226, criminal revisions, quashing of FIRs and charge-sheets under Section 482 CrPC and corresponding BNSS provisions, commercial disputes, and service law appeals.
                </p>
              </div>

              {/* Chamber Inquiries & Contact Block */}
              <div className="pt-4 border-t border-gray-200 grid sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-1">
                  <span className="font-black text-[#C9A227] uppercase tracking-wider block text-[11px]">
                    Seat of Practice
                  </span>
                  <p className="font-bold text-[#0A2342]">
                    Chamber No. 515, Block-C
                  </p>
                  <p className="text-gray-600 text-xs">
                    Advocates Chamber Complex, High Court Campus, Lucknow 226010
                  </p>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5 space-y-1">
                  <span className="font-black text-[#C9A227] uppercase tracking-wider block text-[11px]">
                    Direct Telephone
                  </span>
                  <a href="tel:+917080909786" className="font-bold text-[#0A2342] hover:underline block text-sm">
                    +91 70809 09786
                  </a>
                  <p className="text-gray-600 text-xs">
                    Assistance: 10:00 AM &ndash; 6:00 PM IST
                  </p>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-lg transition-colors shadow-sm"
                >
                  <FaWhatsapp className="w-4 h-4" />
                  <span>WhatsApp Chamber Registry</span>
                </a>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#0A2342] bg-gray-50 hover:bg-[#0A2342] hover:text-white px-5 py-3 rounded-lg transition-colors border border-gray-300"
                >
                  <span>Chamber Appointment</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Real Photograph of Advocate Sajjad Husain */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="w-full max-w-sm rounded-lg overflow-hidden border border-gray-300 bg-white shadow-sm">
                <div className="relative aspect-[4/4.5] w-full bg-gray-100">
                  <Image
                    src="/sajjad-husain-portrait.jpg"
                    alt="Advocate Sajjad Husain - High Court of Judicature at Allahabad"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 420px"
                    className="object-cover object-top"
                  />
                </div>
                <div className="p-4 bg-white border-t border-gray-200 text-center space-y-1">
                  <h3 className="text-base sm:text-lg font-black text-[#0A2342] font-heading">
                    Advocate Sajjad Husain
                  </h3>
                  <p className="text-xs text-gray-600 font-semibold">
                    High Court of Judicature at Allahabad &bull; Supreme Court
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#C9A227] uppercase tracking-wider">
                    <span>Enrolled 2008</span>
                    <span>&bull;</span>
                    <span>Bar Council of Uttar Pradesh</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Chamber Location & Google Maps (LiveLaw Standard) ── */}
        <div className="bg-white rounded-lg p-6 sm:p-10 border border-gray-300 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#0A2342] font-heading flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C9A227]" />
                <span>Chamber Location &mdash; High Court Lucknow Bench</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                Advocates Chamber No. 515, Block-C, High Court Campus, Lucknow &ndash; Ayodhya Road, Gomti Nagar, Lucknow, UP &ndash; 226010
              </p>
            </div>
            <a
              href={OFFICIAL_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A2342] bg-gray-50 hover:bg-[#0A2342] hover:text-white border border-gray-300 px-4 py-2.5 rounded-lg transition-all w-fit shrink-0"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-200 h-72 sm:h-96 w-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.324!2d81.0089797!3d26.8718658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be3a2f9d90d95%3A0xa458c348ad78cb08!2sSajjad%20Husain%20Law%20Associates%20(High%20Court%20Lucknow)!5e0!3m2!1sen!2sin!4v1"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Sajjad Husain Law Associates (High Court Lucknow)"
            />
          </div>
        </div>

        {/* ── Bottom Direct Action Bar ── */}
        <div className="bg-[#0A2342] rounded-lg p-6 sm:p-10 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#C9A227]">
              Legal Counsel &bull; High Court Litigation
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black font-heading text-white">
              Consult with Sajjad Husain Law Associates
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              For case representation, legal advice, or chamber appointments, contact the registry directly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact"
              className="px-6 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#b5901f] text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-colors"
            >
              Contact Chambers
            </Link>
            <a
              href="tel:+917080909786"
              className="px-6 py-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 font-black text-xs sm:text-sm uppercase tracking-wider transition-colors inline-flex items-center gap-2"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>+91 70809 09786</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
