"use client";
import React, { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { X } from "lucide-react";
import Image from "next/image";
import { useAdContext } from "@/context/AdContext";

interface AdsPopupProps {
    onClose: () => void;
    imageUrl?: string;
    linkUrl?: string; // Where the ad takes you
}

export default function AdsPopup({ onClose, imageUrl, linkUrl }: AdsPopupProps) {

    const { hasSeenAd, markAdAsSeen } = useAdContext();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (hasSeenAd) return;

        // Trigger fade-in after mount
        const timer = setTimeout(() => {
            setIsVisible(true);
            markAdAsSeen(); // Mark as seen immediately when shown
        }, 3000);

        // Lock scroll
        document.body.style.overflow = "hidden";

        return () => {
            // Cleanup: unlock scroll
            document.body.style.overflow = "unset";
            clearTimeout(timer);
        };
    }, [hasSeenAd, markAdAsSeen]);

    const handleClose = () => {
        setIsVisible(false);
        // Wait for fade-out animation before actual close
        setTimeout(() => onClose(), 300);
    };

    if (hasSeenAd && !isVisible) return null;


    // Default ad image if none provided (placeholder)
    const displayImage = imageUrl || "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"
                }`}
        >
            {/* Backdrop - Click event removed to force use of close button */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 
            w-[90vw] h-auto aspect-[3/4] 
            md:w-[70vw] md:aspect-[3/4] 
            lg:w-auto lg:h-[80vh] lg:aspect-[3/4]"
             >

                <button
                    onClick={handleClose}
                    className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-gray-700 rounded-full shadow-md z-20 transition-colors"
                    aria-label="Close Ad"
                >
                    <X size={24} />
                </button>

                {/* Ad Image / Content */}
                {linkUrl ? (
                    <Link href={linkUrl} target="_blank" rel="noopener noreferrer" className="block relative w-full h-full group">
                        <Image
                            src={displayImage}
                            alt="Promotional Ad"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-bold text-lg">Ad</p>
                        </div>
                    </Link>
                ) : (
                    <div className="relative w-full h-full">
                        <Image
                            src={displayImage}
                            alt="Promotional Ad"
                            fill
                            className="object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
