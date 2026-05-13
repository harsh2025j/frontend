"use client";

import { Calendar, Clock, User, Phone, Mail, FileText, CheckCircle, ArrowRight, ShieldCheck, Briefcase, Search, Gavel } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
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

function BookingForm() {
    useDocTitle("Book an Appointment | Sajjad Husain Law Associates");
    const searchParams = useSearchParams();
    const advocateIdFromUrl = searchParams.get("advocateId");
    const caseIdFromUrl = searchParams.get("caseId");
    const { user: loggedInUser } = useProfileActions();

    const [loading, setLoading] = useState(false);
    const [fetchingAdvocate, setFetchingAdvocate] = useState(false);
    const [advocate, setAdvocate] = useState<any>(null);
    const [caseData, setCaseData] = useState<any>(null);
    const [advocatesPool, setAdvocatesPool] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phone: "",
        practiceArea: "Family",
        description: "",
        preferredDate: "",
        preferredTimeSlot: "Morning",
        termsAccepted: false,
        advocateId: advocateIdFromUrl || "",
        caseId: caseIdFromUrl || ""
    });

    const [bookingResult, setBookingResult] = useState<any>(null);

    useEffect(() => {
        if (advocateIdFromUrl) {
            fetchAdvocate(advocateIdFromUrl);
        } else {
            fetchAdvocatesPool();
        }

        if (caseIdFromUrl) {
            fetchCaseDetails(caseIdFromUrl);
        }
    }, [advocateIdFromUrl, caseIdFromUrl]);

    const fetchCaseDetails = async (id: string) => {
        try {
            const { casesService } = await import("@/data/services/cases-service/casesService");
            const response = await casesService.getById(id);
            setCaseData(response.data.data);
            if (response.data.data?.practiceArea) {
                setFormData(prev => ({ ...prev, practiceArea: response.data.data.practiceArea }));
            }
        } catch (error) {
            console.error("Failed to fetch case details:", error);
        }
    };

    const fetchAdvocate = async (id: string) => {
        setFetchingAdvocate(true);
        try {
            const response = await advocatesService.getAdvocateById(id);
            const data = response.data?.data || response.data;
            setAdvocate(data);
            if (data.specialization) {
                setFormData(prev => ({ ...prev, practiceArea: data.specialization }));
            }
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
            
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                practiceArea: advocate?.specialization || "Family",
                description: "",
                preferredDate: "",
                preferredTimeSlot: "Morning",
                termsAccepted: false,
                advocateId: advocateIdFromUrl || "",
                caseId: caseIdFromUrl || ""
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
        
        setFormData({
            ...formData,
            [name]: val
        });
    };

    const handleAdvocateSelect = (adv: any) => {
        setAdvocate(adv);
        setFormData(prev => ({ 
            ...prev, 
            advocateId: adv.id || adv._id,
            practiceArea: adv.specialization || adv.designation || prev.practiceArea 
        }));
        setSearchQuery("");
    };

    const practiceAreas = ["Family", "Criminal", "Property", "Corporate", "Other"];
    const timeSlots = ["Morning", "Afternoon", "Evening"];

    const filteredAdvocates = advocatesPool.filter(a => 
        a.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const isSelfBooking = (loggedInUser?.id || loggedInUser?._id) === (advocate?.id || advocate?._id) && !!advocate;

    if (bookingResult) {
        return (
            <div className="min-h-screen bg-white font-sans selection:bg-[#C9A227] selection:text-white">
                <div className="relative bg-[#0A2342] text-white py-24 lg:py-32 px-4 overflow-hidden">
                    <div className="absolute inset-0">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    </div>
                    <div className="container mx-auto max-w-6xl relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 backdrop-blur-sm mb-8">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-xs font-bold tracking-widest uppercase text-green-500">Booking Confirmed</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-bold mb-8 tracking-tight">
                            Successfully <span className="text-[#C9A227]">Booked</span>
                        </h1>
                        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-light">
                            Thank you, {bookingResult.fullName}. Your appointment request has been sent to {bookingResult.advocateName || 'the advocate'}.
                        </p>
                    </div>
                </div>

                <div className="container mx-auto max-w-3xl px-4 py-20 -mt-20 relative z-20">
                    <div className="bg-white p-8 lg:p-12 border border-gray-100 shadow-2xl rounded-3xl">
                        <h2 className="text-2xl font-bold text-[#0A2342] mb-8 border-b border-gray-50 pb-6">Track Your Application</h2>
                        
                        <BookingTimeline status={bookingResult.status} />

                        <div className="mt-12 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Reference ID</span>
                                <span className="text-xs font-black text-[#0A2342]">{bookingResult.id}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Preferred Date</span>
                                <span className="text-xs font-bold text-[#0A2342]">{bookingResult.preferredDate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Time Slot</span>
                                <span className="text-xs font-bold text-[#0A2342]">{bookingResult.preferredTimeSlot}</span>
                            </div>
                        </div>

                        <button 
                            onClick={() => window.location.reload()}
                            className="w-full mt-12 py-5 bg-[#0A2342] text-white font-bold tracking-widest rounded-2xl hover:bg-[#153a66] transition-all flex items-center justify-center gap-3"
                        >
                            Book Another Appointment <ArrowRight className="w-5 h-5" />
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
            <div className="relative bg-[#0A2342] text-white py-24 lg:py-32 px-4 overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C9A227]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
                </div>

                <div className="container mx-auto max-w-6xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
                        <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse"></span>
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
                                                <h4 className="text-sm font-bold text-[#0A2342] truncate group-hover:text-[#C9A227] transition-colors">{adv.name}</h4>
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
                        <div className="bg-white p-8 lg:p-12 border border-gray-100 shadow-2xl shadow-[#0A2342]/5 relative">
                            {/* Form Header */}
                            <div className="mb-12 border-b border-gray-100 pb-8">
                                <h2 className="text-3xl font-bold text-[#0A2342] mb-3">Appointment Details</h2>
                                <p className="text-gray-400">Fill in the form to book your slot with {advocate?.name || 'an expert advocate'}.</p>
                                
                                {(loggedInUser?.id || loggedInUser?._id) === (advocate?.id || advocate?._id) && advocate && (
                                    <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
                                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                        <p className="text-sm font-medium">You cannot book an appointment with yourself. Please select another advocate.</p>
                                    </div>
                                )}

                                {caseData && (
                                    <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                                                <Gavel size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Booking for Case</p>
                                                <p className="text-sm font-bold text-[#0A2342]">{caseData.title}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Case No.</p>
                                            <p className="text-xs font-bold text-[#0A2342]">{caseData.caseNumber || 'N/A'}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                {/* Personal Information */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            <User className="w-3 h-3" /> Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            required
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            <Mail className="w-3 h-3" /> Email Address
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            <Phone className="w-3 h-3" /> Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            placeholder="+91 XXXX XXXX"
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            <Briefcase className="w-3 h-3" /> Practice Area
                                        </label>
                                        <select
                                            name="practiceArea"
                                            value={formData.practiceArea}
                                            onChange={handleChange}
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all text-[#0A2342] font-medium appearance-none ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {practiceAreas.map(area => (
                                                <option key={area} value={area}>{area}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Appointment Specifics */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            <Calendar className="w-3 h-3" /> Preferred Date
                                        </label>
                                        <input
                                            type="date"
                                            name="preferredDate"
                                            value={formData.preferredDate}
                                            onChange={handleChange}
                                            required
                                            disabled={isSelfBooking}
                                            min={new Date().toISOString().split('T')[0]}
                                            className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all text-[#0A2342] font-medium ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        />
                                    </div>
                                    <div className="group">
                                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                            <Clock className="w-3 h-3" /> Time Slot
                                        </label>
                                        <select
                                            name="preferredTimeSlot"
                                            value={formData.preferredTimeSlot}
                                            onChange={handleChange}
                                            disabled={isSelfBooking}
                                            className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all text-[#0A2342] font-medium appearance-none ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {timeSlots.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 group-focus-within:text-[#C9A227] transition-colors">
                                        <FileText className="w-3 h-3" /> Case Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={4}
                                        disabled={isSelfBooking}
                                        className={`w-full pb-3 border-b border-gray-200 focus:border-[#C9A227] outline-none bg-transparent transition-all placeholder-gray-300 text-[#0A2342] font-medium resize-none ${isSelfBooking ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        placeholder="Briefly describe your legal concern..."
                                    ></textarea>
                                </div>

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
                                        className={`group relative w-full md:w-auto px-12 py-5 bg-[#0A2342] text-white font-bold tracking-widest overflow-hidden transition-all hover:bg-[#153a66] disabled:opacity-50 ${isSelfBooking ? 'cursor-not-allowed' : ''}`}
                                    >
                                        <span className="relative z-10 flex items-center justify-center gap-3">
                                            {loading ? "PROCESSING..." : "CONFIRM BOOKING"}
                                            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                        </span>
                                        <div className="absolute inset-0 bg-[#C9A227] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
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

export default function BookAppointment() {
    return (
        <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Loader /></div>}>
            <BookingForm />
        </Suspense>
    );
}
