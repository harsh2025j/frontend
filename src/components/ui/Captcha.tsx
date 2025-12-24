"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
    value: string;
    onChange: (value: string) => void;
    onCaptchaChange?: (captcha: string) => void;
}

export default function Captcha({ value, onChange, onCaptchaChange }: CaptchaProps) {
    const [captcha, setCaptcha] = useState("");

    // Generate CAPTCHA
    const generateCaptcha = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let result = '';
        for (let i = 0; i < 4; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCaptcha(result);
        onChange(""); // Clear input when captcha changes

        // Notify parent component of new captcha
        if (onCaptchaChange) {
            onCaptchaChange(result);
        }
    };

    // Generate on mount
    useEffect(() => {
        generateCaptcha();
    }, []);

    return (
        <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
                Enter Captcha <span className="text-red-500">*</span>
            </label>

            {/* CAPTCHA Display with External Refresh Button */}
            <div className="flex items-center gap-3">
                {/* CAPTCHA Box - Full Width */}
                <div className="flex-1 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-3">
                    <div className="flex items-center justify-center">
                        {/* CAPTCHA Text */}
                        <div className="relative select-none">
                            <div
                                className="text-3xl font-bold tracking-widest text-gray-800 transform -skew-x-6"
                                style={{ fontFamily: 'monospace', letterSpacing: '12px' }}
                            >
                                {captcha.split('').map((char, index) => (
                                    <span
                                        key={index}
                                        className="inline-block"
                                        style={{
                                            transform: `rotate(${Math.random() * 10 - 5}deg)`,
                                            color: `hsl(${Math.random() * 360}, 70%, 40%)`
                                        }}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>

                            {/* Noise lines */}
                            <div className="absolute inset-0 pointer-events-none">
                                <svg className="w-full h-full" style={{ opacity: 0.3 }}>
                                    <line x1="0" y1="20" x2="100%" y2="25" stroke="#666" strokeWidth="1" />
                                    <line x1="0" y1="40" x2="100%" y2="35" stroke="#666" strokeWidth="1" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Refresh Button - Outside on Right */}
                <button
                    type="button"
                    onClick={generateCaptcha}
                    className=" bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-300 rounded-lg p-3"
                    title="Refresh Captcha"
                >
                    <RefreshCw size={24} />
                </button>
            </div>

            {/* CAPTCHA Input - Full Width */}
            <input
                type="text"
                required
                placeholder="Enter Captcha Here"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-lg font-semibold tracking-widest"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={4}
            />
        </div>
    );
}

// Export validation helper
export const validateCaptcha = (input: string, captcha: string): boolean => {
    return input.toLowerCase() === captcha.toLowerCase();
};
