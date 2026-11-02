"use client";

import {
  Scale, Award, Shield, BookOpen, Heart, MapPin, Phone, Mail,
  CheckCircle, ArrowRight, Building2, Cpu, GraduationCap,
  FileText, Languages, Gavel, Newspaper, Search, FilePen,
  Users, Star, Briefcase, Library
} from "lucide-react";
import Link from "next/link";
import { useDocTitle } from "@/hooks/useDocTitle";

const PLATFORM_TOOLS = [
  {
    icon: Search,
    title: "Precedents Research Engine",
    href: "/tools/research",
    desc: "Zero-hallucination semantic search over 50,000+ Supreme Court and High Court judgments with ratio decidendi extraction.",
  },
  {
    icon: FilePen,
    title: "AI Legal Drafting Studio",
    href: "/tools/drafting",
    desc: "Court-ready writ petitions, SLPs, Section 482 applications and legal notices — drafted in 3 structured steps.",
  },
  {
    icon: Scale,
    title: "Mediation & Settlement Desk",
    href: "/tools/mediation",
    desc: "Enforceable settlement term sheets under the Mediation Act 2023 and Order XXIII Rule 3 CPC.",
  },
  {
    icon: FileText,
    title: "Document Health Check",
    href: "/tools/documents",
    desc: "100-point 3-layer risk audit of contracts and pleadings — statutory validity, dispute resolution precision, and commercial risk.",
  },
  {
    icon: Languages,
    title: "Legal Vernacular Translation",
    href: "/tools/translation",
    desc: "OCR-based translation across all 22 Scheduled languages to judicial English, preserving court case and survey numbers.",
  },
];

const PLATFORM_SECTIONS = [
  {
    icon: Gavel,
    title: "Judgments Repository",
    desc: "Search 50,000+ Supreme Court and High Court judgments by case number, diary number, judge name or free-text. Authentic neutral citations, SCR references and full judgment PDFs.",
    href: "/judgments",
  },
  {
    icon: Newspaper,
    title: "Real-Time Legal News",
    desc: "Fact-checked reporting on Supreme Court rulings, High Court orders, Constitutional Bench deliberations, Collegium recommendations and regulatory circulars.",
    href: "/news",
  },
  {
    icon: GraduationCap,
    title: "Legal Academy",
    desc: "Accredited diploma and certificate courses in Legal Research, Judicial Drafting, Corporate Advisory and Litigation Procedure — with internship programmes and cryptographic certificate verification.",
    href: "https://academy.sajjadhusainlawassociates.com/",
    external: true,
  },
  {
    icon: Library,
    title: "Case Status & Cause Lists",
    desc: "Track live case status and daily cause lists across courts. Search by party name, case number or advocate name.",
    href: "/cases",
  },
];

const PRACTICE_AREAS = [
  "Supreme Court Litigation",
  "High Court Litigation — Allahabad (Lucknow & Prayagraj Benches)",
  "Constitutional & Writ Jurisdiction (Art. 226 / Art. 32)",
  "Criminal Law — Bail, Appeals, FIR Quashing",
  "Civil & Property Jurisprudence",
  "Commercial Litigation & Arbitration",
  "Alternative Dispute Resolution (Mediation Act 2023)",
  "Insolvency & Bankruptcy (NCLT / NCLAT)",
  "Service Law & Government Disputes",
  "SC/ST Act & Human Rights",
  "Tax Law",
  "Motor Accident Claims",
];

const VALUES = [
  {
    icon: Shield,
    title: "Integrity",
    desc: "Unwavering commitment to ethical practice and transparency in every matter we handle.",
  },
  {
    icon: Heart,
    title: "Compassion",
    desc: "We understand that legal disputes are deeply personal. Every client is heard with empathy.",
  },
  {
    icon: Award,
    title: "Excellence",
    desc: "Rigorous research, precise drafting, and thorough court preparation on every brief.",
  },
  {
    icon: BookOpen,
    title: "Knowledge",
    desc: "Continuous study of evolving legislation and landmark judgments to stay ahead.",
  },
];

const WHY_US = [
  {
    title: "Open Legal Knowledge Platform",
    description:
      "Anyone can read our judgment summaries, legal news and articles — no subscription, no paywall. We believe legal knowledge should be accessible to every citizen.",
  },
  {
    title: "Open Publishing for Legal Authors",
    description:
      "Legal professionals, law students and researchers can publish their analysis and articles on this platform, building a diverse, authoritative repository of Indian law.",
  },
  {
    title: "AI Tools Built for Indian Courts",
    description:
      "Our five judicial intelligence tools are purpose-built for Indian court rules — Supreme Court Rules 2013, High Court Rules, BNS 2023/BNSS 2023 — not generic legal AI.",
  },
  {
    title: "Bilingual (EN + HI) Platform",
    description:
      "The entire platform operates in both English and Hindi, removing the language barrier that prevents ordinary citizens from understanding their own legal rights.",
  },
  {
    title: "High Court Chamber Access",
    description:
      "The firm's chamber is inside Block-C of the Allahabad High Court, Lucknow Bench — giving clients direct, on-ground access and deep familiarity with court processes.",
  },
  {
    title: "Verified Editorial Standards",
    description:
      "All articles, judgment summaries and legal news are reviewed against official court orders, authentic law reports and gazette notifications before publication.",
  },
];

export default function AboutUs() {
  useDocTitle("About Us | Sajjad Husain Law Associates");

  return (
    <div className="min-h-screen bg-[#f6f6f7]">

      {/* ── Hero ── */}
      <div className="relative bg-gradient-to-r from-[#0A2342] via-[#122340] to-[#0A2342] text-white py-20 lg:py-28 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C9A227] rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#C9A227] text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6">
            <Cpu className="w-4 h-4" />
            Judicial Intelligence &amp; Legal Education
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            Sajjad Husain Law Associates
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-3xl mx-auto">
            India&apos;s premier legal technology platform — combining an active litigation practice
            with AI-powered judicial tools, open legal publishing, a judgments repository and a
            professional legal academy.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-14 space-y-10">

        {/* ── Who We Are ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#0A2342] mb-5 flex items-center gap-2">
            <Scale className="w-6 h-6 text-[#C9A227]" />
            Who We Are
          </h2>
          <div className="prose prose-base text-gray-700 leading-relaxed space-y-4">
            <p>
              Sajjad Husain Law Associates is more than a law firm. Founded by Advocate Sajjad Husain —
              an enrolled advocate practising at the Allahabad High Court, Lucknow Bench since 2008 and
              appearing before the Supreme Court of India and National Commissions — the firm has grown
              into a full judicial technology ecosystem accessible to the public at large.
            </p>
            <p>
              At its core is an open publishing platform: legal professionals, law students, researchers
              and journalists can publish judgment analyses, legal articles and commentary. The platform
              hosts real-time Supreme Court and High Court news, 50,000+ searchable judgments, live case
              status tools and five purpose-built AI judicial tools — all in both English and Hindi.
            </p>
            <p>
              The Legal Academy, operating on its dedicated subdomain, offers accredited diploma and
              certificate courses in legal research, judicial drafting, corporate advisory and litigation
              procedure — with structured internship programmes for law students and young advocates.
            </p>
            <p>
              Our chambers are located inside the High Court complex at Block-C, Chamber 515, Lucknow
              Bench — where the firm continues to litigate across criminal, civil, constitutional and
              commercial matters every day.
            </p>
          </div>
        </div>

        {/* ── Mission & Vision ── */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-[#0A2342] to-[#122340] text-white rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#C9A227] p-2.5 rounded-xl">
                <Award className="w-6 h-6 text-[#0A2342]" />
              </div>
              <h3 className="text-xl font-bold">Our Mission</h3>
            </div>
            <p className="text-blue-100 leading-relaxed">
              To make legal knowledge and judicial intelligence tools accessible to every citizen,
              advocate and institution in India — so that the law is not a barrier but a bridge to
              justice. We exist to democratise access to reliable legal information and high-quality
              representation.
            </p>
          </div>

          <div className="bg-gradient-to-br from-[#C9A227] to-[#b39022] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#0A2342] p-2.5 rounded-xl">
                <Star className="w-6 h-6 text-[#C9A227]" />
              </div>
              <h3 className="text-xl font-bold text-[#0A2342]">Our Vision</h3>
            </div>
            <p className="text-[#0A2342]/80 leading-relaxed">
              To become India&apos;s most trusted open legal platform — where advocates publish analysis,
              citizens access verified judgments, students learn through structured courses and anyone
              in need of representation can find qualified counsel — all in one place, in their language.
            </p>
          </div>
        </div>

        {/* ── AI Judicial Tools ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-6 h-6 text-[#C9A227]" />
            <h2 className="text-2xl font-bold text-[#0A2342]">AI Judiciary Tools Suite</h2>
          </div>
          <p className="text-gray-500 text-sm mb-8">
            Five purpose-built judicial intelligence tools — free to use, built for Indian courts.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PLATFORM_TOOLS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="group flex flex-col p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#C9A227]/40 transition-all"
              >
                <div className="bg-gradient-to-br from-[#0A2342] to-[#1A73E8] p-3 rounded-xl mb-4 w-fit">
                  <tool.icon className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-sm font-bold text-[#0A2342] mb-2 group-hover:text-[#C9A227] transition-colors">
                  {tool.title}
                </h4>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">{tool.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-[#0A2342] text-xs font-semibold">
                  Open Tool <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Platform Sections ── */}
        <div className="bg-gradient-to-br from-[#0A2342] to-[#122340] rounded-2xl p-8 md:p-10 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-6 h-6 text-[#C9A227]" />
            <h2 className="text-2xl font-bold">Platform Features</h2>
          </div>
          <p className="text-blue-200 text-sm mb-8">
            Beyond litigation — a complete judicial knowledge ecosystem open to everyone.
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {PLATFORM_SECTIONS.map((sec) => (
              <Link
                key={sec.title}
                href={sec.href}
                {...(sec.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="group flex gap-4 bg-white/8 backdrop-blur-sm rounded-xl p-5 border border-white/10 hover:bg-white/15 transition-all"
              >
                <div className="bg-[#C9A227]/20 border border-[#C9A227]/30 p-2.5 rounded-xl h-fit flex-shrink-0">
                  <sec.icon className="w-5 h-5 text-[#C9A227]" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1 group-hover:text-[#C9A227] transition-colors">
                    {sec.title}
                  </h4>
                  <p className="text-blue-200 text-xs leading-relaxed">{sec.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Core Values ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#0A2342] mb-8 text-center">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#C9A227]/40 transition-all"
              >
                <div className="bg-gradient-to-br from-[#0A2342] to-[#1A73E8] p-3.5 rounded-full mb-4">
                  <v.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-base font-bold text-[#0A2342] mb-2">{v.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Practice Areas ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#0A2342] mb-2 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-[#C9A227]" />
            Practice Areas
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            The firm handles matters across the full spectrum of Indian law — from trial courts to the
            Supreme Court of India.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {PRACTICE_AREAS.map((area) => (
              <div
                key={area}
                className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100 hover:border-[#C9A227]/30 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-[#C9A227] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium leading-snug">{area}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Why Choose Us ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#0A2342] mb-8 text-center">Why This Platform</h2>
          <div className="grid md:grid-cols-2 gap-5">
            {WHY_US.map((item, i) => (
              <div
                key={item.title}
                className="flex gap-4 p-6 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#C9A227]/30 transition-all"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0A2342] to-[#1A73E8] flex items-center justify-center text-white font-bold text-sm">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-[#0A2342] mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Location ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 md:p-10">
          <h2 className="text-2xl font-bold text-[#0A2342] mb-6 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#C9A227]" />
            Find Us
          </h2>
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Building2 className="w-5 h-5 text-[#0A2342] mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-bold text-[#0A2342] text-sm">Chamber Address</div>
                  <div className="text-gray-600 text-sm mt-1 leading-relaxed">
                    Advocates Chamber No. 515, Block-C<br />
                    High Court of Judicature at Allahabad<br />
                    Lucknow Bench, Gomti Nagar<br />
                    Lucknow, Uttar Pradesh – 226010
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Phone className="w-5 h-5 text-[#0A2342] flex-shrink-0" />
                <div>
                  <div className="font-bold text-[#0A2342] text-sm">Phone</div>
                  <a href="tel:+917080909786" className="text-[#1A73E8] text-sm hover:underline">
                    +91 70809 09786
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <Mail className="w-5 h-5 text-[#0A2342] flex-shrink-0" />
                <div>
                  <div className="font-bold text-[#0A2342] text-sm">Email</div>
                  <a
                    href="mailto:sajjadhusainlawassociates@gmail.com"
                    className="text-[#1A73E8] text-sm hover:underline"
                  >
                    sajjadhusainlawassociates@gmail.com
                  </a>
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 h-60 md:h-72">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.5!2d80.9898!3d26.8467!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bfd991f32b16b%3A0x93ccba8909978be7!2sAllahabad+High+Court+Lucknow+Bench!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Sajjad Husain Law Associates — Allahabad High Court, Lucknow Bench"
              />
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="bg-gradient-to-r from-[#C9A227] to-[#b39022] rounded-2xl p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold text-[#0A2342] mb-3">Need Legal Assistance or Want to Contribute?</h2>
          <p className="text-[#0A2342]/75 mb-6 max-w-2xl mx-auto">
            Whether you need legal representation, want to publish your legal analysis on our platform,
            or are looking to enrol in the Legal Academy — get in touch with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-[#0A2342] text-white font-bold px-7 py-3 rounded-full hover:bg-[#1a3a75] transition-colors"
            >
              Contact the Firm
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="https://academy.sajjadhusainlawassociates.com/join"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#0A2342] font-bold px-7 py-3 rounded-full hover:bg-gray-50 transition-colors border border-white/50"
            >
              Join Legal Academy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
