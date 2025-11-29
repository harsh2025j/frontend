"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/data/redux/hooks";
import { forgotPassword, resetPassword, verifyOtp } from "@/data/features/auth/authThunks";
import { MESSAGES } from "@/lib/constants/messageConstants";
import toast from "react-hot-toast";
import { resetAuthState } from "@/data/features/auth/authSlice";
import { useRouter } from "next/navigation";
import { useResendOtp } from "@/data/features/auth/useAuthActions";
import Link from "next/link";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Import icons

type Step = "forgot" | "verify" | "reset";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Global loading state (still used for Send OTP and Reset Password steps)
  const { loading, error, message } = useAppSelector((s) => s.auth);

  // Specific loading state for Resend OTP
  const { handleReSendOtp, loading: resendLoading } = useResendOtp();

  // Specific local loading state for Verification
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Password visibility states
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [step, setStep] = useState<Step>("forgot");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [conformPassword, setConformPassword] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stepParam = params.get("Step");
    const emailParam = params.get("email");

    if (stepParam) {
      setStep("reset");
    }
    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

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
      localStorage.setItem("email", email);
      setStep("verify");
    } catch {}
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast.error("Please enter OTP");
      return;
    }
    
    setVerifyLoading(true);
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      setStep("reset");
    } catch {
      // Error handled by global listener
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleReset = async () => {
    if (!newPassword || !conformPassword) {
      toast.error("Please enter both password fields");
      return;
    }
    if (newPassword !== conformPassword) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      await dispatch(
        resetPassword({
          email,
          otp,
          newPassword,
          conformPassword,
        })
      ).unwrap();
    } catch {}
  };

  useEffect(() => {
    if (message === MESSAGES.RESET_SUCCESS) {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get("email") || "";
      if (emailParam !== "") router.push("/profile");
      else router.push("/auth/login");

      dispatch(resetAuthState());
    }
  }, [message, router, dispatch]);

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
                <p className="text-center text-gray-600">
                  Enter OTP and Set New password
                </p>
              </div>

              {/* Improved OTP Input Box */}
              <div className="grid grid-cols-6 gap-3 mb-4">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <input
                    key={i}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={otp[i] || ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 1); // only digits
                      const chars = otp.split("");
                      chars[i] = value;
                      const newOtp = chars.join("");
                      setOtp(newOtp);

                      // move to next input automatically
                      if (value && i < 5) {
                        const nextInput = document.querySelector<HTMLInputElement>(
                          `input[data-index="${i + 1}"]`
                        );
                        nextInput?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) {
                        const prevInput = document.querySelector<HTMLInputElement>(
                          `input[data-index="${i - 1}"]`
                        );
                        prevInput?.focus();
                      }
                    }}
                    data-index={i}
                    className="h-12 w-12 text-center border rounded-md text-lg font-medium focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                ))}
              </div>
              <div className="text-center mb-4">
                <button
                  onClick={handleReSendOtp}
                  disabled={resendLoading || verifyLoading}
                  className="text-sm text-blue-600 hover:underline disabled:text-gray-400"
                >
                  {resendLoading ? "Sending..." : "Resend OTP"}
                </button>
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={verifyLoading || resendLoading || otp.length < 6}
                className="w-full bg-[#C9A227] text-white py-3 rounded-md font-medium hover:bg-[#b39022] transition disabled:opacity-50"
              >
                {verifyLoading ? "Verifying..." : "Next"}
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
                <p className="text-center text-gray-600">
                  Enter Your new password
                </p>
              </div>
              <div className="space-y-4">
                
                {/* New Password Field */}
                <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                  <span>🔒</span>
                  <input
                    type="password"
                    //  type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full focus:outline-none"
                  />
                  {/* <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button> */}
                </div>

                {/* Confirm Password Field */}
                <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                  <span>🔒</span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="RE- Enter your new password"
                    value={conformPassword}
                    onChange={(e) => setConformPassword(e.target.value)}
                    className="w-full focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </button>
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
            <Link href="/auth/signup">
              <div className="text-sm text-gray-700">
                Don&apos;t have account?{" "}
                <span className="text-blue-600 hover:underline">Register</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}