"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import RouteFallback from "@/components/ui/RouteFallback";
import logo from "../../../../../public/LightGray.png";
import { Link, useRouter } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash, FaExclamationTriangle, FaClock, FaShieldAlt, FaEnvelope, FaLock, FaArrowLeft } from "react-icons/fa";
import { authApi } from "@/data/services/auth-service/auth-service";
import { handleApiError } from "@/lib/utils/errorHandler";
import { useDocTitle } from "@/hooks/useDocTitle";
import type { DeactivationType } from "@/data/features/auth/auth.types";

function DeactivateAccountPageContent() {
  useDocTitle("Deactivate Account | Sajjad Husain Law Associates");
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from") || searchParams.get("returnUrl");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [type, setType] = useState<DeactivationType>("deactivate");
  const [reason, setReason] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ type: DeactivationType; requestedAt: string } | null>(null);

  const getBackLabel = () => {
    if (!fromParam) return "Back to Profile";
    if (fromParam.includes("settings")) return "Back to Settings";
    if (fromParam.includes("profile")) return "Back to Profile";
    if (fromParam.includes("academy")) return "Back to Academy";
    return "Go Back";
  };

  const handleBack = () => {
    if (fromParam) {
      router.push(fromParam);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/profile");
    }
  };

  // Prefill the email of a signed-in user, so the form only asks for the password.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("email");
      if (stored) setEmail(stored);
    } catch {
      // localStorage can be unavailable (private mode); the field stays empty.
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Please enter your registered email");
      return;
    }
    if (!password) {
      toast.error("Please enter your password");
      return;
    }
    if (!confirmed) {
      toast.error("Please tick the confirmation box to continue");
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.requestAccountDeactivation({
        email: email.trim(),
        password,
        confirm: true,
        type,
        reason: reason.trim() || undefined,
      });
      const data = res.data?.data;

      toast.success(
        data?.alreadyPending
          ? "A request for this account is already pending review."
          : "Your request has been submitted and is pending review."
      );
      setSubmitted({
        type: data?.type || type,
        requestedAt: data?.requestedAt || new Date().toISOString(),
      });
      setPassword("");

      // The account can no longer sign in, so drop any local session.
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
      } catch {
        // Nothing to clear.
      }
    } catch (err) {
      toast.error(handleApiError(err).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-white px-4 sm:px-6 lg:px-8 py-10">
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row bg-white">
        {/* Left Panel - Form */}
        <div className="w-full lg:w-1/2 bg-[#ffffff] border px-6 sm:px-10 py-10 flex flex-col justify-center">
          {submitted ? (
            <div className="max-w-md mx-auto w-full text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-[#C9A227] flex items-center justify-center mx-auto mb-6">
                <FaClock className="text-[#C9A227]" size={26} />
              </div>
              <h2 className="text-3xl font-bold mb-3">Request Pending</h2>
              <p className="text-gray-600 mb-6">
                Your request to{" "}
                {submitted.type === "delete" ? "delete your data" : "deactivate your account"} is{" "}
                <span className="font-semibold text-[#0A2342]">pending review</span>.
              </p>

              <div className="text-left bg-amber-50 border border-amber-200 rounded-md p-5 space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Account</span>
                  <span className="font-medium text-[#0A2342] break-all">{email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Request</span>
                  <span className="font-medium text-[#0A2342] capitalize">{submitted.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Submitted</span>
                  <span className="font-medium text-[#0A2342]">
                    {new Date(submitted.requestedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="font-semibold text-[#C9A227] uppercase tracking-wide">Pending</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-6">
                Sign-in is disabled for this account while the request is pending. If you change your
                mind, contact our support team to cancel the request.
              </p>

              <Link
                href="/"
                className="inline-block w-full bg-[#0A2342] text-white py-3 rounded-md font-medium hover:bg-[#1a3a5f] transition uppercase tracking-wide"
              >
                Back to Home
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto w-full">
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-gray-600 hover:text-[#0A2342] transition-colors cursor-pointer"
                >
                  <FaArrowLeft size={12} />
                  <span>{getBackLabel()}</span>
                </button>
              </div>

              <div className="flex flex-col items-center gap-2 mb-8">
                <h2 className="text-3xl font-bold text-center">Deactivate Account</h2>
                <p className="text-center text-gray-600">
                  Request deactivation of your account or deletion of your data. Our team reviews
                  every request before any action is taken.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Registered Email ID</label>
                  <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                    <FaEnvelope className="text-gray-400" size={14} />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      className="w-full focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <div className="border rounded-md px-3 py-3 flex items-center gap-2">
                    <FaLock className="text-gray-400" size={14} />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="w-full focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">What would you like us to do?</label>
                  <div className="space-y-2">
                    {([
                      {
                        value: "deactivate" as DeactivationType,
                        title: "Deactivate my account",
                        hint: "Your account is disabled. Your data is retained in case you return.",
                      },
                      {
                        value: "delete" as DeactivationType,
                        title: "Delete my data",
                        hint: "Your account and personal data are removed after review.",
                      },
                    ]).map((option) => (
                      <label
                        key={option.value}
                        className={`flex gap-3 p-3 border rounded-md cursor-pointer transition ${
                          type === option.value
                            ? "border-[#C9A227] bg-amber-50/50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="deactivationType"
                          value={option.value}
                          checked={type === option.value}
                          onChange={() => setType(option.value)}
                          className="mt-1 accent-[#C9A227]"
                        />
                        <span>
                          <span className="block text-sm font-medium text-[#0A2342]">{option.title}</span>
                          <span className="block text-xs text-gray-500">{option.hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reason <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Tell us why you are leaving"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={1000}
                    className="w-full border rounded-md px-3 py-3 focus:outline-none resize-none"
                  />
                </div>

                <label className="flex gap-3 items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-1 h-4 w-4 accent-red-600"
                  />
                  <span className="text-sm text-gray-600">
                    I understand that submitting this request disables sign-in for my account while
                    it is pending, and that{" "}
                    {type === "delete" ? "my data will be deleted" : "my account will be deactivated"}{" "}
                    once it is approved.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading || !confirmed}
                  className="w-full bg-red-600 text-white py-3 rounded-md font-medium hover:bg-red-700 transition disabled:opacity-50 uppercase tracking-wide"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>

                <div className="text-center">
                  <span className="text-gray-600">Changed your mind? </span>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    {getBackLabel()}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Right Panel - What happens next */}
        <div className="w-full lg:w-1/2 bg-[#0A2342] flex flex-col justify-center px-6 py-10 lg:px-16">
          <div className="flex justify-center mb-6">
            <Image
              src={logo}
              alt="Logo"
              width={300}
              height={300}
              className="w-full h-48 object-contain sm:w-full sm:h-60"
              priority
            />
          </div>

          <h2 className="text-xl font-semibold text-white text-center mb-8">
            Before you go — here is what happens to your request
          </h2>

          <div className="space-y-6">
            {[
              {
                icon: FaClock,
                text: "Nothing is deleted immediately. Your request is queued and marked as pending.",
              },
              {
                icon: FaShieldAlt,
                text: "Our team reviews every request to protect you against unauthorised deactivation.",
              },
              {
                icon: FaExclamationTriangle,
                text: "Sign-in is disabled while the request is pending. Contact support to cancel it.",
              },
              {
                icon: FaEnvelope,
                text: "You will be informed by email once the request has been actioned.",
              },
            ].map((item, index) => (
              <div key={index} className="flex items-start space-x-4">
                <item.icon className="text-[#C9A227] mt-1 flex-shrink-0" size={20} />
                <span className="text-white text-sm leading-relaxed">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DeactivateAccountPage(props: any) {
  return (
    <Suspense fallback={<RouteFallback />}>
      <DeactivateAccountPageContent {...props} />
    </Suspense>
  );
}
