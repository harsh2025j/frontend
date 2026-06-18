"use client";

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-hot-toast";
import axios from "axios";

import { Message, Conversation, MessageType } from "@/data/features/chat/chat.types";
import { ChatServiceAPI } from "@/data/services/chat/chatService";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import { SOCKET_EMIT, SOCKET_ON, SOCKET_NAMESPACE } from "@/data/services/apiConfig/socketConstants";
import { articleApi } from "@/data/services/article-service/article-service";

import ConversationSidebar from "./ConversationSidebar";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";
import DocumentUploadModal from "./DocumentUploadModal";

interface ChatWorkspaceProps {
  role: "user" | "advocate";
  initialRecipientId?: string;
}

export default function ChatWorkspace({ role, initialRecipientId: _initialRecipientId }: ChatWorkspaceProps) {
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const realUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId =
    realUser?.id || realUser?._id || (role === "user" ? "usr_1" : "adv_1");

  // ── Conversations ──────────────────────────────────────────────
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [globalAdvocates, setGlobalAdvocates] = useState<any[]>([]);
  const [conversationsPage, setConversationsPage] = useState(0);
  const [hasMoreConversations, setHasMoreConversations] = useState(true);
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);
  const conversationsObserver = useRef<IntersectionObserver | null>(null);
  const lastConversationElementRef = useRef<HTMLDivElement | null>(null);

  // ── Messages ───────────────────────────────────────────────────
  const [messages, setMessages] = useState<Message[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const firstUnreadRef = useRef<HTMLDivElement | null>(null);
  const isFetchingOlderRef = useRef(false);

  // ── Input ──────────────────────────────────────────────────────
  const [inputText, setInputText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Socket ─────────────────────────────────────────────────────
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ── File upload ────────────────────────────────────────────────
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgresses, setUploadProgresses] = useState<Record<string, number>>({});
  const [failedUploads, setFailedUploads] = useState<Record<string, File>>({});
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
  const [docRequiresPayment, setDocRequiresPayment] = useState(true);
  const [docPaymentAmount, setDocPaymentAmount] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Derived partner info ───────────────────────────────────────
  const activeChatPartner = selectedConv?.participants.find(
    (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
  );
  const activePartnerId =
    typeof activeChatPartner === "string"
      ? activeChatPartner
      : (activeChatPartner as any)?.id || (activeChatPartner as any)?._id;
  const partnerName =
    typeof activeChatPartner === "string"
      ? activeChatPartner
      : (activeChatPartner as any)?.name || "Unknown User";
  const isOnline = !!activePartnerId && onlineUsers.includes(activePartnerId);
  const isPartnerTyping = !!(
    selectedConv &&
    activePartnerId &&
    typingUsers.get(selectedConv._id)?.includes(activePartnerId)
  );

  // ═══════════════════════════════════════════════════════════════
  // Effects
  // ═══════════════════════════════════════════════════════════════

  // Highlight auto-clear
  useEffect(() => {
    if (!highlightedMessageId) return;
    const t = setTimeout(() => setHighlightedMessageId(null), 2000);
    return () => clearTimeout(t);
  }, [highlightedMessageId]);

  // Textarea auto-reset on clear
  useEffect(() => {
    if (inputText === "" && textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [inputText]);

  // Auto-scroll to bottom or first unread
  useEffect(() => {
    if (isFetchingOlderRef.current) {
      isFetchingOlderRef.current = false;
      return;
    }
    if (firstUnreadRef.current) {
      firstUnreadRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedConv]);

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearchQuery(searchQuery), 500);
    return () => clearTimeout(h);
  }, [searchQuery]);

  // Reset pagination on new search
  useEffect(() => {
    setConversationsPage(0);
    setHasMoreConversations(true);
  }, [debouncedSearchQuery]);

  // Fetch conversations + advocate search
  useEffect(() => {
    const load = async () => {
      setIsFetchingConversations(true);
      try {
        const skip = conversationsPage * 20;
        const res = await ChatServiceAPI.getUserConversations(
          currentUserId,
          skip,
          20,
          debouncedSearchQuery
        );
        const data = res?.data?.data?.data || res?.data?.data || res?.data || [];

        if (Array.isArray(data)) {
          if (conversationsPage === 0) {
            setConversations(data);
            if (data.length > 0 && !selectedConv && window.innerWidth >= 768) {
              setSelectedConv(data[0]);
            }
          } else {
            setConversations((prev) => {
              const ids = new Set(prev.map((c) => c._id));
              return [...prev, ...data.filter((c: Conversation) => !ids.has(c._id))];
            });
          }
          setHasMoreConversations(data.length >= 20);
        }

        if (debouncedSearchQuery.trim()) {
          const advRes = await articleApi.searchAdvocates(debouncedSearchQuery, 1, 5);
          let advData: any[] = [];
          if (Array.isArray(advRes?.data?.data?.data)) {
            advData = advRes.data.data.data;
          } else if (Array.isArray(advRes?.data?.data)) {
            advData = advRes.data.data;
          } else if (Array.isArray(advRes?.data?.data?.advocates)) {
            advData = advRes.data.data.advocates;
          } else if (Array.isArray(advRes?.data)) {
            advData = advRes.data;
          }
          setGlobalAdvocates(advData);
        } else {
          setGlobalAdvocates([]);
        }
      } catch {
        // silent — conversations list is non-critical
      } finally {
        setIsFetchingConversations(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchQuery, conversationsPage, currentUserId]);

  // Infinite scroll observer
  useEffect(() => {
    if (isFetchingConversations || !hasMoreConversations) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setConversationsPage((p) => p + 1);
      },
      { threshold: 1.0 }
    );
    if (lastConversationElementRef.current) observer.observe(lastConversationElementRef.current);
    conversationsObserver.current = observer;
    return () => conversationsObserver.current?.disconnect();
  }, [isFetchingConversations, hasMoreConversations, conversations]);

  // Socket init
  useEffect(() => {
    const base = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const newSocket = io(base + SOCKET_NAMESPACE, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on(SOCKET_ON.CONNECT, () => {
      newSocket.emit(SOCKET_EMIT.USER_CONNECTED, currentUserId);
      newSocket.emit(SOCKET_EMIT.GET_ONLINE_USERS);
    });

    newSocket.on(SOCKET_ON.ONLINE_USERS_LIST, (users: string[]) => setOnlineUsers(users));

    newSocket.on(
      SOCKET_ON.USER_STATUS_CHANGED,
      ({ userId, status }: { userId: string; status: string }) => {
        setOnlineUsers((prev) =>
          status === "online"
            ? Array.from(new Set([...prev, userId]))
            : prev.filter((id) => id !== userId)
        );
      }
    );

    newSocket.on(
      SOCKET_ON.USER_TYPING,
      ({ conversationId, userId }: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          const users = next.get(conversationId) || [];
          if (!users.includes(userId)) next.set(conversationId, [...users, userId]);
          return next;
        });
      }
    );

    newSocket.on(
      SOCKET_ON.USER_STOPPED_TYPING,
      ({ conversationId, userId }: { conversationId: string; userId: string }) => {
        setTypingUsers((prev) => {
          const next = new Map(prev);
          next.set(conversationId, (next.get(conversationId) || []).filter((id) => id !== userId));
          return next;
        });
      }
    );

    newSocket.on(SOCKET_ON.NEW_MESSAGE, (msg: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m._id === msg._id)) return prev;
        const temp = prev.find(
          (m) =>
            m._id.toString().startsWith("temp_") &&
            m.senderId === msg.senderId &&
            m.content === msg.content
        );
        return temp ? prev.map((m) => (m._id === temp._id ? msg : m)) : [...prev, msg];
      });
      setConversations((prev) =>
        prev
          .map((c) =>
            c._id === msg.conversationId
              ? {
                ...c,
                lastMessage: {
                  text: msg.content,
                  senderId: msg.senderId,
                  timestamp: msg.sentAt as unknown as string,
                },
                updatedAt: msg.sentAt as unknown as string,
              }
              : c
          )
          .sort((a, b) => new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime())
      );
    });

    newSocket.on(
      SOCKET_ON.MESSAGES_SEEN,
      (data: { conversationId: string; seenBy: string }) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === currentUserId && m.deliveryStatus === "sent"
              ? { ...m, deliveryStatus: "seen" }
              : m
          )
        );
        setConversations((prev) =>
          prev.map((c) => {
            if (c._id === data.conversationId && c.lastMessage?.senderId === currentUserId) {
              return {
                ...c,
                lastMessage: { ...c.lastMessage!, deliveryStatus: "seen" },
              };
            }
            return c;
          })
        );
      }
    );

    newSocket.on(SOCKET_ON.PAYMENT_SUCCESS, (data: any) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (
            m.type === "document" &&
            m.metadata?.paymentRequestId === data.paymentRequestId
          ) {
            const updated = data.messages?.find((msg: any) => msg._id === m._id);
            return updated ? { ...m, metadata: updated.metadata } : m;
          }
          if (
            m.type === "payment_request" &&
            m.metadata?.paymentRequestId === data.paymentRequestId
          ) {
            return { ...m, metadata: { ...m.metadata, status: data.status } };
          }
          return m;
        })
      );
    });

    return () => { newSocket.disconnect(); };
  }, [currentUserId]);

  // Load messages on conversation switch
  useEffect(() => {
    if (!selectedConv || !socket) return;
    socket.emit(SOCKET_EMIT.JOIN_CONVERSATION, {
      conversationId: selectedConv._id,
      userId: currentUserId,
    });

    ChatServiceAPI.getMessages(selectedConv._id, currentUserId, 0, 50)
      .then((res) => {
        const data = res?.data?.data?.data || res?.data?.data || res?.data || [];
        if (!Array.isArray(data)) return;
        const msgs = data.reverse();
        setMessages(msgs);
        setHasMoreMessages(data.length === 50);
        const firstUnread = msgs.find(
          (m) => m.senderId !== currentUserId && m.deliveryStatus !== "seen"
        );
        setFirstUnreadMessageId(firstUnread?._id || null);
        if (firstUnread) {
          socket.emit(SOCKET_EMIT.MARK_SEEN, {
            conversationId: selectedConv._id,
            userId: currentUserId,
          });
        }
      })
      .catch(() => { });
  }, [selectedConv, socket, currentUserId]);

  // Auto-mark incoming as seen while chat is open
  useEffect(() => {
    if (!selectedConv || !socket || messages.length === 0) return;
    const latest = messages[messages.length - 1];
    if (
      latest.senderId !== currentUserId &&
      latest.deliveryStatus === "sent" &&
      latest.conversationId === selectedConv._id
    ) {
      socket.emit(SOCKET_EMIT.MARK_SEEN, {
        conversationId: selectedConv._id,
        userId: currentUserId,
      });
    }
  }, [messages, selectedConv, socket, currentUserId]);

  // ═══════════════════════════════════════════════════════════════
  // Handlers
  // ═══════════════════════════════════════════════════════════════

  const handleSendMessage = (
    type: MessageType = "text",
    textContent?: string,
    meta?: any
  ) => {
    if (!selectedConv || !socket) return;
    const body = textContent || inputText;
    if (!body.trim() && !meta) return;

    const active = selectedConv.participants.find(
      (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
    );
    if (!active) return;

    setFirstUnreadMessageId(null);

    const finalMeta: any = meta || {};
    if (replyingTo) {
      finalMeta.replyTo = {
        messageId: replyingTo._id,
        content: replyingTo.content,
        senderName:
          selectedConv.participants.find(
            (p: any) => p.id === replyingTo.senderId || p._id === replyingTo.senderId
          )?.name || "User",
      };
    }

    const payload = {
      conversationId: selectedConv._id,
      senderId: currentUserId,
      recipientId:
        typeof active === "string" ? active : (active as any).id || (active as any)._id,
      type,
      content: body,
      metadata: Object.keys(finalMeta).length > 0 ? finalMeta : undefined,
    };

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit(SOCKET_EMIT.STOP_TYPING, {
      conversationId: selectedConv._id,
      userId: currentUserId,
    });
    socket.emit(SOCKET_EMIT.SEND_MESSAGE, payload);
    setReplyingTo(null);

    const tempMsg = {
      ...payload,
      _id: "temp_" + Date.now(),
      deliveryStatus: "sent",
      sentAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg as any]);
    setConversations((prev) =>
      prev
        .map((c) =>
          c._id === selectedConv._id
            ? {
              ...c,
              lastMessage: {
                text: body,
                senderId: currentUserId,
                timestamp: tempMsg.sentAt,
              },
              updatedAt: tempMsg.sentAt,
            }
            : c
        )
        .sort(
          (a, b) =>
            new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime()
        )
    );

    if (type === "text") setInputText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    if (!socket || !selectedConv) return;
    socket.emit(SOCKET_EMIT.TYPING, {
      conversationId: selectedConv._id,
      userId: currentUserId,
    });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit(SOCKET_EMIT.STOP_TYPING, {
        conversationId: selectedConv._id,
        userId: currentUserId,
      });
    }, 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 5) {
      toast.error("You can only upload up to 5 files at once.");
      return;
    }
    for (const file of files) {
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 100MB limit.`);
        return;
      }
    }
    setSelectedFiles(files);
    setDocRequiresPayment(true);
    setDocPaymentAmount("");
  };

  const handleFileUpload = async (
    files: File[],
    paymentParams?: { requiresPayment: boolean; amount: number }
  ) => {
    if (!selectedConv || !currentUserId || files.length === 0) return;

    const active = selectedConv.participants.find(
      (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
    );
    const recipientId =
      typeof active === "string" ? active : (active as any)?.id || (active as any)?._id;

    const paymentReqId =
      paymentParams?.requiresPayment ? `pay_req_${Date.now()}` : undefined;

    for (const file of files) {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const initial: any = {
        _id: tempId,
        conversationId: selectedConv._id,
        senderId: currentUserId,
        recipientId,
        type: "document" as MessageType,
        content: `Document: ${file.name}`,
        deliveryStatus: "uploading",
        sentAt: new Date().toISOString(),
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          ...(paymentReqId ? { paymentRequestId: paymentReqId } : {}),
        },
      };
      setMessages((prev) => [...prev, initial]);
      setUploadProgresses((prev) => ({ ...prev, [tempId]: 0 }));

      try {
        const res = await ChatServiceAPI.getPresignedUrl(
          file.name,
          file.type || "application/octet-stream"
        );
        const { presignedUrl, fileUrl } = res.data?.data || res.data;

        await axios.put(presignedUrl, file, {
          headers: { "Content-Type": file.type || "application/octet-stream" },
          onUploadProgress: (evt) => {
            if (evt.total) {
              setUploadProgresses((prev) => ({
                ...prev,
                [tempId]: Math.round((evt.loaded * 100) / evt.total!),
              }));
            }
          },
        });

        const final = { ...initial, metadata: { ...initial.metadata, fileUrl } };
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...final, deliveryStatus: "sent" } : m))
        );
        const { _id, deliveryStatus, sentAt, ...socketPayload } = final;
        socket?.emit(SOCKET_EMIT.SEND_MESSAGE, socketPayload);
      } catch {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? { ...m, deliveryStatus: "failed" } : m))
        );
        setFailedUploads((prev) => ({ ...prev, [tempId]: file }));
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (paymentReqId) {
      const payPayload = {
        conversationId: selectedConv._id,
        senderId: currentUserId,
        recipientId,
        type: "payment_request" as MessageType,
        content: `Payment required to unlock ${files.length} document${files.length > 1 ? "s" : ""}`,
        metadata: {
          paymentRequestId: paymentReqId,
          amount: paymentParams!.amount,
          status: "pending",
        },
      };
      socket?.emit(SOCKET_EMIT.SEND_MESSAGE, payPayload);
      setMessages((prev) => [
        ...prev,
        {
          ...payPayload,
          _id: `temp_${Date.now()}_pay`,
          deliveryStatus: "sent",
          sentAt: new Date().toISOString(),
        } as any,
      ]);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRetryUpload = async (file: File, retryMessageId: string) => {
    setMessages((prev) =>
      prev.map((m) => (m._id === retryMessageId ? { ...m, deliveryStatus: "uploading" } : m))
    );
    setUploadProgresses((prev) => ({ ...prev, [retryMessageId]: 0 }));
    setFailedUploads((prev) => {
      const next = { ...prev };
      delete next[retryMessageId];
      return next;
    });

    try {
      const res = await ChatServiceAPI.getPresignedUrl(
        file.name,
        file.type || "application/octet-stream"
      );
      const { presignedUrl, fileUrl } = res.data?.data || res.data;

      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (evt) => {
          if (evt.total) {
            setUploadProgresses((prev) => ({
              ...prev,
              [retryMessageId]: Math.round((evt.loaded * 100) / evt.total!),
            }));
          }
        },
      });

      let finalPayload: any;
      setMessages((prev) => {
        const msg = prev.find((m) => m._id === retryMessageId);
        if (msg) {
          finalPayload = { ...msg, deliveryStatus: "sent", metadata: { ...msg.metadata, fileUrl } };
          return prev.map((m) => (m._id === retryMessageId ? finalPayload : m));
        }
        return prev;
      });
      if (finalPayload && socket) {
        const { _id, deliveryStatus, sentAt, receivedAt, seenAt, ...sp } = finalPayload;
        socket.emit(SOCKET_EMIT.SEND_MESSAGE, sp);
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m._id === retryMessageId ? { ...m, deliveryStatus: "failed" } : m))
      );
      setFailedUploads((prev) => ({ ...prev, [retryMessageId]: file }));
    }
  };

  const handleDownload = async (msg: Message) => {
    if (!msg.metadata?.fileUrl) {
      toast.error("This file link is expired or missing. Please ask the sender to upload it again.");
      return;
    }
    if (downloadingFiles[msg._id]) return;
    setDownloadingFiles((prev) => ({ ...prev, [msg._id]: true }));
    try {
      const response = await fetch(msg.metadata.fileUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = msg.metadata.fileName || "download";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      window.open(msg.metadata.fileUrl, "_blank");
    } finally {
      setDownloadingFiles((prev) => ({ ...prev, [msg._id]: false }));
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConv || isLoadingMore) return;
    setIsLoadingMore(true);
    isFetchingOlderRef.current = true;
    const container = scrollContainerRef.current;
    const prevHeight = container?.scrollHeight || 0;

    try {
      const res = await ChatServiceAPI.getMessages(
        selectedConv._id,
        currentUserId,
        messages.length,
        50
      );
      const data = res?.data?.data?.data || res?.data?.data || res?.data || [];
      if (Array.isArray(data) && data.length > 0) {
        const older = data.reverse();
        setMessages((prev) => {
          const ids = new Set(prev.map((m) => m._id));
          return [...older.filter((m: Message) => !ids.has(m._id)), ...prev];
        });
        setHasMoreMessages(data.length === 50);
        requestAnimationFrame(() => {
          if (container) container.scrollTop = container.scrollHeight - prevHeight;
        });
      } else {
        setHasMoreMessages(false);
      }
    } catch {
      // silent
    } finally {
      setIsLoadingMore(false);
    }
  };

  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleDocumentPayment = async (paymentReqId: string, amount: number) => {
    if (!selectedConv || !currentUserId) return;
    try {
      const active = selectedConv.participants.find(
        (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
      );
      const advocateId =
        typeof active === "string" ? active : (active as any)?.id || (active as any)?._id;

      const res = await ChatServiceAPI.createPaymentOrder(
        paymentReqId,
        amount,
        currentUserId,
        advocateId
      );
      const orderData = res.data?.data || res.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) { toast.error("Failed to load payment gateway."); return; }

      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Document Unlock",
        description: "Payment to unlock document(s)",
        order_id: orderData.orderId,
        theme: { color: "#0A2342" },
        handler: async (response: any) => {
          try {
            await ChatServiceAPI.verifyPaymentOrder(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            toast.success("Payment successful! Unlocking documents...");
          } catch (err: any) {
            toast.error(err?.response?.data?.message || "Payment verification failed.");
          }
        },
      };
      new (window as any).Razorpay(options).open();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Payment initiation failed");
    }
  };

  const isDocumentUnlocked = (metadata: any) => {
    if (!metadata?.paymentRequestId) return true;
    return (
      messages.find(
        (m) =>
          m.type === "payment_request" &&
          m.metadata?.paymentRequestId === metadata.paymentRequestId
      )?.metadata?.status === "paid"
    );
  };

  const handleStartAdvocateConversation = async (adv: any) => {
    try {
      const res = await ChatServiceAPI.createOrGetConversation([currentUserId, adv._id]);
      const newConv = res.data?.data || res.data;
      if (newConv) {
        setConversations((prev) =>
          prev.find((c) => c._id === newConv._id) ? prev : [newConv, ...prev]
        );
        setSelectedConv(newConv);
        setSearchQuery("");
      }
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // Render
  // ═══════════════════════════════════════════════════════════════

  if (isFetchingConversations && conversations.length === 0) {
    return (
      <div className="relative flex h-full w-full bg-stone-50/70 border border-stone-200/70 md:rounded-xl rounded-sm overflow-hidden backdrop-blur-md">
        {/* Sidebar Skeleton */}
        <div className="absolute inset-0 z-10 md:static md:w-80 border-r border-stone-200/80 bg-white/80 flex flex-col">
          <div className="p-5 border-b border-stone-100 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="h-6 w-32 bg-stone-200 rounded animate-pulse"></div>
              <div className="h-5 w-16 bg-stone-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-10 w-full bg-stone-100 rounded-xl animate-pulse"></div>
          </div>
          <div className="flex-1 p-3 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="w-full flex items-start gap-4 p-4.5 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-stone-200 shrink-0 animate-pulse"></div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex justify-between items-baseline mb-2">
                    <div className="h-4 w-24 bg-stone-200 rounded animate-pulse"></div>
                    <div className="h-3 w-8 bg-stone-200 rounded animate-pulse"></div>
                  </div>
                  <div className="h-3 w-3/4 bg-stone-200 rounded animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Area Skeleton */}
        <div className="hidden md:flex flex-1 flex-col bg-white">
          {/* Header */}
          <div className="h-[73px] border-b border-stone-100 flex items-center px-6 gap-4">
            <div className="w-10 h-10 rounded-full bg-stone-200 animate-pulse"></div>
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 bg-stone-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-stone-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 p-6 flex flex-col justify-end space-y-6">
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse shrink-0"></div>
                <div className="bg-stone-100 rounded-2xl rounded-tl-sm h-16 w-64 animate-pulse"></div>
             </div>
             <div className="flex gap-3 flex-row-reverse">
                <div className="bg-[#0A2342]/10 rounded-2xl rounded-tr-sm h-12 w-48 animate-pulse"></div>
             </div>
             <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse shrink-0"></div>
                <div className="bg-stone-100 rounded-2xl rounded-tl-sm h-24 w-72 animate-pulse"></div>
             </div>
          </div>
          
          {/* Input Area */}
          <div className="p-4 border-t border-stone-100 bg-white">
             <div className="h-12 bg-stone-50 border border-stone-200 rounded-2xl w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full bg-stone-50/70 border border-stone-200/70 md:rounded-xl rounded-sm overflow-hidden backdrop-blur-md">

      {/* Sidebar */}
      <ConversationSidebar
        role={role}
        currentUserId={currentUserId}
        conversations={conversations}
        selectedConv={selectedConv}
        onSelectConv={setSelectedConv}
        onlineUsers={onlineUsers}
        isFetchingConversations={isFetchingConversations}
        hasMoreConversations={hasMoreConversations}
        lastConversationElementRef={lastConversationElementRef}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        debouncedSearchQuery={debouncedSearchQuery}
        globalAdvocates={globalAdvocates}
        onStartAdvocateConversation={handleStartAdvocateConversation}
      />

      {/* Main chat area */}
      <div
        className={`absolute inset-0 z-20 md:static flex-1 flex-col bg-white ${!selectedConv ? "hidden md:flex" : "flex"
          }`}
      >
        {selectedConv ? (
          <>
            <ChatHeader
              partner={activeChatPartner as any}
              partnerName={partnerName}
              isOnline={isOnline}
              isTyping={isPartnerTyping}
              onBack={() => setSelectedConv(null)}
            />

            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              activeChatPartner={activeChatPartner}
              role={role}
              hasMoreMessages={hasMoreMessages}
              isLoadingMore={isLoadingMore}
              firstUnreadMessageId={firstUnreadMessageId}
              highlightedMessageId={highlightedMessageId}
              uploadProgresses={uploadProgresses}
              failedUploads={failedUploads}
              downloadingFiles={downloadingFiles}
              scrollContainerRef={scrollContainerRef}
              messagesEndRef={messagesEndRef}
              firstUnreadRef={firstUnreadRef}
              isDocumentUnlocked={isDocumentUnlocked}
              onLoadMore={loadMoreMessages}
              onReply={setReplyingTo}
              onRetryUpload={handleRetryUpload}
              onDownload={handleDownload}
              onDocumentPayment={handleDocumentPayment}
              onHighlight={setHighlightedMessageId}
            />

            <ChatInput
              inputText={inputText}
              onInputChange={handleInputChange}
              onSend={handleSendMessage}
              onFileSelect={handleFileSelect}
              fileInputRef={fileInputRef}
              textareaRef={textareaRef}
              replyingTo={replyingTo}
              selectedConv={selectedConv}
              onCancelReply={() => setReplyingTo(null)}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8">
            <MessageSquare size={48} className="mb-3 text-stone-300" />
            <p className="text-sm font-semibold">No active conversation selected</p>
            <p className="text-xs text-stone-400 mt-1">
              Select one from the sidebar list to begin.
            </p>
          </div>
        )}
      </div>

      {/* Document upload modal */}
      {selectedFiles.length > 0 && (
        <DocumentUploadModal
          selectedFiles={selectedFiles}
          role={role}
          partnerName={partnerName}
          docRequiresPayment={docRequiresPayment}
          docPaymentAmount={docPaymentAmount}
          onFilesChange={setSelectedFiles}
          onRequiresPaymentChange={setDocRequiresPayment}
          onPaymentAmountChange={setDocPaymentAmount}
          onSend={handleFileUpload}
          onClose={() => {
            setSelectedFiles([]);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }}
        />
      )}
    </div>
  );
}
