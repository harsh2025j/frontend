"use client";

import {
  Scale,
  Shield,
  BookOpen,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Cpu,
  GraduationCap,
  FileText,
  Languages,
  Gavel,
  Newspaper,
  Search,
  FilePen,
  Library,
  Clock,
  Briefcase,
  Compass,
  CheckSquare,
  FileCheck2,
} from "lucide-react";
import { Link } from "@/i18n/routing";
import { useDocTitle } from "@/hooks/useDocTitle";

// Consistent with TOOLS_REGISTRY from @/data/toolsRegistry.ts
const PLATFORM_TOOLS = [
  {
    icon: Search,
    title: "Supreme Court & High Court Precedents Research",
    shortTitle: "Precedent Research",
    href: "/tools/research",
    desc: "Instant precedent and judicial ratio retrieval over 50,000+ judgments with authentic neutral citations, coram composition, and official SCR references.",
    status: "active" as const,
    statBadge: "50,000+ Judgments",
  },
  {
    icon: Scale,
    title: "Court Pleadings & Petitions Drafter",
    shortTitle: "Court Pleadings",
    href: "/tools/drafting",
    desc: "Court-ready first drafts for Article 226/32 writ petitions, SLPs, bail applications, and quashing petitions complying with High Court and Supreme Court rules.",
    status: "active" as const,
    statBadge: "High Court & SC Formats",
  },
  {
    icon: FileText,
    title: "Legal Contracts & Deeds Library",
    shortTitle: "Contracts & Deeds",
    href: "/tools/documents",
    desc: "Draft from a curated repository of 2,176+ proven Indian legal templates across 58 categories with interactive clause customization.",
    status: "active" as const,
    statBadge: "2,176+ Templates",
  },
  {
    icon: FileCheck2,
    title: "Document Health Check & 3-Layer Risk Audit",
    shortTitle: "Document Health Check",
    href: "/tools/health-check",
    desc: "Automated 100-point diagnostic audit identifying missing arbitration seats, uncapped indemnities, unilateral terms, and statutory compliance traps.",
    status: "active" as const,
    statBadge: "100-Point Audit Engine",
  },
  {
    icon: Languages,
    title: "Legal Vernacular Translation & Document OCR",
    shortTitle: "Legal Translation",
    href: "/tools/translation",
    desc: "Translation across all 22 Eighth Schedule Indian languages to judicial English, preserving statutory sections, FIR numbers, case titles, and land survey records.",
    status: "active" as const,
    statBadge: "22 Indian Languages",
  },
  {
    icon: Gavel,
    title: "Mediation & Out-of-Court Settlement Desk",
    shortTitle: "Mediation & Settlement",
    href: "/tools/settlement",
    desc: "Structuring contested liabilities into balanced, judicially enforceable 5-part settlement term sheets under the Mediation Act 2023 and Order XXIII Rule 3 CPC.",
    status: "coming_soon" as const,
    statBadge: "Coming Soon",
  },
];

const SECTIONS = [
  {
    icon: Briefcase,
    title: "Legal Practice & Court Advocacy",
    content: [
      {
        subtitle: "High Court & Supreme Court Litigation",
        text: "The firm's litigation practice focuses on appellate and original jurisdiction before the High Court of Judicature at Allahabad (Lucknow and Prayagraj Benches) and the Supreme Court of India. Our advocates regularly brief and argue high-stakes constitutional writs, criminal appeals, revisions, and bail applications.",
      },
      {
        subtitle: "Constitutional & Administrative Law",
        text: "Invoking writ jurisdiction under Article 226 before the High Court and Article 32 before the Supreme Court to safeguard fundamental rights, challenge administrative overreach, and resolve complex service jurisprudence matters.",
      },
      {
        subtitle: "Criminal Defense & Statutory Quashing",
        text: "Comprehensive criminal representation from bail proceedings and trial defense to statutory quashing petitions under Section 482 of the Code of Criminal Procedure and the corresponding provisions of the Bharatiya Nagarik Suraksha Sanhita (BNSS 2023).",
      },
      {
        subtitle: "Civil, Property & Commercial Resolution",
        text: "Representation in original civil suits, first and second appeals, land tenure and revenue disputes, and commercial dispute resolution governed by the Arbitration and Conciliation Act and the Mediation Act 2023.",
      },
    ],
  },
  {
    icon: Compass,
    title: "Institutional Mission & Professional Standards",
    content: [
      {
        subtitle: "Why We Open-Source Legal Knowledge",
        text: "A fair legal system requires informed citizens. We believe court judgments, statutory updates, and procedural knowledge should never be locked behind commercial paywalls. Our digital repository is freely open to litigants, advocates, researchers, and students across India.",
      },
      {
        subtitle: "Bridging the Language Divide (Bilingual Access)",
        text: "Most legal resources in India remain restricted to English, alienating millions of litigants. We maintain a bilingual publishing infrastructure (English & Hindi) to ensure judgment summaries and court reporting can be read in the language people understand.",
      },
      {
        subtitle: "Primary-Source Verification Standard",
        text: "To ensure absolute legal accuracy, every case report, article, and statutory digest published on the platform is verified against certified court orders, official High Court and Supreme Court law reports, and official government gazettes.",
      },
      {
        subtitle: "Bar Council Ethical Compliance",
        text: "Our organization operates with strict fidelity to the Bar Council of India rules of professional conduct. We deliver candid legal assessments, uphold client confidentiality, and maintain transparency in every engagement.",
      },
    ],
  },
  {
    icon: Newspaper,
    title: "Public Legal Platform & Knowledge Repository",
    content: [
      {
        subtitle: "50,000+ Searchable Judgments Repository",
        text: "A structured digital archive of Supreme Court and High Court judgments, indexed by neutral citation, case number, judge name, and legal ratio, with integrated direct law report reading.",
      },
      {
        subtitle: "Real-Time Court Reporting",
        text: "Daily, objective coverage of key rulings, constitutional bench deliberations, Collegium appointments, and legislative amendments from the Supreme Court and High Courts across India.",
      },
      {
        subtitle: "Daily Cause Lists & Live Case Tracking",
        text: "Public tracking tools that help litigants, advocate clerks, and legal professionals monitor daily court rosters, cause lists, and procedural milestones across Indian court registries.",
      },
      {
        subtitle: "Open Publishing for the Legal Community",
        text: "A platform for advocates, legal researchers, professors, and law students to contribute analytical commentary, advancing scholarly legal discourse without editorial commercialization.",
      },
    ],
  },
  {
    icon: GraduationCap,
    title: "Legal Academy & Professional Education",
    content: [
      {
        subtitle: "Practical Procedural Training",
        text: "The Legal Academy bridges academic law education and courtroom realities through structured diploma and certificate programs in judicial drafting, practical legal research, and trial court procedure.",
      },
      {
        subtitle: "Chamber Internships at High Court Lucknow Bench",
        text: "Structured internship programmes providing selected law students with hands-on exposure to live case briefs, drafting exercises, court proceedings, and judicial argument preparation.",
      },
      {
        subtitle: "Verifiable Digital Credentials",
        text: "All coursework and internship completions are backed by verifiable cryptographic credentials, demonstrating practical courtroom readiness and procedural proficiency.",
      },
    ],
  },
];

const PRACTICE_AREAS = [
  "Supreme Court Appellate Litigation (SLPs & Appeals)",
  "Allahabad High Court (Lucknow & Prayagraj Benches)",
  "Constitutional & Writ Petitions (Articles 226 & 32)",
  "Criminal Defense, Bail & Anticipatory Bail",
  "FIR & Charge-Sheet Quashing (Section 482 CrPC / BNSS)",
  "Civil Original Suits & Regular First/Second Appeals",
  "Property Disputes & Revenue Board Matters",
  "Commercial Arbitration & Dispute Mediation",
  "Insolvency & Bankruptcy Matters (NCLT / NCLAT)",
  "Service Law & Government Employee Grievances",
  "Human Rights & SC/ST (POA) Act Matters",
  "Motor Accident Claims Tribunal (MACT) Appeals",
];

export default function AboutUs() {
  useDocTitle("About Us | Sajjad Husain Law Associates");

  return (
    <div className="min-h-screen bg-white">
      {/* ── Proper Header in Website Blue (#0A2342) ── */}
      <div className="relative bg-[#0A2342] text-white py-16 sm:py-20 px-4 overflow-hidden">
        {/* Subtle Decorative Elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          {/* Institutional Tag */}
          <div className="inline-block px-4 py-1.5 bg-white/10 rounded-full border border-white/15 text-xs uppercase tracking-widest font-semibold text-blue-100 mb-6">
            An Integrated Legal Practice &amp; Public Legal Knowledge Platform
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
            Sajjad Husain Law Associates
          </h1>

          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            An integrated institution uniting high-court litigation and appellate advocacy with an open-access
            public legal repository, judicial intelligence suite, and legal education initiatives.
          </p>

          <div className="inline-block px-5 py-2.5 bg-white/5 rounded-2xl border border-white/10 text-center">
            <p className="text-sm text-gray-300">
              Chambers Established 2008 • High Court Lucknow Bench • Supreme Court of India
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Content Container (Following Cookie Policy Format) ── */}
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16">

        {/* ── Section 1: Firm Overview & The Dual Identity ── */}
        <div className="bg-gray-50 rounded-2xl p-8 sm:p-10 mb-12 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div className="flex-shrink-0">
              <div className="bg-[#0A2342] p-3 rounded-xl">
                <Scale className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#0A2342] mb-4">
                An Integrated Legal Institution
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                <p>
                  <strong>Sajjad Husain Law Associates</strong> operates at the intersection of traditional courtroom
                  advocacy and modern public legal technology. Founded by Advocate Sajjad Husain—an enrolled advocate
                  actively practising before the Allahabad High Court, Lucknow Bench since 2008 and regularly appearing
                  before the Supreme Court of India and specialized national commissions—the organization is defined by
                  two interconnected functions:
                </p>
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-white border border-gray-200">
                    <h3 className="text-sm font-bold text-[#0A2342] mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0A2342]" />
                      1. Active Legal Practice
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Courtroom advocacy, constitutional writ litigation, criminal defense, civil appeals, and commercial
                      dispute resolution based at Chamber 515, Block-C, High Court Lucknow Bench.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-white border border-gray-200">
                    <h3 className="text-sm font-bold text-[#0A2342] mb-1.5 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0A2342]" />
                      2. Public Knowledge Platform
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      A freely accessible legal utility delivering unpaywalled judgments, daily cause list tracking,
                      bilingual news in English and Hindi, and six purpose-built procedural AI engines.
                    </p>
                  </div>
                </div>
                <p className="pt-2">
                  Our dual identity ensures that our digital initiatives are not abstract software, but practical tools
                  calibrated directly against daily courtroom realities, judicial rules, and procedural standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Structured Institutional Sections (Matching Cookie Policy Card Format) ── */}
        <div className="grid gap-8">
          {SECTIONS.map((section, index) => {
            const IconComponent = section.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#0A2342]/30 transition-colors duration-300"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-[#0A2342]/5 p-3 rounded-xl">
                    <IconComponent className="w-6 h-6 text-[#0A2342]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#0A2342]">{section.title}</h2>
                </div>

                <div className="grid sm:grid-cols-1 gap-6">
                  {section.content.map((item, idx) => (
                    <div key={idx} className="group">
                      <h3 className="text-lg font-semibold text-[#0A2342] mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0A2342]" />
                        {item.subtitle}
                      </h3>
                      <p className="text-gray-600 leading-relaxed pl-3.5 border-l border-gray-100 group-hover:border-[#0A2342] transition-colors duration-300">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Purpose-Built Legal Tools Suite (Consistent with Live Homepage / toolsRegistry.ts) ── */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#0A2342]/30 transition-colors duration-300 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#0A2342]/5 p-3 rounded-xl">
              <Cpu className="w-6 h-6 text-[#0A2342]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2342]">Purpose-Built Legal Tools Suite</h2>
              <p className="text-sm text-gray-500 mt-1">
                Six specialized procedural intelligence engines designed specifically around Indian statutory frameworks and court filing rules.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {PLATFORM_TOOLS.map((tool) => {
              const ToolIcon = tool.icon;
              const isComingSoon = tool.status === "coming_soon";
              return (
                <div
                  key={tool.title}
                  className="group p-5 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#0A2342]/40 hover:bg-white transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-lg bg-[#0A2342]/10 flex items-center justify-center text-[#0A2342] group-hover:bg-[#0A2342] group-hover:text-white transition-colors">
                        <ToolIcon className="w-4 h-4" />
                      </div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isComingSoon
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-blue-50 text-[#0A2342] border border-blue-200"
                        }`}
                      >
                        {tool.statBadge}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#0A2342] mb-1.5">
                      {tool.shortTitle}
                    </h3>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {tool.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60">
                    {isComingSoon ? (
                      <span className="text-xs font-semibold text-gray-400 cursor-not-allowed">
                        In Active Development
                      </span>
                    ) : (
                      <Link
                        href={tool.href}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A2342] hover:underline"
                      >
                        <span>Access Tool</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Practice Areas Scope ── */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#0A2342]/30 transition-colors duration-300 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#0A2342]/5 p-3 rounded-xl">
              <CheckSquare className="w-6 h-6 text-[#0A2342]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[#0A2342]">Areas of Legal Practice</h2>
              <p className="text-sm text-gray-500 mt-1">
                Comprehensive advocacy across trial, appellate, and writ jurisdictions before Indian courts and statutory tribunals.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {PRACTICE_AREAS.map((area) => (
              <div
                key={area}
                className="flex items-start gap-2.5 p-3.5 rounded-xl bg-gray-50 border border-gray-100 hover:border-[#0A2342]/30 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-[#0A2342] shrink-0 mt-0.5" />
                <span className="text-xs sm:text-sm text-gray-700 font-medium leading-snug">
                  {area}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Chambers & Court Location Section ── */}
        <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#0A2342]/30 transition-colors duration-300 mt-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-[#0A2342]/5 p-3 rounded-xl">
              <MapPin className="w-6 h-6 text-[#0A2342]" />
            </div>
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h2 className="text-2xl font-bold text-[#0A2342]">Chambers &amp; Court Location</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Direct courtroom access inside the High Court complex at Lucknow.
                </p>
              </div>
              <a
                href="https://maps.app.goo.gl/PQFrHWHK5VCjTLEv7"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A2342] bg-[#0A2342]/5 hover:bg-[#0A2342] hover:text-white px-3.5 py-2 rounded-xl transition-all w-fit"
              >
                <span>View on Google Maps</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center pt-2">
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-[#0A2342]" />
                    <span>Advocates Chamber</span>
                  </div>
                  <a
                    href="https://maps.app.goo.gl/PQFrHWHK5VCjTLEv7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0A2342] hover:underline normal-case font-semibold text-xs flex items-center gap-1"
                  >
                    <span>Get Directions</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                  Sajjad Husain Law Associates<br />
                  Chamber No. 515, Block-C<br />
                  High Court of Judicature at Allahabad<br />
                  Lucknow Bench, Gomti Nagar<br />
                  Lucknow, Uttar Pradesh – 226010
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Direct Telephone</div>
                  <a
                    href="tel:+917080909786"
                    className="text-sm font-semibold text-[#0A2342] hover:underline"
                  >
                    +91 70809 09786
                  </a>
                </div>
                <span className="text-xs text-gray-500">Mon – Sat</span>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Official Email</div>
                <a
                  href="mailto:sajjadhusainlawassociates@gmail.com"
                  className="text-sm font-semibold text-[#0A2342] hover:underline break-all"
                >
                  sajjadhusainlawassociates@gmail.com
                </a>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#0A2342] shrink-0" />
                <div className="text-xs text-gray-600">
                  Chamber Consultations: <strong>10:00 AM – 6:00 PM IST</strong> (By prior appointment)
                </div>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 h-64 sm:h-72 w-full">
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
        </div>

        {/* ── Contact Section (Identical Format to Cookie Policy) ── */}
        <div className="mt-16 bg-[#0A2342] rounded-2xl p-8 sm:p-12 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full blur-3xl opacity-10 transform translate-x-1/3 -translate-y-1/3" />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row gap-8 md:items-center justify-between">
              <div className="max-w-xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-white/10 p-3 rounded-xl">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Contact the Chambers</h2>
                </div>
                <p className="text-gray-300 mb-8 leading-relaxed">
                  For legal consultations, court representation, academic inquiries, or platform contributions,
                  please contact our chambers directly.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 bg-white text-[#0A2342] font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
                  >
                    <span>Schedule Consultation</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <a
                    href="https://academy.sajjadhusainlawassociates.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 text-white font-medium px-5 py-2.5 rounded-xl hover:bg-white/15 transition-colors text-sm border border-white/20"
                  >
                    <span>Legal Academy</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-4 min-w-[300px]">
                <a
                  href="mailto:sajjadhusainlawassociates@gmail.com"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <Mail className="w-5 h-5 text-white shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Email Us</span>
                    <span className="text-sm font-medium break-all group-hover:text-blue-200 transition-colors">
                      sajjadhusainlawassociates@gmail.com
                    </span>
                  </div>
                </a>

                <a
                  href="tel:+917080909786"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <Phone className="w-5 h-5 text-white shrink-0" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Direct Phone</span>
                    <span className="text-sm font-medium group-hover:text-blue-200 transition-colors">
                      +91 70809 09786
                    </span>
                  </div>
                </a>

                <a
                  href="https://maps.app.goo.gl/PQFrHWHK5VCjTLEv7"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors group"
                >
                  <MapPin className="w-5 h-5 text-white flex-shrink-0 group-hover:text-blue-200 transition-colors" />
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span>Office (View on Map)</span>
                      <ArrowUpRight className="w-3 h-3 text-gray-400 group-hover:text-blue-200" />
                    </span>
                    <span className="text-sm font-medium leading-relaxed group-hover:text-blue-200 transition-colors">
                      Block-C, Chamber No. 515, High Court Lucknow Bench,<br />
                      Gomti Nagar, Lucknow, Uttar Pradesh – 226010
                    </span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
