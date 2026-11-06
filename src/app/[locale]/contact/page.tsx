"use client";

import { useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/routing";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Building2,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaXTwitter,
  FaWhatsapp,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa6";
import { useDocTitle } from "@/hooks/useDocTitle";
import toast from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

const OFFICIAL_MAPS_LINK = "https://maps.app.goo.gl/PQFrHWHK5VCjTLEv7";
const WHATSAPP_URL =
  "https://wa.me/917080909786?text=Hello%20Sajjad%20Husain%20Law%20Associates%2C%20I%20would%20like%20to%20inquire%20about%20a%20legal%20consultation.";

const SOCIAL_LINKS = [
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/advocatesajjadofficial",
    label: "Facebook",
    bg: "hover:bg-[#1877F2] hover:border-[#1877F2]",
  },
  {
    icon: FaXTwitter,
    href: "https://x.com/advocatesajjad",
    label: "X (Twitter)",
    bg: "hover:bg-black hover:border-black",
  },
  {
    icon: FaWhatsapp,
    href: WHATSAPP_URL,
    label: "WhatsApp",
    bg: "hover:bg-[#25D366] hover:border-[#25D366]",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@SajjadHusainLawAssociates",
    label: "YouTube",
    bg: "hover:bg-[#FF0000] hover:border-[#FF0000]",
  },
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/in/sajjad-husain-associates-law-31715675/",
    label: "LinkedIn",
    bg: "hover:bg-[#0A66C2] hover:border-[#0A66C2]",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/sajjad_husain_law_associates/?hl=en",
    label: "Instagram",
    bg: "hover:bg-[#E4405F] hover:border-[#E4405F]",
  },
];

export default function ContactUs() {
  useDocTitle("Contact Us | Sajjad Husain Law Associates");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiClient.post(
        API_ENDPOINTS.NOTIFICATIONS.CONTACT_INQUIRY,
        formData
      );

      if (response?.data?.success === false) {
        throw new Error(response.data.message || "Failed to send message.");
      }

      setShowPopup(true);
      toast.success("Message sent successfully to our chambers!");
    } catch (err: any) {
      console.error("Contact API delivery error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send message. Please call us or reach out via WhatsApp.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setShowPopup(false);
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans pb-16">
      {/* ── Breadcrumb Bar (LiveLaw Standard, Full-Width Same as Header) ── */}
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
              Contact Us
            </span>
          </nav>
        </div>
      </div>

      {/* ── Brand Header (Full-Width, Extra Bold & Big Font) ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#C9A227] font-heading block">
                Chamber Registry &bull; High Court Lucknow Bench
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#0A2342] font-heading tracking-tight leading-none">
                Contact Us
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-4xl leading-relaxed pt-1 font-normal">
                Connect directly with the chambers of Sajjad Husain Law Associates for litigation representation, High Court and Supreme Court appellate counsel, legal consultations, or registry inquiries.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 shrink-0">
              <a
                href="tel:+917080909786"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A2342] bg-gray-50 hover:bg-[#0A2342] hover:text-white border border-gray-300 hover:border-[#0A2342] px-5 py-3 rounded-lg transition-all"
              >
                <Phone className="w-4 h-4" />
                <span>+91 70809 09786</span>
              </a>

              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-3 rounded-lg transition-all shadow-sm"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>WhatsApp Registry</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Editorial Split (Exact LiveLaw Standard, Full-Width) ── */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12">
        <div className="bg-white rounded-lg border border-gray-300 p-6 sm:p-10 md:p-12">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">

            {/* ════════ LEFT COLUMN: Reach us on (5 of 12) ════════ */}
            <div className="lg:col-span-5 space-y-8 sm:space-y-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0A2342] font-heading tracking-tight">
                  Reach us on
                </h2>
                <div className="w-14 h-1 bg-[#C9A227] mt-3 mb-2" />
                <p className="text-sm sm:text-base text-gray-600 font-normal">
                  Official communication channels and chamber registry details.
                </p>
              </div>

              {/* 1. Email Item */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#0A2342] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h6 className="text-sm sm:text-base font-black text-[#0A2342] uppercase tracking-wider">
                    Email
                  </h6>
                  <p className="text-base sm:text-lg font-bold text-[#0A2342]">
                    <a
                      href="mailto:sajjadhusainlawassociates@gmail.com"
                      className="hover:text-[#C9A227] hover:underline transition-colors break-all"
                    >
                      sajjadhusainlawassociates@gmail.com
                    </a>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    <a
                      href="mailto:sajjad.husainlawassociates@gmail.com?subject=Chamber%20Inquiry"
                      className="hover:text-[#C9A227] hover:underline transition-colors break-all"
                    >
                      sajjad.husainlawassociates@gmail.com
                    </a>
                  </p>
                </div>
              </div>

              {/* 2. Number Item */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#0A2342] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1">
                  <h6 className="text-sm sm:text-base font-black text-[#0A2342] uppercase tracking-wider">
                    Number
                  </h6>
                  <p className="text-lg sm:text-2xl font-black text-[#0A2342]">
                    <a
                      href="tel:+917080909786"
                      className="hover:text-[#C9A227] hover:underline transition-colors"
                    >
                      +91 70809 09786
                    </a>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1.5 pt-1 font-semibold">
                    <Clock className="w-4 h-4 text-[#C9A227] shrink-0" />
                    <span>Assistance Hours: 10:00 AM to 6:00 PM (Monday to Saturday)</span>
                  </p>
                </div>
              </div>

              {/* 3. Address Item */}
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-12 h-12 rounded-lg bg-[#0A2342] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h6 className="text-sm sm:text-base font-black text-[#0A2342] uppercase tracking-wider">
                      Chamber Address
                    </h6>
                    <a
                      href={OFFICIAL_MAPS_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs sm:text-sm font-bold text-[#C9A227] hover:underline flex items-center gap-1"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <p className="text-sm sm:text-base text-gray-800 leading-relaxed font-normal">
                    Advocates Chamber No. 515, Block-C, High Court of Judicature at Allahabad, Lucknow Bench, Lucknow &ndash; Ayodhya Road, Gomti Nagar, Lucknow, Uttar Pradesh &ndash; 226010, India
                  </p>
                </div>
              </div>

              {/* 4. Follow us on (LiveLaw style) */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm sm:text-base font-black text-[#0A2342] uppercase tracking-wider mb-3">
                  Follow us on
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  {SOCIAL_LINKS.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={idx}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                        title={item.label}
                        className={`w-10 h-10 rounded-lg bg-gray-50 border border-gray-300 text-[#0A2342] hover:text-white transition-all flex items-center justify-center ${item.bg}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* 5. Authentic Allahabad High Court Photographic Card (Clean & Realistic) */}
              <div className="rounded-lg border border-gray-300 overflow-hidden bg-white">
                <div className="relative h-48 sm:h-56 w-full bg-gray-100">
                  <Image
                    src="/high-courts/allahabad.jpg"
                    alt="High Court of Judicature at Allahabad, Lucknow Bench"
                    fill
                    sizes="(max-width: 1024px) 100vw, 500px"
                    className="object-cover"
                  />
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs sm:text-sm">
                  <div>
                    <span className="font-extrabold text-[#0A2342] block">
                      High Court of Judicature at Allahabad &bull; Lucknow Bench
                    </span>
                    <span className="text-gray-600 block text-xs">
                      Advocates Chamber Complex, Block-C, Chamber 515
                    </span>
                  </div>
                  <a
                    href={OFFICIAL_MAPS_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-[#0A2342] hover:text-[#C9A227] hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* ════════ RIGHT COLUMN: Contact Us Form (7 of 12) ════════ */}
            <div className="lg:col-span-7 lg:border-l lg:border-gray-200 lg:pl-12">
              <div>
                <h2 className="text-3xl sm:text-4xl font-black text-[#0A2342] font-heading tracking-tight">
                  Contact Us
                </h2>
                <div className="w-14 h-1 bg-[#C9A227] mt-3 mb-2" />
                <p className="text-sm sm:text-base text-gray-600 font-normal mb-8">
                  Submit your details below and our chamber registry will respond promptly.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="contact_name"
                    className="block text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider mb-2"
                  >
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact_name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter Full Name"
                    className="w-full h-12 sm:h-14 px-4 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_email"
                    className="block text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider mb-2"
                  >
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter Email Address"
                    className="w-full h-12 sm:h-14 px-4 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_phone"
                    className="block text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider mb-2"
                  >
                    Phone Number <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="tel"
                    id="contact_phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter Phone Number"
                    className="w-full h-12 sm:h-14 px-4 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_subject"
                    className="block text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider mb-2"
                  >
                    Subject / Case Reference <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact_subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Enter Subject (e.g. High Court Consultation, Writ Petition, Bail Application)"
                    className="w-full h-12 sm:h-14 px-4 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contact_message"
                    className="block text-xs sm:text-sm font-black text-gray-800 uppercase tracking-wider mb-2"
                  >
                    Message / Matter Summary <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="contact_message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your legal matter, court hearing reference, or procedural inquiry..."
                    className="w-full p-4 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-[240px] h-12 sm:h-14 rounded-lg bg-[#0A2342] hover:bg-[#153a66] text-white font-black text-xs sm:text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 shadow-sm cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span>Submitting...</span>
                    ) : (
                      <>
                        <span>Submit</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-5 border-t border-gray-200 flex items-start gap-3 text-xs sm:text-sm text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-[#C9A227] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <span className="font-extrabold text-[#0A2342]">Legal Privilege:</span> All inquiries and matter details submitted to Sajjad Husain Law Associates are protected under advocate-client confidentiality.
                  </p>
                </div>
              </form>
            </div>

          </div>
        </div>

        {/* ── Official Google Maps & Chamber Location (Full-Width, Same as Header) ── */}
        <div className="mt-10 sm:mt-12 bg-white rounded-lg p-6 sm:p-10 border border-gray-300 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0A2342] font-heading flex items-center gap-2.5">
                <MapPin className="w-6 h-6 text-[#C9A227]" />
                <span>Chamber Location &mdash; High Court of Judicature at Allahabad (Lucknow Bench)</span>
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 font-medium">
                Advocates Chamber No. 515, Block-C, High Court Campus, Lucknow &ndash; Ayodhya Road, Gomti Nagar, Lucknow, UP &ndash; 226010
              </p>
            </div>
            <a
              href={OFFICIAL_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A2342] bg-gray-50 hover:bg-[#0A2342] hover:text-white border border-gray-300 px-5 py-3 rounded-lg transition-all w-fit shrink-0"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <div className="rounded-lg overflow-hidden border border-gray-300 h-80 sm:h-[420px] w-full">
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

      {/* ── Confirmation Modal ── */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 sm:p-8 text-center border border-gray-300">
            <div className="flex justify-end mb-1">
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mx-auto w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-200">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>

            <h3 className="text-xl font-black text-[#0A2342] font-heading mb-2">
              Inquiry Submitted
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed font-normal">
              Thank you for contacting Sajjad Husain Law Associates. Your inquiry has been forwarded to our chamber registry and counsel will review it promptly.
            </p>

            <div className="space-y-3">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-wider rounded-lg transition-colors text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-4 h-4" />
                <span>Follow up on WhatsApp</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-[#0A2342] text-white hover:bg-[#153a66] font-extrabold uppercase tracking-wider rounded-lg text-xs sm:text-sm transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
