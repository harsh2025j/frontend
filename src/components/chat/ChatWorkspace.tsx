"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Paperclip,
  DollarSign,
  Lock,
  Unlock,
  Download,
  Search,
  MessageSquare,
  Check,
  CheckCheck,
  FileText,
  MoreVertical,
  X,
  PlusCircle,
  FileCheck,
  User,
  ShieldCheck,
  ArrowLeft,
  Reply
} from "lucide-react";
import { Message, Conversation, MessageType } from "@/data/features/chat/chat.types";
import { io, Socket } from "socket.io-client";
import { ChatServiceAPI } from "@/data/services/chat/chatService";
import { API_BASE_URL } from "@/data/services/apiConfig/apiContants";
import axios from "axios";

interface ChatWorkspaceProps {
  role: "user" | "advocate";
  initialRecipientId?: string;
}

// -------------------------------------------------------------
// MOCK DATA FOR THE PREVIEW / INTERACTIVE TEST
// -------------------------------------------------------------
const MOCK_PARTICIPANTS = {
  advocate1: {
    id: "adv_1",
    _id: "adv_1",
    name: "Advocate Sajjad Husain",
    username: "sajjadhusain",
    photoUrl: "",
    role: "advocate",
  },
  advocate2: {
    id: "adv_2",
    _id: "adv_2",
    name: "Advocate Alok Sharma",
    username: "aloksharma",
    photoUrl: "",
    role: "advocate",
  },
  user1: {
    id: "usr_1",
    _id: "usr_1",
    name: "Keshav Pathak",
    username: "keshav",
    photoUrl: "",
    role: "client",
  },
  user2: {
    id: "usr_2",
    _id: "usr_2",
    name: "Vikram Malhotra",
    username: "vikram",
    photoUrl: "",
    role: "client",
  }
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    _id: "conv_1",
    participants: [MOCK_PARTICIPANTS.user1, MOCK_PARTICIPANTS.advocate1],
    lastMessage: {
      text: "Draft document for the land registration case is ready.",
      senderId: "adv_1",
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
    },
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    _id: "conv_2",
    participants: [MOCK_PARTICIPANTS.user1, MOCK_PARTICIPANTS.advocate2],
    lastMessage: {
      text: "Yes, we can file the petition by tomorrow morning.",
      senderId: "adv_2",
      timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  }
];

const INITIAL_MOCK_MESSAGES: Message[] = [
  {
    _id: "msg_1",
    conversationId: "conv_1",
    senderId: "usr_1",
    recipientId: "adv_1",
    type: "text",
    content: "Greetings sir, I need the case summary draft and the deeds record for our land registry. Could you please share it here?",
    deliveryStatus: "seen",
    sentAt: new Date(Date.now() - 20 * 60000).toISOString(),
  },
  {
    _id: "msg_2",
    conversationId: "conv_1",
    senderId: "adv_1",
    recipientId: "usr_1",
    type: "text",
    content: "Hello Keshav. Sure, I have finalized the draft report. It took some research so there will be a nominal compilation fee of ₹1,500. Let me send a payment request link.",
    deliveryStatus: "seen",
    sentAt: new Date(Date.now() - 15 * 60000).toISOString(),
  },
  {
    _id: "msg_3",
    conversationId: "conv_1",
    senderId: "adv_1",
    recipientId: "usr_1",
    type: "payment_request",
    content: "Compilation and formatting charge for Deeds Registry summary report",
    metadata: {
      paymentRequestId: "pay_req_001",
      amount: 1500,
      status: "pending",
    },
    deliveryStatus: "seen",
    sentAt: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    _id: "msg_4",
    conversationId: "conv_1",
    senderId: "adv_1",
    recipientId: "usr_1",
    type: "document",
    content: "Premium Case Deeds Registry Report Draft",
    metadata: {
      fileName: "land_registry_summary_final.pdf",
      fileSize: 1024 * 1024 * 1.8, // 1.8 MB
      fileUrl: "https://example.com/protected/land_registry_summary_final.pdf",
      paymentRequestId: "pay_req_001", // linked to this payment
    },
    deliveryStatus: "seen",
    sentAt: new Date(Date.now() - 10 * 60000).toISOString(),
  }
];

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function ChatWorkspace({ role, initialRecipientId }: ChatWorkspaceProps) {
  const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const realUser = userStr ? JSON.parse(userStr) : null;
  const currentUserId = realUser?.id || realUser?._id || (role === "user" ? "usr_1" : "adv_1");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);

  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [typingUsers, setTypingUsers] = useState<Map<string, string[]>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal states for Advocate action
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payAmount, setPayAmount] = useState("1000");
  const [payDesc, setPayDesc] = useState("");

  // Modal states for Document upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgresses, setUploadProgresses] = useState<Record<string, number>>({});
  const [failedUploads, setFailedUploads] = useState<Record<string, File>>({});
  const [downloadingFiles, setDownloadingFiles] = useState<Record<string, boolean>>({});
  const [showDocModal, setShowDocModal] = useState(false);
  const [docName, setDocName] = useState("");
  const [isLockedDoc, setIsLockedDoc] = useState(false);
  const [linkedPayReqId, setLinkedPayReqId] = useState("");
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const firstUnreadRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const isFetchingOlderRef = useRef(false);

  // Auto scroll to bottom or first unread
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

  // Reset textarea height when input clears
  useEffect(() => {
    if (inputText === "" && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [inputText]);

  // Initial Data Fetch & Socket Connection
  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await ChatServiceAPI.getUserConversations(currentUserId);
        // Robust unwrapping: some backend builds double wrap in { success, data: { success, data: [] } }
        const actualData = res?.data?.data?.data || res?.data?.data || res?.data || [];

        if (Array.isArray(actualData)) {
          setConversations(actualData);
          if (actualData.length > 0) setSelectedConv(actualData[0]);
        }
      } catch (err) {
        console.error("Failed to fetch conversations", err);
      }
    };
    initChat();

    // The backend gateway is on /chat namespace
    const socketUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
    const newSocket = io(socketUrl + "/chat", { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Live Chat Connected!");
      newSocket.emit("user_connected", currentUserId);
      newSocket.emit("get_online_users");
    });

    newSocket.on("online_users_list", (users: string[]) => {
      setOnlineUsers(users);
    });

    newSocket.on("user_status_changed", ({ userId, status }: { userId: string, status: string }) => {
      setOnlineUsers(prev => {
        if (status === "online") {
          return Array.from(new Set([...prev, userId]));
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    newSocket.on("user_typing", ({ conversationId, userId }: { conversationId: string, userId: string }) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        const users = next.get(conversationId) || [];
        if (!users.includes(userId)) {
          next.set(conversationId, [...users, userId]);
        }
        return next;
      });
    });

    newSocket.on("user_stopped_typing", ({ conversationId, userId }: { conversationId: string, userId: string }) => {
      setTypingUsers(prev => {
        const next = new Map(prev);
        const users = next.get(conversationId) || [];
        next.set(conversationId, users.filter(id => id !== userId));
        return next;
      });
    });

    newSocket.on("new_message", (msg: Message) => {
      setMessages(prev => {
        // Prevent exact duplicates
        if (prev.find(m => m._id === msg._id)) return prev;

        // Replace optimistic temp message if found
        const tempMsg = prev.find(m =>
          m._id.toString().startsWith("temp_") &&
          m.senderId === msg.senderId &&
          m.content === msg.content
        );

        if (tempMsg) {
          return prev.map(m => m._id === tempMsg._id ? msg : m);
        }

        return [...prev, msg];
      });
      setConversations(prev =>
        prev.map(c =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: { text: msg.content, senderId: msg.senderId, timestamp: msg.sentAt as unknown as string }, updatedAt: msg.sentAt as unknown as string }
            : c
        ).sort((a, b) => new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime())
      );
    });

    newSocket.on("messages_seen", (data: { conversationId: string; seenBy: string }) => {
      // Update local messages to seen
      setMessages(prev => prev.map(m => {
        if (m.senderId === currentUserId && m.deliveryStatus === 'sent') {
          return { ...m, deliveryStatus: 'seen' };
        }
        return m;
      }));

      // Update conversation list lastMessage
      setConversations(prev => prev.map(c => {
        if (c._id === data.conversationId && c.lastMessage && c.lastMessage.senderId === currentUserId) {
          return {
            ...c,
            lastMessage: {
              text: c.lastMessage.text || "",
              senderId: c.lastMessage.senderId,
              timestamp: c.lastMessage.timestamp,
              deliveryStatus: 'seen'
            }
          };
        }
        return c;
      }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUserId]);

  // Handle Conversation Switch
  useEffect(() => {
    if (selectedConv && socket) {
      socket.emit("join_conversation", { conversationId: selectedConv._id, userId: currentUserId });

      ChatServiceAPI.getMessages(selectedConv._id, 0, 50).then(res => {
        const actualData = res?.data?.data?.data || res?.data?.data || res?.data || [];
        if (Array.isArray(actualData)) {
          // Reverse because API sorts -1 (newest first), but UI needs oldest first top-to-bottom
          const msgs = actualData.reverse();
          setMessages(msgs);
          setHasMoreMessages(actualData.length === 50);

          const firstUnread = msgs.find(m => m.senderId !== currentUserId && m.deliveryStatus !== "seen");
          setFirstUnreadMessageId(firstUnread ? firstUnread._id : null);

          // Only emit mark_seen if there are actually unread messages, and AFTER we calculate the first unread
          if (firstUnread) {
            socket.emit("mark_seen", { conversationId: selectedConv._id, userId: currentUserId });
          }
        }
      }).catch(err => console.error("Failed to load messages", err));
    }
  }, [selectedConv, socket, currentUserId]);

  // Auto-mark new incoming messages as seen if we are actively viewing the chat
  useEffect(() => {
    if (selectedConv && socket && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      if (
        latestMsg.senderId !== currentUserId &&
        latestMsg.deliveryStatus === "sent" &&
        latestMsg.conversationId === selectedConv._id
      ) {
        socket.emit("mark_seen", { conversationId: selectedConv._id, userId: currentUserId });
      }
    }
  }, [messages, selectedConv, socket, currentUserId]);

  // Handle send message
  const handleSendMessage = (type: MessageType = "text", textContent?: string, meta?: any) => {
    if (!selectedConv || !socket) return;
    const body = textContent || inputText;
    if (!body.trim() && !meta) return;

    const activeParticipant = selectedConv.participants.find(
      (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
    );
    if (!activeParticipant) return;

    // Clear the unread banner as soon as they reply
    setFirstUnreadMessageId(null);

    const finalMeta = meta || {};
    if (replyingTo) {
      finalMeta.replyTo = {
        messageId: replyingTo._id,
        content: replyingTo.content,
        senderName: selectedConv.participants.find((p: any) => p.id === replyingTo.senderId || p._id === replyingTo.senderId)?.name || "User",
      };
    }

    const payload = {
      conversationId: selectedConv._id,
      senderId: currentUserId,
      recipientId: typeof activeParticipant === "string" ? activeParticipant : (activeParticipant as any).id || (activeParticipant as any)._id,
      type,
      content: body,
      metadata: Object.keys(finalMeta).length > 0 ? finalMeta : undefined,
    };

    // Emit live to backend
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stop_typing", { conversationId: selectedConv._id, userId: currentUserId });
    socket.emit("send_message", payload);
    setReplyingTo(null);

    // Optimistically add message to UI immediately
    const tempMsg = {
      ...payload,
      _id: "temp_" + Date.now(),
      deliveryStatus: "sent",
      sentAt: new Date().toISOString()
    };
    setMessages((prev) => [...prev, tempMsg as any]);

    // Optimistically update the sidebar conversation list
    setConversations(prev =>
      prev.map(c =>
        c._id === selectedConv._id
          ? { ...c, lastMessage: { text: body, senderId: currentUserId, timestamp: tempMsg.sentAt }, updatedAt: tempMsg.sentAt }
          : c
      ).sort((a, b) => new Date(b.updatedAt || "").getTime() - new Date(a.updatedAt || "").getTime())
    );

    if (type === "text") setInputText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }

    if (!socket || !selectedConv) return;

    socket.emit("typing", { conversationId: selectedConv._id, userId: currentUserId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { conversationId: selectedConv._id, userId: currentUserId });
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() || linkedPayReqId) {
        handleSendMessage();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        alert("File size exceeds 100MB limit.");
        return;
      }
      setSelectedFile(file);
      setShowAttachmentMenu(false);
    }
  };

  const handleFileUpload = async (file: File, retryMessageId?: string) => {
    if (!selectedConv || !currentUserId) return;

    const activeParticipant = selectedConv.participants.find(
      (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
    );
    const recipientId = typeof activeParticipant === "string" ? activeParticipant : (activeParticipant as any)?.id || (activeParticipant as any)?._id;

    const tempId = retryMessageId || `temp_${Date.now()}`;

    if (!retryMessageId) {
      const initialPayload = {
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
        }
      };
      setMessages((prev) => [...prev, initialPayload as any]);
    } else {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, deliveryStatus: "uploading" } : m));
    }

    setUploadProgresses(prev => ({ ...prev, [tempId]: 0 }));
    setFailedUploads(prev => {
      const next = { ...prev };
      delete next[tempId];
      return next;
    });

    try {
      const response = await ChatServiceAPI.getPresignedUrl(file.name, file.type || "application/octet-stream");
      // Safely extract from response.data.data (if wrapped by interceptor) or response.data
      const { presignedUrl, fileUrl } = response.data?.data || response.data;

      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type || "application/octet-stream" },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgresses(prev => ({ ...prev, [tempId]: percentCompleted }));
          }
        }
      });

      const finalPayload = {
        conversationId: selectedConv._id,
        senderId: currentUserId,
        recipientId,
        type: "document" as MessageType,
        content: `Document: ${file.name}`,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          fileUrl,
        }
      };

      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, deliveryStatus: "sent", metadata: { ...m.metadata, fileUrl } } : m));
      socket?.emit("send_message", finalPayload);

    } catch (err) {
      console.error("Upload failed", err);
      setUploadProgresses(prev => { const n = { ...prev }; delete n[tempId]; return n; });
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, deliveryStatus: "failed" } : m));
      setFailedUploads(prev => ({ ...prev, [tempId]: file }));
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setUploadProgresses(prev => {
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
    }
  };

  const loadMoreMessages = async () => {
    if (!selectedConv || isLoadingMore) return;
    setIsLoadingMore(true);
    isFetchingOlderRef.current = true;
    
    const container = scrollContainerRef.current;
    const previousScrollHeight = container ? container.scrollHeight : 0;

    try {
      const res = await ChatServiceAPI.getMessages(selectedConv._id, messages.length, 50);
      const actualData = res?.data?.data?.data || res?.data?.data || res?.data || [];
      if (Array.isArray(actualData) && actualData.length > 0) {
        const olderMsgs = actualData.reverse();
        setMessages(prev => {
          // Filter out duplicates to be safe
          const existingIds = new Set(prev.map(m => m._id));
          const uniqueOlder = olderMsgs.filter(m => !existingIds.has(m._id));
          return [...uniqueOlder, ...prev];
        });
        setHasMoreMessages(actualData.length === 50);
        
        // Maintain scroll position after React renders new messages
        requestAnimationFrame(() => {
          if (container) {
            const newScrollHeight = container.scrollHeight;
            container.scrollTop = newScrollHeight - previousScrollHeight;
          }
        });
        
      } else {
        setHasMoreMessages(false);
      }
    } catch (err) {
      console.error("Failed to load more messages", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Mock checkout handler for Client
  const handleMockPayment = (paymentReqId: string) => {
    // 1. Update the payment request message state locally
    setMessages(prev =>
      prev.map(m => {
        if (m.type === "payment_request" && m.metadata?.paymentRequestId === paymentReqId) {
          return {
            ...m,
            metadata: {
              ...m.metadata,
              status: "paid",
              transactionId: `tx_mock_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            }
          };
        }
        return m;
      })
    );

    // 2. Play nice notification or alerts
    alert("Payment of ₹1,500 Completed Successfully! Document Unlocked.");
  };

  // Check if a document is unlocked
  const isDocumentUnlocked = (metadata: any) => {
    if (!metadata?.paymentRequestId) return true; // free document
    const relatedPayment = messages.find(
      m => m.type === "payment_request" && m.metadata?.paymentRequestId === metadata.paymentRequestId
    );
    return relatedPayment?.metadata?.status === "paid";
  };

  // Current active chat partner info
  const activeChatPartner = selectedConv?.participants.find(
    (p: any) => p !== currentUserId && p.id !== currentUserId && p._id !== currentUserId
  );
  const activePartnerId = typeof activeChatPartner === "string" ? activeChatPartner : (activeChatPartner as any)?.id || (activeChatPartner as any)?._id;
  const partnerName = typeof activeChatPartner === "string" ? activeChatPartner : (activeChatPartner as any)?.name || "Unknown User";
  const isOnline = activePartnerId && onlineUsers.includes(activePartnerId);
  const isPartnerTyping = selectedConv && activePartnerId && typingUsers.get(selectedConv._id)?.includes(activePartnerId);

  return (
    <div className="relative flex h-full w-full bg-stone-50/70 border border-stone-200/60 md:rounded-3xl overflow-hidden md:shadow-2xl backdrop-blur-md">
      {/* -------------------------------------------------------------
          SIDEBAR: THREAD LIST
          ------------------------------------------------------------- */}
      <div className={`absolute inset-0 z-10 md:static md:w-80 border-r border-stone-200/80 bg-white/80 flex-col ${selectedConv ? "hidden md:flex" : "flex"}`}>
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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A2342]/10 focus:border-[#0A2342] text-sm transition-all"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations
            .filter((c) => {
              const partner = c.participants.find((p: any) => p !== currentUserId && p.id !== currentUserId);
              const partnerName = typeof partner === "string" ? partner : (partner as any)?.name || "Unknown";
              return partnerName.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .map((conv) => {
              const partner = conv.participants.find((p: any) => p !== currentUserId && p.id !== currentUserId);
              const partnerName = typeof partner === "string" ? partner : (partner as any)?.name || "Unknown User";
              const partnerRole = typeof partner === "string" ? "user" : (partner as any)?.role;
              const isSelected = selectedConv?._id === conv._id;
              const formattedTime = conv.lastMessage?.timestamp
                ? new Date(conv.lastMessage.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "";

              return (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConv(conv)}
                  className={`w-full flex items-start gap-4 p-4.5 rounded-2xl text-left transition-all duration-300 ${isSelected
                    ? "bg-[#0A2342] text-white shadow-xl shadow-[#0A2342]/10"
                    : "hover:bg-stone-100 text-stone-800"
                    }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#0A2342]/5 border border-[#0A2342]/10 flex items-center justify-center font-bold text-lg text-[#C9A227] shrink-0 relative">
                    {(partner as any)?.profilePicture || (partner as any)?.photoUrl ? (
                      <img src={(partner as any).profilePicture || (partner as any).photoUrl} alt="Profile" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      partnerName.charAt(0).toUpperCase() || "U"
                    )}
                    {partnerRole === "advocate" && (
                      <span className="absolute -bottom-1 -right-1 bg-[#C9A227] text-white p-0.5 rounded-full border border-white">
                        <ShieldCheck size={10} />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className={`font-semibold text-sm truncate ${isSelected ? "text-white" : "text-stone-900"}`}>
                        {partnerName}
                      </span>
                      <span className={`text-[10px] font-medium shrink-0 ${isSelected ? "text-stone-300" : "text-stone-400"}`}>
                        {formattedTime}
                      </span>
                    </div>
                    <p className={`text-xs truncate ${isSelected ? "text-stone-200" : "text-stone-500"} flex items-center`}>
                      {conv.lastMessage && conv.lastMessage.senderId === currentUserId && (
                        conv.lastMessage.deliveryStatus === "seen" ? (
                          <CheckCheck size={14} className={`mr-1 shrink-0 ${isSelected ? "text-[#E6CD73]" : "text-[#C9A227]"}`} />
                        ) : (
                          <Check size={14} className={`mr-1 shrink-0 ${isSelected ? "text-stone-300" : "text-stone-400"}`} />
                        )
                      )}
                      <span className="truncate">{conv.lastMessage?.text}</span>
                    </p>
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {/* -------------------------------------------------------------
          MAIN CHAT SCREEN
          ------------------------------------------------------------- */}
      <div className={`absolute inset-0 z-20 md:static flex-1 flex-col bg-white ${!selectedConv ? "hidden md:flex" : "flex"}`}>
        {selectedConv ? (
          <>
            {/* Header info */}
            <div className="h-16 px-6 border-b border-stone-200/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedConv(null)} className="md:hidden p-1.5 -ml-2 rounded-lg hover:bg-stone-100 text-stone-600 transition-colors">
                  <ArrowLeft size={20} />
                </button>
                <div className="w-9 h-9 rounded-lg bg-[#0A2342]/5 flex items-center justify-center font-semibold text-[#C9A227] relative">
                  {(activeChatPartner as any)?.profilePicture || (activeChatPartner as any)?.photoUrl ? (
                    <img src={(activeChatPartner as any).profilePicture || (activeChatPartner as any).photoUrl} alt="Profile" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    partnerName.charAt(0).toUpperCase() || "U"
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0A2342]">
                    {partnerName}
                  </h3>
                  {isPartnerTyping ? (
                    <span className="text-[10px] text-blue-500 font-medium italic animate-pulse">typing...</span>
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

              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-stone-100 rounded-lg text-stone-500 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* Message Area */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-stone-50/50">
              {hasMoreMessages && (
                <div className="w-full flex justify-center py-2 mb-4">
                  <button
                    onClick={loadMoreMessages}
                    disabled={isLoadingMore}
                    className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {isLoadingMore ? "Loading..." : "Load older messages"}
                  </button>
                </div>
              )}
              {messages.map((msg, index) => {
                const isMe = msg.senderId === currentUserId;
                const formattedTime = new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const isFirstUnread = msg._id === firstUnreadMessageId;

                return (
                  <React.Fragment key={msg._id}>
                    {isFirstUnread && (
                      <div ref={firstUnreadRef} className="flex justify-center my-6">
                        <span className="bg-stone-200 text-stone-600 text-xs px-4 py-1.5 rounded-full font-medium shadow-sm">
                          Unread Messages
                        </span>
                      </div>
                    )}
                    <div
                      id={`message-${msg._id}`}
                      className={`w-full flex ${isMe ? "justify-end" : "justify-start"} items-end gap-2 group`}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-md bg-[#0A2342]/5 flex items-center justify-center font-bold text-xs text-[#C9A227] shrink-0 mb-1">
                          {/* {(activeChatPartner as any)?.profilePicture || (activeChatPartner as any)?.photoUrl ? (
                            <img src={(activeChatPartner as any).profilePicture || (activeChatPartner as any).photoUrl} alt="Profile" className="w-full h-full object-cover rounded-md" />
                          ) : (
                            (typeof activeChatPartner === "string" ? activeChatPartner : (activeChatPartner as any)?.name)?.charAt(0).toUpperCase() || "U"
                          )} */}
                          {
                            (typeof activeChatPartner === "string" ? activeChatPartner : (activeChatPartner as any)?.name)?.charAt(0).toUpperCase() || "U"
                          }
                        </div>
                      )}

                      {isMe && (
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1.5 text-stone-400 hover:text-[#0A2342] hover:bg-stone-200 rounded-full transition-all mb-4 shrink-0"
                          title="Reply"
                        >
                          <Reply size={15} className="-scale-x-100" />
                        </button>
                      )}

                      <div className="max-w-[85%] md:max-w-[65%] flex flex-col gap-1 min-w-0">
                        {/* Render Reply Quoted Block */}
                        {msg.metadata?.replyTo && (
                          <div 
                            onClick={() => {
                              const el = document.getElementById(`message-${msg.metadata!.replyTo!.messageId}`);
                              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }}
                            className={`cursor-pointer px-3 py-2 rounded-xl text-xs border-l-4 mb-1 transition-opacity hover:opacity-80 shadow-sm ${isMe ? 'bg-[#153a66]/50 border-white/30 text-white/90' : 'bg-stone-100 border-[#0A2342]/20 text-stone-600'}`}
                          >
                            <span className={`font-bold text-[10px] block mb-0.5 opacity-80 uppercase tracking-wide ${isMe ? 'text-white' : 'text-[#0A2342]'}`}>
                              {msg.metadata.replyTo.senderName}
                            </span>
                            <span className="line-clamp-2">{msg.metadata.replyTo.content}</span>
                          </div>
                        )}

                        {/* Render standard text bubble */}
                        {msg.type === "text" && (
                          <div
                            style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
                            className={`px-4.5 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap min-w-0 ${isMe
                              ? "bg-[#0A2342] text-white rounded-br-none shadow-md shadow-[#0A2342]/5"
                              : "bg-white text-stone-800 rounded-bl-none border border-stone-200/60 shadow-sm"
                              }`}
                          >
                            {msg.content}
                          </div>
                        )}

                        {/* Render Payment Request Card */}
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
                                <p className="text-xs text-stone-500 line-clamp-2">
                                  {msg.content}
                                </p>
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
                                  onClick={() => handleMockPayment(msg.metadata?.paymentRequestId || "")}
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

                        {/* Render Document Share Card */}
                        {msg.type === "document" && (() => {
                          const isUnlocked = isDocumentUnlocked(msg.metadata);
                          const fileSizeFormatted = msg.metadata?.fileSize
                            ? formatFileSize(msg.metadata.fileSize)
                            : "Size Unknown";
                          const isUploading = msg.deliveryStatus === "uploading";
                          const isFailed = msg.deliveryStatus === "failed";

                          return (
                            <div className={`bg-white border rounded-2xl p-4 shadow-sm flex flex-col gap-3 min-w-[280px] transition-all duration-300 ${isUnlocked ? "border-stone-200" : "border-amber-500/30 bg-amber-50/10"
                              }`}>
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-xl ${isUnlocked ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                                  }`}>
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
                                  ></div>
                                  <div className="relative z-10 flex items-center justify-center gap-2 text-stone-600 text-[11px] font-bold uppercase tracking-wider">
                                    <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-stone-600 border-t-transparent"></span>
                                    {uploadProgresses[msg._id] !== undefined ? `UPLOADING... ${uploadProgresses[msg._id]}%` : "UPLOADING..."}
                                  </div>
                                </div>
                              ) : isFailed ? (
                                <div className="w-full flex items-center justify-between py-2 px-3 bg-red-50 text-red-500 rounded-xl border border-red-100">
                                  <span className="text-[11px] font-bold uppercase tracking-wider">Upload Failed</span>
                                  <button
                                    onClick={() => failedUploads[msg._id] && handleFileUpload(failedUploads[msg._id], msg._id)}
                                    className="px-3 py-1 bg-white hover:bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase shadow-sm border border-red-200 transition-colors"
                                  >
                                    Retry
                                  </button>
                                </div>
                              ) : isUnlocked ? (
                                <button
                                  disabled={downloadingFiles[msg._id] || !msg.metadata?.fileUrl}
                                  onClick={async (e) => {
                                    e.preventDefault();
                                    if (!msg.metadata?.fileUrl) {
                                      alert("This file link is expired or missing. Please ask the sender to upload it again.");
                                      return;
                                    }
                                    if (downloadingFiles[msg._id]) return;

                                    try {
                                      setDownloadingFiles(prev => ({ ...prev, [msg._id]: true }));
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
                                    } catch (err) {
                                      console.error("Download failed, opening in new tab instead", err);
                                      window.open(msg.metadata.fileUrl, "_blank");
                                    } finally {
                                      setDownloadingFiles(prev => ({ ...prev, [msg._id]: false }));
                                    }
                                  }}
                                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 ${downloadingFiles[msg._id]
                                      ? "bg-emerald-100 text-emerald-600 cursor-wait"
                                      : msg.metadata?.fileUrl
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                        : "bg-stone-200 text-stone-500 cursor-not-allowed"
                                    }`}
                                >
                                  {downloadingFiles[msg._id] ? (
                                    <>
                                      <span className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-emerald-600 border-t-transparent"></span>
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

                        {/* Timestamp & Status checks */}
                        <div className={`flex items-center gap-1.5 text-[9px] text-stone-400 mt-1 ${isMe ? "justify-end" : "justify-start"
                          }`}>
                          <span>{formattedTime}</span>
                          {isMe && (
                            msg.deliveryStatus === "seen" ? (
                              <CheckCheck size={13} className="text-[#C9A227] ml-0.5" />
                            ) : (
                              <Check size={13} className="text-stone-300 ml-0.5" />
                            )
                          )}
                        </div>
                      </div>

                      {!isMe && (
                        <button
                          onClick={() => setReplyingTo(msg)}
                          className="p-1.5 text-stone-400 hover:text-[#0A2342] hover:bg-stone-200 rounded-full transition-all mb-4 shrink-0"
                          title="Reply"
                        >
                          <Reply size={15} />
                        </button>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Toolbar & Bar */}
            <div className="border-t border-stone-200/80 p-4 bg-white flex flex-col gap-3 relative">
              {replyingTo && (
                <div className="flex items-start justify-between bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm -mb-1 animate-in slide-in-from-bottom-2 fade-in duration-200">
                  <div className="flex flex-col min-w-0 border-l-4 border-[#C9A227] pl-3">
                    <span className="font-bold text-[10px] uppercase tracking-widest text-[#0A2342] mb-0.5">
                      Replying to {selectedConv?.participants.find((p: any) => p.id === replyingTo.senderId || p._id === replyingTo.senderId)?.name || "User"}
                    </span>
                    <span className="text-stone-600 text-xs line-clamp-1 italic">{replyingTo.content}</span>
                  </div>
                  <button onClick={() => setReplyingTo(null)} className="p-1 hover:bg-stone-200 rounded-full text-stone-500 ml-2 shrink-0 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              )}
              {/* Text Input Row */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3 relative"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept={role === "advocate" ? ".pdf,.doc,.docx,image/*" : ".pdf,.doc,.docx,image/*"}
                />
                {role === "advocate" ? (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                      className={`p-3 rounded-xl transition-colors shrink-0 ${showAttachmentMenu ? "bg-stone-200 text-stone-700" : "hover:bg-stone-100 text-stone-500 hover:text-stone-700"}`}
                      title="Attachments"
                    >
                      <Paperclip size={20} />
                    </button>

                    {showAttachmentMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowAttachmentMenu(false)} />
                        <div className="absolute bottom-full left-0 mb-3 bg-white border border-stone-200 rounded-2xl shadow-xl w-48 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            type="button"
                            onClick={() => { fileInputRef.current?.click(); setShowAttachmentMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 text-left transition-colors border-b border-stone-100"
                          >
                            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                              <FileText size={16} />
                            </div>
                            <span className="text-sm font-semibold text-stone-700">Document</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => { setShowPaymentModal(true); setShowAttachmentMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-50 text-left transition-colors"
                          >
                            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                              <DollarSign size={16} />
                            </div>
                            <span className="text-sm font-semibold text-stone-700">Payment Request</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-600 transition-colors shrink-0"
                    title="Share file"
                  >
                    <Paperclip size={20} />
                  </button>
                )}

                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Type message here..."
                  className="flex-1 px-4.5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#0A2342]/10 focus:border-[#0A2342] text-sm transition-all resize-none overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                  rows={1}
                  style={{ minHeight: '44px', maxHeight: '120px' }}
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
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-400 p-8">
            <MessageSquare size={48} className="mb-3 text-stone-300" />
            <p className="text-sm font-semibold">No active conversation selected</p>
            <p className="text-xs text-stone-400 mt-1">Select one from the sidebar list to begin.</p>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          MODALS: ADVOCATE TOOLS & SHARED MODALS
          ------------------------------------------------------------- */}

      {/* A. Document Upload Confirmation Modal */}
      {selectedFile && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-100 w-full max-w-sm overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="bg-[#0A2342] text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                <FileText size={16} />
                Send Document
              </h3>
              <button
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-center">
              {selectedFile.type.startsWith('image/') ? (
                <div className="w-40 h-40 mx-auto rounded-2xl overflow-hidden shadow-inner border border-stone-200">
                  <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-[#0A2342]/5 text-[#C9A227] rounded-2xl flex items-center justify-center mx-auto shadow-inner border border-[#0A2342]/10">
                  <FileText size={32} />
                </div>
              )}
              <div className="px-2">
                <p className="text-stone-900 font-bold text-base truncate">
                  {selectedFile.name}
                </p>
                <p className="text-stone-400 text-xs font-semibold mt-1 uppercase tracking-widest">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <p className="text-stone-500 text-sm mt-4 bg-stone-50 py-2.5 rounded-xl border border-stone-100">
                Send to <span className="font-bold text-[#0A2342]">{partnerName}</span>?
              </p>

              <div className="flex gap-3 justify-center pt-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="flex-1 px-4 py-2.5 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleFileUpload(selectedFile);
                    setSelectedFile(null);
                  }}
                  className="flex-1 px-4 py-2.5 bg-[#0A2342] hover:bg-[#06162a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-[#0A2342]/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <Send size={14} />
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* B. Create Payment Request Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-[999] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-stone-100 w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="bg-[#0A2342] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm uppercase tracking-wider">Create Payment Request</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-white/80 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-stone-900 font-bold focus:outline-none focus:border-[#0A2342]"
                />
              </div>

              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 block mb-1">
                  Description / Purpose
                </label>
                <textarea
                  value={payDesc}
                  onChange={(e) => setPayDesc(e.target.value)}
                  placeholder="e.g. Charge for Deeds registry summary report"
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:border-[#0A2342] h-20"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-wider text-stone-500 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reqId = `pay_req_${Date.now().toString().slice(-4)}`;
                    handleSendMessage("payment_request", payDesc || "Legal Consultation / Document Access Fee", {
                      paymentRequestId: reqId,
                      amount: Number(payAmount) || 1000,
                      status: "pending",
                    });
                    setShowPaymentModal(false);
                    setPayDesc("");
                  }}
                  className="px-4 py-2 bg-[#0A2342] hover:bg-[#06162a] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md transition-all"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
