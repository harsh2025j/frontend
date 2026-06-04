"use client";

import React from "react";
import { Search, MessageSquare, ShieldCheck, Check, CheckCheck } from "lucide-react";
import { Conversation } from "@/data/features/chat/chat.types";

interface ConversationSidebarProps {
  role: "user" | "advocate";
  currentUserId: string;
  conversations: Conversation[];
  selectedConv: Conversation | null;
  onSelectConv: (conv: Conversation) => void;
  onlineUsers: string[];
  isFetchingConversations: boolean;
  hasMoreConversations: boolean;
  lastConversationElementRef: React.RefObject<HTMLDivElement | null>;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  debouncedSearchQuery: string;
  globalAdvocates: any[];
  onStartAdvocateConversation: (adv: any) => void;
}

export default function ConversationSidebar({
  role,
  currentUserId,
  conversations,
  selectedConv,
  onSelectConv,
  onlineUsers,
  isFetchingConversations,
  hasMoreConversations,
  lastConversationElementRef,
  searchQuery,
  onSearchChange,
  debouncedSearchQuery,
  globalAdvocates,
  onStartAdvocateConversation,
}: ConversationSidebarProps) {
  return (
    <div
      className={`absolute inset-0 z-10 md:static md:w-80 border-r border-stone-200/80 bg-white/80 flex-col ${
        selectedConv ? "hidden md:flex" : "flex"
      }`}
    >
      {/* Search header */}
      <div className="p-5 border-b border-stone-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-[#0A2342] flex items-center gap-2">
            <MessageSquare className="text-[#C9A227]" size={20} />
            Conversations
          </h2>
          <span className="text-[10px] uppercase font-extrabold tracking-wider bg-stone-100 text-stone-600 px-2.5 py-1 rounded-full border border-stone-200">
            {role}
          </span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A2342]/10 focus:border-[#0A2342] text-sm transition-all"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
        {debouncedSearchQuery && (
          <div className="px-2 py-1.5 mb-1 mt-2">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Recent Chats</span>
          </div>
        )}

        {conversations.length === 0 && !isFetchingConversations && (
          <div className="text-center py-6 text-stone-400 text-sm">
            {debouncedSearchQuery ? "No recent chats found." : "No conversations yet."}
          </div>
        )}

        {conversations
          .filter((conv) => conv.lastMessage)
          .map((conv) => {
            const partner = conv.participants.find(
              (p: any) => p !== currentUserId && p.id !== currentUserId
            );
            const name =
              typeof partner === "string" ? partner : (partner as any)?.name || "Unknown User";
            const partnerRole = typeof partner === "string" ? "user" : (partner as any)?.role;
            const partnerId =
              typeof partner === "string" ? partner : (partner as any)?.id || (partner as any)?._id;
            const isSelected = selectedConv?._id === conv._id;
            const formattedTime = conv.lastMessage?.timestamp
              ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "";

            return (
              <button
                key={conv._id}
                onClick={() => onSelectConv(conv)}
                className={`w-full flex items-start gap-4 p-4.5 rounded-2xl text-left transition-all duration-300 ${
                  isSelected
                    ? "bg-[#0A2342] text-white shadow-xl shadow-[#0A2342]/10"
                    : "hover:bg-stone-100 text-stone-800"
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-[#0A2342]/5 border border-[#0A2342]/10 flex items-center justify-center font-bold text-lg text-[#C9A227] shrink-0 relative">
                  {(partner as any)?.profilePicture || (partner as any)?.photoUrl ? (
                    <img
                      src={(partner as any).profilePicture || (partner as any).photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    name.charAt(0).toUpperCase() || "U"
                  )}
                  {partnerRole === "advocate" && (
                    <span className="absolute -bottom-1 -right-1 bg-[#C9A227] text-white p-0.5 rounded-full border border-white">
                      <ShieldCheck size={10} />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span
                      className={`font-semibold text-sm truncate ${
                        isSelected ? "text-white" : "text-stone-900"
                      }`}
                    >
                      {name}
                    </span>
                    <span
                      className={`text-[10px] font-medium shrink-0 ${
                        isSelected ? "text-stone-300" : "text-stone-400"
                      }`}
                    >
                      {formattedTime}
                    </span>
                  </div>
                  <p
                    className={`text-xs truncate ${
                      isSelected ? "text-stone-200" : "text-stone-500"
                    } flex items-center`}
                  >
                    {conv.lastMessage?.senderId === currentUserId &&
                      (conv.lastMessage.deliveryStatus === "seen" ? (
                        <CheckCheck
                          size={14}
                          className={`mr-1 shrink-0 ${
                            isSelected ? "text-[#E6CD73]" : "text-[#C9A227]"
                          }`}
                        />
                      ) : (
                        <Check
                          size={14}
                          className={`mr-1 shrink-0 ${
                            isSelected ? "text-stone-300" : "text-stone-400"
                          }`}
                        />
                      ))}
                    <span className="truncate">{conv.lastMessage?.text}</span>
                  </p>
                </div>
              </button>
            );
          })}

        {/* Infinite scroll trigger */}
        {!debouncedSearchQuery && hasMoreConversations && (
          <div ref={lastConversationElementRef} className="py-4 flex justify-center">
            <div className="w-5 h-5 border-2 border-[#0A2342] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Global Advocates section */}
        {debouncedSearchQuery && globalAdvocates.length > 0 && (
          <div className="mt-6 border-t border-stone-100 pt-4">
            <div className="px-2 py-1.5 mb-2">
              <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck size={14} /> Platform Advocates
              </span>
            </div>
            {globalAdvocates.map((adv) => (
              <button
                key={adv._id}
                onClick={() => onStartAdvocateConversation(adv)}
                className="w-full flex items-center gap-4 p-3 hover:bg-stone-100 rounded-xl transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-full bg-[#0A2342]/5 border border-[#0A2342]/10 flex items-center justify-center font-bold text-lg text-[#C9A227] shrink-0 relative overflow-hidden">
                  {adv.profilePicture || adv.photoUrl ? (
                    <img
                      src={adv.profilePicture || adv.photoUrl}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (adv.name || adv.firstName || "A").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm text-stone-900 truncate block">
                    {adv.name || `${adv.firstName || ""} ${adv.lastName || ""}`.trim()}
                  </span>
                  <span className="text-[10px] text-stone-500 truncate block">
                    {adv.specialization?.join(", ") || "Advocate"}
                  </span>
                </div>
                <MessageSquare
                  size={16}
                  className="text-stone-300 group-hover:text-[#C9A227] transition-colors"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
