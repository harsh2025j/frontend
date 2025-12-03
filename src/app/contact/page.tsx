"use client";

import { Mail, Phone, MapPin, Clock, Send, User, MessageSquare, Building, ArrowRight } from "lucide-react";
import { FaFacebookF, FaInstagram, FaWhatsapp, FaTwitter, FaTelegramPlane, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { useState } from "react";
import Footer from "@/components/layout/Footer";

export default function ContactUs() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle form submission
        console.log("Form submitted:", formData);
        alert("Thank you for contacting us! We'll get back to you soon.");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#C9A227] selection:text-white">
            {/* Premium Hero Section */}
            <div className="relative bg-[#0A2342] text-white py-24 lg:py-32 px-4 overflow-hidden">
                {/* Abstract Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#C9A227]"></span>
                        <span className="text-xs font-medium tracking-widest uppercase text-gray-300">24/7 Support Available</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                        Get in <span className="text-[#C9A227]">Touch</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                        Expert legal guidance is just a message away. Connect with our dedicated team for personalized assistance and professional representation.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 -mt-20 relative z-20">
                <div className="grid lg:grid-cols-12 gap-8 mb-16">

                    {/* Contact Info Column (Left - 4 cols) */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Info Cards */}
                        {[
                            {
                                icon: MapPin,
                                title: "Visit Our Office",
                                content: (
                                    <>
                                        Block-C, High Court, Sajjad Husain,<br />
                                        Advocates Chamber.515,<br />
                                        Lucknow - Ayodhya Rd, Gomti Nagar,<br />
                                        Lucknow, Uttar Pradesh 226010
                                    </>
                                )
                            },
                            {
                                icon: Phone,
                                title: "Call Us Directly",
                                content: (
                                    <a href="tel:07080909786" className="hover:text-[#C9A227] transition-colors">
                                        +91 70809 09786
                                    </a>
                                )
                            },
                            {
                                icon: Mail,
                                title: "Email Us",
                                content: (
                                    <a href="mailto:sajjadhusainlawassociates@gmail.com" className="hover:text-[#C9A227] transition-colors break-all">
                                        sajjadhusainlawassociates@gmail.com
                                    </a>
                                )
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="group bg-white p-8 border border-gray-100 hover:border-[#C9A227] transition-all duration-500">
                                <div className="flex items-start gap-5">
                                    <div className="p-3 bg-[#0A2342]/5 text-[#0A2342] rounded-lg group-hover:bg-[#0A2342] group-hover:text-[#C9A227] transition-all duration-500">
                                        <item.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#0A2342] mb-2">{item.title}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed font-medium">
                                            {item.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Social Media */}
                        <div className="bg-white p-8 border border-gray-100 hover:border-[#C9A227] transition-all duration-500 group">
                            <h3 className="text-lg font-bold text-[#0A2342] mb-6">Connect With Us</h3>
                            <div className="flex flex-wrap gap-3">
                                {[FaFacebookF, FaInstagram, FaWhatsapp, FaTwitter, FaLinkedinIn, FaYoutube].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#0A2342]/5 text-[#0A2342] hover:bg-[#0A2342] hover:text-[#C9A227] transition-all duration-300">
                                        <Icon className="w-4 h-4" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Contact Form (Right - 8 cols) */}
                    <div className="lg:col-span-8">
                        <div className="bg-white p-8 lg:p-12 border border-gray-100 h-full">
                            <div className="mb-10">
                                <h2 className="text-3xl font-bold text-[#0A2342] mb-4">Send Us a Message</h2>
                                <p className="text-gray-500">Fill out the form below and our team will get back to you within 24 hours.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            className="w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium"
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            Subject
                                        </label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium"
                                            placeholder="Legal Inquiry"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                        Message
                                    </label>
                                    <textarea
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        className="w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium resize-none"
                                        placeholder="Tell us about your case..."
                                    ></textarea>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="group relative px-8 py-4 bg-[#0A2342] text-white font-bold tracking-wide overflow-hidden transition-all hover:bg-[#153a66]"
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            SEND MESSAGE
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                        <div className="absolute inset-0 bg-[#C9A227] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="w-full h-[500px] bg-gray-100 grayscale hover:grayscale-0 transition-all duration-700">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3559.324365667342!2d81.00902347616996!3d26.87126317667185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399be2dd108aa913%3A0xb35ae5f92f7d1a2e!2sHigh%20Court%20Lucknow!5e0!3m2!1sen!2sin!4v1701584000000!5m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Office Location"
                    ></iframe>
                </div>
            </div>

            <Footer />
        </div>
    );
}
