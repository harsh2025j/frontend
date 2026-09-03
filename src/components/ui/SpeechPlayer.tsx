"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Article, TimelineUpdate } from "@/data/features/article/article.types";

interface SpeechPlayerProps {
    article: Article;
}

interface SpeechChunk {
    text: string;
    gender: "female" | "male";
}

/**
 * Splits text into natural, safe sentence chunks (maximum ~220 characters).
 * Keeps sentences complete while preventing browser audio stream timeouts.
 */
function splitTextIntoSafeChunks(text: string, maxLength = 220): string[] {
    const cleanText = text.trim();
    if (!cleanText) return [];
    if (cleanText.length <= maxLength) return [cleanText];

    // Split on sentence terminators (. ! ?)
    const sentenceDelimiters = /([.?!]+[\s]+)/;
    const tokens = cleanText.split(sentenceDelimiters);
    const sentences: string[] = [];

    for (let i = 0; i < tokens.length; i += 2) {
        const s = (tokens[i] || "") + (tokens[i + 1] || "");
        if (s.trim()) sentences.push(s.trim());
    }

    const chunks: string[] = [];

    for (const sentence of sentences) {
        if (sentence.length <= maxLength) {
            chunks.push(sentence);
        } else {
            // Split long sentences on punctuation like comma, semicolon, colon, dash
            const clauseDelimiters = /([,;:—–-]+[\s]+)/;
            const subTokens = sentence.split(clauseDelimiters);
            let current = "";

            for (let j = 0; j < subTokens.length; j += 2) {
                const clause = (subTokens[j] || "") + (subTokens[j + 1] || "");
                if (!clause.trim()) continue;

                if ((current + " " + clause).trim().length <= maxLength) {
                    current = (current + " " + clause).trim();
                } else {
                    if (current) chunks.push(current);
                    if (clause.length > maxLength) {
                        const words = clause.split(/\s+/);
                        let wordChunk = "";
                        for (const w of words) {
                            if ((wordChunk + " " + w).trim().length <= maxLength) {
                                wordChunk = (wordChunk + " " + w).trim();
                            } else {
                                if (wordChunk) chunks.push(wordChunk);
                                wordChunk = w;
                            }
                        }
                        if (wordChunk) current = wordChunk;
                        else current = "";
                    } else {
                        current = clause;
                    }
                }
            }
            if (current) chunks.push(current);
        }
    }

    return chunks.filter((c) => c.length > 0);
}

type VoiceMode = "both" | "female" | "male";

export default function SpeechPlayer({ article }: SpeechPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [voiceMode, setVoiceMode] = useState<VoiceMode>("both");
    const [currentUtteranceIndex, setCurrentUtteranceIndex] = useState(0);

    // References
    const synth = useRef<SpeechSynthesis | null>(null);
    const textChunks = useRef<SpeechChunk[]>([]);
    const selectedFemaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const selectedMaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
    const isPlayingRef = useRef(false);
    const voiceModeRef = useRef<VoiceMode>("both");
    const currentUtteranceIndexRef = useRef(0);
    const playbackSpeedRef = useRef(1);
    const playTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // 1. Select the best voice for each gender (Female & Male co-anchors)
    const selectVoiceByGender = useCallback((
        availableVoices: SpeechSynthesisVoice[],
        targetLang: string,
        targetGender: "female" | "male"
    ): SpeechSynthesisVoice | null => {
        if (!availableVoices || availableVoices.length === 0) return null;

        const isHindi = targetLang.toLowerCase().startsWith("hi");
        const langPrefix = isHindi ? "hi" : "en";

        const langVoices = availableVoices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));
        const pool = langVoices.length > 0 ? langVoices : availableVoices;

        const femaleKeywords = ["female", "woman", "girl", "zira", "samantha", "victoria", "aria", "stefanie", "sangeeta", "veena", "hazel", "isha", "kalpana"];
        const maleKeywords = ["male", "guy", "david", "mark", "james", "andrew", "alex", "daniel", "ravi", "george", "rishi"];

        const targetKeywords = targetGender === "female" ? femaleKeywords : maleKeywords;
        const oppositeKeywords = targetGender === "female" ? maleKeywords : femaleKeywords;

        // Priority 1: Google / Natural + Target Gender
        const topTier = pool.find((v) => {
            const name = v.name.toLowerCase();
            const isGoogleOrNatural = name.includes("google") || name.includes("natural") || name.includes("online");
            const hasTarget = targetKeywords.some((k) => name.includes(k));
            const hasOpposite = oppositeKeywords.some((k) => name.includes(k));
            return isGoogleOrNatural && hasTarget && !hasOpposite;
        });
        if (topTier) return topTier;

        // Priority 2: Any voice explicitly matching target gender
        const genderTier = pool.find((v) => {
            const name = v.name.toLowerCase();
            const hasTarget = targetKeywords.some((k) => name.includes(k));
            const hasOpposite = oppositeKeywords.some((k) => name.includes(k));
            return hasTarget && !hasOpposite;
        });
        if (genderTier) return genderTier;

        // Priority 3: Google voice not explicitly tagged with opposite gender
        const naturalFallback = pool.find((v) => {
            const name = v.name.toLowerCase();
            const hasOpposite = oppositeKeywords.some((k) => name.includes(k));
            return (name.includes("google") || name.includes("natural")) && !hasOpposite;
        });
        if (naturalFallback) return naturalFallback;

        // Priority 4: Any voice not tagged with opposite gender
        const neutralVoice = pool.find((v) => {
            const name = v.name.toLowerCase();
            return !oppositeKeywords.some((k) => name.includes(k));
        });
        if (neutralVoice) return neutralVoice;

        return pool[0];
    }, []);

    // 2. Clean and chunk text into dual-voice alternating structure:
    // Title -> Female
    // Paragraph 1 (all chunks) -> Female
    // Paragraph 2 (all chunks) -> Male
    // Paragraph 3 (all chunks) -> Female
    // Paragraph 4 (all chunks) -> Male
    const prepareText = useCallback(() => {
        const finalChunks: SpeechChunk[] = [];

        const clean = (html: string) => {
            if (!html) return "";
            let text = html.replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n");
            text = text.replace(/<[^>]*>?/gm, " ");
            text = text.replace(/https?:\/\/\S+/g, "");
            text = text.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
            return text.replace(/\s+/g, " ").trim();
        };

        // Title -> Always Female
        if (article.title) {
            const titleParts = splitTextIntoSafeChunks(clean(article.title) + ".", 220);
            titleParts.forEach((p) => finalChunks.push({ text: p, gender: "female" }));
        }

        // Subheadline -> Female
        if (article.subHeadline) {
            const sub = clean(article.subHeadline);
            if (sub) {
                const subParts = splitTextIntoSafeChunks(sub + ".", 220);
                subParts.forEach((p) => finalChunks.push({ text: p, gender: "female" }));
            }
        }

        // Timeline Updates -> Alternates
        if (article.updates && article.updates.length > 0) {
            article.updates.forEach((update: TimelineUpdate, uIdx) => {
                const dateStr = new Date(update.updateDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                });
                const title = update.title ? `${clean(update.title)}.` : "";
                const content = clean(update.content);
                const fullText = `Update for ${dateStr}. ${title} ${content}`;
                const updateGender: "female" | "male" = uIdx % 2 === 0 ? "female" : "male";
                const parts = splitTextIntoSafeChunks(fullText, 220);
                parts.forEach((p) => finalChunks.push({ text: p, gender: updateGender }));
            });
        }

        // Main Content Paragraphs -> Alternate by Paragraph!
        // Paragraph 1 (index 0) -> Female
        // Paragraph 2 (index 1) -> Male
        // Paragraph 3 (index 2) -> Female
        // Paragraph 4 (index 3) -> Male
        if (article.content) {
            const paragraphs = article.content.split(/<\/p>|<br\s*\/?>/i);
            let validParagraphCount = 0;

            for (const p of paragraphs) {
                const cleanedP = clean(p);
                if (cleanedP.length > 5) {
                    const paraGender: "female" | "male" = validParagraphCount % 2 === 0 ? "female" : "male";
                    validParagraphCount++;

                    const parts = splitTextIntoSafeChunks(cleanedP, 220);
                    parts.forEach((part) => {
                        finalChunks.push({ text: part, gender: paraGender });
                    });
                }
            }
        }

        textChunks.current = finalChunks;

        // Estimate duration (~140 words per minute)
        const totalWords = finalChunks.reduce((acc, c) => acc + c.text.split(/\s+/).filter(Boolean).length, 0);
        setDuration(Math.max(10, Math.ceil((totalWords / 140) * 60)));
    }, [article]);

    // 3. Load voices and set up Female & Male anchors
    useEffect(() => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        synth.current = window.speechSynthesis;

        const updateVoices = () => {
            const avail = window.speechSynthesis.getVoices();
            if (avail && avail.length > 0) {
                const artLang = article.language || "en";
                selectedFemaleVoiceRef.current = selectVoiceByGender(avail, artLang, "female");
                selectedMaleVoiceRef.current = selectVoiceByGender(avail, artLang, "male");
            }
        };

        updateVoices();

        if (window.speechSynthesis.onvoiceschanged !== undefined) {
            window.speechSynthesis.onvoiceschanged = updateVoices;
        }

        const intervalId = setInterval(() => {
            const avail = window.speechSynthesis.getVoices();
            if (avail && avail.length > 0) {
                updateVoices();
                clearInterval(intervalId);
            }
        }, 300);

        const timeoutId = setTimeout(() => clearInterval(intervalId), 3000);

        prepareText();

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [prepareText, selectVoiceByGender, article.language]);

    // 4. Sequential chunk player with alternating Female & Male voices
    const playChunk = useCallback((index: number, shouldCancel = false) => {
        if (!synth.current) return;

        if (index < 0 || index >= textChunks.current.length) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            setCurrentUtteranceIndex(0);
            currentUtteranceIndexRef.current = 0;
            setCurrentTime(0);
            return;
        }

        if (shouldCancel) {
            synth.current.cancel();
        }

        setCurrentUtteranceIndex(index);
        currentUtteranceIndexRef.current = index;

        const chunk = textChunks.current[index];
        const utterance = new SpeechSynthesisUtterance(chunk.text);

        const artLang = article.language || "en";
        utterance.lang = artLang.startsWith("hi") ? "hi-IN" : "en-US";

        // Assign voice according to user's voiceMode selection (Both / Female / Male)
        let targetGender: "female" | "male";
        if (voiceModeRef.current === "female") {
            targetGender = "female";
        } else if (voiceModeRef.current === "male") {
            targetGender = "male";
        } else {
            // "both" (dual host): alternates by paragraph
            targetGender = chunk.gender;
        }

        const targetVoice = targetGender === "male"
            ? (selectedMaleVoiceRef.current || selectedFemaleVoiceRef.current)
            : (selectedFemaleVoiceRef.current || selectedMaleVoiceRef.current);

        if (targetVoice) {
            utterance.voice = targetVoice;
        }

        utterance.rate = playbackSpeedRef.current;
        // Pitch variation ensures clear vocal distinction between co-anchors
        utterance.pitch = targetGender === "female" ? 1.05 : 0.95;

        // Keep reference to prevent Chrome garbage collection
        activeUtteranceRef.current = utterance;
        if (typeof window !== "undefined") {
            (window as any).__activeSpeechUtterance = utterance;
        }

        let hasHandledEnd = false;

        utterance.onstart = () => {
            setIsPlaying(true);
            isPlayingRef.current = true;
        };

        utterance.onend = () => {
            if (hasHandledEnd) return;
            hasHandledEnd = true;

            if (index + 1 < textChunks.current.length) {
                if (isPlayingRef.current) {
                    playChunk(index + 1, false);
                }
            } else {
                isPlayingRef.current = false;
                setIsPlaying(false);
                setCurrentUtteranceIndex(0);
                currentUtteranceIndexRef.current = 0;
                setCurrentTime(0);
            }
        };

        utterance.onerror = (e) => {
            if (hasHandledEnd) return;

            if (e.error === "canceled" || e.error === "interrupted") {
                return;
            }

            console.warn("[SpeechPlayer] Utterance error:", e.error);
            hasHandledEnd = true;

            if (isPlayingRef.current && index + 1 < textChunks.current.length) {
                playTimeoutRef.current = setTimeout(() => {
                    if (isPlayingRef.current) {
                        playChunk(index + 1, false);
                    }
                }, 50);
            } else {
                isPlayingRef.current = false;
                setIsPlaying(false);
            }
        };

        synth.current.speak(utterance);
    }, [article.language]);

    // 5. Play / Pause logic
    const handlePlayPause = () => {
        if (!synth.current) return;

        if (isPlaying) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
            synth.current.cancel();
        } else {
            isPlayingRef.current = true;
            setIsPlaying(true);
            playChunk(currentUtteranceIndexRef.current, true);
        }
    };

    // 6. Seek bar click
    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (textChunks.current.length === 0) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const targetIndex = Math.min(
            textChunks.current.length - 1,
            Math.floor(ratio * textChunks.current.length)
        );

        currentUtteranceIndexRef.current = targetIndex;
        setCurrentUtteranceIndex(targetIndex);
        setCurrentTime(Math.floor(ratio * duration));

        if (isPlayingRef.current) {
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
            playChunk(targetIndex, true);
        }
    };

    // 7. Playback Speed Change
    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        playbackSpeedRef.current = speed;

        if (isPlayingRef.current) {
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
            playChunk(currentUtteranceIndexRef.current, true);
        }
    };

    // 8. Voice Mode Change (Both / Female / Male)
    const handleVoiceModeChange = (mode: VoiceMode) => {
        setVoiceMode(mode);
        voiceModeRef.current = mode;

        if (isPlayingRef.current) {
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
            playChunk(currentUtteranceIndexRef.current, true);
        }
    };

    // 8. Progress Timer
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isPlaying) {
            timer = setInterval(() => {
                setCurrentTime((prev) => {
                    if (prev < duration) return prev + 1;
                    return prev;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, duration]);

    // 9. Cleanup
    useEffect(() => {
        return () => {
            if (playTimeoutRef.current) clearTimeout(playTimeoutRef.current);
            if (typeof window !== "undefined" && window.speechSynthesis) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const progressPercent = textChunks.current.length > 0
        ? (currentUtteranceIndex / textChunks.current.length) * 100
        : 0;

    return (
        <div className="my-8 w-full">
            <div className="flex items-center justify-between mb-2 ml-1">
                <p className="text-sm font-semibold text-gray-500">Listen to this Article</p>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-0.5 rounded-full">
                    {voiceMode === "both" ? "Dual Host (Female & Male)" : voiceMode === "female" ? "Female Voice" : "Male Voice"}
                </span>
            </div>

            <div className="flex items-center gap-4 bg-[#F2F4F7] p-4 rounded-full shadow-sm border border-gray-100">
                {/* Play/Pause Button */}
                <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 flex items-center justify-center bg-transparent text-gray-800 hover:bg-gray-200 rounded-full transition-colors cursor-pointer"
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
                </button>

                {/* Time Display */}
                <div className="text-sm font-medium text-gray-600 min-w-[80px]">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </div>

                {/* Interactive Seek Bar */}
                <div
                    onClick={handleSeek}
                    className="flex-1 h-2 bg-gray-300 rounded-full overflow-hidden relative group cursor-pointer"
                    title="Click to seek"
                >
                    <div
                        className="absolute h-full bg-[#0A2342] transition-all duration-300 group-hover:bg-blue-700"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>

                {/* Volume Icon */}
                <div className="hidden sm:flex items-center text-gray-600">
                    <Volume2 size={20} />
                </div>

                {/* Voice Mode & Speed Selectors */}
                <div className="flex items-center gap-2 pr-2">
                    {/* Voice Mode Selector */}
                    <select
                        value={voiceMode}
                        onChange={(e) => handleVoiceModeChange(e.target.value as VoiceMode)}
                        className="bg-transparent text-xs font-semibold text-gray-700 outline-none cursor-pointer hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
                        aria-label="Select narrator voice"
                    >
                        <option value="both">Both (Dual)</option>
                        <option value="female">Female</option>
                        <option value="male">Male</option>
                    </select>

                    <div className="w-px h-4 bg-gray-300" />

                    {/* Speed Selector */}
                    <select
                        value={playbackSpeed}
                        onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                        className="bg-transparent text-xs font-bold text-gray-700 outline-none cursor-pointer hover:text-gray-900 px-1 py-1 rounded hover:bg-gray-200 transition-colors"
                        aria-label="Playback speed"
                    >
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
