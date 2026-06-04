"use client";

import React from "react";
import { ArrowLeft } from "lucide-react";
import { ConversationParticipant } from "@/data/features/chat/chat.types";

interface ChatHeaderProps {
  partner: ConversationParticipant | string | null;
  partnerName: string;
  isOnline: boolean;
  isTyping: boolean;
  onBack: () => void;
}

export default function ChatHeader({
  partner,
  partnerName,
  isOnline,
  isTyping,
  onBack,
}: ChatHeaderProps) {
  const photo =
    (partner as any)?.profilePicture || (partner as any)?.photoUrl;

  return (
    <div className="h-16 px-6 border-b border-stone-200/80 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="md:hidden p-1.5 -ml-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="w-9 h-9 rounded-lg bg-[#0A2342]/5 flex items-center justify-center font-semibold text-[#C9A227] relative overflow-hidden">
          {photo ? (
            <img src={photo} alt="Profile" className="w-full h-full object-cover rounded-lg" />
          ) : (
            partnerName.charAt(0).toUpperCase() || "U"
          )}
        </div>

        <div>
          <h3 className="text-sm font-bold text-[#0A2342]">{partnerName}</h3>
          {isTyping ? (
            <span className="text-[10px] text-blue-500 font-medium italic animate-pulse">
              typing...
            </span>
          ) : isOnline ? (
            <span className="text-[10px] text-green-500 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Online
            </span>
          ) : (
            <span className="text-[10px] text-stone-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
              Offline
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
