"use client";

import React from "react";
import ChatWorkspace from "@/components/chat/ChatWorkspace";

export default function AdvocateMessagesPage() {
  return (
    <div className="h-[calc(100vh-6rem)] -mx-8 -mb-8 -mt-8 flex flex-col [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
      <div className="flex-1 min-h-0">
        <ChatWorkspace role="advocate" />
      </div>
    </div>
  );
}
