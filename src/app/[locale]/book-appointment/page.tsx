"use client";

import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, ArrowRight, ShieldCheck, Briefcase, Search, Gavel, Lock, X } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "@/components/layout/Footer";
import { useDocTitle } from "@/hooks/useDocTitle";
import { appointmentsService } from "@/data/services/appointments-service/appointmentsService";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import { advocatesService } from "@/data/services/advocates-service/advocatesService";
import Image from "next/image";
import Loader from "@/components/ui/Loader";
import BookingTimeline from "./components/BookingTimeline";
import { useProfileActions } from "@/data/features/profile/useProfileActions";
import { AlertCircle } from "lucide-react";
import FormField from "@/components/ui/FormField";
import { useRouter } from "next/navigation";

function BookingForm() {
    useDocTitle("Book an Appointment | Sajjad Husain Law Associates");
    const router = useRouter();
    const searchParams = useSearchParams();
    const advocateIdFromUrl = searchParams.get("advocateId");
    const { user: loggedInUser } = useProfileActions();

    const [loading, setLoading] = useState(false);
    const [fetchingAdvocate, setFetchingAdvocate] = useState(false);
    const [advocate, setAdvocate] = useState<any>(null);
    const [advocatesPool, setAdvocatesPool] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        practiceArea: "Family",
        description: "",
        preferredDate: "",
        preferredTimeSlot: "",
        appointmentType: "Case Discussion",
        negotiationOpinion: "",
        termsAccepted: false,
        advocateId: advocateIdFromUrl || ""
    });

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showTypeSuggestions, setShowTypeSuggestions] = useState(false);

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [bookingResult, setBookingResult] = useState<any>(null);

    const [duration, setDuration] = useState<number>(30);
    const [slots, setSlots] = useState<{ slot: string; isBooked: boolean }[]>([]);
    const [slotsLoading, setSlotsLoading] = useState<boolean>(false);
    const [availabilityMessage, setAvailabilityMessage] = useState<string>("");

    useEffect(() => {
        const fetchSlots = async () => {
            if (!formData.advocateId || !formData.preferredDate) {
                setSlots([]);
                setAvailabilityMessage("");
                return;
            }
            setSlotsLoading(true);
            setAvailabilityMessage("");
            try {
                const response = await appointmentsService.getAvailableSlots(formData.advocateId, formData.preferredDate, duration);
                const data = response.data?.data || response.data;
                if (data.isPastDate) {
                    setAvailabilityMessage("Selected date is in the past. Please select a valid date.");
                    setSlots([]);
                } else if (!data.isWorkingDay) {
                    const daysStr = data.workingDays?.join(", ") || "Monday to Saturday";
                    setAvailabilityMessage(`Advocate is not available on this day. Working days are: ${daysStr}`);
                    setSlots([]);
                } else {
                    setSlots(data.slots || []);
                    if (data.slots && data.slots.length === 0) {
                        setAvailabilityMessage("No available time slots for this date and duration.");
                    }
                }
            } catch (error) {
                console.error("Failed to load slots:", error);
                setAvailabilityMessage("Failed to load slot availability.");
                setSlots([]);
            } finally {
                setSlotsLoading(false);
            }
        };

        fetchSlots();
    }, [formData.advocateId, formData.preferredDate, duration]);


    useEffect(() => {
        if (advocateIdFromUrl) {
            fetchAdvocate(advocateIdFromUrl);
        } else {
            fetchAdvocatesPool();
        }

    }, [advocateIdFromUrl]);

    // Pre-fill user data if logged in
    useEffect(() => {
        if (loggedInUser) {
            setFormData(prev => ({
                ...prev,
                fullName: loggedInUser.name || prev.fullName,
                email: loggedInUser.email || prev.email,
                phone: loggedInUser.phone || prev.phone
            }));
            setShowAuthModal(false);
        } else {
            setShowAuthModal(true);
        }
    }, [loggedInUser]);



    const fetchAdvocate = async (id: string) => {
        setFetchingAdvocate(true);
        try {
            const response = await advocatesService.getAdvocateById(id);
            const data = response.data?.data || response.data;
            const spec = data.specialization || data.designation;
            const area = Array.isArray(spec) ? spec.join(", ") : spec;
            setFormData(prev => ({ ...prev, practiceArea: area || "Family" }));
            setAdvocate(data);
        } catch (error) {
            console.error("Failed to fetch advocate:", error);
            toast.error("Could not load advocate details.");
        } finally {
            setFetchingAdvocate(false);
        }
    };

    const fetchAdvocatesPool = async () => {
        try {
            const response = await advocatesService.getTopAdvocates(1, 10);
            const data = response.data?.data || response.data;
            setAdvocatesPool(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch advocates:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const requiredFields = [
            { key: 'fullName', label: 'Full Name' },
            { key: 'email', label: 'Email' },
            { key: 'phone', label: 'Phone Number' },
            { key: 'practiceArea', label: 'Practice Area' },
            { key: 'appointmentType', label: 'Type of Appointment' },
            { key: 'description', label: 'Case Description' },
            { key: 'preferredDate', label: 'Preferred Date' },
            { key: 'preferredTimeSlot', label: 'Time Slot' },
        ];

        const newErrors: Record<string, string> = {};
        requiredFields.forEach(field => {
            if (!formData[field.key as keyof typeof formData]) {
                newErrors[field.key] = `${field.label} is required`;
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill all required fields");
            return;
        }

        if (!formData.advocateId) {
            toast.error("Please select an advocate for your appointment.");
            return;
        }

        if (!formData.termsAccepted) {
            toast.error("Please accept the Terms & Privacy Policy");
            return;
        }

        const targetId = advocate?.id || advocate?._id || formData.advocateId;
        const myId = loggedInUser?.id || loggedInUser?._id;

        if (myId && targetId && myId === targetId) {
            toast.error("Self-booking is not allowed. You cannot book an appointment with yourself.");
            return;
        }

        setLoading(true);
        try {
            const { termsAccepted, ...payload } = formData;
            const response = await appointmentsService.createAppointment(payload);
            const data = response.data;

            if (data.advocateEmail) {
                toast.success(`Appointment booked! Notification sent to ${data.advocateEmail}`);
            } else {
                toast.success("Appointment booked successfully!");
            }

            setBookingResult(data);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setFormData({
                fullName: "",
                email: "",
                phone: "",
                practiceArea: advocate?.specialization || "Family",
                description: "",
                preferredDate: "",
                preferredTimeSlot: "10:00",
                appointmentType: "Case Discussion",
                negotiationOpinion: "",
                termsAccepted: false,
                advocateId: advocateIdFromUrl || ""
            });
        } catch (error: any) {
            console.error("Failed to book appointment:", error);
            toast.error(error.message || "Failed to book appointment. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: val
        }));

        if (errors[name]) {
            setErrors(prev => {
                const next = { ...prev };
                delete next[name];
                return next;
            });
        }
    };

    const handleAdvocateSelect = (adv: any) => {
        setAdvocate(adv);
        setFormData(prev => {
            const spec = adv.specialization || adv.designation;
            const area = Array.isArray(spec) ? spec.join(", ") : spec;
            return {
                ...prev,
                advocateId: adv.id || adv._id,
                practiceArea: area || "Family"
            };
        });
        setSearchQuery("");
        if (errors.advocateId) {
            setErrors(prev => {
                const next = { ...prev };
                delete next.advocateId;
                return next;
            });
        }
    };

    const practiceAreas = ["Family", "Criminal", "Property", "Corporate", "Other"];

    const filteredAdvocates = advocatesPool.filter(a =>
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSelfBooking = (loggedInUser?.id || loggedInUser?._id) === (advocate?.id || advocate?._id) && !!advocate;
    if (bookingResult) {
        return (
            <div className="min-h-screen bg-white font-sans selection:bg-[#C9A227] selection:text-white flex flex-col">
                <div className="flex-1 flex items-center justify-center py-20 px-4">
                    <div className="max-w-xl w-full text-center space-y-8">
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto border-4 border-green-100">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold text-[#0A2342] tracking-tight">
                                Application <span className="text-[#C9A227]">Sent!</span>
                            </h1>
                            <p className="text-lg text-gray-500 leading-relaxed font-medium">
                                Thank you, {bookingResult.fullName}. Your appointment request has been submitted successfully.
                            </p>
                        </div>

                        <div className="p-8 bg-blue-50/50 rounded-3xl border border-blue-100/50 flex items-start gap-4 text-left">
                            <div className="p-3 bg-blue-100 rounded-2xl text-blue-600 flex-shrink-0">
                                <Mail size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-[#0A2342] mb-1">What happens next?</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    The advocate will review your request. Once they accept or suggest a new time, you will receive an automatic notification on your registered/given email address.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push("/")}
                            className="w-full py-5 bg-[#0A2342] text-white font-bold tracking-widest rounded-2xl hover:bg-[#153a66] transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/10"
                        >
                            Return to Home <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-[#C9A227] selection:text-white">
            {/* Premium Hero Section */}
            <div className="relative bg-[#0A2342] text-white py-6 lg:py-10 px-4 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        {/* <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span> */}
                        <span className="text-xs font-medium tracking-widest uppercase text-gray-300">Individual & Specific Booking</span>
                    </div>

                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 tracking-tight">
                        Schedule an <span className="text-[#C9A227]">Appointment</span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                        Expert legal guidance tailored to your needs. Book a personalized consultation with your preferred advocate.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 -mt-20 relative z-20">
                {!loggedInUser ? (
                    <div className="bg-white p-12 lg:p-20 border border-gray-100 shadow-2xl shadow-[#0A2342]/5 rounded-[32px] text-center max-w-2xl mx-auto">
                        <div className="w-20 h-20 bg-[#C9A227]/10 text-[#C9A227] rounded-[24px] flex items-center justify-center mb-8 mx-auto border border-[#C9A227]/20">
                            <Lock size={32} strokeWidth={1.5} />
                        </div>

                        <h3 className="text-4xl md:text-5xl font-serif text-[#0A2342] mb-6 tracking-tight">Identity Required</h3>
                        <p className="text-gray-500 mb-12 text-lg leading-relaxed font-medium">
                            To facilitate a secure professional consultation, please authenticate your profile. This ensures both parties have verified credentials for the appointment.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                            <button
                                onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`)}
                                className="px-10 py-5 bg-[#0A2342] text-white rounded-2xl shadow-xl shadow-[#0A2342]/10 text-[11px] font-black uppercase tracking-widest hover:bg-[#153a66] transition-all flex items-center justify-center gap-3"
                            >
                                <User size={16} />
                                Continue to Login
                            </button>

                            <button
                                onClick={() => router.push(`/auth/signup?redirect=${encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname + window.location.search : '')}`)}
                                className="px-10 py-5 bg-[#C9A227] text-white rounded-2xl shadow-xl shadow-[#C9A227]/10 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                            >
                                Create New Profile
                            </button>
                        </div>

                        <p className="mt-16 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Secure & Confidential Booking Environment
                        </p>
                    </div>
                ) : (
                    <div className="grid lg:grid-cols-12 gap-12 mb-16">
                        {/* Left Column: Advocate Selection/Details */}
                        <div className="lg:col-span-4 space-y-8">
                            {fetchingAdvocate ? (
                                <div className="bg-white p-12 border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                                    <Loader />
                                    <p className="mt-4 text-gray-400 text-sm">Loading advocate details...</p>
                                </div>
                            ) : advocate ? (
                                <div className="bg-white border border-gray-100 shadow-xl overflow-hidden group">
                                    <div className="p-6">
                                        <div className="aspect-square bg-gray-50 relative overflow-hidden rounded-2xl border-4 border-gray-50 shadow-inner group-hover:border-[#C9A227]/20 transition-all duration-500">
                                            {advocate.photoUrl || advocate.profilePicture ? (
                                                <Image
                                                    src={advocate.photoUrl || advocate.profilePicture}
                                                    alt={advocate.name}
                                                    fill
                                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <User className="w-24 h-24" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="px-6 pb-8 space-y-4">
                                        <div className="pb-4 border-b border-gray-50">
                                            <h3 className="text-2xl font-bold text-[#0A2342]">{advocate.name}</h3>
                                            <p className="text-[#C9A227] text-[10px] font-black uppercase tracking-[0.2em] mt-1">{advocate.designation || 'Advocate'}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600 pt-2">
                                            <Briefcase className="w-4 h-4 text-[#C9A227]" />
                                            <span>{advocate.specialization || advocate.practiceArea || 'General Practice'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm text-gray-600">
                                            <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                                            <span>{advocate.yearsOfExperience || 'Experienced'} Professional</span>
                                        </div>
                                        {advocate.appointmentPricing && (
                                            <div className="flex items-center gap-3 text-sm font-bold text-[#0A2342] mt-2 bg-[#C9A227]/10 p-3 rounded-xl border border-[#C9A227]/20">
                                                <Clock className="w-4 h-4 text-[#C9A227]" />
                                                <span>{advocate.appointmentPricing}</span>
                                            </div>
                                        )}
                                        {(!advocateIdFromUrl || (loggedInUser?.id || loggedInUser?._id) === (advocate.id || advocate._id)) && (
                                            <button
                                                onClick={() => { setAdvocate(null); setFormData(p => ({ ...p, advocateId: "" })); }}
                                                className="text-xs font-bold text-[#0A2342] hover:text-[#C9A227] transition-colors uppercase tracking-widest pt-4 border-t border-gray-50 w-full text-left flex items-center gap-2"
                                            >
                                                Change Advocate <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white p-8 border border-gray-100 shadow-sm">
                                    <h3 className="text-lg font-bold text-[#0A2342] mb-6">Select an Advocate</h3>
                                    <div className="relative mb-6">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search by name..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg focus:border-[#C9A227] outline-none text-sm transition-all"
                                        />
                                    </div>
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {filteredAdvocates.map((adv: any) => (
                                            <div
                                                key={adv.id || adv._id}
                                                onClick={() => handleAdvocateSelect(adv)}
                                                className="flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#C9A227]/30 hover:bg-gray-50 cursor-pointer transition-all group"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden relative">
                                                    {adv.photoUrl || adv.profilePicture ? (
                                                        <Image src={adv.photoUrl || adv.profilePicture} alt={adv.name} fill className="object-cover" />
                                                    ) : <User className="w-full h-full p-2 text-gray-300" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <h4 className="text-sm font-bold text-[#0A2342] truncate group-hover:text-[#C9A227] transition-colors">{adv.name}</h4>
                                                        {adv.appointmentPricing && (
                                                            <span className="text-[9px] font-black bg-[#C9A227]/10 text-[#C9A227] px-2 py-1 rounded-full whitespace-nowrap">
                                                                {adv.appointmentPricing}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[10px] text-gray-400 uppercase tracking-tighter truncate">{adv.city || 'Advocate'}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredAdvocates.length === 0 && (
                                            <p className="text-center py-10 text-gray-400 text-xs italic">No advocates found matching your search.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="bg-[#C9A227] p-8 text-[#0A2342] relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                                <h3 className="text-xl font-bold mb-4 relative z-10">Confidentiality Assured</h3>
                                <p className="text-sm font-medium mb-6 relative z-10 opacity-90">All consultations are strictly private and follow legal privilege standards.</p>
                            </div>
                        </div>

                        {/* Right Column: Booking Form */}
                        <div className="lg:col-span-8">
                            <div className="bg-white p-8 lg:p-12 border border-gray-100 shadow-2xl shadow-[#0A2342]/5 relative min-h-[600px] flex flex-col">
                                {/* Form Header */}
                                <div className="mb-12 border-b border-gray-100 pb-8">
                                    <h2 className="text-3xl font-bold text-[#0A2342] mb-3">Appointment Details</h2>
                                    <p className="text-gray-400">Fill in the form to book your slot with {advocate?.name || 'an expert advocate'}.</p>

                                    {loggedInUser && (loggedInUser?.id || loggedInUser?._id) === (advocate?.id || advocate?._id) && advocate && (
                                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p className="text-sm font-medium">You cannot book an appointment with yourself. Please select another advocate.</p>
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    {/* Personal Information */}
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FormField label="Your Full Name" error={errors.fullName} required>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                disabled={isSelfBooking}
                                                className={`w-full pb-3 border-b outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${errors.fullName ? "border-red-500" : "border-gray-200 focus:border-[#C9A227]"} ${isSelfBooking || (loggedInUser && loggedInUser.name) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                placeholder="e.g. John Doe"
                                                readOnly={!!(loggedInUser && loggedInUser.name)}
                                            />
                                        </FormField>

                                        <FormField label="Your Email Address" error={errors.email} required>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                disabled={isSelfBooking}
                                                className={`w-full pb-3 border-b outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${errors.email ? "border-red-500" : "border-gray-200 focus:border-[#C9A227]"} ${isSelfBooking || (loggedInUser && loggedInUser.email) ? 'opacity-70 cursor-not-allowed' : ''}`}
                                                placeholder="e.g. john@example.com"
                                                readOnly={!!(loggedInUser && loggedInUser.email)}
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-8">
                                        <FormField label="Your Contact Number" error={errors.phone} required>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                disabled={isSelfBooking}
                                                className={`w-full pb-3 border-b outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${errors.phone ? "border-red-500" : "border-gray-200 focus:border-[#C9A227]"} ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                placeholder="e.g. +91 99999 99999"
                                            />
                                        </FormField>

                                        <FormField label="Legal Specialty / Practice Area" error={errors.practiceArea} required>
                                            <input
                                                type="text"
                                                name="practiceArea"
                                                value={formData.practiceArea}
                                                readOnly
                                                className="w-full pb-3 border-b border-gray-200 outline-none bg-transparent text-[#0A2342] font-medium cursor-default"
                                            />
                                        </FormField>
                                    </div>

                                    {/* Appointment Specifics */}
                                    <div className="space-y-6">
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <FormField label="Select Consultation Date" error={errors.preferredDate} required>
                                                <input
                                                    type="date"
                                                    name="preferredDate"
                                                    value={formData.preferredDate}
                                                    onChange={handleChange}
                                                    disabled={isSelfBooking}
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className={`w-full pb-3 border-b outline-none bg-transparent transition-all text-[#0A2342] font-medium ${errors.preferredDate ? "border-red-500" : "border-gray-200 focus:border-[#C9A227]"} ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                            </FormField>

                                            <FormField label="Select Appointment Duration" required>
                                                <div className="flex gap-2 mt-2">
                                                    {[
                                                        { label: "30 Mins", value: 30 },
                                                        { label: "1 Hour", value: 60 },
                                                        { label: "2 Hours", value: 120 }
                                                    ].map((item) => (
                                                        <button
                                                            key={item.value}
                                                            type="button"
                                                            onClick={() => setDuration(item.value)}
                                                            className={`flex-1 py-2 px-3 text-xs font-bold uppercase tracking-wider rounded-xl border transition-all duration-300 ${duration === item.value ? 'bg-[#0A2342] text-white border-[#0A2342] shadow-md shadow-[#0A2342]/10' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                                                        >
                                                            {item.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </FormField>
                                        </div>

                                        {availabilityMessage && (
                                            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                <span>{availabilityMessage}</span>
                                            </div>
                                        )}

                                        {formData.preferredDate && !availabilityMessage && (
                                            <FormField label="Available Time Slots" error={errors.preferredTimeSlot} required>
                                                {slotsLoading ? (
                                                    <div className="py-6 text-gray-400 text-xs italic flex items-center gap-2">
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                                                        <span>Retrieving slot availability...</span>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                                                        {slots.map((s) => {
                                                            const isSelected = formData.preferredTimeSlot === s.slot;
                                                            return (
                                                                <button
                                                                    key={s.slot}
                                                                    type="button"
                                                                    disabled={s.isBooked}
                                                                    onClick={() => {
                                                                        setFormData(prev => ({ ...prev, preferredTimeSlot: s.slot }));
                                                                        if (errors.preferredTimeSlot) {
                                                                            setErrors(prev => {
                                                                                const next = { ...prev };
                                                                                delete next.preferredTimeSlot;
                                                                                return next;
                                                                            });
                                                                        }
                                                                    }}
                                                                    className={`py-3 px-4 rounded-xl text-center text-xs font-bold transition-all duration-300 relative group overflow-hidden ${s.isBooked
                                                                            ? 'bg-red-50 border border-red-150 text-red-500 opacity-60 cursor-not-allowed'
                                                                            : isSelected
                                                                                ? 'bg-emerald-500 text-white border-2 border-emerald-500 shadow-md shadow-emerald-500/20'
                                                                                : 'bg-emerald-50 border border-emerald-100 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200'
                                                                        }`}
                                                                >
                                                                    <span>{s.slot}</span>
                                                                    {s.isBooked && (
                                                                        <span className="block text-[8px] font-black uppercase tracking-tighter opacity-80 mt-0.5">Booked</span>
                                                                    )}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </FormField>
                                        )}
                                    </div>

                                    {/* Suggestive and Typable Appointment Type */}
                                    <div className="relative">
                                        <FormField label="Type of Appointment" error={errors.appointmentType} required>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    name="appointmentType"
                                                    value={formData.appointmentType}
                                                    onChange={handleChange}
                                                    onFocus={() => setShowTypeSuggestions(true)}
                                                    onBlur={() => setTimeout(() => setShowTypeSuggestions(false), 200)}
                                                    disabled={isSelfBooking}
                                                    placeholder="Type or select a type (e.g. Case Discussion, Document Review)"
                                                    className={`w-full pb-3 border-b outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${errors.appointmentType ? "border-red-500" : "border-gray-200 focus:border-[#C9A227]"} ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                />
                                                {showTypeSuggestions && (
                                                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-gray-150 rounded-xl shadow-2xl p-3 max-h-60 overflow-y-auto">
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 py-1 mb-1">Suggestions (Click to select or type your own)</p>
                                                        {[
                                                            "Case Discussion",
                                                            "Legal Query / Consultation",
                                                            "Document Review",
                                                            "Court Representation",
                                                            "Contract Drafting",
                                                            "Fee Negotiation",
                                                            "Other"
                                                        ].map((suggestion) => (
                                                            <button
                                                                key={suggestion}
                                                                type="button"
                                                                onMouseDown={() => {
                                                                    setFormData(prev => ({ ...prev, appointmentType: suggestion }));
                                                                    setShowTypeSuggestions(false);
                                                                }}
                                                                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-[#C9A227]/10 hover:text-[#0A2342] rounded-lg transition-colors font-medium"
                                                            >
                                                                {suggestion}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </FormField>
                                    </div>

                                    <FormField label="Briefly describe your Legal concern / query" error={errors.description} required>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={4}
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium resize-none ${errors.description ? "border-red-500" : "border-gray-200 focus:border-[#C9A227]"} ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="Provide detail description about your query..."
                                        ></textarea>
                                    </FormField>

                                    {/* Negotiation Expectation Box */}
                                    <FormField label="Your Negotiation Expectations / Opinions (Optional)" error={errors.negotiationOpinion}>
                                        <textarea
                                            name="negotiationOpinion"
                                            value={formData.negotiationOpinion}
                                            onChange={handleChange}
                                            rows={3}
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium resize-none border-gray-200 focus:border-[#C9A227] ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="e.g. budget limit, payment terms, or preferred consultation rates..."
                                        ></textarea>
                                    </FormField>

                                    <div className="flex items-start gap-3 pt-4">
                                        <input
                                            type="checkbox"
                                            name="termsAccepted"
                                            checked={formData.termsAccepted}
                                            onChange={handleChange}
                                            id="terms"
                                            disabled={isSelfBooking}
                                            className={`mt-1 w-4 h-4 text-[#C9A227] border-gray-300 rounded focus:ring-[#C9A227] ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                        <label htmlFor="terms" className="text-sm text-gray-500 leading-tight cursor-pointer select-none">
                                            I agree to the <span className="text-[#0A2342] font-bold hover:text-[#C9A227]">Terms of Service</span> and <span className="text-[#0A2342] font-bold hover:text-[#C9A227]">Privacy Policy</span>. I understand that this consultation request does not establish an attorney-client relationship.
                                        </label>
                                    </div>

                                    <div className="pt-6">
                                        <button
                                            type="submit"
                                            disabled={loading || isSelfBooking}
                                            className={`group relative w-full md:w-auto rounded-md px-12 py-5 bg-[#0A2342] text-white font-bold tracking-widest overflow-hidden transition-all hover:bg-[#153a66] disabled:opacity-50 ${isSelfBooking ? 'cursor-not-allowed' : ''}`}
                                        >
                                            <span className="relative z-10 flex items-center justify-center gap-3 ">
                                                {loading ? "PROCESSING..." : "CONFIRM BOOKING"}
                                            </span>
                                            <div className="absolute inset-0 bg-[#C9A227] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #C9A227;
                }
            `}</style>
        </div>
    );
}

function AuthPromptModal({ onClose }: { onClose: () => void }) {
    const router = useRouter();
    const [pathname, setPathname] = useState("");

    useEffect(() => {
        setPathname(window.location.pathname + window.location.search);
    }, []);

    return (
        <div className="fixed inset-0 z-[700] flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-3xl p-10 md:p-14 max-w-lg w-full text-center relative overflow-hidden shadow-2xl border border-black/5"
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A227]/5 rounded-full -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0A2342]/5 rounded-full -ml-12 -mb-12" />

                <button
                    onClick={onClose}
                    className="absolute top-8 right-8 p-2 rounded-xl hover:bg-gray-50 transition-colors text-gray-400 hover:text-[#0A2342]"
                >
                    <X size={20} />
                </button>

                <div className="w-20 h-20 bg-[#C9A227]/10 text-[#C9A227] rounded-[24px] flex items-center justify-center mx-auto mb-8 relative border border-[#C9A227]/20">
                    <Lock size={32} strokeWidth={1.5} />
                </div>

                <h3 className="text-4xl font-serif text-[#0A2342] mb-4 tracking-tight">Identity Required</h3>
                <p className="text-gray-500 mb-10 text-sm leading-relaxed font-medium">
                    To facilitate a secure professional consultation, please authenticate your profile. This ensures both parties have verified credentials for the appointment.
                </p>

                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`)}
                        className="w-full py-5 bg-[#0A2342] text-white rounded-2xl shadow-xl shadow-[#0A2342]/10 text-[11px] font-black uppercase tracking-widest hover:bg-[#153a66] transition-all flex items-center justify-center gap-3"
                    >
                        <User size={16} />
                        Continue to Login
                    </button>

                    <button
                        onClick={() => router.push(`/auth/signup?redirect=${encodeURIComponent(pathname)}`)}
                        className="w-full py-5 bg-[#C9A227] text-white rounded-2xl shadow-xl shadow-[#C9A227]/10 text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                    >
                        Create New Profile
                    </button>
                </div>

                <button
                    onClick={onClose}
                    className="mt-8 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-[#0A2342] transition-colors"
                >
                    Maybe Later
                </button>
            </motion.div>
        </div>
    );
}

export default function BookAppointment() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader /></div>}>
            <BookingForm />
        </Suspense>
    );
}
