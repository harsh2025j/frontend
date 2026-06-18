"use client";

import React, { useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { useProfileActions } from "@/data/features/profile/useProfileActions";

interface SavePostButtonProps {
    postId: string;
    className?: string;
    iconSize?: number;
    showText?: boolean;
    text?: string;
}

export default function SavePostButton({ postId, className = "", iconSize = 24, showText = false, text = "Save" }: SavePostButtonProps) {
    const { user, toggleSavePost } = useProfileActions();
    const [isToggling, setIsToggling] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // If not mounted yet, or there is no logged-in user, do not render the button.
    // This prevents hydration mismatches between server and client.
    if (!mounted || !user) {
        return null;
    }

    const isSaved = user.savedPosts?.includes(postId) || false;

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isToggling) return;

        setIsToggling(true);
        try {
            await toggleSavePost(postId);
        } catch (error) {
            console.error("Failed to toggle save post", error);
        } finally {
            setIsToggling(false);
        }
    };

    return (
        <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2
        ${isSaved
                    ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                    : "text-gray-400 hover:text-blue-500 hover:bg-gray-50"} 
        ${className}`}
            aria-label={isSaved ? "Remove from saved posts" : "Save post"}
            title={isSaved ? "Saved" : "Save post"}
        >
            {isToggling ? (
                <Loader2 size={iconSize} className="animate-spin text-blue-500" />
            ) : (
                <Bookmark
                    size={iconSize}
                    fill={isSaved ? "currentColor" : "none"}
                    className={isSaved ? "text-blue-600" : ""}
                />
            )}
            {showText && <span className="text-sm font-medium">{text}</span>}
        </button>
    );
}
