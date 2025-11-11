"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { forgotPassword, resetPassword, verifyOtp } from "@/data/features/auth/authThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";
import logo from "../../../../public/logo.svg";

type Step = "forgot" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const { loading, error, message } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (error) toast.error(error);
    if (message) toast.success(message);
  }, [error, message]);

  const handleSendOtp = async () => {
    if (!email) {
      toast.error("Please enter email");
      return;
    }
    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setStep("verify");
    } catch {}
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      setStep("reset");
    } catch {}
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error("Please enter both password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await dispatch(
        resetPassword({
          email,
          otp,
          newPassword,
          conformPassword: confirmPassword,
        })
      ).unwrap();
    } catch {}
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-3xl mx-auto bg-white border rounded-2xl overflow-hidden">
        <div className="px-6 sm:px-10 py-10">
          {step === "forgot" && (
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <span className="text-2xl">🔒</span>
                </div>
                <h2 className="text-3xl font-bold text-center">Forgot Password</h2>
                <p className="text-center text-gray-600">
                  Enter your email or username and we&apos;ll send you a OTP to get back into your account.
                </p>
              </div>
              <div className="space-y-4">
                <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                  <span>✉️</span>
                  <input
                    type="email"
                    placeholder="Username or Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-[#b39022] transition disabled:opacity-50"
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            </div>
          )}

          {step === "verify" && (
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <span className="text-2xl">📨</span>
                </div>
                <h2 className="text-3xl font-bold text-center">OTP Verification</h2>
                <p className="text-center text-gray-600">Enter OTP and Set New password</p>
              </div>

              <div className="grid grid-cols-6 gap-3 mb-4">
                {[0, 1, 2, 3,4,5].map((i) => (
                  <input
                    key={i}
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const chars = otp.split("");
                      chars[i] = e.target.value.replace(/\D/g, "").slice(0, 1);
                      setOtp(chars.join(""));
                    }}
                    className="h-12 text-center border rounded-md"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 4}
                className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-[#b39022] transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Next"}
              </button>
            </div>
          )}

          {step === "reset" && (
            <div className="max-w-md mx-auto">
              <div className="flex flex-col items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full border-2 border-black flex items-center justify-center">
                  <span className="text-2xl">***</span>
                </div>
                <h2 className="text-3xl font-bold text-center">Set New Password</h2>
                <p className="text-center text-gray-600">Enter Your new password</p>
              </div>
              <div className="space-y-4">
                <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                  <span>🔒</span>
                  <input
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full focus:outline-none"
                  />
                </div>
                <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                  <span>🔒</span>
                  <input
                    type="password"
                    placeholder="RE- Enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-[#b39022] transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="text-sm text-gray-700">
              Don&apos;t have account? <a className="text-blue-600">Register</a>
            </div>
            <div className="text-sm text-gray-700 mt-2">Login as a Guest</div>
          </div>
        </div>
      </div>
    </div>
  );
}
