"use client";

import React from "react";
import ChatWorkspace from "@/components/chat/ChatWorkspace";

export default function UserMessagesPage() {
  return (
    <div className="h-[calc(100vh-120px)] bg-stone-100 flex flex-col overflow-hidden">
      <div className="p-4 md:p-6 flex-1 max-w-[1400px] w-full mx-auto flex flex-col min-h-0">
        <h1 className="text-xl md:text-2xl font-black text-[#0A2342] uppercase tracking-widest mb-4 shrink-0">
          My Messages
        </h1>
        <div className="flex-1 min-h-0 w-full relative">
          <ChatWorkspace role="user" />
        </div>
      </div>
    </div>
  );
}
