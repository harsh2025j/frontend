"use client";

import React, { useState } from 'react';
import { Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

const NewsletterSubscription = () => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const t = useTranslations('Newsletter');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email) {
            // Simulate API call
            setTimeout(() => {
                setSubscribed(true);
                setEmail('');
            }, 500);
        }
    };

    return (
        <section className="bg-gray-900 text-white py-16 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#C9A227] rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[100px]"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-white/10 rounded-full mb-6 backdrop-blur-sm">
                        <Mail className="text-[#C9A227] w-6 h-6" />
                    </div>

                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {t('title')}
                    </h2>
                    <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto">
                        {t('description')}
                    </p>

                    {/* {!subscribed ? (
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-grow px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition-all"
                            />
                            <button
                                type="submit"
                                className="px-8 py-4 bg-[#C9A227] hover:bg-[#b39022] text-white font-bold rounded-full transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg shadow-[#C9A227]/20"
                            >
                                Subscribe <ArrowRight size={18} />
                            </button>
                        </form>
                    ) : (
                        <div className="bg-green-500/20 border border-green-500/30 rounded-2xl p-6 inline-flex items-center gap-3 animate-fade-in-up">
                            <CheckCircle className="text-green-400 w-6 h-6" />
                            <span className="text-green-100 font-medium">Thank you for subscribing! Check your inbox soon.</span>
                        </div>
                    )} */}

                    <p className="text-gray-500 text-sm mt-6">
                        {t('privacy')}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSubscription;
