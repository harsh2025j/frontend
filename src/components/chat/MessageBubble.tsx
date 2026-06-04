"use client";

import React from "react";
import {
  Check,
  CheckCheck,
  Reply,
  FileText,
  DollarSign,
  FileCheck,
  Download,
  Lock,
} from "lucide-react";
import { Message } from "@/data/features/chat/chat.types";
import { toast } from "react-hot-toast";

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

interface MessageBubbleProps {
  msg: Message;
  isMe: boolean;
  activeChatPartner: any;
  isFirstUnread: boolean;
  firstUnreadRef: React.RefObject<HTMLDivElement | null>;
  highlightedMessageId: string | null;
  role: "user" | "advocate";
  isDocumentUnlocked: (metadata: any) => boolean;
  uploadProgresses: Record<string, number>;
  failedUploads: Record<string, File>;
  downloadingFiles: Record<string, boolean>;
  onReply: (msg: Message) => void;
  onRetryUpload: (file: File, messageId: string) => void;
  onDownload: (msg: Message) => void;
  onDocumentPayment: (paymentReqId: string, amount: number) => void;
  onHighlight: (id: string) => void;
}

export default function MessageBubble({
  msg,
  isMe,
  activeChatPartner,
  isFirstUnread,
  firstUnreadRef,
  highlightedMessageId,
  role,
  isDocumentUnlocked,
  uploadProgresses,
  failedUploads,
  downloadingFiles,
  onReply,
  onRetryUpload,
  onDownload,
  onDocumentPayment,
  onHighlight,
}: MessageBubbleProps) {
  const formattedTime = new Date(msg.sentAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <React.Fragment>
      {isFirstUnread && (
        <div ref={firstUnreadRef} className="flex justify-center my-6 w-full">
          <span className="bg-stone-200 text-stone-600 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm">
            Unread Messages
          </span>
        </div>
      )}

      <div
        id={`message-${msg._id}`}
        className={`w-full flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 group p-2 rounded-2xl transition-all duration-700 ${
          highlightedMessageId === msg._id
            ? "bg-amber-100/50 scale-[1.02] shadow-sm"
            : ""
        }`}
      >
        {/* Partner avatar */}
        {!isMe && (
          <div className="w-7 h-7 rounded-md bg-[#0A2342]/5 flex items-center justify-center font-bold text-xs text-[#C9A227] shrink-0 mb-1">
            {(typeof activeChatPartner === "string"
              ? activeChatPartner
              : (activeChatPartner as any)?.name
            )
              ?.charAt(0)
              .toUpperCase() || "U"}
          </div>
        )}

        {/* My reply button (left of bubble) */}
        {isMe && (
          <button
            onClick={() => onReply(msg)}
            className="p-1.5 text-stone-400 hover:text-[#0A2342] hover:bg-stone-200 rounded-full transition-all mb-4 shrink-0"
            title="Reply"
          >
            <Reply size={15} className="-scale-x-100" />
          </button>
        )}

        <div className="max-w-[85%] md:max-w-[65%] flex flex-col gap-1 min-w-0">
          {/* Quoted reply block */}
          {msg.metadata?.replyTo && (
            <div
              onClick={() => {
                const el = document.getElementById(
                  `message-${msg.metadata!.replyTo!.messageId}`
                );
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "center" });
                  onHighlight(msg.metadata!.replyTo!.messageId);
                }
              }}
              className={`cursor-pointer px-3 py-2 rounded-xl text-xs border-l-4 mb-1 transition-opacity hover:opacity-80 shadow-sm ${
                isMe
                  ? "bg-[#153a66]/50 border-white/30 text-white/90"
                  : "bg-stone-100 border-[#0A2342]/20 text-stone-600"
              }`}
            >
              <span
                className={`font-bold text-[10px] block mb-0.5 opacity-80 uppercase tracking-wide ${
                  isMe ? "text-white" : "text-[#0A2342]"
                }`}
              >
                {msg.metadata.replyTo.senderName}
              </span>
              <span className="line-clamp-2">{msg.metadata.replyTo.content}</span>
            </div>
          )}

          {/* Text bubble */}
          {msg.type === "text" && (
            <div
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
              className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap min-w-0 ${
                isMe
                  ? "bg-[#0A2342] text-white rounded-br-none shadow-md shadow-[#0A2342]/5"
                  : "bg-white text-stone-800 rounded-bl-none border border-stone-200/60 shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          )}

          {/* Payment request card */}
          {msg.type === "payment_request" && (
            <div className="bg-white border-2 border-amber-500/20 rounded-2xl p-4.5 shadow-md flex flex-col gap-3 min-w-[280px]">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-amber-50 rounded-xl text-amber-600">
                  <DollarSign size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A2342] mb-0.5">
                    Payment Request
                  </h4>
                  <p className="text-xs text-stone-500 line-clamp-2">{msg.content}</p>
                </div>
              </div>

              <div className="h-[1px] bg-stone-100" />

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">AMOUNT</span>
                  <span className="text-lg font-black text-[#0A2342]">
                    ₹{msg.metadata?.amount?.toLocaleString()}
                  </span>
                </div>

                {msg.metadata?.status === "paid" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold">
                    <FileCheck size={14} /> Paid
                  </span>
                ) : role === "user" ? (
                  <button
                    onClick={() =>
                      onDocumentPayment(
                        msg.metadata?.paymentRequestId || "",
                        msg.metadata?.amount || 0
                      )
                    }
                    className="px-4 py-2 bg-[#C9A227] hover:bg-[#B38F20] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-amber-500/20 active:scale-95"
                  >
                    Pay & Unlock
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-xl text-xs font-semibold">
                    Pending Payment
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Document card */}
          {msg.type === "document" &&
            (() => {
              const unlocked = isMe || isDocumentUnlocked(msg.metadata);
              const fileSizeFormatted = msg.metadata?.fileSize
                ? formatFileSize(msg.metadata.fileSize)
                : "Size Unknown";
              const isUploading = msg.deliveryStatus === "uploading";
              const isFailed = msg.deliveryStatus === "failed";

              return (
                <div
                  className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 min-w-[280px] transition-all duration-300 ${
                    unlocked ? "border-stone-200" : "border-amber-500/30 bg-amber-50/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${
                        unlocked ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#0A2342] truncate">
                        {msg.metadata?.fileName}
                      </h4>
                      <span className="text-[10px] text-stone-400 font-medium">
                        {fileSizeFormatted}
                      </span>
                    </div>
                  </div>

                  <div className="h-[1px] bg-stone-100" />

                  {isUploading ? (
                    <div className="w-full relative overflow-hidden bg-stone-100 rounded-xl py-2.5">
                      <div
                        className="absolute inset-y-0 left-0 bg-[#0A2342]/15 transition-all duration-300"
                        style={{ width: `${uploadProgresses[msg._id] || 0}%` }}
                      />
                      <div className="relative z-10 flex items-center justify-center gap-2 text-stone-600 text-[11px] font-bold uppercase tracking-wider">
                        <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-stone-600 border-t-transparent" />
                        {uploadProgresses[msg._id] !== undefined
                          ? `UPLOADING... ${uploadProgresses[msg._id]}%`
                          : "UPLOADING..."}
                      </div>
                    </div>
                  ) : isFailed ? (
                    <div className="w-full flex items-center justify-between py-2 px-3 bg-red-50 text-red-500 rounded-xl border border-red-100">
                      <span className="text-[11px] font-bold uppercase tracking-wider">
                        Upload Failed
                      </span>
                      <button
                        onClick={() =>
                          failedUploads[msg._id] &&
                          onRetryUpload(failedUploads[msg._id], msg._id)
                        }
                        className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase shadow-sm border border-red-200 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  ) : unlocked ? (
                    <button
                      disabled={downloadingFiles[msg._id] || !msg.metadata?.fileUrl}
                      onClick={() => onDownload(msg)}
                      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${
                        downloadingFiles[msg._id]
                          ? "bg-emerald-100 text-emerald-600 cursor-wait"
                          : msg.metadata?.fileUrl
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-stone-200 text-stone-500 cursor-not-allowed"
                      }`}
                    >
                      {downloadingFiles[msg._id] ? (
                        <>
                          <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download size={14} />
                          Download File
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-100 text-stone-400 rounded-xl text-xs font-bold uppercase tracking-wider cursor-not-allowed">
                        <Lock size={14} className="text-amber-500" />
                        Locked (Pay to Access)
                      </div>
                      <p className="text-[9px] text-center text-amber-600/80 font-medium">
                        Pay the pending fee request above to reveal and download this document.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

          {/* Timestamp & delivery status */}
          <div
            className={`flex items-center gap-1.5 text-[9px] text-stone-400 mt-1 ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            <span>{formattedTime}</span>
            {isMe &&
              (msg.deliveryStatus === "seen" ? (
                <CheckCheck size={13} className="text-[#C9A227] ml-0.5" />
              ) : (
                <Check size={13} className="text-stone-300 ml-0.5" />
              ))}
          </div>
        </div>

        {/* Partner reply button (right of bubble) */}
        {!isMe && (
          <button
            onClick={() => onReply(msg)}
            className="p-1.5 text-stone-400 hover:text-[#0A2342] hover:bg-stone-200 rounded-full transition-all mb-4 shrink-0"
            title="Reply"
          >
            <Reply size={15} />
          </button>
        )}
      </div>
    </React.Fragment>
  );
}
