// src/app/auth/verify/page.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import CustomInput from "@/components/ui/CustomInput";
import { useResendOtp, useVerifyActions } from "@/data/features/auth/useAuthActions";
import toast from "react-hot-toast";

export default function VerifyPage() {
  const { formData, handleChange, handleVerify, loading: verifyLoading, error, message } = useVerifyActions();
  // Get specific loading state for resend action
  const { handleReSendOtp, loading: resendLoading } = useResendOtp();

  // --- NEW LOGIC: Local state for the 6 boxes ---
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Toast notifications
  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  // Handler: Input Change (Typing)
  const handleBoxChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return; // Only allow numbers

    const newOtp = [...otp];
    // Take the last character typed (handles fast typing)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Sync with your existing hook's formData
    const combinedOtp = newOtp.join("");
    // We create a synthetic event to satisfy your existing handleChange
    handleChange({ target: { name: "otp", value: combinedOtp } } as React.ChangeEvent<HTMLInputElement>);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handler: Key Down (Backspace logic)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handler: Paste (Copy-pasting full code)
  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return; // Only allow digits

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
    
    // Sync with hook
    handleChange({ target: { name: "otp", value: newOtp.join("") } } as React.ChangeEvent<HTMLInputElement>);

    // Focus the box after the pasted length
    const focusIndex = Math.min(pastedData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-md mx-auto bg-white shadow-lg rounded-lg border border-gray-200">
        <div className="w-full px-6 sm:px-10 py-10">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Verify Your Account
          </h2>
          <p className="text-sm text-gray-600 text-center mb-8">
            Enter the 6-digit verification code sent to your email address.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field (Read Only) */}
            <CustomInput
              label="Email"
              name="email"
              type="text"
              placeholder="example@example.com"
              value={formData.email}
              disabled
              onChange={handleChange}
            />

            {/* --- NEW: 6-Digit OTP Box Layout --- */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Verification Code (OTP)
              </label>
              <div className="flex justify-between gap-2" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleBoxChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-10 h-12 sm:w-12 sm:h-14 border border-gray-300 rounded-md text-center text-xl font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#C9A227] focus:border-transparent transition"
                  />
                ))}
              </div>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={handleReSendOtp}
                disabled={resendLoading || verifyLoading}
                className="text-sm text-blue-600 hover:underline disabled:text-gray-400 font-medium"
              >
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>

            <button
              type="submit"
              disabled={verifyLoading || resendLoading}
              className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-gray-800 transition disabled:opacity-50"
            >
              {verifyLoading ? "Verifying..." : "Verify"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}