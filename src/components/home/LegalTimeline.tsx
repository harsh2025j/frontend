"use client";

import React from 'react';
import { Calendar, Gavel, Scale, BookOpen } from 'lucide-react';

const LegalTimeline = () => {
    const events = [
        {
            year: "1973",
            date: "April 24",
            title: "Judgment Delivered",
            description: "The Supreme Court delivered the historic judgment in Kesavananda Bharati v. State of Kerala, outlining the 'Basic Structure' doctrine.",
            icon: <Gavel className="w-5 h-5" />,
            color: "bg-red-500"
        },
        {
            year: "1972",
            date: "October 31",
            title: "Hearing Concluded",
            description: "The hearing, which lasted for 68 days, concluded. It was the longest hearing in the history of the Supreme Court.",
            icon: <Scale className="w-5 h-5" />,
            color: "bg-blue-500"
        },
        {
            year: "1972",
            date: "October 31",
            title: "Arguments Commenced",
            description: "A 13-judge bench was constituted to hear the writ petitions challenging the validity of the 24th, 25th and 29th Amendments.",
            icon: <BookOpen className="w-5 h-5" />,
            color: "bg-green-500"
        },
        {
            year: "1970",
            date: "March",
            title: "Writ Petition Filed",
            description: "Kesavananda Bharati, the head of Edneer Mutt, filed a writ petition challenging the Kerala Land Reforms Act.",
            icon: <Calendar className="w-5 h-5" />,
            color: "bg-amber-500"
        }
    ];

    return (
        <section className="py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <span className="text-[#C9A227] font-bold tracking-wider text-sm uppercase">Legal History</span>
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">Case Timeline: Kesavananda Bharati</h2>
                    <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                        A visual journey through one of the most significant cases in Indian Constitutional Law.
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Vertical Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-gray-100 rounded-full hidden md:block"></div>

                    <div className="space-y-12 relative">
                        {events.map((event, index) => (
                            <div key={index} className={`flex flex-col md:flex-row items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} gap-8`}>

                                {/* Content Side */}
                                <div className="flex-1 w-full md:w-1/2">
                                    <div className={`bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 relative group ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                        {/* Arrow for desktop */}
                                        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-t border-r border-gray-100 transform rotate-45 ${index % 2 === 0 ? '-left-2 border-l-0 border-b-0' : '-right-2 border-t-0 border-r-0 border-b border-l'}`}></div>

                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold text-white mb-3 ${event.color}`}>
                                            {event.year}
                                        </span>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#C9A227] transition-colors">
                                            {event.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm leading-relaxed">
                                            {event.description}
                                        </p>
                                        <span className="text-xs text-gray-400 mt-3 block font-medium uppercase tracking-wide">
                                            {event.date}
                                        </span>
                                    </div>
                                </div>

                                {/* Center Icon */}
                                <div className="relative z-10 flex-shrink-0">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-white ${event.color}`}>
                                        {event.icon}
                                    </div>
                                </div>

                                {/* Empty Side for Balance */}
                                <div className="flex-1 w-full md:w-1/2 hidden md:block"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LegalTimeline;
