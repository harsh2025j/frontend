"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { notificationService } from "@/data/services/notification-service/notification.service";
import Image from "next/image";

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setLoading(false);
      setSuccess(false);
      setMessage("No unsubscribe token provided. Please use the link provided at the footer of your email.");
      return;
    }

    let isMounted = true;

    async function handleUnsubscribe() {
      try {
        setLoading(true);
        const res: any = await notificationService.unsubscribeNewsletter(token as string);
        const data = res?.data || res;
        if (isMounted) {
          if (data?.success) {
            setSuccess(true);
            setMessage(data.message || "You have been successfully unsubscribed from Sajjad Husain Law Associates legal digests.");
          } else {
            setSuccess(false);
            setMessage(data?.message || "Invalid or expired unsubscribe link.");
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setSuccess(false);
          setMessage(err?.response?.data?.message || err?.message || "Failed to process unsubscription. Please try again later.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    handleUnsubscribe();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-[#0A2342] border border-[#C9A227]/40 rounded-xl p-8 sm:p-10 shadow-2xl text-center">

        {/* Crest Logo */}
        <div className="w-16 h-16 rounded-full border-2 border-[#C9A227] overflow-hidden mx-auto mb-5 shadow-lg bg-[#07172C] flex items-center justify-center">
          <Image
            src="https://sajjad-thumbnails.s3.eu-north-1.amazonaws.com/profiles/8ca31355-ffaf-46b8-82b9-92e4fc598f0c.png"
            alt="Sajjad Husain Law Associates"
            width={60}
            height={60}
            className="w-full h-full object-cover"
          />
        </div>

        <h1 className="font-serif text-2xl font-bold text-white tracking-wide mb-1">
          Sajjad Husain Law Associates
        </h1>
        <p className="text-[12px] uppercase font-semibold text-[#C9A227] tracking-wider mb-6">
          Chambers Newsletter Preferences
        </p>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
            <p className="text-slate-300 text-sm">Updating your subscription preferences...</p>
          </div>
        ) : success ? (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/30">
              Unsubscribed Successfully
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {message}
            </p>
            <p className="text-slate-400 text-xs">
              You will no longer receive weekly legal briefs. If this was done in error, you can resubscribe anytime from our homepage footer.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-300 border border-rose-500/30">
              Verification Notice
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {message}
            </p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-white/10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#C9A227] hover:bg-[#B89220] text-[#07172C] text-sm font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Chambers Portal</span>
          </Link>
        </div>

      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[75vh] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#C9A227] animate-spin" />
        </div>
      }
    >
      <UnsubscribeContent />
    </Suspense>
  );
}

