"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Building2,
  ArrowRight,
  CheckCircle2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaTwitter,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { useDocTitle } from "@/hooks/useDocTitle";
import toast from "react-hot-toast";
import apiClient from "@/data/services/apiConfig/apiClient";
import { API_ENDPOINTS } from "@/data/services/apiConfig/apiContants";

const OFFICIAL_MAPS_LINK = "https://maps.app.goo.gl/PQFrHWHK5VCjTLEv7";
const WHATSAPP_URL =
  "https://wa.me/917080909786?text=Hello%20Sajjad%20Husain%20Law%20Associates%2C%20I%20would%20like%20to%20inquire%20about%20a%20legal%20consultation.";

const SOCIAL_LINKS = [
  {
    icon: FaLinkedinIn,
    href: "https://www.linkedin.com/in/sajjad-husain-associates-law-31715675/",
    label: "LinkedIn",
  },
  {
    icon: FaTwitter,
    href: "https://x.com/advocatesajjad",
    label: "X (Twitter)",
  },
  {
    icon: FaYoutube,
    href: "https://www.youtube.com/@SajjadHusainLawAssociates",
    label: "YouTube",
  },
  {
    icon: FaFacebookF,
    href: "https://www.facebook.com/advocatesajjadofficial",
    label: "Facebook",
  },
  {
    icon: FaInstagram,
    href: "https://www.instagram.com/sajjad_husain_law_associates/?hl=en",
    label: "Instagram",
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
      toast.success("Message sent successfully to the chambers!");
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
    <div className="min-h-screen bg-white">
      {/* ── Header in Website Blue (#0A2342) ── */}
      <div className="relative bg-[#0A2342] text-white py-14 sm:py-16 px-4 overflow-hidden">
        {/* Subtle Decorative Depth */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight">
            Contact Us
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Reach out to our chambers for legal counsel, case inquiries, or platform assistance.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 space-y-10">

        {/* ── Main Layout: Reach Us On vs. Send Message ── */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Column (5/12) - Reach Us On */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-[#0A2342] mb-1">Reach Us On</h2>
              <p className="text-xs text-gray-500">Official contact registry and chamber details.</p>
            </div>

            {/* Email Card with Action */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0A2342]" />
                  <span>Email</span>
                </div>
                <a
                  href="mailto:sajjadhusainlawassociates@gmail.com?subject=Legal%20Inquiry%20-%20Sajjad%20Husain%20Law%20Associates"
                  className="text-xs font-semibold text-[#0A2342] hover:underline normal-case"
                >
                  Compose Email ↗
                </a>
              </div>
              <div>
                <a
                  href="mailto:sajjadhusainlawassociates@gmail.com"
                  className="text-sm font-semibold text-[#0A2342] hover:underline break-all block"
                >
                  sajjadhusainlawassociates@gmail.com
                </a>
              </div>
            </div>

            {/* Phone & Hours Card with Direct Call / WhatsApp Actions */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0A2342]" />
                  <span>Phone &amp; WhatsApp</span>
                </div>
                <span className="text-xs font-medium text-gray-500 normal-case">Mon – Sat</span>
              </div>

              <div>
                <a
                  href="tel:+917080909786"
                  className="text-base font-bold text-[#0A2342] hover:underline block"
                >
                  +91 70809 09786
                </a>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                  <span>Assistance Hours: 10:00 AM – 6:00 PM IST</span>
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                <a
                  href="tel:+917080909786"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A2342] bg-gray-100 hover:bg-[#0A2342] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Now</span>
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <FaWhatsapp className="w-3 h-3" />
                  <span>Chat on WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Chamber Address Card with Map Link */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0A2342]" />
                  <span>Chamber Address</span>
                </div>
                <a
                  href={OFFICIAL_MAPS_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0A2342] hover:underline font-semibold normal-case text-xs flex items-center gap-1"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                Sajjad Husain Law Associates<br />
                Advocates Chamber No. 515, Block-C<br />
                High Court of Judicature at Allahabad<br />
                Lucknow Bench, Gomti Nagar<br />
                Lucknow, Uttar Pradesh – 226010
              </p>
            </div>

            {/* Follow Us On */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500 block">
                Follow Us On
              </span>
              <div className="flex flex-wrap gap-2">
                {SOCIAL_LINKS.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={idx}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={item.label}
                      className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-200 text-[#0A2342] hover:bg-[#0A2342] hover:text-white transition-all flex items-center justify-center"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column (7/12) - Actionable Send Message Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-[#0A2342] mb-1">
                Send a Message
              </h2>
              <p className="text-xs text-gray-500 mb-6">
                Fill in the details below and our chamber registry will respond promptly.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Name"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Brief subject of inquiry"
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your legal matter or procedural inquiry..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 bg-white placeholder:text-gray-400 focus:outline-none focus:border-[#0A2342] focus:ring-1 focus:ring-[#0A2342] transition-colors resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0A2342] text-white font-semibold text-sm hover:bg-[#153a66] transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

        {/* ── Official Google Maps Embed & Location ── */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#0A2342] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#0A2342]" />
                <span>Chamber Location — High Court Lucknow</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chamber No. 515, Block-C, High Court of Judicature at Allahabad, Lucknow Bench.
              </p>
            </div>
            <a
              href={OFFICIAL_MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A2342] bg-gray-50 hover:bg-[#0A2342] hover:text-white border border-gray-200 px-3.5 py-2 rounded-xl transition-all w-fit"
            >
              <span>Get Directions on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
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

      {/* ── Confirmation Modal with Direct Next Actions ── */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center border border-gray-200">
            <div className="flex justify-end mb-1">
              <button
                onClick={handleReset}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mx-auto w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>

            <h3 className="text-lg font-bold text-[#0A2342] mb-1">
              Message Submitted
            </h3>

            <p className="text-xs text-gray-600 mb-6 leading-relaxed">
              Thank you for contacting Sajjad Husain Law Associates. Our chamber registry will review your details
              and reach out within one business day.
            </p>

            <div className="space-y-2.5">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-xs flex items-center justify-center gap-2"
              >
                <FaWhatsapp className="w-3.5 h-3.5" />
                <span>Follow up instantly on WhatsApp</span>
              </a>

              <button
                onClick={handleReset}
                className="w-full py-2.5 bg-[#0A2342] text-white hover:bg-[#153a66] font-semibold rounded-xl text-xs transition-colors"
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
