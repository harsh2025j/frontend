"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Play,
    Pause,
    Volume2,
    VolumeX,
    Headphones,
    X,
    ChevronDown,
    Gauge,
    Sliders,
} from "lucide-react";
import { Article } from "@/data/features/article/article.types";
import Image from "next/image";
import { getSafeImageUrl } from "@/utils/imageUtils";

function MaleVoiceIcon({ className = "w-3.5 h-3.5 shrink-0" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            fillRule="evenodd"
            clipRule="evenodd"
            viewBox="0 0 512 481.769"
            className={className}
        >
            <path
                fill="currentColor"
                d="M115.202 88.437c64.862-80.147 139.613-123.73 195.75-52.435 64.323 3.378 89.361 101.747 45.161 150.305 7.745 1.469 13.845 6.6 16.332 14.277 1.567 4.877 1.694 10.898-.245 18.066l-7.813 22.228c-1.606 4.563-3.173 7.843-6.845 10.751-2.957 2.35-6.228 3.574-10.517 3.849-2.163 22.266-14.041 33.557-29.218 47.833 17.635 32.617 54.629 38.815 86.051 44.886C451.946 357.49 512 402.895 512 454.371v20.974c0 3.535-2.889 6.424-6.434 6.424H6.434c-3.545 0-6.434-2.889-6.434-6.424v-18.977c0-61.845 62.972-98.369 113.508-105.135 35.271-4.72 64.862-9.499 78.629-49.146-14.002-12.142-25.547-23.403-28.974-47.099a23.495 23.495 0 01-7.863-2.791l-.911-.577c-5.277-3.34-8.969-8.52-11.466-14.277-2.899-6.6-4.181-14.316-4.475-20.122v-9.528c.225-8.509 1.077-15.285 7.324-21.953l-1.155-.598c-2.526-31.569 4.866-86.335-29.415-96.705zm35.662 112.47c4.034-11.554 13.415-7.843 26.791-2.957-5.337-24.225.96-43.143 19.926-56.255 40.461-27.995 58.742-4.034 102.59-39.343 25.195 12.68 47.736 34.134 36.25 101.14 12.152-9.214 29.679-8.352 24.167 12.054l-7.53 21.337c-1.802 5.101-3.007 6.952-9.459 6.609-2.85-.147-5.719-1.253-8.578-3.143 2.644 31.481-12.642 41.753-31.765 60.22-29.464 28.426-63.922 27.251-94.502.049-17.909-15.931-33.822-25.605-34.614-58.36-4.642 1.43-9.029 1.685-12.867-.499-7.638-4.347-10.429-16.999-10.84-25.107-.166-3.26-.029-12.426.431-15.745zM307.3 313.133c7.011 11.485 17.136 19.192 28.436 23.872-45.239 33.195-107.702 30.179-154.233 1.812 11.584-6.238 18.419-14.786 22.942-26.076 16.637 13.66 34.527 20.709 52.495 20.7 17.469-.01 34.624-6.649 50.36-20.308z"
            />
        </svg>
    );
}

function FemaleVoiceIcon({ className = "w-3.5 h-3.5 shrink-0" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            fillRule="evenodd"
            clipRule="evenodd"
            viewBox="0 0 512 489.552"
            className={className}
        >
            <path
                fill="currentColor"
                d="M60.185 311.499c44.657-3.627 61.073-50.023 66.576-98.131 8.382-73.65-3.246-168.407 85.39-204.232 70.384-28.465 161.399 9.853 171.327 111.254-.415 68.908 18.965 186.102 80.637 191.109-4.236 11.921-23.139 20.259-46.403 23.906 74.922 23.887 97.119 64.908 94.007 154.147H256l77.601-90.944 72.102 25.025-47.386-89.159c-13.764-2.718-26.195-7.333-35.245-14.077l-1.776-.632c-3.007 34.963-38.459 103.38-65.296 159.386-26.323-54.934-60.931-121.807-65.084-157.338-10.327 8.768-24.322 14.117-39.343 16.63l-45.277 85.19 72.102-25.025L256 489.552H.28c-3.173-91.056 20.084-129.853 95.428-153.824-17.795-4.835-31.662-13.352-35.523-24.229zm257.466 4.179c-5.371-5.518-8.773-12.152-9.446-19.994-14.465 9.406-31.173 15.249-49.684 15.861-18.054.594-36.251-3.87-52.024-14.003-1.858 6.954-5.109 12.943-9.401 18.067 23.326 43.258 98.141 41.441 120.555.069zm-.739-42.603c39.176-43.33 45.124-86.94 33.96-142.596-26.935-12.485-44.551-39.925-53.575-81.156-10.783 78.494-107.18 75.126-131.422 89.407 0 48.262-2.907 97.87 32.652 136.216 32.391 34.925 87.77 30.551 118.385-1.871z"
            />
        </svg>
    );
}

function DualVoiceIcon({ className = "w-3.5 h-3.5 shrink-0" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            shapeRendering="geometricPrecision"
            textRendering="geometricPrecision"
            imageRendering="optimizeQuality"
            fillRule="evenodd"
            clipRule="evenodd"
            viewBox="0 0 512 335.09"
            className={className}
        >
            <path
                fill="currentColor"
                fillRule="nonzero"
                d="M252 223.98c12.02-.99 20.25-7.75 25.85-17.5l.04-.07c5.67-9.89 8.68-22.89 10.19-36.11.79-6.99 1.26-14.3 1.74-21.7 2.35-36.56 4.9-76.02 46.42-92.81a70.634 70.634 0 0 1 19.66-4.81c14.35-1.4 29 1.55 41.64 8.79 12.65 7.24 23.3 18.77 29.66 34.48 2.92 7.23 4.93 15.34 5.81 24.32v.16c-.12 22.05 3.41 53.02 12.99 75.74 6.9 16.34 16.92 28.37 30.93 29.51.57.04 1 .55.96 1.12l-.06.27c-2.6 7.34-14.6 12.99-28.95 15.74 21.34 5.19 36.15 11.45 46.18 22.5C507.4 277.2 512 297.44 512 331.06c0 2.22-1.8 4.02-4.02 4.02H340.75c.28-1.38.44-2.81.44-4.28v-13.99c0-12.25-3.13-24.11-8.54-34.95 10.16 4.16 20.36 6.46 30.57 6.77 26.58.8 53.74-11.89 81.55-40.27-4.04-.95-8.34-1.87-12.89-2.78l-.65-.14c-3.89-.77-9.37-1.86-15.02-3.43-1.95-.3-3.84-.66-5.66-1.11-5.66-1.37-10.65-3.48-14.38-6.41-5.7-4.46-8.53-10.76-6.63-19.19-17.06 10.65-34.98 10.61-51.95-.36l-1.09-.61c-.09 5-3.26 19.8-8.1 22.75-7.36 4.47-18.91 6.56-27.93 8.04-11.14-7.78-23.71-13.33-36.61-15.82-4.1-.79-8.22-1.59-12.17-2.52-.23-.46-.44-.93-.61-1.41-.19-.55.1-1.15.64-1.34l.28-.05zm-56.14-21.31c.21-.25.44-.47.7-.67l1.48-1.4c10.95-10.28 19.02-17.86 17.46-36.34-.05-.92.17-1.87.71-2.69a4.268 4.268 0 0 1 5.9-1.22c.76.5 1.53.9 2.31 1.18.64.24 1.26.38 1.83.41 1.11.06 1.68.06 1.83.02.15-.12.43-.86.83-2l5.44-15.4c.68-2.61.74-4.47.34-5.71-.17-.54-.46-.94-.83-1.18l-.16-.09c-.66-.35-1.6-.47-2.68-.38-2.39.18-5.18 1.33-7.66 3.21-.9.68-2.08 1.01-3.29.8a4.284 4.284 0 0 1-3.5-4.93c4.03-23.5 2.19-38.8-2.82-49.24-4.38-9.15-11.38-14.7-18.96-18.84-16.83 12.9-28.68 14.37-40.49 15.83-9.78 1.2-19.54 2.42-32.46 11.35-6.15 4.26-10.23 9.4-12.32 15.39-2.1 6.03-2.26 13.03-.56 20.95.26.86.25 1.8-.08 2.7-.81 2.22-3.27 3.35-5.49 2.54-1.28-.47-2.61-1.01-3.9-1.42-5.05-1.76-8.63-2.58-10.01.6-.11 1.01-.18 2.58-.23 4.2v.03c-.06 2.3-.06 4.71 0 5.96v.06c.15 2.96.8 6.88 2.22 10.17.89 2.08 2.07 3.83 3.54 4.67.73.41 1.56.6 2.42.61 1.06.02 2.24-.2 3.48-.57a4.273 4.273 0 0 1 5.66 3.93c.46 19.35 9.05 26.75 19.49 35.74l4.35 3.78c6.86 6.1 13.96 10.28 21.08 12.43 5.48 1.14 11.21 1.26 16.71.55 3.83-.5 7.52-1.4 10.94-2.63 4.94-2.33 9.79-5.74 14.48-10.27l2.24-2.13zm8.09 4.1c8.99 30 33.07 34.68 56.71 39.24 32.07 6.2 63.48 36.49 63.48 70.8v13.99c0 2.36-1.93 4.29-4.28 4.29H4.28c-2.36 0-4.28-1.93-4.28-4.29v-12.65c0-41.24 33.35-65.6 67.05-70.11 24.59-3.28 49.4-6.62 58.16-36.5l-.48-.43-4.26-3.72c-11.1-9.56-20.39-17.56-22.16-37.03l-.98.01c-2.27-.03-4.47-.55-6.53-1.72-3.31-1.88-5.63-5.09-7.19-8.71-1.86-4.31-2.69-9.33-2.89-13.12v-.08c-.06-1.39-.06-4.05 0-6.6v-.04c.07-2.21.18-4.36.35-5.58.05-.37.15-.71.28-1.04 2.33-6.48 5.89-8.58 10.59-8.45l-3.09-2.05c-1.68-20.97 3.23-57.35-19.54-64.23 43.08-53.24 92.73-82.19 130.02-34.84 44.92 2.36 62.93 73.74 27.11 103.79l-.21 1.76c1.41-.42 2.81-.69 4.15-.79 2.66-.21 5.19.22 7.33 1.35l.41.25c2.16 1.27 3.82 3.25 4.7 5.97.89 2.77.92 6.32-.25 10.66l-5.6 15.9c-.9 2.57-1.73 4.38-3.55 5.83l-.35.25c-1.8 1.28-3.99 1.76-7.25 1.59l-1.56-.17c-.36 17.68-9 25.84-20.31 36.47zm-6.42 6.75c-13.09 18.08-51.29 18.47-65.56 4.12-3.56 14.83-12.8 25.08-26.47 31.75 39.2 23.9 77.83 23.19 115.85-5.01-14.62-6.63-22.01-17.22-23.82-30.86zm198.82-13.45c18.17-20.1 23.01-33.65 20.61-60.73-.39-4.33-1.03-8.73-1.92-13.19-14.82-6.87-24.52-21.97-29.48-44.66-5.93 43.2-58.98 41.34-72.32 49.2 0 3.64-.09 7.07-.17 10.37-.61 22.23 1.04 34.06 12.23 51.81 1.87 2.97 3.7 5.84 5.91 8.22 17.82 19.22 48.29 16.82 65.14-1.02z"
            />
        </svg>
    );
}

interface SpeechPlayerProps {
    initialArticle: Article;
}

type VoiceMode = "female" | "male" | "both";

interface AudioChunk {
    text: string;
    words: string[];
    gender: "female" | "male";
    sentenceIndex: number;
}

const STORAGE_VOICE_KEY = "legaltech_speech_voice_mode";
const STORAGE_SPEED_KEY = "legaltech_speech_speed";

// Smart legal sentence tokenizer preventing citation and abbreviation fragments
function splitIntoSentences(text: string): string[] {
    if (!text || !text.trim()) return [];

    // Protect common abbreviations in legal and news text from being split into fragments
    const abbrevs = [
        "hon'ble", "hon", "dr", "mr", "mrs", "ms", "prof", "sr", "jr", "adv", "justice",
        "ltd", "pvt", "co", "inc", "corp", "sec", "art", "no", "nos", "vol", "para",
        "air", "scc", "scr", "ilr", "cr.p.c", "c.p.c", "i.p.c", "u.p", "m.p", "a.p",
        "h.p", "govt", "dept", "i.e", "e.g", "etc", "v", "vs", "u/s", "al", "anr", "ors"
    ];
    let sanitized = text;
    abbrevs.forEach((abbr) => {
        const regex = new RegExp(`\\b${abbr}\\.`, "gi");
        sanitized = sanitized.replace(regex, (m) => m.slice(0, -1) + "@@DOT@@");
    });
    // Protect initials like "J." or single capital letters followed by dot (e.g. "C.J.")
    sanitized = sanitized.replace(/\b([A-Z])\./g, "$1@@DOT@@");
    // Protect decimal numbers like 3.14 or Section 302.1
    sanitized = sanitized.replace(/(\d)\.(\d)/g, "$1@@DEC@@$2");

    // Split on actual sentence endings: . ! ? or Hindi purna viram (।)
    const rawMatches = sanitized.match(/[^.!?।]+(?:[.!?।]+(?:\s+|$)|$)/g) || [sanitized];

    return rawMatches
        .map((s) => s.replace(/@@DOT@@/g, ".").replace(/@@DEC@@/g, ".").trim())
        .filter((s) => s.length > 0);
}

// ── Exported Trigger Button for the Author Card ──
export function ListenArticleButton({
    article,
    className = "",
    variant = "desktop",
}: {
    article?: Article;
    className?: string;
    variant?: "desktop" | "mobile";
}) {
    const [isPlaying, setIsPlaying] = useState(false);
    const targetArticleId = article?.id || (article as any)?._id;

    useEffect(() => {
        const handleState = (e: any) => {
            if (e.detail) {
                const activeId = e.detail.activeArticleId;
                const isGlobalPlaying = Boolean(e.detail.isPlaying);
                const isThisArticlePlaying = isGlobalPlaying && (!activeId || !targetArticleId || activeId === targetArticleId);
                setIsPlaying(isThisArticlePlaying);
            }
        };
        window.addEventListener("legaltech-speech-state", handleState);
        return () => window.removeEventListener("legaltech-speech-state", handleState);
    }, [targetArticleId]);

    const handleClick = () => {
        if (isPlaying) {
            // Already playing: clicking here STOPS & CLOSES speech for this article (resets to beginning)
            window.dispatchEvent(
                new CustomEvent("legaltech-close-speech", {
                    detail: { article },
                })
            );
        } else {
            // Not playing: clicking here starts speech fresh from the beginning (index 0)
            window.dispatchEvent(
                new CustomEvent("legaltech-start-speech", {
                    detail: { article },
                })
            );
        }
    };

    if (variant === "mobile") {
        return (
            <button
                onClick={handleClick}
                className={`group w-full flex items-center justify-between px-4 py-2.5 sm:py-3 rounded-full border-[1.5px] transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs ${
                    isPlaying
                        ? "bg-[#0B2242] text-[#C9A227] border-[#0B2242]"
                        : "bg-white hover:bg-[#FAF7F2] border-[#C9A227] hover:border-[#9E7A1C] text-[#9E7A1C]"
                } ${className}`}
                title={isPlaying ? "Stop speaking and close" : "Listen to article with synchronized voice"}
            >
                <div className="flex items-center gap-3 min-w-0">
                    <Headphones className={`w-5 h-5 shrink-0 stroke-[1.8] ${isPlaying ? "text-[#C9A227]" : "text-[#9E7A1C]"}`} />
                    <span className={`text-sm font-serif font-bold tracking-tight whitespace-nowrap ${
                        isPlaying ? "text-[#C9A227]" : "text-[#9E7A1C]"
                    }`}>
                        {isPlaying ? "Playing Article" : "Listen to Article"}
                    </span>
                    {isPlaying && (
                        <span className="flex items-end gap-0.5 h-3 ml-1">
                            <span className="w-0.75 bg-[#C9A227] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2.5" />
                            <span className="w-0.75 bg-[#C9A227] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
                            <span className="w-0.75 bg-[#C9A227] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2" />
                        </span>
                    )}
                </div>

                <span className={`w-6.5 h-6.5 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${
                    isPlaying ? "bg-[#C9A227] text-[#0B2242]" : "bg-[#C9A227] text-white"
                }`}>
                    {isPlaying ? (
                        <Pause className="w-3 h-3 fill-current" />
                    ) : (
                        <Play className="w-3 h-3 fill-current ml-0.5" />
                    )}
                </span>
            </button>
        );
    }

    return (
        <button
            onClick={handleClick}
            className={`group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full border-[1.5px] transition-all duration-200 cursor-pointer shrink-0 shadow-2xs hover:shadow-xs ${
                isPlaying
                    ? "bg-[#0B2242] text-[#C9A227] border-[#0B2242]"
                    : "bg-white hover:bg-[#FAF7F2] border-[#C9A227] hover:border-[#9E7A1C] text-[#9E7A1C]"
            } ${className}`}
            title={isPlaying ? "Stop speaking and close" : "Listen to article with synchronized voice"}
        >
            {isPlaying ? (
                <Pause className="w-4 h-4 text-[#C9A227] fill-current shrink-0" />
            ) : (
                <Headphones className="w-4.5 h-4.5 text-[#9E7A1C] group-hover:scale-105 transition-transform shrink-0 stroke-[1.8]" />
            )}
            <span className={`text-xs sm:text-[13px] font-serif font-bold tracking-tight whitespace-nowrap ${
                isPlaying ? "text-[#C9A227]" : "text-[#9E7A1C]"
            }`}>
                {isPlaying ? "Playing" : "Listen to Article"}
            </span>
            {isPlaying && (
                <span className="flex items-end gap-0.5 h-3 ml-0.5">
                    <span className="w-0.75 bg-[#C9A227] rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-2.5" />
                    <span className="w-0.75 bg-[#C9A227] rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3.5" />
                    <span className="w-0.75 bg-[#C9A227] rounded-full animate-[pulse_1s_ease-in-out_infinite] h-2" />
                </span>
            )}
        </button>
    );
}

// ── Main Singleton SpeechPlayer Controller ──
export default function SpeechPlayer({ initialArticle }: SpeechPlayerProps) {
    const [currentArticle, setCurrentArticle] = useState<Article>(initialArticle);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayerActive, setIsPlayerActive] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [voiceMode, setVoiceMode] = useState<VoiceMode>("male");
    const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
    const [isLoadingAudio, setIsLoadingAudio] = useState(false);

    // Audio & sync references
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const chunksRef = useRef<AudioChunk[]>([]);
    const voiceModeRef = useRef<VoiceMode>("male");
    const playbackSpeedRef = useRef<number>(1);
    const currentChunkIndexRef = useRef(0);
    const isPlayingRef = useRef(false);
    const isPlayerActiveRef = useRef(false);
    const currentArticleRef = useRef<Article>(initialArticle);
    const cardRef = useRef<HTMLDivElement>(null);

    // Keep current article ref synced
    useEffect(() => {
        currentArticleRef.current = currentArticle;
    }, [currentArticle]);

    const isHindi = Boolean(
        currentArticle.language?.toLowerCase().startsWith("hi") ||
        /[\u0900-\u097F]/.test(currentArticle.title || "")
    );

    const dispatchState = useCallback((playing: boolean, active: boolean) => {
        const articleId = currentArticleRef.current?.id || (currentArticleRef.current as any)?._id;
        window.dispatchEvent(
            new CustomEvent("legaltech-speech-state", {
                detail: {
                    isPlaying: playing,
                    isPlayerActive: active,
                    activeArticleId: articleId,
                },
            })
        );
    }, []);

    // 1. Load persistent user preferences from localStorage on mount (defaults to male)
    useEffect(() => {
        try {
            const savedVoice = localStorage.getItem(STORAGE_VOICE_KEY) as VoiceMode;
            if (savedVoice && ["female", "male", "both"].includes(savedVoice)) {
                setVoiceMode(savedVoice);
                voiceModeRef.current = savedVoice;
            } else {
                setVoiceMode("male");
                voiceModeRef.current = "male";
            }
            const savedSpeed = localStorage.getItem(STORAGE_SPEED_KEY);
            if (savedSpeed && !isNaN(parseFloat(savedSpeed))) {
                const spd = parseFloat(savedSpeed);
                setPlaybackSpeed(spd);
                playbackSpeedRef.current = spd;
            }
        } catch {
            // Storage unavailable
        }
    }, []);

    // 2. Prepare Chunks and Wrap DOM Sentences & Words for Real-time Karaoke Highlighting
    const prepareArticleChunks = useCallback((targetArticle?: Article, force: boolean = false) => {
        const articleToUse = targetArticle || currentArticleRef.current;
        const targetId = articleToUse?.id || (articleToUse as any)?._id;

        // Find candidate text blocks in the article body
        let blocks: NodeListOf<Element> | null = null;
        if (targetId) {
            blocks = document.querySelectorAll(
                `[data-article-id="${targetId}"] .article-content p, ` +
                `[data-article-id="${targetId}"] .article-content blockquote, ` +
                `[data-article-id="${targetId}"] .article-content li, ` +
                `[data-article-id="${targetId}"] .article-content h1, ` +
                `[data-article-id="${targetId}"] .article-content h2, ` +
                `[data-article-id="${targetId}"] .article-content h3, ` +
                `[data-article-id="${targetId}"] .article-content h4`
            );
        }
        if (!blocks || blocks.length === 0) {
            blocks = document.querySelectorAll(
                `.article-content p, .article-content blockquote, .article-content li, .article-content h1, .article-content h2, .article-content h3, .article-content h4`
            );
        }
        if (!blocks || blocks.length === 0) return;

        // Check if already prepared and spans exist
        const hasExistingSentences = document.querySelector(".tts-sentence");
        if (hasExistingSentences && !force && chunksRef.current.length > 0) {
            return;
        }

        const finalChunks: AudioChunk[] = [];
        let globalSentenceIndex = 0;
        let paragraphCounter = 0;

        blocks.forEach((block) => {
            // Avoid touching pure script, style, or iframe embed blocks
            if (block.querySelector("script, style")) {
                return;
            }

            const rawText = block.textContent?.trim();
            if (!rawText || rawText.length < 3) return;

            // Preserve any nested media elements (images, figures) inside the block
            const mediaElements = Array.from(block.querySelectorAll("img, iframe, video, figure"));
            const mediaHtml = mediaElements.map((el) => el.outerHTML).join("\n");

            // Default alternating starts with male voice
            const blockGender: "female" | "male" = paragraphCounter % 2 === 0 ? "male" : "female";
            paragraphCounter++;

            // Split into sentences using abbreviation-aware legal tokenizer
            const sentenceMatches = splitIntoSentences(rawText);

            let newBlockHtml = "";

            sentenceMatches.forEach((s) => {
                const trimmedSentence = s.trim();
                if (!trimmedSentence) return;

                const sIdx = globalSentenceIndex++;
                const words = trimmedSentence.split(/\s+/).filter(Boolean);

                finalChunks.push({
                    text: trimmedSentence,
                    words,
                    gender: blockGender,
                    sentenceIndex: sIdx,
                });

                // Wrap each word in a tts-word span
                const wordsHtml = words
                    .map((w, wIdx) => `<span class="tts-word" data-word-index="${sIdx}_${wIdx}">${w}</span>`)
                    .join(" ");

                newBlockHtml += `<span class="tts-sentence" data-sentence-index="${sIdx}">${wordsHtml} </span>`;
            });

            if (newBlockHtml) {
                block.innerHTML = mediaHtml ? `${mediaHtml}${newBlockHtml}` : newBlockHtml;
            }
        });

        if (finalChunks.length > 0) {
            chunksRef.current = finalChunks;
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => prepareArticleChunks(), 400);
        return () => clearTimeout(timer);
    }, [prepareArticleChunks]);

    // 3. Highlight Sentence & Smooth Autoscroll into view
    const highlightSentence = useCallback((index: number) => {
        if (typeof document === "undefined") return;

        // Clear existing highlights across the page
        document.querySelectorAll(".tts-sentence.tts-sentence-active").forEach((el) => {
            el.classList.remove("tts-sentence-active");
        });
        document.querySelectorAll(".tts-word.tts-word-active").forEach((el) => {
            el.classList.remove("tts-word-active");
        });

        if (index < 0) return;

        let target = document.querySelector(`[data-sentence-index="${index}"]`) as HTMLElement;
        if (!target) {
            // Re-prepare DOM if React re-rendered
            prepareArticleChunks(currentArticleRef.current, true);
            target = document.querySelector(`[data-sentence-index="${index}"]`) as HTMLElement;
        }

        if (target) {
            target.classList.add("tts-sentence-active");
            // Smooth autoscroll right to the center of view
            target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [prepareArticleChunks]);

    // 4. Construct Audio URL for /api/tts with exact Edge Neural parameters
    const getAudioUrl = useCallback((chunk: AudioChunk) => {
        const langParam = isHindi ? "hi" : "en";
        const genderParam = voiceModeRef.current === "both" ? chunk.gender : voiceModeRef.current;
        return `/api/tts?text=${encodeURIComponent(chunk.text)}&lang=${langParam}&gender=${genderParam}`;
    }, [isHindi]);

    // 5. Play Chunk by Index
    const playChunk = useCallback((index: number) => {
        const audio = audioRef.current;
        if (!audio) return;

        // Force silence any other audio elements or lingering speech on the page
        if (typeof document !== "undefined") {
            document.querySelectorAll("audio").forEach((el) => {
                if (el !== audio) {
                    try {
                        el.pause();
                        el.currentTime = 0;
                    } catch {}
                }
            });
        }
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
            try {
                window.speechSynthesis.cancel();
            } catch {}
        }

        // Ensure chunks and DOM spans are ready
        if (chunksRef.current.length === 0 || !document.querySelector(`[data-sentence-index="${index}"]`)) {
            prepareArticleChunks(currentArticleRef.current, true);
        }

        if (chunksRef.current.length === 0 || index < 0 || index >= chunksRef.current.length) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            isPlayingRef.current = false;
            setCurrentChunkIndex(0);
            currentChunkIndexRef.current = 0;
            highlightSentence(-1);
            dispatchState(false, isPlayerActiveRef.current);
            return;
        }

        // Explicitly pause current playback before switching src
        audio.pause();
        audio.currentTime = 0;

        const chunk = chunksRef.current[index];
        setCurrentChunkIndex(index);
        currentChunkIndexRef.current = index;
        highlightSentence(chunk.sentenceIndex);
        setIsLoadingAudio(true);

        const url = getAudioUrl(chunk);
        audio.src = url;
        audio.playbackRate = playbackSpeedRef.current;
        audio.volume = isMuted ? 0 : volume;

        audio
            .play()
            .then(() => {
                setIsLoadingAudio(false);
                setIsPlaying(true);
                isPlayingRef.current = true;
                setIsPlayerActive(true);
                isPlayerActiveRef.current = true;
                dispatchState(true, true);

                // Pre-buffer next chunk via low-priority fetch
                if (index + 1 < chunksRef.current.length && typeof window !== "undefined") {
                    const nextUrl = getAudioUrl(chunksRef.current[index + 1]);
                    fetch(nextUrl, { priority: "low" as any }).catch(() => {});
                }
            })
            .catch((err) => {
                if (err?.name === "AbortError") {
                    // Ignore normal AbortError when audio is stopped or track changed
                    return;
                }
                console.warn("[SpeechPlayer] Play error:", err);
                setIsLoadingAudio(false);
                if (isPlayingRef.current && currentChunkIndexRef.current === index && index + 1 < chunksRef.current.length) {
                    setTimeout(() => playChunk(index + 1), 500);
                }
            });
    }, [getAudioUrl, highlightSentence, isMuted, volume, dispatchState, prepareArticleChunks]);

    // 6. Word-by-Word Pronunciation Highlighting via HTML5 Audio timeupdate
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleTimeUpdate = () => {
            if (!audio.duration || audio.duration <= 0) return;
            const progressRatio = Math.min(1, Math.max(0, audio.currentTime / audio.duration));

            const sIdx = currentChunkIndexRef.current;
            const currentChunk = chunksRef.current[sIdx];
            if (!currentChunk || !currentChunk.words || currentChunk.words.length === 0) return;

            const wordCount = currentChunk.words.length;
            const activeWordIndex = Math.min(wordCount - 1, Math.floor(progressRatio * wordCount));

            const sentenceEl = document.querySelector(`[data-sentence-index="${currentChunk.sentenceIndex}"]`);
            if (sentenceEl) {
                const wordSpans = sentenceEl.querySelectorAll(".tts-word");
                wordSpans.forEach((span, wIdx) => {
                    if (wIdx === activeWordIndex) {
                        span.classList.add("tts-word-active");
                    } else {
                        span.classList.remove("tts-word-active");
                    }
                });
            }
        };

        const handleEnded = () => {
            if (isPlayingRef.current) {
                playChunk(currentChunkIndexRef.current + 1);
            }
        };

        audio.addEventListener("timeupdate", handleTimeUpdate);
        audio.addEventListener("ended", handleEnded);
        return () => {
            audio.removeEventListener("timeupdate", handleTimeUpdate);
            audio.removeEventListener("ended", handleEnded);
        };
    }, [playChunk]);

    // 7. Interactive Click-to-Seek on any sentence or paragraph in the article (ONLY when player is active)
    useEffect(() => {
        const handleArticleClick = (e: MouseEvent) => {
            // ONLY jump and speak if player is already active / speaking!
            if (!isPlayerActiveRef.current) return;

            const clickedEl = e.target as HTMLElement;
            if (!clickedEl) return;

            // Check if clicked inside article content
            const articleContent = clickedEl.closest(".article-content");
            if (!articleContent) return;

            // Don't intercept clicks on interactive elements
            if (clickedEl.closest("a, button, input, textarea, select, audio, video")) return;

            // Find closest sentence or parent block
            let target = clickedEl.closest(".tts-sentence") as HTMLElement | null;
            if (!target) {
                const block = clickedEl.closest("p, blockquote, li, h1, h2, h3, h4");
                if (block) {
                    target = block.querySelector(".tts-sentence");
                }
            }

            if (target) {
                const idxStr = target.getAttribute("data-sentence-index");
                if (idxStr !== null) {
                    const targetIdx = parseInt(idxStr, 10);
                    if (!isNaN(targetIdx)) {
                        setIsPlayerActive(true);
                        isPlayerActiveRef.current = true;
                        // On mobile (< 768px), keep modal minimized to avoid blocking article reading
                        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
                        if (!isMobile) {
                            setIsExpanded(true);
                        }
                        isPlayingRef.current = true;
                        setIsPlaying(true);
                        dispatchState(true, true);
                        playChunk(targetIdx);
                    }
                }
            }
        };

        document.addEventListener("click", handleArticleClick as any);
        return () => document.removeEventListener("click", handleArticleClick as any);
    }, [playChunk, dispatchState]);

    // 8. Close / Stop Player completely and reset to beginning
    const handleClosePlayer = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        isPlayingRef.current = false;
        setIsPlayerActive(false);
        isPlayerActiveRef.current = false;
        setIsExpanded(false);
        setCurrentChunkIndex(0);
        currentChunkIndexRef.current = 0;
        highlightSentence(-1);
        dispatchState(false, false);
    }, [highlightSentence, dispatchState]);

    // Keep body class synced for cursor/hover styling
    useEffect(() => {
        if (typeof document !== "undefined") {
            if (isPlayerActive) {
                document.body.classList.add("tts-active");
            } else {
                document.body.classList.remove("tts-active");
            }
        }
        return () => {
            if (typeof document !== "undefined") {
                document.body.classList.remove("tts-active");
            }
        };
    }, [isPlayerActive]);

    // 9. Start speech fresh from beginning (index 0)
    const handleStartSpeech = useCallback((incomingArticle?: Article) => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        highlightSentence(-1);

        const articleToPlay = incomingArticle || currentArticleRef.current;
        setCurrentArticle(articleToPlay);
        currentArticleRef.current = articleToPlay;

        // Reset progress to 0 (beginning of article)
        setCurrentChunkIndex(0);
        currentChunkIndexRef.current = 0;

        setIsPlayerActive(true);
        isPlayerActiveRef.current = true;

        // On mobile (< 768px), DO NOT open the large settings overlay by default.
        // It stays minimized as a floating widget until the user explicitly taps it ("there").
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        setIsExpanded(!isMobile);

        setIsPlaying(true);
        isPlayingRef.current = true;

        setTimeout(() => {
            prepareArticleChunks(articleToPlay, true);
            playChunk(0);
        }, 50);
    }, [highlightSentence, prepareArticleChunks, playChunk]);

    // 10. Event listeners from Author Card button
    useEffect(() => {
        const onStart = (e: any) => {
            handleStartSpeech(e.detail?.article);
        };
        const onClose = () => {
            handleClosePlayer();
        };

        window.addEventListener("legaltech-start-speech", onStart);
        window.addEventListener("legaltech-close-speech", onClose);
        // Also support toggle event
        const onToggle = (e: any) => {
            if (isPlayingRef.current) {
                handleClosePlayer();
            } else {
                handleStartSpeech(e.detail?.article);
            }
        };
        window.addEventListener("legaltech-toggle-speech", onToggle);

        return () => {
            window.removeEventListener("legaltech-start-speech", onStart);
            window.removeEventListener("legaltech-close-speech", onClose);
            window.removeEventListener("legaltech-toggle-speech", onToggle);
        };
    }, [handleStartSpeech, handleClosePlayer]);

    // 11. Voice Selection Change (persists in localStorage)
    const handleVoiceChange = (mode: VoiceMode) => {
        setVoiceMode(mode);
        voiceModeRef.current = mode;

        try {
            localStorage.setItem(STORAGE_VOICE_KEY, mode);
        } catch {
            // Storage unavailable
        }

        if (isPlayingRef.current) {
            playChunk(currentChunkIndexRef.current);
        }
    };

    // 12. Playback Speed Change (persists in localStorage)
    const handleSpeedChange = (speed: number) => {
        const rounded = Math.round(speed * 100) / 100;
        setPlaybackSpeed(rounded);
        playbackSpeedRef.current = rounded;

        if (audioRef.current) {
            audioRef.current.playbackRate = rounded;
        }

        try {
            localStorage.setItem(STORAGE_SPEED_KEY, rounded.toString());
        } catch {
            // Storage unavailable
        }
    };

    // 13. Mute toggle
    const handleToggleMute = () => {
        const nextMuted = !isMuted;
        setIsMuted(nextMuted);
        if (audioRef.current) {
            audioRef.current.volume = nextMuted ? 0 : volume;
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
            highlightSentence(-1);
        };
    }, [highlightSentence]);

    // Click outside to collapse expanded player overlay to floating button
    useEffect(() => {
        if (!isExpanded) return;
        const handleClickOutside = (e: MouseEvent | TouchEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                const targetEl = e.target as HTMLElement;
                if (targetEl.closest("button") || targetEl.closest(".tts-sentence")) return;
                setIsExpanded(false);
            }
        };
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }, 150);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isExpanded]);

    // Display names
    const getActiveVoiceName = () => {
        if (voiceMode === "both") return "Dual Co-Anchors (Swara & Madhur)";
        return voiceMode === "female" ? "Swara (Bilingual Female)" : "Madhur (Bilingual Male)";
    };

    return (
        <>
            {/* Single HTML5 Audio stream */}
            <audio ref={audioRef} preload="auto" />

            {/* ── 1. Floating Circular Widget (Bottom-Right, Minimized Mode) ── */}
            {isPlayerActive && !isExpanded && (
                <div
                    onClick={() => setIsExpanded(true)}
                    className="fixed bottom-6 right-6 z-[9999] group flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95"
                    title="Click to open voice controls & settings overlay"
                >
                    {isPlaying && (
                        <div className="absolute inset-0 rounded-full bg-[#C9A227]/30 animate-ping -z-10" />
                    )}

                    <div className="relative w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#0B2242] text-white border-2 border-[#C9A227] shadow-[0_10px_35px_rgba(0,0,0,0.45)] flex items-center justify-center">
                        {isPlaying ? (
                            <div className="flex flex-col items-center justify-center gap-0.5">
                                <Headphones className="w-5 h-5 text-[#C9A227] stroke-[1.8]" />
                                <div className="flex items-center justify-center gap-0.5 h-2">
                                    <span className="w-0.75 h-2 bg-[#C9A227] rounded-full animate-[pulse_0.8s_ease-in-out_infinite]" />
                                    <span className="w-0.75 h-3 bg-[#C9A227] rounded-full animate-[pulse_0.6s_ease-in-out_infinite]" />
                                    <span className="w-0.75 h-1.5 bg-[#C9A227] rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                                </div>
                            </div>
                        ) : (
                            <Headphones className="w-6 h-6 text-[#C9A227]" />
                        )}
                    </div>
                </div>
            )}

            {/* ── 2. Floating Expanded Rectangle Configuration Card Overlay ── */}
            {isPlayerActive && isExpanded && (
                <div
                    ref={cardRef}
                    className="fixed bottom-6 right-4 sm:right-6 z-[9999] w-[calc(100vw-2rem)] sm:w-88 md:w-96 rounded-2xl bg-[#0B2242] border-2 border-[#C9A227] shadow-[0_20px_60px_rgba(0,0,0,0.65)] text-white p-4.5 transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-4"
                >
                    {/* Header: Thumbnail, Title, Subtitle, Minimize & Close (Cut) */}
                    <div className="flex items-center justify-between gap-2.5 pb-3 border-b border-white/10 mb-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0 border border-white/15 bg-[#122A4A]">
                                <Image
                                    src={getSafeImageUrl(currentArticle.thumbnail || "")}
                                    alt="Article"
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate leading-tight" title={currentArticle.title}>
                                    {currentArticle.title}
                                </p>
                                <p className="text-[10px] text-[#C9A227] truncate mt-0.5 font-semibold">
                                    {getActiveVoiceName()}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <button
                                onClick={() => setIsExpanded(false)}
                                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Minimize to floating circular button"
                            >
                                <ChevronDown size={18} />
                            </button>
                            <button
                                onClick={handleClosePlayer}
                                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                title="Close speaking and reset to beginning"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Centered Large Play / Pause Button (Dedicated Pause & Resume in place) */}
                    <div className="flex items-center justify-center py-2 mb-3">
                        <button
                            onClick={() => {
                                if (isPlayingRef.current) {
                                    // Pause in place
                                    if (audioRef.current) audioRef.current.pause();
                                    setIsPlaying(false);
                                    isPlayingRef.current = false;
                                    dispatchState(false, true);
                                } else {
                                    // Resume from current sentence
                                    setIsPlaying(true);
                                    isPlayingRef.current = true;
                                    dispatchState(true, true);
                                    playChunk(currentChunkIndexRef.current);
                                }
                            }}
                            className="w-13 h-13 rounded-full bg-[#C9A227] text-[#0B2242] hover:bg-[#d6af32] flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg cursor-pointer shrink-0"
                            title={isPlaying ? "Pause in place" : "Resume speaking"}
                        >
                            {isLoadingAudio ? (
                                <span className="w-5 h-5 border-2 border-[#0B2242] border-t-transparent rounded-full animate-spin" />
                            ) : isPlaying ? (
                                <Pause size={24} fill="currentColor" />
                            ) : (
                                <Play size={24} fill="currentColor" className="ml-0.5" />
                            )}
                        </button>
                    </div>

                    {/* Configuration Box */}
                    <div className="bg-white/5 rounded-xl p-2.5 space-y-2.5 border border-white/10">
                        {/* Narrator Voice Selection */}
                        <div>
                            <div className="flex items-center justify-between text-[11px] font-bold text-white/70 mb-1.5">
                                <span className="flex items-center gap-1.5">
                                    <Sliders size={12} className="text-[#C9A227]" />
                                    Narrator Voice (Saved in browser)
                                </span>
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                                <button
                                    onClick={() => handleVoiceChange("male")}
                                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        voiceMode === "male"
                                            ? "bg-[#C9A227] text-[#0B2242] shadow-xs"
                                            : "bg-white/10 text-white/80 hover:bg-white/15"
                                    }`}
                                >
                                    <MaleVoiceIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>Male</span>
                                </button>
                                <button
                                    onClick={() => handleVoiceChange("female")}
                                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        voiceMode === "female"
                                            ? "bg-[#C9A227] text-[#0B2242] shadow-xs"
                                            : "bg-white/10 text-white/80 hover:bg-white/15"
                                    }`}
                                >
                                    <FemaleVoiceIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>Female</span>
                                </button>
                                <button
                                    onClick={() => handleVoiceChange("both")}
                                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                        voiceMode === "both"
                                            ? "bg-[#C9A227] text-[#0B2242] shadow-xs"
                                            : "bg-white/10 text-white/80 hover:bg-white/15"
                                    }`}
                                >
                                    <DualVoiceIcon className="w-3.5 h-3.5 shrink-0" />
                                    <span>Dual</span>
                                </button>
                            </div>
                        </div>

                        {/* Speed Slider & Mute */}
                        <div className="pt-2 border-t border-white/10 space-y-1.5">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-1.5 text-[11px] font-bold text-white/70">
                                    <Gauge size={12} className="text-[#C9A227]" />
                                    <span>Playback Speed</span>
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSpeedChange(1)}
                                        className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer border ${
                                            playbackSpeed === 1
                                                ? "bg-[#C9A227] text-[#0B2242] border-[#C9A227]"
                                                : "bg-white/10 text-[#C9A227] border-white/15 hover:bg-white/20"
                                        }`}
                                        title="Click to reset to standard 1.00x speed"
                                    >
                                        {playbackSpeed.toFixed(2)}x
                                    </button>
                                    <button
                                        onClick={handleToggleMute}
                                        className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        title={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                    </button>
                                </div>
                            </div>

                            {/* Range Slider from 0.75 to 2.0 with 0.01 precision */}
                            <div className="relative flex items-center pt-0.5">
                                <input
                                    type="range"
                                    min="0.75"
                                    max="2"
                                    step="0.01"
                                    value={playbackSpeed}
                                    onChange={(e) => {
                                        const val = parseFloat(e.target.value);
                                        if (!isNaN(val)) handleSpeedChange(val);
                                    }}
                                    className="tts-speed-slider"
                                    style={{
                                        background: `linear-gradient(to right, #C9A227 ${((playbackSpeed - 0.75) / 1.25) * 100}%, rgba(255, 255, 255, 0.18) ${((playbackSpeed - 0.75) / 1.25) * 100}%)`,
                                    }}
                                    aria-label="Playback speed slider"
                                />
                            </div>

                            {/* Scale Indicators: 0.75x, 1.00x, 2.00x */}
                            <div className="flex items-center justify-between text-[9px] text-white/50 px-0.5">
                                <button
                                    type="button"
                                    onClick={() => handleSpeedChange(0.75)}
                                    className="hover:text-white transition-colors cursor-pointer"
                                    title="Set to 0.75x"
                                >
                                    0.75x
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSpeedChange(1)}
                                    className={`transition-colors cursor-pointer ${playbackSpeed === 1 ? "text-[#C9A227] font-bold" : "hover:text-[#C9A227]"}`}
                                    title="Reset to 1.00x"
                                >
                                    1.00x (Normal)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSpeedChange(2)}
                                    className="hover:text-white transition-colors cursor-pointer"
                                    title="Set to 2.00x"
                                >
                                    2.00x
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
