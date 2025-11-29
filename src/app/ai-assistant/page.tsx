"use client";

import React, { useState } from 'react';
import { Send, Menu, Plus, Clock, X, Scale } from 'lucide-react';
import Image from 'next/image';
import logo from '../../../public/logo.png';

interface Message {
    id: number;
    text: string;
    isUser: boolean;
}

interface ChatHistory {
    id: number;
    title: string;
    timestamp: string;
}

export default function AIAssistantPage() {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [chatHistory] = useState<ChatHistory[]>([
        { id: 1, title: "Property registration process", timestamp: "2 hours ago" },
        { id: 2, title: "Consumer complaint filing", timestamp: "Yesterday" },
        { id: 3, title: "Divorce grounds in India", timestamp: "2 days ago" },
        { id: 4, title: "Tenant rights query", timestamp: "1 week ago" },
    ]);

    const exampleQueries = [
        "What are the grounds for divorce in India?",
        "How to file a consumer complaint?",
        "Explain Section 498A of IPC",
        "What are my rights as a tenant?",
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            const userMessage: Message = {
                id: Date.now(),
                text: query,
                isUser: true,
            };
            setMessages([...messages, userMessage]);
            setQuery('');
            setIsTyping(true);

            setTimeout(() => {
                const aiMessage: Message = {
                    id: Date.now() + 1,
                    text: "I'm here to help with your legal query. This is a demo response. In production, this would connect to an AI backend to provide detailed legal information and guidance.",
                    isUser: false,
                };
                setMessages(prev => [...prev, aiMessage]);
                setIsTyping(false);
            }, 1500);
        }
    };

    const handleExampleClick = (example: string) => {
        setQuery(example);
    };

    const handleNewChat = () => {
        setMessages([]);
    };

    return (
        <div className="flex h-screen bg-[#f6f6f7]">
            {/* Sidebar */}
            <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}>
                {/* Logo and Menu */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <div className="relative w-32 h-12">
                            <Image
                                src={logo}
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    <button
                        onClick={handleNewChat}
                        className="w-full flex items-center gap-2 px-4 py-2 bg-[#2b3a67] text-white rounded-lg hover:bg-[#1f2a4a] transition-colors"
                    >
                        <Plus size={18} />
                        <span className="text-sm font-medium">New Chat</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">History</h3>
                    <div className="space-y-2">
                        {chatHistory.map((chat) => (
                            <button
                                key={chat.id}
                                className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                            >
                                <div className="flex items-start gap-2">
                                    <Clock size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-900 truncate">{chat.title}</p>
                                        <p className="text-xs text-gray-500 mt-1">{chat.timestamp}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 px-4 py-4">
                    <div className="max-w-3xl mx-auto flex items-center gap-3">
                        {!sidebarOpen && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Menu size={20} />
                            </button>
                        )}
                        <h1 className="text-xl font-semibold text-gray-900">Legal AI Assistant</h1>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto bg-[#f6f6f7]">
                    <div className="max-w-3xl mx-auto px-4 py-8">
                        {messages.length === 0 ? (
                            <div className="text-center space-y-8 py-12">
                                <div className="flex justify-center mb-6">
                                    <div className="w-16 h-16 bg-[#2b3a67] rounded-full flex items-center justify-center">
                                        <Scale className="text-white" size={32} />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-3xl font-semibold text-gray-900 mb-3">
                                        How can I help you today?
                                    </h2>
                                    <p className="text-gray-600">
                                        Ask me anything about law, legal procedures, or your rights
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                    {exampleQueries.map((example, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleExampleClick(example)}
                                            className="text-left p-4 bg-white rounded-lg border border-gray-200 hover:border-[#2b3a67] hover:shadow-sm transition-all"
                                        >
                                            <p className="text-sm text-gray-700">{example}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.isUser
                                                ? 'bg-[#2b3a67] text-white'
                                                : 'bg-white text-gray-900 border border-gray-200'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.text}
                                            </p>
                                        </div>
                                    </div>
                                ))}

                                {isTyping && (
                                    <div className="flex justify-start">
                                        <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Area */}
                <div className="bg-white border-t border-gray-200">
                    <div className="max-w-3xl mx-auto px-4 py-4">
                        <form onSubmit={handleSubmit} className="relative">
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Ask a legal question..."
                                className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 focus:border-[#2b3a67] focus:ring-2 focus:ring-[#2b3a67]/20 focus:outline-none text-gray-900 placeholder:text-gray-500"
                            />
                            <button
                                type="submit"
                                disabled={!query.trim()}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#2b3a67] text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-[#1f2a4a] transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                        <p className="text-xs text-gray-500 text-center mt-3">
                            AI can make mistakes. Verify important legal information.
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
      `}</style>
        </div>
    );
}
