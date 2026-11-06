"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Quote,
} from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/data/services/auth-service/auth-service";
import { handleApiError } from "@/lib/utils/errorHandler";
import type { DeactivationType } from "@/data/features/auth/auth.types";

function AcademyDeactivateAccountContent() {
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
    if (!fromParam) return "Back to Settings";
    if (fromParam.includes("settings")) return "Back to Settings";
    if (fromParam.includes("dashboard")) return "Back to Dashboard";
    if (fromParam.includes("profile")) return "Back to Profile";
    return "Go Back";
  };

  const handleBack = () => {
    if (fromParam) {
      router.push(fromParam);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/academy/dashboard/settings");
    }
  };

  // Prefill the email of a signed-in student, so only the password is asked for.
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

  const inputClass =
    "w-full h-10.5 pl-10 pr-3.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-semibold text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all shadow-2xs hover:border-slate-400 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <main className="w-full min-h-screen lg:h-screen lg:overflow-hidden bg-[#08172D] font-sans">
      <div className="flex w-full min-h-screen lg:h-full flex-col lg:flex-row bg-white">
        {/* LEFT: Brand panel */}
        <section className="relative hidden lg:flex lg:w-[45%] xl:w-[46%] shrink-0 flex-col justify-between bg-[#08172D] text-white p-6 lg:p-8 xl:p-10 overflow-hidden border-r border-[#122340]/20 lg:h-full select-none">
          <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#C9A227]/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#122340]/60 blur-3xl" />

          <Link href="/academy" className="relative z-10 group inline-flex items-center gap-3.5 w-fit shrink-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/20 bg-white/5 shadow-md transition-transform group-hover:scale-105">
              <span className="text-base font-black tracking-tight text-[#C9A227]">SH</span>
            </div>
            <div>
              <p className="text-[17px] font-bold tracking-tight text-white leading-tight">
                Sajjad Husain
              </p>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-[#C9A227] uppercase leading-tight mt-0.5">
                Legal Academy
              </p>
            </div>
          </Link>

          <div className="relative z-10 my-auto py-2 xl:py-4 max-w-lg">
            <h1 className="font-serif text-2xl sm:text-3xl xl:text-[38px] font-bold text-white leading-[1.15] tracking-tight">
              Account &amp; Data{" "}
              <span className="text-[#C9A227]">Control.</span>
            </h1>
            <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-gray-300 font-normal max-w-md">
              You decide how long we keep your data. Submit a request and our team will review it
              before anything is changed.
            </p>

            <div className="mt-5 pt-4 border-t border-white/15 space-y-2.5">
              {[
                {
                  icon: Clock,
                  text: "Nothing is deleted immediately — the request is marked pending.",
                },
                {
                  icon: ShieldCheck,
                  text: "Every request is reviewed to prevent unauthorised deactivation.",
                },
                {
                  icon: AlertTriangle,
                  text: "Sign-in is disabled while the request is pending.",
                },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <item.icon size={15} className="text-[#C9A227] shrink-0 mt-0.5" />
                  <p className="text-xs sm:text-[12px] leading-relaxed text-gray-300 font-light">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-3 xl:pt-4 border-t border-white/10 shrink-0">
            <div className="flex items-start gap-2.5">
              <Quote size={15} className="text-[#C9A227] fill-[#C9A227] shrink-0 mt-0.5" />
              <p className="text-xs sm:text-[12px] italic leading-relaxed text-gray-300 font-light">
                Your enrolments and certificates remain available until the request is approved.
              </p>
            </div>
          </div>
        </section>

        {/* RIGHT: Form panel */}
        <section className="flex-1 flex flex-col items-center justify-start bg-white px-5 py-6 sm:py-8 md:px-10 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto">
          <div className="w-full max-w-[420px] pb-8">
            <div className="mb-3">
              <button
                type="button"
                onClick={handleBack}
                className="group inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#0B2242] hover:text-[#8A6100] transition-colors cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#8A6100]/10 flex items-center justify-center transition-colors">
                  <ArrowLeft size={15} className="text-[#0B2242] group-hover:text-[#8A6100] transition-transform group-hover:-translate-x-0.5" />
                </div>
                <span>{getBackLabel()}</span>
              </button>
            </div>

            {submitted ? (
              <div className="animate-in fade-in duration-300">
                <div className="w-14 h-14 rounded-full bg-[#FDF6E2] border-2 border-[#E8CD82] flex items-center justify-center mb-4">
                  <Clock size={26} className="text-[#8A6100]" />
                </div>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B2242] tracking-tight">
                  Request Pending
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600 leading-normal">
                  Your request to{" "}
                  {submitted.type === "delete" ? "delete your data" : "deactivate your account"} is
                  awaiting review.
                </p>

                <div className="mt-5 rounded-xl border-2 border-[#E8CD82] bg-[#FDF6E2]/60 p-4 space-y-2.5">
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-500">Account</span>
                    <span className="font-bold text-[#0B2242] break-all text-right">{email}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-500">Request</span>
                    <span className="font-bold text-[#0B2242] capitalize">{submitted.type}</span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-500">Submitted</span>
                    <span className="font-bold text-[#0B2242] text-right">
                      {new Date(submitted.requestedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3 text-xs pt-2 border-t border-[#E8CD82]">
                    <span className="font-semibold text-slate-500">Status</span>
                    <span className="font-black uppercase tracking-wider text-[#8A6100]">Pending</span>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-slate-500 leading-relaxed">
                  Sign-in is disabled for this account while the request is pending. Contact support
                  if you want to cancel it.
                </p>

                <Link
                  href="/academy"
                  className="mt-5 w-full h-11 inline-flex items-center justify-center rounded-xl bg-[#0B2242] text-white text-xs font-black uppercase tracking-widest hover:bg-[#122340] transition-colors"
                >
                  Back to Academy
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#0B2242] tracking-tight">
                    Deactivate Account
                  </h2>
                  <p className="mt-0.5 text-xs sm:text-sm text-slate-600 leading-normal font-normal">
                    Request deactivation of your account or deletion of your data. Our team reviews
                    every request before any action is taken.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                    >
                      EMAIL ADDRESS
                    </label>
                    <div className="relative group">
                      <Mail
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                      />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="email"
                        placeholder="student@example.com"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                    >
                      PASSWORD
                    </label>
                    <div className="relative group">
                      <Lock
                        size={17}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#8A6100] transition-colors pointer-events-none"
                      />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className={`${inputClass} pr-11`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#8A6100] transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1.5">
                      WHAT SHOULD WE DO?
                    </span>
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
                          className={`flex gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            type === option.value
                              ? "border-[#B8860B] bg-[#FDF6E2]/60"
                              : "border-slate-300 bg-slate-50/50 hover:border-slate-400"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deactivationType"
                            value={option.value}
                            checked={type === option.value}
                            onChange={() => setType(option.value)}
                            disabled={loading}
                            className="mt-0.5 accent-[#B8860B]"
                          />
                          <span>
                            <span className="block text-xs font-bold text-[#0B2242]">{option.title}</span>
                            <span className="block text-[11px] text-slate-500 leading-snug mt-0.5">
                              {option.hint}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="reason"
                      className="block text-[11px] font-extrabold uppercase tracking-wider text-[#0B2242] mb-1"
                    >
                      REASON <span className="text-slate-400 font-bold">(OPTIONAL)</span>
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      disabled={loading}
                      maxLength={1000}
                      placeholder="Tell us why you are leaving"
                      className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 bg-slate-50/50 text-sm font-medium text-[#0B2242] placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-[#B8860B] focus:bg-white focus:ring-4 focus:ring-[#B8860B]/15 transition-all resize-none hover:border-slate-400 disabled:opacity-60"
                    />
                  </div>

                  <label className="flex gap-2.5 items-start cursor-pointer rounded-xl border-2 border-red-200 bg-red-50/60 p-3">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      disabled={loading}
                      className="mt-0.5 h-4 w-4 accent-red-600"
                    />
                    <span className="text-[11px] text-red-900 leading-relaxed font-medium">
                      I understand that submitting this request disables sign-in for my account while
                      it is pending, and that{" "}
                      {type === "delete" ? "my data will be deleted" : "my account will be deactivated"}{" "}
                      once it is approved.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={loading || !confirmed}
                    className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {loading && <Loader2 size={16} className="animate-spin" />}
                    <span>{loading ? "Submitting..." : "Submit Request"}</span>
                  </button>

                  <p className="text-center text-[11px] text-slate-500">
                    Changed your mind?{" "}
                    <button
                      type="button"
                      onClick={handleBack}
                      className="font-bold text-[#8A6100] hover:underline cursor-pointer"
                    >
                      {getBackLabel()}
                    </button>
                  </p>
                </form>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function AcademyDeactivateAccountPage(props: any) {
  return (
    <Suspense fallback={null}>
      <AcademyDeactivateAccountContent {...props} />
    </Suspense>
  );
}
