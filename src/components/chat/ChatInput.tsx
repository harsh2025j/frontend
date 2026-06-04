"use client";

import React from "react";
import { Send, Paperclip, X } from "lucide-react";
import { Message, Conversation } from "@/data/features/chat/chat.types";
import { Socket } from "socket.io-client";
import { SOCKET_EMIT } from "@/data/services/apiConfig/socketConstants";

interface ChatInputProps {
  inputText: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSend: () => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  replyingTo: Message | null;
  selectedConv: Conversation | null;
  onCancelReply: () => void;
}

export default function ChatInput({
  inputText,
  onInputChange,
  onSend,
  onFileSelect,
  fileInputRef,
  textareaRef,
  replyingTo,
  selectedConv,
  onCancelReply,
}: ChatInputProps) {
  const replyingToName =
    replyingTo && selectedConv
      ? selectedConv.participants.find(
          (p: any) => p.id === replyingTo.senderId || p._id === replyingTo.senderId
        )?.name || "User"
      : "";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim()) onSend();
    }
  };

  return (
    <div className="border-t border-stone-200/80 p-4 bg-white flex flex-col gap-3 relative">
      {/* Reply preview */}
      {replyingTo && (
        <div className="flex items-start justify-between bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm -mb-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="flex flex-col min-w-0 border-l-4 border-[#C9A227] pl-3">
            <span className="font-bold text-[10px] uppercase tracking-widest text-[#0A2342] mb-0.5">
              Replying to {replyingToName}
            </span>
            <span className="text-stone-600 text-xs line-clamp-1 italic">
              {replyingTo.content}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-stone-200 rounded-full text-stone-500 ml-2 shrink-0 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input row */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSend();
        }}
        className="flex items-center gap-3 relative"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          className="hidden"
          multiple
          accept=".pdf,.doc,.docx,image/*"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-600 transition-colors shrink-0"
          title="Share file"
        >
          <Paperclip size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={inputText}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Type message here..."
          className="flex-1 px-4.5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A2342]/10 focus:border-[#0A2342] text-sm transition-all resize-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          rows={1}
          style={{ minHeight: "44px", maxHeight: "120px" }}
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-[#0A2342] hover:bg-[#06162a] disabled:opacity-50 text-white rounded-2xl transition-all shadow-md shadow-[#0A2342]/10 hover:shadow-[#0A2342]/20 active:scale-95 shrink-0"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
