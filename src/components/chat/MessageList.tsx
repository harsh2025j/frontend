"use client";

import React from "react";
import { Message } from "@/data/features/chat/chat.types";
import MessageBubble from "./MessageBubble";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  activeChatPartner: any;
  role: "user" | "advocate";
  hasMoreMessages: boolean;
  isLoadingMore: boolean;
  firstUnreadMessageId: string | null;
  highlightedMessageId: string | null;
  uploadProgresses: Record<string, number>;
  failedUploads: Record<string, File>;
  downloadingFiles: Record<string, boolean>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  firstUnreadRef: React.RefObject<HTMLDivElement | null>;
  isDocumentUnlocked: (metadata: any) => boolean;
  onLoadMore: () => void;
  onReply: (msg: Message) => void;
  onRetryUpload: (file: File, messageId: string) => void;
  onDownload: (msg: Message) => void;
  onDocumentPayment: (paymentReqId: string, amount: number) => void;
  onHighlight: (id: string) => void;
}

function groupMessagesByDate(messages: Message[]) {
  const groups: { dateStr: string; dateKey: string; msgs: Message[] }[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  messages.forEach((msg) => {
    const dateObj = new Date(msg.sentAt);
    const dateKey = dateObj.toLocaleDateString();

    let dateStr = dateObj.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
    if (dateObj.toDateString() === today.toDateString()) dateStr = "Today";
    else if (dateObj.toDateString() === yesterday.toDateString()) dateStr = "Yesterday";

    const last = groups[groups.length - 1];
    if (last && last.dateKey === dateKey) {
      last.msgs.push(msg);
    } else {
      groups.push({ dateStr, dateKey, msgs: [msg] });
    }
  });

  return groups;
}

export default function MessageList({
  messages,
  currentUserId,
  activeChatPartner,
  role,
  hasMoreMessages,
  isLoadingMore,
  firstUnreadMessageId,
  highlightedMessageId,
  uploadProgresses,
  failedUploads,
  downloadingFiles,
  scrollContainerRef,
  messagesEndRef,
  firstUnreadRef,
  isDocumentUnlocked,
  onLoadMore,
  onReply,
  onRetryUpload,
  onDownload,
  onDocumentPayment,
  onHighlight,
}: MessageListProps) {
  const groups = groupMessagesByDate(messages);

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50"
    >
      {hasMoreMessages && (
        <div className="w-full flex justify-center py-2 mb-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
          >
            {isLoadingMore ? "Loading..." : "Load older messages"}
          </button>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.dateKey} className="flex flex-col gap-4">
          {/* Date divider */}
          <div className="flex justify-center my-2 w-full sticky top-[-1rem] sm:top-[-0.5rem] z-10">
            <span className="bg-stone-200/95 backdrop-blur-sm text-stone-600 text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full font-bold shadow-sm border border-stone-200/50">
              {group.dateStr}
            </span>
          </div>

          {group.msgs.map((msg) => (
            <MessageBubble
              key={msg._id}
              msg={msg}
              isMe={msg.senderId === currentUserId}
              activeChatPartner={activeChatPartner}
              isFirstUnread={msg._id === firstUnreadMessageId}
              firstUnreadRef={firstUnreadRef}
              highlightedMessageId={highlightedMessageId}
              role={role}
              isDocumentUnlocked={isDocumentUnlocked}
              uploadProgresses={uploadProgresses}
              failedUploads={failedUploads}
              downloadingFiles={downloadingFiles}
              onReply={onReply}
              onRetryUpload={onRetryUpload}
              onDownload={onDownload}
              onDocumentPayment={onDocumentPayment}
              onHighlight={onHighlight}
            />
          ))}
        </div>
      ))}

      <div ref={messagesEndRef} />
    </div>
  );
}
