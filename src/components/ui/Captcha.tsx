"use client";

import React, { useState, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface CaptchaProps {
    value: string;
    onChange: (value: string) => void;
    onCaptchaChange?: (captcha: string) => void;
}

// Characters with distinct uppercase, lowercase, and numbers
// Omitting easily confusable characters like 0/O, 1/l to keep it fair while challenging
const CHAR_POOL = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";

export default function Captcha({ value, onChange, onCaptchaChange }: CaptchaProps) {
    const [imageDataUrl, setImageDataUrl] = useState<string>("");
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Generate random 5-character string with mixed case and numbers
    const generateRandomCode = () => {
        let code = "";
        for (let i = 0; i < 5; i++) {
            code += CHAR_POOL.charAt(Math.floor(Math.random() * CHAR_POOL.length));
        }
        return code;
    };

    // Render CAPTCHA image onto HTML5 canvas with difficulty level 5
    const drawCaptchaImage = useCallback((code: string) => {
        if (typeof window === "undefined") return;

        const canvas = document.createElement("canvas");
        const width = 320;
        const height = 80;
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Background gradient (subtle paper/slate texture)
        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
        bgGradient.addColorStop(0, "#F1F5F9");
        bgGradient.addColorStop(0.5, "#E2E8F0");
        bgGradient.addColorStop(1, "#F8FAFC");
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, height);

        // 2. Background noise dots (Difficulty ~5)
        for (let i = 0; i < 45; i++) {
            ctx.fillStyle = `hsla(${Math.random() * 360}, 50%, 45%, ${0.25 + Math.random() * 0.35})`;
            ctx.beginPath();
            ctx.arc(
                Math.random() * width,
                Math.random() * height,
                Math.random() * 2.5 + 0.5,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }

        // 3. Background wave interference lines (behind text)
        for (let i = 0; i < 4; i++) {
            ctx.strokeStyle = `hsla(${Math.random() * 360}, 45%, 55%, 0.35)`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(0, Math.random() * height);
            ctx.bezierCurveTo(
                width * 0.3, Math.random() * height,
                width * 0.7, Math.random() * height,
                width, Math.random() * height
            );
            ctx.stroke();
        }

        // 4. Draw Characters (Difficulty 5: rotation -20° to +20°, font size & vertical jitter)
        const colors = [
            "#1E3A8A", // Deep Navy
            "#831843", // Deep Wine
            "#065F46", // Deep Emerald
            "#92400E", // Deep Amber
            "#4C1D95", // Deep Purple
            "#1E293B", // Dark Slate
            "#B91C1C", // Deep Crimson
            "#0F766E", // Deep Teal
        ];

        const charWidth = width / (code.length + 1);
        const fontFamilies = ["'Courier New', monospace", "Impact, sans-serif", "'Trebuchet MS', sans-serif", "Georgia, serif"];

        for (let i = 0; i < code.length; i++) {
            const char = code[i];
            ctx.save();

            // Center coordinate for this char
            const x = (i + 1) * charWidth + (Math.random() * 8 - 4);
            const y = height / 2 + (Math.random() * 10 - 5);

            // Rotation angle: -20 to +20 degrees
            const angle = (Math.random() * 40 - 20) * (Math.PI / 180);

            ctx.translate(x, y);
            ctx.rotate(angle);

            // Font style with slight variation
            const fontSize = Math.floor(Math.random() * 6) + 32; // 32px to 38px
            const chosenFont = fontFamilies[i % fontFamilies.length];
            ctx.font = `bold ${fontSize}px ${chosenFont}`;
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";

            // Character shadow
            ctx.shadowColor = "rgba(0,0,0,0.18)";
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            ctx.shadowBlur = 2;

            // Character fill color
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            ctx.fillText(char, 0, 0);

            ctx.restore();
        }

        // 5. Foreground strike-through and wave interference lines (cuts across letters for difficulty 5)
        for (let i = 0; i < 3; i++) {
            ctx.strokeStyle = `hsla(${Math.random() * 360}, 65%, 35%, 0.45)`;
            ctx.lineWidth = Math.random() * 1.5 + 1.2;
            ctx.beginPath();
            ctx.moveTo(0, Math.random() * height);
            ctx.bezierCurveTo(
                width * 0.25, Math.random() * height,
                width * 0.75, Math.random() * height,
                width, Math.random() * height
            );
            ctx.stroke();
        }

        // 6. Convert to Image data URL
        const dataUrl = canvas.toDataURL("image/png");
        setImageDataUrl(dataUrl);
    }, []);

    // Refresh function - changes code & image
    const refreshCaptcha = useCallback(() => {
        setIsRefreshing(true);
        const newCode = generateRandomCode();
        drawCaptchaImage(newCode);
        onChange(""); // Clear the input field

        if (onCaptchaChange) {
            onCaptchaChange(newCode);
        }

        setTimeout(() => setIsRefreshing(false), 300);
    }, [drawCaptchaImage, onChange, onCaptchaChange]);

    // Initial mount generation (and changes on page refresh)
    useEffect(() => {
        refreshCaptcha();
    }, []);

    return (
        <div className="space-y-2.5">
            <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-800">
                    Enter Captcha <span className="text-red-500 font-bold">*</span>
                </label>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                    Case-sensitive (a ≠ A)
                </span>
            </div>

            {/* CAPTCHA Display Image with Refresh Button */}
            <div className="flex items-center gap-3">
                {/* CAPTCHA Image Box - Full Width */}
                <div className="flex-1 bg-slate-100 border border-slate-300 rounded-lg p-1.5 flex items-center justify-center min-h-[58px] shadow-inner overflow-hidden select-none">
                    {imageDataUrl ? (
                        <img
                            src={imageDataUrl}
                            alt="Security CAPTCHA Image"
                            className="w-full max-w-[280px] h-[52px] object-contain rounded select-none pointer-events-none"
                            draggable={false}
                        />
                    ) : (
                        <div className="h-[52px] flex items-center justify-center text-slate-400 text-xs">
                            Generating Image...
                        </div>
                    )}
                </div>

                {/* Refresh Button */}
                <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="p-3.5 bg-white hover:bg-slate-50 active:scale-95 border border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 transition-all shadow-sm flex items-center justify-center flex-shrink-0"
                    title="Change CAPTCHA Image"
                    aria-label="Refresh Captcha"
                >
                    <RefreshCw size={20} className={isRefreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* CAPTCHA Input */}
            <input
                type="text"
                required
                placeholder="Enter Captcha (Case-sensitive)"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#0B2242]/20 focus:border-[#0B2242] outline-none text-center text-sm font-semibold tracking-wider placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 bg-white text-slate-900 shadow-sm transition-colors"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                maxLength={6}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
            />
        </div>
    );
}

// Case-sensitive validation helper
export const validateCaptcha = (input: string, captcha: string): boolean => {
    return input.trim() === captcha.trim();
};
